import '../config.dart';
import 'chat_socket.dart';
import 'history_api.dart';
import 'local_message_store.dart';

/// App 層級：全 App 唯一的一條連線。房間列表頁和每個房間的 ChatController 都透過它收送。
// TODO(第 8 堂) ② 把 ACK / 逾時 / 補送從 ChatController 搬到這裡：ACK 只看 client_msg_id，沒開著的房間也可能有待送的訊息
class ChatService {
  ChatService({required this.me, required this.store, HistoryApi? api})
    : api = api ?? HistoryApi(me),
      socket = ChatSocket(wsUrl(me));

  final String me;
  final LocalMessageStore store;
  final HistoryApi api;
  final ChatSocket socket;

  void start() {
    socket.connect();
  }

  void dispose() {
    socket.dispose();
  }
}
