// 工作坊共用聊天室 Server + 講師儀表板（純 dart:io，零依賴）
//
//   dart run server.dart --admin=Vince --data=state.json [--port=8080] [--level=raw|echo|ack]
//   --data：狀態存檔（訊息、房間、分房、水位線、行為等級），重啟後 seq 接續；不給就只放記憶體
//   儀表板：http://localhost:8080/admin
//
// ── 連線 ──
//   ws://host:8080/ws?user=Amy        一條 WS 承載所有房間
//   缺 user → 400；同名已在線 → 409；被 /drop 或儀表板暫時拒絕 → 503
//   （同名的舊連線若已被 /zombie，視為死線，新連線直接取代它）
//
// ── 行為等級（儀表板切換，或啟動參數 --level）──
//   raw   第 1 堂前半：收到什麼就把「純文字」廣播給房間所有人（含發送者）
//   echo  第 1～3 堂：廣播 JSON message 給房間所有人（含發送者），不回 ACK
//   ack   第 4 堂起：message 只廣播給「其他人」，發送者收到 ack（拿 seq）
//
// ── client → server ──
//   純字串 "hi"                                         視為一則訊息（第 1 堂）
//   {"type":"send","text":"hi","client_msg_id":"uuid","room_id":"pair:Amy:Bob"}
//      type 也接受 "message"；sender 一律以連線的 user 為準
//      沒帶 client_msg_id（第 1～3 堂）→ Server 自動補
//      沒帶 room_id（第 1～7 堂）→ 送到講師分配給你的房間；第 8 堂起以 room_id 為準
//      room_id 為 dm:A:B（名字排序）且房間不存在 → 自動建立 2 人私聊房
//   {"type":"read","room_id":"...","seq":42}             已讀水位線（只會前進）
//   {"type":"ping"}
//
// ── server → client（JSON 等級）──
//   {"type":"message","room_id","seq","client_msg_id","sender","text","ts"}
//   {"type":"ack","room_id","seq","client_msg_id","ts"}          （ack 等級才有）
//   {"type":"read","room_id","user","seq"}                        有人的水位線前進
//   {"type":"room_added","room":{...同 GET /rooms 的一筆}}        被拉進新房間
//   {"type":"pong"}   {"type":"error","message":"..."}
//
// ── REST（訊息一律依 seq 由小到大；seq 以房間為單位）──
//   GET /rooms?user=Amy
//       {"assigned_room_id":"...","rooms":[{id,name,kind,members,last_seq,
//         last_message,last_read_seq,reads:{user:seq}}]}
//   GET /rooms/{id}/messages?before_seq=X | after_seq=X | around_seq=X  [&limit=50]
//       不帶 cursor → 最新一頁；limit 預設 50、上限 200
//   GET /users                     {"online":[...]}  在線學員（第 8 堂私聊選人）
//   GET /messages?user=Amy&...     同上，房間＝講師分配給 Amy 的房間（第 6～7 堂用，還沒有 room_id）
//
// ── 現場搞破壞指令（直接在聊天室輸入；訊息照常儲存與 ACK，之後才生效）──
//   /delay            發送者 3 秒後才收到 ack（echo 等級：3 秒後才收到自己的回音）
//   /fail             照存照廣播，但「回條弄丟」：不回 ack／不回音給發送者 → 測冪等
//   /drop [名字|@all] 踢斷連線、5 秒內拒絕「被踢者」重連，2 秒後機器人在被踢者房間發 3 句
//   /zombie [名字|@all] 連線不關，但 Server 不再理那條連線（不回 pong / ack / 訊息）
//   指定對象只開放講師（--admin=名字）；不帶對象一律只影響自己
import 'dart:async';
import 'dart:convert';
import 'dart:io';

// ───────────────────────── 狀態 ─────────────────────────

enum Level { raw, echo, ack }

class Room {
  Room(this.id, this.name, this.kind);
  final String id;
  final String name;
  final String kind; // private | pair | lobby | group | dm
  final members = <String>{};
  final messages = <Map<String, dynamic>>[]; // messages[i]['seq'] == i + 1
  final reads = <String, int>{}; // user → last_read_seq
  int get lastSeq => messages.length;
}

class Conn {
  Conn(this.user, this.ws);
  final String user;
  final WebSocket ws;
  bool zombie = false;
}

String? admin;
var level = Level.raw;
var delayMs = 0;
var serverPort = 8080;
var lanIps = <String>[];

final rooms = <String, Room>{};
final conns = <String, Conn>{}; // user → 目前的連線（同名只允許一條）
final assigned = <String, String>{}; // user → 講師分配的房間（不帶 room_id 的訊息送這裡）
final blockedUntil = <String, DateTime>{};
final byClientId = <String, Map<String, dynamic>>{}; // 冪等去重表
final attempts = <Map<String, dynamic>>[]; // 連線嘗試紀錄（重連時間軸）
final drops = <Map<String, dynamic>>[]; // /drop 事件（重連時間軸的 t=0）
var _autoId = 0;
var _groupId = 0;

const dropRejectFor = Duration(seconds: 5);
const botDelay = Duration(seconds: 2);
const slowAck = Duration(seconds: 3);

Future<List<String>> _detectLanIps() async {
  try {
    final ifs = await NetworkInterface.list(type: InternetAddressType.IPv4, includeLoopback: false);
    final ips = <String>{};
    bool isVirtualIf(String name) =>
        RegExp(r'^(utun|awdl|llw|bridge|lo|docker|veth|vmnet|vboxnet|tailscale)').hasMatch(name);
    for (final i in ifs) {
      if (isVirtualIf(i.name)) continue;
      for (final a in i.addresses) {
        final ip = a.address;
        if (a.isLoopback || ip.startsWith('169.254.') || ip.startsWith('198.18.') || ip.startsWith('198.19.')) continue;
        ips.add(ip);
      }
    }
    final list = ips.toList();
    list.sort((a, b) {
      int rank(String s) => s.startsWith('192.168.') ? 0 : s.startsWith('10.') ? 1 : s.startsWith('172.') ? 2 : 3;
      return rank(a).compareTo(rank(b));
    });
    return list;
  } catch (_) {
    return const [];
  }
}

Future<void> main(List<String> args) async {
  var port = 8080;
  String? dataPath;
  for (final a in args) {
    if (a.startsWith('--admin=')) admin = a.substring(8);
    if (a.startsWith('--port=')) port = int.parse(a.substring(7));
    if (a.startsWith('--level=')) level = Level.values.byName(a.substring(8));
    if (a.startsWith('--data=')) dataPath = a.substring(7);
  }
  serverPort = port;
  lanIps = await _detectLanIps();
  if (dataPath != null) _startPersistence(File(dataPath));
  final server = await HttpServer.bind(InternetAddress.anyIPv4, port);
  final ipHint = lanIps.isEmpty ? 'localhost' : lanIps.join(', ');
  _log('listening on :$port (LAN: $ipHint)  ws=/ws?user=  dashboard=http://localhost:$port/admin  '
      'admin=${admin ?? '(未設定)'}  level=${level.name}  data=${dataPath ?? '(只放記憶體)'}');
  await for (final req in server) {
    _handle(req).catchError((Object e) => _log('error: $e'));
  }
}

Future<void> _handle(HttpRequest req) async {
  final seg = req.uri.pathSegments;
  final path = req.uri.path;
  if (path == '/ws') return _handleWs(req);
  if (req.method == 'GET' && (path == '/' || path == '/admin')) {
    req.response.headers.contentType = ContentType.html;
    req.response.write(_dashboardHtml);
    return req.response.close();
  }
  if (req.method == 'GET' && path == '/ws-test') {
    req.response.headers.contentType = ContentType.html;
    req.response.write(_wsTestHtml);
    return req.response.close();
  }
  if (req.method == 'GET' && path == '/admin/state') return _json(req, _adminState(req.uri.queryParameters['room']));
  if (req.method == 'POST' && path == '/admin/action') return _adminAction(req);
  if (req.method == 'GET' && path == '/rooms') return _getRooms(req);
  if (req.method == 'GET' && path == '/users') return _json(req, {'online': conns.keys.toList()..sort()});
  if (req.method == 'GET' && path == '/messages') {
    final room = rooms[assigned[req.uri.queryParameters['user']]];
    if (room == null) return _json(req, {'error': 'unknown user'}, status: 404);
    return _json(req, {'messages': _page(room, req.uri.queryParameters)});
  }
  if (req.method == 'GET' && seg.length == 3 && seg[0] == 'rooms' && seg[2] == 'messages') {
    final room = rooms[seg[1]];
    if (room == null) return _json(req, {'error': 'unknown room'}, status: 404);
    return _json(req, {'messages': _page(room, req.uri.queryParameters)});
  }
  return _json(req, {'error': 'not found'}, status: 404);
}

// ───────────────────────── WebSocket ─────────────────────────

Future<void> _handleWs(HttpRequest req) async {
  final user = req.uri.queryParameters['user']?.trim() ?? '';
  Future<void> reject(int status, String result, String reason) async {
    _attempt(user, result);
    _log('reject ws user="$user": $reason');
    req.response
      ..statusCode = status
      ..headers.contentType = ContentType('text', 'plain', charset: 'utf-8')
      ..write(reason);
    await req.response.close();
  }

  if (user.isEmpty) return reject(HttpStatus.badRequest, 'bad', '缺少 ?user=名字');
  if (!WebSocketTransformer.isUpgradeRequest(req)) return reject(HttpStatus.badRequest, 'bad', '不是 WebSocket 握手');
  final until = blockedUntil[user];
  if (until != null && DateTime.now().isBefore(until)) {
    return reject(HttpStatus.serviceUnavailable, 'blocked', '暫時拒絕連線（剩 ${until.difference(DateTime.now()).inSeconds + 1} 秒）');
  }
  final old = conns[user];
  if (old != null) {
    if (!old.zombie) return reject(HttpStatus.conflict, 'duplicate', '同名「$user」已在線');
    conns.remove(user);
    old.ws.close(WebSocketStatus.goingAway, 'replaced');
  }

  final ws = await WebSocketTransformer.upgrade(req);
  ws.pingInterval = const Duration(seconds: 5); // 協議層 ping：清掉 hot restart 留下的死線，與 App 心跳無關
  final conn = Conn(user, ws);
  conns[user] = conn;
  _attempt(user, 'ok');
  _log('+ $user (${conns.length} online)');
  if (!assigned.containsKey(user)) _assign([user], _privateRoom(user));
  ws.listen(
    (data) => _onData(conn, data),
    onDone: () {
      if (conns[user] == conn) conns.remove(user);
      _log('- $user (${conns.length} online)');
    },
    onError: (_) {},
  );
}

void _onData(Conn c, dynamic data) {
  if (c.zombie || data is! String) return;
  Object? decoded;
  try {
    decoded = jsonDecode(data);
  } catch (_) {}
  if (decoded is! Map<String, dynamic>) {
    _onSend(c, {'text': data}); // 第 1 堂：純字串
    return;
  }
  switch (decoded['type']) {
    case 'ping':
      _sendJson(c, {'type': 'pong'});
    case 'send' || 'message':
      _onSend(c, decoded);
    case 'read':
      final room = _roomFor(c, decoded['room_id']);
      final seq = decoded['seq'];
      if (room != null && seq is int) _setRead(room, c.user, seq);
    default:
      _error(c, '不認得的 type: ${decoded['type']}');
  }
}

Future<void> _onSend(Conn c, Map<String, dynamic> json) async {
  if (delayMs > 0) await Future<void>.delayed(Duration(milliseconds: delayMs));
  final text = (json['text'] ?? '').toString().trim();
  if (text.isEmpty) return;
  final roomId = json['room_id'];
  if (roomId is String && roomId.startsWith('dm:') && !rooms.containsKey(roomId)) {
    if (!_createDm(c, roomId)) return;
  }
  final room = _roomFor(c, roomId);
  if (room == null) return;

  var cid = json['client_msg_id'];
  if (cid is! String || cid.isEmpty) cid = 'srv-${++_autoId}';

  // 冪等：同一個 client_msg_id 重送 → 回同一筆，不重複存、不重複廣播
  final existing = byClientId[cid];
  if (existing != null) {
    _log('duplicate $cid → re-ack seq=${existing['seq']}');
    if (level == Level.ack) _sendJson(c, _ack(existing));
    if (level == Level.echo) _sendJson(c, {'type': 'message', ...existing});
    return;
  }

  final msg = _store(room, cid, c.user, text);
  final parts = text.split(RegExp(r'\s+'));
  final cmd = parts.first;
  final target = parts.length > 1 ? parts[1] : null;
  _deliver(
    room,
    msg,
    sender: c,
    skipSender: cmd == '/fail',
    senderDelay: cmd == '/delay' ? slowAck : Duration.zero,
  );
  if (cmd == '/fail') _log('/fail → stored ${room.id}#${msg['seq']} but receipt dropped');
  if (cmd == '/drop') _drop(_targets(c, target), by: c.user);
  if (cmd == '/zombie') _zombie(_targets(c, target));
}

