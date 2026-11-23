// 講師備課自檢：`dart run smoke_test.dart`
// 自己啟動一台全新的 Server（port 18080、暫存資料檔），逐項驗證課堂會用到的行為，最後重啟驗證存檔。
// 每一項都對應一個課堂驗收點；任何一項失敗就印出 FAIL 並以非 0 結束。
import 'dart:async';
import 'dart:convert';
import 'dart:io';

const port = 18080;
const base = 'localhost:$port';
const admin = 'Teacher';
late Process server;
late String dataPath;

Future<void> main() async {
  final tmp = Directory.systemTemp.createTempSync('chat_smoke');
  dataPath = '${tmp.path}/state.json';
  await _startServer();
  try {
    await _run();
    stdout.writeln('\nALL PASSED ✅');
  } catch (e) {
    stdout.writeln('\n$e');
    exitCode = 1;
  } finally {
    server.kill();
    tmp.deleteSync(recursive: true);
  }
  exit(exitCode);
}

Future<void> _run() async {
  // ── 連線規則 ──
  _check(await _connectFails(''), '缺少 ?user= → 拒絕');
  final a = await _Client.connect('Amy');
  final a2 = await _Client.connect('Amy-2'); // 同一位學員的第二台模擬器
  _check(await _connectFails('Amy'), '同名已在線 → 拒絕');
  final rooms0 = await _getJson('/rooms?user=Amy');
  _check(rooms0['assigned_room_id'] == 'private:Amy', '新學員自動進私人房（Amy 與 Amy-2 同房）');
  _check((rooms0['rooms'] as List).single['last_seq'] == 0, '不預塞歷史訊息');

  // ── 第 1 堂前半：raw 等級，純字串進、純字串出，含發送者 ──
  a.ws.add('hello raw');
  _check(await a.nextRaw() == 'hello raw' && await a2.nextRaw() == 'hello raw', 'raw：純字串廣播給房間所有人（含自己）');

  // ── 第 1～3 堂：echo 等級，JSON 廣播含發送者、不回 ACK、自動補 client_msg_id ──
  await _admin({'action': 'level', 'level': 'echo'});
  a.ws.add('plain string');
  final e1 = await a.next('message');
  final e2 = await a2.next('message');
  _check(e1['sender'] == 'Amy' && e1['text'] == 'plain string' && e2['seq'] == e1['seq'], 'echo：純字串也包成 JSON 廣播，sender 以連線身分為準');
  _check((e1['client_msg_id'] as String).isNotEmpty, '沒帶 client_msg_id → Server 自動補');
  a.send({'type': 'send', 'sender': '冒名', 'text': 'json hi'});
  _check((await a.next('message'))['sender'] == 'Amy', 'JSON 的 sender 欄位不被信任');
  await a2.next('message');
  await _expectNone(a, 'ack', const Duration(milliseconds: 300), 'echo：不回 ACK');

  // ── 第 2 堂：ping/pong ──
  a.send({'type': 'ping'});
  await a.next('pong');
  _check(true, 'ping → pong');

  // ── 第 4 堂：ack 等級 ──
  await _admin({'action': 'level', 'level': 'ack'});
  a.sendMsg('id-1', 'hello');
  final ack1 = await a.next('ack');
  final got = await a2.next('message');
  _check(got['seq'] == ack1['seq'] && got['client_msg_id'] == 'id-1', 'ack：ack 的 seq 與廣播一致');
  await _expectNone(a, 'message', const Duration(milliseconds: 300), 'ack：發送者不再收到自己的廣播');

  final sw = Stopwatch()..start();
  a.sendMsg('id-delay', '/delay');
  await a2.next('message');
  await a.next('ack', timeout: const Duration(seconds: 5));
  _check(sw.elapsedMilliseconds >= 2900, '/delay 約 3 秒才回 ack (${sw.elapsedMilliseconds}ms)');

  a.sendMsg('id-fail', '/fail');
  await a2.next('message'); // 夥伴看得到：Server 其實處理成功了
  await _expectNone(a, 'ack', const Duration(seconds: 1), '/fail 不回 ack');
  final seqs = <dynamic>{};
  for (var i = 0; i < 3; i++) {
    a.sendMsg('id-fail', '/fail');
    seqs.add((await a.next('ack'))['seq']);
  }
  _check(seqs.length == 1, '重試帶同一 client_msg_id → 同一個 seq（冪等）');
  await _expectNone(a2, 'message', const Duration(milliseconds: 500), '重試不會重複廣播');

  // ── 全域延遲 ──
  await _admin({'action': 'delay', 'ms': 1000});
  sw.reset();
  a.sendMsg('id-slow', 'slow');
  await a.next('ack', timeout: const Duration(seconds: 3));
  _check(sw.elapsedMilliseconds >= 950, '全域延遲 1 秒 (${sw.elapsedMilliseconds}ms)');
  await a2.next('message');
  await _admin({'action': 'delay', 'ms': 0});

  // ── 第 6 / 7 堂：歷史分頁（seq 以房間為單位）──
  await _admin({'action': 'flood', 'room': 'private:Amy', 'n': 300});
  await a2.waitCount('message', 300);
  a2.received.clear();
  final last = ((await _getJson('/rooms?user=Amy'))['rooms'] as List).single['last_seq'] as int;
  final latest = await _msgs('/rooms/private:Amy/messages');
  _check(latest.length == 50 && latest.last['seq'] == last, '不帶 cursor → 最新 50 則');
  final before = await _msgs('/rooms/private:Amy/messages?before_seq=100&limit=20');
  _check(before.first['seq'] == 80 && before.last['seq'] == 99, 'before_seq=100 → 80～99（由小到大）');
  final after = await _msgs('/messages?user=Amy&after_seq=${last - 3}');
  _check(after.map((m) => m['seq']).join(',') == '${last - 2},${last - 1},$last', '/messages?user= 別名 + after_seq');
  final around = await _msgs('/rooms/private:Amy/messages?around_seq=150&limit=10');
  _check(around.first['seq'] == 145 && around.last['seq'] == 154, 'around_seq=150 → 145～154');

  // ── 第 7 堂：/drop 自己 → 只拒絕被踢者重連；機器人 3 句發在被踢者房間 ──
  a.sendMsg('id-drop', '/drop');
  await a.next('ack');
  await a.closed.timeout(const Duration(seconds: 2));
  _check(true, '/drop：先 ack 再踢斷');
  _check(a2.isOpen, '/drop 不帶對象只踢自己');
  _check(await _connectFails('Amy'), '/drop 後 5 秒內被踢者重連被拒');
  final b = await _Client.connect('Bob');
  _check(true, '其他人仍可連線');
  await Future<void>.delayed(const Duration(milliseconds: 2500));
  final gap = await _msgs('/messages?user=Amy&after_seq=${last + 1}');
  _check(gap.where((m) => m['sender'] == '🤖 Bot').length == 3, 'after_seq 補回機器人 3 句');
  await Future<void>.delayed(const Duration(seconds: 3));
  final a3 = await _Client.connect('Amy');
  _check(true, '5 秒後可重連');
  a3.sendMsg('id-drop', '/drop'); // 補送（outbox）重送同一則 /drop
  await a3.next('ack');
  await Future<void>.delayed(const Duration(milliseconds: 300));
  _check(a3.isOpen, '重送已處理過的 /drop 只回 ack，不會再踢一次');

  // ── 指定對象：只開放講師 ──
  b.sendMsg('id-b1', '/zombie Amy');
  await b.next('ack');
  final err = await b.next('error');
  _check((err['message'] as String).contains('講師'), '非講師指定對象 → error');
  final t = await _Client.connect(admin);
  t.sendMsg('id-t1', '/zombie Amy');
  await t.next('ack');
  await Future<void>.delayed(const Duration(milliseconds: 200));
  a3.send({'type': 'ping'});
  await _expectNone(a3, 'pong', const Duration(seconds: 1), '講師 /zombie Amy → Amy 收不到 pong');
  final a4 = await _Client.connect('Amy');
  a4.send({'type': 'ping'});
  await a4.next('pong');
  _check(true, '同名舊連線是 zombie → 新連線取代它');

  // ── 儀表板：暫時拒絕連線 ──
  await _admin({'action': 'reject', 'user': 'Bob', 'seconds': 2});
  await b.closed.timeout(const Duration(seconds: 2));
  _check(await _connectFails('Bob'), '拒絕連線：踢斷並拒絕重連');
  await Future<void>.delayed(const Duration(milliseconds: 2200));
  final b2 = await _Client.connect('Bob');
  _check(true, '拒絕時間到可重連');

  // ── 第 5 堂：兩兩一組（Amy 與 Amy-2 算同一人）──
  await _admin({'action': 'assign', 'mode': 'pairs'});
  final pairId = (await _getJson('/rooms?user=Amy-2'))['assigned_room_id'] as String;
  _check(pairId == (await _getJson('/rooms?user=Bob'))['assigned_room_id'] && pairId.startsWith('pair:'),
      '兩兩一組：Amy、Amy-2（同一人）與 Bob 同房');
  b2.received.clear();
  a4.sendMsg('id-p1', '不帶 room_id');
  final ackP = await a4.next('ack');
  _check(ackP['room_id'] == pairId && ackP['seq'] == 1, '不帶 room_id → 送到分配的房間；新房 seq 從 1 開始');
  _check((await b2.next('message'))['room_id'] == pairId, '夥伴收到');
  _check(((await _getJson('/rooms?user=Amy'))['rooms'] as List).length == 1, '分房＝搬家：離開舊的私人房');

  // ── 第 8 堂：拉群 room_added、私聊自動建房 ──
  for (final c in [a2, a4, b2]) {
    c.received.clear(); // 清掉兩兩一組推的 room_added
  }
  await _admin({'action': 'group', 'name': '活動群', 'users': ['Amy', 'Bob', admin]});
  final added = await b2.next('room_added');
  final gid = (added['room'] as Map)['id'] as String;
  _check((added['room'] as Map)['members'].length == 3, '拉群 → 被拉的人收到 room_added');
  a4.sendMsg('id-g1', 'hi group', roomId: gid);
  _check((await a4.next('ack'))['seq'] == 1, '帶 room_id 送進群組，seq 以房間為單位');
  _check((await b2.next('message'))['room_id'] == gid, '群組成員收到');
  await _expectNone(a2, 'message', const Duration(milliseconds: 300), '不在群組的人收不到');
  b2.sendMsg('id-dm-bad', 'x', roomId: 'dm:Bob:Amy');
  _check((await b2.next('error'))['message'].toString().contains('dm:A:B'), '私聊 ID 沒排序 → error');
  a4.received.removeWhere((e) => e['type'] == 'room_added'); // 群組那則已驗過
  b2.sendMsg('id-dm1', '私訊你', roomId: 'dm:Amy:Bob');
  _check(((await a4.next('room_added'))['room'] as Map)['id'] == 'dm:Amy:Bob', '私聊第一則 → 對方收到 room_added');
  _check((await a4.next('message'))['text'] == '私訊你', '對方收到私訊');
  await b2.next('ack');

  // ── 第 9 堂：已讀水位線 ──
  for (var i = 0; i < 5; i++) {
    a4.sendMsg('id-r$i', 'r$i', roomId: gid);
    await a4.next('ack');
  }
  b2.received.removeWhere((e) => e['type'] == 'message');
  b2.send({'type': 'read', 'room_id': gid, 'seq': 4});
  final r1 = await a4.next('read');
  _check(r1['user'] == 'Bob' && r1['seq'] == 4, '已讀前進 → 廣播 read 給房間成員');
  b2.send({'type': 'read', 'room_id': gid, 'seq': 2});
  await _expectNone(a4, 'read', const Duration(milliseconds: 300), '水位線不會倒退');
  await _admin({'action': 'read', 'room': gid, 'user': 'Bob', 'seq': 1});
  _check((await a4.next('read'))['seq'] == 1, '講師可以把水位線設回去');
  final gRoom = ((await _getJson('/rooms?user=Bob'))['rooms'] as List).firstWhere((r) => r['id'] == gid);
  _check(gRoom['last_read_seq'] == 1 && gRoom['last_seq'] == 6 && (gRoom['last_message'] as Map)['text'] == 'r4',
      'GET /rooms：last_seq、last_read_seq、last_message（算未讀與預覽）');

  // ── /drop @all（講師）──
  t.sendMsg('id-t2', '/drop @all');
  await t.next('ack');
  await Future.wait([a2.closed, a4.closed, b2.closed]).timeout(const Duration(seconds: 2));
  _check(t.isOpen, '/drop @all 踢掉所有人（不含講師自己）');

  // ── 存檔：重啟後 seq 接續 ──
  await Future<void>.delayed(const Duration(milliseconds: 2500)); // 等機器人發言 + 自動存檔
  server.kill(ProcessSignal.sigint);
  await server.exitCode;
  await _startServer();
  final after2 = (await _getJson('/rooms?user=Bob'))['rooms'] as List;
  _check(after2.any((r) => r['id'] == gid && r['last_read_seq'] == 1), '重啟後房間與水位線還在');
  await Future<void>.delayed(const Duration(seconds: 3));
  final a5 = await _Client.connect('Amy');
  a5.sendMsg('id-after-restart', 'still here', roomId: gid);
  _check((await a5.next('ack'))['seq'] == 7, '重啟後 seq 接續（不從 1 重來）');
  a5.sendMsg('id-r0', 'r0', roomId: gid);
  _check((await a5.next('ack'))['seq'] == 2, '重啟後冪等表還在（舊 client_msg_id 回原本的 seq）');
}

