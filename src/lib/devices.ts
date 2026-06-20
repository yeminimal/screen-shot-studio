export type DeviceCategory = "mobile" | "tablet" | "desktop";

export type MockupStyleId = "clay" | "device" | "browser" | "macbook";

export type DeviceConfig = {
  id: string;
  label: string;
  category: DeviceCategory;
  width: number;
  height: number;
  deviceScaleFactor: number;
  /** Which MockupFrame style to render for this device. */
  mockup: MockupStyleId;
  userAgent: string;
};

const UA = {
  iphone18:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
  iphone17:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  iphone16:
    "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
  android14:
    "Mozilla/5.0 (Linux; Android 14) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
  android13:
    "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Mobile Safari/537.36",
  ipad17:
    "Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
  ipad16:
    "Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1",
  androidTablet:
    "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/112.0.0.0 Safari/537.36",
  mac:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  win:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
};

export const ALL_DEVICES: DeviceConfig[] = [
  // Phones
  { id: "iphone-17-pro-max", label: "iPhone 17 Pro Max", category: "mobile", width: 430, height: 932, deviceScaleFactor: 3, mockup: "device", userAgent: UA.iphone18 },
  { id: "iphone-17-pro", label: "iPhone 17 Pro", category: "mobile", width: 393, height: 852, deviceScaleFactor: 3, mockup: "device", userAgent: UA.iphone18 },
  { id: "iphone-16", label: "iPhone 16", category: "mobile", width: 390, height: 844, deviceScaleFactor: 3, mockup: "device", userAgent: UA.iphone17 },
  { id: "iphone-14", label: "iPhone 14", category: "mobile", width: 390, height: 844, deviceScaleFactor: 3, mockup: "device", userAgent: UA.iphone16 },
  { id: "iphone-se-3", label: "iPhone SE (3rd Gen)", category: "mobile", width: 375, height: 667, deviceScaleFactor: 2, mockup: "device", userAgent: UA.iphone16 },
  { id: "samsung-s24-ultra", label: "Samsung Galaxy S24 Ultra", category: "mobile", width: 412, height: 915, deviceScaleFactor: 3.5, mockup: "device", userAgent: UA.android14 },
  { id: "samsung-s23", label: "Samsung Galaxy S23", category: "mobile", width: 360, height: 780, deviceScaleFactor: 3, mockup: "device", userAgent: UA.android13 },
  { id: "pixel-8-pro", label: "Google Pixel 8 Pro", category: "mobile", width: 412, height: 915, deviceScaleFactor: 3.5, mockup: "device", userAgent: UA.android14 },
  { id: "pixel-7", label: "Google Pixel 7", category: "mobile", width: 412, height: 892, deviceScaleFactor: 2.625, mockup: "device", userAgent: UA.android13 },
  { id: "oneplus-12", label: "OnePlus 12", category: "mobile", width: 412, height: 919, deviceScaleFactor: 3, mockup: "device", userAgent: UA.android14 },

  // Tablets
  { id: "ipad-pro-13", label: 'iPad Pro 13"', category: "tablet", width: 1024, height: 1366, deviceScaleFactor: 2, mockup: "device", userAgent: UA.ipad17 },
  { id: "ipad-pro-11", label: 'iPad Pro 11"', category: "tablet", width: 834, height: 1194, deviceScaleFactor: 2, mockup: "device", userAgent: UA.ipad17 },
  { id: "ipad-air-m2", label: "iPad Air M2", category: "tablet", width: 820, height: 1180, deviceScaleFactor: 2, mockup: "device", userAgent: UA.ipad17 },
  { id: "ipad-mini-6", label: "iPad Mini 6", category: "tablet", width: 744, height: 1133, deviceScaleFactor: 2, mockup: "device", userAgent: UA.ipad16 },
  { id: "samsung-tab-s9-ultra", label: "Samsung Galaxy Tab S9 Ultra", category: "tablet", width: 1848, height: 2960, deviceScaleFactor: 2, mockup: "device", userAgent: UA.androidTablet },
  { id: "samsung-tab-s9", label: "Samsung Galaxy Tab S9", category: "tablet", width: 800, height: 1280, deviceScaleFactor: 2, mockup: "device", userAgent: UA.androidTablet },
  { id: "samsung-tab-s8", label: "Samsung Galaxy Tab S8", category: "tablet", width: 800, height: 1280, deviceScaleFactor: 2, mockup: "device", userAgent: UA.androidTablet },
  { id: "pixel-tablet", label: "Google Pixel Tablet", category: "tablet", width: 834, height: 1194, deviceScaleFactor: 2, mockup: "device", userAgent: UA.androidTablet },

  // Laptops & Desktops
  { id: "macbook-pro-16", label: 'MacBook Pro 16"', category: "desktop", width: 1728, height: 1117, deviceScaleFactor: 2, mockup: "macbook", userAgent: UA.mac },
  { id: "macbook-pro-14", label: 'MacBook Pro 14"', category: "desktop", width: 1512, height: 982, deviceScaleFactor: 2, mockup: "macbook", userAgent: UA.mac },
  { id: "macbook-air-m3", label: 'MacBook Air M3 15"', category: "desktop", width: 1440, height: 900, deviceScaleFactor: 2, mockup: "macbook", userAgent: UA.mac },
  { id: "macbook-air-m1", label: 'MacBook Air M1 13"', category: "desktop", width: 1280, height: 800, deviceScaleFactor: 2, mockup: "macbook", userAgent: UA.mac },
  { id: "surface-pro-9", label: "Microsoft Surface Pro 9", category: "desktop", width: 1440, height: 960, deviceScaleFactor: 2, mockup: "browser", userAgent: UA.win },
  { id: "surface-laptop-5", label: "Microsoft Surface Laptop 5", category: "desktop", width: 1504, height: 1000, deviceScaleFactor: 2, mockup: "browser", userAgent: UA.win },
  { id: "full-hd", label: "Full HD Monitor (1080p)", category: "desktop", width: 1920, height: 1080, deviceScaleFactor: 1, mockup: "browser", userAgent: UA.win },
  { id: "4k-monitor", label: "4K Monitor (2160p)", category: "desktop", width: 3840, height: 2160, deviceScaleFactor: 2, mockup: "browser", userAgent: UA.win },
  { id: "small-laptop", label: "Small Laptop (1366p)", category: "desktop", width: 1366, height: 768, deviceScaleFactor: 1, mockup: "browser", userAgent: UA.win },
];

export type DeviceGroup = {
  label: string;
  category: DeviceCategory;
  devices: DeviceConfig[];
};

export const DEVICE_GROUPS: DeviceGroup[] = [
  { label: "Phones", category: "mobile", devices: ALL_DEVICES.filter((d) => d.category === "mobile") },
  { label: "Tablets", category: "tablet", devices: ALL_DEVICES.filter((d) => d.category === "tablet") },
  { label: "Laptops & Desktops", category: "desktop", devices: ALL_DEVICES.filter((d) => d.category === "desktop") },
];
