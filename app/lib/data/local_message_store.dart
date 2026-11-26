import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';

import '../models/message.dart';
import '../models/room.dart';

/// SSOT（Single Source of Truth）：本地唯一的筆記本。
/// - UI 只訂閱 [watchMessages]。
/// - WebSocket 只負責「寫進來」，去重（client_msg_id 主鍵）與排序（seq）都交給 DB。
class LocalMessageStore {
  LocalMessageStore._(this._db);

  final Database _db;
  final _changes = StreamController<void>.broadcast();
  final _roomChanges = StreamController<void>.broadcast();

  /// DB 升版：每一版只寫「從上一版怎麼變過來」。新安裝依序跑完全部，舊版本只跑缺的。
  /// 已經上線的版本內容永遠不改、不刪欄位，只往後加。
  static final _migrations = <int, List<String>>{
    // 第 5 堂：單一房間
    1: [
      '''CREATE TABLE messages(
           client_msg_id TEXT PRIMARY KEY,
           seq INTEGER,
           sender TEXT NOT NULL,
           text TEXT NOT NULL,
           ts INTEGER NOT NULL,
           status TEXT NOT NULL)''',
      'CREATE INDEX idx_messages_seq ON messages(seq)',
    ],
    // TODO(第 8 堂) ① 加上第 2 版：messages 加 room_id（＋索引）、新增 rooms 表（欄位見 Room.toRow）。
    //   舊訊息還不知道屬於哪個房間：先給一個預設值，等第一次拿到房間列表再歸到 assigned_room_id。
    //   加了 2 之後版本號自動變成 2，已經是第 1 版的 DB 會跑 onUpgrade。
  };

  /// 每個名字一個 DB 檔：同一台模擬器換名字登入不會混到別人的資料
  static Future<LocalMessageStore> open(String user) async {
    Future<void> migrate(Database db, int from, int to) async {
      for (var v = from + 1; v <= to; v++) {
        for (final sql in _migrations[v]!) {
          await db.execute(sql);
        }
      }
    }

    final db = await openDatabase(
      join(await getDatabasesPath(), 'chat_$user.db'),
      version: _migrations.length,
      onCreate: (db, version) => migrate(db, 0, version),
      onUpgrade: migrate, // 在同一個 transaction 裡：任何一步失敗就整個回滾，下次開啟再試
    );
    // 上次 App 被殺掉時還在 sending 的，不可能再收到 ACK 了 → 改成 failed
    await db.update(
      'messages',
      {'status': MessageStatus.failed.name},
      where: 'status = ?',
      whereArgs: [MessageStatus.sending.name],
    );
    return LocalMessageStore._(db);
  }

  // TODO(第 8 堂) ③ 下面的查詢、分頁、補洞都要加上房間條件（room_id）

  /// 本地查詢視窗：只撈最新 [limit] 則，最新在前（index 0），配合 reverse 列表。
  /// 還沒拿到 seq 的（自己剛送出的）排最前面。limit 變大或 DB 變動都會重新查詢。
  Stream<List<Message>> watchMessages(ValueListenable<int> limit) {
    late final StreamController<List<Message>> out;
    StreamSubscription<void>? sub;
    var generation = 0;
    Future<void> emit() async {
      final my = ++generation;
      final rows = await _db.rawQuery('SELECT * FROM messages ORDER BY seq IS NULL DESC, seq DESC, ts DESC LIMIT ?', [
        limit.value,
      ]);
      if (my == generation && !out.isClosed) out.add(rows.map(Message.fromRow).toList()); // 丟掉過期的查詢結果
    }

    out = StreamController<List<Message>>(
      onListen: () {
        emit();
        sub = _changes.stream.listen((_) => emit());
        limit.addListener(emit);
      },
      onCancel: () {
        sub?.cancel();
        limit.removeListener(emit);
      },
    );
    return out.stream;
  }

  Future<int> count() async => Sqflite.firstIntValue(await _db.rawQuery('SELECT COUNT(*) FROM messages'))!;

  /// 本地最舊的 seq → 往上翻歷史的 cursor
  Future<int?> oldestSeq() async => Sqflite.firstIntValue(await _db.rawQuery('SELECT MIN(seq) FROM messages'));

