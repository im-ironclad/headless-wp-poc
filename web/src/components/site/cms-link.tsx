import NextLink from "next/link";
import type { ComponentProps } from "react";
import type { Link } from "@/lib/cms/types";

/**
 * Renders a CMS Link: client-side routing for internal paths, new tab when the editor asked for one.
 * The editor's label is the content unless `children` replaces it (e.g. to add an icon).
 */
export function CmsLink({ link, children, ...props }: { link: Link } & Omit<ComponentProps<"a">, "href">) {
  const newTab = link.external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  if (link.href.startsWith("/")) {
    return <NextLink href={link.href} {...newTab} {...props}>{children ?? link.label}</NextLink>;
  }
  return <a href={link.href} {...newTab} {...props}>{children ?? link.label}</a>;
}
