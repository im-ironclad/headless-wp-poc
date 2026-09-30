/**
 * WordPress Adapter: converts WPGraphQL responses into the CMS-agnostic model in ../types.
 * Pure functions, so they're unit-tested with fixtures and no network.
 */
import sanitizeHtml from "sanitize-html";
import type { Block, ContentBlock, Globals, Image, Link, NavItem, Page, SocialPlatform } from "../types";
import type {
  WpFooterColumn,
  WpGlobals,
  WpImage,
  WpLayout,
  WpLink,
  WpMenuItem,
  WpPage,
  WpSocialLink,
} from "./wp-types";

export type AdapterContext = {
  /** Used to recognise internal links and rewrite them to relative paths. */
  wordpressUrl: string;
  /** Replaces "{year}" in Site Settings. Injected so tests are deterministic. */
  now?: Date;
};

export function toPage(raw: WpPage, ctx: AdapterContext): Page {
  const layouts = raw.pageBuilder?.blocks ?? [];
  return {
    id: String(raw.databaseId),
    title: raw.title ?? "",
    path: raw.isFrontPage ? "/" : toPath(raw.uri ?? "/"),
    description: optStr(stripTags(raw.excerpt ?? "")),
    blocks: layouts.flatMap((layout, index) =>
      layout ? [toBlock(layout, `block-${index}`, raw.databaseId, ctx)] : [],
    ),
  };
}

export function toGlobals(raw: WpGlobals, ctx: AdapterContext): Globals {
  const fields = raw.siteSettings?.siteSettingsFields;
  const year = String((ctx.now ?? new Date()).getFullYear());
  return {
    primaryMenu: toNavTree(list<WpMenuItem>(raw.menuItems?.nodes), ctx),
    siteSettings: {
      logo: toImage(fields?.logo ?? null),
      footerTagline: optStr(fields?.footerTagline),
      footerColumns: list<WpFooterColumn>(fields?.footerColumns).map((column) => ({
        heading: str(column.heading),
        links: list<{ link?: WpLink }>(column.links).flatMap((row) => {
          const link = toLink(row.link ?? null, ctx);
          return link ? [link] : [];
        }),
      })),
      socialLinks: list<WpSocialLink>(fields?.socialLinks).flatMap((row) => {
        const [platform] = list<string>(row.platform);
        return isSocialPlatform(platform) && row.url ? [{ platform, url: row.url }] : [];
      }),
      copyright: optStr(fields?.copyright)?.replaceAll("{year}", year),
    },
  };
}

/** WPGraphQL returns menu items as a flat list; nesting is expressed with parentId. */
function toNavTree(items: WpMenuItem[], ctx: AdapterContext): NavItem[] {
  const byId = new Map<string, NavItem>();
  for (const item of items) {
    byId.set(item.id, { id: item.id, label: item.label ?? "", href: toHref(item.url ?? "/", ctx), children: [] });
  }
  const roots: NavItem[] = [];
  for (const item of items) {
    const node = byId.get(item.id)!;
    const parent = item.parentId ? byId.get(item.parentId) : undefined;
    (parent ? parent.children : roots).push(node);
  }
  return roots;
}

const SOCIAL_PLATFORMS: readonly SocialPlatform[] = ["instagram", "facebook", "x", "linkedin", "youtube"];
const isSocialPlatform = (value: unknown): value is SocialPlatform =>
  SOCIAL_PLATFORMS.includes(value as SocialPlatform);

/**
 * WordPress and Next.js deploy separately, so a Layout can reach the frontend before its
 * Block Component exists. Rather than failing the whole Page, it becomes an UnsupportedBlock.
 */
function toBlock(layout: WpLayout, id: string, pageId: number, ctx: AdapterContext): Block {
  const result = toContentBlock(layout, id, ctx);
  if (typeof result !== "string") return result;
  console.warn(`[wordpress adapter] Page ${pageId}: ${layout.__typename} is ${result}`);
  return { type: "unsupported", id, source: layout.__typename, reason: result };
}

