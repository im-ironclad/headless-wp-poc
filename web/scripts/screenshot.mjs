/**
 * Full-page screenshots of the running site, for reviewing the design:
 * every path × desktop/mobile × light/dark. Not a test suite: it only captures images.
 *
 *   yarn screenshot                     # http://localhost:3000, paths / and /about
 *   yarn screenshot --out shots / /about/team
 */
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const args = process.argv.slice(2);
const outIndex = args.indexOf("--out");
const out = outIndex >= 0 ? args.splice(outIndex, 2)[1] : "screenshots";
const paths = args.length ? args : ["/", "/about"];
const base = process.env.BASE_URL ?? "http://localhost:3000";

const viewports = { desktop: { width: 1440, height: 900 }, mobile: { width: 390, height: 844 } };

await mkdir(out, { recursive: true });
const browser = await chromium.launch();
for (const colorScheme of ["light", "dark"]) {
  for (const [device, viewport] of Object.entries(viewports)) {
    const page = await browser.newPage({ viewport, colorScheme, deviceScaleFactor: 1 });
    for (const path of paths) {
      await page.goto(base + path, { waitUntil: "networkidle" });
      // Scroll through the page so scroll-triggered reveals play, then return to the top.
      const height = await page.evaluate(() => document.body.scrollHeight);
      for (let y = 0; y < height; y += viewport.height / 2) {
        await page.evaluate((top) => window.scrollTo(0, top), y);
        await page.waitForTimeout(150);
      }
      await page.evaluate(() => window.scrollTo(0, 0));
      await page.waitForTimeout(800);
      const name = `${path === "/" ? "home" : path.slice(1).replaceAll("/", "-")}-${device}-${colorScheme}.png`;
      await page.screenshot({ path: `${out}/${name}`, fullPage: true });
      console.log(`${out}/${name}`);
    }
    await page.close();
  }
}
await browser.close();
