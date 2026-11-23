# 第 6 堂：Cursor 歷史分頁 + 進房載入最新一頁（完成版）

> 分支：`step-6-history-paging`（starter）／`step-6-history-paging-done`（完成版）
> Server：ACK 等級；課前講師幫每個兩人組房間灌 300 則

## 本堂目標

PM：「換新手機就看不到以前的對話了。」追加：「我想往上滑看昨天的訊息。」

## 已經準備好的

- `data/history_api.dart`：`fetch(beforeSeq: / afterSeq: / limit:)`，回傳依 `seq` 由小到大
- `ui/loading_older_indicator.dart`：列表頂端的載入中轉圈
- `LocalMessageStore` 的 `latestSeq()`／`oldestSeq()`／`count()`：本地最新、最舊的 `seq` 和總筆數
- 每頁 50 則（`HistoryApi.pageSize`）

## 你要完成的（`TODO(第 6 堂)`）

1. 進房時本地 DB 是空的 → 抓最新一頁寫進 DB
2. `watchMessages` 加上 `limit`：UI 只看本地最新的一段
3. 快捲到頂時用兩段式分頁：先把本地視窗開大，本地不夠才用最舊的 `seq` 呼叫 `before_seq`，結果寫進 DB
4. 載入中旗標，以及「沒有更早的訊息了」的判斷

## 驗收清單

- [ ] 刪掉 App 重裝（模擬換新手機），進房看到最新一頁
- [ ] 一路往上滑：無縫載入，不會重複，畫面不會跳
- [ ] 滑到最舊的訊息後，不會再打 API
- [ ] 本地 DB 不是空的時候，進房不會去抓最新一頁

## 思考分享

- 點擊一則回覆，要怎麼跳到三天前的那則原訊息？
- 本地 DB 無限長大怎麼辦？

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
