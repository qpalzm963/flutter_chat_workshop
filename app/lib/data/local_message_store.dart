import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';

import '../models/message.dart';
import '../models/room.dart';

/// SSOT（Single Source of Truth）：本地唯一的筆記本。
/// - UI 只訂閱 watchXxx()。
/// - WebSocket / REST 只負責「寫進來」，去重（client_msg_id 主鍵）與排序（seq）都交給 DB。
class LocalMessageStore {
  LocalMessageStore._(this._db);

  final Database _db;
  final _messageChanges = StreamController<String?>.broadcast(); // 哪個房間變了（null = 不確定）
  final _roomChanges = StreamController<void>.broadcast();
  final _readChanges = StreamController<String>.broadcast(); // 哪個房間的已讀位置變了

  /// DB 升版：每一版只寫「從上一版怎麼變過來」。新安裝依序跑完全部，舊版本只跑缺的。
  /// 已上線的版本內容永遠不改、不刪欄位，只往後加。
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
    // 第 8 堂：多房間。舊訊息先放 room_id = ''，第一次拿到房間列表時歸到原本分配的房間
    2: [
      "ALTER TABLE messages ADD COLUMN room_id TEXT NOT NULL DEFAULT ''",
      'CREATE INDEX idx_messages_room_seq ON messages(room_id, seq)',
      '''CREATE TABLE rooms(
           id TEXT PRIMARY KEY,
           name TEXT NOT NULL,
           kind TEXT NOT NULL,
           members TEXT NOT NULL,
           last_seq INTEGER NOT NULL DEFAULT 0,
           last_sender TEXT,
           last_text TEXT,
           last_ts INTEGER)''',
    ],
    // 第 9 堂：已讀水位線
    3: [
      'ALTER TABLE rooms ADD COLUMN my_read_seq INTEGER NOT NULL DEFAULT 0',
      '''CREATE TABLE reads(
           room_id TEXT NOT NULL,
           user TEXT NOT NULL,
           seq INTEGER NOT NULL,
           PRIMARY KEY(room_id, user))''',
    ],
  };

  /// 每個使用者一個 DB 檔：同一台模擬器換名字登入不會混到別人的資料
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
    // 上次 App 被殺掉時還在 sending 的，不可能再收到 ACK 了 → 標記失敗（連上後會自動補送）
    await db.update(
      'messages',
      {'status': MessageStatus.failed.name},
      where: 'status = ?',
      whereArgs: [MessageStatus.sending.name],
    );
    return LocalMessageStore._(db);
  }

  // ───────────────────────── 訊息 ─────────────────────────

  /// 本地查詢視窗：只撈最新 [limit] 則，最新在前（index 0），配合 reverse 列表。
  /// 還沒拿到 seq 的（自己剛送出的）排最前面。limit 變大或 DB 變動都會重新查詢。
  Stream<List<Message>> watchMessages(String roomId, ValueListenable<int> limit) {
    late final StreamController<List<Message>> out;
    StreamSubscription<String?>? sub;
    var generation = 0;
    Future<void> emit() async {
      final my = ++generation;
      final rows = await _db.rawQuery(
        'SELECT * FROM messages WHERE room_id = ? '
        'ORDER BY seq IS NULL DESC, seq DESC, ts DESC LIMIT ?',
        [roomId, limit.value],
      );
      if (my == generation && !out.isClosed) out.add(rows.map(Message.fromRow).toList()); // 丟掉過期的查詢結果
    }

    out = StreamController<List<Message>>(
      onListen: () {
        emit();
        sub = _messageChanges.stream.where((r) => r == null || r == roomId).listen((_) => emit());
        limit.addListener(emit);
      },
      onCancel: () {
        sub?.cancel();
        limit.removeListener(emit);
      },
    );
    return out.stream;
  }

  /// 樂觀更新：先寫一筆 sending
  Future<void> insertPending(Message m) async {
    await _db.insert('messages', m.toRow());
    _messageChanges.add(m.roomId);
  }

  /// WS 廣播、ACK、歷史分頁、斷線補洞 —— 全部走這一個入口。
  /// 同一個 client_msg_id 重複寫入只會更新，不會多一筆。
  Future<void> upsertFromServer(List<Message> messages) async {
    if (messages.isEmpty) return;
    final batch = _db.batch();
    for (final m in messages) {
      batch.rawInsert(
        '''
        INSERT INTO messages(client_msg_id, room_id, seq, sender, text, ts, status)
        VALUES(?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(client_msg_id) DO UPDATE SET
          room_id = excluded.room_id, seq = excluded.seq, ts = excluded.ts, status = excluded.status''',
        [m.clientMsgId, m.roomId, m.seq, m.sender, m.text, m.ts, MessageStatus.sent.name],
      );
    }
    await batch.commit(noResult: true);
    for (final r in messages.map((m) => m.roomId).toSet()) {
      _messageChanges.add(r);
    }
  }

  /// 收到 ACK：補上 seq 並轉為 sent。回傳更新後的訊息（給房間列表預覽用）
  Future<Message?> markSent(String clientMsgId, {required int seq, required int ts}) async {
    await _db.update(
      'messages',
      {'seq': seq, 'ts': ts, 'status': MessageStatus.sent.name},
      where: 'client_msg_id = ?',
      whereArgs: [clientMsgId],
    );
    final rows = await _db.query('messages', where: 'client_msg_id = ?', whereArgs: [clientMsgId]);
    final m = rows.isEmpty ? null : Message.fromRow(rows.single);
    _messageChanges.add(m?.roomId);
    return m;
  }

  /// 只改「還沒成功」的訊息狀態（避免逾時晚到把 sent 改回 failed）
  Future<void> updatePendingStatus(String clientMsgId, MessageStatus status) async {
    await _db.update(
      'messages',
      {'status': status.name},
      where: 'client_msg_id = ? AND status != ?',
      whereArgs: [clientMsgId, MessageStatus.sent.name],
    );
    _messageChanges.add(null);
  }

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

  Future<int> count(String roomId) async =>
      Sqflite.firstIntValue(await _db.rawQuery('SELECT COUNT(*) FROM messages WHERE room_id = ?', [roomId]))!;

  /// 本地有幾則 seq >= [seq]（含還沒拿到 seq 的）→ 決定進房時視窗要開多大
  Future<int> countFrom(String roomId, int seq) async => Sqflite.firstIntValue(
    await _db.rawQuery('SELECT COUNT(*) FROM messages WHERE room_id = ? AND (seq IS NULL OR seq >= ?)', [roomId, seq]),
  )!;

  Future<bool> hasSeq(String roomId, int seq) async =>
      (await _db.query('messages', where: 'room_id = ? AND seq = ?', whereArgs: [roomId, seq])).isNotEmpty;

  /// 本地最舊的 seq → 往上翻歷史的 cursor
  Future<int?> oldestSeq(String roomId) => _scalar('SELECT MIN(seq) FROM messages WHERE room_id = ?', [roomId]);

  /// 本地最新的 seq（null = 這個房間本地完全沒有訊息）
  Future<int?> latestSeq(String roomId) => _scalar('SELECT MAX(seq) FROM messages WHERE room_id = ?', [roomId]);

  /// 斷線補洞的 cursor：「別人的」最新 seq。
  /// 不能用 MAX(seq)：重連時補送的 ACK 可能比補洞先回來，自己的新 seq 會讓 cursor 跳過中間漏掉的訊息。
  /// 本地只有自己的訊息時，退回到最舊那則之前。
  Future<int?> syncCursor(String roomId, String me) => _scalar(
    'SELECT COALESCE('
    '(SELECT MAX(seq) FROM messages WHERE room_id = ? AND sender != ?), '
    '(SELECT MIN(seq) - 1 FROM messages WHERE room_id = ?))',
    [roomId, me, roomId],
  );

  /// 第 8 堂升版前的訊息沒有 room_id：歸到當時講師分配的房間
  Future<void> adoptLegacyMessages(String roomId) async {
    final n = await _db.update('messages', {'room_id': roomId}, where: "room_id = ''");
    if (n > 0) _messageChanges.add(roomId);
  }

  // ───────────────────────── 房間 ─────────────────────────

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

  /// GET /rooms 與 room_added：Server 說了算
  // TODO(第 9 堂) ② 房間 JSON 裡的 reads（每個人的已讀位置）也要寫進 reads 表，並通知 _readChanges
  Future<void> upsertRooms(List<Map<String, dynamic>> json) async {
    final batch = _db.batch();
    for (final j in json) {
      batch.insert('rooms', Room.fromServer(j).toRow(), conflictAlgorithm: ConflictAlgorithm.replace);
    }
    await batch.commit(noResult: true);
    _roomChanges.add(null);
  }

  /// 私聊還沒送出第一則前，Server 上還沒有這個房間：先在本地建一筆
  Future<void> ensureRoom(Room room) async {
    await _db.insert('rooms', room.toRow(), conflictAlgorithm: ConflictAlgorithm.ignore);
    _roomChanges.add(null);
  }

  /// 任何房間有新訊息 → 更新預覽（只往前，不被晚到的舊訊息蓋掉）
  Future<void> updatePreview(Message m) async {
    final n = await _db.update(
      'rooms',
      {'last_seq': m.seq, 'last_sender': m.sender, 'last_text': m.text, 'last_ts': m.ts},
      where: 'id = ? AND last_seq < ?',
      whereArgs: [m.roomId, m.seq],
    );
    if (n > 0) _roomChanges.add(null);
  }

  // ───────────────────────── 已讀（第 9 堂） ─────────────────────────

  /// 這個房間每個人讀到哪（user → seq）
  Stream<Map<String, int>> watchReads(String roomId) async* {
    Future<Map<String, int>> query() async => {
      for (final r in await _db.query('reads', where: 'room_id = ?', whereArgs: [roomId]))
        r['user'] as String: r['seq'] as int,
    };
    yield await query();
    await for (final _ in _readChanges.stream.where((r) => r == roomId)) {
      yield await query();
    }
  }

  // TODO(第 9 堂) ② setRead：Server 推來的已讀事件寫進 reads；是我自己的就同時更新 rooms.my_read_seq
  // TODO(第 9 堂) ① advanceMyRead：我的水位線只能前進

  Future<int?> _scalar(String sql, [List<Object?>? args]) async => Sqflite.firstIntValue(await _db.rawQuery(sql, args));
}
