"use client";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { MobileNavMenu, MobileNavToggle, Navbar, NavBody } from "@/components/ui/resizable-navbar";
import type { Globals, NavItem } from "@/lib/cms/types";
import { ThemeToggle } from "./theme-toggle";

/**
 * Site header from Globals: Aceternity's Resizable Navbar, which shrinks into a floating pill on scroll.
 * A client component because it reacts to scrolling and the mobile menu's open state.
 */
export function Header({ globals }: { globals: Globals }) {
  const [open, setOpen] = useState(false);

  return (
    <Navbar>
      {/*
        data-site-header: named `site-header` in globals.css, so page transitions leave the header still,
        above the changing page. globals.css also turns the pill's backdrop-filter off while a transition
        runs: a snapshot would otherwise bake in whatever the blur was showing (a hard-edged purple box).
      */}
      <NavBody data-site-header="">
        <Brand globals={globals} />
        <nav aria-label="Primary" className="hidden lg:block">
          <DesktopNav items={globals.primaryMenu} />
        </nav>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <div className="lg:hidden">
            <MobileNavToggle isOpen={open} onClick={() => setOpen(!open)} controls="mobile-menu" />
          </div>
        </div>
        <MobileNavMenu isOpen={open} id="mobile-menu" className="lg:hidden">
          <nav aria-label="Mobile" className="w-full">
            <MobileNavList items={globals.primaryMenu} onNavigate={() => setOpen(false)} />
          </nav>
        </MobileNavMenu>
      </NavBody>
    </Navbar>
  );
}

/** Logo mark + site name. When there's a name, the logo is decorative and the name labels the link. */
function Brand({ globals }: { globals: Globals }) {
  const { siteName, siteSettings } = globals;
  const { logo } = siteSettings;
  return (
    <Link href="/" className="relative z-20 flex items-center gap-2.5 rounded-full py-1 pr-2">
      {logo && (
        <Image src={logo.src} alt={siteName ? "" : logo.alt} width={32} height={32} className="size-8 rounded-lg" />
      )}
      {siteName && <span className="font-heading text-sm font-semibold tracking-tight">{siteName}</span>}
      {!logo && !siteName && "Home"}
    </Link>
  );
}

/**
 * Top level: links with Aceternity's sliding hover pill (a shared `layoutId`).
 * Children: a dropdown on hover/focus, CSS only.
 */
function DesktopNav({ items }: { items: NavItem[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  return (
    <ul onMouseLeave={() => setHovered(null)} className="flex items-center gap-1 text-sm font-medium">
      {items.map((item) => (
        <li key={item.id} className="group relative" onMouseEnter={() => setHovered(item.id)}>
          <Link href={item.href} className="relative block px-4 py-2 text-muted-foreground transition-colors hover:text-foreground">
            {hovered === item.id && (
              <motion.span layoutId="nav-hover" className="absolute inset-0 rounded-full bg-muted" />
            )}
            <span className="relative">{item.label}</span>
          </Link>
          {item.children.length > 0 && (
            <ul className="invisible absolute left-1/2 top-full z-10 min-w-48 -translate-x-1/2 rounded-xl border bg-popover p-1.5 opacity-0 shadow-lg transition group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
              {item.children.map((child) => (
                <li key={child.id}>
                  <Link href={child.href} className="block rounded-lg px-3 py-2 text-muted-foreground hover:bg-muted hover:text-foreground">
                    {child.label}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </li>
      ))}
    </ul>
  );
}

function MobileNavList({ items, onNavigate, nested = false }: { items: NavItem[]; onNavigate: () => void; nested?: boolean }) {
  return (
    <ul className={nested ? "mt-1 space-y-1 border-l pl-4" : "w-full space-y-1"}>
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={item.href}
            onClick={onNavigate}
            className={nested ? "block py-1.5 text-muted-foreground" : "block py-2 font-heading text-lg"}
          >
            {item.label}
          </Link>
          {item.children.length > 0 && <MobileNavList items={item.children} onNavigate={onNavigate} nested />}
        </li>
      ))}
    </ul>
  );
}
