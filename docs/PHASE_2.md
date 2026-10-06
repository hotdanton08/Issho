# Phase 2：核心答題

日期：2026-10-06（Asia/Taipei）。範圍：第 18 課 sample、選助詞、10 題 session、進度、判定、短用途、繼續及完成畫面。

## 實作

- 首頁開始直接掛載 PracticeSession，不增加導頁或前置表單。
- 共 10 筆原創 sample，に／時間點與で／動作場所各 5 筆。題目使用辭書形前に與ことができます。
- 題序和選項用 Fisher–Yates 打亂。預設 10 筆每組各出一次；小題池先走完整池，再重抽補滿 10 題。
- 課程採 includes 精確篩選，不包含之前課程；答案助詞與至少一個已審核干擾助詞必須都被選取。
- 其他模式、空選擇、少於兩個助詞及無相符題池均阻止開始，保持已選設定。
- 答案提交後鎖定，進度按已答題數增加；必須按繼續。最後一題看完回饋再進完成畫面。
- 完成顯示分數，再來一組重置題序、紀錄與分數；回首頁／×／重新整理不保存 session。
- 保存當次設定快照、題目、使用者答案及判定於記憶體，供後續 Phase 擴充。

## 修改索引

新增 `src/types/practice.ts`、`src/data/examples.ts`、`src/services/practice.ts`、`src/composables/usePractice.ts`、`src/components/PracticeSession.vue`。

修改首頁、`src/css/app.scss`、`package.json` 最低 Node 版本、既有 shell E2E；新增 practice 單元測試與五種尺寸 E2E／無題池測試。

文件同步更新 `README.md`、`PROJECT_HANDOFF.md`、`docs/PRODUCT_SPEC.md` 的目前里程碑，新增本文件與 `docs/DEVELOPMENT.md`。AGENTS 產品與品質規則不變。

原始 Phase 1 交接完整封存於 `docs/archive/PHASE_1_HANDOFF.md`；Prettier 增加 `endOfLine: auto`，避免不同電腦的換行格式造成檢查失敗。

## 驗證

- TypeScript typecheck：通過。
- lint（Prettier + ESLint）：通過。原有 CRLF 檔案曾使 Prettier 失敗，加入 endOfLine: auto 後通過，避免跨機換行噪音。
- 單元測試：12 項通過（設定與練習）。
- Edge E2E：12 項通過，涵蓋四個手機尺寸及桌面、正錯回饋、7/10 計分、重玩、退出、刷新、無題池與設定保存。
- Production SPA build：通過，輸出 dist/spa。
- 手機回饋與完成畫面截圖：已檢查，主要操作可見且無水平溢出。
- 內嵌瀏覽器工具因 sandboxPolicy 環境錯誤無法連線，改用專案既有 Playwright／Edge 測試。
- 本機驗證使用臨時 Node 24，不修改系統 Node；未使用過舊的系統 Node 22.15。

## 限制與後續

使用者已完成試用並確認沒問題，Phase 2 驗收通過。

提交前快速資安檢查：掃描現有追蹤與待加入檔案共 56 份，未發現常見私鑰、API key、token、硬編碼密碼或 URL 憑證格式。待提交檔案沒有 .env、憑證、資料庫、log、node_modules、dist 或測試產物；忽略規則已確認生效。新練習程式沒有外部傳輸、動態程式執行或 HTML 直接注入。此為提交內容快速檢查，非完整滲透測試或套件漏洞稽核。

- 正式題庫尚未擴充；sample 的課別代表本 App 練習歸屬，非助詞首次教學課別。
- 語音與音效尚無功能，開關仍只儲存偏好；AI Copy 與 PWA 後續實作。
- 手機實機尚未驗證；rootDir 提示沿用 Phase 1。
- 使用者已授權 commit／push；另一台需取得同一批程式及文件後才同步，實際推送狀態以 Git 遠端為準。
