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
      {/* Floating pill at the bottom, so it never covers the sticky header. Amber reads as "not live" in both themes. */}
      <form
        action={exitPreview}
        className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-xl items-center justify-between gap-4 rounded-full border border-amber-500/40 bg-amber-100/90 py-2 pl-5 pr-2 text-sm text-amber-950 shadow-xl backdrop-blur dark:bg-amber-950/80 dark:text-amber-100"
      >
        <span>
          <strong>Draft Preview:</strong> {page.title}. Only you can see unpublished changes.
        </span>
        <Button type="submit" size="sm" variant="outline" className="rounded-full">
          Exit preview
        </Button>
      </form>
      <BlockRenderer blocks={page.blocks} showUnsupported />
    </>
  );
}
