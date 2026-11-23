# Flutter 即時聊天室工作坊

10 堂課，從一條 WebSocket 寫到有房間列表、離線補收補送、已讀未讀的聊天 App。

```
server/   全班共用的 Server + 講師儀表板（純 dart:io，零依賴）
app/      Flutter App（main 上是第 9 堂完成版）
```

## 快速開始

```bash
cd server && dart run server.dart --admin=講師名字 --data=state.json
```

- 儀表板：瀏覽器開 `http://localhost:8080/admin`
- `--data`：狀態存檔，重啟後 `seq` 接續（課程跨週時一定要帶）
- `--level=raw|echo|ack`：起始行為等級（預設 `raw`，也可以在儀表板切換）

```bash
cd app && flutter run --dart-define=USER=Amy      # 第一台模擬器
cd app && flutter run --dart-define=USER=Amy-2    # 第二台（同一位學員，「-」前同名會進同一間私人房）
flutter run --dart-define=HOST=192.168.1.10        # 實機請帶電腦的區網 IP
```

不帶 `USER` 會先出現取名頁。

講師備課自檢（會自己啟動一台 Server，不用先開）：

```bash
cd server && dart run smoke_test.dart
```

## 講師儀表板

| 功能 | 用在 |
| :--- | :--- |
| 在線學員、各房間成員與最近 50 則訊息 | 全程 |
| 分房：私人房 / 兩兩一組 / 大廳 / 自訂群組（拉人時推 `room_added`） | 全程、第 8 堂 |
| 以講師身分發言、對房間灌 N 則 | 第 3、6、9 堂 |
| 對學員 `/drop`、`/zombie`、暫時拒絕連線 N 秒；`@all` | 第 1、2、5、7 堂 |
| 行為等級：純字串 → 回音（第 1～3 堂）→ ACK（第 4 堂起） | 第 1、4 堂 |
| 全域延遲 | 第 3、4 堂 |
| 重連時間軸（最近 3 次 `/drop`，對比有 / 無 Jitter） | 第 2 堂 |
| 每人每房的已讀位置，可直接設定 | 第 9 堂 |

## 現場搞破壞指令（直接在聊天室輸入）

| 指令 | Server 行為 |
| :--- | :--- |
| `/delay` | 3 秒後才回 ACK（回音等級：3 秒後才回音） |
| `/fail` | 照存照廣播，但不回 ACK（回條弄丟） |
| `/drop` | 踢斷自己、5 秒內拒絕重連，2 秒後機器人在你的房間發 3 句 |
| `/zombie` | 連線不關，但 Server 不再理你（不回 pong / ack / 訊息） |

講師可以加對象：`/drop Amy`、`/zombie @all`。訊息照常儲存並回 ACK 之後才生效，所以補送時重送同一則指令不會再觸發一次。

## 通訊協議

完整說明在 `server/server.dart` 檔頭。重點：

- 連線：`ws://host:8080/ws?user=Amy`；全 App 一條，承載所有房間。同名已在線會被拒絕。
- 送出：`{"type":"send","client_msg_id","room_id","text"}`
  - 第 1 堂可以直接送純字串
  - 沒帶 `client_msg_id` 時 Server 自動補
  - 沒帶 `room_id` 時送到講師分配的房間
  - `room_id` 為 `dm:A:B` 且房間不存在時，自動建立私聊
- Server 推送：`message`、`ack`、`read`、`room_added`、`pong`、`error`
- `seq` 以房間為單位，從 1 連續遞增
- REST（訊息一律依 `seq` 由小到大）：
  - `GET /rooms?user=Amy`：房間列表、最新 seq、最後一則、我的水位線、每人已讀位置
  - `GET /rooms/{id}/messages?before_seq= | after_seq= | around_seq=`：每頁預設 50 則
  - `GET /messages?user=Amy&...`：同上，房間為講師分配的那間（第 6～7 堂用，此時還沒有 `room_id`）
  - `GET /users`：在線學員

## App 架構（第 9 堂完成版）

```
lib/
  config.dart                    Server 位址、USER
  models/message.dart            Message + 狀態機 (sending/sent/failed)
  models/room.dart               Room、私聊 ID（dm:A:B）
  data/chat_socket.dart          WS：Heartbeat + Exponential Backoff + Jitter
  data/history_api.dart          REST：房間列表、before_seq / after_seq
  data/local_message_store.dart  SSOT：sqflite、分版升級（v1 單房 → v2 多房 → v3 已讀）、查詢視窗
  data/chat_service.dart         App 層級：唯一連線、ACK / 逾時 / 補送、房間列表、已讀事件
  data/chat_controller.dart      每房一個：進房補資料、兩段式分頁、補洞、已讀回報
  ui/room_list_page.dart         房間列表（未讀數、預覽、私聊）
  ui/chat_page.dart              反轉列表、有新訊息提示、未讀分隔線定位、可見訊息已讀
  ui/message_bubble.dart         氣泡 + 狀態圖示 + 已讀 / 已讀 N
```
