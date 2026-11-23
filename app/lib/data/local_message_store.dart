import 'dart:async';

import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';

import '../models/message.dart';

/// SSOT（Single Source of Truth）：本地唯一的筆記本。
/// - UI 只訂閱 [watchMessages]。
/// - WebSocket 只負責「寫進來」，去重（client_msg_id 主鍵）與排序（seq）都交給 DB。
class LocalMessageStore {
  LocalMessageStore._(this._db);

  final Database _db;
  final _changes = StreamController<void>.broadcast();

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
    // 上次 App 被殺掉時還在 sending 的，不可能再收到 ACK 了 → 改成 failed
    await db.update(
      'messages',
      {'status': MessageStatus.failed.name},
      where: 'status = ?',
      whereArgs: [MessageStatus.sending.name],
    );
    return LocalMessageStore._(db);
  }

  /// 最新在前（index 0），配合 ListView(reverse: true)。還沒拿到 seq 的排最前面。
  /// 先查一次，之後每收到一次「資料變了」的通知就重查。
  // TODO(第 6 堂) ② 加上 limit：只撈最新 N 則（limit 變大時也要重新查詢）
  Stream<List<Message>> watchMessages() async* {
    yield await _queryAll();
    await for (final _ in _changes.stream) {
      yield await _queryAll();
    }
  }

  Future<List<Message>> _queryAll() async {
    final rows = await _db.rawQuery('SELECT * FROM messages ORDER BY seq IS NULL DESC, seq DESC, ts DESC');
    return rows.map(Message.fromRow).toList();
  }

  Future<int> count() async => Sqflite.firstIntValue(await _db.rawQuery('SELECT COUNT(*) FROM messages'))!;

  /// 本地最舊的 seq → 往上翻歷史的 cursor
  Future<int?> oldestSeq() async => Sqflite.firstIntValue(await _db.rawQuery('SELECT MIN(seq) FROM messages'));

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
}