// ───────────────────────── helpers ─────────────────────────

Future<void> _startServer() async {
  server = await Process.start('dart', ['run', 'server.dart', '--port=$port', '--admin=$admin', '--data=$dataPath'],
      workingDirectory: File.fromUri(Platform.script).parent.path);
  final ready = Completer<void>();
  server.stdout.transform(utf8.decoder).listen((s) {
    if (Platform.environment['VERBOSE'] != null) stdout.write(s);
    if (s.contains('listening') && !ready.isCompleted) ready.complete();
  });
  server.stderr.transform(utf8.decoder).listen(stderr.write);
  await ready.future.timeout(const Duration(seconds: 20));
}

class _Client {
  _Client(this.name, this.ws) {
    ws.listen((d) {
      final s = d as String;
      try {
        received.add(jsonDecode(s) as Map<String, dynamic>);
      } catch (_) {
        raw.add(s);
      }
    }, onDone: () => _closed.complete());
  }
  final String name;
  final WebSocket ws;
  final received = <Map<String, dynamic>>[];
  final raw = <String>[];
  final _closed = Completer<void>();
  Future<void> get closed => _closed.future;
  bool get isOpen => !_closed.isCompleted;

  static Future<_Client> connect(String name) async =>
      _Client(name, await WebSocket.connect('ws://$base/ws?user=${Uri.encodeQueryComponent(name)}'));

