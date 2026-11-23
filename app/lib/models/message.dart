// TODO(第 4 堂) 狀態列舉已經在 message_status.dart（sending / sent / failed）

/// 一則聊天訊息。第 1 堂只需要這三個欄位，之後幾堂會慢慢長大。
// TODO(第 4 堂) ① 加上 clientMsgId（前端產生的 UUID）、status、seq（Server 核發，送出前是 null）
class Message {
  const Message({required this.sender, required this.text, required this.ts});

  final String sender;
  final String text;

  /// 毫秒時間戳（顯示用）
  final int ts;
}
