# Testing

Built test-first (red → green, one slice at a time) at a few agreed **seams**, the public boundaries where behavior is visible:

| Seam | File | What it proves | Network |
|---|---|---|---|
| Adapter `toPage` / `toGlobals` | `lib/cms/wordpress/adapter.test.ts` (14) | Every Layout converts correctly. Link rewriting, sanitization, list-valued selects, unknown/incomplete Layouts → Unsupported Block, menu tree building, `{year}`, site name | none |
| `BlockRenderer` | `components/blocks/block-renderer.test.tsx` (9) | Editor order is kept, each Block Component renders its content, Media + Text position, external links open in a new tab, Unsupported placeholder only when asked | none |
| `Header` / `Footer` | `components/site/site-chrome.test.tsx` (4) | Globals render: site name → home, nested menu, the mobile menu button opens the menu (`aria-expanded`), theme toggle, footer columns, social, copyright | none |
| `POST /api/revalidate` | `app/api/revalidate/route.test.ts` (3) | Revalidates each tag with `{expire: 0}`, 401 on a bad secret, 400 on a bad body (`next/cache` mocked, since it's the framework boundary) | none |
| **Contract**: `getPage` / `getGlobals` / `getAllPagePaths` / `getPreviewPage` | `lib/cms/wordpress/wordpress.contract.test.ts` (5) | WordPress and the frontend agree, **whatever the content**: every Layout in the GraphQL schema has a Block Component, every published path resolves back to its Page (so every query and fragment is valid), 404 → `null`, Globals links are rewritten off the WordPress host, and the Application Password preview works | ddev |

```bash
yarn test            # fast, run all the time
yarn test:contract   # needs ddev running. Any content: editors can change Pages freely
```

The design reskin (doc 08) changed every Block Component's markup and styling but **no renderer test**, because the tests assert behaviour, not class names. The Aceternity/motion components need two browser APIs jsdom lacks (`matchMedia`, `IntersectionObserver`), stubbed in `vitest.setup.ts`.

Tests use React Testing Library queries by **role and accessible name** (`getByRole("link", { name: "Learn more" })`), which also checks accessibility. The fixtures in the Adapter tests are copies of real WPGraphQL response shapes, so they double as documentation of the data.

## Contract tests check agreement, not content

The first version asserted the seeded content: Home's five Blocks in order, a menu of exactly Home and About. It broke as soon as an editor added a Page to the menu, which is exactly what editors are *supposed* to do. So the contract tests now only assert invariants that hold for any content:

- **Schema ↔ components:** the Layouts WPGraphQL offers (by introspection, not by reading content) must all be known to the Adapter. Adding a Layout in SCF without a Block Component fails here, naming the Layout.
- **Round trip:** every path from `getAllPagePaths()` resolves via `getPage()` to a Page at that path. That runs the full query, with every Block fragment, against the live schema.
- **Link rewriting on real data:** no menu or footer link points at the WordPress host.

Rejected alternatives:
- **Computing the "expected" order by querying WordPress in the test:** tautological. The same code on both sides can never disagree.
- **Exporting content to a file on save for tests to read:** the same problem, plus machinery.

Order preservation is still tested, in the fixture-based adapter and renderer unit tests.

**Proving the tests can fail** (mutation checks, run by hand):
- Renaming the CTA Banner case in the Adapter fails the schema test, which names `PageBuilderBlocksCtaBannerLayout`.
- Turning off URL rewriting fails the Globals test.

## Why contract tests instead of PHPUnit here

The WordPress code in this repo is almost all **declarative config** (field arrays, filters) plus one HTTP call. The real risk is **drift**: someone renames a field in SCF and the frontend query breaks. Contract tests catch exactly that, from the side that would break.

## How agencies test WordPress PHP (so you can talk about it)

- **Integration tests with the WP test suite:** PHPUnit + `WP_UnitTestCase` (a real WordPress + a test DB, reset per test). Set it up with `wp scaffold plugin-tests` (creates `bin/install-wp-tests.sh` + `phpunit.xml`), or run it inside **`@wordpress/env`** (`wp-env run tests-cli phpunit`) or ddev. Example: create a page, `do_action('acf/save_post', $id)`, and assert that `pre_http_request` captured a POST with the right tags.
- **Unit tests without WordPress:** **Brain Monkey** (+ Mockery) stubs `add_action`, `get_option` and other WordPress functions, so pure PHP logic runs in milliseconds.
- **Static analysis:** PHPStan with `szepeviktor/phpstan-wordpress`, and PHPCS with WordPress Coding Standards.
- **End to end:** Playwright against wp-admin (the `@wordpress/e2e-test-utils-playwright` helpers) for critical editor flows.
- **Schema snapshots:** save the GraphQL schema (introspection) in CI and fail on breaking changes (`graphql-inspector`).
