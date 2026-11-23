import 'message_status.dart';

export 'message_status.dart';

class Message {
  const Message({
    required this.clientMsgId,
    required this.sender,
    required this.text,
    required this.ts,
    required this.status,
    this.seq,
  });

  /// 前端產生的 UUID：冪等 key，重試時帶同一組，Server 依此去重。
  final String clientMsgId;

  /// Server 核發的單調遞增序號：排序的唯一依據。送出前為 null。
  final int? seq;
  final String sender;
  final String text;

  /// 毫秒時間戳（僅顯示用，排序不信任 client 時間）
  final int ts;
  final MessageStatus status;

  Message copyWith({MessageStatus? status, int? seq, int? ts}) => Message(
    clientMsgId: clientMsgId,
    sender: sender,
    text: text,
    ts: ts ?? this.ts,
    status: status ?? this.status,
    seq: seq ?? this.seq,
  );

  factory Message.fromServer(Map<String, dynamic> json) => Message(
    clientMsgId: json['client_msg_id'] as String,
    seq: json['seq'] as int,
    sender: json['sender'] as String,
    text: json['text'] as String,
    ts: json['ts'] as int,
    status: MessageStatus.sent,
  );
}
