import 'package:flutter/material.dart';

import '../data/chat_controller.dart';
import '../data/local_message_store.dart';
import '../models/message.dart';
import 'chat_input.dart';
import 'connection_banner.dart';
import 'message_bubble.dart';

class ChatPage extends StatefulWidget {
  const ChatPage({super.key, required this.me, required this.store});

  final String me;
  final LocalMessageStore store;

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  late final ChatController _chat;
  late final Stream<List<Message>> _messages;
  final _scroll = ScrollController();

  Message? _newest;
  bool _hasUnseen = false;

  /// reverse: true 時 offset 0 就是「最底部」
  bool get _isAtBottom => !_scroll.hasClients || _scroll.offset < 60;

  @override
  void initState() {
    super.initState();
    _chat = ChatController(me: widget.me, store: widget.store)..connect();
    _messages = _chat.messages;
    _scroll.addListener(_onScroll);
  }

  // TODO(第 6 堂) ③ 快捲到頂（reverse 列表的頂部是 maxScrollExtent）時呼叫 _chat.loadOlder()
  // TODO(第 6 堂) 在列表最上面放 LoadingOlderIndicator（ui/loading_older_indicator.dart）
  void _onScroll() {
    if (_hasUnseen && _isAtBottom) setState(() => _hasUnseen = false);
  }

  /// 新訊息進來時：在底部就自然出現；正在往上翻就只亮「有新訊息」，不把人拉走
  void _onNewList(List<Message> list) {
    final newest = list.isEmpty ? null : list.first;
    if (newest == null || newest.clientMsgId == _newest?.clientMsgId) return;
    final isFirstLoad = _newest == null;
    _newest = newest;
    if (isFirstLoad || newest.sender == widget.me || _isAtBottom) return;
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
      appBar: AppBar(title: Text('聊天室（${widget.me}）')),
      body: Column(
        children: [
          ConnectionBanner(status: _chat.status),
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
                      itemCount: list.length,
                      itemBuilder: (context, i) {
                        final m = list[i];
                        final isMine = m.sender == widget.me;
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
