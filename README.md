# 第 7 堂課後挑戰：範圍表（Loaded Ranges）

> 分支：`step-7-challenge-ranges`（starter，從第 7 堂完成版出發）／`step-7-challenge-ranges-done`（參考解）

## 題目

現在的補洞會把斷線期間的訊息全部補回來，離線三天就得一次補幾千則。改成用「範圍表」記錄本地已經有哪幾段：

- 新增資料表 `loaded_ranges(start_seq, end_seq)`：記錄本地連續擁有的區段
- 重連時只抓最新一頁；如果跟本地最新的區段接不上，中間就是一個洞
- 往上滑到洞的邊緣時，才補那一段（`before_seq` 從洞的上緣往前抓）
- 補進來的區段和相鄰區段接上時，要合併

## 驗收清單

- [ ] 講師拒絕你連線，期間灌 500 則（儀表板灌訊息的數字改成 500）；連回後只打一次 API 就看到最新訊息
- [ ] 往上滑到洞的邊緣時自動補那一段，捲動時不會重複、也不會漏訊息
- [ ] 洞補完之後，`loaded_ranges` 合併回一段
- [ ] 殺掉 App 重開，範圍表還在，不會重抓已經有的區段

## 延伸想想

- 範圍表還能解決哪些問題？（提示：第 6 堂的跳到回覆、第 9 堂的未讀定位）

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
