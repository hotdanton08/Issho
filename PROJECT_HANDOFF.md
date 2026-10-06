# Issho 最新交接

更新日期：2026-10-06（Asia/Taipei）。此文件反映目前 repository，取代先前 Phase 1 的聊天交接快照。

原交接與歷史提案完整保留於 `docs/archive/PHASE_1_HANDOFF.md`，僅供歷史參考，不代表現在進度或新增授權。

## 接手先讀

1. `AGENTS.md`：開發約束。
2. `docs/PRODUCT_SPEC.md`：主要產品規格與完整 V0.1 路線。
3. `README.md`：目前可用功能與啟動方式。
4. `docs/PHASE_2.md`：本階段變更、驗證及限制。
5. `docs/DEVELOPMENT.md`：兩台電腦協作與同步步驟。
6. 實際程式碼與 Git 狀態：有本機修改時先辨識來源，不覆蓋。

## 目前狀態

- Phase 1 已完成：手機首頁、課程／助詞／四種模式設定、App 設定、localStorage、全選／清空。
- Phase 2 已實作：第 18 課 10 筆原創例句、選助詞 10 題 session、進度、提交後鎖答、判定、短用途回饋、手動繼續、成績、重玩與回首頁。
- 使用者已試用並確認 Phase 2 沒問題，驗收通過；已授權提交與推送這批程式、測試和文件。
- 首頁「開始」已接上答題，不再是 Phase 1 空操作。
- 目前只有選助詞可啟動。其他模式保留設定選項，選取後首頁顯示未開放提示。
- 預設值仍為第 18 課、に／で、particle、音效與語音 ON。
- 題池只含第 18 課に／で，嚴格依選定課程取題；不存在的範圍不 fallback。
- session 與作答紀錄只在記憶體；重新整理／離開會清除。localStorage 只有設定，不跨裝置同步。

## 架構與內容

`src/data/examples.ts` 是共用例句資料，`src/types/practice.ts` 是資料模型。`src/services/practice.ts` 處理抽題、判定與計分，`src/composables/usePractice.ts` 控制當次流程，`src/components/PracticeSession.vue` 顯示練習 UI。保留既有 settings store 與 storage key。

Sample 以第 18 課的辭書形前に／ことができます句型練習時間點和動作場所，並非宣稱に／で首次在第 18 課出現。不要把 sample 當成正式第 1～25 課內容編目；正式題庫仍須校對。

目前沒有 wrongVariant 內容；Phase 3 加入找錯時需補審核過的錯誤句，沿用同一份例句資料，不另建重複題庫。

## 後續範圍

- Phase 3：助詞用途、找錯、混合與題型轉換。
- Phase 4：音效、ja-JP TTS，僅作答後播放正確句。
- Phase 5：AI Copy、用途統計與 Prompt。
- Phase 6：PWA、離線、安裝與手機實機驗證。
- Phase 7：互動穩定後擴充完整題庫。

使用者本次只授權 Phase 2 與文件更新，後續不要自動開始。不要加入帳號、後端、XP、愛心、排行榜、雲端同步或額外導航。

## 已知限制

- 使用 Node 24 LTS／pnpm 10；本機原有 Node 22.15 無法啟動目前 Quasar。package engines 已修正為最低 22.22。
- vue-router 的 rootDir 提示仍為既有非阻擋訊息。
- 手機實機尚未驗證。
- 尚無 TTS、音效播放、AI Copy、PWA／offline。
- 換電腦前須確認最新 commit 已在 origin/main，再於另一台 pull；同步狀態以 Git 遠端為準，localStorage 不跨裝置同步。

驗證結果與變更索引請看 `docs/PHASE_2.md`。接手時先比對文件與實際程式，再依使用者當次指令工作。
