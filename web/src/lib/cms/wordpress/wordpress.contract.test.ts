import { describe, expect, it } from "vitest";
import { getAllPagePaths, getGlobals, getPage, getPreviewPage } from ".";

// Assumes the seed content from wordpress/seed.php. Re-run ./wordpress/setup.sh to reset it.
describe("WordPress contract", () => {
  it("serves the seeded Home page with every Block Type, in order", async () => {
    const page = await getPage("/");

    expect(page).toMatchObject({ title: "Home", path: "/" });
    expect(page?.blocks.map((block) => block.type)).toEqual([
      "hero",
      "richText",
      "featureGrid",
      "mediaText",
      "ctaBanner",
    ]);
  });

  it("serves About with its own Blocks and order", async () => {
    const page = await getPage("/about");

    expect(page?.blocks.map((block) => block.type)).toEqual(["mediaText", "ctaBanner"]);
  });

  it("returns null for a path with no Page", async () => {
    expect(await getPage("/does-not-exist")).toBeNull();
  });

  it("lists every published Page path for static generation", async () => {
    expect(await getAllPagePaths()).toEqual(expect.arrayContaining(["/", "/about"]));
  });

  it("serves Globals: Primary Menu and Site Settings", async () => {
    const globals = await getGlobals();

    expect(globals.primaryMenu.map((item) => [item.label, item.href])).toEqual([
      ["Home", "/"],
      ["About", "/about"],
    ]);
    expect(globals.siteSettings.footerColumns.map((column) => column.heading)).toEqual(["Site", "Resources"]);
    expect(globals.siteSettings.copyright).toMatch(/^© \d{4} /);
  });

  it("serves Draft Preview when authenticated with the Application Password", async () => {
    const home = await getPage("/");
    const preview = await getPreviewPage(Number(home?.id));

    expect(preview?.title).toBe("Home");
  });
});