/// 把訊息送給房間內所有在線成員；發送者依行為等級拿到「回音」或「ack」
void _deliver(Room room, Map<String, dynamic> msg,
    {Conn? sender, bool skipSender = false, Duration senderDelay = Duration.zero}) {
  for (final m in room.members) {
    final c = conns[m];
    if (c == null) continue;
    if (c != sender) {
      _sendMsg(c, msg);
      continue;
    }
    if (skipSender) continue;
    void receipt() => level == Level.ack ? _sendJson(c, _ack(msg)) : _sendMsg(c, msg);
    senderDelay == Duration.zero ? receipt() : Timer(senderDelay, receipt);
  }
}

List<String> _targets(Conn c, String? arg) {
  if (arg == null) return [c.user];
  if (c.user != admin) {
    _error(c, '指定對象只開放講師');
    return const [];
  }
  if (arg == '@all') return conns.keys.where((u) => u != c.user).toList();
  if (!conns.containsKey(arg)) {
    _error(c, '$arg 不在線');
    return const [];
  }
  return [arg];
}

void _drop(List<String> users, {required String by}) {
  if (users.isEmpty) return;
  _log('/drop by $by → $users');
  final now = DateTime.now();
  drops.add({'t': now.millisecondsSinceEpoch, 'by': by, 'users': users});
  if (drops.length > 10) drops.removeAt(0);
  final affected = <Room>{};
  for (final u in users) {
    blockedUntil[u] = now.add(dropRejectFor);
    final room = rooms[assigned[u]];
    if (room != null) affected.add(room);
    conns[u]?.ws.close(WebSocketStatus.goingAway, 'dropped');
  }
  Timer(botDelay, () {
    for (final room in affected) {
      for (final t in ['你剛剛斷線了吧？', '這三句是你斷線時我偷偷講的', '有自動補回來就代表 Delta Sync 成功 🎉']) {
        _deliver(room, _store(room, 'bot-${++_autoId}', '🤖 Bot', t));
      }
    }
  });
}

void _zombie(List<String> users) {
  for (final u in users) {
    conns[u]?.zombie = true;
  }
  if (users.isNotEmpty) _log('/zombie → $users');
}

void _reject(String user, int seconds) {
  blockedUntil[user] = DateTime.now().add(Duration(seconds: seconds));
  conns[user]?.ws.close(WebSocketStatus.goingAway, 'rejected');
  _log('reject $user for ${seconds}s');
}

// ───────────────────────── 房間 ─────────────────────────

Room _room(String id, String name, String kind) => rooms.putIfAbsent(id, () => Room(id, name, kind));

String _base(String user) => user.split('-').first; // Amy 與 Amy-2（第二台模擬器）同一間私人房

Room _privateRoom(String user) => _room('private:${_base(user)}', '${_base(user)} 的私人房', 'private');

/// 分房（私人房 / 兩兩一組 / 大廳）＝搬家：離開舊的分配房、加入新房（整批加完才推 room_added）
void _assign(Iterable<String> users, Room room) {
  for (final user in users) {
    final old = assigned[user];
    if (old != null && old != room.id) rooms[old]?.members.remove(user);
    assigned[user] = room.id;
  }
  _dirty = true;
  _addMembers(room, users);
}

/// 先全部加完再推 room_added，每個人拿到的成員名單才完整
void _addMembers(Room room, Iterable<String> users) {
  final added = users.where(room.members.add).toList();
  if (added.isEmpty) return;
  _dirty = true;
  for (final u in added) {
    final c = conns[u];
    if (c != null) _sendJson(c, {'type': 'room_added', 'room': _summary(room, u)});
  }
}

bool _createDm(Conn c, String id) {
  final p = id.split(':');
  if (p.length != 3 || p[1].isEmpty || p[1].compareTo(p[2]) >= 0 || !(p[1] == c.user || p[2] == c.user)) {
    _error(c, '私聊房 ID 要是 dm:A:B（名字排序、包含自己）');
    return false;
  }
  final room = _room(id, '${p[1]} & ${p[2]}', 'dm');
  _addMembers(room, [p[1], p[2]]);
  _log('dm created $id');
  return true;
}

Room? _roomFor(Conn c, Object? roomId) {
  final id = roomId is String ? roomId : assigned[c.user];
  final room = rooms[id];
  if (room == null) {
    _error(c, '房間 $id 不存在');
    return null;
  }
  if (!room.members.contains(c.user)) {
    _error(c, '你不在房間 $id');
    return null;
  }
  return room;
}

Map<String, dynamic> _store(Room room, String cid, String sender, String text) {
  final msg = <String, dynamic>{
    'room_id': room.id,
    'seq': room.lastSeq + 1,
    'client_msg_id': cid,
    'sender': sender,
    'text': text,
    'ts': DateTime.now().millisecondsSinceEpoch,
  };
  room.messages.add(msg);
  _dirty = true;
  byClientId[cid] = msg;
  return msg;
}

/// 水位線：學員回報只能前進；講師（force）可以設回去
void _setRead(Room room, String user, int seq, {bool force = false}) {
  seq = seq.clamp(0, room.lastSeq);
  final old = room.reads[user] ?? 0;
  if (!force && seq <= old) return;
  room.reads[user] = seq;
  _dirty = true;
  final ev = {'type': 'read', 'room_id': room.id, 'user': user, 'seq': seq};
  for (final m in room.members) {
    final c = conns[m];
    if (c != null) _sendJson(c, ev);
  }
}

Map<String, dynamic> _summary(Room r, String user) => {
      'id': r.id,
      'name': r.name,
      'kind': r.kind,
      'members': r.members.toList()..sort(),
      'last_seq': r.lastSeq,
      'last_message': r.messages.isEmpty ? null : r.messages.last,
      'last_read_seq': r.reads[user] ?? 0,
      'reads': r.reads,
    };

// ───────────────────────── REST ─────────────────────────

Future<void> _getRooms(HttpRequest req) async {
  final user = req.uri.queryParameters['user'];
  if (user == null || user.isEmpty) return _json(req, {'error': '缺少 ?user='}, status: 400);
  final mine = rooms.values.where((r) => r.members.contains(user)).map((r) => _summary(r, user)).toList();
  return _json(req, {'assigned_room_id': assigned[user], 'rooms': mine});
}

List<Map<String, dynamic>> _page(Room room, Map<String, String> q) {
  final limit = (int.tryParse(q['limit'] ?? '') ?? 50).clamp(1, 200);
  final before = int.tryParse(q['before_seq'] ?? '');
  final after = int.tryParse(q['after_seq'] ?? '');
  final around = int.tryParse(q['around_seq'] ?? '');
  final all = room.messages; // all[i].seq == i + 1，可以直接用 index 切
  int start, end; // [start, end) 的 index
  if (after != null) {
    start = after.clamp(0, all.length);
    end = (start + limit).clamp(0, all.length);
  } else if (around != null) {
    start = (around - 1 - limit ~/ 2).clamp(0, all.length);
    end = (start + limit).clamp(0, all.length);
  } else {
    end = (before == null ? all.length : before - 1).clamp(0, all.length);
    start = (end - limit).clamp(0, end);
  }
  return all.sublist(start, end);
}

// ───────────────────────── 講師儀表板 API ─────────────────────────

Map<String, dynamic> _adminState(String? selected) {
  final now = DateTime.now();
  final users = {...assigned.keys, ...conns.keys}.toList()..sort();
  return {
    'admin': admin,
    'port': serverPort,
    'ips': lanIps,
    'level': level.name,
    'delay_ms': delayMs,
    'users': [
      for (final u in users)
        {
          'name': u,
          'online': conns.containsKey(u),
          'zombie': conns[u]?.zombie ?? false,
          'blocked_s': blockedUntil[u] != null && now.isBefore(blockedUntil[u]!)
              ? blockedUntil[u]!.difference(now).inSeconds + 1
              : 0,
          'room': assigned[u],
        }
    ],
    'rooms': [
      for (final r in rooms.values)
        {
          'id': r.id,
          'name': r.name,
          'kind': r.kind,
          'members': r.members.toList()..sort(),
          'last_seq': r.lastSeq,
          'reads': r.reads,
        }
    ],
    'messages': rooms[selected] == null
        ? []
        : rooms[selected]!.messages.sublist((rooms[selected]!.lastSeq - 50).clamp(0, rooms[selected]!.lastSeq)),
    'timeline': [
      // 每一輪：從這次 /drop 到 40 秒後或下一次 /drop（不混到下一輪）
      for (var i = drops.length - 1; i >= 0 && i >= drops.length - 3; i--)
        {
          ...drops[i],
          'attempts': [
            for (final a in attempts)
              if ((drops[i]['users'] as List).contains(a['user']) &&
                  (a['t'] as int) >= (drops[i]['t'] as int) &&
                  (a['t'] as int) <= (drops[i]['t'] as int) + 40000 &&
                  (i == drops.length - 1 || (a['t'] as int) < (drops[i + 1]['t'] as int)))
                {'user': a['user'], 'dt': (a['t'] as int) - (drops[i]['t'] as int), 'result': a['result']}
          ]
        }
    ],
  };
}

Future<void> _adminAction(HttpRequest req) async {
  final body = jsonDecode(await utf8.decoder.bind(req).join()) as Map<String, dynamic>;
  final online = conns.keys.toList();
  List<String> who() => body['user'] == '@all' ? online : [body['user'] as String];
  Room room() => rooms[body['room']] ?? (throw StateError('unknown room ${body['room']}'));
  _log('admin: $body');
  switch (body['action']) {
    case 'level':
      level = Level.values.byName(body['level'] as String);
    case 'delay':
      delayMs = body['ms'] as int;
    case 'drop':
      _drop(who(), by: 'dashboard');
    case 'zombie':
      _zombie(who());
    case 'reject':
      _reject(body['user'] as String, body['seconds'] as int);
    case 'assign':
      switch (body['mode']) {
        case 'private':
          final byRoom = <Room, List<String>>{};
          for (final u in online) {
            byRoom.putIfAbsent(_privateRoom(u), () => []).add(u);
          }
          byRoom.forEach((r, users) => _assign(users, r));
        case 'lobby':
          final lobby = _room('lobby', '大廳', 'lobby');
          _assign(online, lobby);
        case 'pairs':
          // 以「人」為單位兩兩一組（Amy 與 Amy-2 算同一人）；奇數時最後一組 3 人
          final groups = <String, List<String>>{};
          for (final u in online) {
            groups.putIfAbsent(_base(u), () => []).add(u);
          }
          final bases = groups.keys.toList()..sort();
          for (var i = 0; i < bases.length; i += 2) {
            final take = (bases.length - i == 3) ? 3 : 2;
            final chunk = bases.sublist(i, (i + take).clamp(0, bases.length));
            final r = _room('pair:${chunk.join(':')}', chunk.join(' & '), 'pair');
            _assign([for (final b in chunk) ...groups[b]!], r);
            if (take == 3) break;
          }
      }
    case 'group':
      final r = _room('group:${++_groupId}', body['name'] as String, 'group');
      _addMembers(r, (body['users'] as List).cast<String>());
    case 'say':
      final r = room();
      _deliver(r, _store(r, 'admin-${++_autoId}', admin ?? '📢 講師', body['text'] as String));
    case 'flood':
      final r = room();
      for (var i = 1; i <= (body['n'] as int); i++) {
        _deliver(r, _store(r, 'flood-${++_autoId}', '🤖 Bot', '灌水訊息 #$i'));
      }
    case 'read':
      _setRead(room(), body['user'] as String, body['seq'] as int, force: true);
    case 'remove':
      final target = body['user'] as String;
      final list = target == '@offline'
          ? {...assigned.keys, ...conns.keys}.where((u) => !conns.containsKey(u)).toList()
          : [target];
      for (final u in list) {
        conns.remove(u)?.ws.close(WebSocketStatus.goingAway, 'removed');
        blockedUntil.remove(u);
        assigned.remove(u);
        for (final r in rooms.values) {
          r.members.remove(u);
          r.reads.remove(u);
        }
      }
      rooms.removeWhere((_, r) => r.kind == 'private' && r.members.isEmpty);
    default:
      return _json(req, {'error': 'unknown action'}, status: 400);
  }
  _dirty = true;
  return _json(req, {'ok': true});
}

// ───────────────────────── 存檔（--data=state.json）─────────────────────────
// 課程分好幾週上，Server 重啟後 seq 必須接續，否則學員本地 DB 會跟 Server 對不上。
// 每 2 秒若有變動就整份寫檔（先寫暫存檔再 rename，避免寫到一半當機留下壞檔）；Ctrl+C 時再存一次。
// 連線狀態（在線、zombie、拒絕中）不存：重啟後大家本來就要重連。

var _dirty = false;

