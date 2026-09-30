# Frontend architecture

## Layers

```
app/ routes ──▶ lib/cms (index.ts) ──▶ lib/cms/wordpress/index.ts ──▶ client.ts ──▶ WPGraphQL
     │                 ▲                          │
     │                 └──── types.ts ◀── adapter.ts (pure: WP JSON → Page/Block/Globals)
     ▼
components/blocks (only know types.ts)
```

- **`lib/cms/types.ts`** is the contract: `Page`, the `Block` union, `Globals`. No CMS vocabulary.
- **`lib/cms/wordpress/`** is the only folder that knows WordPress exists:
  - `client.ts`: `wpFetch()`
  - `queries.ts` + `fragments/`: GraphQL
  - `wp-types.ts`: response shapes
  - `adapter.ts`: conversion
  - `tags.ts`: cache tags
  - `index.ts`: public functions
- **`lib/cms/index.ts`** re-exports the public functions. Adding Contentful means a `lib/cms/contentful/` Adapter behind the same functions ([ADR 0002](adr/0002-cms-agnostic-adapter.md)).

Everything is a **React Server Component** except what the framework needs on the client. There's no data fetching in the browser, no loading states, and CMS credentials never reach the client.

## Routes

| Route | Rendering | Notes |
|---|---|---|
| `app/[[...slug]]/page.tsx` | SSG + ISR | Optional catch-all, so `/` and `/any/depth`. `generateStaticParams` prerenders every published Page. New Pages render on first visit. `notFound()` for unknown paths. `generateMetadata` uses title + excerpt |
| `app/layout.tsx` | – | Fetches Globals once for Header/Footer |
| `app/preview/[id]/page.tsx` | Dynamic | Only with the draft-mode cookie (see doc 04) |
| `app/api/revalidate` | Route Handler | Webhook from WordPress |
| `app/api/preview` | Route Handler | Entry point for the Preview button |

`/` maps to WordPress's front page: `page(id: "/", idType: URI)` resolves the page chosen in Settings → Reading.

## `wpFetch()` (plain fetch)

```ts
fetch(`${WORDPRESS_URL}/graphql?query=…&variables=…`, { cache: "force-cache", next: { tags, revalidate: 3600 } })
```

- **GET, not POST:** GET responses can be cached by Next.js *and* by a CDN in front of WordPress (WPGraphQL supports GET).
- **Tags** hook into on-demand revalidation. **`revalidate: 3600`** is a safety net in case a webhook is missed.
- Preview requests add `Authorization: Basic <user:app-password>` and `cache: "no-store"`.
- GraphQL `errors` throw, so the route shows an error page instead of silently rendering an empty page.

## Plain fetch vs Apollo Client

We chose plain fetch because every request is made on the server and Next.js already provides the cache. What Apollo would add, and what would change:

| | Plain fetch (this repo) | Apollo Client |
|---|---|---|
| Caching | Next.js Data Cache + `revalidateTag` | Apollo's normalized in-memory cache. For RSC you'd use `@apollo/client-integration-nextjs` → `registerApolloClient()` (a per-request client), and still pass `context: { fetchOptions: { next: { tags } } }` to keep Next caching |
| Client-side queries | none needed | `ApolloNextAppProvider` in a client layout, `useSuspenseQuery` in client components. Useful for search, filters, infinite scroll |
| Bundle | 0 KB | ~30–40 KB gzipped on the client, if you use it there |
| Queries | template strings | `gql` tags + fragments (same GraphQL) |

**Moving to Apollo:** add the packages, create `lib/cms/wordpress/apollo.ts` with `registerApolloClient(() => new ApolloClient({ cache: new InMemoryCache({ possibleTypes }), link: new HttpLink({ uri, fetchOptions: { cache: "force-cache" } }) }))`, and change `wpFetch` to call `getClient().query(...)`. `possibleTypes` is needed for fragments on the `PageBuilderBlocks_Layout` interface. **Only `client.ts` changes.** The Adapter, types and components don't, and that's the payoff of the boundary.

Faust.js (WP Engine's headless framework) is another option agencies mention: Apollo + preview + auth, packaged together. It's opinionated. Worth knowing the name.

## Typed GraphQL (next step)

`wp-types.ts` is hand-written. To generate it: `@graphql-codegen/cli` with the `client-preset`, pointed at `http://headless-wp.ddev.site/graphql` (introspection is enabled locally), with documents `src/lib/cms/wordpress/**/*.ts`. Alternatively, `gql.tada` gives type inference with no build step. Either one replaces `wp-types.ts`. The Adapter tests keep the conversion honest.

## Security details

- **Rich text** is sanitized in the Adapter (`sanitize-html`) before `dangerouslySetInnerHTML`. Editors are trusted, but accounts get compromised and pasted HTML carries junk.
- **Secrets** (`REVALIDATE_SECRET`, `PREVIEW_SECRET`, the Application Password) are server-only env vars. There's no `NEXT_PUBLIC_` prefix.
- **Preview redirect** uses the validated numeric ID, never a URL from the query string, so it can't be used as an open redirect.
- **CORS isn't configured** because the browser never calls WordPress. Only the Next server does. You'd add it only for client-side GraphQL.

## Images

`next/image` optimizes Media Library URLs, which requires `images.remotePatterns` in `next.config.ts`. Two local-only settings:
- `dangerouslyAllowLocalIP`: Next 16 blocks optimizing images from private IPs, and `*.ddev.site` resolves to 127.0.0.1.
- `NODE_EXTRA_CA_CERTS=$(mkcert -CAROOT)/rootCA.pem` in the `dev`/`start` scripts: WordPress returns `https://` media URLs signed by ddev's local CA, which Node doesn't trust by default.

In production you'd point `remotePatterns` at the real media host or CDN.
