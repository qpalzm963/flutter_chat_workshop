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

  /// 訊息列表，最新在前（index 0 是最新一則）。UI 的 StreamBuilder 已經接好。
  Stream<List<Message>> get messages => const Stream.empty();

  void connect() {}

  void send(String text) {}

  void dispose() {
    status.dispose();
  }
}
