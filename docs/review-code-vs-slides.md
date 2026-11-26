# 簡報 vs 程式碼比對（第 1–10 堂）

> 審查日期：2026-11-25。唯讀審查，除本檔外沒有改任何檔案，也沒有 checkout、commit 或碰 dev server。

## 範圍與方法

- **簡報**：`slides/decks/lesson-*/index.tsx`。第 1 堂以 `lesson-01-v2` 為準，舊的 `lesson-01-connect` 和 `style-trial-isometric` 沒有審。
- **程式碼**：各堂在本機分支 `step-N-<name>`（學員起點）和 `step-N-<name>-done`（解答），第 7 堂另有 `step-7-challenge-ranges(-done)`。第 10 堂沒有分支，以 `main` 為「目前系統」。全部用 `git show '<branch>:<path>'` 讀，沒有 checkout。
- **Server**：`server/server.dart` 在所有分支和 `main` 是同一份已 commit 的檔案（764 行），下文的 server 行號都以這份為準。工作區還有未 commit 的修改（1964 行）：LAN IP 偵測、`/ws-test`、新版儀表板（含 LESSONS 預設、「兩人房各灌 300 則」等按鈕）。協定邏輯沒有變，但凡是只存在工作區的功能，下文都會註明。
- **課綱**：`docs/lesson-plan.md`（唯讀）。
- 先由 5 個子代理各比對兩堂，每組抽 1–2 條最重要的結論，由我直接對程式碼複查。複查過的條目：L1 私人房依 `_base`、L4 沒有離開聊天頁的入口、L6 `latestSeq/oldestSeq/count` 只在 done 分支、L7 `syncCursor` 在 store 且 `_db` 是私有欄位、`_flushOutbox` 不等 ACK、L9 `chat_page.dart:82` 提早 return、`:236` 只有 `dm` 顯示「已讀」。其餘條目沒有逐條複查。
- 嚴重度分三級：**會讓學員卡住**／**會誤導**／**小瑕疵**。

## 各堂條數

| 堂 | 會讓學員卡住 | 會誤導 | 小瑕疵 |
| :- | :-: | :-: | :-: |
| 1 | 3 | 1 | 3 |
| 2 | 2 | 2 | 4 |
| 3 | 0 | 2 | 1 |
| 4 | 1 | 1 | 2 |
| 5 | 0 | 2 | 1 |
| 6 | 2 | 3 | 3 |
| 7 | 1 | 1 | 2 |
| 8 | 0 | 1 | 6（含 1 條待確認） |
| 9 | 0 | 3 | 5 |
| 10 | 0 | 1 | 2 |

核心技術參數，簡報和程式碼都一致：握手 `/ws?user=`、心跳 10s/5s、backoff `min(30, 2^n)` 秒加 0–999ms jitter、`client_msg_id`、ACK 逾時 5s、`byClientId` 去重、`/fail`、`/delay`、upsert、`chat_<user>.db`、每頁 50 筆加 `before_seq`、`after_seq`（每頁 100 筆）、outbox 用 status 欄位、房間 id 格式（`private:` `pair:` `lobby` `group:` `dm:A:B`）、`room_added`、DB v1→v2→v3 的 SQL、debounce 500ms、`read` 水位線只前進、E2EE 只放延伸閱讀。**問題集中在：教學操作做不到、starter 缺 API、儀表板前置狀態、圖和實際行為不符。**

---

## 跨堂優化方向（前 5 名）

1. **驗收要學員「離開聊天頁」，但 App 沒有離開的入口（第 1、2、4 堂）**。改程式碼。
   - 問題：`NamePage` 用 `pushReplacement` 進聊天頁；用 `--dart-define=USER` 啟動時，`ChatPage` 直接就是首頁（`app/lib/main.dart:18,37`，第 0–7 堂都一樣）。結果 `dispose` 關連線、停重連、取消 ACK Timer 這三條驗收都驗不出來，而 Resource Disposal 正是第 1 堂的面試關鍵字。
   - 建議：從 `step-0-starter` 起把 `pushReplacement` 改成 `push`，或在 `ChatPage` 的 AppBar 放一個「離開」鈕，然後 rebase 後面的分支鏈。到第 8 堂有房間列表後，這個問題自然就解決了。

2. **簡報提示用到的 API 在 starter 裡不存在，或寫的範圍不對（第 2、6、7 堂）**。逐條決定改哪一邊。
   - 第 6 堂：提示用 `store.latestSeq()`、`oldestSeq()`、`count()`，這三個只在 done 分支有，照提示寫會編譯失敗。建議改 starter，把這三個方法放進去，因為它們不是本堂重點。
   - 第 7 堂：ImplA 說「全部寫在 chat_controller.dart」，但 `syncCursor` 必須寫在 store（`_db` 是私有欄位）。建議改簡報，加一條 TODO「在 LocalMessageStore 加 syncCursor」，因為「別人的最新 seq」本來就是本堂重點。
   - 第 2 堂：講稿說 ChatSocket 是空殼，要學員自己搬程式，但 starter 已經搬好。建議改講稿。
   - 根本做法：寫一個小腳本，從每份 deck 的 `<Kw>` 和 notes 抽出識別字，對該堂 starter 分支 grep，找不到就列出來。這種檢查交給程式做，不要靠人眼。

3. **儀表板／Server 的前置狀態沒有寫進講稿，有些開關根本不存在（第 1、2、4、6、8 堂）**。主要改簡報，部分改程式碼。
   - 第 1 堂：沒提要先切「純字串」，改 JSON 前再切「回音」。沒切的話 `jsonDecode` 會拋錯；而且 `--data` 會從 state.json 讀回上次的等級。
   - 第 4 堂：沒交代全域延遲要歸零，延遲沒歸零會讓 `/delay` 接近 5 秒逾時（待實機確認）。
   - 第 2 堂：講稿要「先切到沒 Jitter 再切到有 Jitter」，但 server 沒有這個開關，jitter 寫死在 client。
   - 第 6 堂：「兩人房各灌 300 則」只在未 commit 的工作區。
   - 第 8 堂：要先等全班升版連上一次，再分房，否則舊訊息會歸錯房。
   - 建議：每份講稿第一頁固定放一段「開場前儀表板狀態」checklist。把工作區的 server commit，或在講稿註明需要哪一版。Jitter 對比要嘛在 server 或 client 加一個開關（例如 `--dart-define=JITTER=0`），要嘛把講稿改成只看有 jitter 的時間軸。

4. **時序圖、狀態圖、演進表和程式碼的實際行為不一致（第 2、3、6、7 堂）**。改簡報。
   - 第 7 堂 ResendFlow：圖上畫「第一則等 ACK 才送第二則」，但 `_flushOutbox` 只 await DB 寫入，兩則會連續送出。
   - 第 2 堂狀態機：畫了 4 種狀態，enum 只有 3 種。
   - 第 3 堂：驗收寫「往上翻時畫面不動」，但 reverse 列表在 index 0 插入時畫面會位移，同一份簡報的 ExtraShift 講稿自己也承認。
   - 第 6 堂：能力演進表寫「往上滑撈得到」斷線期間的訊息，實際撈不到，而且和本堂結尾鉤子互相矛盾。
   - 第 6 堂 curl：講稿說「看後面 5 則」，但 server 回傳是由小到大，重複的那則在前 5 則。
   - 這類錯誤會直接教錯觀念，修正成本又低，建議優先處理。

5. **身分與房間規則（`_base`、房間 kind）沒有在第 1 堂講清楚，後面好幾堂都會踩到（第 1、6、9、10 堂）**。改簡報，第 9 堂可以順便改程式碼。
   - 第 1 堂：講稿要學員取兩個不同的名字，但私人房是依 `split('-')` 決定，只有 Amy 和 Amy-2 會同房，Amy 和 Bob 互傳看不到。
   - 第 6 堂：「換名字登入」會被分到新的私人房，看不到原本兩人房的訊息。
   - 第 10 堂：講稿說 Amy-2「其實是另一個人」，但 server 把 Amy 和 Amy-2 放進同一個私人房，也放進同一個兩人組。
   - 第 9 堂：兩人組 `kind=='pair'` 顯示「已讀 1」，不是講稿說的「已讀」（`chat_page.dart:236`）。
   - 建議：第 1 堂加一頁「名字規則：Amy / Amy-2 = 同一人兩台裝置」，之後各堂引用這一頁。第 9 堂可以把判斷改成「房間只有 2 人就顯示『已讀』」，或改講稿。

**次要的程式碼修正候選**（都沒有實機驗證）：
- 第 9 堂：自己剛送出的訊息被 ACK 後，因為 `clientMsgId` 沒變，`_onNewList` 提早 return，可能出現「未讀 1」。
- 第 8 堂：升版後，舊 outbox 第一次補送帶 `room_id: ''`，會被 server 拒絕。
- 第 7 堂：重連瞬間 cursor 會跳過的小窗口。講稿已經明講，可以留作課後挑戰。

## 沒能檢查的部分

- **完全沒有實機或模擬器執行**，也沒有跑 curl 或 server。所有結論都是讀程式碼推出來的；標「待確認」的條目尤其需要上機驗證。
- 簡報的視覺呈現沒有看：版面溢出、ChatPhone 內被裁掉的內容、step 動畫順序。
- 講稿中的業界事實沒有查證，例如 Socket.IO、Stripe Idempotency-Key、Telegram、tus。
- 工作區未 commit 的 server 只看了 diff 範圍，沒有逐行審新儀表板的 JS／HTML。
- `lesson-01-connect`（舊版）和 `style-trial-isometric` 沒有審。
- 第 7 堂的 challenge-ranges 只對照了簡報提到的部分。

---

# 逐堂明細


比對來源：`slides/decks/lesson-01-v2/index.tsx`、`slides/decks/lesson-02-heartbeat/index.tsx`、`docs/lesson-plan.md`（第 1、2 堂）、分支 step-0-starter / step-1-connect / step-1-connect-done / step-2-heartbeat / step-2-heartbeat-done（`git show` 讀取）、`server/server.dart`（已 commit 版，各分支同一份；行號以 commit 版為準）。

