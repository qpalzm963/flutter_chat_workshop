import 'package:flutter/material.dart';

import '../data/chat_controller.dart';
import '../models/message.dart';
import 'chat_input.dart';
import 'connection_banner.dart';
import 'message_bubble.dart';

class ChatPage extends StatefulWidget {
  const ChatPage({super.key, required this.me});

  final String me;

  @override
  State<ChatPage> createState() => _ChatPageState();
}

class _ChatPageState extends State<ChatPage> {
  late final ChatController _chat;
  late final Stream<List<Message>> _messages;
  final _scroll = ScrollController();

  @override
  void initState() {
    super.initState();
    _chat = ChatController(me: widget.me)..connect();
    _messages = _chat.messages;
  }

  /// 一般列表：最新的在最下面，所以每次有新資料就跳到底
  void _jumpToBottom() {
    if (_scroll.hasClients) _scroll.jumpTo(_scroll.position.maxScrollExtent);
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
            child: StreamBuilder<List<Message>>(
              stream: _messages,
              builder: (context, snap) {
                // Controller 給的是「最新在前」，一般 ListView 從上往下畫，所以要反過來
                final list = (snap.data ?? const <Message>[]).reversed.toList();
                WidgetsBinding.instance.addPostFrameCallback((_) => _jumpToBottom());
                return ListView.builder(
                  controller: _scroll,
                  itemCount: list.length,
                  itemBuilder: (context, i) {
                    final m = list[i];
                    return MessageBubble(sender: m.sender, text: m.text, ts: m.ts, isMine: m.sender == widget.me);
                  },
                );
              },
            ),
          ),
          ChatInput(onSend: _chat.send),
        ],
      ),
    );
  }
}
