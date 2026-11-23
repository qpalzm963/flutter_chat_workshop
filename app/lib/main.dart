import 'package:flutter/material.dart';

import 'config.dart';
import 'data/local_message_store.dart';
import 'ui/chat_page.dart';

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
      home: const NamePage(),
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
  final _name = TextEditingController(text: presetUser);

  @override
  void initState() {
    super.initState();
    // 帶了 --dart-define=USER 就直接進聊天頁；按返回會回到這頁，聊天頁的 dispose() 才會被呼叫
    if (presetUser.isNotEmpty) WidgetsBinding.instance.addPostFrameCallback((_) => _enter());
  }

  void _enter() {
    final name = _name.text.trim();
    if (name.isEmpty) return;
    // 用 push 而不是 pushReplacement：聊天頁要能返回，才驗得到離開時有沒有收乾淨
    Navigator.of(context).push(MaterialPageRoute<void>(builder: (_) => _Boot(user: name)));
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

// TODO(第 8 堂) ② 開好 DB 之後建立 App 層級的 ChatService（..start()），改進房間列表 RoomListPage

/// 先開好本地 DB，再進聊天頁
class _Boot extends StatefulWidget {
  const _Boot({required this.user});

  final String user;

  @override
  State<_Boot> createState() => _BootState();
}

class _BootState extends State<_Boot> {
  LocalMessageStore? _store;

  @override
  void initState() {
    super.initState();
    LocalMessageStore.open(widget.user).then((store) {
      if (mounted) setState(() => _store = store);
    });
  }

  @override
  Widget build(BuildContext context) {
    final store = _store;
    if (store == null) return const Scaffold(body: Center(child: CircularProgressIndicator()));
    return ChatPage(me: widget.user, store: store);
  }
}
