# Issho 最新交接

更新日期：2026-10-07（Asia/Taipei）。此文件反映目前 repository，取代先前 Phase 1 的聊天交接快照。

原交接與歷史提案完整保留於 `docs/archive/PHASE_1_HANDOFF.md`，僅供歷史參考，不代表現在進度或新增授權。

## 接手先讀

1. `AGENTS.md`：開發約束。
2. `docs/PRODUCT_SPEC.md`：主要產品規格與完整 V0.1 路線。
3. `README.md`：目前可用功能與啟動方式。
4. `docs/PHASE_4.md`：最新階段變更、驗證及限制；`docs/PHASE_3.md`、`docs/PHASE_2.md` 保存前階段紀錄。
5. `docs/DEVELOPMENT.md`：兩台電腦協作與同步步驟。
6. 實際程式碼與 Git 狀態：有本機修改時先辨識來源，不覆蓋。
7. `docs/CONTENT_RULES.md`：新增或修改題目前必讀的課程編目與內容核對規則。

## 目前狀態

- Phase 1 已完成：手機首頁、課程／助詞／四種模式設定、App 設定、localStorage、全選／清空。
- Phase 2 已實作：第 18 課 10 筆原創例句、選助詞 10 題 session、進度、提交後鎖答、判定、短用途回饋、手動繼續、成績、重玩與回首頁。
- 使用者已試用並確認 Phase 2 沒問題，驗收通過；已授權提交與推送這批程式、測試和文件。
- 首頁「開始」已接上答題，不再是 Phase 1 空操作。
- Phase 3 已實作：選助詞、助詞用途、找錯與混合皆可啟動，沿用同一份例句與統一 Exercise Engine。
- Phase 4 已實作：答對／答錯／完成音效，答題後手動播放正確完整句的 ja-JP TTS，沿用既有兩個聲音開關；待使用者實際試聽驗收。
- 使用者已授權將 Phase 4 程式、音色調整、測試與文件一起上傳 GitHub；另一台先 fetch／pull origin/main 取得聲音功能，同步狀態以實際 Git 遠端為準。
- 依使用者試用回饋：設定預設收合、一次只展開一項；找錯用 ○／× 圖示；單選に用途仍維持原第 18 課 sample 的前に／時間點。
- 單一助詞可練用途／找錯／混合；混合只用用途與找錯。多助詞混合必須包含三種題型。找錯同組一定有正確與錯誤句。
- 預設值仍為第 18 課、に／で、particle、音效與語音 ON。
- 題池只含第 18 課に／で，嚴格依選定課程取題；不存在的範圍不 fallback。
- session 與作答紀錄只在記憶體；重新整理／離開會清除。localStorage 只有設定，不跨裝置同步。

## 架構與內容

`src/data/examples.ts` 是共用例句資料，`src/types/practice.ts` 是資料模型。`src/services/practice.ts` 處理抽題、判定與計分，`src/composables/usePractice.ts` 控制當次流程，`src/components/PracticeSession.vue` 顯示練習 UI。保留既有 settings store 與 storage key。

**課程歸屬以「本題目標助詞＋具體用法＋搭配句型」為準，不以背景句型或 lesson 數字自行指定。** 使用者已明確要求維持選課的內容意義；不能為讓答案不同而加入其他課的用途。課內只有一種用途時允許答案重複；詢問原因不等於授權改範圍。這些規則適用所有模式及 sample，詳見 `AGENTS.md`、`PRODUCT_SPEC.md` 第 8、22、23 節與 `docs/CONTENT_RULES.md`。

目前に sample 已恢復前に的考查位置。既有で／動作場所 sample 的第 18 課歸屬仍需依教材核對，含ことができます不是充分依據，不能宣稱題庫內容驗收已完成。尚未建立正式 1～25 課編目。

10 筆例句皆已補 wrongVariant，僅替換原填空位置的に／で。用途題使用 usageChoices，UI 只標出該填空位置的目標助詞；找錯選項只顯示 ○／×，內部紀錄仍使用沒問題／有問題供之後 AI 匯出辨讀。PracticeQuestion 保存 type、sentence、choices 和 correctAnswer，判定不再假設每題都回答助詞；作答紀錄完整保留顯示題目及實際答案。

## 後續範圍

- Phase 3 已實作，等待使用者試用驗收；驗證結果見 `docs/PHASE_3.md`。
- Phase 4 已實作，驗證與試聽清單見 `docs/PHASE_4.md`。
- Phase 5：AI Copy、用途統計與 Prompt。
- Phase 6：PWA、離線、安裝與手機實機驗證。
- Phase 7：互動穩定後擴充完整題庫。

使用者於 2026-10-07 再次授權繼續，依既定順序實作 Phase 4 與文件更新；Phase 5 以後不要自動開始。不要加入帳號、後端、XP、愛心、排行榜、雲端同步或額外導航。

## 已知限制

- 使用 Node 24 LTS／pnpm 10；本機原有 Node 22.15 無法啟動目前 Quasar。package engines 已修正為最低 22.22。
- vue-router 的 rootDir 提示仍為既有非阻擋訊息。
- 手機實機尚未驗證。
- Phase 3 與內容規則已上傳（`42a9c94`），手機檢查紀錄亦已上傳（`82e2c62`）。使用者提供截圖後，確認為 Chrome 裝置預覽 100% 超出 DevTools 剩餘顯示區域；改成 50% 後使用者已確認可用，無須修改 App 版面。
- 既有で／動作場所 sample 的課程內容歸屬待核對；自動測試通過不等於教材內容合規。
- 語音實際聲音品質、日文聲音可用性與手機系統播放仍需試聽；瀏覽器測試驗證 API 呼叫與流程，不代替實機聽感。
- 使用者已確認整句語音與音效均能播放；依最新回饋將音效調為清脆的短提示、縮短起音延遲，仍待新音色試聽確認。原生 Web Audio 波形測試持續驗證訊號，詳見 Phase 4 試聽回饋。
- 尚無 AI Copy、PWA／offline。
- 換電腦前須確認最新 commit 已在 origin/main，再於另一台 pull；同步狀態以 Git 遠端為準，localStorage 不跨裝置同步。

最新驗證結果與變更索引請看 `docs/PHASE_4.md`。接手時先比對文件與實際程式，再依使用者當次指令工作。