void _startPersistence(File file) {
  if (file.existsSync()) {
    final j = jsonDecode(file.readAsStringSync()) as Map<String, dynamic>;
    level = Level.values.byName(j['level'] as String);
    delayMs = j['delay_ms'] as int;
    _autoId = j['auto_id'] as int;
    _groupId = j['group_id'] as int;
    assigned.addAll((j['assigned'] as Map).cast<String, String>());
    for (final r in (j['rooms'] as List).cast<Map<String, dynamic>>()) {
      final room = _room(r['id'] as String, r['name'] as String, r['kind'] as String);
      room.members.addAll((r['members'] as List).cast<String>());
      room.reads.addAll((r['reads'] as Map).cast<String, int>());
      for (final m in (r['messages'] as List).cast<Map<String, dynamic>>()) {
        room.messages.add(m);
        byClientId[m['client_msg_id'] as String] = m;
      }
    }
    _log('loaded ${file.path}: ${rooms.length} rooms, ${byClientId.length} messages');
  }
  void save() {
    if (!_dirty) return;
    _dirty = false;
    final tmp = File('${file.path}.tmp');
    tmp.writeAsStringSync(jsonEncode({
      'level': level.name,
      'delay_ms': delayMs,
      'auto_id': _autoId,
      'group_id': _groupId,
      'assigned': assigned,
      'rooms': [
        for (final r in rooms.values)
          {'id': r.id, 'name': r.name, 'kind': r.kind, 'members': r.members.toList(), 'reads': r.reads, 'messages': r.messages}
      ],
    }));
    tmp.renameSync(file.path);
  }

  Timer.periodic(const Duration(seconds: 2), (_) => save());
  ProcessSignal.sigint.watch().listen((_) {
    save();
    exit(0);
  });
}

// ───────────────────────── helpers ─────────────────────────

Map<String, dynamic> _ack(Map<String, dynamic> m) =>
    {'type': 'ack', 'room_id': m['room_id'], 'seq': m['seq'], 'client_msg_id': m['client_msg_id'], 'ts': m['ts']};

void _sendMsg(Conn c, Map<String, dynamic> msg) {
  if (c.zombie) return;
  c.ws.add(level == Level.raw ? msg['text'] as String : jsonEncode({'type': 'message', ...msg}));
}

/// 控制事件（pong / ack / read / room_added / error）：raw 等級的學員還不會解析 JSON，pong 以外都不送
void _sendJson(Conn c, Map<String, dynamic> json) {
  if (c.zombie) return;
  if (level == Level.raw && json['type'] != 'pong') return;
  c.ws.add(jsonEncode(json));
}

void _error(Conn c, String message) {
  _log('error → ${c.user}: $message');
  _sendJson(c, {'type': 'error', 'message': message});
}

void _attempt(String user, String result) {
  attempts.add({'user': user, 't': DateTime.now().millisecondsSinceEpoch, 'result': result});
  if (attempts.length > 3000) attempts.removeRange(0, 1000);
}

Future<void> _json(HttpRequest req, Object body, {int status = 200}) async {
  req.response
    ..statusCode = status
    ..headers.contentType = ContentType.json
    ..write(jsonEncode(body));
  await req.response.close();
}

void _log(String s) => stdout.writeln('[${DateTime.now().toIso8601String().substring(11, 19)}] $s');

// ───────────────────────── 儀表板頁面 ─────────────────────────

