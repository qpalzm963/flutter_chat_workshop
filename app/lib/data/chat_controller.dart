import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:uuid/uuid.dart';

import '../config.dart';
import '../models/connection_status.dart';
import '../models/message.dart';
import 'chat_socket.dart';
import 'history_api.dart';
import 'local_message_store.dart';

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

  /// 範圍表版本：重連只抓最新一頁。跟本地最新那一段接得上就自動合併；接不上就是洞，
  /// 畫面只顯示最新那一段，等使用者滑到洞的上緣才補（見 [loadOlder]）。離線再久都只打一次 API。
  Future<void> _sync() async {
    try {
      await store.upsertFromServer(await api.fetch());
    } catch (_) {
      // 拿不到就先看本地的，下次重連再抓
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

  /// 快捲到頂時由 UI 呼叫。兩段式分頁：
  /// 1. 最新那一段本地還有沒顯示的 → 擴大視窗
  /// 2. 到了這一段的下緣（洞的上緣）→ 用 before_seq 補下緣之前的一頁；補進來跟下面的區段相鄰就自動合併
  Future<void> loadOlder() async {
    if (loadingOlder.value || _noMoreHistory) return;
    loadingOlder.value = true;
    try {
      if (await store.countVisible() > limit.value) {
        limit.value += HistoryApi.pageSize;
        return;
      }
      final floor = await store.visibleFloor();
      if (floor == null || floor <= 1) {
        _noMoreHistory = true; // seq 從 1 開始連續：最新那一段已經從 1 開始
        return;
      }
      final page = await api.fetch(beforeSeq: floor);
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
