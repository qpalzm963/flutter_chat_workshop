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

Future<void> main(List<String> args) async {
  var port = 8080;
  String? dataPath;
  for (final a in args) {
    if (a.startsWith('--admin=')) admin = a.substring(8);
    if (a.startsWith('--port=')) port = int.parse(a.substring(7));
    if (a.startsWith('--level=')) level = Level.values.byName(a.substring(8));
    if (a.startsWith('--data=')) dataPath = a.substring(7);
  }
  if (dataPath != null) _startPersistence(File(dataPath));
  final server = await HttpServer.bind(InternetAddress.anyIPv4, port);
  _log('listening on :$port  ws=/ws?user=  dashboard=http://localhost:$port/admin  '
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
  if (req.method == 'GET' && path == '/admin/state') return _json(req, _adminState(req.uri.queryParameters['room']));
  if (req.method == 'POST' && path == '/admin/action') return _adminAction(req);
  if (req.method == 'GET' && path == '/rooms') return _getRooms(req);
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
  if (!assigned.containsKey(user)) _assign(user, _privateRoom(user));
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

/// 分房（私人房 / 兩兩一組 / 大廳）＝搬家：離開舊的分配房、加入新房
void _assign(String user, Room room) {
  final old = assigned[user];
  if (old != null && old != room.id) rooms[old]?.members.remove(user);
  assigned[user] = room.id;
  _dirty = true;
  _addMember(room, user);
}

void _addMember(Room room, String user) => _addMembers(room, [user]);

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
          for (final u in online) {
            _assign(u, _privateRoom(u));
          }
        case 'lobby':
          final lobby = _room('lobby', '大廳', 'lobby');
          for (final u in online) {
            _assign(u, lobby);
          }
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
            for (final b in chunk) {
              for (final u in groups[b]!) {
                _assign(u, r);
              }
            }
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
<title>講師儀表板</title>
<style>
:root{--bg:#f6f7f9;--card:#fff;--fg:#1d2433;--mut:#6b7385;--line:#e3e6ec;--acc:#2f6fed;--ok:#1a9a5b;--bad:#d64545;--warn:#c98a00}
*{box-sizing:border-box}body{margin:0;font:14px/1.45 -apple-system,"PingFang TC",sans-serif;background:var(--bg);color:var(--fg)}
header{display:flex;gap:16px;align-items:center;flex-wrap:wrap;padding:12px 20px;background:var(--card);border-bottom:1px solid var(--line);position:sticky;top:0;z-index:1}
h1{font-size:17px;margin:0 12px 0 0}h2{font-size:15px;margin:0 0 10px}
main{display:grid;grid-template-columns:minmax(320px,1fr) minmax(360px,1.3fr);gap:16px;padding:16px 20px}
section{background:var(--card);border:1px solid var(--line);border-radius:10px;padding:14px}
table{border-collapse:collapse;width:100%}td,th{padding:5px 6px;border-bottom:1px solid var(--line);text-align:left;vertical-align:middle}th{color:var(--mut);font-weight:500}
button{font:inherit;padding:4px 10px;border:1px solid var(--line);border-radius:6px;background:#fff;cursor:pointer}button:hover{border-color:var(--acc)}
button.pri{background:var(--acc);color:#fff;border-color:var(--acc)}button.danger{color:var(--bad)}
input,select{font:inherit;padding:4px 6px;border:1px solid var(--line);border-radius:6px}input[type=number]{width:70px}
.row{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:6px 0}.mut{color:var(--mut)}
.dot{display:inline-block;width:8px;height:8px;border-radius:50%;margin-right:5px;background:#bbb}.on{background:var(--ok)}.zb{background:var(--warn)}.bl{background:var(--bad)}
.room{padding:8px;border:1px solid var(--line);border-radius:8px;margin-bottom:8px;cursor:pointer}.room.sel{border-color:var(--acc);background:#f0f5ff}
.msgs{max-height:320px;overflow:auto;border:1px solid var(--line);border-radius:8px;padding:6px;font-size:13px}
.msgs div{padding:2px 0}.seq{color:var(--mut);font-variant-numeric:tabular-nums;display:inline-block;min-width:44px}
.lv button.sel{background:var(--fg);color:#fff}
@media(max-width:900px){main{grid-template-columns:1fr}}
</style></head><body>
<header>
  <h1>講師儀表板</h1>
  <span class="lv">行為等級
    <button data-lv="raw">純字串</button><button data-lv="echo">第 1～3 堂：回音</button><button data-lv="ack">第 4 堂起：ACK</button>
  </span>
  <span>全域延遲 <input id="delay" type="number" min="0" step="500"> ms <button onclick="act({action:'delay',ms:+$('delay').value||0})">套用</button></span>
  <span class="mut" id="adm"></span>
</header>
<main>
<div>
  <section>
    <h2>學員</h2>
    <div class="row">全部在線：<button class="danger" onclick="act({action:'drop',user:'@all'})">/drop @all</button>
      <button class="danger" onclick="act({action:'zombie',user:'@all'})">/zombie @all</button>
      拒絕秒數 <input id="rejs" type="number" value="30" min="1"></div>
    <table><thead><tr><th></th><th>名字</th><th>分配房間</th><th></th></tr></thead><tbody id="users"></tbody></table>
  </section>
  <section style="margin-top:16px">
    <h2>分房</h2>
    <div class="row"><button onclick="act({action:'assign',mode:'private'})">私人房</button>
      <button onclick="act({action:'assign',mode:'pairs'})">兩兩一組</button>
      <button onclick="act({action:'assign',mode:'lobby'})">大廳</button>
      <span class="mut">（只搬在線學員）</span></div>
    <div class="row">自訂群組 <input id="gname" placeholder="群組名稱" value="活動群"> <button class="pri" onclick="mkGroup()">建立並拉人</button></div>
    <div class="row" id="gusers"></div>
  </section>
  <section style="margin-top:16px">
    <h2>重連時間軸 <span class="mut">（最近 3 次 /drop，0～40 秒；<span class="dot on"></span>連上 <span class="dot bl"></span>被拒）</span></h2>
    <div id="tl" class="mut">還沒有 /drop 紀錄</div>
  </section>
</div>
<div>
  <section>
    <h2>房間</h2>
    <div id="rooms"></div>
  </section>
  <section style="margin-top:16px" id="detail" hidden>
    <h2 id="dtitle"></h2>
    <div class="row"><input id="say" placeholder="以講師身分發言" style="flex:1"> <button class="pri" onclick="say()">送出</button></div>
    <div class="row">灌 <input id="floodn" type="number" value="300" min="1"> 則 <button onclick="act({action:'flood',room:sel,n:+$('floodn').value})">灌訊息</button></div>
    <h2 style="margin-top:12px">已讀水位線</h2>
    <table><tbody id="reads"></tbody></table>
    <h2 style="margin-top:12px">最近 50 則</h2>
    <div class="msgs" id="msgs"></div>
  </section>
</div>
</main>
<script>
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
let sel=null, st=null, picked=new Set();
async function act(body){await fetch('/admin/action',{method:'POST',body:JSON.stringify(body)});tick();}
function say(){const t=$('say').value.trim();if(!t)return;act({action:'say',room:sel,text:t});$('say').value='';}
function mkGroup(){if(!picked.size)return alert('先勾選學員');act({action:'group',name:$('gname').value||'群組',users:[...picked]});picked.clear();}
document.querySelectorAll('[data-lv]').forEach(b=>b.onclick=()=>act({action:'level',level:b.dataset.lv}));
async function tick(){
  st=await (await fetch('/admin/state'+(sel?'?room='+encodeURIComponent(sel):''))).json();
  $('adm').textContent='講師：'+(st.admin||'（未設定 --admin）');
  document.querySelectorAll('[data-lv]').forEach(b=>b.classList.toggle('sel',b.dataset.lv===st.level));
  if(document.activeElement!==$('delay'))$('delay').value=st.delay_ms;
  $('users').innerHTML=st.users.map(u=>{
    const cls=u.blocked_s?'bl':u.zombie?'zb':u.online?'on':'';
    const state=u.blocked_s?`拒絕中 ${u.blocked_s}s`:u.zombie?'zombie':u.online?'':'離線';
    return `<tr><td><span class="dot ${cls}"></span></td><td>${esc(u.name)} <span class="mut">${state}</span></td><td class="mut">${esc(u.room||'')}</td>
    <td><button class="danger" data-a="drop" data-u="${esc(u.name)}">/drop</button> <button class="danger" data-a="zombie" data-u="${esc(u.name)}">/zombie</button>
    <button data-a="reject" data-u="${esc(u.name)}">拒絕連線</button></td></tr>`}).join('');
  $('gusers').innerHTML=st.users.filter(u=>u.online).map(u=>`<label><input type="checkbox" data-g="${esc(u.name)}" ${picked.has(u.name)?'checked':''}> ${esc(u.name)}</label>`).join(' ')||'<span class="mut">沒有在線學員</span>';
  $('rooms').innerHTML=st.rooms.map(r=>`<div class="room ${r.id===sel?'sel':''}" data-r="${esc(r.id)}"><b>${esc(r.name)}</b> <span class="mut">${esc(r.id)} · 最新 seq ${r.last_seq}</span><br>
    ${r.members.map(m=>{const u=st.users.find(x=>x.name===m);return `<span class="dot ${u&&u.online?'on':''}"></span>${esc(m)}`}).join(' ')}</div>`).join('')||'<span class="mut">還沒有房間（學員連線後自動進私人房）</span>';
  const room=st.rooms.find(r=>r.id===sel);
  $('detail').hidden=!room;
  if(room){
    $('dtitle').textContent=room.name+'（'+room.id+'）';
    const focused=document.activeElement&&document.activeElement.dataset.rd;
    if(!focused)$('reads').innerHTML=room.members.map(m=>`<tr><td>${esc(m)}</td><td>讀到 <b>${room.reads[m]||0}</b> / ${room.last_seq}</td>
      <td><input type="number" min="0" data-rd="${esc(m)}" placeholder="seq"> <button data-a="setread" data-u="${esc(m)}">設定</button></td></tr>`).join('');
    const box=$('msgs'),atBottom=box.scrollTop+box.clientHeight>=box.scrollHeight-4;
    box.innerHTML=st.messages.map(m=>`<div><span class="seq">#${m.seq}</span><b>${esc(m.sender)}</b>：${esc(m.text)}</div>`).join('')||'<span class="mut">沒有訊息</span>';
    if(atBottom)box.scrollTop=box.scrollHeight;
  }
  drawTimeline(st.timeline);
}
function drawTimeline(rounds){
  if(!rounds.length)return;
  const W=560,X=s=>40+s/40000*(W-50);
  $('tl').innerHTML=rounds.map((d,i)=>{
    const users=[...new Set(d.users)];const H=20+users.length*14;
    const ticks=[0,5,10,15,20,25,30,35,40].map(s=>`<line x1="${X(s*1000)}" x2="${X(s*1000)}" y1="10" y2="${H-6}" stroke="#e3e6ec"/><text x="${X(s*1000)}" y="${H+6}" font-size="10" fill="#6b7385" text-anchor="middle">${s}s</text>`).join('');
    const dots=d.attempts.map(a=>`<circle cx="${X(a.dt)}" cy="${16+users.indexOf(a.user)*14}" r="4" fill="${a.result==='ok'?'#1a9a5b':'#d64545'}"><title>${esc(a.user)} ${(a.dt/1000).toFixed(2)}s ${a.result}</title></circle>`).join('');
    const names=users.map((u,j)=>`<text x="0" y="${20+j*14}" font-size="10" fill="#6b7385">${esc(u).slice(0,6)}</text>`).join('');
    return `<div class="mut">${new Date(d.t).toLocaleTimeString()} · ${esc(d.by)} 踢了 ${users.length} 人</div><svg width="100%" viewBox="0 0 ${W} ${H+10}">${ticks}${names}${dots}</svg>`}).join('');
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
tick();setInterval(tick,1000);
</script></body></html>''';
