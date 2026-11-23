import 'dart:async';
import 'dart:convert';
import 'dart:math';

import 'package:flutter/foundation.dart';
import 'package:web_socket_channel/web_socket_channel.dart';

enum ConnectionStatus { connecting, connected, disconnected }

/// WebSocket 通道：一通不掛斷的電話。
/// 負責：連線、心跳偵測假死、Exponential Backoff + Jitter 重連。
/// 不懂業務邏輯，只把 Server 事件（ack / message）往外丟。
class ChatSocket {
  ChatSocket(this.url);

  final Uri url;
  final status = ValueNotifier(ConnectionStatus.disconnected);
  final _events = StreamController<Map<String, dynamic>>.broadcast();
  Stream<Map<String, dynamic>> get events => _events.stream;

  static const pingInterval = Duration(seconds: 10);
  static const pongTimeout = Duration(seconds: 5);
  static const maxBackoff = Duration(seconds: 30);

  WebSocketChannel? _channel;
  StreamSubscription<dynamic>? _sub;
  Timer? _pingTimer;
  Timer? _pongTimer;
  Timer? _reconnectTimer;
  int _attempt = 0;
  bool _disposed = false;
  final _random = Random();

  Future<void> connect() async {
    if (_disposed) return;
    status.value = ConnectionStatus.connecting;
    final channel = WebSocketChannel.connect(url);
    try {
      await channel.ready; // 握手：HTTP Upgrade → 101 Switching Protocols
    } catch (_) {
      _scheduleReconnect();
      return;
    }
    if (_disposed) {
      channel.sink.close();
      return;
    }
    _channel = channel;
    _attempt = 0;
    _sub = channel.stream.listen(_onData, onDone: _onClosed, onError: (_) => _onClosed());
    _startHeartbeat();
    status.value = ConnectionStatus.connected;
  }

  /// 回傳 false 代表目前沒連線（呼叫端靠 ACK 逾時處理失敗）
  bool send(Map<String, dynamic> json) {
    final channel = _channel;
    if (channel == null) return false;
    channel.sink.add(jsonEncode(json));
    return true;
  }

  void _onData(dynamic data) {
    final json = jsonDecode(data as String) as Map<String, dynamic>;
    if (json['type'] == 'pong') {
      _pongTimer?.cancel();
      _pongTimer = null;
      return;
    }
    _events.add(json);
  }

  // ── Heartbeat：太久沒聲音就問一句「喂？」，等不到回應就主動掛斷 ──
  void _startHeartbeat() {
    _pingTimer = Timer.periodic(pingInterval, (_) {
      send({'type': 'ping'});
      _pongTimer ??= Timer(pongTimeout, () {
        debugPrint('[ws] pong timeout → zombie connection, reconnect');
        _onClosed();
      });
    });
  }

  void _onClosed() {
    if (_channel == null) return; // 已處理過
    _teardown();
    status.value = ConnectionStatus.disconnected;
    _scheduleReconnect();
  }

  // ── Exponential Backoff + Jitter：1s → 2s → 4s → … 上限 30s，再加隨機毫秒 ──
  void _scheduleReconnect() {
    if (_disposed) return;
    status.value = ConnectionStatus.disconnected;
    final base = Duration(seconds: min(pow(2, _attempt).toInt(), maxBackoff.inSeconds));
    final delay = base + Duration(milliseconds: _random.nextInt(1000));
    _attempt++;
    debugPrint('[ws] reconnect #$_attempt in ${delay.inMilliseconds}ms');
    _reconnectTimer = Timer(delay, connect);
  }

  void _teardown() {
    _pingTimer?.cancel();
    _pongTimer?.cancel();
    _pongTimer = null;
    _sub?.cancel();
    _channel?.sink.close();
    _channel = null;
  }

  void dispose() {
    _disposed = true;
    _reconnectTimer?.cancel();
    _teardown();
    _events.close();
    status.dispose();
  }
}
