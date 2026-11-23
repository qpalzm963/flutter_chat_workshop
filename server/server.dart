// 可控搞破壞聊天室 Server（純 dart:io，零依賴）
//
//   dart run server.dart          # 預設 port 8080
//
// WebSocket: ws://localhost:8080/ws
//   client → {"type":"send","client_msg_id":"uuid","sender":"Amy","text":"hi"}
//   server → {"type":"ack","client_msg_id":"uuid","seq":12,"ts":...}    (只回給發送者)
//   server → {"type":"message","seq":12,"client_msg_id":"uuid","sender":"Amy","text":"hi","ts":...}
//            (廣播給「其他人」；發送者靠 ack 拿到 seq)
//   client → {"type":"ping"}   server → {"type":"pong"}
//
// REST:
//   GET /messages?before_seq=X&limit=20   往上翻歷史（Cursor 分頁）
//   GET /messages?after_seq=X&limit=100   斷線補洞（Delta Sync）
//   GET /messages?limit=20                最新 N 筆
//   回傳一律依 seq 由小到大排序：{"messages":[...]}
//
// 現場搞破壞指令（直接在聊天室輸入）：
//   /delay   延遲 3 秒才回 ACK                         → 測 Optimistic UI
//   /fail    訊息照收、照廣播，但「故意不回 ACK」         → 測逾時紅點 + 重試冪等
//            （模擬「Server 處理成功、但回應在路上弄丟了」）
//   /drop    踢斷所有連線、5 秒內拒絕重連，2 秒後機器人偷發 3 句 → 測重連 + 補洞
//   /zombie  連線不關，但 Server 不再理你（不回 pong/ack） → 測心跳偵測假死
import 'dart:async';
import 'dart:convert';
import 'dart:io';

final _messages = <Map<String, dynamic>>[]; // 依 seq 遞增
final _seqByClientId = <String, int>{}; // 冪等去重表：client_msg_id → seq
final _clients = <WebSocket>{};
final _zombies = <WebSocket>{};
var _nextSeq = 1;
DateTime? _rejectUntil;

Future<void> main(List<String> args) async {
  final port = args.isNotEmpty ? int.parse(args.first) : 8080;
  _seedHistory(200);
  final server = await HttpServer.bind(InternetAddress.anyIPv4, port);
  _log('listening on http://localhost:$port  (ws: /ws, rest: /messages)');
  await for (final req in server) {
    _handle(req).catchError((Object e) => _log('error: $e'));
  }
}

Future<void> _handle(HttpRequest req) async {
  final path = req.uri.path;
  if (path == '/ws') return _handleWs(req);
  if (path == '/messages' && req.method == 'GET') return _handleHistory(req);
  req.response
    ..statusCode = HttpStatus.notFound
    ..write('not found');
  await req.response.close();
}

// ───────────────────────── WebSocket ─────────────────────────

Future<void> _handleWs(HttpRequest req) async {
  final until = _rejectUntil;
  if (until != null && DateTime.now().isBefore(until)) {
    _log('reject ws (server "restarting")');
    req.response.statusCode = HttpStatus.serviceUnavailable;
    await req.response.close();
    return;
  }
  if (!WebSocketTransformer.isUpgradeRequest(req)) {
    req.response.statusCode = HttpStatus.badRequest;
    await req.response.close();
    return;
  }
  final ws = await WebSocketTransformer.upgrade(req);
  _clients.add(ws);
  _log('client connected (${_clients.length} online)');
  ws.listen(
    (data) => _onWsData(ws, data),
    onDone: () {
      _clients.remove(ws);
      _zombies.remove(ws);
      _log('client disconnected (${_clients.length} online)');
    },
    onError: (_) {},
  );
}

void _onWsData(WebSocket ws, dynamic data) {
  if (_zombies.contains(ws)) return; // 假死：完全不理
  final Map<String, dynamic> json;
  try {
    json = jsonDecode(data as String) as Map<String, dynamic>;
  } catch (_) {
    return;
  }
  switch (json['type']) {
    case 'ping':
      _send(ws, {'type': 'pong'});
    case 'send':
      _onSend(ws, json);
  }
}

