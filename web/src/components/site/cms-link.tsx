import NextLink from "next/link";
import type { ComponentProps } from "react";
import type { Link } from "@/lib/cms/types";

/** Renders a CMS Link: client-side routing for internal paths, new tab when the editor asked for one. */
export function CmsLink({ link, ...props }: { link: Link } & Omit<ComponentProps<"a">, "href">) {
  const newTab = link.external ? { target: "_blank", rel: "noopener noreferrer" } : {};
  if (link.href.startsWith("/")) {
    return <NextLink href={link.href} {...newTab} {...props}>{link.label}</NextLink>;
  }
  return <a href={link.href} {...newTab} {...props}>{link.label}</a>;
}
