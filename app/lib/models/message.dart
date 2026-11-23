import 'message_status.dart';

export 'message_status.dart';

class Message {
  const Message({
    required this.clientMsgId,
    required this.roomId,
    required this.sender,
    required this.text,
    required this.ts,
    required this.status,
    this.seq,
  });

  /// 前端產生的 UUID：冪等 key，重試時帶同一組，Server 依此去重。
  final String clientMsgId;

  final String roomId;

  /// Server 核發、以房間為單位遞增的序號：排序與分頁 cursor 的唯一依據。送出前為 null。
  final int? seq;
  final String sender;
  final String text;

  /// 毫秒時間戳（顯示用；補送依它排序；訊息排序不信任 client 時間）
  final int ts;
  final MessageStatus status;

  factory Message.fromServer(Map<String, dynamic> json) => Message(
    clientMsgId: json['client_msg_id'] as String,
    roomId: json['room_id'] as String,
    seq: json['seq'] as int,
    sender: json['sender'] as String,
    text: json['text'] as String,
    ts: json['ts'] as int,
    status: MessageStatus.sent,
  );

  factory Message.fromRow(Map<String, Object?> row) => Message(
    clientMsgId: row['client_msg_id'] as String,
    roomId: row['room_id'] as String,
    seq: row['seq'] as int?,
    sender: row['sender'] as String,
    text: row['text'] as String,
    ts: row['ts'] as int,
    status: MessageStatus.values.byName(row['status'] as String),
  );

  Map<String, Object?> toRow() => {
    'client_msg_id': clientMsgId,
    'room_id': roomId,
    'seq': seq,
    'sender': sender,
    'text': text,
    'ts': ts,
    'status': status.name,
  };
}
