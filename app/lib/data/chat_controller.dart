import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:uuid/uuid.dart';

import '../config.dart';
import '../models/connection_status.dart';
import '../models/message.dart';
import 'chat_socket.dart';
import 'history_api.dart';
import 'local_message_store.dart';

// TODO(第 8 堂) ② 連線移到 App 層級的 ChatService：ChatController 改成每個房間一個（吃 service + roomId），
//                只處理自己房間的 message（依 room_id 過濾）；送出時帶 room_id
// TODO(第 8 堂) 重連時只對「開著的房間」補洞，其他房間點進去再補

/// 單向資料流：
///   UI ──send()──▶ DB(sending) ──▶ WS
///   WS ──寫入──▶ DB ──Stream──▶ UI
class ChatController {
  ChatController({required this.me, required this.store}) : socket = ChatSocket(wsUrl(me)), api = HistoryApi(me);

  /// 我的名字（也是連線身分）
  final String me;
  final ChatSocket socket;

  /// 本地 DB（SSOT）：UI 只看它，WS 只寫它
  final LocalMessageStore store;
  final HistoryApi api;

  /// 連線狀態：直接用 socket 的（連線橫幅已經接好）
  ValueNotifier<ConnectionStatus> get status => socket.status;

  static const ackTimeout = Duration(seconds: 5);
  final _ackTimers = <String, Timer>{};
  final _uuid = const Uuid();
  StreamSubscription<Map<String, dynamic>>? _sub;

  /// 本地查詢視窗大小（兩段式分頁的第一段：先擴大它，本地不夠才打 API）
  final limit = ValueNotifier(HistoryApi.pageSize);
  final loadingOlder = ValueNotifier(false);
  bool _noMoreHistory = false;

  /// 訊息列表，最新在前：只看本地最新的 [limit] 則
  late final Stream<List<Message>> messages = store.watchMessages(limit);

  void connect() {
    _sub = socket.events.listen(_onEvent);
    socket.status.addListener(_onStatusChanged);
    socket.connect();
  }

  /// 每次連上（包含 App 剛啟動）：補收 + 補送
  void _onStatusChanged() {
    if (socket.status.value != ConnectionStatus.connected) return;
    _sync();
    _flushOutbox();
  }

  /// 本地是空的 → 抓最新一頁（第 6 堂）；不是空的 → 從 cursor 往後一頁頁補到底（Delta Sync）。
  /// DB 不空時不能抓最新一頁：中間會出現 App 不知道的斷層。
  Future<void> _sync() async {
    try {
      if (await store.latestSeq() == null) {
        await store.upsertFromServer(await api.fetch());
        return;
      }
      var cursor = await store.syncCursor(me) ?? 0;
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

  /// Outbox：sending 與 failed 都補送，依建立時間、帶原本的 clientMsgId（冪等，不怕重複）
  Future<void> _flushOutbox() async {
    for (final m in await store.unsent()) {
      await retry(m);
    }
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

  /// 快捲到頂時由 UI 呼叫。兩段式分頁：先擴大本地視窗，本地不夠才以最舊 seq 打 before_seq
  Future<void> loadOlder() async {
    if (loadingOlder.value || _noMoreHistory) return;
    loadingOlder.value = true;
    try {
      if (await store.count() > limit.value) {
        limit.value += HistoryApi.pageSize; // 第一段：本地還有，免打 API
        return;
      }
      final oldest = await store.oldestSeq();
      if (oldest == null || oldest <= 1) {
        _noMoreHistory = true; // seq 從 1 開始連續：最舊就是 1
        return;
      }
      final page = await api.fetch(beforeSeq: oldest);
      if (page.length < HistoryApi.pageSize) _noMoreHistory = true;
      await store.upsertFromServer(page);
      limit.value += page.length;
    } catch (_) {
      // 網路失敗：下次滑到頂再試
    } finally {
      loadingOlder.value = false;
    }
  }

  void dispose() {
    for (final t in _ackTimers.values) {
      t.cancel();
    }
    _sub?.cancel();
    socket.status.removeListener(_onStatusChanged);
    socket.dispose();
    limit.dispose();
    loadingOlder.dispose();
  }
}
