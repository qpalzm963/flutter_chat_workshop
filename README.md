# 第 3 堂：反轉列表 UI（Bottom-anchored）

> 分支：`step-3-reverse-list`（starter）／`step-3-reverse-list-done`（完成版）
> Server：回音等級

## 本堂目標

設計師：「進房會閃一下，訊息還會被鍵盤擋住，要像 LINE 一樣。」追加：「我在看舊訊息時，不要把我拉走。」

## 已經準備好的

- `ChatController.messages` 本來就是「最新在前」
- 現在的聊天頁是一般 `ListView`：把列表反過來畫，每次有新資料就 `jumpTo` 到底（這就是會閃的原因）

## 你要完成的（`TODO(第 3 堂)`）

1. 改用 `ListView.builder(reverse: true)`
2. 用 `ScrollController` 判斷目前是不是在最底部
3. 往上翻時有新訊息進來：不要拉回去，改顯示「有新訊息 ↓」提示（提示元件和顯示 / 隱藏邏輯都自己寫）
4. 點提示或自己送出訊息時，捲回最底部

## 驗收清單

- [ ] 進房直接停在最底部，不會閃
- [ ] 鍵盤彈起時，列表跟著往上推，最新訊息沒有被擋住
- [ ] 往上翻時夥伴傳訊息，不會被拉回最底部，只出現提示
- [ ] 點提示或自己送出訊息後，回到最底部
- [ ] 講師灌 1000 則訊息，打開效能圖層，捲動仍然順暢

## 講師補充（先想想）

- 在列表中間插入新訊息時，畫面為什麼會跳？怎麼避免？
- 聊天室裡有很多大圖時，記憶體怎麼省？

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
