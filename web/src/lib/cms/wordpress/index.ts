/**
 * Public API of the WordPress Adapter. Routes import from here (via lib/cms), never from
 * client/queries directly, so swapping or adding a CMS doesn't touch the app.
 */
import type { Globals, Page } from "../types";
import { toGlobals, toPage, toPath } from "./adapter";
import { wordpressUrl, wpFetch } from "./client";
import { ALL_PAGE_URIS, GLOBALS, PAGE_BY_URI, PREVIEW_PAGE } from "./queries";
import { tags } from "./tags";
import type { WpGlobals, WpPage } from "./wp-types";

const ctx = () => ({ wordpressUrl: wordpressUrl() });

/** @param path Frontend path: "/" or "/about". */
export async function getPage(path: string): Promise<Page | null> {
  const uri = path === "/" ? "/" : `${path}/`;
  const data = await wpFetch<{ page: WpPage | null }>(PAGE_BY_URI, { uri }, { tags: [tags.page(path)] });
  return data.page ? toPage(data.page, ctx()) : null;
}

/** Draft Preview: latest unpublished changes, fetched with the Application Password. */
export async function getPreviewPage(id: number): Promise<Page | null> {
  const data = await wpFetch<{ page: WpPage | null }>(PREVIEW_PAGE, { id: String(id) }, { preview: true });
  return data.page ? toPage(data.page, ctx()) : null;
}

export async function getAllPagePaths(): Promise<string[]> {
  const data = await wpFetch<{ pages: { nodes: { uri: string; isFrontPage: boolean }[] } }>(
    ALL_PAGE_URIS,
    {},
    { tags: [tags.pages] },
  );
  return data.pages.nodes.map((node) => (node.isFrontPage ? "/" : toPath(node.uri)));
}

export async function getGlobals(): Promise<Globals> {
  const data = await wpFetch<WpGlobals>(GLOBALS, {}, { tags: [tags.globals] });
  return toGlobals(data, ctx());
}
