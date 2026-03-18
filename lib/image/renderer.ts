import { chromium, type Browser } from "playwright-core";
import path from "path";
import { saveImage, getImagePath } from "./storage";

let browserInstance: Browser | null = null;

async function getBrowser(): Promise<Browser> {
  if (browserInstance && browserInstance.isConnected()) {
    return browserInstance;
  }
  browserInstance = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  return browserInstance;
}

const CARD_WIDTH = 1200;
const CARD_HEIGHT = 630;

export async function renderCard(
  address: string,
  variant: "summary" | "archetype",
  _baseUrl: string
): Promise<string> {
  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setViewportSize({ width: CARD_WIDTH, height: CARD_HEIGHT });

    // Always use internal HTTP URL — Playwright runs inside the container
    // and can't access the external HTTPS URL through nginx
    const internalBase = "http://localhost:3000";
    const url = `${internalBase}/card-render/${encodeURIComponent(address)}?variant=${variant}`;
    await page.goto(url, { waitUntil: "networkidle", timeout: 15_000 });

    const buffer = await page.screenshot({
      type: "png",
      clip: { x: 0, y: 0, width: CARD_WIDTH, height: CARD_HEIGHT },
    });

    const filePath = saveImage(address, variant, buffer);
    return filePath;
  } finally {
    await page.close();
  }
}

export async function renderBothCards(
  address: string,
  baseUrl: string
): Promise<{ summaryPath: string; archetypePath: string }> {
  const [summaryPath, archetypePath] = await Promise.all([
    renderCard(address, "summary", baseUrl),
    renderCard(address, "archetype", baseUrl),
  ]);
  return { summaryPath, archetypePath };
}

export async function closeBrowser(): Promise<void> {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
  }
}
