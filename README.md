# Flutter 聊天室實戰工作坊

從零到一寫出即時聊天室：WebSocket → Bottom-anchored UI → Optimistic UI / 冪等 → SSOT + Cursor 分頁 → 心跳 / Backoff / Delta Sync。

```
server/   純 dart:io 的「可控搞破壞 Server」（零依賴）
app/      Flutter App
```

## 快速開始

```bash
cd server && dart run server.dart          # ws://localhost:8080/ws
cd app && flutter run                      # Android 模擬器自動改連 10.0.2.2
flutter run --dart-define=HOST=192.168.1.10  # 實機請帶電腦區網 IP
```

講師備課自檢（Server 開著時）：

```bash
cd server && dart run smoke_test.dart
```

## 現場搞破壞指令（直接在聊天室輸入）

| 指令 | Server 行為 | 驗收什麼 |
| :--- | :--- | :--- |
| `/delay` | 3 秒後才回 ACK | 第 3 堂：訊息秒上屏、轉圈 → 勾勾 |
| `/fail` | 訊息照收照廣播，但**不回 ACK**（模擬回應弄丟） | 第 3 堂：5 秒逾時變紅點；連點重試拿回同一個 seq、不洗版 |
| `/drop` | 踢斷所有連線、5 秒內拒絕重連、2 秒後機器人發 3 句 | 第 5 堂：斷線橫幅 → backoff 重連 → 3 句自動補齊 |
| `/zombie` | 連線不關，但不再回任何東西（含 pong） | 第 5 堂：心跳逾時偵測假死並重連（≤15 秒） |

## 通訊協議

WebSocket（用 `type` 區分事件）：

```jsonc
// client → server
{"type":"send","client_msg_id":"<uuid>","sender":"Amy","text":"hi"}
{"type":"ping"}
// server → 發送者
{"type":"ack","client_msg_id":"<uuid>","seq":12,"ts":1700000000000}
{"type":"pong"}
// server → 其他人
{"type":"message","seq":12,"client_msg_id":"<uuid>","sender":"Amy","text":"hi","ts":1700000000000}
```

REST（回傳一律 seq 由小到大）：

- `GET /messages?before_seq=X&limit=20`：往上翻歷史（Cursor 分頁）
- `GET /messages?after_seq=X&limit=100`：斷線補洞（Delta Sync）
- `GET /messages?limit=20`：最新一頁

Server 啟動時會預先塞 200 則歷史訊息，方便示範分頁。

## App 架構（step-5 完成版）

```
lib/
  config.dart                    Server 位址
  models/message.dart            Message + 狀態機 (sending/sent/failed)
  data/local_message_store.dart  SSOT：sqflite，client_msg_id 主鍵去重、seq 排序
  data/chat_socket.dart          WS：Heartbeat + Exponential Backoff + Jitter
  data/history_api.dart          REST：before_seq / after_seq
  data/chat_controller.dart      單向資料流：發送、ACK 逾時、重試、補洞、分頁
  ui/chat_page.dart              ListView.builder(reverse: true)、有新訊息提示、連線橫幅
  ui/message_bubble.dart         氣泡 + 狀態圖示（點紅點重試）
```
