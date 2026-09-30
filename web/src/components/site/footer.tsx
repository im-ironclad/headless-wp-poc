import { Separator } from "@/components/ui/separator";
import type { Globals, SocialPlatform } from "@/lib/cms/types";
import { CmsLink } from "./cms-link";

const platformLabels: Record<SocialPlatform, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  x: "X",
  linkedin: "LinkedIn",
  youtube: "YouTube",
};

export function Footer({ globals }: { globals: Globals }) {
  const { footerTagline, footerColumns, socialLinks, copyright } = globals.siteSettings;
  return (
    <footer className="mt-16 border-t bg-muted/40">
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-4">
        <p className="text-sm text-muted-foreground">{footerTagline}</p>
        {footerColumns.map((column) => (
          <nav key={column.heading} aria-label={column.heading} className="space-y-2 text-sm">
            <h2 className="font-semibold">{column.heading}</h2>
            <ul className="space-y-1">
              {column.links.map((link) => (
                <li key={link.href}>
                  <CmsLink link={link} className="text-muted-foreground hover:underline" />
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <Separator />
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 text-sm text-muted-foreground md:flex-row md:justify-between">
        <p>{copyright}</p>
        <ul className="flex gap-4">
          {socialLinks.map((social) => (
            <li key={social.url}>
              <a href={social.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                {platformLabels[social.platform]}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
