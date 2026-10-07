# Issho · 日文助詞練習

以 Vue 3、TypeScript、Quasar CLI with Vite 與 Pinia 建立的 mobile-first App。

目前已實作 **Phase 1 App Shell + Phase 2 核心答題 + Phase 3 三種題型**。開啟首頁 → 開始 → 選助詞 → 看短用途回饋 → 繼續 → 完成 10 題。

## 執行

使用 **Node 24 LTS**（Quasar 最低需要 Node 22.22）及 pnpm 10。兩台電腦請使用相同工具版本與 `pnpm-lock.yaml`。

```bash
node --version
corepack pnpm@10.34.6 install --frozen-lockfile
corepack pnpm@10.34.6 dev
```

預設網址為 http://localhost:9000/ 。若已有 pnpm 10，可直接執行 `pnpm install --frozen-lockfile` 和 `pnpm dev`。不要使用 npm install 產生第二份 lockfile。

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm test:e2e
pnpm build
```

`lint` 只檢查；自動修正使用 `lint:fix`。E2E 使用本機 Microsoft Edge，檢查 375×667、390×844、393×852、430×932 與桌面。截圖位於 `test-results/`；production SPA 位於 `dist/spa/`。

## 目前行為

- 預設第 18 課、に／で、選助詞；設定以 `issho.settings.v1` 即時保存。
- 第 18 課共 10 筆原創 sample：5 題含「動詞辭書形＋前に」，5 題含「場所で＋ことができます」。に 的目標用途為前に／時間點，で 為動作場所；同句其他助詞不當成判斷目標。
- 每組 10 題，隨機題序及選項順序。優先使用未出過的相符例句，題池不足時重用例句補至 10 題；預設雙助詞設定每組不重複。
- 嚴格依已選課程及助詞篩選，只使用例句中已審核且被選取的錯誤選項。目前只有 に／で 對比，不將所有已選助詞硬塞成選項。
- 課程須按目標助詞的具體用法與句型核對，不能只靠背景句型或 lesson 數字；規則見 [CONTENT_RULES.md](docs/CONTENT_RULES.md)。既有で／動作場所 sample 的第 18 課歸屬仍待教材核對，未完成內容驗收。
- 選助詞、助詞用途、找錯與混合皆已開放；沒有相符題目時顯示提示並停用開始，不自動切模式或課程。
- 練習設定每次開啟都收合；點範圍／助詞／模式才展開，同時只開一項。全選／清空僅在展開後顯示。
- 用途題標出目標助詞，允許單一助詞。找錯使用 ○／× 圖示選項（保留無障礙標籤），每組同時含正確與錯誤句，單模式各 5 題；錯誤助詞可以在選取範圍外，練習目標仍以正確句助詞篩選。
- 混合模式：選兩個以上助詞時使用三種題型；單一助詞時只使用用途與找錯。10 題採簡單平均輪替後打亂，不做弱點加權。
- 點答案即提交；提交後鎖住選項，只顯示對錯、正解與短用途標籤。按繼續才換題。
- 完成顯示分數，可再來一組或回首頁；頂部 × 可直接離開。離開或重新整理會放棄當次 session，不影響設定。
- 作答紀錄與設定快照只留在記憶體。設定不跨裝置同步。
- 音效／日文語音開關目前只保存偏好；TTS、音效、AI Copy、PWA 與離線功能尚未實作。

## 結構

- `src/pages/index/(index).vue`：首頁與練習入口。
- `src/components/PracticeSession.vue`：題目、短回饋與完成畫面。
- `src/composables/usePractice.ts`：session 狀態、鎖答、繼續、離開與重玩。
- `src/services/practice.ts`：精確篩選、抽題、判定與計分。
- `src/data/examples.ts`、`src/types/practice.ts`：可重用原創例句與題目／紀錄型別。
- `src/components/PracticeSettings.vue`、`AppSettings.vue`、`SettingsPanel.vue`：設定介面。
- `src/stores/settings.ts`、`src/services/settings.ts`、`src/types/settings.ts`：設定與 localStorage。
- `tests/practice.test.ts`、`tests/settings.test.ts`、`tests/e2e/`：邏輯與瀏覽器測試。

## 兩台電腦接續

請依 [同步工作流程](docs/DEVELOPMENT.md)，開始前同步 Git，結束時一起提交程式、測試及文件。最新交接看 [PROJECT_HANDOFF.md](PROJECT_HANDOFF.md)，最新驗證紀錄看 [Phase 3](docs/PHASE_3.md)，先前驗證保留於 [Phase 2](docs/PHASE_2.md)。

下一階段為 Phase 4：音效與日文 TTS；AI Copy 在 Phase 5。後續需要另行授權。產品需求以 `docs/PRODUCT_SPEC.md` 為準。
