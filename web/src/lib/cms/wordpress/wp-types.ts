/**
 * Shapes returned by WPGraphQL + WPGraphQL for ACF for our queries.
 * Hand-written (see docs/03-frontend-adapter.md for swapping in GraphQL codegen).
 * Everything is optional/nullable because WPGraphQL returns null for empty fields.
 */

export type WpImage = {
  node?: {
    sourceUrl?: string | null;
    altText?: string | null;
    mediaDetails?: { width?: number | null; height?: number | null } | null;
  } | null;
} | null;

export type WpLink = { title?: string | null; url?: string | null; target?: string | null } | null;

/** Flexible Content rows: one object per Block, discriminated by __typename. */
export type WpLayout = { __typename: string; [field: string]: unknown };

export type WpPage = {
  databaseId: number;
  title?: string | null;
  uri?: string | null;
  isFrontPage?: boolean | null;
  excerpt?: string | null;
  pageBuilder?: { blocks?: (WpLayout | null)[] | null } | null;
};

export type WpMenuItem = { id: string; label?: string | null; url?: string | null; parentId?: string | null };

export type WpFooterColumn = { heading?: string | null; links?: ({ link?: WpLink } | null)[] | null };
export type WpSocialLink = { platform?: (string | null)[] | null; url?: string | null };

export type WpGlobals = {
  menuItems?: { nodes?: (WpMenuItem | null)[] | null } | null;
  siteSettings?: {
    siteSettingsFields?: {
      logo?: WpImage;
      footerTagline?: string | null;
      footerColumns?: (WpFooterColumn | null)[] | null;
      socialLinks?: (WpSocialLink | null)[] | null;
      copyright?: string | null;
    } | null;
  } | null;
};