  void send(Map<String, dynamic> j) => ws.add(jsonEncode(j));
  void sendMsg(String id, String text, {String? roomId}) =>
      send({'type': 'send', 'client_msg_id': id, 'text': text, if (roomId != null) 'room_id': roomId});

  /// 取出並移除下一個指定 type 的事件
  Future<Map<String, dynamic>> next(String type, {Duration timeout = const Duration(seconds: 2)}) async {
    final deadline = DateTime.now().add(timeout);
    while (DateTime.now().isBefore(deadline)) {
      final i = received.indexWhere((e) => e['type'] == type);
      if (i >= 0) return received.removeAt(i);
      await Future<void>.delayed(const Duration(milliseconds: 20));
    }
    throw StateError('FAIL: [$name] 等不到 $type（目前收到 ${received.map((e) => e['type']).toList()}）');
  }

  Future<String> nextRaw() async {
    for (var i = 0; i < 100 && raw.isEmpty; i++) {
      await Future<void>.delayed(const Duration(milliseconds: 20));
    }
    if (raw.isEmpty) throw StateError('FAIL: [$name] 等不到純字串');
    return raw.removeAt(0);
  }

  Future<void> waitCount(String type, int n) async {
    for (var i = 0; i < 250; i++) {
      if (received.where((e) => e['type'] == type).length >= n) return;
      await Future<void>.delayed(const Duration(milliseconds: 20));
    }
    throw StateError('FAIL: [$name] 等不到 $n 則 $type');
  }
}

