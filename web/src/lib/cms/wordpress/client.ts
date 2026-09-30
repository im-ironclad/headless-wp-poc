/**
 * Minimal WPGraphQL client: plain fetch, no Apollo. Runs only on the server
 * (Server Components and Route Handlers), so no client-side cache is needed:
 * Next.js's fetch cache + tags does that job. See docs/03-frontend-adapter.md.
 */

export const wordpressUrl = () => {
  const url = process.env.WORDPRESS_URL;
  if (!url) throw new Error("WORDPRESS_URL is not set (see web/.env.example)");
  return url.replace(/\/$/, "");
};

type FetchOptions = {
  /** Cache tags for on-demand revalidation. Ignored for preview requests. */
  tags?: string[];
  /** Authenticated, uncached request that can see drafts (Draft Preview). */
  preview?: boolean;
};

export async function wpFetch<T>(
  query: string,
  variables: Record<string, unknown> = {},
  { tags = [], preview = false }: FetchOptions = {},
): Promise<T> {
  // GET (not POST) so responses are cacheable by Next.js and any CDN in front of WordPress.
  const url = new URL(`${wordpressUrl()}/graphql`);
  url.searchParams.set("query", query.replace(/\s+/g, " ").trim());
  url.searchParams.set("variables", JSON.stringify(variables));

  const response = await fetch(url, preview ? previewInit() : { cache: "force-cache", next: { tags, revalidate: 3600 } });
  if (!response.ok) {
    throw new Error(`WPGraphQL request failed: ${response.status} ${response.statusText}`);
  }

  const json = (await response.json()) as { data?: T; errors?: { message: string }[] };
  if (json.errors?.length) {
    throw new Error(`WPGraphQL errors: ${json.errors.map((e) => e.message).join("; ")}`);
  }
  return json.data as T;
}

function previewInit(): RequestInit {
  const user = process.env.WORDPRESS_PREVIEW_USER;
  const password = process.env.WORDPRESS_PREVIEW_APP_PASSWORD;
  if (!user || !password) throw new Error("Draft Preview needs WORDPRESS_PREVIEW_USER and WORDPRESS_PREVIEW_APP_PASSWORD");
  return {
    cache: "no-store",
    headers: { Authorization: `Basic ${Buffer.from(`${user}:${password}`).toString("base64")}` },
  };
}
