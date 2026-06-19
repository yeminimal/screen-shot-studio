import { useEffect, useMemo, useRef, useState } from "react";
import {
  DEVICES,
  MOCKUPS,
  type DeviceCategory,
  type DeviceConfig,
} from "@/lib/devices";
import { captureScreenshot, SnapViewError } from "@/lib/api";
import { MockupFrame } from "@/components/mockups/MockupFrame";
import { compositeAndDownload } from "@/lib/canvasComposite";

const CATEGORIES: DeviceCategory[] = ["mobile", "tablet", "desktop"];

type Stage = "idle" | "previewing" | "capturing" | "captured";

function isValidUrl(value: string) {
  return /^https?:\/\/\S+\.\S+/i.test(value.trim());
}

export function SnapView() {
  const [url, setUrl] = useState("");
  const [touched, setTouched] = useState(false);
  const [category, setCategory] = useState<DeviceCategory>("mobile");
  const [deviceId, setDeviceId] = useState<string>(DEVICES.mobile[0].id);
  const [mockupId, setMockupId] = useState<string>(MOCKUPS.mobile[0].id);

  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    src: string;
    width: number;
    height: number;
    device: DeviceConfig;
    mockupId: string;
    category: DeviceCategory;
    url: string;
  } | null>(null);

  const [iframeError, setIframeError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const previewBoxRef = useRef<HTMLDivElement | null>(null);

  // Container width is responsive to the preview slot; recompute on resize.
  const [containerWidth, setContainerWidth] = useState(360);

  const device = useMemo(
    () => DEVICES[category].find((d) => d.id === deviceId) ?? DEVICES[category][0],
    [category, deviceId],
  );

  useEffect(() => {
    function update() {
      const el = previewBoxRef.current;
      const slot = el?.clientWidth ?? Math.min(window.innerWidth - 32, 480);
      setContainerWidth(Math.max(240, slot));
    }
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [stage]);

  const urlValid = isValidUrl(url);
  const showUrlError = touched && url.length > 0 && !urlValid;

  const scale = containerWidth / device.width;

  function switchCategory(next: DeviceCategory) {
    setCategory(next);
    setDeviceId(DEVICES[next][0].id);
    setMockupId(MOCKUPS[next][0].id);
    resetPreview();
  }

  function resetPreview() {
    setStage("idle");
    setResult(null);
    setError(null);
    setIframeError(false);
  }

  function handleLoadPreview() {
    setTouched(true);
    if (!urlValid) return;
    setError(null);
    setResult(null);
    setIframeError(false);
    setStage("previewing");
  }

  async function doCapture(scrollY: number) {
    setStage("capturing");
    setError(null);
    try {
      const res = await captureScreenshot(url.trim(), device, scrollY);
      const src = res.image.startsWith("data:")
        ? res.image
        : `data:image/png;base64,${res.image}`;
      setResult({
        src,
        width: res.width,
        height: res.height,
        device,
        mockupId,
        category,
        url: url.trim(),
      });
      setStage("captured");
    } catch (e) {
      setError(
        e instanceof SnapViewError
          ? e.message
          : "Something went wrong. Please try again.",
      );
      setStage("previewing");
    }
  }

  function handleCaptureThisView() {
    let scrollY = 0;
    try {
      scrollY = iframeRef.current?.contentWindow?.scrollY ?? 0;
    } catch {
      scrollY = 0; // cross-origin — best effort
    }
    void doCapture(Math.round(scrollY));
  }

  function handleDirectCapture() {
    void doCapture(0);
  }

  async function handleDownload() {
    if (!result) return;
    try {
      await compositeAndDownload({
        imageSrc: result.src,
        width: result.width,
        height: result.height,
        mockupId: result.mockupId,
        category: result.category,
        url: result.url,
        filename: `snapview-${result.device.id}-${result.mockupId}-${Date.now()}.png`,
      });
    } catch {
      setError("Couldn't build the composited image. Try downloading again.");
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="mx-auto w-full max-w-[480px] px-4 py-10 sm:max-w-[640px] sm:px-6 sm:py-14 lg:max-w-[900px] lg:px-8 lg:py-16">
        {/* Hero */}
        <header className="mb-8 text-center sm:mb-10">
          <div className="mx-auto mb-4 inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#7C6EF7] to-[#5B4DD6] shadow-[0_10px_30px_-10px_rgba(124,110,247,0.7)]">
            <span className="text-lg font-bold text-white">S</span>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl lg:text-4xl">
            SnapView
          </h1>
          <p className="mt-2 text-sm text-muted-foreground sm:text-base">
            See your site on any screen.
          </p>
        </header>

        {/* URL input */}
        <section className="mb-5 sm:mb-6">
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
            onChange={(e) => {
              setUrl(e.target.value);
              if (stage !== "idle") resetPreview();
            }}
            onBlur={() => setTouched(true)}
            className="h-12 w-full rounded-xl border border-white/10 bg-card px-4 font-mono text-sm text-foreground placeholder:text-muted-foreground/60 focus:border-[#7C6EF7] focus:outline-none focus:ring-2 focus:ring-[#7C6EF7]/30 sm:h-[52px] sm:text-[15px] lg:h-14 lg:text-base"
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
                className={`h-10 flex-1 rounded-lg px-3 text-[13px] font-medium capitalize transition-colors sm:h-11 sm:text-sm ${
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
          <div className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0">
            {DEVICES[category].map((d) => {
              const active = d.id === deviceId;
              return (
                <button
                  key={d.id}
                  onClick={() => {
                    setDeviceId(d.id);
                    resetPreview();
                  }}
                  className={`min-w-[130px] snap-start rounded-2xl border p-3 text-left transition-all sm:min-w-0 sm:p-4 lg:p-[18px] ${
                    active
                      ? "border-[#7C6EF7] bg-[#7C6EF7]/10"
                      : "border-white/10 bg-card hover:border-white/20"
                  }`}
                >
                  <div className="text-xs font-medium sm:text-[13px] lg:text-sm">
                    {d.label}
                  </div>
                  <div className="mt-1 font-mono text-[11px] text-muted-foreground sm:text-xs">
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
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            {MOCKUPS[category].map((m) => {
              const active = m.id === mockupId;
              return (
                <button
                  key={m.id}
                  onClick={() => {
                    setMockupId(m.id);
                    resetPreview();
                  }}
                  className={`rounded-2xl border p-2.5 transition-all sm:p-3 ${
                    active
                      ? "border-[#7C6EF7] bg-[#7C6EF7]/10"
                      : "border-white/10 bg-card hover:border-white/20"
                  }`}
                >
                  <MockupThumb styleId={m.id} category={category} />
                  <div className="mt-2 text-center text-[13px] font-medium sm:text-sm">
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

        {/* Primary CTA */}
        {stage === "idle" && (
          <button
            onClick={handleLoadPreview}
            disabled={!urlValid}
            className="h-[52px] w-full rounded-xl bg-gradient-to-b from-[#8B7DFF] to-[#6A5BE5] py-4 text-[15px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(124,110,247,0.7)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:h-14 sm:text-base lg:mx-auto lg:max-w-[480px] lg:block"
          >
            Load Preview
          </button>
        )}

        {/* Preview area (live iframe, capturing, or result) */}
        {stage !== "idle" && (
          <section className="mt-8 sm:mt-10">
            <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {stage === "captured" ? "Captured" : "Live Preview"}
            </h2>

            <div className="mx-auto w-full max-w-full sm:max-w-[500px] lg:max-w-[600px]">
              <div ref={previewBoxRef} className="w-full">
                {stage === "previewing" || stage === "capturing" ? (
                  <MockupFrame
                    style={mockupId}
                    category={category}
                    url={url}
                    width={device.width}
                    height={device.height}
                    overlay
                  >
                    {iframeError ? (
                      <IframeBlocked
                        onDirect={handleDirectCapture}
                        capturing={stage === "capturing"}
                      />
                    ) : (
                      <div
                        style={{
                          width: device.width,
                          height: device.height,
                          transform: `scale(${scale})`,
                          transformOrigin: "top left",
                        }}
                      >
                        <iframe
                          ref={iframeRef}
                          src={url}
                          title="Site preview"
                          sandbox="allow-scripts allow-same-origin allow-forms"
                          onError={() => setIframeError(true)}
                          style={{
                            width: device.width,
                            height: device.height,
                            border: "none",
                            display: "block",
                            background: "#111114",
                          }}
                        />
                      </div>
                    )}
                  </MockupFrame>
                ) : result ? (
                  <MockupFrame
                    style={result.mockupId}
                    category={result.category}
                    url={result.url}
                    width={result.width}
                    height={result.height}
                  >
                    <img
                      src={result.src}
                      alt="Captured screenshot"
                      className="h-full w-full object-cover object-top"
                    />
                  </MockupFrame>
                ) : null}
              </div>

              {/* Action buttons */}
              {(stage === "previewing" || stage === "capturing") && !iframeError && (
                <div className="mt-5 lg:mx-auto lg:max-w-[480px]">
                  <button
                    onClick={handleCaptureThisView}
                    disabled={stage === "capturing"}
                    className="h-12 w-full rounded-xl bg-gradient-to-b from-[#8B7DFF] to-[#6A5BE5] text-[15px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(124,110,247,0.7)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:h-14 sm:text-base"
                  >
                    {stage === "capturing" ? "Capturing…" : "Capture This View"}
                  </button>
                  <p className="mt-2 text-center text-xs text-muted-foreground">
                    Scroll inside the frame to position the shot. Sites that block
                    embedding will need direct capture.
                  </p>
                </div>
              )}

              {stage === "captured" && result && (
                <div className="mt-5 flex flex-col gap-3 sm:flex-row lg:mx-auto lg:max-w-[480px]">
                  <button
                    onClick={handleDownload}
                    className="h-12 flex-1 rounded-xl bg-[#7C6EF7] text-sm font-semibold text-white hover:brightness-110"
                  >
                    Download PNG
                  </button>
                  <button
                    onClick={resetPreview}
                    className="h-12 flex-1 rounded-xl border border-white/10 bg-card text-sm font-semibold text-foreground hover:border-white/20"
                  >
                    Start Over
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        <footer className="mt-16 text-center text-xs text-muted-foreground">
          Screenshots are captured on your backend and discarded. V2.
        </footer>
      </main>
    </div>
  );
}

function IframeBlocked({
  onDirect,
  capturing,
}: {
  onDirect: () => void;
  capturing: boolean;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-[#111114] p-6 text-center">
      <p className="text-sm text-foreground">
        This site doesn't allow previewing in frames.
      </p>
      <p className="text-xs text-muted-foreground">
        You can still capture it directly from the top.
      </p>
      <button
        onClick={onDirect}
        disabled={capturing}
        className="mt-1 rounded-lg bg-[#7C6EF7] px-4 py-2 text-sm font-semibold text-white hover:brightness-110 disabled:opacity-50"
      >
        {capturing ? "Capturing…" : "Capture Without Preview"}
      </button>
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
  return (
    <div
      className="mx-auto w-2/3 rounded-[10px] bg-[#0f0f12] p-1 ring-1 ring-white/10"
      style={{ aspectRatio: aspect }}
    >
      <div className="h-full w-full rounded-md bg-white/5" />
    </div>
  );
}
