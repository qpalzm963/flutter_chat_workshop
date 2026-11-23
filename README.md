# 第 8 堂：房間列表 + 多工（完成版）

> 分支：`step-8-rooms`（starter）／`step-8-rooms-done`（完成版）
> Server：ACK 等級；開始可以自由分房、拉群

## 本堂目標

PM：「要有私訊和群組。」營運：「活動時要能把使用者拉進同一個群。」

架構轉折：連線從聊天頁提升到 App 層級（全 App 只有一條），每個房間的 `ChatController` 只從這條連線過濾出自己房間的訊息。

## 已經準備好的

- `models/room.dart`：`Room`、`Room.dmId(a, b)`
- `ui/room_list_page.dart`：房間列表 UI、私聊選人
- `data/chat_service.dart`：App 層級服務的骨架
- `LocalMessageStore` 的升版骨架（`onUpgrade` 裡的 SQL 留了 TODO）
- `HistoryApi.fetchRooms()`、`fetchOnlineUsers()`、`fetchMessages(roomId, …)`

## 你要完成的（`TODO(第 8 堂)`）

1. DB 升版：`messages` 加 `room_id` 和索引、新增 `rooms` 表、舊訊息歸到原本的兩人組房
2. `ChatSocket` 移到 App 層級（`ChatService`）；`ChatController` 每房一個，依 `room_id` 分流；ACK 依 `clientMsgId` 對應
3. 送出時帶 `room_id`；查詢、分頁、補洞都加上房間條件
4. 房間列表：啟動時 `GET /rooms` 寫進 DB，UI 訂閱 DB；收到 `room_added` 就新增；其他房間有新訊息時更新預覽並置頂
5. 私聊：`_open` 打開 `ChatPage(service, room)`（選人、算出 `dm:A:B`、本地建房都已經提供）

## 驗收清單

- [ ] 講師一鍵把 3 人拉進群組：不用重開 App，列表立刻多一間
- [ ] 群組裡有人發言：那一間跳到最上面，顯示最後一句
- [ ] 開著兩人組時，群組的訊息不會跑進兩人組的畫面
- [ ] 和夥伴私聊：雙方的列表都出現對方，第一句送得到
- [ ] 直接從第 7 堂的 App 升上來：兩人組的舊訊息還在
- [ ] 全 App 只有一條 WebSocket：進出好幾個房間，Server log 都沒有新的 `+ 你的名字`

## 講師補充（先想想）

- DB 升版實務：版本號怎麼管？可以刪欄位嗎？升版失敗怎麼辦？
- 為什麼不要一個房間開一條 WebSocket？

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
