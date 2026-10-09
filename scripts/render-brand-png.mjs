// Renders the raster brand assets (apple-touch-icon, 512px icon, Open Graph card)
// from the SVG marks with headless Chromium. Run after changing a mark:
//   node scripts/render-brand-png.mjs
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "@playwright/test";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const brand = (f) =>
  readFileSync(join(root, "packages/tokens/brand", f), "utf8");
const pub = (f) => join(root, "apps/docs/public", f);
const font = readFileSync(
  join(root, "packages/tokens/fonts/geist.woff2"),
).toString("base64");

const browser = await chromium.launch();
const page = await browser.newPage();

async function shot(html, width, height, file, transparent = true) {
  await page.setViewportSize({ width, height });
  await page.setContent(`<!doctype html><html><head><style>
    @font-face { font-family: Geist; src: url(data:font/woff2;base64,${font}) format("woff2"); font-weight: 100 900; }
    html, body { margin: 0; width: ${width}px; height: ${height}px; overflow: hidden; }
    svg { display: block; width: 100%; height: 100%; }
  </style></head><body>${html}</body></html>`);
  await page.screenshot({ path: file, omitBackground: transparent });
}

const darkIcon = brand("surface-one-dark-icon.svg");
await shot(darkIcon, 180, 180, pub("apple-touch-icon.png"));
await shot(darkIcon, 512, 512, pub("icon-512.png"));
await shot(
  `<div style="display:flex;align-items:center;gap:56px;width:1200px;height:630px;padding:0 96px;box-sizing:border-box;
     background:radial-gradient(circle at 20% 20%,#1d2440,#0c0f16 60%);color:#f4f6fb;font-family:Geist,sans-serif">
     <div style="width:260px;height:260px;flex:none">${brand("surface-one-dark-mark.svg")}</div>
     <div><div style="font-size:84px;font-weight:700;letter-spacing:-2px">SurfaceOne</div>
     <div style="margin-top:16px;font-size:34px;color:#aab3c5">Accessible Angular design system</div>
     <div style="margin-top:28px;font-size:26px;color:#7dd3fc">@surface-one/angular</div></div></div>`,
  1200,
  630,
  pub("og-image.png"),
  false,
);
await browser.close();
console.log("brand PNGs → apps/docs/public/");
