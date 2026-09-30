# Flexible Content (ACF) vs Gutenberg blocks

WordPress has two very different ways to let editors compose pages. The word "block" means something different in each. See `CONTEXT.md`: our **Block** is a Flexible Content row, and a **Gutenberg block** is the native editor's unit.

| | ACF Flexible Content (this POC) | Gutenberg (block editor) |
|---|---|---|
| Editing experience | Form fields in collapsible panels (like Craft Matrix) | WYSIWYG canvas that looks like the page |
| Storage | Post meta, one row per sub-field | Serialized HTML with JSON comments in `post_content`: `<!-- wp:acme/hero {"heading":"…"} -->…` |
| Defining a block | PHP array (or Local JSON) | `block.json` + a React `edit` component + `save` or a PHP render callback |
| Headless API | WPGraphQL for ACF → **typed union per Layout** | **WPGraphQL Content Blocks** (WP Engine) → `editorBlocks { __typename name ... on AcmeHero { attributes { heading } } }`, returned as a **flat list with `parentClientId`** that you rebuild into a tree |
| Core blocks (paragraph, image, columns…) | n/a | Many, each needing a frontend component, or you render their `renderedHtml` |
| Editor freedom | Only the fields you defined | High: nesting, columns, styles (limit it with `allowed_blocks`, templates, `theme.json`) |
| Dev effort per block | Low (PHP config) | Higher (JS build, React edit UI, PHP registration) |
| Direction of WordPress core | Plugin ecosystem | Where core is heading (Full Site Editing) |

**Why this POC uses Flexible Content** ([ADR 0001](adr/0001-flexible-content-page-builder.md)): it gives structured, typed data that maps 1:1 to frontend components, it's quick to build, it's the pattern most headless agencies use, and editors can't break the layout.

**When Gutenberg wins:** editors want to see the page as they build it, content is long-form and mixed (articles), or the client already uses the block editor. A common hybrid is **ACF Blocks**: Gutenberg blocks whose fields are ACF fields (`acf_register_block_type` / `block.json` with `"acf"`). You get the block editor UI with structured data, and WPGraphQL Content Blocks exposes the attributes.

**What would change in our code to switch:** WordPress needs block registrations plus WPGraphQL Content Blocks. On the frontend you'd write new fragments and a new `toBlock` in the Adapter (`editorBlocks` → `Block`), plus tree reconstruction. `types.ts`, `BlockRenderer` and every Block Component stay the same. Content itself would need migrating (meta → `post_content`).
