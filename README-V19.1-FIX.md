# No Risk FX v19.1 assets + icons fix

This version fixes two visible issues:

1. Broken showcase images: make sure the folder `assets/showcases/` is uploaded to GitHub with these files:
   - home-hero.png
   - services.png
   - academy.png
   - client-dashboard.png
   - client-resources.png
   - client-support.png

2. Service icons showing as text like `graduation-cap`, `workflow`, `line-chart`: `script.js` now converts those CMS icon names into inline SVG icons.

After upload/deploy, test these direct URLs:
- https://noriskfx.conrfx-home-market-panel.png
- https://noriskfx.conrfx-client-dashboard.png
- https://noriskfx.co/api/health?v=191

Health should show version `v19-final-institutional-portal-cms` or newer.
