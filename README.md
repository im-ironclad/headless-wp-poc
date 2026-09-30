# Headless WordPress Page Builder POC

Editors build Pages in WordPress from reorderable **Blocks** (Hero, Rich Text, Feature Grid, Media + Text, CTA Banner). A Next.js frontend renders them, branded as the fictional **Lumen Studio** with shadcn + Aceternity UI components in light and dark mode. It's the Craft **Matrix** pattern, done the headless WordPress way.

```
┌──────────────── WordPress (ddev) ─────────────────┐        ┌──────────── Next.js (web/) ─────────────┐
│ wp-admin: Page Builder, Menus, Site Settings      │        │ lib/cms/wordpress   Adapter             │
│ SCF (ACF fork) ─ WPGraphQL for ACF ─ WPGraphQL ───┼─GraphQL▶ lib/cms/types       CMS-agnostic model  │
│ mu-plugins: fields, revalidate, preview           │        │ components/blocks   Block Components    │
│                     acf/save_post ────────────────┼─webhook▶ /api/revalidate     revalidateTag       │
│                     "Preview" button ─────────────┼─browser▶ /api/preview → /preview/[id] (draft)   │
└───────────────────────────────────────────────────┘        └─────────────────────────────────────────┘
```

## Run it

```bash
./wordpress/setup.sh          # ddev + WordPress + plugins + seed content (idempotent)
cp web/.env.example web/.env.local   # paste the Application Password setup.sh printed
cd web && yarn && yarn dev    # http://localhost:3000
```

- wp-admin: https://headless-wp.ddev.site/wp-admin (`admin` / `admin`)
- GraphiQL IDE: wp-admin → GraphQL → GraphiQL IDE
- Try it: Pages → Home → drag Blocks into a new order → **Update** → refresh localhost:3000.
- Try preview: change a heading → **Preview** (don't publish) → Next shows the draft with a banner.

## Checks

```bash
cd web
yarn test            # 30 unit + component tests (Vitest + RTL), no network
yarn test:contract   # 6 contract tests against the running WordPress (needs seed content)
yarn lint && yarn typecheck && yarn build
yarn screenshot      # full-page screenshots, light/dark × desktop/mobile (dev server running)
```

## Reading order

| # | Doc | What you'll get |
|---|-----|-----------------|
| 1 | [CONTEXT.md](CONTEXT.md) | Vocabulary: Page, Block, Block Type, Layout, Globals… |
| 2 | [docs/01-wordpress-for-craft-devs.md](docs/01-wordpress-for-craft-devs.md) | WordPress mental model, mapped onto Craft |
| 3 | [docs/02-page-builder.md](docs/02-page-builder.md) | One Block traced from PHP → GraphQL → Adapter → React |
| 4 | [docs/03-frontend-adapter.md](docs/03-frontend-adapter.md) | Frontend architecture, plain fetch vs Apollo, codegen |
| 5 | [docs/04-caching-preview.md](docs/04-caching-preview.md) | "Editor clicks Update, what happens?" and Draft Preview |
| 6 | [docs/05-acf-vs-gutenberg.md](docs/05-acf-vs-gutenberg.md) | The other way to build a page builder in WordPress |
| 7 | [docs/06-testing.md](docs/06-testing.md) | What's tested where, and how agencies test WordPress PHP |
| 8 | [docs/08-design-system.md](docs/08-design-system.md) | Fonts, tokens, themes, which Aceternity/shadcn component is behind each Block, client islands, page transitions |
| 9 | [docs/07-interview-cheatsheet.md](docs/07-interview-cheatsheet.md) | One-page talking points |
| – | [docs/adr/](docs/adr/) | Why Flexible Content; why an Adapter with only one CMS |

## Repo map

```
wordpress/
  .ddev/config.headless.yaml     env: frontend URL, secrets, WP_ENVIRONMENT_TYPE=local
  setup.sh, seed.php             reproducible install + demo content
  assets/                        brand artwork the seed imports (made by web/scripts/generate-seed-art.mjs)
  web/wp-content/mu-plugins/     ALL the WordPress code (WP core + plugins are gitignored)
    page-builder-fields.php      the Page Builder field group (in code, not DB)
    site-settings.php            Options Page for footer/brand Globals
    headless-config.php          disable Gutenberg on Pages, menu location, env helpers
    revalidate.php               save hooks → POST Next.js /api/revalidate
    preview.php                  "Preview" button → Next.js /api/preview
  web/wp-content/themes/headless/ redirects any public WP URL to Next.js
web/src/
  lib/cms/types.ts               the CMS-agnostic model (start here)
  lib/cms/wordpress/             Adapter: client, queries, fragments, adapter.ts, tags
  components/blocks/             Block Components + BlockRenderer
  components/site/               Header, Footer, ThemeToggle, Providers, Reveal, CmsLink, Prose
  components/ui/                 shadcn + Aceternity components (copied in, adapted: see doc 08)
  app/globals.css                design tokens (light + dark), fonts, utilities
  app/[[...slug]]/page.tsx       every Page
  app/preview/[id]/page.tsx      Draft Preview
  app/api/{revalidate,preview}/  webhooks
  scripts/                       seed artwork + screenshot scripts (Playwright)
```
