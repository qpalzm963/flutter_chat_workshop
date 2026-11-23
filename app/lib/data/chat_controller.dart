import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

import '../config.dart';
import '../models/connection_status.dart';
import '../models/message.dart';

/// 聊天室的大腦：UI 只跟它說話，不直接碰 WebSocket。
class ChatController {
  ChatController({required this.me});

  /// 我的名字（也是連線身分）
  final String me;

  /// 連線狀態：連線橫幅已經接好，改它的 value 畫面就會變
  final status = ValueNotifier(ConnectionStatus.disconnected);

  final _list = <Message>[]; // 最新在前
  final _out = StreamController<List<Message>>.broadcast();
  WebSocketChannel? _channel;
  StreamSubscription<dynamic>? _sub;

  /// 訊息列表，最新在前（index 0 是最新一則）。UI 的 StreamBuilder 已經接好。
  Stream<List<Message>> get messages => _out.stream;

  Future<void> connect() async {
    status.value = ConnectionStatus.connecting;
    final channel = WebSocketChannel.connect(wsUrl(me)); // ws://host:8080/ws?user=我的名字
    _channel = channel;
    _sub = channel.stream.listen(_onData, onDone: () => status.value = ConnectionStatus.disconnected, onError: (_) {});
    try {
      await channel.ready; // 握手：HTTP Upgrade → 101 Switching Protocols
      status.value = ConnectionStatus.connected;
    } catch (_) {
      status.value = ConnectionStatus.disconnected;
    }
  }

  void _onData(dynamic data) {
    final json = jsonDecode(data as String) as Map<String, dynamic>;
    if (json['type'] != 'message') return; // 用 type 區分事件：其他種類先不處理
    _list.insert(0, Message(sender: json['sender'] as String, text: json['text'] as String, ts: json['ts'] as int));
    _out.add(List.unmodifiable(_list));
  }

  void send(String text) {
    // Server 會把訊息廣播給房間所有人（包含自己），所以這裡不用自己加進 List
    _channel?.sink.add(jsonEncode({'type': 'send', 'sender': me, 'text': text}));
  }

  void dispose() {
    _sub?.cancel();
    _channel?.sink.close();
    _out.close();
    status.dispose();
  }
}
