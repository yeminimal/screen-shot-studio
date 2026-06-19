import type { DeviceConfig } from "./devices";

const API_URL =
  (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:3001";

export type ScreenshotResponse = {
  image: string; // base64 PNG (no data: prefix)
  width: number;
  height: number;
};

export class SnapViewError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SnapViewError";
  }
}

export async function captureScreenshot(
  url: string,
  device: DeviceConfig,
  scrollY: number = 0,
): Promise<ScreenshotResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/screenshot`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, device, scrollY }),
    });
  } catch {
    throw new SnapViewError(
      "Couldn't reach the screenshot service. Check your connection or backend URL.",
    );
  }

  if (res.status === 408 || res.status === 504) {
    throw new SnapViewError(
      "This site took too long to load. Try again or check the URL.",
    );
  }
  if (res.status === 429) {
    throw new SnapViewError("You've hit the limit. Try again in a moment.");
  }
  if (!res.ok) {
    throw new SnapViewError(
      "We couldn't capture this site. It may be behind a login or load too slowly.",
    );
  }

  const data = (await res.json()) as ScreenshotResponse;
  if (!data?.image) {
    throw new SnapViewError("The screenshot service returned an empty response.");
  }
  return data;
}
