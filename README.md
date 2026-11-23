# 第 9 堂：已讀 + 未讀

> 分支：`step-9-read-receipts`（starter）／`step-9-read-receipts-done`（完成版）
> Server：ACK 等級

## 本堂目標

PM：「要有已讀。」追加：「群組要顯示幾人已讀。」「未讀 300 則時，要從第一則未讀開始看。」

## 已經準備好的

- DB v3：`reads` 表（每人每房的已讀位置）、`rooms.my_read_seq`
- 氣泡的已讀標籤位置（`MessageBubble.readLabel`）
- `ui/unread_divider.dart`：「以下為未讀訊息」分隔線
- `ui/seq_tracker.dart`：把畫面上的氣泡登記到 `seq → BuildContext`
- `LocalMessageStore` 的 `countFrom()`、`hasSeq()`：定位第一則未讀時用（TODO ④）

## 你要完成的（`TODO(第 9 堂)`）

1. 捲動時算出畫面上看得到的最大 `seq`，Debounce 500ms 後經 WS 回報 `{"type":"read","room_id","seq"}`，只往前推
2. 收到別人的已讀更新就寫進 DB；自己的訊息顯示「已讀」或「已讀 N」
3. 房間列表顯示未讀數
4. 進房時定位到第一則未讀（`center` key 錨點），加上「以下為未讀訊息」分隔線和「跳到最新 ↓」

## 驗收清單

- [ ] 捲動時，儀表板上你的已讀位置跟著往前走
- [ ] 夥伴讀了，你的訊息顯示「已讀」；3 人群組顯示「已讀 2」
- [ ] 講師把你的已讀位置設到第 50 則再灌 300 則：列表顯示未讀 300，進房停在分隔線
- [ ] 只有真的出現在畫面上的訊息才算已讀
- [ ] 新裝置第一次進房、第一則未讀不在本地時：停在底部，並提示上方還有幾則未讀

## 思考分享

- 千人群組的已讀，要推給幾個人？

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
