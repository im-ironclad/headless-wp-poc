import { describe, expect, it } from "vitest";
import { getAllPagePaths, getGlobals, getPage, getPreviewPage } from ".";
import { toPage } from "./adapter";
import { wordpressUrl, wpFetch } from "./client";

/**
 * Contract tests: the real queries against the running WordPress (ddev).
 *
 * They check that WordPress and the frontend agree (schema, queries, URL rewriting, auth),
 * never what the content is. Editors can add, remove and reorder Pages, Blocks and menu items
 * freely without breaking these. Content order and conversion are covered by the fixture-based
 * unit tests (adapter.test.ts, block-renderer.test.tsx).
 */
describe("WordPress contract", () => {
  it("has a Block Component for every Layout the Page Builder offers", async () => {
    // Introspection, not content: the Layouts defined in SCF (acf-json/group_page_builder.json).
    const { layouts } = await wpFetch<{ layouts: { possibleTypes: { name: string }[] } }>(
      `query { layouts: __type(name: "PageBuilderBlocks_Layout") { possibleTypes { name } } }`,
    );
    const typenames = layouts.possibleTypes.map((type) => type.name);
    expect(typenames.length).toBeGreaterThan(0);

    // Through the Adapter's public behaviour: a Layout it doesn't know becomes an "unknown-type" Unsupported Block.
    const page = toPage(
      { databaseId: 1, title: "", uri: "/", isFrontPage: true, pageBuilder: { blocks: typenames.map((__typename) => ({ __typename })) } },
      { wordpressUrl: wordpressUrl() },
    );
    const unknown = page.blocks.flatMap((block) =>
      block.type === "unsupported" && block.reason === "unknown-type" ? [block.source] : [],
    );
    expect(unknown).toEqual([]);
  });

  it("resolves every published Page path back to that Page", async () => {
    // Also proves the queries (and every Block fragment in them) are valid against the live schema.
    const paths = await getAllPagePaths();
    expect(paths).toContain("/");

    for (const path of paths) {
      expect(await getPage(path), path).toMatchObject({ path });
    }
  });

  it("returns null for a path with no Page", async () => {
    expect(await getPage("/this-path-does-not-exist")).toBeNull();
  });

  it("serves Globals with links rewritten for the frontend", async () => {
    const globals = await getGlobals();
    const host = new URL(wordpressUrl()).host;
    const flatten = (items: typeof globals.primaryMenu): string[] =>
      items.flatMap((item) => [item.href, ...flatten(item.children)]);
    const hrefs = [
      ...flatten(globals.primaryMenu),
      ...globals.siteSettings.footerColumns.flatMap((column) => column.links.map((link) => link.href)),
    ];

    expect(globals.siteName).toEqual(expect.any(String));
    // Internal links are relative paths: nothing should send visitors to the WordPress host.
    expect(hrefs.filter((href) => href.includes(host))).toEqual([]);
    expect(globals.siteSettings.copyright ?? "").not.toContain("{year}");
  });

  it("serves Draft Preview when authenticated with the Application Password", async () => {
    const home = await getPage("/");
    const preview = await getPreviewPage(Number(home?.id));

    expect(preview).not.toBeNull();
    // A preview revision without the Page Builder fields would render an empty page (see seed.php).
    // (Would only be wrong if an editor's unsaved draft deliberately removed every Block.)
    if (home?.blocks.length) expect(preview?.blocks.length).toBeGreaterThan(0);
  });
});
