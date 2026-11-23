# 第 4 堂：樂觀更新 + ACK + 冪等

> 分支：`step-4-optimistic-ack`（starter）／`step-4-optimistic-ack-done`（完成版）
> Server：講師切到「ACK」等級（不再回音給發送者，改回 ACK）

## 本堂目標

PM：「網路慢的時候，按送出要等很久才看得到。」QA：「對方收到兩則一模一樣的訊息。」

## 已經準備好的

- `models/message_status.dart`：`sending` / `sent` / `failed`
- 氣泡已經有三種狀態圖示，只要把 `status` 傳進去；紅點點擊會呼叫 `onRetry`

## 你要完成的（`TODO(第 4 堂)`）

1. `Message` 加上 `clientMsgId` / `status` / `seq`
2. 送出時先插入一筆 sending 上螢幕，再送出 JSON（帶 `client_msg_id`）
3. 收到 `ack`：用 `client_msg_id` 找到那一筆 → 改成 sent，填上 `seq`
4. 5 秒沒收到 ACK → failed
5. 點紅點重試
6. 翻車現場：`/fail` 之後重試，夥伴看到兩則一樣的訊息 → 找出原因並修正

## 驗收清單

- [ ] 講師開全域延遲，或輸入 `/delay`：訊息立刻上螢幕（轉圈），約 3 秒後變成勾勾
- [ ] `/fail`：5 秒後變紅點
- [ ] 紅點連點好幾次重試，夥伴那邊只會出現一則
- [ ] 列表順序以 Server 核發的 `seq` 為準

## 思考分享

- 使用者把手機時間調快，訊息順序會亂嗎？
- 列表有一萬則訊息時，收到 ACK 要怎麼快速找到那一筆？

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
