# SnapView Backend

Tiny Express + Puppeteer service that powers SnapView screenshots.

## Endpoints

- `GET /api/health` → `{ ok: true }`
- `POST /api/screenshot` body `{ url, device: { width, height, deviceScaleFactor, userAgent } }` → `{ image, width, height }` (image is base64 PNG, no `data:` prefix)

## Deploy to Railway

1. Copy this `snapview-backend/` folder into its own GitHub repo and push.
2. Go to [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub repo** → pick the repo.
3. Railway detects the `Dockerfile` automatically and builds. First build takes ~3–5 min (Chromium download).
4. **Variables** tab — add:
   - `ALLOWED_ORIGINS` = `https://snap-view-anywhere.lovable.app,https://id-preview--dee3e71b-1ec0-489f-8945-1174217fecae.lovable.app`
   - (Add your custom domain later, comma-separated.)
   - `PORT` is set by Railway automatically — don't override.
5. **Settings → Networking → Generate Domain** → copy the `https://<service>.up.railway.app` URL.
6. Test: `curl https://<service>.up.railway.app/api/health` → `{"ok":true}`.

## Wire to the Lovable frontend

In your Lovable project: **Project Settings → Environment Variables** → set:

```
VITE_API_URL = https://<service>.up.railway.app
```

(no trailing slash). Republish the frontend so the new env var is baked in.

## Local dev

```bash
npm install
npm start
# → http://localhost:3001
```

## Notes / limits

- Single shared browser instance; scale Railway resources if you expect concurrent traffic.
- 25s navigation timeout. Sites behind login/captcha will fail.
- No rate limiting or auth — add before exposing publicly at scale.
