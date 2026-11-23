/// 訊息狀態機：sending ─(收到 ACK)→ sent
///                    └─(逾時)→ failed ─(點擊重試 / 重連自動補送)→ sending
enum MessageStatus { sending, sent, failed }
