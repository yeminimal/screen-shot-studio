export type DeviceCategory = "mobile" | "tablet" | "desktop";

export type DeviceConfig = {
  id: string;
  label: string;
  width: number;
  height: number;
  deviceScaleFactor: number;
  userAgent: string;
};

export type MockupStyle = {
  id: string;
  label: string;
};

export const DEVICES: Record<DeviceCategory, DeviceConfig[]> = {
  mobile: [
    {
      id: "iphone-14",
      label: "iPhone 14",
      width: 390,
      height: 844,
      deviceScaleFactor: 3,
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
    },
    {
      id: "galaxy-s23",
      label: "Samsung Galaxy S23",
      width: 360,
      height: 780,
      deviceScaleFactor: 3,
      userAgent:
        "Mozilla/5.0 (Linux; Android 13; SM-S911B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36",
    },
    {
      id: "iphone-se",
      label: "iPhone SE",
      width: 375,
      height: 667,
      deviceScaleFactor: 2,
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
    },
  ],
  tablet: [
    {
      id: "ipad-air",
      label: "iPad Air",
      width: 820,
      height: 1180,
      deviceScaleFactor: 2,
      userAgent:
        "Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
    },
    {
      id: "galaxy-tab-s8",
      label: "Samsung Tab S8",
      width: 800,
      height: 1280,
      deviceScaleFactor: 2,
      userAgent:
        "Mozilla/5.0 (Linux; Android 13; SM-X700) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
    },
    {
      id: "ipad-mini",
      label: "iPad Mini",
      width: 768,
      height: 1024,
      deviceScaleFactor: 2,
      userAgent:
        "Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1",
    },
  ],
  desktop: [
    {
      id: "macbook-air-13",
      label: 'MacBook Air 13"',
      width: 1280,
      height: 800,
      deviceScaleFactor: 2,
      userAgent:
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
    },
    {
      id: "full-hd",
      label: "Full HD",
      width: 1920,
      height: 1080,
      deviceScaleFactor: 1,
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
    },
    {
      id: "small-laptop",
      label: "Small Laptop",
      width: 1366,
      height: 768,
      deviceScaleFactor: 1,
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
    },
  ],
};

export const MOCKUPS: Record<DeviceCategory, MockupStyle[]> = {
  mobile: [
    { id: "clay", label: "Clay" },
    { id: "device", label: "Device" },
    { id: "browser", label: "Browser" },
  ],
  tablet: [
    { id: "clay", label: "Clay" },
    { id: "device", label: "Device" },
    { id: "browser", label: "Browser" },
  ],
  desktop: [
    { id: "clay", label: "Clay" },
    { id: "browser", label: "Browser" },
    { id: "macbook", label: "MacBook" },
  ],
};
