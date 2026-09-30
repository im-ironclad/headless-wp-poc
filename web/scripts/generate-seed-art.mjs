/**
 * Renders the abstract brand artwork that wordpress/seed.php imports into the Media Library.
 * Run with `yarn seed-art` (needs Playwright's Chromium). The output is committed, so this
 * only needs re-running to change the artwork.
 */
import { mkdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";

const out = fileURLToPath(new URL("../../wordpress/assets/", import.meta.url));

// Brand palette: violet primary, with fuchsia, indigo and cyan as supporting colours.
const palette = ["#7c3aed", "#c026d3", "#4f46e5", "#06b6d4", "#a78bfa"];

/** Deterministic pseudo-random numbers, so each artwork is stable between runs. */
function random(seed) {
  let s = [...seed].reduce((acc, c) => acc * 31 + c.charCodeAt(0), 7) >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 2 ** 32);
}

function artwork(key, width, height, shape) {
  const r = random(key);
  const blobs = Array.from({ length: 5 }, (_, i) => {
    const size = (0.45 + r() * 0.5) * Math.max(width, height);
    return `<div style="position:absolute;left:${r() * width - size / 2}px;top:${r() * height - size / 2}px;width:${size}px;height:${size}px;border-radius:50%;background:${palette[(i + Math.floor(r() * 5)) % 5]};filter:blur(${size / 5}px);opacity:${0.55 + r() * 0.4}"></div>`;
  }).join("");
  const shapes = {
    rings: `<svg viewBox="0 0 100 100" style="position:absolute;inset:0;width:100%;height:100%" preserveAspectRatio="xMidYMid slice">${[14, 24, 34, 44].map((rad) => `<circle cx="62" cy="48" r="${rad}" fill="none" stroke="white" stroke-opacity="0.18" stroke-width="0.25"/>`).join("")}</svg>`,
    grid: `<div style="position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.09) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.09) 1px,transparent 1px);background-size:48px 48px;mask-image:radial-gradient(ellipse at center,black 30%,transparent 75%)"></div>`,
    orb: `<div style="position:absolute;left:50%;top:50%;width:38%;aspect-ratio:1;transform:translate(-50%,-50%);border-radius:50%;background:radial-gradient(circle at 35% 30%,rgba(255,255,255,.85),rgba(255,255,255,.08) 45%,transparent 70%);box-shadow:0 0 120px rgba(167,139,250,.6)"></div>`,
    stack: `<div style="position:absolute;inset:0;display:grid;place-items:center">${[0, 1, 2].map((i) => `<div style="position:absolute;width:42%;height:30%;border-radius:24px;border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.06);backdrop-filter:blur(8px);transform:translate(${(i - 1) * 8}%,${(i - 1) * -14}%) rotate(-8deg)"></div>`).join("")}</div>`,
    bolt: `<svg viewBox="0 0 100 100" style="position:absolute;inset:0;width:100%;height:100%" preserveAspectRatio="xMidYMid meet"><path d="M56 12 30 56h18l-6 32 28-46H52z" fill="rgba(255,255,255,.14)" stroke="rgba(255,255,255,.55)" stroke-width="0.6" stroke-linejoin="round"/></svg>`,
    waves: `<svg viewBox="0 0 100 60" style="position:absolute;inset:0;width:100%;height:100%" preserveAspectRatio="none">${[0, 1, 2, 3, 4, 5].map((i) => `<path d="M0 ${20 + i * 5} C 25 ${8 + i * 5}, 50 ${34 + i * 5}, 100 ${16 + i * 5}" fill="none" stroke="white" stroke-opacity="${0.08 + i * 0.03}" stroke-width="0.3"/>`).join("")}</svg>`,
  };
  const grain = `<svg style="position:absolute;inset:0;width:100%;height:100%;opacity:.18;mix-blend-mode:overlay"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`;
  return `<body style="margin:0"><div style="position:relative;width:${width}px;height:${height}px;overflow:hidden;background:#0b0816">${blobs}${shapes[shape]}${grain}</div></body>`;
}

/** The logo mark: a glowing "L" in a rounded square. Transparent corners, so it works in both themes. */
const logo = `<body style="margin:0;background:transparent"><div style="width:256px;height:256px;border-radius:64px;background:linear-gradient(135deg,#7c3aed,#c026d3 60%,#06b6d4);display:grid;place-items:center;box-shadow:inset 0 2px 0 rgba(255,255,255,.35)">
  <svg width="140" height="140" viewBox="0 0 100 100"><path d="M30 18v64h44" fill="none" stroke="white" stroke-width="14" stroke-linecap="round" stroke-linejoin="round"/><circle cx="70" cy="30" r="9" fill="white"/></svg></div></body>`;

const images = [
  ["hero", 1600, 1000, "orb"],
  ["feature-flexible", 800, 600, "stack"],
  ["feature-structured", 800, 600, "grid"],
  ["feature-fast", 800, 600, "bolt"],
  ["media-text", 1200, 900, "rings"],
  ["about", 1200, 900, "waves"],
];

await mkdir(out, { recursive: true });
const browser = await chromium.launch();
for (const [key, width, height, shape] of images) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.setContent(artwork(key, width, height, shape));
  await page.screenshot({ path: `${out}${key}.jpg`, type: "jpeg", quality: 85 });
  await page.close();
  console.log(`wordpress/assets/${key}.jpg`);
}
const page = await browser.newPage({ viewport: { width: 256, height: 256 } });
await page.setContent(logo);
await page.screenshot({ path: `${out}logo.png`, omitBackground: true });
console.log("wordpress/assets/logo.png");
await browser.close();
