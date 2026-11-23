import 'dart:async';
import 'dart:math';

import 'package:flutter/foundation.dart';
import 'package:uuid/uuid.dart';

import '../models/message.dart';
import 'chat_service.dart';
import 'chat_socket.dart';
import 'history_api.dart';

/// 一個房間一個。單向資料流：
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

  /// 進房時的第一則未讀（本地有這則才定位；null = 不用定位）
  int? firstUnreadSeq;

  /// 第一則未讀不在本地（新裝置）：停在底部，提示上方還有幾則未讀
  int unreadAbove = 0;

  late final Stream<List<Message>> messages = service.store.watchMessages(roomId, limit);
  late final Stream<Map<String, int>> reads = service.store.watchReads(roomId);

  final _uuid = const Uuid();
  StreamSubscription<Map<String, dynamic>>? _sub;
  Timer? _readDebounce;
  int _visibleMaxSeq = 0;

  String get me => service.me;
  bool get _connected => service.socket.status.value == ConnectionStatus.connected;

  /// 進房：開始收這個房間的訊息 → 補資料（有網路才補）→ 決定畫面從哪開始
  Future<void> open() async {
    _sub = service.socket.events
        .where((e) => e['type'] == 'message' && e['room_id'] == roomId)
        .listen((e) => service.store.upsertFromServer([Message.fromServer(e)]));
    service.socket.status.addListener(_onStatusChanged);

    final myRead = (await service.store.room(roomId))?.myReadSeq ?? 0;
    if (_connected) {
      try {
        await _sync().timeout(const Duration(seconds: 4));
      } catch (_) {
        // 補不到就先看本地的
      }
    }
    final roomLast = (await service.store.room(roomId))?.lastSeq ?? 0;
    final lastSeq = max(roomLast, await service.store.latestSeq(roomId) ?? 0);
    if (lastSeq <= myRead) return;
    final first = myRead + 1;
    if (await service.store.hasSeq(roomId, first)) {
      firstUnreadSeq = first;
      limit.value = max(HistoryApi.pageSize, await service.store.countFrom(roomId, first) + 20);
    } else {
      unreadAbove = lastSeq - myRead;
    }
  }

  void _onStatusChanged() {
    if (!_connected) return;
    _sync().catchError((Object _) {}); // 補洞失敗不影響聊天，下次重連再補
    if (_visibleMaxSeq > 0) service.reportRead(roomId, _visibleMaxSeq); // 斷線時沒報出去的已讀
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

  // ───────────── 發送 ─────────────

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

  // ───────────── 已讀：畫面上真的看到才算，Debounce 500ms 回報 ─────────────

  void onVisibleMaxSeq(int seq) {
    if (seq <= _visibleMaxSeq) return; // 只往前推
    _visibleMaxSeq = seq;
    _readDebounce?.cancel();
    _readDebounce = Timer(const Duration(milliseconds: 500), () => service.reportRead(roomId, _visibleMaxSeq));
  }

  void dispose() {
    _readDebounce?.cancel();
    if (_visibleMaxSeq > 0) service.reportRead(roomId, _visibleMaxSeq); // 離開前把最後看到的報出去
    _sub?.cancel();
    service.socket.status.removeListener(_onStatusChanged);
    limit.dispose();
    loadingOlder.dispose();
  }
}
