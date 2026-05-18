# No Risk FX v20 Final Real UI Platform

This is the final real UI build, not screenshot-based.

## What changed
- Real homepage UI with live TradingView widgets.
- Real service cards: editable HTML/CSS cards with separate root-level image assets.
- Real academy roadmap UI, not a screenshot.
- Real client portal dashboard with live TradingView data panel.
- Resources and support tickets managed via Netlify Functions + Netlify Blobs.
- All new visual PNG assets are placed in the root directory, not nested in folders.

## Root assets
- nrfx-home-market-panel.png
- nrfx-service-tradingview.png
- nrfx-service-mt5.png
- nrfx-service-community.png
- nrfx-service-risk.png
- nrfx-service-analysis.png
- nrfx-service-academy.png
- nrfx-client-dashboard.png
- nrfx-client-resources.png
- nrfx-client-support.png
- nrfx-academy-roadmap.png
- nrfx-academy-hero.png

## Netlify Environment Variables
ADMIN_USER=admin
ADMIN_PASSWORD=your_strong_password
JWT_SECRET=long_random_secret
JWT_EXPIRES_SECONDS=28800
BLOB_STORE=noriskfx-v20

## Test after deploy
https://noriskfx.co/api/health?v=20

Expected version:
v20-final-real-ui-live-platform