已核對且一致（不列為問題）：
- WS 握手 URL：簡報 `/ws?user=`、`config.dart` 的 `wsUrl()`、server `_handleWs`（server.dart:139-170）一致；缺 user→400、同名→409、被 /drop 拒連→503 都存在。
- curl 握手示範：server 用 `WebSocketTransformer.isUpgradeRequest`，curl 帶的 header 足以拿到 101（未實跑，依程式判斷）。
- 心跳：簡報 10 秒 ping、5 秒 pong 逾時、正式 25～30 秒，與 README、lesson-plan、`chat_socket.dart:21-22 @ step-2-heartbeat-done` 一致；server `{"type":"ping"}`→`{"type":"pong"}`（server.dart:192-193）存在。
- Backoff：簡報 1→2→4→8→16→30（上限）、`min(30, 2^n)` + 0～1000 ms 隨機，與 `chat_socket.dart:95-96 @ step-2-heartbeat-done`（`nextInt(1000)`）一致；連上後 `_attempt = 0`（:49）一致。
- `/zombie`（server.dart:294-301、607、613）：連線不關、不回 pong/訊息，行為與講稿一致；`/drop`（:271-292）踢斷 + 5 秒拒連 + 2 秒後機器人 3 句，存在。儀表板（已 commit 版）有每人 /drop、/zombie、拒絕連線按鈕與「/drop @all」「/zombie @all」、重連時間軸（:674-689）。
- 簡報沒有引用 `/ws-test`、逐堂小抄或新儀表板按鈕。
- 學員頁未放答案；step-1-connect、step-2-heartbeat starter 只有 TODO，沒有洩題。

## 第 1 堂

- **[會讓學員卡住]** 「兩個不同的名字」會被分到兩間不同的私人房，互傳看不到
  - 簡報：`slides/decks/lesson-01-v2/index.tsx:1090`（ImplA 副標「私人房，開兩台模擬器，用兩個不同的名字」）、`:1474`（講稿「名字要不一樣」）
  - 程式碼：`server/server.dart:170`（新連線自動進 `_privateRoom(user)`）、`server/server.dart:313`（`_base(user) => user.split('-').first`，只有 Amy / Amy-2 會同房）；分支 README（step-1-connect）寫「第二台用『名字-2』，會跟第一台進同一間私人房」
  - 差異：學員照簡報取 Amy、Bob 會各進 `private:Amy`、`private:Bob`，互傳完全看不到對方，第一個實作就卡住。
  - 建議改：簡報，把副標和講稿改成「第二台用『名字-2』（如 Amy / Amy-2）」，與 README、server 規則一致。

- **[會讓學員卡住]** 「離開聊天頁」在 App 裡做不到
  - 簡報：`slides/decks/lesson-01-v2/index.tsx:1176`（Acceptance「離開聊天頁後，講師儀表板上看不到你的連線」）、`:1535`（講稿「請大家離開聊天頁」）；目標 `:628`
  - 程式碼：`app/lib/main.dart:37 @ step-1-connect`（NamePage 用 `pushReplacement` 進聊天頁，聊天頁沒有上一頁）；帶 `--dart-define=USER=` 時 ChatPage 直接是 home；`app/lib/ui/chat_page.dart @ step-1-connect` 沒有離開按鈕
  - 差異：沒有任何導覽能讓 ChatPage 被 pop、觸發 `dispose()`。學員只能殺 App 或 hot restart；殺 App 是 OS 關連線（測不到 dispose），hot restart 不會呼叫 dispose（server.dart:165 註解也提到 hot restart 留死線），驗收項目無法驗證 TODO ④。README 版寫「Server 的 log 顯示連線已斷開」，同樣做不到。另外儀表板使用者列表離線者仍會列出（server.dart:447 `online:false`），「看不到你的連線」措辭也不精確。
  - 建議改：程式碼（starter 的 NamePage 改 `push`，或聊天頁加「離開」按鈕），否則 dispose 這個學習目標沒有可驗證的操作。

- **[會讓學員卡住]** 講稿完全沒提要切 Server 行為等級（純字串 → 回音）
  - 簡報：`slides/decks/lesson-01-v2/index.tsx:1473-1476`（ImplA 講稿）、`:1496-1499`（Midway 講稿）、`:1534`（ImplB/驗收講稿）——全份 grep 不到「等級／回音／echo／raw」
  - 程式碼：`server/server.dart:76`（預設 `Level.raw`，但 `--data` 會從 state.json 讀回上次的等級）、`:607-614`（raw 等級只廣播純文字、不送 JSON）、`:665`（儀表板等級按鈕）；`app/lib/data/chat_controller.dart:43 @ step-1-connect-done`（每筆都 `jsonDecode`）；README @ step-1-connect 有寫「講師先開『純字串』等級，升級 JSON 時切到『回音』等級」
  - 差異：講師照講稿上課，若沒在 ①② 前確認 raw、在 ③ 前切 echo：raw 等級下學員改成 JSON 後收到的仍是純文字 `"嗨"`，`jsonDecode` 拋例外、畫面沒訊息；若 state.json 還留著 ack 等級，第 1 步就收不到自己的回音。
  - 建議改：簡報講稿，在 ImplA 開頭加「儀表板切『純字串』」，Midway 加「儀表板切『第 1～3 堂：回音』」。

- **[會誤導]** 「改成 JSON」範例的 type 是 `message`，解答送的是 `send`
  - 簡報：`slides/decks/lesson-01-v2/index.tsx:1122-1128`（Midway 右欄「改成 JSON」`{"type":"message","sender","text"}`，左欄標題是「現在送出去的」，暗示這是 client 要送的格式）
  - 程式碼：`app/lib/data/chat_controller.dart:51 @ step-1-connect-done`（送 `{'type':'send',...}`）；`server/server.dart:18-19, 194`（client→server 正式是 `send`，`message` 只是相容）
  - 差異：學員照簡報送 `type: message` 也能動（server 兩者都收），但和解答、server 協定說明不一致；到第 4 堂起協定都以 `send` 為準，學員會以為收送同一個 type。
  - 建議改：簡報，分成「送出：`{"type":"send",...}`」與「收到：`{"type":"message",...,"ts"}`」兩塊，順便讓學員看到 server 多回了 `ts`（Message 需要）。

- **[小瑕疵]** 連線範例手刻 URL，starter 已提供 `wsUrl(me)`
  - 簡報：`slides/decks/lesson-01-v2/index.tsx:1093`（`WebSocketChannel.connect(Uri.parse('ws://<host>:8080/ws?user=$me'))`）
  - 程式碼：`app/lib/config.dart @ step-1-connect`（`wsUrl(user)` 已處理 Android 10.0.2.2、HOST 覆寫、query 編碼）；`chat_controller.dart` TODO 也寫 `WebSocketChannel.connect(wsUrl(me))`
  - 差異：照簡報手刻會繞過 Android 的 10.0.2.2 處理、中文名字也沒 encode；講稿 `:1475` 又說「config.dart 已經處理好」，兩者矛盾。
  - 建議改：簡報，code 改成 `WebSocketChannel.connect(wsUrl(me))`。

- **[小瑕疵]** 驗收清單：簡報、README 不一致
  - 簡報：`slides/decks/lesson-01-v2/index.tsx:1170-1178`
  - 程式碼：`README.md @ step-1-connect`（驗收清單）
  - 差異：README 有「自己的在右邊」，簡報沒有；簡報有「不是 message 的不會被當成聊天訊息」，README 沒有；斷線驗證一邊看儀表板、一邊看 Server log。
  - 建議改：簡報或 README 擇一為準對齊（建議以簡報為準補進 README）。

- **[小瑕疵]** 第 1 堂連線橫幅就寫「自動重連中…」
  - 簡報：（無直接引用；第 1 堂沒有重連）
  - 程式碼：`app/lib/ui/connection_banner.dart:18 @ step-1-connect`（disconnected 顯示「已斷線，自動重連中…」）
  - 差異：第 1 堂還沒做重連，`/zombie` 鉤子或 Server 斷線時橫幅會說在重連，但其實不會。不影響操作，但和「第 2 堂才做重連」的敘事衝突。
  - 建議改：程式碼（第 1 堂 starter 文案改「已斷線」），或講師口頭提醒；待確認是否刻意。

未能檢查（第 1 堂）
- 沒有實際跑 server、curl、模擬器；curl 的 101 回應內容（header 大小寫）、`Sec-WebSocket-Key: SGVsbG8sIHdvcmxkIQ==`（解碼 13 bytes，非規格要求的 16 bytes）是否被 dart:io 接受，依程式推論應可，未實測。
- lesson-01-v2 前 ~950 行的動畫元件（Scene、Stepper 等）只略讀，未逐一核對圖上文字。

## 第 2 堂

- **[會讓學員卡住]** 「先切到沒 Jitter 再切到有 Jitter 對比」沒有這個開關
  - 簡報：`slides/decks/lesson-02-heartbeat/index.tsx:1552`（Acceptance 講稿）；`:1495`（Herd 講稿「這就是講師儀表板上的畫面…驗收時會真的跑一次」）
  - 程式碼：`server/server.dart:689, 744-753`（已 commit 儀表板的重連時間軸只畫最近 3 次 /drop 的連線嘗試，沒有任何 Jitter 開關）；`app/lib/data/chat_socket.dart:95-96 @ step-2-heartbeat-done`（Jitter 寫死，沒有旗標）；工作區未 commit 的 server 也只有說明文字「可對比有無 Jitter」，同樣沒有開關
  - 差異：Jitter 在 client 端，Server 無法切換。全班都照 TODO 加了 Jitter，時間軸只會看到「有 Jitter」一種；講師照講稿找不到切換按鈕。
  - 建議改：簡報講稿改成「拿時間軸跟前面 Herd 頁的靜態圖對比」，或在程式碼（starter/done）加 `useJitter` 旗標讓一半學員關掉；lesson-plan「可對比有/無 Jitter」同步說清楚怎麼對比。

