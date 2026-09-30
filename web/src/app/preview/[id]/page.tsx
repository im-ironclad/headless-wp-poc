import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { BlockRenderer } from "@/components/blocks/block-renderer";
import { Button } from "@/components/ui/button";
import { getPreviewPage } from "@/lib/cms";

/**
 * Draft Preview. Only reachable with the draft-mode cookie set by /api/preview.
 * Fetched by database ID (drafts have no stable URL yet) with the Application Password.
 */
export const metadata: Metadata = { title: "Preview", robots: { index: false } };

async function exitPreview() {
  "use server";
  (await draftMode()).disable();
  redirect("/");
}

export default async function PreviewPage({ params }: PageProps<"/preview/[id]">) {
  if (!(await draftMode()).isEnabled) notFound();

  const page = await getPreviewPage(Number((await params).id));
  if (!page) notFound();

  return (
    <>
      <form
        action={exitPreview}
        className="sticky top-0 z-20 -mx-4 flex items-center justify-between gap-4 bg-amber-100 px-4 py-2 text-sm text-amber-950"
      >
        <span>
          Draft Preview: <strong>{page.title}</strong>. Unpublished changes are visible only to you.
        </span>
        <Button type="submit" size="sm" variant="outline">
          Exit preview
        </Button>
      </form>
      <BlockRenderer blocks={page.blocks} showUnsupported />
    </>
  );
}
