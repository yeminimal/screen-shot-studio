# SnapView V2 — Implementation Plan

Three changes per the spec: scrollable live preview inside the mockup, full responsiveness across breakpoints, and downloads that composite the mockup frame onto the screenshot.

## 1. Scrollable Live Preview (frontend + backend)

**Flow:** `idle → previewing → capturing → captured`

- Rename primary CTA to **Load Preview**. On click (with valid URL), switch to `previewing`.
- In `previewing`, render a scaled `<iframe src={url}>` inside the existing `MockupFrame`:
  - Container width = `min(viewport - 32, 480)`; `scale = containerWidth / device.width`.
  - Inner wrapper sized to `device.width × device.height`, `transform: scale(...)`, `transformOrigin: top left`, `overflow: hidden` so the user scrolls *inside* the iframe.
  - Mockup chrome stays on top via `position: absolute; inset: 0; pointer-events: none` so scrolling isn't blocked.
  - `sandbox="allow-scripts allow-same-origin allow-forms"`.
- **Iframe failure fallback:** detect `onerror` / load timeout (~6s) → show "This site doesn't allow previewing in frames. You can still capture it directly." with a **Capture Without Preview** button that bypasses the iframe step and calls the API with `scrollY: 0`.
- Show **Capture This View** below the preview. Reads `iframeRef.current.contentWindow.scrollY` (same-origin only; cross-origin falls back to 0 with a small notice).
- Backend (`snapview-backend/server.js`): accept `scrollY` in the POST body, after `page.goto` do `page.evaluate(y => scrollTo(0,y), scrollY)` + 500ms settle, then screenshot as today.

> ⚠️ Honest caveat: most production sites send `X-Frame-Options: DENY` or a frame-ancestors CSP — the iframe will render blank for them. The fallback above is what users will hit on those sites; this is a limitation of in-browser previewing, not a bug.

## 2. Responsiveness

Apply Tailwind responsive prefixes throughout `SnapView.tsx` and `MockupFrame.tsx`:

- **Container:** `max-w-[480px] sm:max-w-[640px] lg:max-w-[900px] mx-auto px-4 sm:px-6 lg:px-8`.
- **URL input:** `h-12 sm:h-[52px] lg:h-14`, font `text-sm sm:text-[15px] lg:text-base`.
- **Category tabs:** stay 3-up full width; `h-10 sm:h-11`.
- **Device selector:** mobile horizontal scroll, `sm:grid sm:grid-cols-3 sm:overflow-visible`.
- **Mockup selector:** 3 cards always; bump padding + thumb size at `sm:` and `lg:`.
- **CTAs:** full width on mobile (`h-13`), `sm:h-14`, `lg:max-w-[480px] lg:mx-auto`.
- **Preview container:** `max-w-full sm:max-w-[500px] lg:max-w-[600px]`.
- **Result actions:** `flex flex-col sm:flex-row gap-3`, each `flex-1 h-12`.

No design tokens, colors, fonts, or radii change.

## 3. Download = Screenshot + Mockup Frame (canvas composite)

New file `src/lib/canvasComposite.ts` exporting `getMockupInsets`, `drawMockupFrame`, `drawMockupOverlay`, `roundRect`, `truncateUrl` — implementations per spec, typed.

Rewrite `handleDownload` in `SnapView.tsx`:

1. Create offscreen canvas at `(width + 2·PADDING) × (height + 2·PADDING)` with 2× DPR scale.
2. Fill background `#0F0F11`.
3. `drawMockupFrame(ctx, mockupId, w, h, PADDING, url)`.
4. Load screenshot `<Image>`, draw inside frame with `getMockupInsets` offsets.
5. `drawMockupOverlay(...)` for notch / dots / URL bar / hinge.
6. `canvas.toBlob` → anchor download `snapview-{device}-{mockup}-{ts}.png`.

The on-screen `MockupFrame` is unchanged; the canvas is a parallel renderer matching its look closely enough to read as "the same image".

## Files touched

- `src/components/SnapView.tsx` — stage state, iframe stage, fallback, scrollY capture, responsive classes, new download.
- `src/components/mockups/MockupFrame.tsx` — make chrome overlay-positioned so iframe is scrollable; minor responsive tweaks.
- `src/lib/api.ts` — accept optional `scrollY` arg, send in body.
- `src/lib/canvasComposite.ts` — new.
- `snapview-backend/server.js` — read `scrollY`, scroll page before screenshot. (Needs redeploy on Railway.)

## Out of scope (kept as-is)

Design tokens, device/mockup configs, `VITE_API_URL` pattern, `/api/health`, error messages.

## Open question

Same-origin scroll position only works for sites that allow framing **and** are same-origin (essentially never in production). For cross-origin framed sites I'll pass `scrollY: 0` and show a small hint like "Scroll position capture isn't available for this site — capturing from top." OK to proceed with that, or do you want me to inject a small `postMessage` bridge (only useful for sites you control)?
