export const IMAGE_FIELDS = /* GraphQL */ `
  fragment ImageFields on AcfMediaItemConnectionEdge {
    node { sourceUrl altText mediaDetails { width height } }
  }
`;

export const LINK_FIELDS = /* GraphQL */ `
  fragment LinkFields on AcfLink { title url target }
`;
