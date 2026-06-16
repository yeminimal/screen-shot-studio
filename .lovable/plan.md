## SnapView — Frontend Build Plan

Build the complete React frontend for SnapView. Screenshot capture is delegated to an external Puppeteer backend that you deploy separately to Railway. The frontend reads `VITE_API_URL` (falls back to `http://localhost:3001`) and POSTs to `/api/screenshot`.

### Scope
- Frontend only in this project. No Lovable Cloud, no server functions, no backend code shipped here.
- Pure CSS/SVG mockup frames (no device PNG assets).
- No auth, no persistence, no payments.

### Files

**Design tokens** — `src/styles.css`
- Replace shadcn defaults with SnapView dark palette: bg `#0F0F11`, card `#1A1A1F`, text `#F0F0F4`, accent `#7C6EF7`, border subtle white/8%.
- Inter for UI, JetBrains Mono for the URL input. Load both via `<link>` in `__root.tsx` head.
- Radii: cards 16px, inputs/buttons 12px.

**Root route** — `src/routes/__root.tsx`
- Add Google Fonts `<link>` entries for Inter + JetBrains Mono.
- Update default meta (title "SnapView — See your site on any screen", description, og tags).

**Home route** — `src/routes/index.tsx`
- Renders `<SnapView />`. Per-route head() with SnapView title/description/og.

**Device config** — `src/lib/devices.ts`
- Export `DEVICES` constant with all 9 device configs (3 mobile, 3 tablet, 3 desktop) exactly as specified, including `id`, `label`, `width`, `height`, `deviceScaleFactor`, `userAgent`.
- Export `MOCKUPS` per category: mobile `[clay, device, browser]`, tablet `[clay, device, browser]`, desktop `[clay, browser, macbook]`.
- TypeScript types `DeviceConfig`, `DeviceCategory`, `MockupStyle`.

**API client** — `src/lib/api.ts`
- `captureScreenshot(url, device)` → POST `${API_URL}/api/screenshot` with `{ url, device }`, returns `{ image, width, height }`.
- `API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3001'`.
- Maps HTTP/network errors to friendly messages (invalid URL, timeout, blocked, generic).

**Main component** — `src/components/SnapView.tsx`
- Hero: "SnapView" wordmark + tagline.
- URL input (mono font, full width, large tap target, `inputMode="url"`, paste-friendly). Inline validation: must start with `http://` or `https://`.
- Category tabs: Mobile | Tablet | Desktop (default Mobile). Switching resets selected device + mockup to first of category.
- Device variant: horizontal-scroll cards (snap), each shows label + `WxH`.
- Mockup style: 3 thumbnail cards with tiny SVG preview of the frame.
- Capture CTA: full-width gradient button, disabled while loading or URL invalid.
- States: idle / loading (spinner + "Capturing your screenshot...") / success / error (friendly message + retry).
- Result: screenshot rendered inside selected mockup frame component. Action buttons: Download PNG, Recapture.
- Download: convert base64 → blob → anchor download with filename `snapview-{deviceId}-{timestamp}.png`. Note: V1 downloads the raw screenshot (not the framed composite) to keep it dependency-free.

**Mockup frame components** — `src/components/mockups/`
- `ClayFrame.tsx` — minimal rounded frame with soft shadow.
- `DeviceFrame.tsx` — phone/tablet outline with notch/camera dot, scales by aspect ratio.
- `BrowserFrame.tsx` — browser chrome (3 dots + URL pill) sized for mobile/tablet/desktop variants.
- `MacBookFrame.tsx` — laptop body with hinge below screen.
- Single `<MockupFrame style={...} category={...} url={...} screenshotSrc={...} width height />` dispatcher.
- All frames are pure CSS/SVG, responsive (scale to container width while preserving captured aspect ratio).

### Behavior notes
- `aspect-ratio` from `width/height` keeps the framed preview proportional on small screens.
- Loading skeleton inside the frame slot during capture.
- Errors shown inline above the CTA, not as a toast.
- No iframe of the target site — screenshot only.

### Out of scope (Phase 2)
- Backend code (lives in a separate Railway repo).
- Compositing the mockup frame into the downloaded PNG (would need html-to-image/canvas).
- Saved captures, share links, auth, rate-limit UI, full-page screenshots, dark/light toggle.

### Verification
- Build succeeds; routes render.
- With no backend, clicking Capture surfaces a friendly connection error (not a crash).
- Layout works at 390px width; scales cleanly to desktop.

### User action required after build
Add `VITE_API_URL` to the project env pointing at the deployed Railway Puppeteer service; until then the app runs but Capture will error.
