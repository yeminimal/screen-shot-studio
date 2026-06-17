/**
 * SnapView screenshot backend.
 * Single endpoint: POST /api/screenshot { url, device }
 * Returns: { image: base64Png, width, height }
 */
const express = require("express");
const cors = require("cors");
const puppeteer = require("puppeteer");

const PORT = process.env.PORT || 3001;
const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

const app = express();
app.use(express.json({ limit: "1mb" }));

// CORS: allow listed origins, or all if none configured (useful for local dev).
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || ALLOWED_ORIGINS.length === 0) return cb(null, true);
      if (ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
      return cb(new Error("Origin not allowed"));
    },
  }),
);

// --- Shared browser instance (cheaper than launching per request) ---
let browserPromise = null;
async function getBrowser() {
  if (browserPromise) {
    const b = await browserPromise;
    if (b.connected) return b;
  }
  browserPromise = puppeteer.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
  });
  const browser = await browserPromise;
  browser.on("disconnected", () => {
    browserPromise = null;
  });
  return browser;
}

// --- Health check (Railway uses this) ---
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// --- Screenshot endpoint ---
app.post("/api/screenshot", async (req, res) => {
  const { url, device } = req.body || {};

  // Validation
  if (typeof url !== "string" || !/^https?:\/\//i.test(url)) {
    return res.status(400).json({ error: "Invalid URL" });
  }
  if (
    !device ||
    typeof device.width !== "number" ||
    typeof device.height !== "number"
  ) {
    return res.status(400).json({ error: "Invalid device config" });
  }

  const width = Math.min(Math.max(device.width, 200), 2560);
  const height = Math.min(Math.max(device.height, 200), 2560);
  const deviceScaleFactor = Math.min(Math.max(device.deviceScaleFactor || 1, 1), 3);
  const userAgent = typeof device.userAgent === "string" ? device.userAgent : undefined;

  let page;
  try {
    const browser = await getBrowser();
    page = await browser.newPage();
    if (userAgent) await page.setUserAgent(userAgent);
    await page.setViewport({ width, height, deviceScaleFactor });

    await page.goto(url, { waitUntil: "networkidle2", timeout: 25_000 });

    const buffer = await page.screenshot({ type: "png", fullPage: false });
    const image = buffer.toString("base64");

    res.json({ image, width, height });
  } catch (err) {
    const msg = String(err && err.message);
    console.error("[screenshot] error:", msg);
    if (/timeout|Navigation timeout/i.test(msg)) {
      return res.status(504).json({ error: "Site took too long to load" });
    }
    if (/net::ERR_NAME_NOT_RESOLVED|ERR_INVALID_URL|ERR_ABORTED/i.test(msg)) {
      return res.status(400).json({ error: "Could not reach this URL" });
    }
    return res.status(500).json({ error: "Failed to capture screenshot" });
  } finally {
    if (page) await page.close().catch(() => {});
  }
});

app.listen(PORT, () => {
  console.log(`SnapView backend listening on :${PORT}`);
});
