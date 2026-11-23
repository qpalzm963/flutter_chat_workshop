import 'dart:async';
import 'dart:convert';

import 'package:flutter/foundation.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

import '../models/connection_status.dart';

/// WebSocket 通道：一通不掛斷的電話。
/// 負責：連線、心跳偵測假死、斷線自動重連。不懂業務邏輯，只把 Server 事件往外丟。
class ChatSocket {
  ChatSocket(this.url);

  final Uri url;

  /// 連線狀態（連線橫幅已經接好）
  final status = ValueNotifier(ConnectionStatus.disconnected);
  final _events = StreamController<Map<String, dynamic>>.broadcast();
  Stream<Map<String, dynamic>> get events => _events.stream;

  WebSocketChannel? _channel;
  StreamSubscription<dynamic>? _sub;

  // TODO(第 2 堂) 心跳：每 10 秒送 {"type":"ping"}，5 秒內沒收到 pong 就當作假死、主動斷線
  // TODO(第 2 堂) 重連：1s → 2s → 4s …，上限 30s，再加隨機毫秒（Jitter）

  Future<void> connect() async {
    final channel = WebSocketChannel.connect(url);
    try {
      await channel.ready; // 握手：HTTP Upgrade → 101 Switching Protocols
    } catch (_) {
      // TODO(第 2 堂) 連不上：排程重連
      return;
    }
    _channel = channel;
    _sub = channel.stream.listen(_onData, onDone: _onClosed, onError: (_) => _onClosed());
    // TODO(第 2 堂) 連上了：重置重試次數、開始心跳、更新 status
  }

  /// 回傳 false 代表目前沒連線
  bool send(Map<String, dynamic> json) {
    final channel = _channel;
    if (channel == null) return false;
    channel.sink.add(jsonEncode(json));
    return true;
  }

  void _onData(dynamic data) {
    final json = jsonDecode(data as String) as Map<String, dynamic>;
    // TODO(第 2 堂) 收到 pong：取消逾時計時器（pong 不用往外丟）
    _events.add(json);
  }

  void _onClosed() {
    _sub?.cancel();
    _channel = null;
    // TODO(第 2 堂) 停掉心跳、更新 status、排程重連
  }

  void dispose() {
    // TODO(第 2 堂) 清掉所有 Timer，而且 dispose 之後不能再重連
    _sub?.cancel();
    _channel?.sink.close();
    _events.close();
    status.dispose();
  }
}
