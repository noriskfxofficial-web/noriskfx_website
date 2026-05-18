# No Risk FX v18 — Institutional Website + Full Admin CMS + Client Portal

This package includes:

- Fully redesigned institutional/glassy website.
- Full Admin CMS for all main pages and content collections.
- Client Portal with registration/login, dashboard, announcements, resources and tickets.
- Netlify Functions backend.
- Netlify Blobs persistence.
- Tradays/MQL5 official economic calendar widget.
- TradingView ticker tape widget.

## Netlify Environment Variables

Set these in Netlify > Project configuration > Environment variables:

```
ADMIN_USER=admin
ADMIN_PASSWORD=your_strong_password
JWT_SECRET=long_random_secret
JWT_EXPIRES_SECONDS=28800
BLOB_STORE=noriskfx-v18
```

Then redeploy without cache.

## Important

Trading content is educational only and not financial advice.
