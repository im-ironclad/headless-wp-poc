# Page Builder is an ACF Flexible Content field (via SCF), not Gutenberg blocks

WordPress offers two ways to let editors compose pages from sections. One is native Gutenberg blocks (block.json + React edit components, exposed through WPGraphQL Content Blocks). The other is an ACF-style Flexible Content field (exposed through WPGraphQL for ACF as a list of union types). We chose Flexible Content. It gives structured, typed data that maps cleanly to a GraphQL union and to frontend components, it's the dominant pattern at headless-WordPress agencies, and it's the direct equivalent of Craft's Matrix field. We use Secure Custom Fields (the free WordPress.org fork of ACF) instead of ACF Pro, so the POC needs no license. The field definitions are the same, so switching to ACF Pro is a drop-in change.

## Consequences

- The Gutenberg editor is turned off for Pages, so editors only see the Page Builder. This means no WYSIWYG preview inside wp-admin, and Draft Preview on the frontend makes up for it.
- Moving to Gutenberg later would mean migrating content, not just changing code.
