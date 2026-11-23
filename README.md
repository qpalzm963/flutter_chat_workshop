# 第 1 堂：接通 + 收發（純字串 → JSON）

> 分支：`step-1-connect`（starter）／`step-1-connect-done`（完成版）
> Server：講師先開「純字串」等級，升級 JSON 時切到「回音」等級（廣播包含自己）

## 本堂目標

PM：「先做一個能即時互傳的 MVP。」兩台模擬器在私人房裡互傳訊息。

## 已經準備好的

- 聊天頁、氣泡、輸入框、連線橫幅（`StreamBuilder` 已經接好 `ChatController.messages`）
- `ChatController` 的方法簽名
- `config.dart` 的 `wsUrl(名字)`

## 你要完成的（`TODO(第 1 堂)`）

1. 在 `connect()` 連上 `wsUrl(me)`
2. 先用 `sink.add` 送純字串；`listen` 收到什麼就顯示什麼
3. 追加需求：「訊息要顯示是誰傳的」→ 升級成 JSON（`type` / `sender` / `text`），收到後解析
4. `dispose()` 收尾

## 驗收清單

- [ ] 私人房兩台模擬器互傳，對方馬上看到
- [ ] 每則訊息都有寫是誰傳的
- [ ] 收到的 JSON 會看 `type`，不是 `message` 的不會被當成聊天訊息
- [ ] 按左上角返回離開聊天頁後，講師儀表板上你變成「離線」，Server log 出現 `- 你的名字`
- [ ] 最後全班切到大廳，大家互傳

## 講師補充（先想想）

- WebSocket 怎麼帶登入身分？
- 為什麼正式環境要用 `wss://`？

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
