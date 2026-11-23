import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:uuid/uuid.dart';

import '../config.dart';
import '../models/connection_status.dart';
import '../models/message.dart';
import 'chat_socket.dart';
import 'local_message_store.dart';

/// 單向資料流：
///   UI ──send()──▶ DB(sending) ──▶ WS
///   WS ──寫入──▶ DB ──Stream──▶ UI
class ChatController {
  ChatController({required this.me, required this.store}) : socket = ChatSocket(wsUrl(me));

  /// 我的名字（也是連線身分）
  final String me;
  final ChatSocket socket;

  /// 本地 DB（SSOT）：UI 只看它，WS 只寫它
  final LocalMessageStore store;

  /// 連線狀態：直接用 socket 的（連線橫幅已經接好）
  ValueNotifier<ConnectionStatus> get status => socket.status;

  static const ackTimeout = Duration(seconds: 5);
  final _ackTimers = <String, Timer>{};
  final _uuid = const Uuid();
  StreamSubscription<Map<String, dynamic>>? _sub;

  /// 訊息列表，最新在前：直接訂閱 DB
  Stream<List<Message>> get messages => store.watchMessages();

  void connect() {
    _sub = socket.events.listen(_onEvent);
    socket.connect();
  }

  // ───────────── 發送：Optimistic UI + ACK + 冪等 ─────────────

  Future<void> send(String text) async {
    final msg = Message(
      clientMsgId: _uuid.v4(),
      sender: me,
      text: text,
      ts: DateTime.now().millisecondsSinceEpoch,
      status: MessageStatus.sending,
    );
    await store.insertPending(msg); // 不等 Server，先上螢幕
    _transmit(msg);
  }

  /// 重試帶「同一個」clientMsgId → Server 去重，不會讓對方看到兩則
  Future<void> retry(Message msg) async {
    await store.updatePendingStatus(msg.clientMsgId, MessageStatus.sending);
    _transmit(msg);
  }

  void _transmit(Message msg) {
    socket.send({'type': 'send', 'client_msg_id': msg.clientMsgId, 'sender': msg.sender, 'text': msg.text});
    _ackTimers[msg.clientMsgId]?.cancel();
    _ackTimers[msg.clientMsgId] = Timer(ackTimeout, () {
      _ackTimers.remove(msg.clientMsgId);
      store.updatePendingStatus(msg.clientMsgId, MessageStatus.failed);
    });
  }

  // ───────────── 接收：一律寫進 DB ─────────────

  void _onEvent(Map<String, dynamic> json) {
    switch (json['type']) {
      case 'ack':
        final id = json['client_msg_id'] as String;
        _ackTimers.remove(id)?.cancel();
        store.markSent(id, seq: json['seq'] as int, ts: json['ts'] as int);
      case 'message':
        store.upsertFromServer([Message.fromServer(json)]);
    }
  }

  void dispose() {
    for (final t in _ackTimers.values) {
      t.cancel();
    }
    _sub?.cancel();
    socket.dispose();
  }
}
