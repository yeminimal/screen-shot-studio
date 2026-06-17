# Deploy SnapView frontend to Vercel

Keep the Puppeteer screenshot service on Railway. Move only the TanStack Start frontend to Vercel.

## Why this needs setup

TanStack Start is a full-stack framework with SSR. The current `vite.config.ts` builds with Nitro targeting **Cloudflare Workers** (via `@lovable.dev/vite-tanstack-config`). Vercel needs a different Nitro preset (`vercel`) so the build emits Vercel-compatible serverless/edge functions instead of a Worker bundle.

## Steps

### 1. Push the repo to GitHub
Use the GitHub button in Lovable (top right → GitHub → Connect / Create Repository). Vercel deploys from a Git repo.

### 2. Switch the Nitro build target to Vercel
Edit `vite.config.ts` to override the Nitro preset:

```ts
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  nitro: {
    preset: "vercel",
  },
});
```

This swaps the default `cloudflare` preset for `vercel` so the build outputs `.vercel/output/` in the format Vercel expects. No other code changes are needed — server functions and routes work the same.

Caveat: this change will also affect Lovable's own Publish (which expects the Cloudflare preset). If you want to keep publishing from Lovable AND deploy to Vercel from the same repo, we'd gate the preset on an env var (e.g. `process.env.VERCEL ? "vercel" : undefined`) so Lovable keeps using the default and Vercel uses its own.

### 3. Create the Vercel project
1. vercel.com → **Add New → Project** → import the GitHub repo.
2. Framework preset: **Other** (Vercel will detect Vite; leave build defaults).
3. Build command: `npm run build` (or `bun run build`).
4. Output: leave default — Nitro's Vercel preset writes to `.vercel/output/` which Vercel picks up automatically.

### 4. Set environment variables in Vercel
Project Settings → Environment Variables:
- `VITE_API_URL` = `https://snapview-api-production.up.railway.app`

Apply to Production, Preview, and Development.

### 5. Deploy and grab the URL
Click **Deploy**. After it goes live, copy the Vercel URL (e.g. `https://snapview.vercel.app` and any preview URLs).

### 6. Update Railway CORS allowlist
In Railway → snapview-api service → Variables, add the Vercel URL(s) to `ALLOWED_ORIGINS`:

```
https://snap-view-anywhere.lovable.app,https://id-preview--dee3e71b-1ec0-489f-8945-1174217fecae.lovable.app,https://snapview.vercel.app
```

Save — Railway redeploys automatically. Without this, screenshot requests from the Vercel frontend will fail with CORS errors.

### 7. (Optional) Custom domain
Vercel → Project → Domains → add your domain and follow the DNS instructions. Then add that domain to Railway's `ALLOWED_ORIGINS` too.

## What stays the same

- All app code, routes, components, and the Railway backend.
- Lovable Cloud is not used here, so nothing to migrate.

## Open question

Do you want to **keep publishing from Lovable as well** (dual deploy), or **move publishing entirely to Vercel**? That decides whether step 2 hardcodes `preset: "vercel"` or gates it behind the `VERCEL` env var.
