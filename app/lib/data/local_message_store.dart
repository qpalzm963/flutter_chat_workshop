import 'dart:async';

import 'package:flutter/foundation.dart';
import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';

import '../models/message.dart';

/// SSOT（Single Source of Truth）：本地唯一的筆記本。
/// - UI 只訂閱 [watchMessages]。
/// - WebSocket / REST 只負責「寫進來」，去重（client_msg_id 主鍵）與排序（seq）都交給 DB。
///
/// 課後挑戰：範圍表（loaded_ranges）記錄本地「連續擁有」的 seq 區段。
/// 每次寫入 Server 的訊息都在同一個 transaction 裡合併區段；畫面只顯示最新那一段，
/// 最新那一段的下緣就是「洞的上緣」，滑到那裡才補。
class LocalMessageStore {
  LocalMessageStore._(this._db);

  final Database _db;
  final _changes = StreamController<void>.broadcast();

  /// 畫面顯示範圍的下限：最新那一段的起點（沒有任何區段時顯示全部）
  static const _floorSql = 'COALESCE((SELECT start_seq FROM loaded_ranges ORDER BY end_seq DESC LIMIT 1), 0)';

  /// 每個名字一個 DB 檔：同一台模擬器換名字登入不會混到別人的資料
  static Future<LocalMessageStore> open(String user) async {
    final db = await openDatabase(
      join(await getDatabasesPath(), 'chat_$user.db'),
      version: 1,
      onCreate: (db, _) async {
        await db.execute('''
          CREATE TABLE messages(
            client_msg_id TEXT PRIMARY KEY,
            seq INTEGER,
            sender TEXT NOT NULL,
            text TEXT NOT NULL,
            ts INTEGER NOT NULL,
            status TEXT NOT NULL)''');
        await db.execute('CREATE INDEX idx_messages_seq ON messages(seq)');
      },
    );
    // 挑戰分支不佔用 DB 版本號（第 8 堂的第 2 版是 rooms），所以用 IF NOT EXISTS 建表
    await db.execute('CREATE TABLE IF NOT EXISTS loaded_ranges(start_seq INTEGER NOT NULL, end_seq INTEGER NOT NULL)');
    // 從第 7 堂的 DB 升上來時範圍表是空的：本地 seq 連續的每一串就是一個已知區段（gaps and islands）
    if (Sqflite.firstIntValue(await db.rawQuery('SELECT COUNT(*) FROM loaded_ranges')) == 0) {
      await db.execute('''
        INSERT INTO loaded_ranges(start_seq, end_seq)
        SELECT MIN(seq), MAX(seq) FROM (
          SELECT seq, seq - ROW_NUMBER() OVER (ORDER BY seq) AS grp FROM messages WHERE seq IS NOT NULL
        ) GROUP BY grp''');
    }
    // 上次 App 被殺掉時還在 sending 的，不可能再收到 ACK 了 → 改成 failed
    await db.update(
      'messages',
      {'status': MessageStatus.failed.name},
      where: 'status = ?',
      whereArgs: [MessageStatus.sending.name],
    );
    return LocalMessageStore._(db);
  }

  /// 本地查詢視窗：只撈「最新那一段」裡最新的 [limit] 則，最新在前（index 0），配合 reverse 列表。
  /// 還沒拿到 seq 的（自己剛送出的）排最前面。limit 變大或 DB 變動都會重新查詢。
  Stream<List<Message>> watchMessages(ValueListenable<int> limit) {
    late final StreamController<List<Message>> out;
    StreamSubscription<void>? sub;
    var generation = 0;
    Future<void> emit() async {
      final my = ++generation;
      final rows = await _db.rawQuery(
        'SELECT * FROM messages WHERE seq IS NULL OR seq >= $_floorSql '
        'ORDER BY seq IS NULL DESC, seq DESC, ts DESC LIMIT ?',
        [limit.value],
      );
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

  /// 「最新那一段」本地有幾則（兩段式分頁的第一段用）
  Future<int> countVisible() async => Sqflite.firstIntValue(
    await _db.rawQuery('SELECT COUNT(*) FROM messages WHERE seq IS NULL OR seq >= $_floorSql'),
  )!;

  /// 最新那一段的起點 = 洞的上緣（null = 還沒有任何區段）
  Future<int?> visibleFloor() async =>
      Sqflite.firstIntValue(await _db.rawQuery('SELECT start_seq FROM loaded_ranges ORDER BY end_seq DESC LIMIT 1'));

  /// 目前的範圍表（由新到舊），除錯與驗收用
  Future<List<(int, int)>> ranges() async => [
    for (final r in await _db.query('loaded_ranges', orderBy: 'end_seq DESC'))
      (r['start_seq'] as int, r['end_seq'] as int),
  ];

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

  /// 本地最新的 seq（null = 本地還沒有任何 Server 的訊息）
  Future<int?> latestSeq() async => Sqflite.firstIntValue(await _db.rawQuery('SELECT MAX(seq) FROM messages'));

  /// 樂觀更新：先寫一筆 sending
  Future<void> insertPending(Message m) async {
    await _db.insert('messages', m.toRow());
    _changes.add(null);
  }

  /// WS 廣播、歷史分頁、重連抓的最新一頁 —— 全部走這一個入口。
  /// 同一個 client_msg_id 重複寫入只會更新，不會多一筆；同時把這些 seq 併進範圍表。
  Future<void> upsertFromServer(List<Message> messages) async {
    if (messages.isEmpty) return;
    await _db.transaction((txn) async {
      final batch = txn.batch();
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
      await _mergeRanges(txn, messages.map((m) => m.seq!));
    });
    _changes.add(null);
  }

  /// 收到 ACK：補上 seq 並轉為 sent；這個 seq 也算本地擁有
  Future<void> markSent(String clientMsgId, {required int seq, required int ts}) async {
    await _db.transaction((txn) async {
      await txn.update(
        'messages',
        {'seq': seq, 'ts': ts, 'status': MessageStatus.sent.name},
        where: 'client_msg_id = ?',
        whereArgs: [clientMsgId],
      );
      await _mergeRanges(txn, [seq]);
    });
    _changes.add(null);
  }

  /// 把一批 seq 切成連續的幾串，每一串跟重疊或相鄰（差 1）的既有區段合併成一段
  static Future<void> _mergeRanges(Transaction txn, Iterable<int> seqs) async {
    final sorted = seqs.toSet().toList()..sort();
    var i = 0;
    while (i < sorted.length) {
      var j = i;
      while (j + 1 < sorted.length && sorted[j + 1] == sorted[j] + 1) {
        j++;
      }
      var start = sorted[i], end = sorted[j];
      final touching = await txn.query(
        'loaded_ranges',
        columns: ['rowid', 'start_seq', 'end_seq'],
        where: 'start_seq <= ? AND end_seq >= ?',
        whereArgs: [end + 1, start - 1],
      );
      for (final r in touching) {
        start = (r['start_seq'] as int) < start ? r['start_seq'] as int : start;
        end = (r['end_seq'] as int) > end ? r['end_seq'] as int : end;
        await txn.delete('loaded_ranges', where: 'rowid = ?', whereArgs: [r['rowid']]);
      }
      await txn.insert('loaded_ranges', {'start_seq': start, 'end_seq': end});
      i = j + 1;
    }
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
}
