import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:uuid/uuid.dart';

import '../config.dart';
import '../models/connection_status.dart';
import '../models/message.dart';
import 'chat_socket.dart';
import 'local_message_store.dart';

/// 聊天室的大腦：UI 只跟它說話。連線細節交給 [ChatSocket]。
class ChatController {
  ChatController({required this.me, required this.store}) : socket = ChatSocket(wsUrl(me));

  /// 我的名字（也是連線身分）
  final String me;
  final ChatSocket socket;

  /// 本地 DB（SSOT）。
  // TODO(第 5 堂) ① 把下面的記憶體 _list 換成 store：送出寫 sending、ACK 更新、廣播 upsert
  // TODO(第 5 堂) ④ messages 改成訂閱 store.watchMessages()（UI 不用改）
  final LocalMessageStore store;

  /// 連線狀態：直接用 socket 的（連線橫幅已經接好）
  ValueNotifier<ConnectionStatus> get status => socket.status;

  static const ackTimeout = Duration(seconds: 5);

  final _list = <Message>[]; // 最新在前
  final _out = StreamController<List<Message>>.broadcast();
  final _ackTimers = <String, Timer>{};
  final _uuid = const Uuid();
  StreamSubscription<Map<String, dynamic>>? _sub;

  /// 訊息列表，最新在前（index 0 是最新一則）
  Stream<List<Message>> get messages => _out.stream;

  void connect() {
    _sub = socket.events.listen(_onEvent);
    socket.connect();
  }

  // ───────────── 發送：Optimistic UI + ACK + 冪等 ─────────────

  void send(String text) {
    final msg = Message(
      clientMsgId: _uuid.v4(),
      sender: me,
      text: text,
      ts: DateTime.now().millisecondsSinceEpoch,
      status: MessageStatus.sending,
    );
    _list.insert(0, msg); // 不等 Server，先上螢幕
    _emit();
    _transmit(msg);
  }

  /// 重試帶「同一個」clientMsgId → Server 去重，不會讓對方看到兩則
  void retry(Message msg) {
    _update(msg.clientMsgId, (m) => m.copyWith(status: MessageStatus.sending));
    _transmit(msg);
  }

  void _transmit(Message msg) {
    socket.send({'type': 'send', 'client_msg_id': msg.clientMsgId, 'sender': msg.sender, 'text': msg.text});
    _ackTimers[msg.clientMsgId]?.cancel();
    _ackTimers[msg.clientMsgId] = Timer(ackTimeout, () {
      _ackTimers.remove(msg.clientMsgId);
      // 逾時晚到不能把已經 sent 的改回 failed
      _update(msg.clientMsgId, (m) => m.status == MessageStatus.sent ? m : m.copyWith(status: MessageStatus.failed));
    });
  }

  // ───────────── 接收 ─────────────

  void _onEvent(Map<String, dynamic> json) {
    switch (json['type']) {
      case 'ack':
        final id = json['client_msg_id'] as String;
        _ackTimers.remove(id)?.cancel();
        _update(id, (m) => m.copyWith(status: MessageStatus.sent, seq: json['seq'] as int, ts: json['ts'] as int));
      case 'message':
        final msg = Message.fromServer(json);
        if (_list.any((m) => m.clientMsgId == msg.clientMsgId)) return;
        _list.insert(0, msg);
        _emit();
    }
  }

  /// O(n) 找到那一筆並替換（延伸：訊息很多時改用 Map 索引）
  void _update(String clientMsgId, Message Function(Message) change) {
    final i = _list.indexWhere((m) => m.clientMsgId == clientMsgId);
    if (i < 0) return;
    _list[i] = change(_list[i]);
    _emit();
  }

  /// 排序只信 Server 的 seq；還沒拿到 seq 的（自己剛送出的）排最前面
  void _emit() {
    _list.sort((a, b) {
      if (a.seq == null && b.seq == null) return b.ts.compareTo(a.ts);
      if (a.seq == null || b.seq == null) return a.seq == null ? -1 : 1;
      return b.seq!.compareTo(a.seq!);
    });
    _out.add(List.unmodifiable(_list));
  }

  void dispose() {
    for (final t in _ackTimers.values) {
      t.cancel();
    }
    _sub?.cancel();
    socket.dispose();
    _out.close();
  }
}