function toContentBlock(
  layout: WpLayout,
  id: string,
  ctx: AdapterContext,
): ContentBlock | "unknown-type" | "invalid" {
  switch (layout.__typename) {
    case "PageBuilderBlocksHeroLayout":
      if (!str(layout.heading)) return "invalid";
      return {
        type: "hero",
        id,
        heading: str(layout.heading),
        subheading: optStr(layout.subheading),
        image: toImage(layout.image as WpImage),
        cta: toLink(layout.cta as WpLink, ctx),
      };
    case "PageBuilderBlocksRichTextLayout":
      return { type: "richText", id, content: toRichText(layout.content, ctx) };
    case "PageBuilderBlocksFeatureGridLayout":
      return {
        type: "featureGrid",
        id,
        heading: optStr(layout.heading),
        features: list<Record<string, unknown>>(layout.features).map((feature) => ({
          title: str(feature.title),
          text: optStr(feature.text),
          image: toImage(feature.image as WpImage),
        })),
      };
    case "PageBuilderBlocksMediaTextLayout": {
      const image = toImage(layout.image as WpImage);
      if (!image) return "invalid";
      // ACF select fields come through WPGraphQL as a list, even for single selects.
      const [position] = list<string>(layout.imagePosition);
      return {
        type: "mediaText",
        id,
        image,
        content: toRichText(layout.content, ctx),
        imagePosition: position === "right" ? "right" : "left",
      };
    }
    case "PageBuilderBlocksCtaBannerLayout":
      if (!str(layout.heading)) return "invalid";
      return {
        type: "ctaBanner",
        id,
        heading: str(layout.heading),
        text: optStr(layout.text),
        cta: toLink(layout.cta as WpLink, ctx),
      };
    default:
      return "unknown-type";
  }
}

/**
 * Editors are trusted, but WYSIWYG HTML is still sanitized before it reaches
 * dangerouslySetInnerHTML (defense in depth: compromised accounts, pasted content).
 * Internal links inside the HTML are rewritten like Link fields.
 */
function toRichText(value: unknown, ctx: AdapterContext): string {
  return sanitizeHtml(str(value), {
    allowedTags: [...sanitizeHtml.defaults.allowedTags, "img"],
    allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, img: ["src", "alt", "width", "height"] },
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: attribs.href ? { ...attribs, href: toHref(attribs.href, ctx) } : attribs,
      }),
    },
  }).trim();
}

function toImage(raw: WpImage): Image | undefined {
  const node = raw?.node;
  if (!node?.sourceUrl) return undefined;
  return {
    src: node.sourceUrl,
    alt: node.altText ?? "",
    width: node.mediaDetails?.width ?? 0,
    height: node.mediaDetails?.height ?? 0,
  };
}

function toLink(raw: WpLink, ctx: AdapterContext): Link | undefined {
  if (!raw?.url) return undefined;
  return { label: raw.title ?? "", href: toHref(raw.url, ctx), external: raw.target === "_blank" };
}

/** WordPress stores absolute URLs. Links to our own Pages become relative so Next.js routes them. */
export function toHref(url: string, ctx: AdapterContext): string {
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return url; // Already relative, or mailto:/tel: etc.
  }
  const isWordPress = parsed.host === new URL(ctx.wordpressUrl).host;
  const servedByWordPress = /^\/(wp-admin|wp-content|wp-json|graphql)(\/|$)/.test(parsed.pathname);
  if (!isWordPress || servedByWordPress) return url;
  return toPath(parsed.pathname) + parsed.search + parsed.hash;
}

/** WordPress URI ("/company/about/") → frontend path ("/company/about"). */
export function toPath(uri: string): string {
  const trimmed = uri.replace(/^\/+|\/+$/g, "");
  return trimmed ? `/${trimmed}` : "/";
}

const stripTags = (html: string): string => html.replace(/<[^>]*>/g, "").trim();
const list = <T>(value: unknown): T[] =>
  Array.isArray(value) ? value.filter((item): item is T => item != null) : [];
const str = (value: unknown): string => (typeof value === "string" ? value : "");
const optStr = (value: unknown): string | undefined =>
  typeof value === "string" && value !== "" ? value : undefined;
