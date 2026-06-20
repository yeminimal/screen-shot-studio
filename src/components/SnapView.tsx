import { useEffect, useMemo, useRef, useState } from "react";
import { ALL_DEVICES, type DeviceConfig } from "@/lib/devices";
import { captureScreenshot, SnapViewError } from "@/lib/api";
import { MockupFrame } from "@/components/mockups/MockupFrame";
import { DeviceDropdown } from "@/components/DeviceDropdown";
import { compositeAndDownload } from "@/lib/canvasComposite";

type Stage = "idle" | "previewing" | "capturing" | "captured";

function isValidUrl(value: string) {
  return /^https?:\/\/\S+\.\S+/i.test(value.trim());
}

export function SnapView() {
  const [url, setUrl] = useState("");
  const [touched, setTouched] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<DeviceConfig>(
    ALL_DEVICES[0],
  );

  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{
    src: string;
    width: number;
    height: number;
    device: DeviceConfig;
    url: string;
  } | null>(null);

  const [iframeError, setIframeError] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement | null>(null);
  const previewBoxRef = useRef<HTMLDivElement | null>(null);

  const [containerWidth, setContainerWidth] = useState(360);

  const device = selectedDevice;

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

  function resetPreview() {
    setStage("idle");
    setResult(null);
    setError(null);
    setIframeError(false);
  }

  function handleSelectDevice(d: DeviceConfig) {
    setSelectedDevice(d);
    resetPreview();
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
      scrollY = 0;
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
        mockupId: result.device.mockup,
        category: result.device.category,
        url: result.url,
        filename: `snapview-${result.device.id}-${result.device.mockup}-${Date.now()}.png`,
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

        {/* Device dropdown */}
        <section className="mb-6">
          <h2 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Device
          </h2>
          <DeviceDropdown value={selectedDevice} onChange={handleSelectDevice} />
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
            className="block h-[52px] w-full rounded-xl bg-gradient-to-b from-[#8B7DFF] to-[#6A5BE5] py-4 text-[15px] font-semibold text-white shadow-[0_10px_30px_-10px_rgba(124,110,247,0.7)] transition-all hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:h-14 sm:text-base lg:mx-auto lg:max-w-[480px]"
          >
            Load Preview
          </button>
        )}

        {/* Preview area */}
        {stage !== "idle" && (
          <section className="mt-8 sm:mt-10">
            <h2 className="mb-4 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {stage === "captured" ? "Captured" : "Live Preview"}
            </h2>

            <div className="mx-auto w-full max-w-full sm:max-w-[500px] lg:max-w-[600px]">
              <div ref={previewBoxRef} className="w-full">
                {stage === "previewing" || stage === "capturing" ? (
                  <MockupFrame
                    style={device.mockup}
                    category={device.category}
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
                    style={result.device.mockup}
                    category={result.device.category}
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
          Screenshots are captured on your backend and discarded. V3.
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
