# No Risk FX v19 Final Institutional Platform

Includes:
- Institutional glassy homepage
- Services and Academy pages
- Tradays / MQL5 calendar widget
- Client Portal with dashboard, resources and support tickets
- Admin CMS for website content, services, academy modules, resources/uploads, users and tickets
- Netlify Functions backend + Netlify Blobs storage

## Deploy
Upload the CONTENTS of this folder to the existing GitHub repository root, not the folder itself.

Required Netlify Environment Variables:
- ADMIN_USER=admin
- ADMIN_PASSWORD=your-strong-password
- JWT_SECRET=long-random-secret
- JWT_EXPIRES_SECONDS=28800
- BLOB_STORE=noriskfx-v19

Then deploy and test:
- /api/health?v=19
- /admin
- /client-portal.html

## Support tickets
Tickets are saved inside the Admin CMS ticket inbox. The client portal also posts to a hidden Netlify Form named `nrfx-support-ticket`; enable Netlify Forms notifications if you want email notifications.

## File uploads
Admin resources can store small files/images/PDFs as data URLs in Netlify Blobs. For large files, upload elsewhere and paste the URL.
