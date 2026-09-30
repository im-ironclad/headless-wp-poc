import { draftMode } from "next/headers";
import { redirect } from "next/navigation";

/**
 * Entry point for wp-admin's "Preview" button (mu-plugins/preview.php rewrites the link here).
 * GET because the CMS opens it in a new tab.
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id") ?? "";

  if (searchParams.get("secret") !== process.env.PREVIEW_SECRET || !/^\d+$/.test(id)) {
    return new Response("Invalid preview link", { status: 401 });
  }

  (await draftMode()).enable();
  // Built from the validated numeric id, never from a URL in the query: no open redirect.
  redirect(`/preview/${id}`);
}
