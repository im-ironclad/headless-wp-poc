import { describe, expect, it, vi } from "vitest";
import { toGlobals, toPage } from "./adapter";
import type { WpLayout, WpPage } from "./wp-types";

const ctx = { wordpressUrl: "http://headless-wp.ddev.site" };

const image = (src: string, altText = "Alt") => ({
  node: { sourceUrl: src, altText, mediaDetails: { width: 1600, height: 900 } },
});

const wpPage = (blocks: (WpLayout | null)[], overrides: Partial<WpPage> = {}): WpPage => ({
  databaseId: 5,
  title: "Home",
  uri: "/",
  isFrontPage: true,
  excerpt: "<p>A demo.</p>\n",
  pageBuilder: { blocks },
  ...overrides,
});

describe("toPage", () => {
  it("converts a Hero Layout into a hero Block", () => {
    const page = toPage(
      wpPage([
        {
          __typename: "PageBuilderBlocksHeroLayout",
          heading: "Build pages from blocks",
          subheading: "Editors reorder sections.",
          image: image("https://headless-wp.ddev.site/wp-content/uploads/hero.jpg", "Hero"),
          cta: { title: "Learn more", url: "https://example.com/docs", target: "_blank" },
        },
      ]),
      ctx,
    );

    expect(page.blocks).toEqual([
      {
        type: "hero",
        id: "block-0",
        heading: "Build pages from blocks",
        subheading: "Editors reorder sections.",
        image: {
          src: "https://headless-wp.ddev.site/wp-content/uploads/hero.jpg",
          alt: "Hero",
          width: 1600,
          height: 900,
        },
        cta: { label: "Learn more", href: "https://example.com/docs", external: true },
      },
    ]);
  });

  it("maps the front page to / and other URIs to paths without trailing slashes", () => {
    expect(toPage(wpPage([]), ctx).path).toBe("/");
    expect(toPage(wpPage([], { uri: "/company/about/", isFrontPage: false }), ctx).path).toBe(
      "/company/about",
    );
  });

  it("uses the excerpt as a plain-text description", () => {
    expect(toPage(wpPage([]), ctx).description).toBe("A demo.");
    expect(toPage(wpPage([], { excerpt: "" }), ctx).description).toBeUndefined();
  });

  it("rewrites links to WordPress into relative frontend paths", () => {
    const hero = (url: string) =>
      toPage(
        wpPage([
          { __typename: "PageBuilderBlocksHeroLayout", heading: "H", cta: { title: "Go", url, target: "" } },
        ]),
        ctx,
      ).blocks[0];

    // Same host over https (WordPress's own URLs) and http (our configured URL).
    expect(hero("https://headless-wp.ddev.site/about/")).toMatchObject({
      cta: { label: "Go", href: "/about", external: false },
    });
    expect(hero("http://headless-wp.ddev.site/")).toMatchObject({ cta: { href: "/" } });
    expect(hero("https://headless-wp.ddev.site/about/?ref=hero#team")).toMatchObject({
      cta: { href: "/about?ref=hero#team" },
    });
    // Other hosts are left alone.
    expect(hero("https://nextjs.org/docs")).toMatchObject({
      cta: { href: "https://nextjs.org/docs", external: false },
    });
  });

  it("leaves links into wp-admin and uploads absolute, since Next.js doesn't serve them", () => {
    const [block] = toPage(
      wpPage([
        {
          __typename: "PageBuilderBlocksHeroLayout",
          heading: "H",
          cta: { title: "Edit", url: "https://headless-wp.ddev.site/wp-admin/post.php?post=5", target: "_blank" },
        },
      ]),
      ctx,
    ).blocks;
    expect(block).toMatchObject({
      cta: { href: "https://headless-wp.ddev.site/wp-admin/post.php?post=5", external: true },
    });
  });

  it("converts Rich Text and sanitizes its HTML", () => {
    const [block] = toPage(
      wpPage([
        {
          __typename: "PageBuilderBlocksRichTextLayout",
          content:
            '<h2>Title</h2><p onclick="steal()">Hi <a href="https://headless-wp.ddev.site/about/">about</a></p><script>alert(1)</script>',
        },
      ]),
      ctx,
    ).blocks;

    expect(block).toEqual({
      type: "richText",
      id: "block-0",
      content: '<h2>Title</h2><p>Hi <a href="/about">about</a></p>',
    });
  });

  it("converts a Feature Grid with its repeater of features", () => {
    const [block] = toPage(
      wpPage([
        {
          __typename: "PageBuilderBlocksFeatureGridLayout",
          heading: "Why?",
          features: [
            { title: "Flexible", text: "Any order.", image: image("https://headless-wp.ddev.site/f.jpg", "F") },
            { title: "Fast", text: null, image: null },
          ],
        },
      ]),
      ctx,
    ).blocks;

    expect(block).toEqual({
      type: "featureGrid",
      id: "block-0",
      heading: "Why?",
      features: [
        {
          title: "Flexible",
          text: "Any order.",
          image: { src: "https://headless-wp.ddev.site/f.jpg", alt: "F", width: 1600, height: 900 },
        },
        { title: "Fast", text: undefined, image: undefined },
      ],
    });
  });

  it("converts Media + Text, reading the image position from ACF's list-valued select", () => {
    const mediaText = (imagePosition: unknown) =>
      toPage(
        wpPage([
          {
            __typename: "PageBuilderBlocksMediaTextLayout",
            image: image("https://headless-wp.ddev.site/m.jpg", "M"),
            content: "<p>Side by side</p>",
            imagePosition,
          },
        ]),
        ctx,
      ).blocks[0];

    expect(mediaText(["right"])).toEqual({
      type: "mediaText",
      id: "block-0",
      image: { src: "https://headless-wp.ddev.site/m.jpg", alt: "M", width: 1600, height: 900 },
      content: "<p>Side by side</p>",
      imagePosition: "right",
    });
    expect(mediaText(null)).toMatchObject({ imagePosition: "left" });
  });

  it("converts a CTA Banner", () => {
    const [block] = toPage(
      wpPage([
        {
          __typename: "PageBuilderBlocksCtaBannerLayout",
          heading: "Ready?",
          text: "Try it.",
          cta: { title: "Start", url: "https://headless-wp.ddev.site/about/", target: "" },
        },
      ]),
      ctx,
    ).blocks;

    expect(block).toEqual({
      type: "ctaBanner",
      id: "block-0",
      heading: "Ready?",
      text: "Try it.",
      cta: { label: "Start", href: "/about", external: false },
    });
  });

  it("marks unknown Layouts and Blocks missing required fields as unsupported, keeping the order", () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});

    const page = toPage(
      wpPage([
        { __typename: "PageBuilderBlocksCtaBannerLayout", heading: "First" },
        { __typename: "PageBuilderBlocksTestimonialLayout", quote: "Deployed before the frontend" },
        { __typename: "PageBuilderBlocksHeroLayout", heading: "" },
        null,
        { __typename: "PageBuilderBlocksRichTextLayout", content: "<p>Last</p>" },
      ]),
      ctx,
    );

    expect(page.blocks).toEqual([
      expect.objectContaining({ type: "ctaBanner", id: "block-0" }),
      { type: "unsupported", id: "block-1", source: "PageBuilderBlocksTestimonialLayout", reason: "unknown-type" },
      { type: "unsupported", id: "block-2", source: "PageBuilderBlocksHeroLayout", reason: "invalid" },
      expect.objectContaining({ type: "richText", id: "block-4" }),
    ]);
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("PageBuilderBlocksTestimonialLayout"));
    expect(warn).toHaveBeenCalledWith(expect.stringContaining("PageBuilderBlocksHeroLayout"));
    warn.mockRestore();
  });
});