- **[會讓學員卡住]** 「離開聊天頁之後不會再重連」無法驗收
  - 簡報：`slides/decks/lesson-02-heartbeat/index.tsx:1308`（Acceptance）、`:1291`（ImplB TODO ⑤ hint「離開頁面後還在背景偷偷重連」）
  - 程式碼：`app/lib/main.dart:37 @ step-2-heartbeat`（同第 1 堂，`pushReplacement`，聊天頁無法離開）；README @ step-2-heartbeat 也有「離開聊天頁後不會再重連」
  - 差異：沒有離開聊天頁的路徑，`ChatSocket.dispose()` 永遠不會在執行中被呼叫，TODO ⑤ 寫對寫錯都看不出來；另外儀表板時間軸只記錄 /drop 後 40 秒內被踢者的嘗試（server.dart:469-482），「看不到你的重連紀錄」也不是一般情況下能觀察的。
  - 建議改：程式碼（同第 1 堂，加離開按鈕或改 `push`），並把驗收改成「離開後 Server log 不再出現你的連線」。

- **[會誤導]** 狀態機畫 4 種狀態，程式只有 3 種，且名稱不同
  - 簡報：`slides/decks/lesson-02-heartbeat/index.tsx:989-993, 1260`（States 頁「把連線想成四種狀態」：connecting / connected / waiting (backoff) / closed）、`:1288`（ImplB ④「連線中、已連線、等待重連」）、`:1519`（講稿）
  - 程式碼：`app/lib/models/connection_status.dart @ step-2-heartbeat`（`enum ConnectionStatus { connecting, connected, disconnected }`）；`connection_banner.dart:18`（disconnected 顯示「已斷線，自動重連中…」）；README @ step-2-heartbeat ④ 寫「連線中 / 已連線 / 已斷線」
  - 差異：學員會去找 `waiting`、`closed` 而找不到，或自行加 enum 值；done 版把「等待重連」對應到 `disconnected`、「已關閉」根本不存在（dispose 時直接 `status.dispose()`）。
  - 建議改：簡報，States 頁英文標成 enum 實名，並註明「等待重連 = `disconnected`；已關閉 = dispose 後不再改狀態」；ImplB 用語對齊 README。

- **[會誤導]** 講稿要學員「把連線程式搬過去」，但 starter 已經搬好
  - 簡報：`slides/decks/lesson-02-heartbeat/index.tsx:1528`（「starter 給了空的 ChatSocket，請先把第 1 堂寫在 ChatController 的連線程式搬過去」）、`:1268`（ImplA 副標「starter 給了空的 ChatSocket，連線的程式從 ChatController 搬過來」）
  - 程式碼：`app/lib/data/chat_socket.dart:27-63 @ step-2-heartbeat`（`connect`/`send`/`_onData`/`_onClosed`/`dispose` 都已寫好，只剩 TODO）；`app/lib/data/chat_controller.dart:12, 28 @ step-2-heartbeat`（已改用 `ChatSocket`）；README「連線、送出、事件串流都搬好了」
  - 差異：「空的 ChatSocket」「請先搬過去」與實際不符，學員可能重寫一遍或把自己第 1 堂的 controller 蓋回去，浪費實作時間。
  - 建議改：簡報，改成「連線程式已經搬進 `ChatSocket`，你只要補 TODO」。

- **[小瑕疵]** `/zombie`「15 秒內連回」與講稿自己的算式矛盾
  - 簡報：`slides/decks/lesson-02-heartbeat/index.tsx:1302`（Acceptance「15 秒內自動連回來」）、`:1551`（講稿「10 秒 ping 加 5 秒等 pong，再加第一次重連的 1 秒多」）；lesson-plan 第 2 堂同寫 15 秒
  - 程式碼：`chat_socket.dart:74-81, 95-96 @ step-2-heartbeat-done`
  - 差異：最壞情況 = 下一次 ping 最多 10 秒 + 5 秒逾時 + 1～2 秒重連 ≈ 17 秒；講稿的算式本身就超過 15 秒。學員剛好卡在 16 秒會以為自己寫錯。
  - 建議改：簡報與 README／課綱改成「約 15～17 秒內」或「20 秒內」。

- **[小瑕疵]** 時間軸示意圖說是「儀表板同款」，實際長得不一樣
  - 簡報：`slides/decks/lesson-02-heartbeat/index.tsx:801`（註解「講師儀表板同款：0～4 秒」）、`:1495`（講稿「這就是講師儀表板上的畫面，30 個人全擠在 1.000 秒」）、`ReconnectTimeline`「Server 在 0 秒重啟」
  - 程式碼：`server/server.dart:744-753`（儀表板時間軸 0～40 秒、每人一列、紅＝被拒、綠＝連上，t=0 是 /drop 而非 Server 重啟）
  - 差異：課堂實跑時，/drop 會拒連 5 秒，第 1、2 次重連（約 1s、3s）都是紅點、第 3 次（約 7s）才綠，和簡報 0～4 秒單列圖差很多，學員可能看不懂。
  - 建議改：簡報講稿補一句「儀表板是 0～40 秒、每人一列，前 5 秒被拒是紅點」。

- **[小瑕疵]** 結尾鉤子「講師在大廳講話」的操作沒寫清楚，且與 /drop 機器人重疊
  - 簡報：`slides/decks/lesson-02-heartbeat/index.tsx:1583`（講稿「講師在學員斷線期間到大廳講幾句話」）
  - 程式碼：`server/server.dart:89, 287-292`（/drop 拒連只有 5 秒，學員約 7 秒就連回；機器人 2 秒後自動在被踢者房間發 3 句，第 3 句是「有自動補回來就代表 Delta Sync 成功 🎉」）
  - 差異：講稿沒說用什麼讓學員斷線、也沒說學員目前要在大廳（第 2 堂沒有分房步驟）；手打儀表板訊息要在約 5～7 秒內完成，很趕。其實 /drop 機器人就是現成的鉤子素材，但講稿沒提，且機器人文字提前出現「Delta Sync」（第 7 堂術語）。
  - 建議改：簡報講稿，改成「驗收的 /drop @all 之後，問大家有沒有看到機器人那 3 句」，並先在儀表板切大廳。

- **[小瑕疵]** 驗收清單：簡報、README 不一致
  - 簡報：`slides/decks/lesson-02-heartbeat/index.tsx:1300-1309`
  - 程式碼：`README.md @ step-2-heartbeat`
  - 差異：簡報有「斷線時橫幅會顯示，連回來後橫幅消失」，README 是把橫幅併在 /drop 項；README 的 /zombie 項多了「畫面看起來正常，但…出現斷線橫幅」。內容大致相同，但措辭與條數不同。
  - 建議改：README 以簡報為準對齊，理由：學員兩邊都會看。

未能檢查（第 2 堂）
- 沒有實機跑 done 版，pong 逾時、/drop 後的實際重連時間點、時間軸畫面都只依程式推算。
- Server 的協議層 `ws.pingInterval = 5s`（server.dart:165）理論上不影響 /zombie（client 會自動回 pong frame），未實測確認 zombie 連線不會被協議層提早關掉。
- lesson-02 前 ~760 行共用 UI kit 與 Scene 動畫只略讀。


審查範圍：`slides/decks/lesson-03-reverse-list/index.tsx`、`slides/decks/lesson-04-optimistic-ack/index.tsx`；分支 step-3-reverse-list / -done、step-4-optimistic-ack / -done；`docs/lesson-plan.md` 第 3、4 堂；`server/server.dart`（已 commit 版本，行號以 `git show main:server/server.dart` 為準，另註明工作區）。

整體：兩堂的核心技術細節大多一致。核對過、沒問題的項目：
- `reverse: true`、資料「最新在前」直接畫、刪掉 `.reversed` 與 `_jumpToBottom`、底部判斷門檻 `offset < 60` 加 `hasClients`、`Stack + Positioned + ActionChip` 提示、`addListener` 回到底部關提示、送出與點提示用 `animateTo(0)`
- `client_msg_id` 欄位名與 uuid v4 產生方式；`Message` 的 `clientMsgId` / `status` / `seq`（int?）與 `copyWith`；`MessageStatus { sending, sent, failed }`
- ack 欄位、5 秒逾時、Timer Map、dispose 取消 Timer、晚到的 ack 仍改 sent、逾時不把 sent 改回 failed
- 排序：seq 由大到小，沒有 seq 的排最前面
- 重試沿用同一個 id；server `byClientId` 去重後只補回原本的 ack
- `/fail` 用 `skipSender` 實作、`/delay` 用 `slowAck = 3s` 實作；儀表板的「灌 N 則」、「全域延遲」、「ACK 等級」都存在
- 兩堂的 starter 都沒有洩題：step-3 starter 還是一般 ListView；step-4 starter 只有 TODO，氣泡的三種狀態圖示是課綱說好要先給的

## 第 3 堂

- **[會誤導]** 「畫面不動」跟同一份簡報後面的 Layout Shift 頁互相矛盾
  - 簡報：`slides/decks/lesson-03-reverse-list/index.tsx:1171`（MoreReq，「畫面不動，只亮提示」）、`:1206`（Acceptance，「往上翻時夥伴傳訊息，畫面不動，只出現提示」）、notes `:1500`、`:1504`；對照 `:1549`（ExtraShift notes：「往上翻時新訊息進來……眼前所有訊息都會往上跳一格」）
  - 程式碼：`app/lib/ui/chat_page.dart:89-101 @ step-3-reverse-list-done`（只用 `ListView.builder(reverse: true)`，沒有 center 錨點）；分支 README `README.md:26 @ step-3-reverse-list`（同樣寫「畫面不動」）
  - 差異：reverse 列表往上翻時，index 0 多一則，offset 不變，眼前的訊息會往上位移一則的高度，完成版也一樣。簡報的講師補充頁自己承認會跳，驗收卻寫「畫面不動」，學員看到位移會以為自己沒做對。課綱 `docs/lesson-plan.md:156` 寫的是「只出提示」，第 154 行寫的是「不拉回」，沒有說「不動」。
  - 建議改：簡報與 README，把驗收改成「不會被拉回最底部，只出現提示」，跟課綱一致；真正的「不動」留給 ExtraShift 頁的 center key 延伸。

