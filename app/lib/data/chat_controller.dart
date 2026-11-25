import 'dart:async';

import 'package:flutter/foundation.dart';

import '../config.dart';
import '../models/connection_status.dart';
import '../models/message.dart';
import 'chat_socket.dart';

/// 聊天室的大腦：UI 只跟它說話。連線細節交給 [ChatSocket]。
class ChatController {
  ChatController({required this.me}) : socket = ChatSocket(wsUrl(me));

  /// 我的名字（也是連線身分）
  final String me;
  final ChatSocket socket;

  /// 連線狀態：直接用 socket 的（連線橫幅已經接好）
  ValueNotifier<ConnectionStatus> get status => socket.status;

  final _list = <Message>[]; // 最新在前
  final _out = StreamController<List<Message>>.broadcast();
  StreamSubscription<Map<String, dynamic>>? _sub;

  /// 訊息列表，最新在前（index 0 是最新一則）
  Stream<List<Message>> get messages => _out.stream;

  void connect() {
    _sub = socket.events.listen(_onEvent);
    socket.connect();
  }

  void _onEvent(Map<String, dynamic> json) {
    // TODO(第 4 堂) ③ 收到 ack：用 client_msg_id 找到那一筆 → 改成 sent、填上 seq
    if (json['type'] != 'message') return;
    _list.insert(0, Message(sender: json['sender'] as String, text: json['text'] as String, ts: json['ts'] as int));
    _out.add(List.unmodifiable(_list));
  }

  // TODO(第 4 堂) ② 樂觀更新：先插入一筆 sending 上螢幕，再送出 JSON（帶 client_msg_id，套件：uuid）
  // TODO(第 4 堂) 列表排序以 seq 為準（還沒拿到 seq 的排最前面）
  void send(String text) => socket.send({'type': 'send', 'sender': me, 'text': text});

  /// 點紅點重試
  void retry(Message msg) {}

  void dispose() {
    _sub?.cancel();
    socket.dispose();
    _out.close();
  }
}
