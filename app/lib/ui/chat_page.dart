import 'dart:async';

import 'package:flutter/material.dart';

import '../data/chat_controller.dart';
import '../data/chat_service.dart';
import '../models/message.dart';
import '../models/room.dart';
import 'chat_input.dart';
import 'connection_banner.dart';
import 'loading_older_indicator.dart';
import 'message_bubble.dart';
import 'seq_tracker.dart';
import 'unread_divider.dart';

class ChatPage extends StatefulWidget {
  const ChatPage({super.key, required this.service, required this.room});

  final ChatService service;
  final Room room;

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  late final ChatController _chat;
  late final Future<void> _ready;
  final _scroll = ScrollController();
  final _viewportKey = GlobalKey();
  final _centerKey = UniqueKey();

  /// 畫面上掛著的氣泡（seq → context），用來算「真的看得到」的最大 seq
  final _mounted = <int, BuildContext>{};

  /// 定位模式：分隔線停在畫面上方，未讀往下長。捲到底就收合成一般列表
  bool _anchored = false;
  bool _hasUnseen = false;
  bool _showUnreadAbove = false;
  bool _atBottomCache = true;
  String? _newestKey;

  String get _me => widget.service.me;

  /// reverse 列表：offset 0（或定位模式下的 minScrollExtent）就是「最底部」
  bool get _isAtBottom => !_scroll.hasClients || _scroll.position.pixels <= _scroll.position.minScrollExtent + 60;

  @override
  void initState() {
    super.initState();
    _chat = ChatController(service: widget.service, roomId: widget.room.id);
    _ready = _chat.open().then((_) {
      if (!mounted) return;
      setState(() {
        _anchored = _chat.firstUnreadSeq != null;
        _showUnreadAbove = _chat.unreadAbove > 0;
      });
    });
    _scroll.addListener(_onScroll);
  }

  void _onScroll() {
    final pos = _scroll.position;
    if (pos.pixels > pos.maxScrollExtent - 300) _chat.loadOlder(); // reverse 列表的「頂部」是 maxScrollExtent
    final atBottom = _isAtBottom;
    if (atBottom != _atBottomCache || (atBottom && (_hasUnseen || _anchored))) {
      setState(() {
        _atBottomCache = atBottom;
        if (atBottom) {
          _hasUnseen = false;
          _anchored = false;
        }
      });
    }
    if (_showUnreadAbove && pos.pixels > 200) setState(() => _showUnreadAbove = false);
    _checkVisible();
  }

