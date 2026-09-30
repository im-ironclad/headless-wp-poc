import { ArrowUpRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { TextHoverEffect } from "@/components/ui/text-hover-effect";
import type { Globals, SocialPlatform } from "@/lib/cms/types";
import { CmsLink } from "./cms-link";

const platformLabels: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  x: "X",
  linkedin: "LinkedIn",
  youtube: "YouTube",
};

/** Site footer from Site Settings, signed off with the site name as a large outlined wordmark. */
export function Footer({ globals }: { globals: Globals }) {
  const { siteName } = globals;
  const { logo, footerTagline, footerColumns, socialLinks, copyright } = globals.siteSettings;
  return (
    <footer className="relative mt-16 overflow-hidden border-t bg-muted/30">
      <div aria-hidden className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-primary/60 to-transparent" />
      <div className="container-page grid gap-10 py-16 md:grid-cols-[2fr_repeat(3,1fr)]">
        <div className="space-y-5">
          <Link href="/" className="inline-flex items-center gap-2.5">
            {logo && <Image src={logo.src} alt={siteName ? "" : logo.alt} width={32} height={32} className="size-8 rounded-lg" />}
            {siteName && <span className="font-heading text-sm font-semibold">{siteName}</span>}
          </Link>
          {footerTagline && <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">{footerTagline}</p>}
          {socialLinks.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {socialLinks.map((social) => (
                <li key={social.url}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 rounded-full border bg-background px-3 py-1 text-xs font-medium text-muted-foreground transition hover:border-primary/50 hover:text-foreground"
                  >
                    {platformLabels[social.platform]}
                    <ArrowUpRight aria-hidden className="size-3" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
        {footerColumns.map((column) => (
          <nav key={column.heading} aria-label={column.heading} className="space-y-3 text-sm">
            <h2 className="font-sans text-xs font-semibold uppercase tracking-[0.18em] text-foreground">{column.heading}</h2>
            <ul className="space-y-2">
              {column.links.map((link) => (
                <li key={link.href}>
                  <CmsLink link={link} className="text-muted-foreground transition-colors hover:text-foreground" />
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      {siteName && (
        // Decorative: the name is already in the footer as text.
        <div aria-hidden className="container-page -mb-6 hidden h-44 md:block lg:h-56">
          <TextHoverEffect text={siteName.split(" ")[0].toUpperCase()} />
        </div>
      )}
      <Separator />
      <div className="container-page py-6 text-sm text-muted-foreground">
        <p>{copyright}</p>
      </div>
    </footer>
  );
}
