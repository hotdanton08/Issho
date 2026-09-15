# Issho · 日文助詞練習

以 Vue 3、TypeScript、Quasar CLI with Vite 與 Pinia 建立的 mobile-first App。

目前範圍為 **Phase 1 — App Shell**：首頁、練習設定、App 設定，以及 localStorage persistence。
首頁只保留課程、助詞與主要操作；「開始」目前尚未接上作答流程，也不顯示佔位提示。正式作答留待 Phase 2。

## 開發與驗證

```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm build
```

`pnpm lint` 只檢查；需要自動修正時使用 `pnpm lint:fix`。
E2E 使用已安裝的 Microsoft Edge，以 375×667、390×844、393×852、430×932 及桌面尺寸檢查首頁與設定。
截圖輸出至 `test-results/`。Production SPA 輸出至 `dist/spa/`。
目前不啟用 PWA、Service Worker 或離線功能。

## 結構

- `src/layouts/MainLayout.vue`：Quasar 基礎 layout。
- `src/pages/index.vue`、`src/pages/index/(index).vue`：路由容器與手機首頁。
- `src/components/SettingsPanel.vue`：共用底部 panel、捲動內容與完成按鈕。
- `src/components/PracticeSettings.vue`：課程、助詞、模式展開選擇。
- `src/components/AppSettings.vue`：音效與日文語音開關，目前僅保存偏好。
- `src/stores/settings.ts`：Pinia state、選取操作、首頁摘要與 persistence。
- `src/services/settings.ts`：預設值、儲存資料驗證與設定有效性。
- `src/types/settings.ts`：設定型別、助詞與模式清單。
- `tests/settings.test.ts`、`tests/e2e/shell.spec.ts`：狀態與瀏覽器互動測試。

## 設定行為

預設第 18 課、に／で、選助詞，音效與日文語音皆為 ON。
五項偏好以 `issho.settings.v1` 儲存，操作即時生效，關閉 panel 也會保留。
課程採精確多選，例如 `[3, 5, 18]`，不自動包含中間課程。
空選擇會顯示提示並停用開始；選助詞模式至少需要兩個助詞。
損壞資料使用預設值，非法資料會過濾，無法使用 localStorage 時仍可操作並顯示未保存提示。

## 下一階段

Phase 2 依 `docs/PRODUCT_SPEC.md`，使用第 18 課少量原創例句建立選助詞的 10 題 session、進度、答案判定、簡短用途回饋與完成畫面。
其他題型引擎、聲音、AI Copy、PWA 與完整題庫依後續 Phase 逐步加入。
