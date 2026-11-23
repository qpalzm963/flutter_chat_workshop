import 'dart:async';

import 'package:flutter/material.dart';

import '../config.dart';
import '../data/chat_controller.dart';
import '../data/chat_socket.dart';
import '../data/history_api.dart';
import '../data/local_message_store.dart';
import '../models/message.dart';
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
  final _input = TextEditingController();
  final _scroll = ScrollController();

  String? _newestId;
  bool _hasUnseen = false;

  /// reverse: true 時 offset 0 就是「最底部」
  bool get _isAtBottom => !_scroll.hasClients || _scroll.offset < 60;

  @override
  void initState() {
    super.initState();
    _chat = ChatController(
      me: widget.me,
      store: widget.store,
      socket: ChatSocket(wsUrl),
      api: HistoryApi(),
    )..start();
    _messages = _chat.messages;
    _scroll.addListener(_onScroll);
  }

  void _onScroll() {
    // reverse 列表的「頂部」是 maxScrollExtent：快到頂就拉舊訊息
    if (_scroll.position.pixels > _scroll.position.maxScrollExtent - 300) {
      _chat.loadOlder();
    }
    if (_hasUnseen && _isAtBottom) setState(() => _hasUnseen = false);
  }

  /// 新訊息進來時：在底部就自然出現；正在往上翻就只亮「有新訊息」不拉回去
  void _onNewList(List<Message> list) {
    final newest = list.isEmpty ? null : list.first;
    if (newest == null || newest.clientMsgId == _newestId) return;
    final isFirstLoad = _newestId == null;
    _newestId = newest.clientMsgId;
    if (isFirstLoad || newest.sender == widget.me || _isAtBottom) return;
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) setState(() => _hasUnseen = true);
    });
  }

  void _scrollToBottom() {
    if (!_scroll.hasClients) return;
    _scroll.animateTo(0, duration: const Duration(milliseconds: 250), curve: Curves.easeOut);
    setState(() => _hasUnseen = false);
  }

  void _send() {
    final text = _input.text.trim();
    if (text.isEmpty) return;
    _input.clear();
    unawaited(_chat.send(text));
    _scrollToBottom();
  }

  @override
  void dispose() {
    _chat.dispose();
    _input.dispose();
    _scroll.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text('聊天室（${widget.me}）')),
      body: Column(
        children: [
          _ConnectionBanner(status: _chat.socket.status),
          Expanded(
            child: Stack(
              children: [
                StreamBuilder<List<Message>>(
                  stream: _messages,
                  builder: (context, snap) {
                    final list = snap.data ?? const <Message>[];
                    _onNewList(list);
                    return ListView.builder(
                      controller: _scroll,
                      reverse: true, // Bottom-anchored：index 0 = 最新 = 最底
                      itemCount: list.length,
                      itemBuilder: (context, i) {
                        final m = list[i];
                        return MessageBubble(
                          key: ValueKey(m.clientMsgId),
                          message: m,
                          isMine: m.sender == widget.me,
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
          SafeArea(
            top: false,
            child: Padding(
              padding: const EdgeInsets.fromLTRB(12, 4, 4, 4),
              child: Row(
                children: [
                  Expanded(
                    child: TextField(
                      controller: _input,
                      textInputAction: TextInputAction.send,
                      onSubmitted: (_) => _send(),
                      decoration: const InputDecoration(
                        hintText: '輸入訊息（試試 /delay /fail /drop /zombie）',
                        border: OutlineInputBorder(),
                        isDense: true,
                      ),
                    ),
                  ),
                  IconButton(icon: const Icon(Icons.send), onPressed: _send),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _ConnectionBanner extends StatelessWidget {
  const _ConnectionBanner({required this.status});

  final ValueNotifier<ConnectionStatus> status;

  @override
  Widget build(BuildContext context) {
    return ValueListenableBuilder(
      valueListenable: status,
      builder: (context, s, _) {
        if (s == ConnectionStatus.connected) return const SizedBox.shrink();
        final (text, color) = switch (s) {
          ConnectionStatus.connecting => ('連線中…', Colors.orange),
          _ => ('已斷線，自動重連中…', Colors.red),
        };
        return Container(
          width: double.infinity,
          color: color,
          padding: const EdgeInsets.symmetric(vertical: 4),
          child: Text(text, textAlign: TextAlign.center, style: const TextStyle(color: Colors.white)),
        );
      },
    );
  }
}
