import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config.dart';
import '../models/message.dart';

/// REST 通道：歷史分頁（before_seq）與斷線補洞（after_seq）。
/// 回傳一律依 seq 由小到大。
class HistoryApi {
  Future<List<Message>> fetch({int? beforeSeq, int? afterSeq, int limit = 20}) async {
    final uri = Uri.http('$serverHost:$serverPort', '/messages', {
      'limit': '$limit',
      if (beforeSeq != null) 'before_seq': '$beforeSeq',
      if (afterSeq != null) 'after_seq': '$afterSeq',
    });
    final res = await http.get(uri).timeout(const Duration(seconds: 5));
    if (res.statusCode != 200) throw http.ClientException('HTTP ${res.statusCode}', uri);
    final list = (jsonDecode(res.body) as Map<String, dynamic>)['messages'] as List;
    return list.map((j) => Message.fromServer(j as Map<String, dynamic>)).toList();
  }
}
