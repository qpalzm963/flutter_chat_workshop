import 'package:flutter/material.dart';

/// 輸入框 + 送出鈕。送出後自動清空。
class ChatInput extends StatefulWidget {
  const ChatInput({super.key, required this.onSend});

  final ValueChanged<String> onSend;

  @override
  State<ChatInput> createState() => _ChatInputState();
}

class _ChatInputState extends State<ChatInput> {
  final _input = TextEditingController();

  void _send() {
    final text = _input.text.trim();
    if (text.isEmpty) return;
    _input.clear();
    widget.onSend(text);
  }

  @override
  void dispose() {
    _input.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
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
    );
  }
}
