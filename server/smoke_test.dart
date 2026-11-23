// 講師備課自檢：先 `dart run server.dart`，另開終端 `dart run smoke_test.dart`
// 每一項都對應一個課堂驗收點；任何一項失敗就丟例外。
import 'dart:async';
import 'dart:convert';
import 'dart:io';

const base = 'localhost:8080';

Future<void> main() async {
  final a = await _Client.connect('A');
  final b = await _Client.connect('B');

  // 第 1 堂：A 發訊息 → A 收到 ack(seq)、B 收到廣播；A 不會收到自己的廣播
  a.sendMsg('id-1', 'hello');
  final ack1 = await a.next('ack');
  final got = await b.next('message');
  _check(got['seq'] == ack1['seq'] && got['text'] == 'hello', 'ack seq 與廣播 seq 一致');
  _check(!a.received.any((e) => e['type'] == 'message'), '發送者不會收到自己的廣播');

  // 第 3 堂：/delay 3 秒後才 ack
  final sw = Stopwatch()..start();
  a.sendMsg('id-delay', '/delay');
  await a.next('ack', timeout: const Duration(seconds: 5));
  _check(sw.elapsedMilliseconds >= 2900, '/delay 約 3 秒才回 ack (${sw.elapsedMilliseconds}ms)');

  // 第 3 堂：/fail 不回 ack；同 id 重試 3 次 → 只存一筆、只廣播一次、每次 ack 同一個 seq
  a.sendMsg('id-fail', '/fail');
  await b.next('message'); // B 仍看得到（Server 其實處理成功了）
  await _expectNone(a, 'ack', const Duration(seconds: 1), '/fail 不回 ack');
  b.received.clear(); // 清掉前面 /delay、/fail 的廣播，下面只看「重試」有沒有多廣播
  final seqs = <dynamic>{};
  for (var i = 0; i < 3; i++) {
    a.sendMsg('id-fail', '/fail');
    seqs.add((await a.next('ack'))['seq']);
  }
  _check(seqs.length == 1, '重試帶同一 client_msg_id → 同一個 seq（冪等）');
  await _expectNone(b, 'message', const Duration(milliseconds: 500), '重試不會重複廣播');

  // 第 4 堂：Cursor 分頁
  final page = await _get('/messages?before_seq=50&limit=20');
  final pageSeqs = page.map((m) => m['seq'] as int).toList();
  _check(pageSeqs.first == 30 && pageSeqs.last == 49, 'before_seq=50 回傳 seq 30~49 (由小到大)');

  // 第 5 堂：ping/pong
  a.send({'type': 'ping'});
  await a.next('pong');
  _check(true, 'ping → pong');

  // 第 5 堂：/drop → 斷線、5 秒內拒絕重連、機器人 3 句可用 after_seq 補回
  final lastSeq = (await _get('/messages?limit=1')).single['seq'] as int;
  a.sendMsg('id-drop', '/drop');
  await a.closed.timeout(const Duration(seconds: 2));
  _check(true, '/drop 會踢斷連線');
  var rejected = false;
  try {
    await WebSocket.connect('ws://$base/ws');
  } on WebSocketException {
    rejected = true;
  }
  _check(rejected, '/drop 後 5 秒內重連會被拒絕 (503)');
  await Future<void>.delayed(const Duration(seconds: 3));
  final gap = await _get('/messages?after_seq=$lastSeq');
  _check(gap.where((m) => m['sender'] == '🤖 Bot').length == 3, 'after_seq 補回斷線期間機器人的 3 句');

  // 第 5 堂：/zombie → 連線沒斷，但 ping 等不到 pong
  await Future<void>.delayed(const Duration(seconds: 3));
  final z = await _Client.connect('Z');
  z.sendMsg('id-zombie', '/zombie');
  await z.next('ack');
  z.send({'type': 'ping'});
  await _expectNone(z, 'pong', const Duration(seconds: 1), '/zombie 後不再回 pong');

  stdout.writeln('\nALL PASSED ✅');
  exit(0);
}

class _Client {
  _Client(this.name, this.ws) {
    ws.listen((d) => _queue.add(jsonDecode(d as String) as Map<String, dynamic>),
        onDone: () => _closed.complete());
  }
  final String name;
  final WebSocket ws;
  final received = <Map<String, dynamic>>[];
  final _queue = StreamController<Map<String, dynamic>>.broadcast();
  final _closed = Completer<void>();
  Future<void> get closed => _closed.future;
  late final _sub = _queue.stream.listen(received.add);

  static Future<_Client> connect(String name) async {
    final c = _Client(name, await WebSocket.connect('ws://$base/ws'));
    c._sub; // 開始記錄
    return c;
  }

  void send(Map<String, dynamic> j) => ws.add(jsonEncode(j));
  void sendMsg(String id, String text) =>
      send({'type': 'send', 'client_msg_id': id, 'sender': name, 'text': text});

  /// 取出並移除下一個指定 type 的事件
  Future<Map<String, dynamic>> next(String type, {Duration timeout = const Duration(seconds: 2)}) async {
    final deadline = DateTime.now().add(timeout);
    while (DateTime.now().isBefore(deadline)) {
      final i = received.indexWhere((e) => e['type'] == type);
      if (i >= 0) return received.removeAt(i);
      await Future<void>.delayed(const Duration(milliseconds: 20));
    }
    throw StateError('[$name] 等不到 $type');
  }
}

Future<void> _expectNone(_Client c, String type, Duration d, String label) async {
  await Future<void>.delayed(d);
  _check(!c.received.any((e) => e['type'] == type), label);
}

Future<List<Map<String, dynamic>>> _get(String path) async {
  final req = await HttpClient().getUrl(Uri.parse('http://$base$path'));
  final body = await (await req.close()).transform(utf8.decoder).join();
  return ((jsonDecode(body) as Map)['messages'] as List).cast<Map<String, dynamic>>();
}

void _check(bool ok, String label) {
  if (!ok) throw StateError('FAIL: $label');
  stdout.writeln('✓ $label');
}