- **[會誤導]** 結尾要「關回 0」，但第 4 堂開場要靠這 2 秒延遲
  - 簡報：`slides/decks/lesson-03-reverse-list/index.tsx:1591`（Hook notes：「記得下課前把全域延遲關回 0」）
  - 程式碼：`server/server.dart:206`（`delayMs` 全域延遲）；工作區（未 commit）的儀表板 L4 預設是「開場：切 ACK + 維持 2s 延遲」（`server/server.dart:1338`，只存在工作區，分支上沒有）
  - 差異：第 4 堂 notes（`lesson-04…:1249`、`:1287`）跟課綱第 4 堂 0–5 分「全域延遲下送出很卡」，都假設延遲還開著。第 3 堂叫講師關掉，第 4 堂又沒有一句叫講師重新打開（細節見第 4 堂「全域延遲」那條）。
  - 建議改：簡報，第 3 堂改成「下課前關回 0，第 4 堂開場再打開」，或把「開 2 秒」寫進第 4 堂 notes。兩堂的操作要能銜接。

- **[小瑕疵]** 灌訊息的儀表板按鈕名稱跟講稿不同
  - 簡報：`slides/decks/lesson-03-reverse-list/index.tsx:1531`（「對房間灌 N 則」）
  - 程式碼：`server/server.dart:701`（已 commit 的儀表板是「灌 [300] 則〔灌訊息〕」，要先選房、預設 300，要手改成 1000）。工作區版本（未 commit）多了「+1000」按鈕（`server/server.dart:1175`）。
  - 差異：功能存在（`flood` action，`server/server.dart:536-540`），只有標示不同，而且預設不是 1000。
  - 建議改：簡報，寫成「選房間 → 數量改 1000 → 灌訊息」。若要講「+1000」按鈕，要註明那是工作區版本。

未能檢查：
- 沒有實機跑：進房不閃、鍵盤上推、1000 則時效能圖層的實際結果、提示出現與消失的時機，都只做了靜態閱讀。
- Phone 示意元件的視覺（shift 數值是否真的表現出位移）沒有渲染確認。
- 第 9 堂是否真的用 center key（ExtraShift notes `:1552` 的說法）不在本次範圍，沒有核對。

## 第 4 堂

- **[會讓學員卡住]** 驗收「離開聊天頁再回來」在這個 App 做不到
  - 簡報：`slides/decks/lesson-04-optimistic-ack/index.tsx:1123`（Acceptance，「離開聊天頁再回來，沒有殘留的 Timer 把舊訊息改成紅點」）、notes `:1497`
  - 程式碼：`app/lib/main.dart:18,37 @ step-4-optimistic-ack-done`（帶 USER 時 home 直接是 ChatPage；不帶時 NamePage 用 `pushReplacement` 進去）。整個 app/lib 沒有任何返回或離開聊天頁的入口，AppBar 也沒有返回鍵。
  - 差異：學員沒辦法執行這項驗收。分支 README 和課綱都沒有這一項，只有簡報有。
  - 建議改：簡報，刪掉這項；或改成用 hot restart 或 code review 確認 `dispose()` 有取消 `_ackTimers`。如果真要驗，程式碼得先加一個離開的入口。

- **[會誤導]** 全域延遲什麼時候開、什麼時候關沒有交代；跟 `/delay` 疊加後會碰到 5 秒逾時
  - 簡報：`slides/decks/lesson-04-optimistic-ack/index.tsx:1249`（Cover notes：「上一堂結尾，全域延遲一開……」）、`:854`、`:872`（「網路很慢，過了 2 秒」）、`:1114`（Acceptance：「/delay……大約 3 秒後變勾勾」）、`:1422`
  - 程式碼：`server/server.dart:206`（全域延遲在存檔前，先 await `delayMs`）、`:91`、`:237`（`/delay` 讓 ack 再晚 `slowAck = 3s`）；`app/lib/data/chat_controller.dart:22 @ step-4-optimistic-ack-done`（`ackTimeout = 5s`）
  - 差異：第 4 堂 notes 沒有任何一句叫講師「打開 2 秒延遲」或「示範完歸零」，而第 3 堂叫講師下課前關掉（見第 3 堂那條）。如果延遲維持 2 秒，學員輸入 `/delay` 會是 2 + 3 ≈ 5 秒才拿到 ack，剛好碰到 5 秒逾時。可能先變紅點再變勾勾（待確認，沒有實機跑），跟驗收寫的「約 3 秒後變勾勾」不符。工作區儀表板的 L4 說明有寫「示範完歸零」（`server/server.dart:1335`，未 commit），簡報沒有。
  - 建議改：簡報。EchoVsAck notes 寫「講師開 2 秒延遲示範」，實作開始前（ImplA 或 ImplB notes）寫「把全域延遲歸零」。

- **[小瑕疵]** 投影片上的 ack 少了 `room_id`；送出 JSON 的 `sender` Server 不採用
  - 簡報：`slides/decks/lesson-04-optimistic-ack/index.tsx:939-955`（AckSeq：送出含 `"sender": "Amy"`；ack 只列 `type` / `client_msg_id` / `seq` / `ts`）
  - 程式碼：`server/server.dart:603-604`（`_ack` 還帶 `room_id`）；`server/server.dart:20`（註解：「sender 一律以連線的 user 為準」）；`app/lib/data/chat_controller.dart:60 @ step-4-optimistic-ack-done`（完成版也送 sender）
  - 差異：本堂用不到 room_id，不影響實作。但學員印 log 會看到多一個欄位；學員也可能以為改 `sender` 就能冒名。
  - 建議改：簡報，ack 加上 `"room_id": …`，或註明「省略部分欄位」；sender 旁註「Server 以連線身分為準」。

- **[小瑕疵]** 修正頁直接放完成版程式碼，用了學員沒有的輔助方法
  - 簡報：`slides/decks/lesson-04-optimistic-ack/index.tsx:1080-1087`（Fix 頁是學員頁，程式碼呼叫 `_update(...)`、`_transmit(msg)`）
  - 程式碼：`app/lib/data/chat_controller.dart:54-67,86-91 @ step-4-optimistic-ack-done`（這兩個是完成版自己的私有方法；starter 和 ImplA、ImplB 頁都沒有提到要抽出這兩個方法）
  - 差異：時間點在學員自己找出原因之後，算公布解答，不算洩題。但學員多半是把送 JSON 和開 Timer 直接寫在 `send` 裡，照抄這段會編譯失敗。
  - 建議改：簡報，加一行註解說明 `_transmit` 是「送 JSON + 開 Timer」，或 ImplB 提示先把這段抽成方法。

未能檢查：
- 沒有實機跑：`/delay`、`/fail` 搭配全域延遲的實際時序（紅點會不會先閃一下）標為待確認。
- SeqDiagram 和 StateChart 只讀了資料與 notes，沒有渲染確認箭頭的視覺順序。回音模式圖畫成「先轉給夥伴、再回音給我」，程式裡是照 `room.members` 的順序送（`server/server.dart:250-256`），先後不固定，屬示意，沒有列為差異。
- 課綱寫學員「先故意做錯（重試產生新 UUID）」，done 分支只放修正後的版本，沒有中間的錯誤版可以對照。這是設計如此，不算差異。


> server/server.dart 行號一律指**已 commit 的版本**（`git show 'step-6-history-paging:server/server.dart'`，與 main／各分支同一個 blob，共 764 行），不是工作區的 1964 行版本。

已核對一致（不列為問題）：
- 第 5 堂 schema 和簡報 Schema 頁逐字相同：表 `messages`、`client_msg_id TEXT PRIMARY KEY`、`seq INTEGER`（可為 null）、`sender/text/ts/status NOT NULL`、`idx_messages_seq`。DB 檔 `chat_$user.db`，`version: 1`，starter 已經建好（`app/lib/data/local_message_store.dart:18-33 @ step-5-local-db`）。
- upsert SQL `ON CONFLICT(client_msg_id) DO UPDATE SET seq, ts, status = excluded.*` 與 Upsert 頁相同（`local_message_store.dart:70-77 @ step-5-local-db-done`）。
- 啟動時 sending→failed 寫在 `open()` 裡（`:34-40 @ -done`），starter 只留 TODO，沒有洩題。`updatePendingStatus` 的 `status != 'sent'` 條件和講稿一致。
- SSOT：done 的 `messages => store.watchMessages()`，WS 只呼叫 store。chat_page 在 5 starter→done 之間沒有 diff，「UI 一行都不用改」成立。
- `/delay`（slowAck 3 秒，server.dart:91、236）、`/fail`（skipSender，:236）、重送去重 re-ack（:220-224）、儀表板「拒絕連線」（:502-503、676、727，預設 30 秒）在已 commit 的版本都有。ackTimeout 5 秒 > 3 秒，第 5 堂驗收的 /delay 殺 App 流程做得到。
- 第 6 堂 HistoryApi：`GET /messages?user=&limit=&before_seq=|after_seq=`（`history_api.dart:19-29 @ step-6-history-paging`），server 有這條路由（server.dart:124-128），`pageSize = 50`，和 server 預設 limit 50 相同。`before_seq` 不含本身（`end = before - 1`，:428），與 Cursor 頁「seq < 296」相符。
- done：連上時 `latestSeq()==null` 才抓最新一頁、`watchMessages(ValueListenable<int> limit)` 加 `LIMIT ?` 與 generation 丟棄過期結果、兩段式 `count() > limit → limit += 50`、否則 `before_seq = MIN(seq)`、`oldest <= 1` 或不足一頁就停、距頂 300px 預先載入、itemCount+1 放轉圈。全部和講稿 ImplA/ImplB 相符。
- curl 示範的三個 URL 在 server 上跑得出來（`/messages?user=Amy&limit=5`、`limit=10`、`before_seq=…`），回傳照 seq 由小到大（:414-431）。

## 第 5 堂

