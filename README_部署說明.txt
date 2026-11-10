熊爸找車位 V1.4 PWA（新北市）

包含：index.html、manifest.webmanifest、sw.js、icon-192.png、icon-512.png。

部署方式（GitHub Pages）：
1. 建立公開 GitHub 儲存庫，將五個檔案放在儲存庫根目錄。
2. Settings > Pages > Build and deployment > Deploy from a branch，選 main / (root) 並儲存。
3. 等待部署完成後，用手機 Chrome 開啟 https://帳號.github.io/儲存庫名稱/ 。
4. Chrome 右上角 ⋮ > 安裝應用程式／新增至主畫面，允許位置權限。

注意：
- 目前沒有實際部署網址，尚未驗證官方 API 是否支援跨網域讀取、資料格式及空位代碼。
- 如果 API 被 CORS 擋住，需要另外建置後端代理，不能靠 PWA 解決。
- 本版對未確認的數字狀態碼採保守處理，避免把占用車格誤判成空位；因此即使資料讀取成功也可能暫時顯示 0 格。
- GPS 必須允許定位，HTTPS 網站才有穩定的 PWA／Service Worker 行為。
- 網路斷線不會提供假即時空位。
- Google Maps 使用駕車導航，清單距離是直線距離。
