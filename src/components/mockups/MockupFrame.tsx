import type { DeviceCategory } from "@/lib/devices";

// Note: when `overlay` is true, the screen area uses `overflow-hidden` so a
// transform-scaled iframe sits flush; the iframe handles its own internal
// scrolling.


type Props = {
  style: string;
  category: DeviceCategory;
  url: string;
  width: number;
  height: number;
  children: React.ReactNode;
  /**
   * If true, the screenshot/iframe is rendered as the base layer and the
   * mockup chrome is overlaid with pointer-events: none. Required for the
   * scrollable iframe preview stage.
   */
  overlay?: boolean;
};

export function MockupFrame({
  style,
  category,
  url,
  width,
  height,
  children,
  overlay = false,
}: Props) {
  const aspect = `${width} / ${height}`;
  const common = { aspect, overlay, children };

  if (style === "clay") return <ClayFrame {...common} />;
  if (style === "browser")
    return <BrowserFrame {...common} url={url} category={category} />;
  if (style === "macbook") return <MacBookFrame {...common} />;
  return <DeviceFrame {...common} category={category} />;
}

type FrameProps = {
  aspect: string;
  overlay: boolean;
  children: React.ReactNode;
};

function ClayFrame({ aspect, overlay, children }: FrameProps) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl bg-card shadow-[0_30px_80px_-20px_rgba(124,110,247,0.35)] ring-1 ring-white/10"
      style={{ aspectRatio: aspect }}
    >
      {overlay ? (
        <div className="absolute inset-0 overflow-auto">{children}</div>
      ) : (
        children
      )}
    </div>
  );
}

function DeviceFrame({
  aspect,
  category,
  overlay,
  children,
}: FrameProps & { category: DeviceCategory }) {
  const bezel = category === "tablet" ? "p-3" : "p-2";
  const radius = category === "tablet" ? "rounded-[28px]" : "rounded-[36px]";
  const inner = category === "tablet" ? "rounded-[18px]" : "rounded-[26px]";
  return (
    <div
      className={`relative w-full ${radius} ${bezel} bg-[#0a0a0c] ring-1 ring-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]`}
    >
      <div className="pointer-events-none absolute left-1/2 top-1.5 z-10 h-1.5 w-16 -translate-x-1/2 rounded-full bg-white/10" />
      <div
        className={`relative w-full overflow-hidden ${inner} bg-black`}
        style={{ aspectRatio: aspect }}
      >
        {overlay ? (
          <div className="absolute inset-0 overflow-auto">{children}</div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function BrowserFrame({
  aspect,
  url,
  category,
  overlay,
  children,
}: FrameProps & { url: string; category: DeviceCategory }) {
  const showDots = category !== "mobile";
  return (
    <div className="w-full overflow-hidden rounded-2xl bg-[#16161b] ring-1 ring-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.6)]">
      <div className="flex items-center gap-2 border-b border-white/5 bg-[#1f1f25] px-3 py-2">
        {showDots && (
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
          </div>
        )}
        <div className="ml-1 flex-1 truncate rounded-md bg-black/40 px-2.5 py-1 font-mono text-[11px] text-muted-foreground">
          {url || "about:blank"}
        </div>
      </div>
      <div className="relative w-full bg-black" style={{ aspectRatio: aspect }}>
        {overlay ? (
          <div className="absolute inset-0 overflow-auto">{children}</div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}

function MacBookFrame({ aspect, overlay, children }: FrameProps) {
  return (
    <div className="w-full">
      <div className="relative w-full rounded-t-xl border border-b-0 border-white/10 bg-[#0a0a0c] p-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
        <div className="pointer-events-none absolute left-1/2 top-1 z-10 h-1 w-1 -translate-x-1/2 rounded-full bg-white/30" />
        <div
          className="relative w-full overflow-hidden rounded-md bg-black"
          style={{ aspectRatio: aspect }}
        >
          {overlay ? (
            <div className="absolute inset-0 overflow-auto">{children}</div>
          ) : (
            children
          )}
        </div>
      </div>
      <div className="relative mx-auto h-3 w-[108%] -translate-x-[3.7%] rounded-b-2xl bg-gradient-to-b from-[#2a2a31] to-[#16161b] ring-1 ring-white/5">
        <div className="absolute left-1/2 top-0 h-1 w-20 -translate-x-1/2 rounded-b-md bg-black/50" />
      </div>
    </div>
  );
}
