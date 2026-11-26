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
    return LocalMessageStore._(db);
  }

  /// 最新在前（index 0），配合 ListView(reverse: true)。還沒拿到 seq 的排最前面。
  /// 先查一次，之後每收到一次「資料變了」的通知就重查。
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

  // TODO(第 5 堂) ② 下面每個寫入方法寫完之後，都要發出「資料變了」的通知（_changes.add(null)）

  /// 樂觀更新：先寫一筆 sending
  Future<void> insertPending(Message m) async {
    // TODO(第 5 堂)
  }

  /// WS 廣播 —— 之後的歷史分頁、斷線補洞也都走這個入口。
  /// 同一個 client_msg_id 重複寫入只會更新，不會多一筆。
  Future<void> upsertFromServer(List<Message> messages) async {
    // TODO(第 5 堂) ② INSERT … ON CONFLICT(client_msg_id) DO UPDATE
  }

  /// 收到 ACK：補上 seq 並轉為 sent
  Future<void> markSent(String clientMsgId, {required int seq, required int ts}) async {
    // TODO(第 5 堂)
  }

  /// 改「還沒成功」的訊息狀態（逾時 → failed、重試 → sending）；已經 sent 的不能被改回去
  Future<void> updatePendingStatus(String clientMsgId, MessageStatus status) async {
    // TODO(第 5 堂)
  }
}
