import 'dart:async';

import 'package:uuid/uuid.dart';

import '../models/message.dart';
import 'chat_socket.dart';
import 'history_api.dart';
import 'local_message_store.dart';

/// 單向資料流：
///   UI ──send()──▶ DB(sending) ──▶ WS
///   WS / REST ──寫入──▶ DB ──Stream──▶ UI
class ChatController {
  ChatController({required this.me, required this.store, required this.socket, required this.api});

  final String me;
  final LocalMessageStore store;
  final ChatSocket socket;
  final HistoryApi api;

  static const ackTimeout = Duration(seconds: 5);
  final _ackTimers = <String, Timer>{};
  final _uuid = const Uuid();
  StreamSubscription<Map<String, dynamic>>? _eventSub;
  bool _loadingOlder = false;
  bool _noMoreHistory = false;

  Stream<List<Message>> get messages => store.watchMessages();

  void start() {
    _eventSub = socket.events.listen(_onEvent);
    socket.status.addListener(_onStatusChanged);
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

  /// 重試帶「同一個」clientMsgId → Server 去重，不會洗版
  Future<void> retry(Message msg) async {
    await store.updatePendingStatus(msg.clientMsgId, MessageStatus.sending);
    _transmit(msg);
  }

  void _transmit(Message msg) {
    socket.send({
      'type': 'send',
      'client_msg_id': msg.clientMsgId,
      'sender': msg.sender,
      'text': msg.text,
    });
    _ackTimers[msg.clientMsgId]?.cancel();
    _ackTimers[msg.clientMsgId] = Timer(ackTimeout, () {
      _ackTimers.remove(msg.clientMsgId);
      store.updatePendingStatus(msg.clientMsgId, MessageStatus.failed);
    });
  }

  // ───────────── 接收：一律寫進 DB ─────────────

  void _onEvent(Map<String, dynamic> event) {
    switch (event['type']) {
      case 'ack':
        final id = event['client_msg_id'] as String;
        _ackTimers.remove(id)?.cancel();
        store.markSent(id, seq: event['seq'] as int, ts: event['ts'] as int);
      case 'message':
        store.upsertFromServer([Message.fromServer(event)]);
    }
  }

  // ───────────── 斷線補洞：重連成功就用 after_seq 把漏掉的補回來 ─────────────

  void _onStatusChanged() {
    if (socket.status.value == ConnectionStatus.connected) _deltaSync();
  }

  Future<void> _deltaSync() async {
    try {
      final last = await store.latestSeq();
      if (last == null) {
        // 第一次進來，本地是空的：先拿最新一頁
        await store.upsertFromServer(await api.fetch());
        return;
      }
      var cursor = last;
      while (true) {
        final page = await api.fetch(afterSeq: cursor, limit: 100);
        await store.upsertFromServer(page);
        if (page.length < 100) break;
        cursor = page.last.seq!;
      }
    } catch (_) {
      // 補洞失敗不影響聊天，下次重連再補
    }
  }

  // ───────────── 歷史分頁：Cursor-based（before_seq） ─────────────

  Future<void> loadOlder() async {
    if (_loadingOlder || _noMoreHistory) return;
    _loadingOlder = true;
    try {
      final oldest = await store.oldestSeq();
      if (oldest == null) return;
      final page = await api.fetch(beforeSeq: oldest);
      if (page.isEmpty) _noMoreHistory = true;
      await store.upsertFromServer(page);
    } catch (_) {
      // 網路失敗：下次滑到頂再試
    } finally {
      _loadingOlder = false;
    }
  }

  void dispose() {
    for (final t in _ackTimers.values) {
      t.cancel();
    }
    _eventSub?.cancel();
    socket.status.removeListener(_onStatusChanged);
    socket.dispose();
  }
}