Future<bool> _connectFails(String user) async {
  try {
    final ws = await WebSocket.connect('ws://$base/ws?user=$user');
    await ws.close();
    return false;
  } on WebSocketException {
    return true;
  }
}

Future<void> _expectNone(_Client c, String type, Duration d, String label) async {
  await Future<void>.delayed(d);
  _check(!c.received.any((e) => e['type'] == type), label);
}

Future<Map<String, dynamic>> _getJson(String path) async {
  final req = await HttpClient().getUrl(Uri.parse('http://$base$path'));
  final body = await (await req.close()).transform(utf8.decoder).join();
  return jsonDecode(body) as Map<String, dynamic>;
}

Future<List<Map<String, dynamic>>> _msgs(String path) async =>
    ((await _getJson(path))['messages'] as List).cast<Map<String, dynamic>>();

Future<void> _admin(Map<String, dynamic> body) async {
  final req = await HttpClient().postUrl(Uri.parse('http://$base/admin/action'));
  req.add(utf8.encode(jsonEncode(body)));
  final res = await req.close();
  await res.drain<void>();
  if (res.statusCode != 200) throw StateError('FAIL: admin $body → ${res.statusCode}');
}

void _check(bool ok, String label) {
  if (!ok) throw StateError('FAIL: $label');
  stdout.writeln('✓ $label');
}
