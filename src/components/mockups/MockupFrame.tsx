import type { DeviceCategory } from "@/lib/devices";

type Props = {
  style: string;
  category: DeviceCategory;
  url: string;
  width: number;
  height: number;
  children: React.ReactNode; // the <img> or loading placeholder
};

/**
 * MockupFrame: dispatches to a CSS/SVG frame based on style + category.
 * `children` is the screenshot (or loading skeleton) that fills the screen area.
 */
export function MockupFrame({ style, category, url, width, height, children }: Props) {
  const aspect = `${width} / ${height}`;

  if (style === "clay") return <ClayFrame aspect={aspect}>{children}</ClayFrame>;
  if (style === "browser")
    return (
      <BrowserFrame aspect={aspect} url={url} category={category}>
        {children}
      </BrowserFrame>
    );
  if (style === "macbook")
    return <MacBookFrame aspect={aspect}>{children}</MacBookFrame>;
  // device
  return (
    <DeviceFrame aspect={aspect} category={category}>
      {children}
    </DeviceFrame>
  );
}

function ClayFrame({
  aspect,
  children,
}: {
  aspect: string;
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative w-full overflow-hidden rounded-2xl bg-card shadow-[0_30px_80px_-20px_rgba(124,110,247,0.35)] ring-1 ring-white/10"
      style={{ aspectRatio: aspect }}
    >
      {children}
    </div>
  );
}

function DeviceFrame({
  aspect,
  category,
  children,
}: {
  aspect: string;
  category: DeviceCategory;
  children: React.ReactNode;
}) {
  // Phone / tablet outline with bezel + notch dot
  const bezel = category === "tablet" ? "p-3" : "p-2";
  const radius = category === "tablet" ? "rounded-[28px]" : "rounded-[36px]";
  const inner = category === "tablet" ? "rounded-[18px]" : "rounded-[26px]";
  return (
    <div
      className={`relative w-full ${radius} ${bezel} bg-[#0a0a0c] ring-1 ring-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]`}
    >
      <div className="absolute left-1/2 top-1.5 z-10 h-1.5 w-16 -translate-x-1/2 rounded-full bg-white/10" />
      <div
        className={`relative w-full overflow-hidden ${inner} bg-black`}
        style={{ aspectRatio: aspect }}
      >
        {children}
      </div>
    </div>
  );
}

function BrowserFrame({
  aspect,
  url,
  category,
  children,
}: {
  aspect: string;
  url: string;
  category: DeviceCategory;
  children: React.ReactNode;
}) {
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
        {children}
      </div>
    </div>
  );
}

function MacBookFrame({
  aspect,
  children,
}: {
  aspect: string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-full">
      <div className="relative w-full rounded-t-xl border border-b-0 border-white/10 bg-[#0a0a0c] p-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.7)]">
        <div className="absolute left-1/2 top-1 z-10 h-1 w-1 -translate-x-1/2 rounded-full bg-white/30" />
        <div
          className="relative w-full overflow-hidden rounded-md bg-black"
          style={{ aspectRatio: aspect }}
        >
          {children}
        </div>
      </div>
      {/* Hinge / base */}
      <div className="relative mx-auto h-3 w-[108%] -translate-x-[3.7%] rounded-b-2xl bg-gradient-to-b from-[#2a2a31] to-[#16161b] ring-1 ring-white/5">
        <div className="absolute left-1/2 top-0 h-1 w-20 -translate-x-1/2 rounded-b-md bg-black/50" />
      </div>
    </div>
  );
}
