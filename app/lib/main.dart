import 'package:flutter/material.dart';

import 'config.dart';
import 'data/chat_service.dart';
import 'data/local_message_store.dart';
import 'ui/room_list_page.dart';

void main() {
  runApp(const ChatWorkshopApp());
}

class ChatWorkshopApp extends StatelessWidget {
  const ChatWorkshopApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Chat Workshop',
      theme: ThemeData(colorSchemeSeed: Colors.teal),
      home: presetUser.isNotEmpty ? const _Boot(user: presetUser) : const NamePage(),
    );
  }
}

/// 進聊天室前先取暱稱（用來判斷哪些訊息是「我的」；也是 WS 的身分）
class NamePage extends StatefulWidget {
  const NamePage({super.key});

  @override
  State<NamePage> createState() => _NamePageState();
}

class _NamePageState extends State<NamePage> {
  final _name = TextEditingController();

  void _enter() {
    final name = _name.text.trim();
    if (name.isEmpty) return;
    Navigator.of(context).pushReplacement(MaterialPageRoute<void>(builder: (_) => _Boot(user: name)));
  }

  @override
  void dispose() {
    _name.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Flutter 聊天室工作坊', style: Theme.of(context).textTheme.headlineSmall),
              const SizedBox(height: 24),
              TextField(
                controller: _name,
                autofocus: true,
                onSubmitted: (_) => _enter(),
                decoration: const InputDecoration(labelText: '你的暱稱', border: OutlineInputBorder()),
              ),
              const SizedBox(height: 16),
              FilledButton(onPressed: _enter, child: const Text('進入聊天室')),
            ],
          ),
        ),
      ),
    );
  }
}

/// 開 DB、建立 App 層級的唯一連線，然後進房間列表
class _Boot extends StatefulWidget {
  const _Boot({required this.user});

  final String user;

  @override
  State<_Boot> createState() => _BootState();
}

class _BootState extends State<_Boot> {
  ChatService? _service;

  @override
  void initState() {
    super.initState();
    LocalMessageStore.open(widget.user).then((store) {
      if (mounted) setState(() => _service = ChatService(me: widget.user, store: store)..start());
    });
  }

  @override
  void dispose() {
    _service?.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final service = _service;
    if (service == null) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    return RoomListPage(service: service);
  }
}