  /// Outbox：所有還沒送達的（sending + failed），依建立時間排序
  Future<List<Message>> unsent() async {
    final rows = await _db.query(
      'messages',
      where: 'status != ?',
      whereArgs: [MessageStatus.sent.name],
      orderBy: 'ts ASC',
    );
    return rows.map(Message.fromRow).toList();
  }

  /// 斷線補洞的 cursor：「別人的」最新 seq。
  /// 不能用 MAX(seq)：重連時補送的 ACK 可能比補洞先回來，自己的新 seq 會讓 cursor 跳過中間漏掉的訊息。
  /// 本地只有自己的訊息時，退回到最舊那則之前。
  Future<int?> syncCursor(String me) async => Sqflite.firstIntValue(
    await _db.rawQuery(
      'SELECT COALESCE('
      '(SELECT MAX(seq) FROM messages WHERE sender != ?), '
      '(SELECT MIN(seq) - 1 FROM messages))',
      [me],
    ),
  );

  /// 本地最新的 seq（null = 本地還沒有任何 Server 的訊息）
  Future<int?> latestSeq() async => Sqflite.firstIntValue(await _db.rawQuery('SELECT MAX(seq) FROM messages'));

  /// 樂觀更新：先寫一筆 sending
  Future<void> insertPending(Message m) async {
    await _db.insert('messages', m.toRow());
    _changes.add(null);
  }

  /// WS 廣播 —— 之後的歷史分頁、斷線補洞也都走這個入口。
  /// 同一個 client_msg_id 重複寫入只會更新，不會多一筆。
  Future<void> upsertFromServer(List<Message> messages) async {
    if (messages.isEmpty) return;
    final batch = _db.batch();
    for (final m in messages) {
      batch.rawInsert(
        '''
        INSERT INTO messages(client_msg_id, seq, sender, text, ts, status)
        VALUES(?, ?, ?, ?, ?, ?)
        ON CONFLICT(client_msg_id) DO UPDATE SET
          seq = excluded.seq, ts = excluded.ts, status = excluded.status''',
        [m.clientMsgId, m.seq, m.sender, m.text, m.ts, MessageStatus.sent.name],
      );
    }
    await batch.commit(noResult: true);
    _changes.add(null);
  }

  /// 收到 ACK：補上 seq 並轉為 sent
  Future<void> markSent(String clientMsgId, {required int seq, required int ts}) async {
    await _db.update(
      'messages',
      {'seq': seq, 'ts': ts, 'status': MessageStatus.sent.name},
      where: 'client_msg_id = ?',
      whereArgs: [clientMsgId],
    );
    _changes.add(null);
  }

  /// 改「還沒成功」的訊息狀態（逾時 → failed、重試 → sending）；已經 sent 的不能被改回去
  Future<void> updatePendingStatus(String clientMsgId, MessageStatus status) async {
    await _db.update(
      'messages',
      {'status': status.name},
      where: 'client_msg_id = ? AND status != ?',
      whereArgs: [clientMsgId, MessageStatus.sent.name],
    );
    _changes.add(null);
  }

  // ───────────────────────── 房間（第 8 堂） ─────────────────────────

  /// 依最後一則訊息時間排序（有新訊息就置頂）
  Stream<List<Room>> watchRooms() async* {
    Future<List<Room>> query() async =>
        (await _db.query('rooms', orderBy: 'last_ts IS NULL, last_ts DESC')).map(Room.fromRow).toList();
    yield await query();
    await for (final _ in _roomChanges.stream) {
      yield await query();
    }
  }

  Future<Room?> room(String id) async {
    final rows = await _db.query('rooms', where: 'id = ?', whereArgs: [id]);
    return rows.isEmpty ? null : Room.fromRow(rows.single);
  }

  /// 私聊還沒送出第一則前，Server 上還沒有這個房間：先在本地建一筆
  Future<void> ensureRoom(Room room) async {
    await _db.insert('rooms', room.toRow(), conflictAlgorithm: ConflictAlgorithm.ignore);
    _roomChanges.add(null);
  }
}
