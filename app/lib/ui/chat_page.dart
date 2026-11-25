import 'package:flutter/material.dart';

import '../data/chat_controller.dart';
import '../data/chat_service.dart';
import '../models/message.dart';
import '../models/room.dart';
import 'chat_input.dart';
import 'connection_banner.dart';
import 'loading_older_indicator.dart';
import 'message_bubble.dart';

class ChatPage extends StatefulWidget {
  const ChatPage({super.key, required this.service, required this.room});

  final ChatService service;
  final Room room;

  @override
  State<ChatPage> createState() => _ChatPageState();
}

// TODO(第 9 堂) ① 用 SeqTracker（ui/seq_tracker.dart）包住氣泡，捲動時算出畫面上看得到的最大 seq
// TODO(第 9 堂) ② 自己的訊息顯示已讀狀態：MessageBubble.readLabel
class _ChatPageState extends State<ChatPage> {
  late final ChatController _chat;
  late final Stream<List<Message>> _messages;
  final _scroll = ScrollController();

  Message? _newest;
  bool _hasUnseen = false;

  String get _me => widget.service.me;

  /// reverse: true 時 offset 0 就是「最底部」
  bool get _isAtBottom => !_scroll.hasClients || _scroll.offset < 60;

  @override
  void initState() {
    super.initState();
    _chat = ChatController(service: widget.service, roomId: widget.room.id)..open();
    _messages = _chat.messages;
    _scroll.addListener(_onScroll);
  }

  void _onScroll() {
    // reverse 列表的「頂部」是 maxScrollExtent：快到頂就拉舊訊息
    if (_scroll.position.pixels > _scroll.position.maxScrollExtent - 300) _chat.loadOlder();
    if (_hasUnseen && _isAtBottom) setState(() => _hasUnseen = false);
  }

  /// 新訊息進來時：在底部就自然出現；正在往上翻就只亮「有新訊息」，不把人拉走
  void _onNewList(List<Message> list) {
    final newest = list.isEmpty ? null : list.first;
    if (newest == null || newest.clientMsgId == _newest?.clientMsgId) return;
    final isFirstLoad = _newest == null;
    _newest = newest;
    if (isFirstLoad || newest.sender == _me || _isAtBottom) return;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) setState(() => _hasUnseen = true);
    });
  }

  void _scrollToBottom() {
    if (_scroll.hasClients) {
      _scroll.animateTo(0, duration: const Duration(milliseconds: 250), curve: Curves.easeOut);
    }
    setState(() => _hasUnseen = false);
  }

  void _send(String text) {
    _chat.send(text);
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
            child: Stack(
              children: [
                StreamBuilder<List<Message>>(
                  stream: _messages,
                  builder: (context, snap) {
                    final list = snap.data ?? const <Message>[]; // 最新在前，直接畫
                    _onNewList(list);
                    return ListView.builder(
                      controller: _scroll,
                      reverse: true, // Bottom-anchored：index 0 = 最新 = 最底
                      itemCount: list.length + 1, // 最後一個（最上面）是載入中轉圈
                      itemBuilder: (context, i) {
                        if (i == list.length) return LoadingOlderIndicator(loading: _chat.loadingOlder);
                        final m = list[i];
                        final isMine = m.sender == _me;
                        return MessageBubble(
                          key: ValueKey(m.clientMsgId),
                          sender: m.sender,
                          text: m.text,
                          ts: m.ts,
                          seq: m.seq,
                          isMine: isMine,
                          status: isMine ? m.status : null,
                          onRetry: () => _chat.retry(m),
                        );
                      },
                    );
                  },
                ),
                if (_hasUnseen)
                  Positioned(
                    bottom: 12,
                    left: 0,
                    right: 0,
                    child: Center(
                      child: ActionChip(
                        avatar: const Icon(Icons.arrow_downward, size: 16),
                        label: const Text('有新訊息'),
                        onPressed: _scrollToBottom,
                      ),
                    ),
                  ),
              ],
            ),
          ),
          ChatInput(onSend: _send),
        ],
      ),
    );
  }
}
