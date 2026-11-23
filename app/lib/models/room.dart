class Room {
  const Room({
    required this.id,
    required this.name,
    required this.kind,
    required this.members,
    this.lastSeq = 0,
    this.lastSender,
    this.lastText,
    this.lastTs,
    this.myReadSeq = 0,
  });

  final String id;
  final String name;

  /// private | pair | lobby | group | dm
  final String kind;
  final List<String> members;

  /// 房間最新 seq（列表預覽與未讀數用；不代表本地已經有這則）
  final int lastSeq;
  final String? lastSender;
  final String? lastText;
  final int? lastTs;

  /// 我的已讀水位線
  final int myReadSeq;

  // TODO(第 9 堂) ③ 未讀數 = 房間最新 seq − 我的水位線（不能是負的）

  /// 私聊顯示對方名字
  String titleFor(String me) => kind == 'dm' ? members.firstWhere((m) => m != me, orElse: () => name) : name;

  /// 私聊 = ID 固定的 2 人房：兩邊算出來一樣，不需要「建立私聊」API
  static String dmId(String a, String b) {
    final pair = [a, b]..sort();
    return 'dm:${pair[0]}:${pair[1]}';
  }

  factory Room.fromServer(Map<String, dynamic> j) {
    final last = j['last_message'] as Map<String, dynamic>?;
    return Room(
      id: j['id'] as String,
      name: j['name'] as String,
      kind: j['kind'] as String,
      members: (j['members'] as List).cast<String>(),
      lastSeq: j['last_seq'] as int,
      lastSender: last?['sender'] as String?,
      lastText: last?['text'] as String?,
      lastTs: last?['ts'] as int?,
      myReadSeq: j['last_read_seq'] as int,
    );
  }

  factory Room.fromRow(Map<String, Object?> r) => Room(
    id: r['id'] as String,
    name: r['name'] as String,
    kind: r['kind'] as String,
    members: (r['members'] as String).split(','),
    lastSeq: r['last_seq'] as int,
    lastSender: r['last_sender'] as String?,
    lastText: r['last_text'] as String?,
    lastTs: r['last_ts'] as int?,
    myReadSeq: r['my_read_seq'] as int,
  );

  Map<String, Object?> toRow() => {
    'id': id,
    'name': name,
    'kind': kind,
    'members': members.join(','),
    'last_seq': lastSeq,
    'last_sender': lastSender,
    'last_text': lastText,
    'last_ts': lastTs,
    'my_read_seq': myReadSeq,
  };
}
