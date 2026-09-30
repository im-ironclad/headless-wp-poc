import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import type { Block, Image } from "@/lib/cms/types";
import { BlockRenderer } from "./block-renderer";

const img = (alt: string): Image => ({ src: "https://headless-wp.ddev.site/x.jpg", alt, width: 800, height: 600 });

describe("BlockRenderer", () => {
  it("renders Blocks in the order the editor arranged them", () => {
    const blocks: Block[] = [
      { type: "ctaBanner", id: "b0", heading: "Second in WordPress? No, first." },
      { type: "hero", id: "b1", heading: "Then the hero" },
    ];
    render(<BlockRenderer blocks={blocks} />);

    expect(screen.getAllByRole("heading").map((h) => h.textContent)).toEqual([
      "Second in WordPress? No, first.",
      "Then the hero",
    ]);
  });

  it("renders a Hero with its heading, subheading, image and call to action", () => {
    render(
      <BlockRenderer
        blocks={[
          {
            type: "hero",
            id: "b0",
            heading: "Build pages",
            subheading: "From blocks",
            image: img("Hero image"),
            cta: { label: "Learn more", href: "/about", external: false },
          },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { level: 1, name: "Build pages" })).toBeInTheDocument();
    expect(screen.getByText("From blocks")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Hero image" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Learn more" })).toHaveAttribute("href", "/about");
  });

  it("renders Rich Text HTML", () => {
    render(<BlockRenderer blocks={[{ type: "richText", id: "b0", content: "<h2>Title</h2><p>Body <strong>bold</strong></p>" }]} />);

    expect(screen.getByRole("heading", { level: 2, name: "Title" })).toBeInTheDocument();
    expect(screen.getByText("bold").tagName).toBe("STRONG");
  });

  it("renders a Feature Grid with one item per feature", () => {
    render(
      <BlockRenderer
        blocks={[
          {
            type: "featureGrid",
            id: "b0",
            heading: "Why?",
            features: [
              { title: "Flexible", text: "Any order.", image: img("Flexible icon") },
              { title: "Fast" },
            ],
          },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { level: 2, name: "Why?" })).toBeInTheDocument();
    const items = screen.getAllByRole("listitem");
    expect(items.map((li) => li.querySelector("h3")?.textContent)).toEqual(["Flexible", "Fast"]);
    expect(screen.getByRole("img", { name: "Flexible icon" })).toBeInTheDocument();
  });

  it.each([
    ["left", true],
    ["right", false],
  ] as const)("places the Media + Text image on the %s", (imagePosition, imageFirst) => {
    render(
      <BlockRenderer
        blocks={[{ type: "mediaText", id: "b0", image: img("Side"), content: "<p>Words</p>", imagePosition }]}
      />,
    );

    const image = screen.getByRole("img", { name: "Side" });
    const text = screen.getByText("Words");
    const imageBeforeText = Boolean(image.compareDocumentPosition(text) & Node.DOCUMENT_POSITION_FOLLOWING);
    expect(imageBeforeText).toBe(imageFirst);
  });

  it("opens external CTA Banner links in a new tab", () => {
    render(
      <BlockRenderer
        blocks={[
          {
            type: "ctaBanner",
            id: "b0",
            heading: "Ready?",
            text: "Try it.",
            cta: { label: "Docs", href: "https://nextjs.org", external: true },
          },
        ]}
      />,
    );

    const link = screen.getByRole("link", { name: "Docs" });
    expect(link).toHaveAttribute("href", "https://nextjs.org");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
    expect(screen.getByText("Try it.")).toBeInTheDocument();
  });

  describe("Unsupported Blocks", () => {
    const blocks: Block[] = [
      { type: "unsupported", id: "b0", source: "PageBuilderBlocksTestimonialLayout", reason: "unknown-type" },
      { type: "richText", id: "b1", content: "<p>Still here</p>" },
    ];

    it("are hidden from visitors", () => {
      const { container } = render(<BlockRenderer blocks={blocks} />);

      expect(container).not.toHaveTextContent("Testimonial");
      expect(screen.getByText("Still here")).toBeInTheDocument();
    });

    it("show a placeholder naming the Layout in development and Draft Preview", () => {
      render(<BlockRenderer blocks={blocks} showUnsupported />);

      expect(screen.getByRole("note")).toHaveTextContent(
        "Unsupported block: PageBuilderBlocksTestimonialLayout (unknown-type)",
      );
    });
  });
});
