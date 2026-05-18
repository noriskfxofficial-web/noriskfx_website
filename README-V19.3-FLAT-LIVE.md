# No Risk FX v19.3 — Flat assets + Live TradingView hero

Important upload note: all generated PNG visuals used by the public pages are in the repository root, not inside `assets/showcases`.

Root PNGs:
- nrfx-home-market-panel.png (fallback static market panel)
- nrfx-client-dashboard.png
- nrfx-client-resources.png
- nrfx-client-support.png
- nrfx-academy-roadmap.png
- nrfx-service-tradingview.png
- nrfx-service-mt5.png
- nrfx-service-community.png
- nrfx-service-risk.png
- nrfx-service-analysis.png
- nrfx-service-academy.png

The homepage hero now uses official TradingView widgets inside a glassy No Risk FX shell for live market quotes/charts. If TradingView is blocked by the browser or region, the design remains stable.

After upload, test:
https://noriskfx.co/api/health?v=193
Expected version: v19.3-flat-assets-live-tradingview

Admin env variables:
ADMIN_USER=admin
ADMIN_PASSWORD=your_password
JWT_SECRET=long_random_secret
JWT_EXPIRES_SECONDS=28800
BLOB_STORE=noriskfx-v19
