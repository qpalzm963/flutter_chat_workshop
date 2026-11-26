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

  // TODO(第 7 堂) ① 每次連上（包含 App 剛啟動）都要補收（②）
  void _onStatusChanged() {
    if (socket.status.value == ConnectionStatus.connected) _loadLatestIfEmpty();
  }

  // TODO(第 7 堂) ② 補收：本地不是空的 → 從 cursor 用 after_seq 一頁一頁補進 DB，直到不足一頁

  /// 本地是空的（例如換新手機）→ 抓最新一頁。
  /// 本地不是空的就不能抓：最新一頁跟本地最新那則之間可能有 App 不知道的斷層（第 7 堂處理）。
  Future<void> _loadLatestIfEmpty() async {
    try {
      if (await store.latestSeq() != null) return;
      await store.upsertFromServer(await api.fetch());
    } catch (_) {
      // 拿不到就先看本地的，下次連上再試
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
