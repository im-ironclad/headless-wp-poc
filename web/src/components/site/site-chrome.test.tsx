import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Globals } from "@/lib/cms/types";
import { Footer } from "./footer";
import { Header } from "./header";

const globals: Globals = {
  primaryMenu: [
    { id: "1", label: "Home", href: "/", children: [] },
    {
      id: "2",
      label: "Services",
      href: "/services",
      children: [{ id: "3", label: "Design", href: "/services/design", children: [] }],
    },
  ],
  siteSettings: {
    logo: { src: "https://headless-wp.ddev.site/logo.jpg", alt: "Acme", width: 200, height: 200 },
    footerTagline: "Content by WordPress.",
    footerColumns: [
      { heading: "Site", links: [{ label: "About", href: "/about", external: false }] },
      { heading: "Resources", links: [{ label: "Next.js", href: "https://nextjs.org", external: true }] },
    ],
    socialLinks: [{ platform: "instagram", url: "https://instagram.com/acme" }],
    copyright: "© 2026 Acme",
  },
};

describe("Header", () => {
  it("links the logo home and renders the Primary Menu, including nested items", () => {
    render(<Header globals={globals} />);

    expect(screen.getByRole("link", { name: "Acme" })).toHaveAttribute("href", "/");
    const nav = screen.getByRole("navigation", { name: "Primary" });
    expect(within(nav).getByRole("link", { name: "Home" })).toHaveAttribute("href", "/");
    expect(within(nav).getByRole("link", { name: "Services" })).toHaveAttribute("href", "/services");
    expect(within(nav).getByRole("link", { name: "Design" })).toHaveAttribute("href", "/services/design");
  });
});

describe("Footer", () => {
  it("renders Site Settings: tagline, link columns, social links and copyright", () => {
    render(<Footer globals={globals} />);

    expect(screen.getByText("Content by WordPress.")).toBeInTheDocument();
    const resources = screen.getByRole("navigation", { name: "Resources" });
    expect(within(resources).getByRole("link", { name: "Next.js" })).toHaveAttribute("target", "_blank");
    expect(screen.getByRole("navigation", { name: "Site" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Instagram" })).toHaveAttribute("href", "https://instagram.com/acme");
    expect(screen.getByText("© 2026 Acme")).toBeInTheDocument();
  });
});
