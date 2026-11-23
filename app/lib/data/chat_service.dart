import 'dart:async';

import '../config.dart';
import '../models/message.dart';
import 'chat_socket.dart';
import 'history_api.dart';
import 'local_message_store.dart';

/// App 層級（全 App 一條 WS）：
/// - 發送 / ACK / 逾時 / 補送（outbox）：ACK 只看 client_msg_id，跟哪個房間、房間有沒有開著無關
/// - 房間列表：連上就重拉 GET /rooms；room_added 新增；任何房間的新訊息更新預覽
/// 訊息本身由開著的那個房間的 ChatController 寫進 DB（沒開的房間只更新預覽，點進去再補洞）。
class ChatService {
  ChatService({required this.me, required this.store, HistoryApi? api})
    : api = api ?? HistoryApi(),
      socket = ChatSocket(wsUrl(me));

  final String me;
  final LocalMessageStore store;
  final HistoryApi api;
  final ChatSocket socket;

  static const ackTimeout = Duration(seconds: 5);
  final _ackTimers = <String, Timer>{};
  StreamSubscription<Map<String, dynamic>>? _sub;

  void start() {
    _sub = socket.events.listen(_onEvent);
    socket.status.addListener(_onStatusChanged);
    socket.connect();
  }

  // ───────────── 發送：Optimistic UI + ACK + 冪等 ─────────────

  Future<void> send(Message msg) async {
    await store.insertPending(msg); // 不等 Server，先上螢幕
    _transmit(msg);
  }

  /// 重試帶「同一個」clientMsgId → Server 去重，不會洗版
  Future<void> retry(Message msg) async {
    await store.updatePendingStatus(msg.clientMsgId, MessageStatus.sending);
    _transmit(msg);
  }

  void _transmit(Message msg) {
    socket.send({'type': 'send', 'client_msg_id': msg.clientMsgId, 'room_id': msg.roomId, 'text': msg.text});
    _ackTimers[msg.clientMsgId]?.cancel();
    _ackTimers[msg.clientMsgId] = Timer(ackTimeout, () {
      _ackTimers.remove(msg.clientMsgId);
      store.updatePendingStatus(msg.clientMsgId, MessageStatus.failed);
    });
  }

  // ───────────── 每次連上（含 App 剛啟動）：重拉房間列表 + 補送 ─────────────

  Future<void> _onStatusChanged() async {
    if (socket.status.value != ConnectionStatus.connected) return;
    // 先拉完房間再補送：從第 7 堂升上來的舊訊息 room_id 還是 ''，要等 adoptLegacyMessages 歸位，
    // 不然補送會帶 room_id: ''，被 Server 回「房間不存在」
    await _syncRooms();
    await _flushOutbox();
  }

  Future<void> _syncRooms() async {
    try {
      final json = await api.fetchRooms(me);
      await store.upsertRooms((json['rooms'] as List).cast<Map<String, dynamic>>());
      final assigned = json['assigned_room_id'] as String?;
      if (assigned != null) await store.adoptLegacyMessages(assigned);
    } catch (_) {
      // 拉不到列表不影響聊天，下次連上再拉
    }
  }

  /// Outbox：sending 與 failed 都補送，依建立時間、帶原本的 clientMsgId（冪等，不怕重複）
  Future<void> _flushOutbox() async {
    for (final m in await store.unsent()) {
      await retry(m);
    }
  }

  // ───────────── 接收 ─────────────

  Future<void> _onEvent(Map<String, dynamic> e) async {
    switch (e['type']) {
      case 'ack':
        final id = e['client_msg_id'] as String;
        _ackTimers.remove(id)?.cancel();
        final m = await store.markSent(id, seq: e['seq'] as int, ts: e['ts'] as int);
        if (m != null) await store.updatePreview(m);
      case 'message':
        await store.updatePreview(Message.fromServer(e));
      case 'room_added':
        await store.upsertRooms([e['room'] as Map<String, dynamic>]);
    }
  }

  void dispose() {
    for (final t in _ackTimers.values) {
      t.cancel();
    }
    _sub?.cancel();
    socket.status.removeListener(_onStatusChanged);
    socket.dispose();
  }
}