void _onSend(WebSocket ws, Map<String, dynamic> json) {
  final clientMsgId = json['client_msg_id'] as String?;
  final text = (json['text'] as String? ?? '').trim();
  final sender = json['sender'] as String? ?? 'anonymous';
  if (clientMsgId == null || text.isEmpty) return;

  // 冪等：同一個 client_msg_id 重送 → 回同一個 seq，不重複存、不重複廣播
  final existingSeq = _seqByClientId[clientMsgId];
  if (existingSeq != null) {
    _log('duplicate $clientMsgId → re-ack seq=$existingSeq (no re-broadcast)');
    final msg = _messages.firstWhere((m) => m['seq'] == existingSeq);
    _send(ws, {'type': 'ack', 'client_msg_id': clientMsgId, 'seq': existingSeq, 'ts': msg['ts']});
    return;
  }

  final msg = _store(clientMsgId: clientMsgId, sender: sender, text: text);
  _broadcast({'type': 'message', ...msg}, except: ws);
  final ack = {'type': 'ack', 'client_msg_id': clientMsgId, 'seq': msg['seq'], 'ts': msg['ts']};

  switch (text) {
    case '/delay':
      _log('/delay → ack in 3s');
      Timer(const Duration(seconds: 3), () => _send(ws, ack));
    case '/fail':
      _log('/fail → stored seq=${msg['seq']} but ACK dropped');
    case '/drop':
      _send(ws, ack);
      _drop();
    case '/zombie':
      _send(ws, ack);
      _zombies.add(ws);
      _log('/zombie → this socket is now ignored');
    default:
      _send(ws, ack);
  }
}

void _drop() {
  _log('/drop → kick all, reject reconnect for 5s, bot speaks in 2s');
  _rejectUntil = DateTime.now().add(const Duration(seconds: 5));
  for (final c in _clients.toList()) {
    c.close(WebSocketStatus.goingAway, 'server dropped you');
  }
  Timer(const Duration(seconds: 2), () {
    for (final t in ['你剛剛斷線了吧？', '這三句是你斷線時我偷偷講的', '有自動補回來就代表 Delta Sync 成功 🎉']) {
      final m = _store(clientMsgId: 'bot-${_nextSeq}', sender: '🤖 Bot', text: t);
      _broadcast({'type': 'message', ...m});
    }
  });
}

// ───────────────────────── REST ─────────────────────────

Future<void> _handleHistory(HttpRequest req) async {
  final q = req.uri.queryParameters;
  final limit = (int.tryParse(q['limit'] ?? '') ?? 20).clamp(1, 200);
  final before = int.tryParse(q['before_seq'] ?? '');
  final after = int.tryParse(q['after_seq'] ?? '');

  List<Map<String, dynamic>> result;
  if (after != null) {
    result = _messages.where((m) => (m['seq'] as int) > after).take(limit).toList();
  } else {
    final pool = before == null ? _messages : _messages.where((m) => (m['seq'] as int) < before).toList();
    result = pool.sublist(pool.length > limit ? pool.length - limit : 0);
  }
  _log('GET ${req.uri} → ${result.length} msgs');
  req.response.headers.contentType = ContentType.json;
  req.response.write(jsonEncode({'messages': result}));
  await req.response.close();
}

// ───────────────────────── helpers ─────────────────────────

Map<String, dynamic> _store({required String clientMsgId, required String sender, required String text}) {
  final msg = <String, dynamic>{
    'seq': _nextSeq++,
    'client_msg_id': clientMsgId,
    'sender': sender,
    'text': text,
    'ts': DateTime.now().millisecondsSinceEpoch,
  };
  _messages.add(msg);
  _seqByClientId[clientMsgId] = msg['seq'] as int;
  return msg;
}

void _seedHistory(int count) {
  final start = DateTime.now().subtract(Duration(minutes: count));
  for (var i = 1; i <= count; i++) {
    final seq = _nextSeq++;
    final msg = <String, dynamic>{
      'seq': seq,
      'client_msg_id': 'seed-$seq',
      'sender': i.isEven ? '🤖 Bot' : '👻 Ghost',
      'text': '歷史訊息 #$i',
      'ts': start.add(Duration(minutes: i)).millisecondsSinceEpoch,
    };
    _messages.add(msg);
    _seqByClientId['seed-$seq'] = seq;
  }
}

void _send(WebSocket ws, Map<String, dynamic> json) {
  if (_zombies.contains(ws)) return;
  ws.add(jsonEncode(json));
}

void _broadcast(Map<String, dynamic> json, {WebSocket? except}) {
  for (final c in _clients) {
    if (c != except) _send(c, json);
  }
}

void _log(String s) => stdout.writeln('[${DateTime.now().toIso8601String().substring(11, 19)}] $s');
