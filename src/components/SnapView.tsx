import { useMemo, useState } from "react";
import {
  DEVICES,
  MOCKUPS,
  type DeviceCategory,
  type DeviceConfig,
} from "@/lib/devices";
import { captureScreenshot, SnapViewError } from "@/lib/api";
import { MockupFrame } from "@/components/mockups/MockupFrame";

const CATEGORIES: DeviceCategory[] = ["mobile", "tablet", "desktop"];

function isValidUrl(value: string) {
  return /^https?:\/\/\S+\.\S+/i.test(value.trim());
}

export function SnapView() {
  const [url, setUrl] = useState("");
  const [touched, setTouched] = useState(false);
  const [category, setCategory] = useState<DeviceCategory>("mobile");
  const [deviceId, setDeviceId] = useState<string>(DEVICES.mobile[0].id);
  const [mockupId, setMockupId] = useState<string>(MOCKUPS.mobile[0].id);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    src: string;
    width: number;
    height: number;
    device: DeviceConfig;
  } | null>(null);

  const device = useMemo(
    () => DEVICES[category].find((d) => d.id === deviceId) ?? DEVICES[category][0],
    [category, deviceId],
  );

  const urlValid = isValidUrl(url);
  const showUrlError = touched && url.length > 0 && !urlValid;

  function switchCategory(next: DeviceCategory) {
    setCategory(next);
    setDeviceId(DEVICES[next][0].id);
    setMockupId(MOCKUPS[next][0].id);
  }

  async function handleCapture() {
    setTouched(true);
    if (!urlValid) return;
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await captureScreenshot(url.trim(), device);
      const src = res.image.startsWith("data:")
        ? res.image
        : `data:image/png;base64,${res.image}`;
      setResult({
        src,
        width: res.width,
        height: res.height,
        device,
      });
    } catch (e) {
      setError(
        e instanceof SnapViewError
          ? e.message
          : "Something went wrong. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  }

  function handleDownload() {
    if (!result) return;
    const a = document.createElement("a");
    a.href = result.src;
    a.download = `snapview-${result.device.id}-${Date.now()}.png`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full max-w-3xl px-5 py-10 sm:py-16">
        {/* Hero */}
        <header className="mb-10 text-center">
          <div className="mx-auto mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C6EF7] to-[#5B4DD6] shadow-[0_10px_30px_-10px_rgba(124,110,247,0.7)]">
            <span className="text-lg font-bold text-white">S</span>
          </div>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            SnapView
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            See your site on any screen.
          </p>
        </header>

        {/* URL input */}
        <section className="mb-6">
          <label htmlFor="url" className="sr-only">
            Website URL
          </label>
          <input
            id="url"
            type="url"
            inputMode="url"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            placeholder="https://example.com"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onBlur={() => setTouched(true)}
            className="w-full rounded-xl border border-white/10 bg-card px-4 py-4 font-mono text-base text-foreground placeholder:text-muted-foreground/60 focus:border-[#7C6EF7] focus:outline-none focus:ring-2 focus:ring-[#7C6EF7]/30"
          />
          {showUrlError && (
            <p className="mt-2 text-sm text-destructive">
              Please enter a URL starting with http:// or https://
            </p>
          )}
        </section>

        {/* Category tabs */}
        <section className="mb-5">
          <div className="inline-flex w-full rounded-xl bg-card p-1 ring-1 ring-white/5">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                onClick={() => switchCategory(c)}
                className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium capitalize transition-colors ${
                  category === c
                    ? "bg-[#7C6EF7] text-white shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        </section>

        {/* Device variants */}
        <section className="mb-5">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Device
          </h2>
          <div className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 pb-1">
            {DEVICES[category].map((d) => {
              const active = d.id === deviceId;
              return (
                <button
                  key={d.id}
                  onClick={() => setDeviceId(d.id)}
                  className={`min-w-[160px] snap-start rounded-2xl border p-3 text-left transition-all ${
                    active
                      ? "border-[#7C6EF7] bg-[#7C6EF7]/10"
                      : "border-white/10 bg-card hover:border-white/20"
                  }`}
                >
                  <div className="text-sm font-medium">{d.label}</div>
                  <div className="mt-1 font-mono text-xs text-muted-foreground">
                    {d.width}×{d.height}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Mockup styles */}
        <section className="mb-6">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Mockup
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {MOCKUPS[category].map((m) => {
              const active = m.id === mockupId;
              return (
                <button
                  key={m.id}
                  onClick={() => setMockupId(m.id)}
                  className={`rounded-2xl border p-3 transition-all ${
                    active
                      ? "border-[#7C6EF7] bg-[#7C6EF7]/10"
                      : "border-white/10 bg-card hover:border-white/20"
                  }`}
                >
                  <MockupThumb styleId={m.id} category={category} />
                  <div className="mt-2 text-center text-sm font-medium">
                    {m.label}
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Error */}
        {error && (
          <div className="mb-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={handleCapture}
          disabled={loading || !urlValid}
          className="w-full rounded-xl bg-gradient-to-b from-[#8B7DFF] to-[#6A5BE5] py-4 text-base font-semibold text-white shadow-[0_10px_30px_-10px_rgba(124,110,247,0.7)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Capturing your screenshot..." : "Capture"}
        </button>

        {/* Result / loading */}
        {(loading || result) && (
          <section className="mt-10">
            <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Preview
            </h2>
            <div className="mx-auto w-full max-w-md">
              <MockupFrame
                style={mockupId}
                category={category}
                url={url}
                width={device.width}
                height={device.height}
              >
                {loading ? (
                  <div className="flex h-full w-full items-center justify-center bg-[#111114]">
                    <Spinner />
                  </div>
                ) : result ? (
                  <img
                    src={result.src}
                    alt="Captured screenshot"
                    className="h-full w-full object-cover object-top"
                  />
                ) : null}
              </MockupFrame>

              {result && !loading && (
                <div className="mt-5 flex gap-3">
                  <button
                    onClick={handleDownload}
                    className="flex-1 rounded-xl bg-[#7C6EF7] py-3 text-sm font-semibold text-white hover:brightness-110"
                  >
                    Download PNG
                  </button>
                  <button
                    onClick={handleCapture}
                    className="flex-1 rounded-xl border border-white/10 bg-card py-3 text-sm font-semibold text-foreground hover:border-white/20"
                  >
                    Recapture
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        <footer className="mt-16 text-center text-xs text-muted-foreground">
          Screenshots are captured on your backend and discarded. V1.
        </footer>
      </main>
    </div>
  );
}

function Spinner() {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-[#7C6EF7]" />
      <p className="text-xs text-muted-foreground">Capturing your screenshot...</p>
    </div>
  );
}

function MockupThumb({
  styleId,
  category,
}: {
  styleId: string;
  category: DeviceCategory;
}) {
  // Tiny visual hint for each mockup style.
  const isPortrait = category !== "desktop";
  const aspect = isPortrait ? "9 / 14" : "16 / 10";

  if (styleId === "clay") {
    return (
      <div
        className="mx-auto w-full rounded-lg bg-gradient-to-br from-white/15 to-white/5 ring-1 ring-white/10"
        style={{ aspectRatio: aspect }}
      />
    );
  }
  if (styleId === "browser") {
    return (
      <div
        className="mx-auto w-full overflow-hidden rounded-lg bg-[#0f0f12] ring-1 ring-white/10"
        style={{ aspectRatio: aspect }}
      >
        <div className="flex items-center gap-1 bg-[#1f1f25] px-1.5 py-1">
          <span className="h-1 w-1 rounded-full bg-[#ff5f57]" />
          <span className="h-1 w-1 rounded-full bg-[#febc2e]" />
          <span className="h-1 w-1 rounded-full bg-[#28c840]" />
        </div>
        <div className="h-full bg-white/5" />
      </div>
    );
  }
  if (styleId === "macbook") {
    return (
      <div className="mx-auto w-full">
        <div
          className="rounded-t-md bg-[#0f0f12] p-0.5 ring-1 ring-white/10"
          style={{ aspectRatio: "16 / 10" }}
        >
          <div className="h-full w-full rounded-sm bg-white/5" />
        </div>
        <div className="mx-auto h-1 w-[108%] -translate-x-[3.7%] rounded-b-md bg-white/10" />
      </div>
    );
  }
  // device
  return (
    <div
      className="mx-auto w-2/3 rounded-[10px] bg-[#0f0f12] p-1 ring-1 ring-white/10"
      style={{ aspectRatio: aspect }}
    >
      <div className="h-full w-full rounded-md bg-white/5" />
    </div>
  );
}
