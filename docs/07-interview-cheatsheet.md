# Interview cheat sheet

## 30-second pitch of the POC
"WordPress is purely the content API. Pages have a single ACF Flexible Content field. That's the Page Builder, where editors add, reorder and remove typed Blocks, the Matrix equivalent. WPGraphQL for ACF exposes it as a GraphQL union. In Next.js a WordPress Adapter converts that into a CMS-agnostic Block model, and a registry maps each Block Type to a shadcn-based Server Component. Pages are static, and WordPress calls a revalidate webhook with cache tags on save. Drafts preview through Next draft mode using an Application Password. Tested with Vitest/RTL at the adapter and renderer seams, plus contract tests against the live WordPress. The design system is shadcn plus Aceternity UI on theme tokens (light and dark). Effects are small client islands inside Server Components, so pages stay static."

## Likely questions → answers

- **How do editors control layout?** Flexible Content: any Layout, any order, drag to reorder. Required fields are enforced. The frontend ignores Layouts it doesn't know yet (an Unsupported Block, hidden in prod, flagged in preview).
- **Why not Gutenberg?** Structured, typed data maps cleanly to components, editors can't break the design, and it's less JS to maintain. Gutenberg (or ACF Blocks) is the choice when editors need WYSIWYG or long-form mixed content. The headless side then uses WPGraphQL Content Blocks and a flat `editorBlocks` list. → doc 05
- **REST or GraphQL?** WPGraphQL: one request per page, typed, fragments per block, and the ACF integration. The REST API works too (`/wp-json/wp/v2/pages?slug=`, with ACF fields under `acf` when `show_in_rest` is on), but it over-fetches and has no types.
- **Editor saves, how fast is the site updated?** On the next request. `acf/save_post` (after ACF writes) → webhook → `revalidateTag`, with a 1h time-based fallback. → doc 04
- **Preview?** The `preview_post_link` filter → `/api/preview` (secret) → `draftMode()` → fetch `asPreview: true` with Basic auth (Application Password). JWT is the alternative.
- **Where do globals live?** Menus for navigation (native, links to Pages by ID). ACF Options Pages for everything else.
- **How is config versioned?** Field groups registered in PHP (or ACF Local JSON), all project code in mu-plugins, plugins pinned via Composer/WPackagist (Bedrock) in real projects, WP-CLI scripts for setup.
- **Security?**
  - Sanitize WYSIWYG HTML.
  - Keep secrets server-only.
  - Validate webhook and preview secrets.
  - No open redirect in preview.
  - Turn off public introspection in production.
  - Lock down the WordPress front end (redirect theme).
  - Consider `wp-admin` behind SSO/VPN.
  - Hide XML-RPC.
- **SEO?** Here it's basic `generateMetadata` from title + excerpt. In real projects: **Yoast** or **Rank Math** + **WPGraphQL for Yoast (wp-graphql-yoast-seo)** exposes `seo { title metaDesc opengraphImage … fullHead }`. Plus a sitemap (generated in Next from `getAllPagePaths`) and redirects (the Redirection plugin → Next `redirects`/middleware).
- **Scaling / hosting?** WP Engine Atlas, Kinsta, Pantheon or Vercel for the frontend. WordPress stays private-ish, and caching GraphQL GETs at a CDN takes load off it. The WPGraphQL Smart Cache plugin adds purge-on-save for the network cache.
- **Adding Contentful?** A new Adapter (`lib/cms/contentful`). The Page is a content type with a `blocks` field that's a *References, many* field restricted to Block content types. Reordering happens in the reference list. Components don't change.
- **How is the frontend styled?** shadcn + Aceternity UI, both copy-paste: the code lives in `components/ui` and we own it. Everything reads CSS-variable tokens, so light and dark mode and rebrands happen in one file. Effects are `"use client"` islands inside Server Components, so pages are still SSG. It respects `prefers-reduced-motion`, and the LCP heading isn't animated. → doc 08
- **Page transitions?** React `<ViewTransition>` on the browser's native View Transitions API, with no library. Keyed by path in the catch-all route, CSS for the animation, header anchored with a `view-transition-name`. Next navigations are Transitions, so it just works. Back/Forward are instant (React flushes popstate eagerly for scroll restoration). → doc 08
- **Can editors change the design?** They control which Blocks, in what order, with what content. Per-Block *variants* (a select field → a component prop) are the usual next step, and deliberately not built here.
- **Multilingual?** WPML or Polylang (+ their WPGraphQL extensions), and Next's `[locale]` segment.

## Gotchas hit while building (good "war stories")

1. `save_post` fires **before** ACF saves fields, so revalidate on `acf/save_post` at priority 20.
2. ACF **select** fields come back as **lists** in WPGraphQL, and images as **connection edges** (`image.node`).
3. Application Passwords **require https** unless `WP_ENVIRONMENT_TYPE=local`.
4. WPGraphQL **blocks introspection** for anonymous users by default.
5. Next 16: `revalidateTag` needs a profile. `"max"` serves stale once, so we use `{expire: 0}` for editor feedback.
6. Next 16 blocks image optimization from local IPs (`dangerouslyAllowLocalIP` for ddev).
7. Reading `draftMode()` in the root layout would make every page dynamic, so preview gets its own route.
8. SCF (the free ACF fork) now includes Flexible Content, Repeater and Options Pages, and works with WPGraphQL for ACF.
9. Preview showed **no Blocks** after a re-seed: a scripted `wp_insert_post` made a revision without ACF fields, and `asPreview` serves the latest revision. Fixed by clearing revisions in the seed, and caught by a stronger contract test.
10. Copy-paste UI libraries need owning: the Aceternity code failed Next 16's React Compiler lint rules (`Math.random` during render, missing effect deps) and had a11y gaps (an icon used as a button).
11. next-themes + React 19: its no-flash `<script>` triggers a dev warning when a layout re-renders on the client (the 404 page). Fix: a non-JS `type` for the client render only.
12. View transitions vs a frosted (`backdrop-filter`) header: naming the wrapper kills the blur (a backdrop root). Naming the pill bakes the blurred backdrop into its snapshot (a purple box in real Chrome only). Fix: name the pill and turn its `backdrop-filter` off during `:root:active-view-transition`. Found by recording every frame with a DevTools screencast in real Chrome.

## Craft ↔ WordPress quick map
Section → post type · Entry → post/page · Matrix → Flexible Content · Global Set → Options Page · Navigation → Menus · Module → mu-plugin · Events → hooks (actions/filters) · project config → PHP field registration / Local JSON · `craft` → `wp` CLI.