const _dashboardHtml = r'''<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>講師控制台 · Flutter 聊天室工作坊</title>
<style>
:root{
  --ground:#f6f6f4;--panel:#ffffff;--well:#efefe9;--ink:#16171a;--muted:#5c6068;
  --rule:#dcdcd6;--rule-soft:#ecece6;
  --cobalt:#1b4fd8;--cobalt-hover:#1640b0;--cobalt-tint:#edf2ff;--cobalt-ring:#bfd0ff;
  --fault:#c82333;--fault-tint:#fdf2f3;--fault-rule:#f3c4c9;
  --ok:#15803d;--ok-tint:#eefaf2;
  --warn:#a16207;--warn-tint:#fef9ec;
  --sans:-apple-system,BlinkMacSystemFont,"SF Pro Text","PingFang TC","Noto Sans TC",sans-serif;
  --mono:ui-monospace,"SF Mono",Menlo,Monaco,Consolas,monospace;
}
*{box-sizing:border-box}
html,body{height:100%}
body{
  margin:0;font:13.5px/1.5 var(--sans);background:var(--ground);color:var(--ink);
  -webkit-font-smoothing:antialiased;display:flex;flex-direction:column;
}
body.hide-hints .hint{display:none!important}
:focus-visible{outline:2px solid var(--cobalt);outline-offset:1px}
@media(prefers-reduced-motion:reduce){*{transition:none!important;animation:none!important}}

/* Top Console Bar */
header{
  display:flex;align-items:center;gap:14px;flex-wrap:wrap;
  padding:10px 18px;background:var(--panel);border-bottom:1px solid var(--rule);
  flex-shrink:0;
}
.title-block{display:flex;align-items:baseline;gap:10px;margin-right:auto}
.title-block h1{font-size:15px;font-weight:700;margin:0;letter-spacing:-.01em}
.title-block .adm{font-size:12.5px;color:var(--muted)}

.ctrl{display:flex;align-items:center;gap:6px}
.ctrl-label{font-size:12.5px;color:var(--muted);font-weight:500}
.seg{display:inline-flex;background:var(--well);padding:2px;border-radius:6px;border:1px solid var(--rule)}
.seg button{
  border:none;background:transparent;padding:4px 10px;border-radius:4px;
  font-size:12.5px;color:var(--muted);font-weight:600;white-space:nowrap;
}
.seg button:hover{color:var(--ink);background:transparent}
.seg button.sel{background:var(--ink);color:#fff}
.qbtn{
  width:20px;height:20px;padding:0;border-radius:50%;border:1px solid var(--rule);
  background:var(--well);color:var(--muted);font-size:11.5px;font-weight:700;
  display:inline-grid;place-items:center;cursor:pointer;flex-shrink:0;
}
.qbtn:hover{border-color:var(--cobalt);color:var(--cobalt);background:var(--cobalt-tint)}

/* Broadcast Connection Strip (The one bold anchor) */
.netbar{
  display:flex;align-items:center;gap:14px;flex-wrap:wrap;
  padding:9px 18px;background:var(--ink);color:#f4f4f2;border-bottom:1px solid #000;
  flex-shrink:0;
}
.netbar-label{font-size:12.5px;color:#a3a7b0;font-weight:500}
.ip-list{display:inline-flex;align-items:center;gap:6px;flex-wrap:wrap}
.ippill{
  display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:4px;
  background:#262930;border:1px solid #3c404a;color:#ffffff;
  font-family:var(--mono);font-size:13px;font-weight:600;cursor:pointer;
}
.ippill:hover{border-color:#7ea2ff}
.ippill.active{background:var(--cobalt);border-color:var(--cobalt);color:#fff}
.port-tag{font-family:var(--mono);font-size:12.5px;color:#a3a7b0}
.cmdbox{
  background:#0d0e11;border:1px solid #323640;color:#e5e7eb;
  font-family:var(--mono);font-size:12.5px;padding:4px 10px;border-radius:4px;
  cursor:pointer;user-select:all;max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;
}
.cmdbox:hover{border-color:#7ea2ff}
.netbar-actions{margin-left:auto;display:flex;gap:8px;align-items:center}
.btn-dark{
  background:transparent;color:#f4f4f2;border:1px solid #484d59;
  padding:4px 10px;border-radius:5px;font-size:12.5px;font-weight:500;cursor:pointer;
}
.btn-dark:hover{border-color:#fff;background:#262930}
.btn-dark.primary{background:var(--cobalt);border-color:var(--cobalt);color:#fff}
.btn-dark.primary:hover{background:var(--cobalt-hover)}

/* Lesson Preset Strip */
.lessons{background:var(--panel);border-bottom:1px solid var(--rule);flex-shrink:0}
.lessons-bar{
  display:flex;align-items:center;gap:8px;flex-wrap:wrap;
  padding:7px 18px;background:var(--ground);border-bottom:1px solid var(--rule-soft);
}
.lessons-title{font-size:12.5px;font-weight:600;color:var(--ink);margin-right:4px}
.ltabs{display:flex;gap:4px;flex-wrap:wrap}
.ltab{
  padding:3px 8px;border-radius:4px;border:1px solid transparent;background:transparent;
  font-size:12.5px;color:var(--muted);font-weight:500;cursor:pointer;
}
.ltab:hover{color:var(--ink);background:var(--well)}
.ltab.sel{background:var(--cobalt-tint);color:var(--cobalt);border-color:var(--cobalt-ring);font-weight:600}
.lessons-detail{
  display:grid;grid-template-columns:150px minmax(0,1.2fr) minmax(0,1fr);gap:18px;
  padding:10px 18px;font-size:13px;background:var(--panel);
}
.lessons-detail[hidden]{display:none}
.ld-col h4{margin:0 0 3px;font-size:12px;font-weight:600;color:var(--muted)}
.ld-col p{margin:0;color:var(--ink);max-width:74ch}
.ld-acts{display:flex;gap:5px;flex-wrap:wrap;margin-top:8px}

/* 3-Column Architectural Workbench */
.desk{
  flex:1;min-height:0;display:grid;
  grid-template-columns:minmax(320px,1.05fr) minmax(300px,0.95fr) minmax(340px,1.15fr);
  background:var(--ground);
}
.pane{
  display:flex;flex-direction:column;min-width:0;min-height:0;
  border-right:1px solid var(--rule);overflow-y:auto;
}
.pane:last-child{border-right:none;background:var(--panel)}

.block{padding:16px 18px;border-bottom:1px solid var(--rule)}
.block:last-child{border-bottom:none}
.block-head{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:8px}
.block-head h2{font-size:14px;font-weight:700;margin:0}
.block-sub{font-size:12.5px;color:var(--muted);font-variant-numeric:tabular-nums}

/* Contextual Hints (toggleable) */
.hint{
  font-size:12.5px;color:var(--muted);background:var(--well);
  padding:7px 10px;border-radius:5px;margin:0 0 10px;line-height:1.55;max-width:72ch;
}
.hint b{color:var(--ink);font-weight:600}
.hint code,.lessons-detail code{
  font-family:var(--mono);font-size:11.5px;background:rgba(22,23,26,.07);
  padding:1px 4px;border-radius:3px;color:var(--ink);
}

/* Base Controls */
button{
  font:inherit;font-size:12.5px;font-weight:500;padding:4px 10px;border-radius:5px;
  border:1px solid var(--rule);background:var(--panel);color:var(--ink);cursor:pointer;
}
button:hover{background:var(--well);border-color:#bdbdb6}
button.pri{background:var(--cobalt);border-color:var(--cobalt);color:#fff}
button.pri:hover{background:var(--cobalt-hover);border-color:var(--cobalt-hover)}
button.fault{color:var(--fault);border-color:var(--fault-rule);background:var(--panel)}
button.fault:hover{background:var(--fault-tint);border-color:var(--fault)}
button.xs{padding:2px 7px;font-size:12px}
input{
  font:inherit;font-size:13px;padding:4px 8px;border:1px solid var(--rule);
  border-radius:5px;background:var(--panel);color:var(--ink);
}
input:focus{border-color:var(--cobalt);outline:none;box-shadow:0 0 0 2px var(--cobalt-ring)}
input[type=number]{width:66px;font-variant-numeric:tabular-nums}

.row{display:flex;align-items:center;gap:6px;flex-wrap:wrap;margin:8px 0}
.mut{color:var(--muted)}

/* Status Summary & Dots */
.stats{display:flex;gap:12px;flex-wrap:wrap;font-size:12.5px;color:var(--muted);margin-bottom:8px;font-variant-numeric:tabular-nums}
.stats span{display:inline-flex;align-items:center;gap:5px}
.stats b{color:var(--ink)}
.dot{display:inline-block;width:7px;height:7px;border-radius:50%;background:#b8bcc4;flex-shrink:0}
.dot.on{background:var(--ok)}
.dot.zb{background:var(--warn)}
.dot.bl{background:var(--fault)}

/* Tables */
table{border-collapse:collapse;width:100%;font-size:13px}
th{font-size:12px;font-weight:600;color:var(--muted);padding:6px 6px;border-bottom:1px solid var(--rule);text-align:left}
td{padding:7px 6px;border-bottom:1px solid var(--rule-soft);vertical-align:middle}
tr:last-child td{border-bottom:none}
tbody tr:hover{background:rgba(22,23,26,.025)}
.acts{display:flex;gap:4px;flex-wrap:nowrap;justify-content:flex-end;white-space:nowrap}
.st-tag{display:inline-flex;align-items:center;gap:5px;font-size:12px;padding:1px 7px;border-radius:4px;font-weight:500;white-space:nowrap;font-variant-numeric:tabular-nums;min-width:74px}
.room-cell{font-family:var(--mono);font-size:12px;color:var(--muted);max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.st-tag.on{background:var(--ok-tint);color:var(--ok)}
.st-tag.zb{background:var(--warn-tint);color:var(--warn)}
.st-tag.bl{background:var(--fault-tint);color:var(--fault)}
.st-tag.off{background:var(--well);color:var(--muted)}

/* Group Member Picker */
.chips{display:flex;gap:5px;flex-wrap:wrap;margin-top:8px}
.chip{
  display:inline-flex;align-items:center;gap:5px;padding:3px 9px;border-radius:4px;
  border:1px solid var(--rule);background:var(--panel);font-size:12.5px;cursor:pointer;user-select:none;
}
.chip:has(input:checked){background:var(--cobalt-tint);border-color:var(--cobalt);color:var(--cobalt);font-weight:600}
.chip input{margin:0;accent-color:var(--cobalt)}

/* Room List */
.room-list{display:flex;flex-direction:column;border:1px solid var(--rule);border-radius:6px;background:var(--panel);overflow:hidden}
.room{
  padding:10px 12px;border-bottom:1px solid var(--rule-soft);cursor:pointer;
  display:flex;flex-direction:column;gap:4px;background:var(--panel);
}
.room:last-child{border-bottom:none}
.room:hover{background:var(--ground)}
.room.sel{background:var(--cobalt-tint);box-shadow:inset 3px 0 0 var(--cobalt)}
.room-top{display:flex;align-items:center;justify-content:space-between;gap:8px}
.room-name{font-weight:600;font-size:13.5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.room-seq{font-family:var(--mono);font-size:12px;color:var(--muted);flex-shrink:0}
.room-sub{display:flex;align-items:center;gap:8px;font-size:12px;color:var(--muted)}
.room-id{font-family:var(--mono)}
.kind{padding:0 5px;border-radius:3px;font-size:11.5px;font-weight:500;background:var(--well);color:var(--ink)}
.kind.pair{background:#e8effd;color:#1b4fd8}
.kind.lobby{background:#e7f6ec;color:#15803d}
.kind.group{background:#f3e8ff;color:#6b21a8}
.kind.dm{background:#fff1e6;color:#9a3412}
.room-members{display:flex;gap:8px;flex-wrap:wrap;font-size:12px;color:var(--ink);margin-top:2px}
.rm{display:inline-flex;align-items:center;gap:4px}

/* Right Pane: Room Inspector */
.empty-inspector{
  margin:auto;padding:36px 24px;text-align:center;color:var(--muted);max-width:34ch;
}
.empty-inspector h3{margin:0 0 6px;font-size:14.5px;color:var(--ink)}
.empty-inspector p{margin:0;font-size:13px}
.inspector-head{
  padding:14px 18px;border-bottom:1px solid var(--rule);background:var(--panel);
  display:flex;align-items:baseline;justify-content:space-between;gap:10px;flex-wrap:wrap;
}
.inspector-head h2{margin:0;font-size:15px;font-weight:700}
.inspector-head .meta{font-family:var(--mono);font-size:12px;color:var(--muted)}

.prog{height:5px;background:var(--well);border-radius:3px;overflow:hidden;margin-top:4px;width:110px}
.prog>i{display:block;height:100%;background:var(--cobalt)}

.msgs{
  max-height:320px;overflow-y:auto;border:1px solid var(--rule);border-radius:5px;
  background:var(--ground);padding:6px 10px;font-size:13px;
}
.msg-item{padding:4px 0;border-bottom:1px solid var(--rule-soft);display:flex;gap:8px;align-items:baseline}
.msg-item:last-child{border-bottom:none}
.seq{color:var(--muted);font-family:var(--mono);font-size:12px;min-width:42px;flex-shrink:0}
.sender{font-weight:600;color:var(--cobalt);white-space:nowrap}
.msg-text{word-break:break-word}

/* Projection Overlay (Student-facing only) */
.modal{position:fixed;inset:0;background:#0d0e11;color:#fff;display:grid;place-items:center;z-index:50;padding:28px}
.modal[hidden]{display:none}
.modal-card{max-width:920px;width:100%;text-align:left}
.modal-kicker{font-size:16px;color:#9ca3af;margin-bottom:10px}
.modal-ip{font-family:var(--mono);font-size:clamp(42px,8vw,88px);font-weight:700;color:#fff;letter-spacing:-.02em;line-height:1.1;margin:0 0 24px}
.modal-ip span{color:#7ea2ff}
.modal-cmd{
  background:#181a20;border:1px solid #323640;border-radius:8px;padding:18px 22px;
  font-family:var(--mono);font-size:clamp(16px,2.2vw,24px);color:#f9fafb;
  margin:0 0 18px;word-break:break-all;cursor:pointer;
}
.modal-note{color:#9ca3af;font-size:15px;margin:0 0 28px}
.modal-note code{font-family:var(--mono);color:#fff;background:#262930;padding:2px 6px;border-radius:4px}

/* Help Reference Modal */
.help-modal{position:fixed;inset:0;background:rgba(22,23,26,.45);display:grid;place-items:center;z-index:55;padding:24px}
.help-modal[hidden]{display:none}
.help-card{
  background:var(--panel);color:var(--ink);border:1px solid var(--rule);border-radius:8px;
  max-width:860px;width:100%;max-height:86vh;display:flex;flex-direction:column;
  box-shadow:0 20px 50px rgba(22,23,26,.22);overflow:hidden;
}
.help-head{
  display:flex;align-items:center;justify-content:space-between;padding:12px 18px;
  border-bottom:1px solid var(--rule);background:var(--ground);flex-shrink:0;
}
.help-head h2{margin:0;font-size:15px;font-weight:700}
.help-body{padding:16px 20px;overflow-y:auto;display:flex;flex-direction:column;gap:18px}
.help-sec h3{margin:0 0 8px;font-size:13.5px;font-weight:700;color:var(--ink)}
.lv-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px}
.lv-box{border:1px solid var(--rule);border-radius:6px;padding:10px 12px;background:var(--ground)}
.lv-box h4{margin:0 0 4px;font-size:13px;font-weight:700}
.lv-box .sub{font-size:12px;color:var(--cobalt);font-weight:600;margin-bottom:6px}
.lv-box p{margin:0;font-size:12.5px;color:var(--muted);line-height:1.55}
.help-list{margin:0;padding-left:18px;font-size:13px;color:var(--muted);line-height:1.65}
.help-list b{color:var(--ink)}
.help-list code,.lv-box code{font-family:var(--mono);font-size:11.5px;background:rgba(22,23,26,.07);padding:1px 4px;border-radius:3px;color:var(--ink)}
@media(max-width:760px){.lv-grid{grid-template-columns:1fr}}

.toast{
  position:fixed;bottom:18px;right:18px;background:var(--ink);color:#fff;
  padding:8px 14px;border-radius:6px;font-size:13px;font-weight:500;
  opacity:0;pointer-events:none;z-index:60;transition:opacity .15s;
}
.toast.show{opacity:1}

/* Floating WS Test Window */
.ws-float{
  position:fixed;right:20px;bottom:20px;width:480px;height:560px;
  min-width:340px;min-height:360px;max-width:calc(100vw - 24px);max-height:calc(100vh - 64px);
  background:var(--panel);border:1px solid var(--ink);border-radius:8px;
  box-shadow:0 16px 40px rgba(22,23,26,.22);z-index:45;
  display:flex;flex-direction:column;overflow:hidden;resize:both;
}
.ws-float[hidden]{display:none}
.ws-float.min{height:auto!important;min-height:0;width:340px;resize:none}
.ws-float.min .wsf-body{display:none}
.wsf-head{
  display:flex;align-items:center;gap:8px;padding:8px 12px;
  background:var(--ink);color:#fff;cursor:move;user-select:none;flex-shrink:0;
}
.wsf-title{font-size:13px;font-weight:600;margin-right:auto;display:inline-flex;align-items:center;gap:7px}
.wsf-st{font-size:11.5px;padding:1px 7px;border-radius:4px;background:#262930;color:#a3a7b0;font-weight:500}
.wsf-st.on{background:#123822;color:#6ee7b7}
.wsf-st.ing{background:#3d2c0b;color:#fcd34d}
.wsf-st.err{background:#3f1218;color:#fda4af}
.wsf-hbtn{background:transparent;border:1px solid #3c404a;color:#d1d5db;font-size:11.5px;padding:2px 7px;border-radius:4px;cursor:pointer}
.wsf-hbtn:hover{border-color:#fff;color:#fff;background:#262930}
.wsf-body{flex:1;min-height:0;display:flex;flex-direction:column;background:var(--ground)}
.wsf-conn{display:flex;gap:6px;padding:8px 10px;background:var(--panel);border-bottom:1px solid var(--rule);flex-shrink:0}
.wsf-conn input{flex:1;min-width:0;font-family:var(--mono);font-size:12px}
.wsf-send{padding:8px 10px;background:var(--panel);border-bottom:1px solid var(--rule);flex-shrink:0}
.wsf-tpls{display:flex;gap:4px;flex-wrap:wrap;margin-bottom:6px}
.wsf-send textarea{
  width:100%;height:74px;resize:vertical;font-family:var(--mono);font-size:12px;line-height:1.45;
  padding:6px 8px;border:1px solid var(--rule);border-radius:5px;background:var(--ground);color:var(--ink);
}
.wsf-send textarea:focus{border-color:var(--cobalt);outline:none;background:var(--panel)}
.wsf-srow{display:flex;align-items:center;gap:8px;margin-top:6px;flex-wrap:wrap}
.wsf-logs{flex:1;min-height:0;overflow-y:auto;padding:8px 10px;font-family:var(--mono);font-size:12px}
.wsf-entry{padding:6px 0;border-bottom:1px solid var(--rule-soft)}
.wsf-entry:last-child{border-bottom:none}
.wsf-emeta{display:flex;align-items:center;gap:6px;margin-bottom:3px;font-size:11px;color:var(--muted)}
.wsf-dir{font-family:var(--sans);font-weight:600;padding:0 5px;border-radius:3px;font-size:11px}
.wsf-dir.tx{background:var(--cobalt-tint);color:var(--cobalt)}
.wsf-dir.rx{background:var(--ok-tint);color:var(--ok)}
.wsf-dir.sys{background:var(--well);color:var(--muted)}
.wsf-dir.err{background:var(--fault-tint);color:var(--fault)}
.wsf-pre{margin:0;white-space:pre-wrap;word-break:break-word;font-family:var(--mono);font-size:12px;line-height:1.4;color:var(--ink)}

@media(max-width:1180px){
  .desk{grid-template-columns:1fr 1fr;height:auto}
  .pane{overflow:visible;border-bottom:1px solid var(--rule)}
  .pane:last-child{grid-column:1 / -1;border-right:none}
}
@media(max-width:760px){
  .desk{grid-template-columns:1fr}
  .pane{border-right:none}
  .lessons-detail{grid-template-columns:1fr;gap:10px}
}
</style></head><body>

<header>
  <div class="title-block">
    <h1>Flutter 聊天室工作坊控制台</h1>
    <span class="adm" id="adm">講師帳號：載入中</span>
  </div>

  <div class="ctrl">
    <span class="ctrl-label">行為等級</span>
    <button class="qbtn" onclick="$('helpModal').hidden=false" title="查看「純字串 / 回音 / ACK」差別說明">?</button>
    <div class="seg">
      <button data-lv="raw" title="第 1 堂前半：收到純文字就廣播純文字（不包 JSON、不回 ACK）">純字串</button>
      <button data-lv="echo" title="第 1～3 堂：把訊息包成 JSON 廣播給所有人含自己（不回 ACK）">回音 (L1–3)</button>
      <button data-lv="ack" title="第 4 堂起：message 只廣播給其他人，發送者改收 ACK">ACK (L4+)</button>
    </div>
  </div>

  <div class="ctrl" title="Server 收到訊息後延遲處理，示範第 3 堂結尾與第 4 堂樂觀更新">
    <span class="ctrl-label">全域延遲</span>
    <input id="delay" type="number" min="0" step="500">
    <span class="mut" style="font-size:12px">ms</span>
    <button onclick="act({action:'delay',ms:+$('delay').value||0})">套用</button>
    <button onclick="$('delay').value=2000;act({action:'delay',ms:2000})">設為 2 秒</button>
    <button onclick="$('delay').value=0;act({action:'delay',ms:0})">歸零</button>
  </div>

  <button onclick="$('helpModal').hidden=false">操作說明</button>
</header>

<div class="netbar">
  <span class="netbar-label">區網位址</span>
  <span class="ip-list" id="ips">偵測中</span>
  <span class="netbar-label">WS 網址</span>
  <span class="cmdbox" id="wsurl" onclick="copyText(this.textContent,'已複製 WS 連線網址')" title="點擊複製 WebSocket 連線網址">ws://localhost:8080/ws?user=名字</span>
  <span class="netbar-label">啟動指令</span>
  <span class="cmdbox" id="runcmd" onclick="copyText(this.textContent,'已複製啟動指令')" title="點擊複製學員啟動指令">flutter run --dart-define=USER=名字 --dart-define=HOST=localhost</span>
  <div class="netbar-actions">
    <button class="btn-dark" onclick="copyText($('wsurl').textContent,'已複製 WS 連線網址')">複製 WS</button>
    <button class="btn-dark" onclick="toggleWsFloat()">WS 測試視窗</button>
    <button class="btn-dark primary" onclick="openProj()">投影給同學</button>
  </div>
</div>

<div class="lessons">
  <div class="lessons-bar">
    <span class="lessons-title">逐堂小抄</span>
    <div class="ltabs" id="ltabs"></div>
    <button class="xs" style="margin-left:auto" id="cheatToggle" onclick="toggleCheat()">收合</button>
  </div>
  <div class="lessons-detail" id="cheatBody"></div>
</div>

<div class="desk">
  <!-- 左欄：學員連線、搞破壞、重連時間軸 -->
  <div class="pane">
    <div class="block">
      <div class="block-head">
        <h2>學員連線與故障演練</h2>
        <span class="block-sub" id="userCount">0 人</span>
      </div>
      <div class="stats" id="kpis"></div>
      <div class="row">
        <button class="fault" onclick="act({action:'drop',user:'@all'})" title="斷線並拒連 5 秒，2 秒後機器人偷發 3 句">全部踢斷 5 秒</button>
        <button class="fault" onclick="act({action:'zombie',user:'@all'})" title="不斷線但 Server 不回封包（測心跳逾時）">全部設為假死</button>
        <button onclick="act({action:'remove',user:'@offline'})" title="清除所有已離線的測試帳號與空私人房">清除離線</button>
        <span class="mut" style="font-size:12.5px;margin-left:auto">拒絕秒數</span>
        <input id="rejs" type="number" value="30" min="1" style="width:58px">
      </div>
      <table>
        <thead><tr><th>學員</th><th>狀態</th><th>分配房間</th><th style="text-align:right">動作</th></tr></thead>
        <tbody id="users"></tbody>
      </table>
    </div>

    <div class="block">
      <div class="block-head">
        <h2>重連時間軸</h2>
        <span class="block-sub">最近 3 次踢斷（0–40 秒）</span>
      </div>
      <div id="tl" class="mut" style="font-size:12.5px">尚未觸發踢斷。按上方「全部踢斷 5 秒」即可對比有無 Jitter。</div>
    </div>
  </div>

  <!-- 中欄：分房、拉群、房間列表 -->
  <div class="pane">
    <div class="block">
      <div class="block-head">
        <h2>分房模式</h2>
        <span class="block-sub">L5–7 請固定「兩兩一組」</span>
      </div>
      <div class="row">
        <button onclick="act({action:'assign',mode:'private'})">各自私人房</button>
        <button onclick="act({action:'assign',mode:'pairs'})">兩兩一組 (L5–7)</button>
        <button onclick="act({action:'assign',mode:'lobby'})">全班大廳</button>
      </div>
    </div>

    <div class="block">
      <div class="block-head">
        <h2>建立自訂群組</h2>
        <span class="block-sub">L8 推送 room_added</span>
      </div>
      <div class="row">
        <input id="gname" placeholder="群組名稱" value="活動群" style="flex:1;min-width:110px">
        <button class="pri" onclick="mkGroup()">建立並拉人</button>
        <button onclick="toggleAllGroup()">全選</button>
      </div>
      <div class="chips" id="gusers"></div>
    </div>

    <div class="block" style="flex:1">
      <div class="block-head">
        <h2>房間列表</h2>
        <div class="row" style="margin:0">
          <span class="block-sub" id="roomCount">0 間</span>
          <button class="xs" onclick="floodPairs(300)" title="第 6 堂課前：替所有兩人組房間各灌 300 則">兩人房各灌 300 則</button>
        </div>
      </div>
      <div id="rooms"></div>
    </div>
  </div>

  <!-- 右欄：房間監看與操作 -->
  <div class="pane" id="rightPane">
    <div class="empty-inspector" id="emptyDetail">
      <h3>選取一間房間開始操作</h3>
      <p>點選中間任一房間後，即可在這裡以講師身分發言、灌入測試訊息、檢視最近 50 則對話，或調整學員的已讀水位線。</p>
    </div>

    <div id="detail" hidden>
      <div class="inspector-head">
        <h2 id="dtitle"></h2>
        <span class="meta" id="dmeta"></span>
      </div>

      <div class="block">
        <div class="block-head"><h2>發言與灌入測試訊息</h2></div>
        <div class="row">
          <input id="say" placeholder="以講師身分發言（按 Enter 送出）" style="flex:1" onkeydown="if(event.key==='Enter')say()">
          <button class="pri" onclick="say()">送出</button>
        </div>
        <div class="row">
          <span class="mut" style="font-size:12.5px">灌入</span>
          <input id="floodn" type="number" value="300" min="1">
          <button onclick="act({action:'flood',room:sel,n:+$('floodn').value})">灌訊息</button>
          <button class="xs" onclick="$('floodn').value=50;act({action:'flood',room:sel,n:50})">+50</button>
          <button class="xs" onclick="$('floodn').value=300;act({action:'flood',room:sel,n:300})">+300</button>
          <button class="xs" onclick="$('floodn').value=1000;act({action:'flood',room:sel,n:1000})">+1000</button>
        </div>
      </div>

      <div class="block">
        <div class="block-head">
          <h2>已讀水位線</h2>
          <span class="block-sub">L9 強制調整測試用</span>
        </div>
        <table>
          <thead><tr><th>成員</th><th>目前進度</th><th style="text-align:right">強制設定</th></tr></thead>
          <tbody id="reads"></tbody>
        </table>
      </div>

      <div class="block">
        <div class="block-head"><h2>最近 50 則訊息</h2></div>
        <div class="msgs" id="msgs"></div>
      </div>
    </div>
  </div>
</div>

<div class="modal" id="projModal" hidden onclick="if(event.target===this)this.hidden=true">
  <div class="modal-card">
    <div class="modal-kicker">Flutter 聊天室工作坊 — 學員連線資訊</div>
    <div class="modal-ip" id="projIp">localhost<span>:8080</span></div>
    <div class="modal-kicker" style="font-size:13.5px;margin-bottom:6px">WebSocket 連線網址</div>
    <div class="modal-cmd" id="projWs" onclick="copyText(this.textContent,'已複製 WS 連線網址')"></div>
    <div class="modal-kicker" style="font-size:13.5px;margin-bottom:6px">Flutter 啟動指令</div>
    <div class="modal-cmd" id="projCmd" onclick="copyText(this.textContent,'已複製啟動指令')"></div>
    <div class="modal-note">請連上教室同一個 Wi-Fi 區網。同一位學員開第二台模擬器請命名為 <code>名字-2</code>。</div>
    <button class="btn-dark primary" style="padding:8px 18px;font-size:14px" onclick="$('projModal').hidden=true">關閉投影畫面 (Esc)</button>
  </div>
</div>

<div class="ws-float" id="wsFloat" hidden>
  <div class="wsf-head" id="wsfHead">
    <span class="wsf-title">WS 連線測試 <span class="wsf-st" id="wsfSt">未連線</span></span>
    <button class="wsf-hbtn" onclick="openWsTestTab()" title="另開獨立分頁（可開多視窗模擬多人）">新分頁</button>
    <button class="wsf-hbtn" id="wsfMinBtn" onclick="minWsFloat()">縮小</button>
    <button class="wsf-hbtn" onclick="$('wsFloat').hidden=true">關閉</button>
  </div>
  <div class="wsf-body">
    <div class="wsf-conn">
      <input id="wsfUrl" placeholder="ws://localhost:8080/ws?user=Web-1" onkeydown="if(event.key==='Enter')wsfToggleConn()">
      <button class="pri xs" id="wsfConnBtn" onclick="wsfToggleConn()">連線</button>
    </div>
    <div class="wsf-send">
      <div class="wsf-tpls">
        <button class="xs" onclick="wsfFill('raw')">純文字</button>
        <button class="xs" onclick="wsfFill('send')">JSON send</button>
        <button class="xs" onclick="wsfFill('ping')">ping</button>
        <button class="xs" onclick="wsfFill('read')">read</button>
        <button class="xs" onclick="wsfFill('/delay')">/delay</button>
        <button class="xs" onclick="wsfFill('/fail')">/fail</button>
        <button class="xs" onclick="wsfFill('/drop')">/drop</button>
        <button class="xs" onclick="wsfFill('/zombie')">/zombie</button>
      </div>
      <textarea id="wsfMsg" placeholder="輸入純文字或 JSON（Ctrl / Cmd + Enter 送出）"></textarea>
      <div class="wsf-srow">
        <button class="pri xs" onclick="wsfSend()">送出</button>
        <span class="mut" id="wsfHint" style="font-size:11.5px">請先按「連線」</span>
        <label style="font-size:11.5px;color:var(--muted);display:inline-flex;align-items:center;gap:4px;margin-left:auto;cursor:pointer">
          <input type="checkbox" id="wsfPretty" checked onchange="wsfRenderLogs()"> 排版 JSON
        </label>
        <button class="xs" onclick="wsfLogs=[];wsfRenderLogs()">清空</button>
      </div>
    </div>
    <div class="wsf-logs" id="wsfLogs">
      <div class="mut" style="font-family:var(--sans);padding:12px 2px">貼上或確認上方 WS 網址後按「連線」，收到的訊息會即時顯示在這裡。</div>
    </div>
  </div>
</div>

<div class="help-modal" id="helpModal" hidden onclick="if(event.target===this)this.hidden=true">
  <div class="help-card">
    <div class="help-head">
      <h2>控制台操作說明與名詞對照</h2>
      <button class="xs" onclick="$('helpModal').hidden=true">關閉 (Esc)</button>
    </div>
    <div class="help-body">
      <div class="help-sec">
        <h3>1. 三種行為等級差在哪？</h3>
        <div class="lv-grid">
          <div class="lv-box">
            <h4>純字串 (raw)</h4>
            <div class="sub">第 1 堂前半</div>
            <p>收到什麼純文字，就原封不動廣播給房間所有人（含發送者）。<b>不包 JSON、不推 room_added、不回 ACK。</b></p>
          </div>
          <div class="lv-box">
            <h4>回音 (echo)</h4>
            <div class="sub">第 1～3 堂</div>
            <p>把訊息包成 JSON <code>message</code> 廣播給所有人（<b>包含發送者自己</b>），<b>不回 ACK</b>。用來練 JSON 解析，並在 L3 設延遲時讓學員體會「等自己回音很卡」。</p>
          </div>
          <div class="lv-box">
            <h4>ACK (ack)</h4>
            <div class="sub">第 4 堂起</div>
            <p><code>message</code> <b>只廣播給其他人</b>，發送者改收到 <code>ack</code>（拿 <code>seq</code>）。搭配前端樂觀更新秒上屏與 <code>client_msg_id</code> 冪等去重。</p>
          </div>
        </div>
      </div>

      <div class="help-sec">
        <h3>2. 故障演練按鈕與聊天室指令</h3>
        <ul class="help-list">
          <li><b>踢斷 5 秒 (/drop)</b>：踢斷連線並在 5 秒內拒絕重連（回 <code>503</code>），2 秒後機器人會在該房偷發 3 句。用來測 L2 重連時間軸（有無 Jitter 對比）與 L7 斷線補洞。</li>
          <li><b>假死 (/zombie)</b>：不斷開 TCP，但 Server 裝死不回任何封包（含 <code>pong</code>），用來測 L2 Heartbeat 心跳逾時是否會主動斷線重連。</li>
          <li><b>拒絕連線</b>：踢斷並在指定秒數內拒絕重連，模擬進電梯／長期離線（L5 離線秒開、L6/L7 補洞與 Outbox 補送）。</li>
          <li><b>聊天室指令</b>：學員輸入 <code>/delay</code>（3 秒後才回 ACK）、<code>/fail</code>（照存照廣播但不回 ACK，測冪等）、<code>/drop</code>、<code>/zombie</code>。講師登入同名 App 可加對象如 <code>/drop Amy</code> 或 <code>/zombie @all</code>。</li>
        </ul>
      </div>

      <div class="help-sec">
        <h3>3. 分房模式與已讀水位線</h3>
        <ul class="help-list">
          <li><b>各自私人房 / 兩兩一組 / 全班大廳</b>：只搬動目前「在線」學員；L1–L7 未帶 <code>room_id</code> 的訊息會送到這裡分配的房間。<code>Amy</code> 與 <code>Amy-2</code> 會自動分進同一房。</li>
          <li><b>⚠️ 第 5～7 堂不要換房</b>：此時學員本地 DB 尚未加入 <code>room_id</code>，請固定在「兩兩一組」。</li>
          <li><b>自訂群組 (L8)</b>：勾選學員建立 <code>group:N</code>，即時推送 <code>room_added</code> 且不離開原分配房。</li>
          <li><b>已讀水位線 (L9)</b>：學員端只能往前推；點選房間後可在右側強制將某人的已讀設回 <code>0</code> 或 <code>50</code>，立即推送 <code>read</code> 事件重測未讀紅點與進房定位。</li>
        </ul>
      </div>
    </div>
  </div>
</div>

<div class="toast" id="toast"></div>

<script>
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let sel=null, st=null, picked=new Set(), curIp='localhost', activeLesson=1, cheatOpen=false;

const LESSONS=[
  {n:1,t:'接通收發',lv:'純字串 → 回音',
    op:'開場切「純字串」並按「各自私人房」。學員改送 JSON 後切「回音」，最後切「全班大廳」互傳。',
    hook:'對一位學員按「假死」，讓大家看到連線正常卻收不到訊息，引出第 2 堂心跳。',
    acts:[
      {label:'① 課前：純字串 + 私人房',pri:1,fn:"runPreset([{action:'level',level:'raw'},{action:'delay',ms:0},{action:'assign',mode:'private'}],'已切到純字串並分私人房')"},
      {label:'② 切到回音',fn:"act({action:'level',level:'echo'})"},
      {label:'③ 切全班大廳',fn:"act({action:'assign',mode:'lobby'})"},
      {label:'開 WS 測試視窗',fn:"toggleWsFloat()"}
    ]},
  {n:2,t:'心跳重連',lv:'回音 (L1–3)',
    op:'學員自行輸入 <code>/zombie</code> 測 15 秒內自動重連。接著按「全部踢斷 5 秒」，用時間軸對比有無 Jitter。',
    hook:'趁斷線 5 秒在大廳發言，連回後漏掉訊息，留伏筆到第 7 堂補洞。',
    acts:[
      {label:'課前：切到回音',pri:1,fn:"runPreset([{action:'level',level:'echo'},{action:'delay',ms:0}],'已切到回音模式')"},
      {label:'全部踢斷 5 秒 (/drop @all)',danger:1,fn:"act({action:'drop',user:'@all'})"},
      {label:'全部設為假死 (/zombie @all)',danger:1,fn:"act({action:'zombie',user:'@all'})"}
    ]},
  {n:3,t:'反轉列表',lv:'回音 (L1–3)',
    op:'選取房間按「+1000」灌入訊息，測試反轉列表順暢度與「有新訊息」提示。',
    hook:'上方全域延遲按「設為 2 秒」，感受送出卡頓，引出第 4 堂樂觀更新。',
    acts:[
      {label:'課前：切到回音',pri:1,fn:"act({action:'level',level:'echo'})"},
      {label:'選取房灌 +1000 則',fn:"floodSelected(1000)"},
      {label:'結尾鉤子：設延遲 2 秒',fn:"$('delay').value=2000;act({action:'delay',ms:2000});toast('全域延遲已設為 2000ms')"}
    ]},
  {n:4,t:'ACK 冪等',lv:'ACK (L4+)',
    op:'開場切「ACK」，先保留 2 秒延遲示範秒上屏再按「歸零」。學員用 <code>/delay</code>、<code>/fail</code> 測重試去重。',
    hook:'請學員殺掉 App 重開，對話全部清空，引出第 5 堂本地 DB。',
    acts:[
      {label:'① 開場：切 ACK + 維持 2s 延遲',pri:1,fn:"$('delay').value=2000;runPreset([{action:'level',level:'ack'},{action:'delay',ms:2000}],'已切到 ACK（延遲 2 秒）')"},
      {label:'② 示範完：延遲歸零',fn:"$('delay').value=0;act({action:'delay',ms:0});toast('延遲已歸零')"}
    ]},
  {n:5,t:'本地 DB',lv:'ACK (L4+)',
    op:'課前按「兩兩一組」，第 5～7 堂固定不換房。驗收時對學員按「拒絕」30 秒，重開 App 確認離線秒開。',
    hook:'刪掉 App 重裝模擬換新手機，畫面變空白，引出第 6 堂歷史分頁。',
    acts:[
      {label:'課前：切 ACK + 兩兩一組',pri:1,fn:"runPreset([{action:'level',level:'ack'},{action:'delay',ms:0},{action:'assign',mode:'pairs'}],'已切到 ACK 並兩兩分組')"}
    ]},
  {n:6,t:'歷史分頁',lv:'ACK (L4+)',
    op:'課前按「兩人房各灌 300 則」。學員重裝進房應載入最新 50 則，往上滑無縫載入更舊訊息。',
    hook:'對某學員按「拒絕」30 秒，請夥伴傳 3 句，解封後漏訊，引出第 7 堂補洞。',
    acts:[
      {label:'課前：兩人房各灌 300 則',pri:1,fn:"floodPairs(300)"}
    ]},
  {n:7,t:'補洞補送',lv:'ACK (L4+)',
    op:'學員輸入 <code>/drop</code> 驗證自動補回機器人 3 句；再「拒絕」30 秒期間送 3 則，解封後自動依序補送。',
    hook:'建立自訂群組拉 3 人，學員還沒有房間列表看不到，引出第 8 堂。',
    acts:[
      {label:'確認切到 ACK',pri:1,fn:"act({action:'level',level:'ack'})"},
      {label:'全部踢斷 5 秒 (/drop @all)',danger:1,fn:"act({action:'drop',user:'@all'})"}
    ]},
  {n:8,t:'房間列表',lv:'ACK (L4+)',
    op:'解除換房限制。勾選學員按「建立並拉人」，確認列表即時跳出新群組；學員間互開私聊。',
    hook:'提問「怎麼知道對方讀了沒」，引出第 9 堂已讀水位線。',
    acts:[
      {label:'確認切到 ACK',pri:1,fn:"act({action:'level',level:'ack'})"},
      {label:'全選在線學員（準備拉群）',fn:"toggleAllGroup()"}
    ]},
  {n:9,t:'已讀未讀',lv:'ACK (L4+)',
    op:'點選房間觀察水位線隨捲動前進。將學員水位線設回 50 再按「+300」，驗證未讀 300 與進房定位。',
    hook:'全部功能完成，進入第 10 堂系統設計研討會。',
    acts:[
      {label:'選取房灌 +300 則',pri:1,fn:"floodSelected(300)"},
      {label:'選取房全員已讀歸零',fn:"resetSelectedReads(0)"}
    ]}
];

async function runPreset(actions,msg){
  for(const a of actions){await fetch('/admin/action',{method:'POST',body:JSON.stringify(a)});}
  toast(msg);tick();
}
function floodSelected(n){
  if(!sel)return toast('請先在中間「房間列表」點選一間房間');
  act({action:'flood',room:sel,n});toast(`已對 ${sel} 灌入 ${n} 則訊息`);
}
async function resetSelectedReads(seq){
  const room=st?.rooms?.find(r=>r.id===sel);
  if(!room)return toast('請先在中間「房間列表」點選一間房間');
  for(const m of room.members){await fetch('/admin/action',{method:'POST',body:JSON.stringify({action:'read',room:sel,user:m,seq})});}
  toast(`已將 ${room.name} 全員已讀設為 ${seq}`);tick();
}

function renderCheat(){
  $('ltabs').innerHTML=LESSONS.map(l=>`<button class="ltab ${l.n===activeLesson?'sel':''}" onclick="pickLesson(${l.n})">L${l.n} ${l.t}</button>`).join('');
  const l=LESSONS.find(x=>x.n===activeLesson);
  $('cheatBody').hidden=!cheatOpen;
  $('cheatToggle').textContent=cheatOpen?'收合':'展開';
  const btns=(l.acts||[]).map(a=>`<button class="xs ${a.pri?'pri':a.danger?'fault':''}" onclick="${a.fn}">${a.label}</button>`).join('');
  $('cheatBody').innerHTML=`
    <div class="ld-col"><h4>建議等級</h4><p><span class="kind lobby">${l.lv}</span></p></div>
    <div class="ld-col"><h4>課前與課中操作</h4><p>${l.op}</p><div class="ld-acts">${btns}</div></div>
    <div class="ld-col"><h4>結尾鉤子</h4><p>${l.hook}</p></div>`;
}
function pickLesson(n){
  if(activeLesson===n&&cheatOpen){cheatOpen=false;}
  else{activeLesson=n;cheatOpen=true;}
  renderCheat();
}
function toggleCheat(){cheatOpen=!cheatOpen;renderCheat();}
function toast(msg){const el=$('toast');el.textContent=msg;el.classList.add('show');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('show'),1700);}
function copyText(text,msg){navigator.clipboard?.writeText(text);toast(msg||('已複製：'+text));}
function syncConnText(){
  const port=st?.port||8080;
  $('wsurl').textContent=`ws://${curIp}:${port}/ws?user=名字`;
  $('runcmd').textContent=`flutter run --dart-define=USER=名字 --dart-define=HOST=${curIp}`;
}
function setIp(ip){
  curIp=ip;
  syncConnText();
  copyText(ip,`已複製 IP：${ip}`);
  tick();
}
function openProj(){
  const port=st?.port||8080;
  $('projIp').innerHTML=`${esc(curIp)}<span>:${esc(port)}</span>`;
  $('projWs').textContent=$('wsurl').textContent;
  $('projCmd').textContent=$('runcmd').textContent;
  $('projModal').hidden=false;
}
function defaultWsTestUrl(){
  const host=(location.hostname==='localhost'||location.hostname==='127.0.0.1')?location.host:`${curIp}:${st?.port||8080}`;
  const tag=Math.random().toString(36).slice(2,5);
  return `ws://${host}/ws?user=Web-${tag}`;
}
function openWsTestTab(){
  const u=$('wsfUrl').value.trim()||defaultWsTestUrl();
  window.open('/ws-test?url='+encodeURIComponent(u),'_blank');
}
function toggleWsFloat(){
  const box=$('wsFloat');
  if(!$('wsfUrl').value)$('wsfUrl').value=defaultWsTestUrl();
  if(box.hidden){box.hidden=false;box.classList.remove('min');$('wsfMinBtn').textContent='縮小';}
  else if(box.classList.contains('min')){box.classList.remove('min');$('wsfMinBtn').textContent='縮小';}
  else box.hidden=true;
}
function minWsFloat(){
  const m=$('wsFloat').classList.toggle('min');
  $('wsfMinBtn').textContent=m?'展開':'縮小';
}

// Floating WS Client State
let wsfSock=null, wsfLogs=[];
function wsfSetState(cls,text,connected){
  const s=$('wsfSt');s.className='wsf-st '+cls;s.textContent=text;
  const ing=cls==='ing';
  const b=$('wsfConnBtn');
  b.textContent=connected?'斷線':ing?'取消':'連線';
  b.className=(connected||ing)?'fault xs':'pri xs';
  $('wsfHint').textContent=connected?'已連線，可送出':ing?'連線中…':'請先按「連線」';
  $('wsfUrl').disabled=connected||ing;
}
function wsfNow(){const d=new Date();return d.toTimeString().slice(0,8)+'.'+String(d.getMilliseconds()).padStart(3,'0');}
function wsfBytes(s){return new Blob([s]).size;}
function wsfFmt(raw){if(!$('wsfPretty').checked)return raw;try{return JSON.stringify(JSON.parse(raw),null,2);}catch(_){return raw;}}
function wsfAddLog(dir,label,raw,meta){wsfLogs.push({t:wsfNow(),dir,label,raw,meta:meta||''});if(wsfLogs.length>200)wsfLogs.shift();wsfRenderLogs();}
function wsfRenderLogs(){
  const box=$('wsfLogs');
  if(!wsfLogs.length){box.innerHTML='<div class="mut" style="font-family:var(--sans);padding:12px 2px">尚無收發紀錄。</div>';return;}
  box.innerHTML=wsfLogs.map(l=>`<div class="wsf-entry"><div class="wsf-emeta"><span class="wsf-dir ${l.dir}">${esc(l.label)}</span><span>${l.t}</span>${l.meta?`<span>${esc(l.meta)}</span>`:''}</div><pre class="wsf-pre">${esc(wsfFmt(l.raw))}</pre></div>`).join('');
  box.scrollTop=box.scrollHeight;
}
function wsfToggleConn(){
  if(wsfSock&&(wsfSock.readyState===WebSocket.OPEN||wsfSock.readyState===WebSocket.CONNECTING)){wsfSock.close(1000,'manual close');return;}
  const url=$('wsfUrl').value.trim();
  if(!url)return toast('請先輸入 WS 網址');
  wsfSetState('ing','連線中',false);
  wsfAddLog('sys','CONNECT',url,'HTTP Upgrade 握手中');
  try{wsfSock=new WebSocket(url);}catch(e){wsfSetState('err','網址錯誤',false);wsfAddLog('err','error',String(e));return;}
  wsfSock.onopen=()=>{wsfSetState('on','已連線',true);wsfAddLog('sys','open 事件',JSON.stringify({event:'open',readyState:wsfSock.readyState,url:wsfSock.url,protocol:wsfSock.protocol||'(none)'}),'101 Switching Protocols');};
  wsfSock.onmessage=e=>{
    const isTxt=typeof e.data==='string';
    const raw=isTxt?e.data:'[Binary]';
    wsfAddLog('rx','message 事件',raw,`${isTxt?'Text Frame':'Binary Frame'} · ${isTxt?wsfBytes(raw):e.data.size||0} bytes`);
  };
  wsfSock.onerror=()=>wsfAddLog('err','error 事件','WebSocket 發生錯誤（請檢查 IP、Server 或 ?user= 是否同名已在線）');
  wsfSock.onclose=e=>{
    wsfSetState('','已斷線',false);
    wsfAddLog('sys','close 事件',JSON.stringify({event:'close',code:e.code,reason:e.reason||'',wasClean:e.wasClean}));
    wsfSock=null;
  };
}
function wsfSend(){
  if(!wsfSock||wsfSock.readyState!==WebSocket.OPEN){wsfAddLog('err','提示','尚未連線，請先按上方「連線」按鈕');$('wsfConnBtn').focus();return;}
  const text=$('wsfMsg').value;
  if(!text.trim()){wsfAddLog('err','提示','請先輸入訊息或點上方快捷範本');$('wsfMsg').focus();return;}
  wsfSock.send(text);
  wsfAddLog('tx','send 送出',text,`Text Frame · ${wsfBytes(text)} bytes`);
}
function wsfFill(kind){
  const id='web-'+Math.random().toString(36).slice(2,10);
  if(kind==='raw')$('wsfMsg').value='hello from browser';
  else if(kind==='send')$('wsfMsg').value=JSON.stringify({type:'send',client_msg_id:id,text:'哈囉'},null,2);
  else if(kind==='ping')$('wsfMsg').value=JSON.stringify({type:'ping'});
  else if(kind==='read')$('wsfMsg').value=JSON.stringify({type:'read',room_id:sel||'lobby',seq:1},null,2);
  else $('wsfMsg').value=JSON.stringify({type:'send',client_msg_id:id,text:kind},null,2);
  $('wsfMsg').focus();
}
$('wsfMsg').addEventListener('keydown',e=>{if((e.metaKey||e.ctrlKey)&&e.key==='Enter'){e.preventDefault();wsfSend();}});

// Drag floating window by header
(()=>{
  let dx=0,dy=0,dragging=false;
  const box=$('wsFloat'), head=$('wsfHead');
  head.addEventListener('mousedown',e=>{
    if(e.target.closest('button'))return;
    dragging=true;
    const r=box.getBoundingClientRect();
    box.style.left=r.left+'px';box.style.top=r.top+'px';box.style.right='auto';box.style.bottom='auto';
    dx=e.clientX-r.left;dy=e.clientY-r.top;
  });
  document.addEventListener('mousemove',e=>{
    if(!dragging)return;
    const x=Math.max(8,Math.min(window.innerWidth-120,e.clientX-dx));
    const y=Math.max(8,Math.min(window.innerHeight-44,e.clientY-dy));
    box.style.left=x+'px';box.style.top=y+'px';
  });
  document.addEventListener('mouseup',()=>{dragging=false;});
})();
document.addEventListener('keydown',e=>{if(e.key==='Escape'){$('projModal').hidden=true;$('helpModal').hidden=true;}});

async function act(body){await fetch('/admin/action',{method:'POST',body:JSON.stringify(body)});tick();}
function say(){const t=$('say').value.trim();if(!t)return;act({action:'say',room:sel,text:t});$('say').value='';}
function mkGroup(){if(!picked.size)return alert('請先勾選要加入群組的在線學員');act({action:'group',name:$('gname').value||'群組',users:[...picked]});picked.clear();toast('已建立群組並推送通知');}
function toggleAllGroup(){
  const online=(st?.users||[]).filter(u=>u.online).map(u=>u.name);
  if(online.length&&online.every(u=>picked.has(u)))picked.clear();else online.forEach(u=>picked.add(u));
  tick();
}
async function floodPairs(n){
  const pairs=(st?.rooms||[]).filter(r=>r.kind==='pair');
  if(!pairs.length)return alert('目前沒有兩人組房間，請先按「兩兩一組」分房');
  for(const r of pairs){await fetch('/admin/action',{method:'POST',body:JSON.stringify({action:'flood',room:r.id,n})});}
  toast(`已替 ${pairs.length} 個兩人房各灌入 ${n} 則訊息`);tick();
}
document.querySelectorAll('[data-lv]').forEach(b=>b.onclick=()=>act({action:'level',level:b.dataset.lv}));

const _prevHtml={};
function setHtml(id,html){
  if(_prevHtml[id]===html)return false;
  _prevHtml[id]=html;
  $(id).innerHTML=html;
  return true;
}

function patchUsers(users){
  const tbody=$('users');
  if(!users.length){
    setHtml('users','<tr><td colspan="4" class="mut" style="padding:16px 6px">尚無學員連線。點上方「投影給同學」顯示連線 IP。</td></tr>');
    return;
  }
  const emptyRow=tbody.querySelector('td[colspan]');
  if(emptyRow){_prevHtml['users']=null;tbody.innerHTML='';}

  const byName=new Map();
  for(const tr of tbody.children)if(tr.dataset.u)byName.set(tr.dataset.u,tr);

  const wanted=new Set(users.map(u=>u.name));
  for(const [name,tr] of byName){if(!wanted.has(name))tr.remove();}

  users.forEach((u,idx)=>{
    const cls=u.blocked_s?'bl':u.zombie?'zb':u.online?'on':'off';
    const label=u.blocked_s?`拒絕 ${u.blocked_s}s`:u.zombie?'假死':u.online?'在線':'離線';
    const stHtml=`<span class="st-tag ${cls}"><i class="dot ${cls==='off'?'':cls}"></i>${label}</span>`;
    const roomStr=u.room||'—';
    let tr=byName.get(u.name);
    if(!tr){
      tr=document.createElement('tr');
      tr.dataset.u=u.name;
      tr.innerHTML=`<td><b>${esc(u.name)}</b></td><td>${stHtml}</td><td class="room-cell" title="${esc(roomStr)}">${esc(roomStr)}</td>
        <td><div class="acts">
          <button class="fault xs" data-a="drop" data-u="${esc(u.name)}" title="踢斷 5 秒並由機器人補發 3 句">踢斷</button>
          <button class="fault xs" data-a="zombie" data-u="${esc(u.name)}" title="連線不關但 Server 不回應">假死</button>
          <button class="xs" data-a="reject" data-u="${esc(u.name)}" title="踢斷並依拒絕秒數阻擋重連">拒絕</button>
          <button class="xs" data-a="remove" data-u="${esc(u.name)}" title="斷開連線並從名單與房間移除">移除</button>
        </div></td>`;
      tr.dataset.st=`${cls}:${label}`;
      tr.dataset.rm=roomStr;
    }else{
      const stKey=`${cls}:${label}`;
      if(tr.dataset.st!==stKey){tr.children[1].innerHTML=stHtml;tr.dataset.st=stKey;}
      if(tr.dataset.rm!==roomStr){tr.children[2].textContent=roomStr;tr.children[2].title=roomStr;tr.dataset.rm=roomStr;}
    }
    if(tbody.children[idx]!==tr)tbody.insertBefore(tr,tbody.children[idx]||null);
  });
}

async function tick(){
  st=await (await fetch('/admin/state'+(sel?'?room='+encodeURIComponent(sel):''))).json();
  $('adm').textContent=st.admin?`講師：${st.admin}`:'未設定 --admin';
  const ips=st.ips&&st.ips.length?st.ips:['localhost'];
  if(curIp==='localhost'&&ips[0]!=='localhost'){
    curIp=ips[0];
  }
  syncConnText();
  setHtml('ips',ips.map(ip=>`<button class="ippill ${ip===curIp?'active':''}" onclick="setIp('${esc(ip)}')" title="點擊複製並套用至指令">${esc(ip)}</button>`).join(''));
  document.querySelectorAll('[data-lv]').forEach(b=>b.classList.toggle('sel',b.dataset.lv===st.level));
  if(document.activeElement!==$('delay'))$('delay').value=st.delay_ms;

  const onC=st.users.filter(u=>u.online&&!u.zombie&&!u.blocked_s).length;
  const zbC=st.users.filter(u=>u.zombie).length;
  const blC=st.users.filter(u=>u.blocked_s).length;
  const offC=st.users.filter(u=>!u.online&&!u.blocked_s).length;
  $('userCount').textContent=`${onC+zbC} 在線 / ${st.users.length} 人`;
  setHtml('kpis',`
    <span><i class="dot on"></i>在線 <b>${onC}</b></span>
    <span><i class="dot zb"></i>假死 <b>${zbC}</b></span>
    <span><i class="dot bl"></i>拒絕中 <b>${blC}</b></span>
    <span><i class="dot"></i>離線 <b>${offC}</b></span>`);

  patchUsers(st.users);

  setHtml('gusers',st.users.filter(u=>u.online).map(u=>`<label class="chip"><input type="checkbox" data-g="${esc(u.name)}" ${picked.has(u.name)?'checked':''}>${esc(u.name)}</label>`).join('')||'<span class="mut" style="font-size:12.5px">目前沒有在線學員可勾選</span>');

  $('roomCount').textContent=`${st.rooms.length} 間`;
  setHtml('rooms',st.rooms.length?`<div class="room-list">${st.rooms.map(r=>`
    <div class="room ${r.id===sel?'sel':''}" data-r="${esc(r.id)}">
      <div class="room-top">
        <span class="room-name">${esc(r.name)}</span>
        <span class="room-seq">#${r.last_seq}</span>
      </div>
      <div class="room-sub"><span class="kind ${esc(r.kind)}">${esc(r.kind)}</span><span class="room-id">${esc(r.id)}</span></div>
      <div class="room-members">
        ${r.members.map(m=>{const u=st.users.find(x=>x.name===m);return `<span class="rm"><i class="dot ${u&&u.online?'on':''}"></i>${esc(m)}</span>`}).join('')}
      </div>
    </div>`).join('')}</div>`:'<div class="mut" style="font-size:12.5px;padding:8px 0">還沒有房間。學員連上後會自動建立私人房。</div>');

  const room=st.rooms.find(r=>r.id===sel);
  $('emptyDetail').hidden=!!room;
  $('detail').hidden=!room;
  if(room){
    $('dtitle').textContent=room.name;
    $('dmeta').textContent=`${room.id}  最新 #${room.last_seq}`;
    const focused=document.activeElement&&document.activeElement.dataset.rd;
    if(!focused)setHtml('reads',room.members.map(m=>{
      const cur=room.reads[m]||0, unread=Math.max(0,room.last_seq-cur);
      const pct=room.last_seq?Math.round(cur/room.last_seq*100):100;
      return `<tr>
        <td><b>${esc(m)}</b></td>
        <td>
          <div style="font-size:12.5px;font-variant-numeric:tabular-nums"><b>#${cur}</b> / ${room.last_seq} <span class="mut">（未讀 ${unread}）</span></div>
          <div class="prog"><i style="width:${pct}%"></i></div>
        </td>
        <td><div class="acts">
          <input type="number" min="0" max="${room.last_seq}" data-rd="${esc(m)}" placeholder="seq" style="width:60px">
          <button class="xs" data-a="setread" data-u="${esc(m)}">設定</button>
          <button class="xs" onclick="act({action:'read',room:sel,user:'${esc(m)}',seq:0})">歸零</button>
        </div></td></tr>`;
    }).join(''));
    const box=$('msgs'),atBottom=box.scrollTop+box.clientHeight>=box.scrollHeight-4;
    if(setHtml('msgs',st.messages.map(m=>`<div class="msg-item"><span class="seq">#${m.seq}</span><span class="sender">${esc(m.sender)}</span><span class="msg-text">${esc(m.text)}</span></div>`).join('')||'<div class="mut" style="padding:12px;text-align:center">這間房還沒有訊息</div>')&&atBottom){
      box.scrollTop=box.scrollHeight;
    }
  }
  drawTimeline(st.timeline);
}

function drawTimeline(rounds){
  if(!rounds.length)return;
  const W=520,X=s=>46+s/40000*(W-58);
  setHtml('tl',rounds.map(d=>{
    const users=[...new Set(d.users)];const H=22+users.length*16;
    const ticks=[0,5,10,15,20,25,30,35,40].map(s=>`<line x1="${X(s*1000)}" x2="${X(s*1000)}" y1="8" y2="${H-6}" stroke="${s===5?'#c82333':'#dcdcd6'}" stroke-dasharray="${s===5?'3,2':''}"/><text x="${X(s*1000)}" y="${H+7}" font-size="10" fill="${s===5?'#c82333':'#5c6068'}" text-anchor="middle">${s}s</text>`).join('');
    const dots=d.attempts.map(a=>`<circle cx="${X(a.dt)}" cy="${16+users.indexOf(a.user)*16}" r="4" fill="${a.result==='ok'?'#15803d':'#c82333'}" stroke="#fff" stroke-width="1"><title>${esc(a.user)} ${(a.dt/1000).toFixed(2)}s (${a.result})</title></circle>`).join('');
    const names=users.map((u,j)=>`<text x="0" y="${20+j*16}" font-size="10.5" fill="#16171a" font-weight="500">${esc(u).slice(0,7)}</text>`).join('');
    return `<div style="margin-top:8px"><div class="mut" style="font-size:12px;margin-bottom:2px">${new Date(d.t).toLocaleTimeString()} ${esc(d.by)} 踢斷 ${users.length} 人</div><svg width="100%" viewBox="0 0 ${W} ${H+12}">${ticks}${names}${dots}</svg></div>`;
  }).join(''));
}

document.addEventListener('click',e=>{
  const t=e.target;
  if(t.dataset.g!==undefined){t.checked?picked.add(t.dataset.g):picked.delete(t.dataset.g);return;}
  const r=t.closest('[data-r]');if(r){sel=r.dataset.r;tick();return;}
  const a=t.dataset.a,u=t.dataset.u;if(!a)return;
  if(a==='reject')act({action:'reject',user:u,seconds:+$('rejs').value||30});
  else if(a==='setread'){const i=document.querySelector(`[data-rd="${CSS.escape(u)}"]`);act({action:'read',room:sel,user:u,seq:+i.value});i.value='';i.blur();}
  else act({action:a,user:u});
});
renderCheat();
tick();setInterval(tick,1000);
</script></body></html>''';

