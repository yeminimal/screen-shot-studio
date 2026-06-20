# SnapView V3 — Unified Device Dropdown

Replace the three-step selector (category tabs → device cards → mockup style cards) with one searchable dropdown. Mockup is derived from the selected device. URL input, capture flow, iframe preview, canvas composite, and backend stay unchanged.

## 1. Devices data (`src/lib/devices.ts`)

Rewrite to a flat `ALL_DEVICES` list plus `DEVICE_GROUPS`, keeping TypeScript:

- `DeviceCategory = "phone" | "tablet" | "desktop"`
- `MockupId = "device-mobile" | "device-tablet" | "macbook" | "browser-desktop"`
- `DeviceConfig` gains `category` and `mockup` fields.
- Export `ALL_DEVICES` with the full 23-device list from the spec verbatim, and `DEVICE_GROUPS` (Phones / Tablets / Laptops & Desktops).
- Keep `DeviceConfig` shape backward-compatible with `api.ts` and `canvasComposite.ts` (still has `width`, `height`, `deviceScaleFactor`, `userAgent`, `id`, `label`).
- Drop the `MOCKUPS` export (no longer needed).

Map the spec's mockup ids onto the existing `MockupFrame` `style` prop so we don't touch the frame component:

| Spec `mockup`     | `MockupFrame` style | Category passed |
|-------------------|---------------------|-----------------|
| `device-mobile`   | `device`            | `mobile`        |
| `device-tablet`   | `device`            | `tablet`        |
| `macbook`         | `macbook`           | `desktop`       |
| `browser-desktop` | `browser`           | `desktop`       |

Add a small helper `resolveMockup(device)` returning `{ style, frameCategory }` for `MockupFrame` and `canvasComposite`.

## 2. New `DeviceDropdown` component (`src/components/DeviceDropdown.tsx`)

Custom component (not shadcn Select — we need grouped headers + search + bottom sheet on mobile).

- Props: `value: DeviceConfig`, `onChange: (d: DeviceConfig) => void`.
- Trigger button: full width, h-[52px] sm:h-14, dark card bg, border, ring on open. Shows Lucide icon (`Smartphone` / `Tablet` / `Laptop` / `Monitor`) by category, device label, dimensions in mono on the right, `ChevronDown`.
- Panel:
  - Mobile (`< sm`): fixed bottom sheet, `max-h-[65vh]`, rounded-t-[20px], `pb-[env(safe-area-inset-bottom)]`, with full-screen backdrop `bg-black/60` that closes on tap.
  - Desktop (`sm:`): absolute under trigger, `max-h-80`, border, shadow, z-50.
- Sticky search input at top filters by `label.toLowerCase().includes(query)`.
- Groups rendered in `DEVICE_GROUPS` order with uppercase header; hide groups whose filtered list is empty; show "No devices match" when all empty.
- Each row: name left, dimensions right (mono 11px). Hover bg, selected bg `#7C6EF7/10` + accent text.
- Closes on selection, Esc, outside click, or backdrop tap.
- Keyboard: Esc closes; focus search on open; arrow-key navigation is out of scope for V3.

Uses existing design tokens — accent `#7C6EF7`, card `bg-card`, `border-white/10`, etc.

## 3. `SnapView.tsx` updates

- State: remove `category`, `deviceId`, `mockupId`. Add `selectedDevice` defaulting to `ALL_DEVICES[0]` (iPhone 17 Pro Max).
- Replace the category tabs + device cards + mockup cards sections with a single section containing `<DeviceDropdown value={selectedDevice} onChange={...} />`. Changing the device calls `resetPreview()`.
- Remove `switchCategory`, `CATEGORIES`, `MockupThumb`, and the now-unused `MOCKUPS` import.
- Derive `const { style: mockupStyle, frameCategory } = resolveMockup(selectedDevice)` and pass to `<MockupFrame style={mockupStyle} category={frameCategory} ... />` in both preview and result branches.
- Stash `mockupStyle` + `frameCategory` in `result` alongside the rest, so download keeps using the right frame.
- `compositeAndDownload` call: pass `mockupId: result.mockupStyle` and `category: result.frameCategory` (matches its current `mockupId` / `category` arg names).
- Result `device` continues to be the full `DeviceConfig` so `captureScreenshot(url, device, scrollY)` works unchanged.

## 4. Untouched

- `MockupFrame.tsx`, `canvasComposite.ts`, `api.ts`, `snapview-backend/server.js`, URL input + validation, Load Preview → Capture This View flow, scrollable iframe behaviour, design tokens, container max-widths.

## Files touched

- `src/lib/devices.ts` — rewrite (full list + groups + `resolveMockup`).
- `src/components/DeviceDropdown.tsx` — new.
- `src/components/SnapView.tsx` — swap selector UI and state.

## Open question

The spec adds `deviceScaleFactor` and `userAgent` per device. The backend currently receives the whole `device` object — confirm it already honours `deviceScaleFactor` and `userAgent` (it should, based on the existing capture flow). If it ignores them, all 23 devices will still capture, just at default DPR / UA. Want me to also verify/patch `snapview-backend/server.js` to use them, or leave that out of V3?
