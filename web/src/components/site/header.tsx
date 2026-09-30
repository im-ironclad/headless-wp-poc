import Image from "next/image";
import Link from "next/link";
import type { Globals, NavItem } from "@/lib/cms/types";

export function Header({ globals }: { globals: Globals }) {
  const { logo } = globals.siteSettings;
  return (
    <header className="border-b">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
          {logo ? (
            <Image src={logo.src} alt={logo.alt} width={40} height={40} className="rounded-md" />
          ) : (
            "Home"
          )}
        </Link>
        <nav aria-label="Primary">
          <NavList items={globals.primaryMenu} />
        </nav>
      </div>
    </header>
  );
}

/** Top level renders inline; children appear in a dropdown on hover/focus (CSS only, no client JS). */
function NavList({ items, nested = false }: { items: NavItem[]; nested?: boolean }) {
  return (
    <ul
      className={
        nested
          ? "invisible absolute right-0 top-full z-10 min-w-40 rounded-md border bg-background p-2 opacity-0 shadow-md transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
          : "flex items-center gap-6 text-sm"
      }
    >
      {items.map((item) => (
        <li key={item.id} className={item.children.length ? "group relative" : undefined}>
          <Link href={item.href} className="block px-1 py-1 hover:underline">
            {item.label}
          </Link>
          {item.children.length > 0 && <NavList items={item.children} nested />}
        </li>
      ))}
    </ul>
  );
}
