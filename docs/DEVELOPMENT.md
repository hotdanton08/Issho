# 兩台電腦開發流程

同一個 repository 與遠端分支是程式碼同步來源；`PROJECT_HANDOFF.md` 記錄當前狀態，`docs/PRODUCT_SPEC.md` 保持產品需求。localStorage 設定只在各瀏覽器保存，不會跟 Git 同步。

## 開始工作

```bash
git status --short
git branch --show-current
git fetch origin
git pull --ff-only
```

先確認工作目錄乾淨再 pull；若有未提交內容，先辨識並提交自己的變更。不要用 reset --hard 或覆蓋檔案清理他台工作。pull 無法 fast-forward 時先檢查差異，解決衝突後再繼續。

閱讀 README、PROJECT_HANDOFF 與最新 Phase 文件，再安裝鎖定依賴：

```bash
corepack pnpm@10.34.6 install --frozen-lockfile
corepack pnpm@10.34.6 dev
```

兩台皆建議 Node 24 LTS（最低 Node 22.22）、pnpm 10；瀏覽器測試使用 Microsoft Edge。

## 結束工作

- 執行 typecheck、lint、單元測試、瀏覽器測試與 build。
- 更新 README 與 PROJECT_HANDOFF 的實作狀態；Phase 文件記錄實際驗證與未解決問題。
- 修改需求時才更新 PRODUCT_SPEC；不要把未完成 roadmap 寫成已完成。
- 同一筆 commit 包含相關程式碼、測試、文件及必要 lockfile。

```bash
git diff --stat
git status --short
# 檢查後選擇本次相關檔案
git add <本次檔案>
git commit -m "描述本次完成工作"
git push
```

切到另一台後再 fetch／pull。尚未 push 的本機變更不會出現在另一台。

## 同時工作

避免兩台同時改同一分支的相同檔案。確實需要並行時，各自開工作分支並事先分配檔案，完成後透過合併整合；只靠文件不能避免 Git 衝突。不要同步 node_modules、.quasar、dist、test-results，也不要把各機器絕對路徑寫進設定。

`src/router/typed-router.d.ts` 由 Quasar 產生；若只是換行差異，先確認沒有實際路由變動，不要當作功能修改。
