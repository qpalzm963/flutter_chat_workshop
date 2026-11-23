import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config.dart';
import '../models/message.dart';

/// REST 通道：房間列表、歷史分頁（before_seq）、斷線補洞（after_seq）。回傳一律依 seq 由小到大。
class HistoryApi {
  HistoryApi(this.user);

  final String user;

  /// 每頁 50 則
  static const pageSize = 50;

  /// 第 6～7 堂用的版本：房間＝講師分配給 [user] 的那間。換成 [fetchMessages] 之後就可以刪掉。
  /// 不帶 cursor → 最新一頁；beforeSeq → 比它舊的；afterSeq → 比它新的
  Future<List<Message>> fetch({int? beforeSeq, int? afterSeq, int limit = pageSize}) async {
    final uri = apiUrl(
      ['messages'],
      {
        'user': user,
        'limit': '$limit',
        if (beforeSeq != null) 'before_seq': '$beforeSeq',
        if (afterSeq != null) 'after_seq': '$afterSeq',
      },
    );
    final res = await http.get(uri).timeout(const Duration(seconds: 5));
    if (res.statusCode != 200) throw http.ClientException('HTTP ${res.statusCode}', uri);
    final list = (jsonDecode(utf8.decode(res.bodyBytes)) as Map<String, dynamic>)['messages'] as List;
    return list.map((j) => Message.fromServer(j as Map<String, dynamic>)).toList();
  }

  /// 指定房間的訊息（第 8 堂起用這個）
  Future<List<Message>> fetchMessages(String roomId, {int? beforeSeq, int? afterSeq, int limit = pageSize}) async {
    final json = await _get(
      apiUrl(
        ['rooms', roomId, 'messages'],
        {
          'limit': '$limit',
          if (beforeSeq != null) 'before_seq': '$beforeSeq',
          if (afterSeq != null) 'after_seq': '$afterSeq',
        },
      ),
    );
    return (json['messages'] as List).map((j) => Message.fromServer(j as Map<String, dynamic>)).toList();
  }

  /// 回傳 Server 原始 JSON：assigned_room_id（第 8 堂前講師分配的房間，用來收編舊資料）與 rooms
  Future<Map<String, dynamic>> fetchRooms(String user) => _get(apiUrl(['rooms'], {'user': user}));

  Future<List<String>> fetchOnlineUsers() async => ((await _get(apiUrl(['users'])))['online'] as List).cast<String>();

  Future<Map<String, dynamic>> _get(Uri uri) async {
    final res = await http.get(uri).timeout(const Duration(seconds: 5));
    if (res.statusCode != 200) throw http.ClientException('HTTP ${res.statusCode}', uri);
    return jsonDecode(utf8.decode(res.bodyBytes)) as Map<String, dynamic>;
  }
}
