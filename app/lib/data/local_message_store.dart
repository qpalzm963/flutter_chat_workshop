import 'dart:async';

import 'package:path/path.dart';
import 'package:sqflite/sqflite.dart';

import '../models/message.dart';

/// SSOT（Single Source of Truth）：本地唯一的筆記本。
/// - UI 只訂閱 [watchMessages]。
/// - WebSocket / REST 只負責「寫進來」，去重（client_msg_id 主鍵）與排序（seq）都交給 DB。
class LocalMessageStore {
  LocalMessageStore._(this._db);

  final Database _db;
  final _changes = StreamController<void>.broadcast();

  static Future<LocalMessageStore> open({String name = 'chat.db'}) async {
    final db = await openDatabase(
      join(await getDatabasesPath(), name),
      version: 1,
      onCreate: (db, _) => db.execute('''
        CREATE TABLE messages(
          client_msg_id TEXT PRIMARY KEY,
          seq INTEGER UNIQUE,
          sender TEXT NOT NULL,
          text TEXT NOT NULL,
          ts INTEGER NOT NULL,
          status TEXT NOT NULL
        )'''),
    );
    // 上次 App 被殺掉時還在 sending 的，不可能再收到 ACK 了 → 標記失敗讓使用者重試
    await db.update('messages', {'status': MessageStatus.failed.name},
        where: 'status = ?', whereArgs: [MessageStatus.sending.name]);
    return LocalMessageStore._(db);
  }

  /// 最新在前（index 0），配合 ListView(reverse: true)。
  /// 還沒拿到 seq 的（自己剛送出的）排最前面。
  Stream<List<Message>> watchMessages() async* {
    yield await _queryAll();
    await for (final _ in _changes.stream) {
      yield await _queryAll();
    }
  }

  Future<List<Message>> _queryAll() async {
    final rows = await _db.rawQuery(
        'SELECT * FROM messages ORDER BY seq IS NULL DESC, seq DESC, ts DESC');
    return rows.map(Message.fromRow).toList();
  }

  /// 樂觀更新：先寫一筆 sending
  Future<void> insertPending(Message m) async {
    await _db.insert('messages', m.toRow());
    _changes.add(null);
  }

  /// WS 廣播、ACK、歷史分頁、斷線補洞 —— 全部走這一個入口。
  /// 同一個 client_msg_id 重複寫入只會更新，不會多一筆。
  Future<void> upsertFromServer(List<Message> messages) async {
    if (messages.isEmpty) return;
    final batch = _db.batch();
    for (final m in messages) {
      batch.rawInsert('''
        INSERT INTO messages(client_msg_id, seq, sender, text, ts, status)
        VALUES(?, ?, ?, ?, ?, ?)
        ON CONFLICT(client_msg_id) DO UPDATE SET
          seq = excluded.seq, ts = excluded.ts, status = excluded.status''',
          [m.clientMsgId, m.seq, m.sender, m.text, m.ts, MessageStatus.sent.name]);
    }
    await batch.commit(noResult: true);
    _changes.add(null);
  }

  /// 收到 ACK：補上 seq 並轉為 sent
  Future<void> markSent(String clientMsgId, {required int seq, required int ts}) async {
    await _db.update('messages', {'seq': seq, 'ts': ts, 'status': MessageStatus.sent.name},
        where: 'client_msg_id = ?', whereArgs: [clientMsgId]);
    _changes.add(null);
  }

  /// 只改「還沒成功」的訊息狀態（避免逾時晚到把 sent 改回 failed）
  Future<void> updatePendingStatus(String clientMsgId, MessageStatus status) async {
    await _db.update('messages', {'status': status.name},
        where: 'client_msg_id = ? AND status != ?',
        whereArgs: [clientMsgId, MessageStatus.sent.name]);
    _changes.add(null);
  }

  /// 本地最舊的 seq → 往上翻歷史的 cursor
  Future<int?> oldestSeq() => _scalar('SELECT MIN(seq) FROM messages');

  /// 本地最新的 seq → 斷線補洞的 cursor
  Future<int?> latestSeq() => _scalar('SELECT MAX(seq) FROM messages');

  Future<int?> _scalar(String sql) async =>
      Sqflite.firstIntValue(await _db.rawQuery(sql));
}
