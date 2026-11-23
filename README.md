# 第 7 堂：斷線補洞（Delta Sync）+ 補送

> 分支：`step-7-delta-sync`（starter）／`step-7-delta-sync-done`（完成版）
> Server：ACK 等級；固定兩兩一組

## 本堂目標

客服：「出電梯之後，中間的訊息不見了。」「在捷運上傳的訊息沒有送出去。」

## 已經準備好的

- `HistoryApi.fetch(afterSeq:)`
- `LocalMessageStore` 的查詢工具

## 你要完成的（`TODO(第 7 堂)`）

1. `ChatController` 監聽連線狀態：每次連上（包含 App 剛啟動）都觸發 2、3
2. 補收：從本地的 cursor 用 `after_seq` 一頁一頁補進 DB，直到不足一頁
3. 補送：DB 中所有還沒送達的（sending + failed），依建立時間、帶原本的 `clientMsgId` 重送，並重設 ACK 逾時
4. 紅點的意思改成「目前還沒送達」，點擊立刻重送

## 驗收清單

- [ ] 輸入 `/drop`：斷線期間機器人說的 3 句，連回後自動補齊
- [ ] 講師拒絕你連線 30 秒，期間送出 3 則：解除後自動送出，夥伴依序收到，不重複
- [ ] 離線時送出訊息後殺掉 App，解除封鎖再打開，訊息仍然送得出去
- [ ] 夥伴在你斷線期間傳的訊息，連回後全部出現

## 思考分享

- 離線三天，補洞要補幾千則怎麼辦？

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
