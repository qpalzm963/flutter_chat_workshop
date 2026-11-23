import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:uuid/uuid.dart';

import '../models/message.dart';
import 'chat_service.dart';
import 'chat_socket.dart';
import 'history_api.dart';

// TODO(第 9 堂) ① 畫面上看得到的最大 seq → Debounce 500ms 回報已讀（只往前推）
// TODO(第 9 堂) ④ 進房時決定畫面從哪開始：第一則未讀在本地 → 定位；不在本地（新裝置）→ 停在底部並提示上方還有幾則未讀

/// 一個房間一個，從 App 層級那條唯一的連線過濾出自己房間的訊息。單向資料流：
///   UI ──send()──▶ DB(sending) ──▶ WS
///   WS / REST ──寫入──▶ DB ──Stream──▶ UI
class ChatController {
  ChatController({required this.service, required this.roomId});

  final ChatService service;
  final String roomId;

  /// 本地查詢視窗大小（兩段式分頁的第一段：先擴大它，本地不夠才打 API）
  final limit = ValueNotifier(HistoryApi.pageSize);
  final loadingOlder = ValueNotifier(false);
  bool _noMoreHistory = false;

  late final Stream<List<Message>> messages = service.store.watchMessages(roomId, limit);

  final _uuid = const Uuid();
  StreamSubscription<Map<String, dynamic>>? _sub;

  String get me => service.me;
  bool get _connected => service.socket.status.value == ConnectionStatus.connected;

  /// 進房：開始收這個房間的訊息，有網路就補資料
  void open() {
    _sub = service.socket.events
        .where((e) => e['type'] == 'message' && e['room_id'] == roomId)
        .listen((e) => service.store.upsertFromServer([Message.fromServer(e)]));
    service.socket.status.addListener(_onStatusChanged);
    _onStatusChanged();
  }

  /// 只對「開著的房間」補洞；其他房間點進來時再補
  void _onStatusChanged() {
    if (!_connected) return;
    _sync().catchError((Object _) {}); // 補洞失敗不影響聊天，下次重連再補
  }

  /// 本地是空的 → 抓最新一頁（第 6 堂）；不是空的 → 從 cursor 往後一頁頁補到底（第 7 堂）。
  /// DB 不空時不能抓最新一頁：中間會出現 App 不知道的斷層。
  Future<void> _sync() async {
    final store = service.store;
    if (await store.latestSeq(roomId) == null) {
      await store.upsertFromServer(await service.api.fetchMessages(roomId));
      return;
    }
    var cursor = await store.syncCursor(roomId, me) ?? 0;
    while (true) {
      final page = await service.api.fetchMessages(roomId, afterSeq: cursor, limit: 100);
      await store.upsertFromServer(page);
      if (page.length < 100) break;
      cursor = page.last.seq!;
    }
  }

  // ───────────── 發送（ACK、逾時、補送都在 App 層級的 ChatService） ─────────────

  Future<void> send(String text) => service.send(
    Message(
      clientMsgId: _uuid.v4(),
      roomId: roomId,
      sender: me,
      text: text,
      ts: DateTime.now().millisecondsSinceEpoch,
      status: MessageStatus.sending,
    ),
  );

  Future<void> retry(Message msg) => service.retry(msg);

  // ───────────── 兩段式分頁：先擴大本地視窗，本地不夠才以最舊 seq 打 before_seq ─────────────

  Future<void> loadOlder() async {
    if (loadingOlder.value || _noMoreHistory) return;
    loadingOlder.value = true;
    try {
      final store = service.store;
      if (await store.count(roomId) > limit.value) {
        limit.value += HistoryApi.pageSize; // 第一段：本地還有，免打 API
        return;
      }
      final oldest = await store.oldestSeq(roomId);
      if (oldest == null || oldest <= 1) {
        _noMoreHistory = true; // seq 從 1 開始連續：最舊就是 1
        return;
      }
      final page = await service.api.fetchMessages(roomId, beforeSeq: oldest);
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
    _sub?.cancel();
    service.socket.status.removeListener(_onStatusChanged);
    limit.dispose();
    loadingOlder.dispose();
  }
}
