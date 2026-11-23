/// 一則聊天訊息。第 1 堂只需要這三個欄位，之後幾堂會慢慢長大。
class Message {
  const Message({required this.sender, required this.text, required this.ts});

  final String sender;
  final String text;

  /// 毫秒時間戳（顯示用）
  final int ts;
}