- **[會誤導]** 第四項驗收「DB 層去重」根本驗不到 upsert
  - 簡報：`slides/decks/lesson-05-local-db/index.tsx:1146`（Acceptance「用 /fail 再連點重試：自己和夥伴那邊都只有一則」）、`:1404`（講稿「第四項是 DB 層的去重」）
  - 程式碼：server/server.dart:220-224（同 client_msg_id 由 Server 去重，只 re-ack，不再廣播）、:250-256（ack 等級的 message 不送給發送者）；`app/lib/data/chat_controller.dart:74-79 @ step-5-local-db-done`（自己這邊收 ack 走 `markSent` UPDATE）
  - 差異：/fail＋重試時，夥伴只收到一次 `message`（Server 已經擋掉），自己只收到 ack（走 UPDATE）。整個流程不會有同一個 id 寫進 DB 兩次。學員把 upsert 寫成普通 INSERT，這項一樣會過。第 5 堂沒有任何操作能觸發 ON CONFLICT，那是 Server 層去重，不是 DB 層。
  - 建議改：簡報（講稿改成「這項驗的是 Server 冪等＋markSent；DB 層 upsert 到第 6 堂歷史頁重疊時才會真的用到」，或把這項驗收拿掉），理由：避免學員以為 upsert 已經驗證過了。

- **[會誤導]** 能力演進表說第 6 堂「斷線時別人說的話：要剛好往上滑才撈得到」，實作做不到
  - 簡報：`slides/decks/lesson-05-local-db/index.tsx:940`（Evolution）
  - 程式碼：`app/lib/data/chat_controller.dart:55-62、107-129 @ step-6-history-paging-done`
  - 差異：第 6 堂本地不是空的就不抓最新一頁；往上滑只用 `MIN(seq)` 打 before_seq。斷線期間的訊息落在本地最新那則之後，不在最舊那則之前，所以怎麼滑都撈不到。第 6 堂的 Hook 也說「連回來看不到那 3 句」，和這格互相矛盾（第 6 堂簡報有同樣問題，見下）。
  - 建議改：簡報（格子改成「收不到（往上滑也補不到，留斷層）」），理由：跟程式和下一堂的鉤子一致。

- **[小瑕疵]** Upsert 頁的表格把「自己送的訊息收到 ack」列成 upsert 的第三種情況
  - 簡報：`slides/decks/lesson-05-local-db/index.tsx:822`（Upsert／UpsertDemo）
  - 程式碼：`app/lib/data/chat_controller.dart:74-77 @ step-5-local-db-done`（ack → `markSent`，是 UPDATE，不是 upsert）
  - 差異：講稿（`:579`）有補一句「走的是 markSent」，但學員看到的頁面上沒有這個說明，容易以為 ack 也要呼叫 `upsertFromServer`。
  - 建議改：簡報（第三列結果欄註明「走 markSent（UPDATE）」），理由：頁面本身就要講清楚。

未能檢查：
- 沒有實機跑（殺 App 秒開、/delay 殺 App 變紅點、拒絕連線時的橫幅都沒實測）。
- 共用 UI kit（index.tsx 前 ~740 行）只略讀，主要看各頁和 notes。
- 只核對了簡報的 sqflite 版本／ON CONFLICT 需 SQLite 3.24 的說法和程式碼不衝突，沒有查 Android 版本細節。

## 第 6 堂

- **[會讓學員卡住]** 驗收要學員「看 Server log」，但 Server 根本不記 HTTP 請求
  - 簡報：`slides/decks/lesson-06-history-paging/index.tsx:1271`（Acceptance「再往上滑也不會再打 API（看 Server log）」）、`:1548-1549`（講稿：log 裡不應該出現 before_seq／沒帶 cursor 的 /messages 請求）
  - 程式碼：server/server.dart:111-131（`_handle` 處理 `/messages` 時沒有 `_log`）；全檔 `_log` 只出現在連線、reject、duplicate、/fail、/drop、/zombie、admin、dm、載入存檔（:104-636）。工作區未 commit 的版本也一樣沒有。
  - 差異：第 3、4 項驗收無法用 log 驗證。而且上課用的是講師共用的 Server，學員本來就看不到它的 log。
  - 建議改：程式碼（server `/messages` 加一行 `_log('GET /messages user=… before_seq=… → n')`）或簡報（改成在 App 端 `debugPrint`，或用 DevTools Network 看），理由：驗收要做得到。

- **[會讓學員卡住]** 提示用的 `store.latestSeq()`／`oldestSeq()`／`count()` 在 starter 不存在，TODO 也沒叫學員寫
  - 簡報：`slides/decks/lesson-06-history-paging/index.tsx:1237`（ImplA「用 store.latestSeq() 判斷空不空」）、`:1513`、`:1529`（講稿 oldestSeq、本地總數）
  - 程式碼：`app/lib/data/local_message_store.dart @ step-6-history-paging` 只有 `watchMessages()` 和寫入方法；`count()`／`oldestSeq()`／`latestSeq()` 到 `@ step-6-history-paging-done:73-79` 才出現。README「你要完成的」和 starter 的 TODO 都沒提到要新增這三個方法。
  - 差異：學員照提示打 `store.latestSeq()` 會直接編譯失敗。
  - 建議改：程式碼（starter 先提供這三個查詢，符合 lesson-plan「starter 提供…」的精神），或簡報／README 加一條「在 store 新增 latestSeq/oldestSeq/count（MAX/MIN/COUNT）」，理由：提示要對得上 starter。

- **[會誤導]** 講稿說「換一個名字登入，等於新的 DB 檔」可以代替重裝，但新名字會被分進別的房
  - 簡報：`slides/decks/lesson-06-history-paging/index.tsx:1547`（Acceptance 講稿）
  - 程式碼：server/server.dart:170（沒分配過的名字連上就 `_assign` 進 `_privateRoom`）、:313-315（`_base` 取 `-` 前面那段當私人房）；`history_api.dart:19-29 @ step-6-history-paging`（用 `user` 決定房間）
  - 差異：例如 Amy-3 會進 `private:Amy`，不是灌了 300 則的兩人房，所以看不到預期的最新一頁。要回到兩人房，講師得重新按「兩兩一組」，而那會重分所有在線的人。
  - 建議改：簡報（拿掉換名字這個替代做法，只留刪掉重裝），理由：避免驗收時進錯房。

- **[會誤導]** curl 示範 ②「看後面 5 則」和 Server 的回傳順序相反
  - 簡報：`slides/decks/lesson-06-history-paging/index.tsx:1138`（CurlDemo 副標「第 2 頁 = 最新 10 則的後 5 則」）、`:1145`（「拿最新 10 則，看後面 5 則 → 第 1 頁最舊那則又出現了」）、`:1472`
  - 程式碼：server/server.dart:414-431（`sublist` 照 seq 由小到大）
  - 差異：夥伴傳一句之後，`limit=10` 回 #292…#301（由小到大）。offset 第 2 頁（#292–#296）在 JSON 的**前** 5 則，重複的 #296 是第 5 個。照字面看「後面 5 則」只會看到 #297–#301，看不到重複。同一頁底部又寫「回傳一律照 seq 由小到大」，現場容易指錯地方。
  - 建議改：簡報（改成「看前面 5 則（最舊的 5 則）：最後一則就是第 1 頁拿過的那則」），理由：和實際輸出一致。

- **[會誤導]** 能力演進表與講稿說第 6 堂斷線訊息「要剛好往上滑才撈得到」
  - 簡報：`slides/decks/lesson-06-history-paging/index.tsx:990`（Evolution）、`:1413`（講稿「注意第三列…今天只是剛好往上滑才撈得到」）
  - 程式碼：`app/lib/data/chat_controller.dart:55-62、107-129 @ step-6-history-paging-done`
  - 差異：同第 5 堂那條。before_seq 以本地最舊的 seq 往更舊的方向抓，斷線那段在本地最新之後，往上滑永遠補不到。講師還特別提醒「注意第三列」，同一份簡報的 Hook（`:1363-1388`）又說「連回來看不到」，前後矛盾。
  - 建議改：簡報（改成「收不到；而且本地會留下斷層」），理由：和 LatestRule 頁、Hook 的論點一致。

- **[小瑕疵]** 講師補充的 around_seq 範圍寫成 #32～#82，Server 實際回 #32～#81
  - 簡報：`slides/decks/lesson-06-history-paging/index.tsx:1344`、`:1351`、`:1586`（ExtraLimit）
  - 程式碼：server/server.dart:425-426（`start = around-1-limit~/2`，`limit=50` → index 31..80 = #32～#81）
  - 差異：差一則（前 25、後 24）。ExtraReply 說「前後各 25 則」，加上 #57 本身是 51 則，超過預設 limit 50。
  - 建議改：簡報（寫 #32～#81，或改成「前後各約 25 則」），理由：數字和 Server 對得上。

- **[小瑕疵]** 「兩人房各灌 300 則」一鍵按鈕只存在未 commit 的工作區
  - 簡報：`slides/decks/lesson-06-history-paging/index.tsx:1397`（講稿「課前講師已經用儀表板幫每個兩人組的房間灌了 300 則」）
  - 程式碼：已 commit 的 server/server.dart:536-540、701 只有「選一間房 → 灌 N 則」（預設 300）；`floodPairs(300)`／「兩人房各灌 300 則」按鈕（工作區 server/server.dart:1143、1351、1537）**只存在未 commit 的工作區，分支上沒有**。
  - 差異：用分支上的 Server，講師要一間一間灌。功能做得到，只是比較慢。
  - 建議改：程式碼（把工作區的儀表板改版 commit 上去），理由：分支 README 叫學員自己開 server 練習時也要用得到。

- **[小瑕疵]** curl 範例寫死 `before_seq=296`
  - 簡報：`slides/decks/lesson-06-history-paging/index.tsx:1150`（CurlDemo ③）
  - 程式碼：server/server.dart:536-540（flood 從房間目前的 seq 往後接）
  - 差異：第 5 堂兩兩一組已經在同一間房聊過，課前再灌 300 則，最新 seq 會大於 300，296 不一定是第 1 頁最舊那則。講稿（`:1474`）有寫「帶剛剛記下的 seq」，但頁面上是固定數字。
  - 建議改：簡報（改成 `before_seq=<第 1 頁最舊的 seq>`），理由：避免講師照抄，現場對不上。

