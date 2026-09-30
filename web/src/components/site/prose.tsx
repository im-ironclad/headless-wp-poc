import { cn } from "cn";
import type { RichText } from "@/lib/cms/types";

/**
 * Renders rich text HTML from the CMS. Safe because the Adapter sanitizes it:
 * never pass unsanitized HTML here.
 */
export function Prose({ html, className }: { html: RichText; className?: string }) {
  return (
    <div
      className={cn(
        "space-y-4 leading-7 [&_a]:underline [&_h2]:text-2xl [&_h2]:font-semibold [&_h3]:text-xl [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:list-disc [&_ul]:pl-6",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
