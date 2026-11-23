# Flutter 即時聊天室工作坊：專案骨架

> 分支：`step-0-starter`

10 堂課，從一條 WebSocket 寫到有房間列表、離線補收補送、已讀未讀的聊天 App。每堂兩個分支：

- `step-N-主題`：上課的起點（starter），要寫的地方標了 `TODO(第 N 堂)`
- `step-N-主題-done`：該堂完成版，跟不上時可以切過去接著上下一堂

| 堂 | 分支 |
| :--- | :--- |
| 1 | `step-1-connect`：接通 + 收發（純字串 → JSON） |
| 2 | `step-2-heartbeat`：心跳 + 自動重連 |
| 3 | `step-3-reverse-list`：反轉列表 UI |
| 4 | `step-4-optimistic-ack`：樂觀更新 + ACK + 冪等 |
| 5 | `step-5-local-db`：本地 DB（SSOT） |
| 6 | `step-6-history-paging`：Cursor 歷史分頁 + 進房載入最新一頁 |
| 7 | `step-7-delta-sync`：斷線補洞 + 補送（課後挑戰：`step-7-challenge-ranges`） |
| 8 | `step-8-rooms`：房間列表 + 多工 |
| 9 | `step-9-read-receipts`：已讀 + 未讀 |

## 骨架裡已經有的

```
app/lib/
  config.dart                 Server 位址、wsUrl(名字)
  models/message.dart         最小的 Message（sender / text / ts）
  models/connection_status.dart
  models/message_status.dart  sending / sent / failed（第 4 堂才會用到）
  data/chat_controller.dart   只有方法簽名的 ChatController
  ui/chat_page.dart           聊天頁：StreamBuilder 已經接好 ChatController.messages
  ui/message_bubble.dart      氣泡（含狀態圖示、已讀標籤位置）
  ui/chat_input.dart          輸入框
  ui/connection_banner.dart   連線橫幅
server/                       全班共用的 Server + 講師儀表板
```

骨架可以直接跑：會看到聊天頁，但還連不上、送不出去。

## 執行

Server：上課時講師會開一台全班共用的；自己練習時在本機開：

```bash
cd server && dart run server.dart --admin=你的名字 --data=state.json
```

儀表板：`http://localhost:8080/admin`（行為等級、分房、灌訊息都在這裡）

App（兩台模擬器各帶一個名字；第二台用「名字-2」，會跟第一台進同一間私人房）：

```bash
cd app && flutter run --dart-define=USER=Amy
cd app && flutter run --dart-define=USER=Amy-2
```

連講師的 Server 要再加 `--dart-define=HOST=講師電腦的 IP`。
