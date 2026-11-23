import 'package:flutter/material.dart';

import 'data/local_message_store.dart';
import 'ui/chat_page.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  final store = await LocalMessageStore.open();
  runApp(ChatWorkshopApp(store: store));
}

class ChatWorkshopApp extends StatelessWidget {
  const ChatWorkshopApp({super.key, required this.store});

  final LocalMessageStore store;

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Chat Workshop',
      theme: ThemeData(colorSchemeSeed: Colors.teal),
      home: NamePage(store: store),
    );
  }
}

/// 進聊天室前先取暱稱（用來判斷哪些訊息是「我的」）
class NamePage extends StatefulWidget {
  const NamePage({super.key, required this.store});

  final LocalMessageStore store;

  @override
  State<NamePage> createState() => _NamePageState();
}

class _NamePageState extends State<NamePage> {
  final _name = TextEditingController();

  void _enter() {
    final name = _name.text.trim();
    if (name.isEmpty) return;
    Navigator.of(context).pushReplacement(
      MaterialPageRoute<void>(builder: (_) => ChatPage(me: name, store: widget.store)),
    );
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
