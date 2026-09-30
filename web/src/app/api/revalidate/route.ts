import { revalidateTag } from "next/cache";

/**
 * On-demand revalidation webhook, called by WordPress (mu-plugins/revalidate.php)
 * whenever an editor saves a Page, the Primary Menu or Site Settings.
 *
 * Body: { "tags": ["page:/about", "pages"] }. See lib/cms/wordpress/tags.ts.
 */
export async function POST(request: Request) {
  if (request.headers.get("x-revalidate-secret") !== process.env.REVALIDATE_SECRET) {
    return Response.json({ error: "Invalid secret" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const tags: unknown = body?.tags;
  if (!Array.isArray(tags) || !tags.every((tag) => typeof tag === "string")) {
    return Response.json({ error: "Expected { tags: string[] }" }, { status: 400 });
  }

  // { expire: 0 }: the next visitor waits for fresh content instead of seeing the old
  // version once (the "max" profile). An editor who clicks Update then refreshes
  // should see their change immediately.
  for (const tag of tags) {
    revalidateTag(tag, { expire: 0 });
  }
  return Response.json({ revalidated: tags });
}
