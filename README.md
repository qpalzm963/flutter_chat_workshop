# Flutter 即時聊天室工作坊

10 堂課，從一條 WebSocket 寫到有房間列表、離線補收補送、已讀未讀的聊天 App。

```
app/      Flutter App（學員寫的；main 上是第 9 堂完成版）
server/   全班共用的 Server + 講師儀表板（講師開；純 dart:io，零依賴）
docs/     教學腳本（逐堂流程、結尾鉤子、思考題）
slides/   每堂簡報
```

## 誰看哪裡

| 角色 | 負責 | 要看的文件 |
| :--- | :--- | :--- |
| **學員** | 寫 `app/`：連線、重連、列表、ACK、DB、分頁、補洞、房間、已讀 | 本頁「學員：跑起 App」「通訊協議」「現場搞破壞指令」 |
| **講師** | 開 `server/`、用儀表板分房與搞破壞，帶出每堂的情境 | [server/README.md](server/README.md)（講師使用手冊）、[docs/lesson-plan.md](docs/lesson-plan.md) |

> Server 是教具，學員不需要讀懂、也不會改它。上課時全班連同一台（講師電腦）。

## 環境需求

| | 版本 / 條件 |
| :--- | :--- |
| Flutter | 符合 `app/pubspec.yaml` 的 Dart SDK（`^3.13.7`） |
| Dart | Server 只用到 `dart:io`，裝好 Flutter 就有 `dart` 指令 |
| 網路 | 學員與講師電腦在**同一個區網**（實機必須；模擬器跑在講師電腦上則不用） |

## 講師：開 Server

```bash
cd server && dart run server.dart --admin=講師名字 --data=state.json
```

- 儀表板：瀏覽器開 `http://localhost:8080/admin`
- 課前自檢：`cd server && dart run smoke_test.dart`（會自己開一台臨時 Server，不用先開）
- 參數、每堂要按哪些按鈕、跨週存檔與重置 → 看 [server/README.md](server/README.md)

## 學員：跑起 App

```bash
cd app
flutter pub get
flutter run --dart-define=USER=Amy                         # 第一台模擬器
flutter run --dart-define=USER=Amy-2                       # 第二台（同一位學員：「-」前同名會進同一間私人房）
flutter run --dart-define=USER=Amy --dart-define=HOST=192.168.1.10   # 實機：帶講師電腦的區網 IP
```

- 不帶 `USER` 會先出現取名頁。
- 預設連線位址：Android 模擬器 `10.0.2.2`、其他平台 `localhost`、Port `8080`（見 `app/lib/config.dart`）。
- 每個名字一個本地 DB 檔（`chat_<名字>.db`），同一台模擬器換名字登入不會混到別人的資料。

### 連不上時先看這裡

| 現象 | 原因 / 處理 |
| :--- | :--- |
| 一直顯示「已斷線，自動重連中…」 | Server 沒開、`HOST` 帶錯，或實機跟講師電腦不在同一個網段 |
| 連線被拒（409） | 同名已在線。第二台模擬器請用 `Amy-2` 這種名字 |
| 連線被拒（503） | 被 `/drop` 或講師「拒絕連線」中，等幾秒會自動連回（這是課堂設計，不是 bug） |
| 訊息順序 / seq 對不上、補洞怪怪的 | Server 被重置過（講師刪了存檔）。刪掉 App 重裝，或清除 App 資料 |

## 現場搞破壞指令（直接在聊天室輸入）

| 指令 | Server 行為 |
| :--- | :--- |
| `/delay` | 3 秒後才回 ACK（回音等級：3 秒後才回音） |
| `/fail` | 照存照廣播，但不回 ACK（回條弄丟） |
| `/drop` | 踢斷自己、5 秒內拒絕重連，2 秒後機器人在你的房間發 3 句 |
| `/zombie` | 連線不關，但 Server 不再理你（不回 pong / ack / 訊息） |

- 學員下指令只影響自己；講師可以指定對象：`/drop Amy`、`/zombie @all`。
- 訊息會照常儲存並回 ACK，之後指令才生效，所以補送時重送同一則指令不會再觸發一次。

## 通訊協議

完整說明在 `server/server.dart` 檔頭。重點：

- 連線：`ws://host:8080/ws?user=Amy`；全 App 一條，承載所有房間。同名已在線會被拒絕。
- 送出：`{"type":"send","client_msg_id","room_id","text"}`
  - 第 1 堂可以直接送純字串
  - 沒帶 `client_msg_id` 時 Server 自動補
  - 沒帶 `room_id` 時送到講師分配的房間
  - `room_id` 為 `dm:A:B` 且房間不存在時，自動建立私聊
- 已讀：`{"type":"read","room_id","seq"}`（水位線只會前進）
- 心跳：`{"type":"ping"}` → `{"type":"pong"}`
- Server 推送：`message`、`ack`、`read`、`room_added`、`pong`、`error`
- `seq` 以房間為單位，從 1 連續遞增
- REST（訊息一律依 `seq` 由小到大）：
  - `GET /rooms?user=Amy`：房間列表、最新 seq、最後一則、我的水位線、每人已讀位置
  - `GET /rooms/{id}/messages?before_seq= | after_seq= | around_seq=`：每頁預設 50 則（`limit` 上限 200）
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
