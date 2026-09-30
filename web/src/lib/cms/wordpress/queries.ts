import { IMAGE_FIELDS, LINK_FIELDS } from "./fragments/image";
import { PAGE_BUILDER } from "./fragments/blocks";

const PAGE_FIELDS = /* GraphQL */ `
  fragment PageFields on Page {
    databaseId
    title
    uri
    isFrontPage
    excerpt
    ...PageBuilderFields
  }
  ${PAGE_BUILDER}
`;

/** idType: URI resolves "/" to the front page (Settings → Reading). */
export const PAGE_BY_URI = /* GraphQL */ `
  query PageByUri($uri: ID!) {
    page(id: $uri, idType: URI) { ...PageFields }
  }
  ${PAGE_FIELDS}
`;

/** asPreview returns the latest autosave/draft; only visible to authenticated users. */
export const PREVIEW_PAGE = /* GraphQL */ `
  query PreviewPage($id: ID!) {
    page(id: $id, idType: DATABASE_ID, asPreview: true) { ...PageFields }
  }
  ${PAGE_FIELDS}
`;

export const ALL_PAGE_URIS = /* GraphQL */ `
  query AllPageUris {
    pages(first: 100, where: { status: PUBLISH }) { nodes { uri isFrontPage } }
  }
`;

export const GLOBALS = /* GraphQL */ `
  query Globals {
    generalSettings { title }
    menuItems(first: 100, where: { location: PRIMARY }) {
      nodes { id label url parentId }
    }
    siteSettings {
      siteSettingsFields {
        logo { ...ImageFields }
        footerTagline
        footerColumns { heading links { link { ...LinkFields } } }
        socialLinks { platform url }
        copyright
      }
    }
  }
  ${IMAGE_FIELDS}
  ${LINK_FIELDS}
`;
