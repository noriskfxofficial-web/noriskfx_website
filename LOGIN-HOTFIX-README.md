# No Risk FX v18.1 Login Hotfix

After deploying, test these URLs:

1. `/api/health?v=181`

Expected JSON must include:

```json
{
  "version": "v18.1-login-portal-hotfix",
  "adminPasswordFromEnv": true,
  "jwtSecretFromEnv": true
}
```

2. Admin:

`/admin`

Use:

- Username: value of `ADMIN_USER` in Netlify, usually `admin`
- Password: value of `ADMIN_PASSWORD` in Netlify

3. Client portal:

`/client-portal.html`

For a new client, press **Create account** first. After the account exists, use **Login**.

Required Netlify Environment Variables:

```text
ADMIN_USER=admin
ADMIN_PASSWORD=your_admin_password
JWT_SECRET=long_random_secret
JWT_EXPIRES_SECONDS=28800
BLOB_STORE=noriskfx-v18
```

All variables must include the Functions scope. After changing variables, run a fresh production deploy.