// ───────────────────────── WS 測試頁面（/ws-test）─────────────────────────

const _wsTestHtml = r'''<!doctype html>
<html lang="zh-Hant"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>WS 連線測試 · Flutter 聊天室工作坊</title>
<style>
:root{
  --ground:#f6f6f4;--panel:#ffffff;--well:#efefe9;--ink:#16171a;--muted:#5c6068;
  --rule:#dcdcd6;--rule-soft:#ecece6;
  --cobalt:#1b4fd8;--cobalt-hover:#1640b0;--cobalt-tint:#edf2ff;--cobalt-ring:#bfd0ff;
  --fault:#c82333;--fault-tint:#fdf2f3;--fault-rule:#f3c4c9;
  --ok:#15803d;--ok-tint:#eefaf2;
  --warn:#a16207;--warn-tint:#fef9ec;
  --sans:-apple-system,BlinkMacSystemFont,"SF Pro Text","PingFang TC","Noto Sans TC",sans-serif;
  --mono:ui-monospace,"SF Mono",Menlo,Monaco,Consolas,monospace;
}
*{box-sizing:border-box}
html,body{height:100%}
body{
  margin:0;font:13.5px/1.5 var(--sans);background:var(--ground);color:var(--ink);
  -webkit-font-smoothing:antialiased;display:flex;flex-direction:column;
}
:focus-visible{outline:2px solid var(--cobalt);outline-offset:1px}

header{
  display:flex;align-items:center;gap:12px;flex-wrap:wrap;
  padding:10px 18px;background:var(--panel);border-bottom:1px solid var(--rule);flex-shrink:0;
}
header h1{font-size:15px;font-weight:700;margin:0;letter-spacing:-.01em}
.back{font-size:12.5px;color:var(--cobalt);text-decoration:none;font-weight:500}
.back:hover{text-decoration:underline}
.status{margin-left:auto;display:inline-flex;align-items:center;gap:6px;font-size:12.5px;font-weight:600;padding:3px 10px;border-radius:4px;background:var(--well);color:var(--muted)}
.status.on{background:var(--ok-tint);color:var(--ok)}
.status.ing{background:var(--warn-tint);color:var(--warn)}
.status.err{background:var(--fault-tint);color:var(--fault)}
.dot{width:7px;height:7px;border-radius:50%;background:currentColor;display:inline-block}

.connbar{
  display:flex;align-items:center;gap:8px;flex-wrap:wrap;
  padding:10px 18px;background:var(--ink);border-bottom:1px solid #000;flex-shrink:0;
}
.connbar label{font-size:12.5px;color:#a3a7b0;font-weight:500}
.url-in{
  flex:1;min-width:260px;font-family:var(--mono);font-size:13px;
  padding:6px 10px;border-radius:5px;border:1px solid #3c404a;background:#0d0e11;color:#fff;
}
.url-in:focus{border-color:#7ea2ff;outline:none}

button{
  font:inherit;font-size:12.5px;font-weight:500;padding:5px 12px;border-radius:5px;
  border:1px solid var(--rule);background:var(--panel);color:var(--ink);cursor:pointer;
}
button:hover{background:var(--well);border-color:#bdbdb6}
button:disabled{opacity:.45;cursor:not-allowed}
button.pri{background:var(--cobalt);border-color:var(--cobalt);color:#fff}
button.pri:hover:not(:disabled){background:var(--cobalt-hover);border-color:var(--cobalt-hover)}
button.fault{background:var(--fault);border-color:var(--fault);color:#fff}
button.fault:hover:not(:disabled){background:#a81c29}
button.xs{padding:3px 8px;font-size:12px}

.desk{flex:1;min-height:0;display:grid;grid-template-columns:minmax(320px,0.9fr) minmax(380px,1.3fr)}
.pane{display:flex;flex-direction:column;min-width:0;min-height:0;border-right:1px solid var(--rule);overflow-y:auto}
.pane:last-child{border-right:none;background:var(--panel)}

.block{padding:16px 18px;border-bottom:1px solid var(--rule)}
.block:last-child{border-bottom:none}
.block-head{display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;margin-bottom:8px}
.block-head h2{font-size:14px;font-weight:700;margin:0}
.mut{color:var(--muted);font-size:12.5px}

textarea{
  width:100%;min-height:130px;resize:vertical;font-family:var(--mono);font-size:13px;line-height:1.5;
  padding:10px;border:1px solid var(--rule);border-radius:5px;background:var(--panel);color:var(--ink);
}
textarea:focus{border-color:var(--cobalt);outline:none;box-shadow:0 0 0 2px var(--cobalt-ring)}

.tpls{display:flex;gap:5px;flex-wrap:wrap;margin:8px 0 12px}
.row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:10px}

.log-head{
  padding:12px 18px;border-bottom:1px solid var(--rule);background:var(--panel);
  display:flex;align-items:center;justify-content:space-between;gap:8px;flex-wrap:wrap;flex-shrink:0;
}
.log-head h2{font-size:14px;font-weight:700;margin:0}
.log-list{flex:1;overflow-y:auto;padding:10px 18px;font-family:var(--mono);font-size:12.5px}
.log-empty{color:var(--muted);font-family:var(--sans);font-size:13px;padding:24px 0}
.entry{padding:8px 0;border-bottom:1px solid var(--rule-soft)}
.entry:last-child{border-bottom:none}
.entry-meta{display:flex;align-items:center;gap:8px;margin-bottom:4px;font-size:11.5px;color:var(--muted)}
.dir{font-family:var(--sans);font-weight:600;padding:1px 6px;border-radius:3px;font-size:11.5px}
.dir.tx{background:var(--cobalt-tint);color:var(--cobalt)}
.dir.rx{background:var(--ok-tint);color:var(--ok)}
.dir.sys{background:var(--well);color:var(--muted)}
.dir.err{background:var(--fault-tint);color:var(--fault)}
.payload{margin:0;white-space:pre-wrap;word-break:break-word;color:var(--ink);font-family:var(--mono);font-size:12.5px;line-height:1.45}

@media(max-width:840px){
  .desk{grid-template-columns:1fr}
  .pane{border-right:none;border-bottom:1px solid var(--rule);overflow:visible}
}
</style></head><body>

<header>
  <h1>WebSocket 連線測試</h1>
  <a class="back" href="/admin">返回講師控制台</a>
  <span class="status" id="st"><i class="dot"></i><span id="stText">未連線</span></span>
</header>

<div class="connbar">
  <label for="url">WS 網址</label>
  <input class="url-in" id="url" placeholder="ws://localhost:8080/ws?user=Tester" onkeydown="if(event.key==='Enter')toggleConn()">
  <button class="pri" id="connBtn" onclick="toggleConn()">連線</button>
</div>

<div class="desk">
  <div class="pane">
    <div class="block">
      <div class="block-head">
        <h2>送出訊息</h2>
        <span class="mut">Ctrl / Cmd + Enter 快速送出</span>
      </div>
      <div class="mut" style="margin-bottom:6px">快捷範本（點擊填入，可直接修改）</div>
      <div class="tpls">
        <button class="xs" onclick="fill('raw')">純文字</button>
        <button class="xs" onclick="fill('send')">JSON send</button>
        <button class="xs" onclick="fill('ping')">ping</button>
        <button class="xs" onclick="fill('read')">read</button>
        <button class="xs" onclick="fill('/delay')">/delay</button>
        <button class="xs" onclick="fill('/fail')">/fail</button>
        <button class="xs" onclick="fill('/drop')">/drop</button>
        <button class="xs" onclick="fill('/zombie')">/zombie</button>
      </div>
      <textarea id="msg" placeholder="輸入純文字或 JSON，例如：hello 或 {&quot;type&quot;:&quot;send&quot;,&quot;text&quot;:&quot;hi&quot;}"></textarea>
      <div class="row">
        <button class="pri" id="sendBtn" onclick="sendMsg()">送出</button>
        <span class="mut" id="sendHint">尚未連線（請先按上方「連線」）</span>
        <label style="font-size:12.5px;color:var(--muted);display:inline-flex;align-items:center;gap:5px;cursor:pointer;margin-left:auto">
          <input type="checkbox" id="pretty" checked onchange="rerender()"> 自動排版 JSON
        </label>
      </div>
    </div>

    <div class="block">
      <div class="block-head"><h2>使用說明</h2></div>
      <div class="mut" style="line-height:1.65">
        1. 上方貼入或修改 WS 網址（可改 <code>?user=</code> 換名字，或開兩個分頁模擬兩人對話）。<br>
        2. 按「連線」，右側會即時顯示收到的純文字或 JSON（如 <code>message</code>、<code>ack</code>、<code>pong</code>、<code>room_added</code>、<code>read</code>）。<br>
        3. 第 1 堂 <code>raw</code> 等級可直接送純文字；第 4 堂 <code>ack</code> 等級重送同一個 <code>client_msg_id</code> 可驗證冪等。
      </div>
    </div>
  </div>

  <div class="pane">
    <div class="log-head">
      <h2>收發紀錄 <span class="mut" id="logCount">0 筆</span></h2>
      <button class="xs" onclick="clearLog()">清空紀錄</button>
    </div>
    <div class="log-list" id="log">
      <div class="log-empty">尚未連線。確認上方 WS 網址後按「連線」即可開始收發測試。</div>
    </div>
  </div>
</div>

<script>
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let ws=null, logs=[];

const qUrl=new URLSearchParams(location.search).get('url');
$('url').value=qUrl||`ws://${location.host}/ws?user=Web-${Math.random().toString(36).slice(2,5)}`;

function setState(cls,text,connected){
  const el=$('st');el.className='status '+cls;$('stText').textContent=text;
  const connecting=cls==='ing';
  const btn=$('connBtn');
  btn.textContent=connected?'斷線':connecting?'取消連線':'連線';
  btn.className=(connected||connecting)?'fault':'pri';
  $('sendHint').textContent=connected?'已連線，可送出':connecting?'連線中，請稍候…':'尚未連線（請先按上方「連線」）';
  $('url').disabled=connected||connecting;
}

function nowStr(){
  const d=new Date();
  return d.toTimeString().slice(0,8)+'.'+String(d.getMilliseconds()).padStart(3,'0');
}

function fmt(raw){
  if(!$('pretty').checked)return raw;
  try{return JSON.stringify(JSON.parse(raw),null,2);}catch(_){return raw;}
}

function bytesOf(s){return new Blob([s]).size;}

function addLog(dir,label,raw,meta){
  logs.push({t:nowStr(),dir,label,raw,meta:meta||''});
  if(logs.length>300)logs.shift();
  rerender();
}

function rerender(){
  $('logCount').textContent=`${logs.length} 筆`;
  const box=$('log');
  if(!logs.length){box.innerHTML='<div class="log-empty">尚無收發紀錄。</div>';return;}
  box.innerHTML=logs.map(l=>`<div class="entry">
    <div class="entry-meta"><span class="dir ${l.dir}">${esc(l.label)}</span><span>${l.t}</span>${l.meta?`<span>${esc(l.meta)}</span>`:''}</div>
    <pre class="payload">${esc(fmt(l.raw))}</pre>
  </div>`).join('');
  box.scrollTop=box.scrollHeight;
}

function clearLog(){logs=[];rerender();}

function toggleConn(){
  if(ws&&(ws.readyState===WebSocket.OPEN||ws.readyState===WebSocket.CONNECTING)){
    ws.close(1000,'manual close');
    return;
  }
  const url=$('url').value.trim();
  if(!url)return alert('請先輸入 WS 網址');
  setState('ing','連線中',false);
  addLog('sys','CONNECT',url,'HTTP Upgrade 握手中');
  try{
    ws=new WebSocket(url);
  }catch(e){
    setState('err','網址錯誤',false);
    addLog('err','error',String(e));
    return;
  }
  ws.onopen=()=>{
    setState('on','已連線',true);
    addLog('sys','open 事件',JSON.stringify({event:'open',readyState:ws.readyState,url:ws.url,protocol:ws.protocol||'(none)'}),'101 Switching Protocols');
  };
  ws.onmessage=e=>{
    const isTxt=typeof e.data==='string';
    const raw=isTxt?e.data:'[Binary]';
    addLog('rx','message 事件',raw,`${isTxt?'Text Frame':'Binary Frame'} · ${isTxt?bytesOf(raw):e.data.size||0} bytes`);
  };
  ws.onerror=()=>addLog('err','error 事件','連線發生錯誤（請檢查 Server、IP 或是否同名重複連線）');
  ws.onclose=e=>{
    setState('','已斷線',false);
    addLog('sys','close 事件',JSON.stringify({event:'close',code:e.code,reason:e.reason||'',wasClean:e.wasClean}));
    ws=null;
  };
}

function sendMsg(){
  if(!ws||ws.readyState!==WebSocket.OPEN){
    addLog('err','提示','尚未連線，請先按上方「連線」按鈕（若連線失敗，請檢查 ?user= 是否同名已在線）');
    $('connBtn').focus();
    return;
  }
  const text=$('msg').value;
  if(!text.trim()){
    addLog('err','提示','請先輸入訊息或點上方快捷範本');
    $('msg').focus();
    return;
  }
  ws.send(text);
  addLog('tx','send 送出',text,`Text Frame · ${bytesOf(text)} bytes`);
}

function uid(){return 'web-'+Math.random().toString(36).slice(2,10);}
function fill(kind){
  if(kind==='raw')$('msg').value='hello from browser';
  else if(kind==='send')$('msg').value=JSON.stringify({type:'send',client_msg_id:uid(),text:'哈囉'},null,2);
  else if(kind==='ping')$('msg').value=JSON.stringify({type:'ping'});
  else if(kind==='read')$('msg').value=JSON.stringify({type:'read',room_id:'lobby',seq:1},null,2);
  else $('msg').value=JSON.stringify({type:'send',client_msg_id:uid(),text:kind},null,2);
  $('msg').focus();
}

$('msg').addEventListener('keydown',e=>{
  if((e.metaKey||e.ctrlKey)&&e.key==='Enter'){e.preventDefault();sendMsg();}
});
</script></body></html>''';
