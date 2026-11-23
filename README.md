# 第 2 堂：心跳 + 自動重連（Backoff + Jitter）（完成版）

> 分支：`step-2-heartbeat`（starter）／`step-2-heartbeat-done`（完成版）
> Server：回音等級

## 本堂目標

客服：「切背景回來就收不到訊息。」後端：「Server 一重啟，就被大家的重連打爆。」

## 已經準備好的

- 連線邏輯已經從 `ChatController` 拆到 `data/chat_socket.dart` 的 `ChatSocket`（連線、送出、事件串流都搬好了）
- 連線橫幅已經接好 `ChatSocket.status`

## 你要完成的（`TODO(第 2 堂)`）

1. 每 10 秒送一次 ping；5 秒內沒收到 pong 就主動斷線
2. `onDone` / `onError` 時排程重連：1s → 2s → 4s …，上限 30s，再加上隨機毫秒
3. 連上之後重置重試次數
4. 對外發出連線狀態（連線中 / 已連線 / 已斷線）
5. `dispose()` 時清掉所有 Timer

> 課堂用 10 秒 ping、5 秒逾時，方便觀察。正式環境通常是 25～30 秒。

## 驗收清單

- [ ] 對自己下 `/zombie`，20 秒內自動連回來
- [ ] 斷線時橫幅會顯示，連回來後橫幅消失
- [ ] 講師下 `/drop @all`，儀表板的重連時間軸上，大家是錯開的
- [ ] 按左上角返回離開聊天頁之後，Server log 不會再出現你的重連紀錄

## 講師補充（先想想）

- App 切到背景或被殺掉之後，要怎麼收到訊息？

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