未能檢查：
- 沒有實機跑：重裝後是否出現最新一頁、往上滑是否不跳不重複、300px 預先載入的手感，都沒實測。
- 沒有實際跑 curl（依限制不啟動 server）。回傳格式是讀 `_page`／`_json` 推出來的。
- 待確認：課前灌 300 則時，如果學員 App 在線，訊息也會經由 WS 寫進本地 DB（flood 走 `_deliver`，:539）。這種情況下不重裝，第二段（before_seq）幾乎打不到。簡報的驗收是以重裝為前提，所以沒列為差異。


核對來源：`slides/decks/lesson-07-delta-sync/index.tsx`、`slides/decks/lesson-08-rooms/index.tsx`、`docs/lesson-plan.md` 第 7、8 堂、分支 `step-7-delta-sync(-done)`、`step-7-challenge-ranges(-done)`、`step-8-rooms(-done)`、`server/server.dart`（已 commit 版本，用 `git show main:server/server.dart` 讀）。

先記下來核對過、**一致**的項目（不列為差異）：
- `after_seq` 參數名與語意（「這個 seq 之後」，Server `_page` 用 `start = after`）、補洞每頁 `limit=100`（Server 上限 200）、不足一頁就停、下一頁 cursor = 這頁最後一則 seq，都跟 `step-7-delta-sync-done` 的 `_sync` 一致。
- `syncCursor` = `COALESCE(MAX(seq) WHERE sender != me, MIN(seq)-1)`，跟簡報 SyncFlow「cursor = 別人的最新」、Trap 頁和 ImplA 講稿（COALESCE、Fallback）一致。重連瞬間 cursor 會跳過的小窗口，講稿第 14 頁（Trap）「可能被問到」已經明講「完成版沒有處理」（index.tsx:1763），不算漏講。
- Outbox 沒有另開一張表，用的是 `status != 'sent'`，依 `ts ASC` 排序（`unsent()`）；簡報 Outbox 頁「status 不是 sent 的那幾列」和 starter 有提供 `store.unsent()` 都對得上。
- 第 8 堂的協定：送出 `{"type":"send","client_msg_id","room_id","text"}`；Server 回 `message`/`ack` 都帶 `room_id`；`room_added` 是 `{"type":"room_added","room":{…跟 GET /rooms 的一筆一樣}}`；`GET /rooms?user=` 回 `{assigned_room_id, rooms:[{id,name,kind,members,last_seq,last_message,…}]}`；房間 id 格式 `private:Amy`（`_base`，所以 Amy-2 也進 private:Amy）、`pair:Amy:Bob`、`lobby`、`group:N`、`dm:A:B`（Server `_createDm` 會檢查有沒有排序、有沒有包含自己）。以上都跟簡報 Protocol、DmFlow 頁和 Server 一致。
- DB v1→v2 的 SQL（`ALTER TABLE messages ADD COLUMN room_id TEXT NOT NULL DEFAULT ''`、`idx_messages_room_seq(room_id, seq)`、`rooms` 表的欄位）、`adoptLegacyMessages`（`WHERE room_id = ''` → 歸到 `assigned_room_id`），跟 MigFlow 頁和 ImplA 講稿逐字一致。
- 類別和檔名 `ChatService`、`RoomListPage`、`Room`（`Room.dmId`）、`ChatController(service, roomId)`、`ChatPage(service, room)`、`upsertRooms`、`updatePreview`（`last_seq < ?` 才更新），跟簡報、講稿一致。
- 講稿要講師或學員做的操作都存在於已 commit 的 Server：`/drop`（拒絕 5 秒，2 秒後機器人發 3 句）、儀表板「拒絕連線」（秒數欄預設 30）、「灌訊息」、「建立並拉人」（`action: group` → `group:N` + `room_added`）、Server log 的 `duplicate … re-ack`。都不是只存在於未 commit 工作區的功能。

## 第 7 堂

- **[會讓學員卡住]** ImplA 頁說「這堂全部寫在 chat_controller.dart」，但 cursor 的 SQL 一定要寫在 store
  - 簡報：`slides/decks/lesson-07-delta-sync/index.tsx:1367`（ImplA 的 sub）；講稿 `:1769` 要學員「SQL 裡用 COALESCE 寫」
  - 程式碼：`app/lib/data/local_message_store.dart:92 @ step-7-delta-sync-done` 新增了 `syncCursor(me)`；`_db` 是 private（`:15`），starter 的 store 也只有 `latestSeq` / `oldestSeq` / `unsent`，沒有「別人的最新 seq」可以用
  - 差異：學員照投影片只改 controller 的話，拿不到 `MAX(seq) WHERE sender != me`（controller 碰不到 `_db`），只能用 `latestSeq()`，剛好就踩進 Trap 頁講的坑。完成版其實改了兩個檔。
  - 建議改：簡報。把 sub 改成「主要寫在 chat_controller.dart；cursor 的查詢加在 local_message_store.dart（新增 syncCursor）」，或在 starter 的 store 補一行 `TODO(第 7 堂)`。

- **[會誤導]** ResendFlow 時序圖：「第一則 ✓ 之後第二則才轉圈」，跟程式的實際順序不一樣
  - 簡報：`slides/decks/lesson-07-delta-sync/index.tsx:1314-1336`（ResendFlow）；講稿 `:1727`「注意是第一則處理完才輪到它」
  - 程式碼：`app/lib/data/chat_controller.dart:77-81, 98-101 @ step-7-delta-sync-done`。`_flushOutbox` 的 `await retry(m)` 只等 `updatePendingStatus` 這個 DB 寫入，`_transmit` 送出就回來，**不會等 ACK**
  - 差異：實際順序是 ①轉圈 → 送 a1f → ②轉圈 → 送 b7c → 兩個 ACK 才陸續回來。圖上畫成「一則等到 ACK ✓ 才送下一則」（停等式）。學員照圖寫，可能會自己做「等 ACK 再送下一則」，或誤以為依序送達是靠等 ACK。其實靠的是 ImplB 講稿講的同一條 TCP 依序送達（In-order Delivery）。
  - 建議改：簡報。時序圖改成兩次重送先後送出、ACK 之後才回來；講稿 `:1727` 改成「第一則送出後就輪到它，不用等 ACK；順序靠同一條 WS」。

- **[小瑕疵]** Outbox 頁和 ResendFlow 頁的 seq 對不起來
  - 簡報：`index.tsx:1278`（Outbox 表上 `#304 Amy 好喔` 已經 sent，「我出站了」是 failed）vs `:1326`（ResendFlow「我出站了」→「原本的 #301」）
  - 程式碼：無（只是範例數字）
  - 差異：上一頁「我出站了」排在 #304 後面，下一頁它的原始 seq 卻是 #301。講稿 `:1730-1731` 自己準備了「這是另一個情境」的回答，表示講師知道學員會問。
  - 建議改：簡報。ResendFlow 改用 #305 / #306，就不用另外解釋。

- **[小瑕疵]** 課後挑戰：README 驗收要「拒絕連線期間灌 500 則」，儀表板灌訊息的預設值是 300
  - 簡報：`index.tsx:1486-1515`（ExtraRanges，只講分支名，沒寫驗收數字）
  - 程式碼：`step-7-challenge-ranges:README.md`（「期間灌 500 則」）；`server/server.dart` 儀表板 `floodn` 預設 `value="300"`（已 commit 版約 :701）
  - 差異：數字要手動改成 500，不影響功能。挑戰的參考解（`_sync` 只抓最新一頁、`visibleFloor` + `before_seq` 補洞、`_mergeRanges` 合併區段）和 ExtraRanges 頁、講稿描述一致。
  - 建議改：README，寫成「灌 500 則（儀表板數字改成 500）」。

### 第 7 堂未能檢查
- 沒有實機跑。下面這件只做了推算：「拒絕連線 30 秒 → 解除後自動送出」。拒絕期間 App 的 backoff 一直在加長（`maxBackoff = 30s` + 最多 1 秒 jitter，`chat_socket.dart:23,95-96`），解除後可能要再等十幾秒到 30 秒才重連，學員可能以為壞了。講稿沒提醒要等。（待確認，建議實測一次）
- `/drop` 的機器人訊息發在「被踢者目前分配的房間」。驗收第 1 項在 Amy / Amy-2 私人房或兩人組都會成立，但我沒有實機驗證。
- 「紅點語意改成目前還沒送達」（README 第 4 項、ImplB ④）：完成版的 `message_bubble.dart` 本來就沒有提示文字，done 分支也沒改，跟講稿「有提示文字的話」一致。UI 上看起來的樣子沒有實際確認。

## 第 8 堂

- **[會誤導]** 舊訊息歸位依賴「升版當下的 assigned_room_id」，但講稿說「今天起解除換房限制」，沒提醒要等大家升版連上之後才換房
  - 簡報：`slides/decks/lesson-08-rooms/index.tsx:1713`（Cover 講稿「今天起解除換房限制，講師可以自由分房」）；MigFlow `:1525`、講稿 `:1944`（只說第 5～7 堂不能換房）
  - 程式碼：`app/lib/data/chat_service.dart:63-72 @ step-8-rooms-done`（每次連上都拿當下的 `assigned_room_id` 去 `adoptLegacyMessages`）；`server/server.dart` 的 `assign`（private / lobby / pairs）會改 `assigned`
  - 差異：如果講師在學員第一次用第 8 堂 App 連上之前，就在儀表板按了「私人房 / 大廳 / 兩兩一組」，舊訊息會被歸到新的分配房（例如 `lobby`），跟那間的 seq 混在一起。驗收第 5 項「兩人組的舊訊息還在」就會失敗。「建立並拉人」不會改 assigned，不受影響。
  - 建議改：簡報講稿。在 Cover 或 MigFlow 講稿加一句「全班都跑過今天的 App、連上一次之前，不要按分房；拉群可以」。

