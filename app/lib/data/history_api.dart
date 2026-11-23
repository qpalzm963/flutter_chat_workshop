import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config.dart';
import '../models/message.dart';

/// REST 通道：歷史分頁（before_seq）與斷線補洞（after_seq）。
/// 房間＝講師分配給 [user] 的那間（第 8 堂之前還沒有 room_id）。回傳一律依 seq 由小到大。
class HistoryApi {
  HistoryApi(this.user);

  final String user;

  /// 每頁 50 則
  static const pageSize = 50;

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
}
