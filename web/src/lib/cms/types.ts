/**
 * The CMS-agnostic content model. See CONTEXT.md for the vocabulary.
 *
 * Block Components and routes only ever see these types. Each CMS gets an
 * Adapter (lib/cms/wordpress) that converts its responses into them.
 */

export type Link = {
  label: string;
  /** Relative for internal links ("/about"), absolute for external ones. */
  href: string;
  external: boolean;
};

export type Image = {
  src: string;
  alt: string;
  width: number;
  height: number;
};

/** Sanitized HTML from a rich-text field, safe to render. */
export type RichText = string;

export type HeroBlock = {
  type: "hero";
  id: string;
  heading: string;
  subheading?: string;
  image?: Image;
  cta?: Link;
};

export type RichTextBlock = {
  type: "richText";
  id: string;
  content: RichText;
};

export type Feature = {
  title: string;
  text?: string;
  image?: Image;
};

export type FeatureGridBlock = {
  type: "featureGrid";
  id: string;
  heading?: string;
  features: Feature[];
};

export type MediaTextBlock = {
  type: "mediaText";
  id: string;
  image: Image;
  content: RichText;
  imagePosition: "left" | "right";
};

export type CtaBannerBlock = {
  type: "ctaBanner";
  id: string;
  heading: string;
  text?: string;
  cta?: Link;
};

/** Every Block Type the frontend has a Block Component for. */
export type ContentBlock =
  | HeroBlock
  | RichTextBlock
  | FeatureGridBlock
  | MediaTextBlock
  | CtaBannerBlock;

export type BlockType = ContentBlock["type"];

/**
 * A Block the frontend can't render: a Layout it doesn't know yet (WordPress deployed
 * ahead of Next.js), or one missing required fields. Hidden in production, and shown as a
 * placeholder in development and Draft Preview.
 */
export type UnsupportedBlock = {
  type: "unsupported";
  id: string;
  /** The CMS's own name for it, e.g. "PageBuilderBlocksTestimonialLayout". */
  source: string;
  reason: "unknown-type" | "invalid";
};

export type Block = ContentBlock | UnsupportedBlock;

export type Page = {
  id: string;
  title: string;
  /** Frontend path: "/" for the front page, "/about" otherwise. */
  path: string;
  description?: string;
  blocks: Block[];
};

export type NavItem = {
  id: string;
  label: string;
  href: string;
  children: NavItem[];
};

export type SocialPlatform = "instagram" | "facebook" | "x" | "linkedin" | "youtube";

export type Globals = {
  /** The site's name (WordPress: Settings → General → Site Title). */
  siteName?: string;
  primaryMenu: NavItem[];
  siteSettings: {
    logo?: Image;
    footerTagline?: string;
    footerColumns: { heading: string; links: Link[] }[];
    socialLinks: { platform: SocialPlatform; url: string }[];
    /** With "{year}" already replaced. */
    copyright?: string;
  };
};