  /// 新訊息進來時：在底部就自然出現；正在往上翻就只亮「有新訊息」不拉回去
  void _onNewList(List<Message> list) {
    final newest = list.isEmpty ? null : list.first;
    // key 帶上 seq：自己剛送出的那則 ACK 回來時 clientMsgId 沒變、seq 從 null 變成有值，
    // 這時氣泡才被 SeqTracker 登記，要再算一次看得到的最大 seq，不然離開後會被算成未讀 1
    final key = newest == null ? null : '${newest.clientMsgId}#${newest.seq}';
    if (newest == null || key == _newestKey) return;
    final isFirstLoad = _newestKey == null;
    _newestKey = key;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      _checkVisible();
      if (isFirstLoad && _anchored && _isAtBottom) setState(() => _anchored = false); // 未讀一頁就放得下：直接一般模式
      if (isFirstLoad || newest.sender == _me || _isAtBottom) return;
      setState(() => _hasUnseen = true);
    });
  }

  void _checkVisible() {
    final viewport = _viewportKey.currentContext?.findRenderObject() as RenderBox?;
    if (viewport == null || !viewport.attached) return;
    final top = viewport.localToGlobal(Offset.zero).dy;
    final bottom = top + viewport.size.height;
    var maxSeq = 0;
    _mounted.forEach((seq, ctx) {
      final box = ctx.findRenderObject() as RenderBox?;
      if (box == null || !box.attached || !box.hasSize) return;
      final y = box.localToGlobal(box.size.center(Offset.zero)).dy;
      if (y >= top && y <= bottom && seq > maxSeq) maxSeq = seq;
    });
    if (maxSeq > 0) _chat.onVisibleMaxSeq(maxSeq);
  }

  void _scrollToBottom() {
    setState(() {
      _hasUnseen = false;
      _anchored = false;
    });
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scroll.hasClients) {
        _scroll.animateTo(0, duration: const Duration(milliseconds: 250), curve: Curves.easeOut);
      }
    });
  }

  void _send(String text) {
    unawaited(_chat.send(text));
    _scrollToBottom();
  }

  @override
  void dispose() {
    _chat.dispose();
    _scroll.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(widget.room.titleFor(_me))),
      body: Column(
        children: [
          ConnectionBanner(status: widget.service.socket.status),
          Expanded(
            child: FutureBuilder<void>(
              future: _ready,
              builder: (context, snap) => snap.connectionState != ConnectionState.done
                  ? const Center(child: CircularProgressIndicator())
                  : _buildMessages(),
            ),
          ),
          ChatInput(onSend: _send),
        ],
      ),
    );
  }

  Widget _buildMessages() {
    return StreamBuilder<Map<String, int>>(
      stream: _chat.reads,
      builder: (context, readsSnap) => StreamBuilder<List<Message>>(
        stream: _chat.messages,
        builder: (context, snap) {
          final list = snap.data ?? const <Message>[];
          _onNewList(list);
          final reads = readsSnap.data ?? const <String, int>{};
          final divider = _chat.firstUnreadSeq;
          bool isUnread(Message m) => divider != null && (m.seq == null || m.seq! >= divider);
          final unread = list.where(isUnread).toList(); // 最新在前
          final read = list.where((m) => !isUnread(m)).toList();

          // 定位模式：center 之前的 sliver 往下長（未讀，由舊到新），center 往上長（分隔線 + 已讀）
          // 一般模式：全部在 center，由新到舊往上長；分隔線夾在中間
          final below = _anchored ? unread.reversed.toList() : const <Message>[];
          final above = <Object>[
            if (!_anchored) ...unread,
            if (divider != null && unread.isNotEmpty) const UnreadDivider(),
            ...read,
          ];

          return Stack(
            children: [
              CustomScrollView(
                key: _viewportKey,
                controller: _scroll,
                reverse: true, // Bottom-anchored：offset 0 = 最底
                center: _centerKey,
                anchor: _anchored ? 0.75 : 0.0, // 定位模式：分隔線在畫面上方 1/4 處
                slivers: [
                  SliverList.builder(itemCount: below.length, itemBuilder: (context, i) => _bubble(below[i], reads)),
                  SliverList.builder(
                    key: _centerKey,
                    itemCount: above.length,
                    itemBuilder: (context, i) {
                      final item = above[i];
                      return item is Message ? _bubble(item, reads) : item as Widget;
                    },
                  ),
                  SliverToBoxAdapter(child: LoadingOlderIndicator(loading: _chat.loadingOlder)),
                ],
              ),
              if (_showUnreadAbove)
                Positioned(
                  top: 8,
                  left: 0,
                  right: 0,
                  child: Center(
                    child: ActionChip(
                      avatar: const Icon(Icons.arrow_upward, size: 16),
                      label: Text('上方還有 ${_chat.unreadAbove} 則未讀'),
                      onPressed: () => setState(() => _showUnreadAbove = false),
                    ),
                  ),
                ),
              if (_hasUnseen || _anchored)
                Positioned(
                  bottom: 12,
                  left: 0,
                  right: 0,
                  child: Center(
                    child: ActionChip(
                      avatar: const Icon(Icons.arrow_downward, size: 16),
                      label: Text(_hasUnseen ? '有新訊息' : '跳到最新'),
                      onPressed: _scrollToBottom,
                    ),
                  ),
                ),
            ],
          );
        },
      ),
    );
  }

  Widget _bubble(Message m, Map<String, int> reads) {
    final isMine = m.sender == _me;
    String? readLabel;
    if (isMine && m.seq != null) {
      final n = reads.entries.where((e) => e.key != _me && e.value >= m.seq!).length;
      if (n > 0) readLabel = widget.room.kind == 'dm' ? '已讀' : '已讀 $n'; // 一對一 vs 群組
    }
    final bubble = MessageBubble(
      key: ValueKey(m.clientMsgId),
      sender: m.sender,
      text: m.text,
      ts: m.ts,
      seq: m.seq,
      isMine: isMine,
      status: isMine ? m.status : null,
      readLabel: readLabel,
      onRetry: () => _chat.retry(m),
    );
    return m.seq == null ? bubble : SeqTracker(seq: m.seq!, registry: _mounted, child: bubble);
  }
}