- **[小瑕疵]** 升版後的舊 Outbox 第一次補送會帶 `room_id: ''`，被 Server 拒絕
  - 簡報：`index.tsx:1389-1424`（Reconnect：連上就「重拉 GET /rooms」和「補送 Outbox」兩件一起做）
  - 程式碼：`app/lib/data/chat_service.dart:57-61, 75-79 @ step-8-rooms-done`。`_syncRooms()` 和 `_flushOutbox()` 同時跑，`unsent()` 是本地查詢，通常比 HTTP 的 `/rooms` 先回來，所以舊的 failed 訊息帶的 `roomId` 還是 `''`。Server `_roomFor(c, '')` 會回 error「房間 不存在」。
  - 差異：從第 7 堂升上來時如果有沒送出的訊息，第一次連上會再變紅點，要等下一次重連（那時已經歸位）才送得出去。簡報沒提，驗收也測不到。
  - 建議改：程式碼（`_flushOutbox` 等 `_syncRooms` 完成再跑，或跳過 `room_id == ''` 的訊息）。要不然就在講稿補一句已知限制。

- **[小瑕疵]** RecvRoute 時序圖畫成 ChatService 把訊息轉交給房間，實際上是各自訂閱、各自過濾
  - 簡報：`index.tsx:1206`（`ChatService → 開著的房間：room_id 對上 → 寫進 DB`）
  - 程式碼：`app/lib/data/chat_controller.dart:34-40 @ step-8-rooms-done`（ChatController 自己訂閱 `service.socket.events` 並用 `room_id` 過濾）；`chat_service.dart:83-95`（ChatService 只更新預覽）
  - 差異：講稿 `:1771` 有說明是 Broadcast Stream、各自過濾，但圖上的箭頭看起來像集中派發。另外 ChatService 比 controller 早訂閱，實際上會先更新預覽、再寫 messages，跟圖上的順序相反（不影響結果）。
  - 建議改：簡報。箭頭標籤改成「開著的房間自己挑 room_id → 寫進 DB」，或把起點畫在 WS 事件。

- **[小瑕疵]** README 說私聊（第 5 項）是學員 TODO，但 starter 已經做好大部分
  - 簡報：`index.tsx:1968`（ImplB 講稿：「starter 的 _newDm 已經……你要補的是 _open」），跟 starter 一致
  - 程式碼：`app/lib/ui/room_list_page.dart:26-53 @ step-8-rooms`（`_newDm` 已經抓在線名單、`Room.dmId`、`ensureRoom`）；只剩 `:22` 的 `_open` 是 TODO
  - 差異：`step-8-rooms:README.md:26`「5. 私聊：選一位在線學員 → 算出 dm:A:B → 直接送出」寫得像全部要自己做；`docs/lesson-plan.md` 第 8 堂實作 ⑤ 也是這樣寫。簡報和 starter 是對的，README 和課綱寫得太大。
  - 建議改：README 和課綱，改成「私聊：`_open` 打開 ChatPage(service, room)；選人和算 dm:A:B 已經提供」。

- **[小瑕疵]** 驗收清單：簡報、README、課綱三邊不一樣
  - 簡報：`index.tsx:1574-1584`（5 項，含「開著兩人組時，群組的訊息不會跑進兩人組的畫面」）
  - 程式碼：`step-8-rooms:README.md:28-34`（5 項，含「全 App 只有一條 WebSocket（儀表板上你只出現一次）」，但沒有「room_id 過濾」那項）
  - 差異：兩邊各少一項。另外 README 那項「儀表板上你只出現一次」其實驗不出來：Server 用 `conns[user]` 一人一個，同名第二條連線直接回 409（`server.dart` `_handleWs`），儀表板本來就不可能出現兩次。
  - 建議改：README。補上「room_id 過濾」那項，把「只出現一次」改成能驗的說法（例如「進出房間、開兩個房間，Server log 都沒有新的 `+ 名字`」）。

- **[小瑕疵]** 課綱說第 8 堂重連要更新「未讀數」，簡報和程式都放到第 9 堂
  - 簡報：`index.tsx:1097`（「未讀數留給第 9 堂」）
  - 程式碼：`app/lib/models/room.dart @ step-8-rooms-done` 沒有未讀欄位；`store.upsertRooms` 只存 `last_seq` 和預覽
  - 差異：`docs/lesson-plan.md` 第 8 堂備註「只重拉房間列表（含各房最新 seq，更新預覽與未讀數）」。
  - 建議改：課綱，把「與未讀數」拿掉，或註明「未讀數第 9 堂」。

- **[小瑕疵]（待確認）** 第 7 堂結尾拉群後，如果有人在群裡說話，第 7 堂的 App 會把那句混進單房 DB
  - 簡報：`slides/decks/lesson-07-delta-sync/index.tsx:1854`（Hook：講師拉群，問「看得到嗎」）；第 8 堂 `index.tsx:1944`（舊訊息全部歸到兩人組）
  - 程式碼：`app/lib/data/chat_controller.dart:120-121 @ step-7-delta-sync-done`（`case 'message'` 沒有過濾 room_id，全部 upsert）；Server 建群之後，群成員會收到群裡的 `message`
  - 差異：Hook 的預期現象是「看不到」。只要從拉群到第 8 堂升版之間沒有人在 `group:N` 發言（包括講師用「說話」或「灌訊息」測試），就沒事。一旦有人發言，那幾句會用群組的 seq 寫進第 7 堂的 DB，第 8 堂升版時再被歸到兩人組。
  - 建議改：講稿（第 7 堂 Hook）。加一句「建好群組先不要在裡面發言，第 8 堂再用」。

### 第 8 堂未能檢查
- 沒有實機跑：沒有實際驗證「從第 7 堂 DB 升到第 2 版」（sqflite onUpgrade 是否在 transaction 裡、`NOT NULL DEFAULT ''` 在模擬器的 SQLite 版本上能不能用），也沒驗證 `room_added` 推送之後列表即時更新。
- DmFlow 的收發順序：Server 實際是 `room_added→Amy`、`room_added→Bob`、`ack→Amy`、`message→Bob`；圖上是 message 先、ack 後。兩者送給不同的人，不影響理解，所以沒有列為差異。
- 私聊：App 在 Server 還沒建房前打開房間，`GET /rooms/dm:…/messages` 會回 404，完成版用 `catchError` 吞掉，畫面不會報錯。這是讀程式推出來的，沒有實測。
- 未 commit 的工作區 Server（新儀表板）：講稿用到的按鈕名稱「建立並拉人」「拒絕連線」，在已 commit 版本裡就有，所以分支上都可以用。


已核對且一致（不列為問題）：
- read 訊息格式：client 送 `{"type":"read","room_id","seq"}`（`chat_service.dart:105 @ step-9-read-receipts-done`），Server 推 `{"type":"read","room_id","user","seq"}`（server/server.dart:387）。
- Server `_setRead`（server/server.dart:381-392）：先把 seq 夾在 `0..room.lastSeq` 之間，非 force 時 `seq <= old` 就丟掉（只前進），並推給房內所有在線成員，發送者自己也收得到（Echo）。講師的 admin `read` 帶 `force: true`，可以設回去（:541-542）。簡報 ReadFlow、Watermark、UnreadCount 的講稿（Clamp）都和這段一致。
- Debounce 500ms、`if (seq <= _visibleMaxSeq) return`、dispose 時把最後看到的報出去（`chat_controller.dart:137-147 @ -done`）。
- 可見判定用「氣泡中心點 y 落在 viewport 內」（`chat_page.dart:94-107 @ -done`），和 VisibleNow 頁一致。
- 已讀 N 的算法：排除自己，水位線 ≥ seq 的人數（`chat_page.dart:235`）。未讀數 = `max(0, lastSeq - myReadSeq)`，超過 999 顯示 999+（`room.dart` / `room_list_page.dart @ -done`）。
- 錨點：open() 先讀 myRead，再補洞（4 秒逾時），然後 `hasSeq(first)`，有就把 `limit` 設成 `max(pageSize, countFrom+20)`，沒有就設 `unreadAbove`。畫面用 `center` key、anchor 0.75、UnreadDivider、「跳到最新」。這些和 AnchorFlow、AnchorView 頁以及講稿一致。
- DB v3：`rooms.my_read_seq INTEGER NOT NULL DEFAULT 0` 加上 `reads(room_id,user,seq, PK(room_id,user))`，starter 和 done 都一樣。`rooms.last_seq` 是 v2 就有的欄位。
- 儀表板（已 commit 的版本）：有每人水位線表（每秒 polling）、「設定」已讀、「灌 N 則」，都在 server/server.dart:701、736-737、760、763。
- main 的 app/lib 和 step-9-read-receipts-done 沒有差異。
- 第 10 堂的數值：心跳 10s ping、5s 沒 pong（`chat_socket.dart:23-24 @ main`）；同名在線 409（server.dart:159）；Server 跳過的是送出的那條連線 `c != sender`（server.dart:250）；read 會回音給本人；`syncCursor` 用「別人的最新 seq」（`local_message_store.dart:198-206 @ main`）；Outbox 依 ts ASC（:171-178）。講稿裡跨堂引用的隊頭阻塞（L8）、多媒體分流和 Soft Delete（L7）、Throttle（L9），在對應的 deck 都找得到。

## 第 9 堂

- **[會誤導]** 「兩人組」在 code 裡顯示「已讀 1」，不是「已讀」
  - 簡報：`slides/decks/lesson-09-read-receipts/index.tsx:1518`（ReadN：「私聊只有對方一人：顯示「已讀」」）；講稿 `:2052`（Acceptance：「兩人組互看「已讀」」）
  - 程式碼：`app/lib/ui/chat_page.dart:236 @ step-9-read-receipts-done`：`widget.room.kind == 'dm' ? '已讀' : '已讀 $n'`
  - 差異：只有 `kind == 'dm'`（學員自己開的私聊）會顯示「已讀」。講師用「兩兩一組」分的房是 `kind == 'pair'`（server.dart:521），雖然也是 2 人房，卻會顯示「已讀 1」。照講稿在兩人組驗收，學員看到的是「已讀 1」，會以為自己寫錯。另外 pair 房依 `_base` 分組時可能混進 Amy-2（見第 10 堂第一條），讓 N 多算一個人。
  - 建議改：簡報講稿。把驗收第二項改成「用私聊（dm）互看「已讀」」，或補一句「兩人組（pair）會顯示已讀 1」。改動最小，也和程式的「dm vs 群組」定義一致。

