import { cn } from "cn";
import type { RichText } from "@/lib/cms/types";

/**
 * Renders rich text HTML from the CMS with Tailwind Typography, tuned to the brand.
 * Safe because the Adapter sanitizes it: never pass unsanitized HTML here.
 */
export function Prose({ html, className }: { html: RichText; className?: string }) {
  return (
    <div
      className={cn(
        "prose max-w-none dark:prose-invert",
        "prose-headings:font-heading prose-headings:font-semibold prose-headings:tracking-tight",
        "prose-p:text-muted-foreground prose-li:text-muted-foreground prose-li:marker:text-primary",
        "prose-a:text-primary prose-a:underline-offset-4 prose-strong:text-foreground",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
