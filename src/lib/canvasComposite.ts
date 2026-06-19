import type { DeviceCategory } from "./devices";

export type Insets = { top: number; right: number; bottom: number; left: number };

export function getMockupInsets(
  mockupId: string,
  category: DeviceCategory,
): Insets {
  const defaults: Insets = { top: 0, bottom: 0, left: 0, right: 0 };
  if (mockupId === "clay") return defaults;
  if (mockupId === "device" && category === "mobile")
    return { top: 60, bottom: 40, left: 12, right: 12 };
  if (mockupId === "device" && category === "tablet")
    return { top: 30, bottom: 50, left: 20, right: 20 };
  if (mockupId === "browser") return { top: 44, bottom: 0, left: 0, right: 0 };
  if (mockupId === "macbook") return { top: 30, bottom: 60, left: 20, right: 20 };
  return defaults;
}

export function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

export function truncateUrl(url: string, maxLen: number) {
  try {
    const u = new URL(url);
    const full = u.hostname + u.pathname;
    return full.length > maxLen ? full.slice(0, maxLen) + "…" : full;
  } catch {
    return url.slice(0, maxLen);
  }
}

export function drawMockupFrame(
  ctx: CanvasRenderingContext2D,
  mockupId: string,
  w: number,
  h: number,
  padding: number,
) {
  const x = padding;
  const y = padding;
  ctx.save();
  ctx.fillStyle = "#1A1A1F";

  if (mockupId === "clay") {
    roundRect(ctx, x - 16, y - 16, w + 32, h + 32, 24);
    ctx.fill();
  } else if (mockupId === "device") {
    roundRect(ctx, x - 14, y - 60, w + 28, h + 100, 40);
    ctx.fill();
  } else if (mockupId === "browser") {
    roundRect(ctx, x, y - 44, w, h + 44, 12);
    ctx.fill();
  } else if (mockupId === "macbook") {
    roundRect(ctx, x - 20, y - 30, w + 40, h + 100, 12);
    ctx.fill();
  }
  ctx.restore();
}

export function drawMockupOverlay(
  ctx: CanvasRenderingContext2D,
  mockupId: string,
  w: number,
  h: number,
  padding: number,
  url: string,
) {
  const x = padding;
  const y = padding;
  ctx.save();

  if (mockupId === "device") {
    ctx.fillStyle = "#0F0F11";
    roundRect(ctx, x + w / 2 - 40, y - 58, 80, 28, 14);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    roundRect(ctx, x + w / 2 - 60, y + h + 14, 120, 5, 3);
    ctx.fill();
    ctx.strokeStyle = "rgba(255,255,255,0.1)";
    ctx.lineWidth = 1.5;
    roundRect(ctx, x - 14, y - 60, w + 28, h + 100, 40);
    ctx.stroke();
  }

  if (mockupId === "browser") {
    ctx.fillStyle = "#1E1E24";
    roundRect(ctx, x, y - 44, w, 44, 12);
    ctx.fill();
    const dotY = y - 44 + 22;
    const dotColors = ["#FF5F57", "#FFBD2E", "#28C840"];
    dotColors.forEach((color, i) => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x + 14 + i * 18, dotY, 5, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillStyle = "#0F0F11";
    roundRect(ctx, x + w / 2 - w * 0.2, y - 44 + 10, w * 0.4, 24, 12);
    ctx.fill();
    ctx.fillStyle = "rgba(240,240,244,0.6)";
    ctx.font = "12px ui-monospace, SFMono-Regular, Menlo, monospace";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(truncateUrl(url, 40), x + w / 2, y - 44 + 22);
  }

  if (mockupId === "macbook") {
    ctx.fillStyle = "#0F0F11";
    roundRect(ctx, x + w / 2 - 5, y - 30, 10, 6, 3);
    ctx.fill();
    ctx.fillStyle = "#1A1A1F";
    ctx.fillRect(x - 40, y + h + 20, w + 80, 24);
    ctx.fillStyle = "#111116";
    ctx.fillRect(x - 40, y + h + 18, w + 80, 3);
    ctx.strokeStyle = "#2A2A32";
    ctx.lineWidth = 3;
    roundRect(ctx, x - 20, y - 30, w + 40, h + 50, 12);
    ctx.stroke();
  }

  ctx.restore();
}

export async function compositeAndDownload(opts: {
  imageSrc: string;
  width: number;
  height: number;
  mockupId: string;
  category: DeviceCategory;
  url: string;
  filename: string;
}) {
  const { imageSrc, width, height, mockupId, category, url, filename } = opts;
  const SCALE = 2;
  const PADDING = 40;

  const frameW = width + PADDING * 2;
  const frameH = height + PADDING * 2;

  const canvas = document.createElement("canvas");
  canvas.width = frameW * SCALE;
  canvas.height = frameH * SCALE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  ctx.scale(SCALE, SCALE);

  ctx.fillStyle = "#0F0F11";
  ctx.fillRect(0, 0, frameW, frameH);

  drawMockupFrame(ctx, mockupId, width, height, PADDING);

  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = imageSrc;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to load screenshot"));
  });

  const insets = getMockupInsets(mockupId, category);
  ctx.drawImage(
    img,
    PADDING + insets.left,
    PADDING + insets.top,
    width - insets.left - insets.right,
    height - insets.top - insets.bottom,
  );

  drawMockupOverlay(ctx, mockupId, width, height, PADDING, url);

  await new Promise<void>((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) return resolve();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(link.href);
      resolve();
    }, "image/png");
  });
}
