# Deploy the SnapView backend to Railway

The SnapView frontend in this project is ready — it just needs a Puppeteer service to call. This plan generates a complete, deploy-ready backend repository (kept *outside* the frontend project) and walks through the Railway setup.

## What you'll get

A new folder `snapview-backend/` at the project root containing a standalone Node project you can push to its own GitHub repo and deploy to Railway. It will NOT be wired into the Lovable frontend build — it's just stored here for you to copy out.

### Files created

- `snapview-backend/package.json` — Express + Puppeteer, `start` script
- `snapview-backend/server.js` — Express app with:
  - `GET /api/health` → `{ ok: true }` for Railway healthchecks
  - `POST /api/screenshot` → accepts `{ url, device: { width, height, deviceScaleFactor, userAgent } }`, launches Puppeteer with `--no-sandbox`, sets viewport + UA, navigates with timeout, returns `{ image, width, height }` base64 PNG
  - CORS allowlist via `ALLOWED_ORIGINS` env (comma-separated)
  - Basic input validation + timeout/error mapping (408/504/4xx)
  - Single shared browser instance, re-launched on disconnect
- `snapview-backend/Dockerfile` — `node:20-slim` base + Chromium system deps so Puppeteer's bundled Chrome runs reliably on Railway
- `snapview-backend/.dockerignore`
- `snapview-backend/railway.json` — sets builder to Dockerfile, healthcheck path `/api/health`, restart policy
- `snapview-backend/README.md` — step-by-step Railway deploy + how to wire `VITE_API_URL` back into Lovable

## Railway deploy steps (in the README)

1. Push `snapview-backend/` to its own GitHub repo.
2. Railway → New Project → Deploy from GitHub repo → pick the repo.
3. Railway auto-detects the Dockerfile and builds.
4. Set env vars:
   - `ALLOWED_ORIGINS=https://snap-view-anywhere.lovable.app,https://id-preview--dee3e71b-1ec0-489f-8945-1174217fecae.lovable.app`
   - `PORT` is injected by Railway automatically; server binds to `process.env.PORT`.
5. Settings → Networking → **Generate Domain** → copy `https://<service>.up.railway.app`.
6. In Lovable: Project Settings → Environment Variables → set `VITE_API_URL` to that URL (no trailing slash). Republish.

## Frontend changes

None. The existing `src/lib/api.ts` already POSTs to `${VITE_API_URL}/api/screenshot` with the right payload shape.

## Out of scope (Phase 2)

- Auth / rate limiting / abuse protection on the backend
- Full-page screenshots, ad blocking, cookie banners auto-dismiss
- Caching / persistence of captures