describe("toGlobals", () => {
  const raw = {
    menuItems: {
      nodes: [
        { id: "m1", label: "Home", url: "https://headless-wp.ddev.site/", parentId: null },
        { id: "m2", label: "Services", url: "https://headless-wp.ddev.site/services/", parentId: null },
        { id: "m3", label: "Design", url: "https://headless-wp.ddev.site/services/design/", parentId: "m2" },
        { id: "m4", label: "Docs", url: "https://nextjs.org/docs", parentId: null },
      ],
    },
    siteSettings: {
      siteSettingsFields: {
        logo: image("https://headless-wp.ddev.site/logo.jpg", "Logo"),
        footerTagline: "Tagline",
        footerColumns: [
          {
            heading: "Site",
            links: [
              { link: { title: "About", url: "https://headless-wp.ddev.site/about/", target: "" } },
              { link: null },
            ],
          },
        ],
        socialLinks: [
          { platform: ["instagram"], url: "https://instagram.com/x" },
          { platform: ["myspace"], url: "https://myspace.com/x" },
        ],
        copyright: "© {year} Acme",
      },
    },
  };

  it("builds the Primary Menu tree from WordPress's flat list", () => {
    expect(toGlobals(raw, { ...ctx, now: new Date("2026-06-01") }).primaryMenu).toEqual([
      { id: "m1", label: "Home", href: "/", children: [] },
      {
        id: "m2",
        label: "Services",
        href: "/services",
        children: [{ id: "m3", label: "Design", href: "/services/design", children: [] }],
      },
      { id: "m4", label: "Docs", href: "https://nextjs.org/docs", children: [] },
    ]);
  });

  it("converts Site Settings, skipping empty links and unsupported platforms", () => {
    expect(toGlobals(raw, { ...ctx, now: new Date("2026-06-01") }).siteSettings).toEqual({
      logo: { src: "https://headless-wp.ddev.site/logo.jpg", alt: "Logo", width: 1600, height: 900 },
      footerTagline: "Tagline",
      footerColumns: [{ heading: "Site", links: [{ label: "About", href: "/about", external: false }] }],
      socialLinks: [{ platform: "instagram", url: "https://instagram.com/x" }],
      copyright: "© 2026 Acme",
    });
  });

  it("returns empty Globals when nothing is configured", () => {
    expect(toGlobals({ menuItems: null, siteSettings: null }, ctx)).toEqual({
      primaryMenu: [],
      siteSettings: { footerColumns: [], socialLinks: [] },
    });
  });
});
