import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ViewTransition } from "react";
import { BlockRenderer } from "@/components/blocks/block-renderer";
import { getAllPagePaths, getPage } from "@/lib/cms";

/**
 * Every Page in WordPress, at its own path. "/" is the front page (Settings → Reading).
 * Pages are prerendered at build time and cached. WordPress tells us when one changes
 * (see app/api/revalidate). Pages created after the build render on first visit.
 */
const toPath = (slug?: string[]) => (slug?.length ? `/${slug.join("/")}` : "/");

export async function generateStaticParams() {
  const paths = await getAllPagePaths();
  return paths.map((path) => ({ slug: path === "/" ? [] : path.slice(1).split("/") }));
}

export async function generateMetadata({ params }: PageProps<"/[[...slug]]">): Promise<Metadata> {
  const page = await getPage(toPath((await params).slug));
  return page ? { title: page.title, description: page.description } : {};
}

export default async function CmsPage({ params }: PageProps<"/[[...slug]]">) {
  const page = await getPage(toPath((await params).slug));
  if (!page) notFound();

  // Page transition: every Page shares this route, so the key makes each navigation an exit + enter pair.
  // Next.js navigations are React Transitions, which is what activates <ViewTransition>. CSS: globals.css.
  return (
    <ViewTransition key={page.path} enter="page-enter" exit="page-exit" default="none">
      <div>
        <BlockRenderer blocks={page.blocks} showUnsupported={process.env.NODE_ENV !== "production"} />
      </div>
    </ViewTransition>
  );
}