- **[會誤導]** 自己剛送出的訊息，離開房間後可能被算成未讀 1（待確認，沒有實機跑）
  - 簡報：`index.tsx:1527-1564`（UnreadCount：未讀 = 最新 seq − 水位線）；講稿 `:2037`
  - 程式碼：`app/lib/ui/chat_page.dart:80-92, 249 @ step-9-read-receipts-done`、`app/lib/data/chat_service.dart:86-90`
  - 差異：送出時，新訊息的 seq 還是 null，不會被 SeqTracker 包住。ACK 回來後 seq 有了，但最新一則的 `clientMsgId` 沒變，`_onNewList` 在 :82 就 return 了，不會呼叫 `_checkVisible()`。所以只要使用者不捲動、也沒有別人發言，自己的 seq 就不會進到 `_visibleMaxSeq`。ack 同時透過 `updatePreview` 把 `last_seq` 推高，結果回到列表時，自己剛傳的那則會出現未讀 1。簡報和課綱都沒提到「自己的訊息要不要推進自己的水位線」。
  - 建議改：程式碼。ack 時，或 seq 從 null 變成有值時，也呼叫一次 `_checkVisible`（或直接把自己的水位線推進到該 seq）。驗收時學員很容易遇到，會以為自己的未讀算錯。

- **[會誤導]** 驗收「設 50 再灌 300」沒有交代要先離開房間（待確認）
  - 簡報：`index.tsx:1714-1720`（Acceptance 第 3 條）；講稿 `:2053`
  - 程式碼：`app/lib/data/chat_controller.dart:137-141 @ step-9-read-receipts-done`；server/server.dart:536-542
  - 差異：如果學員還停在那個房間的底部，灌進來的新訊息一出現在畫面上，`onVisibleMaxSeq` 就會在 500ms 後把水位線報到最新，講師剛設的 50 立刻被覆蓋，列表也就看不到未讀 300。這個流程只有在學員待在房間列表時才成立。另外 Server 會把 seq 夾在 `room.lastSeq` 以內，房裡不到 50 則時，設 50 其實會變成設到 lastSeq。
  - 建議改：簡報講稿。補一句「請學員先退回房間列表，講師再設已讀、再灌訊息」。

- **[小瑕疵]** 講稿說「斷線送不出去，就等下次捲動或重新進房再報」，和 code 不完全一樣
  - 簡報：講稿 `index.tsx:2037`（ImplA）
  - 程式碼：`app/lib/data/chat_controller.dart:70-74, 138 @ step-9-read-receipts-done`
  - 差異：完成版在「重新連上」時（`_onStatusChanged`）就會補報 `_visibleMaxSeq`。反過來，捲動到同一個最大 seq 時，因為 `seq <= _visibleMaxSeq` 會直接 return，不會重報。實際的補報時機是「重連時、出現更大的 seq 時、離開房間時」。
  - 建議改：簡報講稿。照 code 改寫成「重連時自動補報」。

- **[小瑕疵]** 灌水訊息的文字和 seq 對不上
  - 簡報：`index.tsx:1533`（「Bot：第 350 則」）、`:1611-1613`（「第 51 則」）
  - 程式碼：server/server.dart:536-540：sender 是 `🤖 Bot`，text 是 `灌水訊息 #$i`，`i` 從 1 開始
  - 差異：實機上 seq 51 那則的文字是「灌水訊息 #1」，列表預覽是「🤖 Bot：灌水訊息 #300」。氣泡會顯示 `#seq · 時間`（message_bubble.dart:38），學員會同時看到兩組號碼。
  - 建議改：簡報。示意圖改成實際的文字，或在講稿提醒「文字裡的 #i 不是 seq」。

- **[小瑕疵]** 「上方還有 N 則未讀」的 N 包含畫面上已經在本地的那一頁
  - 簡報：`index.tsx:1655`、講稿 `:2026`（「上方還有 300 則未讀」）
  - 程式碼：`app/lib/data/chat_controller.dart:66 @ step-9-read-receipts-done`：`unreadAbove = lastSeq - myRead`
  - 差異：簡報和 code 一致，都是 300。但本地已經有 #301～#350 這 50 則在畫面下方，嚴格來說「上方」只剩 250 則。待確認這是不是刻意的簡化。
  - 建議改：簡報講稿。補一句說明「N 是總未讀，不是上方的則數」即可，不必改 code。

- **[小瑕疵]** starter 已經提供 `countFrom` / `hasSeq`，但 README 和簡報都沒列出來
  - 簡報：`index.tsx:1671`（ImplA 副標，列出 starter 提供的內容）；講稿 `:2041`（ImplB 直接用了 hasSeq、countFrom）
  - 程式碼：`app/lib/data/local_message_store.dart:184-190 @ step-9-read-receipts`（starter 就已經實作）
  - 差異：TODO ④ 要用到的兩個查詢在 starter 已經寫好了，這不算洩題。但 README 的「已經準備好的」和 ImplA 副標都沒有提，學員可能自己再寫一次。
  - 建議改：分支 README 和簡報。在「已經準備好的」加上這兩個方法。

- **[小瑕疵]** 時間配置和課綱不同
  - 簡報：講稿 `index.tsx:2035`（實作從【26–40 分】開始）
  - 課綱：docs/lesson-plan.md 第 9 堂寫的是觀念 5–20、實作 20–50
  - 差異：簡報把觀念拉長到 26 分鐘，實作只剩 24 分鐘，比課綱少 6 分鐘，TODO ④ 又最難。
  - 建議改：課綱或簡報擇一，讓兩邊一致。

未能檢查：
- 沒有實機跑 App。「自己的訊息算成未讀」和「停在房內時水位線被覆蓋」這兩條是讀 code 推出來的，需要實機確認。
- anchor 0.75 是否真的讓分隔線停在畫面上方約 1/4、未讀一頁就放得下時自動退出定位模式（chat_page.dart:88）的實際畫面，都沒有驗證。
- 「新裝置」驗收（換新名字、講師拉進房、設很前面的水位線）的整段流程沒有跑過。

## 第 10 堂

- **[會誤導]** 講稿說 Amy-2「其實是另一個人」，但 Server 的 `_base` 把 Amy 和 Amy-2 當同一人分房
  - 簡報：講稿 `slides/decks/lesson-10-design-seminar/index.tsx:1609`（T1：「工作坊裡第二台模擬器用 Amy-2 登入，那其實是「另一個人」」）
  - 程式碼：server/server.dart:313-315（`_base(user) => user.split('-').first`，Amy-2 進 Amy 的私人房）、:517-526（兩兩一組時「Amy 與 Amy-2 算同一人」，兩人放進同一個 pair 房）；`app/lib/ui/chat_page.dart:235 @ main`（已讀 N 只排除 `_me`）
  - 差異：在連線身分（409 判斷）、水位線、本地 DB（`chat_$user.db`）這幾層，Amy-2 確實是另一個人。但在分房這一層，Server 刻意把兩者視為同一人：同一個私人房、同一個兩人組。結果是 Amy-2 讀了 Amy 的訊息，Amy 那邊會顯示「已讀」或「已讀 1」，看起來就像多裝置的效果。學員可能拿這個現象反駁講稿。
  - 建議改：簡報講稿。補一句「Server 只在分房時用 `_base` 把它們放在一起，連線、水位線、409 都還是兩個人」。

- **[小瑕疵]** 「同名已在線 → 409」有一個例外沒提：舊連線是 zombie 時會被直接取代
  - 簡報：`index.tsx:1204`（T1 限制：「Server 現在同名在線就拒絕（409）」）；講稿 `:1643`（「這是第 1 堂就定下的規則」）
  - 程式碼：server/server.dart:156-162（`if (!old.zombie) return reject(409)`，舊連線是 zombie 時就關掉它、讓新連線取代）
  - 差異：時序圖的情境（手機正常在線）是對的。只是 Server 其實有一個「取代」分支，學員如果查 code 可能會問到。另外「第 1 堂就定下」這個說法，在 lesson-01-v2 只有講稿 :1447 帶過一句，學員頁沒有提。
  - 建議改：簡報講稿。視需要加一句說明，或保持原樣。不影響討論。

- **[小瑕疵]** 題 2 時序圖的 `typing`，在現行 Server 會回 error
  - 簡報：`index.tsx` T2Case（SeqDiagram：「typing」）
  - 程式碼：server/server.dart:200-201（`default: _error(c, '不認得的 type: ...')`）
  - 差異：頁面副標已經寫明這是「最直覺的做法」，講稿也說「不是答案」，屬於假設情境。但如果有學員真的用 `/ws-test` 送 typing，會收到 error，而且 `/ws-test` 只存在於未 commit 的工作區，分支上沒有。
  - 建議改：不需要改。講師知道即可。

其他已核對、和 main 一致：
- 時序圖 T1Case：手機已連 → 平板 409 → 假設放行 → send / ack → 平板收不收得到。講稿解釋「跳過的是那條連線（`c != sender`）」符合 server.dart:247-256。不過現在的 `conns` 是 `Map<String, Conn>`，一個名字只能有一條連線，所以「放行」需要改資料結構，這點 T1Grill 講稿有寫到。
- T3Case：seq 不跳號（server.dart:420 `all[i].seq == i + 1`），補洞 after_seq 看不到舊訊息被改，這個描述正確。
- T4Case：心跳 10s / 5s，引用第 2 堂 ChatSocket，正確。
- E2EE 只放一頁延伸閱讀（E2EE 頁，標註「今天不討論」，講稿也說不展開），符合課綱「延伸閱讀（不討論）」。
- 課綱第 10 堂規格（認領 → 20 分鐘設計 → 每組上台 5 分鐘 → 面試官追問 → 講師補充；四題的關鍵問題；結尾回到最終架構圖 + 兩兩費曼互講）都對得上。簡報的總時長是 90 分鐘，在課綱 60～90 分鐘的範圍內。

未能檢查：
- 第 10 堂沒有分支，只對照 main 和 server 已 commit 的版本。未 commit 的工作區儀表板（多了 `remove` action 等）不影響第 10 堂。
- T4「ping 排在 10MB 影片後面送不出去」是示意，沒有實測 Dart WebSocket 的送出佇列行為。
- 沒有逐一核對 Brief、Grill、SeqDiagram 這些 UI kit 元件的渲染細節。

