# 第 5 堂：本地 DB（SSOT）（完成版）

> 分支：`step-5-local-db`（starter）／`step-5-local-db-done`（完成版）
> Server：ACK 等級；第 5～7 堂固定兩兩一組，不換房

## 本堂目標

客服：「關掉 App 重開，聊天紀錄全不見了。」

## 已經準備好的

- `data/local_message_store.dart`：資料表、`watchMessages()` 查詢、`Message` 與資料列的轉換
- 每個名字一個 DB 檔（`chat_<名字>.db`）

## 你要完成的（`TODO(第 5 堂)`）

1. `ChatController` 的記憶體 List 換成 `LocalMessageStore`
2. 寫 upsert（`INSERT … ON CONFLICT(client_msg_id) DO UPDATE`）和「資料變了」的通知
3. 送出時寫一筆 sending、收到 ACK 時更新、收到廣播時 upsert
4. `messages` 改成訂閱 DB（UI 不用改）
5. 啟動時，殘留的 sending 改成 failed

## 驗收清單

- [ ] 殺掉 App 重開，訊息立刻出現，不會白屏
- [ ] 講師暫時拒絕你的連線時重開 App：仍然看得到所有訊息，也看得到斷線橫幅
- [ ] 送到一半就殺掉 App，重開後那則變成紅點
- [ ] 同一則訊息不會因為重複寫入而出現兩次

## 思考分享

- 千人群組每秒湧入 30 則訊息，畫面卡死了怎麼辦？

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
