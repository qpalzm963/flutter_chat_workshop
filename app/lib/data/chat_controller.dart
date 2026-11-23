import 'package:flutter/foundation.dart';

import '../models/connection_status.dart';
import '../models/message.dart';

/// 聊天室的大腦：UI 只跟它說話，不直接碰 WebSocket。
class ChatController {
  ChatController({required this.me});

  /// 我的名字（也是連線身分）
  final String me;

  /// 連線狀態：連線橫幅已經接好，改它的 value 畫面就會變
  final status = ValueNotifier(ConnectionStatus.disconnected);

  // TODO(第 1 堂) 準備一個記憶體 List<Message>（最新在前）和一個 StreamController，List 變了就推給 UI

  /// 訊息列表，最新在前（index 0 是最新一則）。UI 的 StreamBuilder 已經接好。
  Stream<List<Message>> get messages => const Stream.empty();

  void connect() {
    // TODO(第 1 堂) ① 用 WebSocketChannel.connect(wsUrl(me)) 連上 Server（套件：web_socket_channel）
    // TODO(第 1 堂) ② listen：收到什麼就加進 List 顯示（先當純字串）
    // TODO(第 1 堂) ③ 升級 JSON 後：解析、用 type 區分事件，只處理 message
  }

  void send(String text) {
    // TODO(第 1 堂) ② 先用 sink.add(text) 送純字串
    // TODO(第 1 堂) ③ 再改成送 JSON：type / sender / text
  }

  void dispose() {
    // TODO(第 1 堂) ④ 收尾：取消訂閱、關掉連線和 StreamController
    status.dispose();
  }
}
