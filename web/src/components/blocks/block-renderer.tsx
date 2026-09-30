import type { ComponentType } from "react";
import type { Block, BlockType, ContentBlock, UnsupportedBlock } from "@/lib/cms/types";
import { CtaBanner } from "./cta-banner";
import { FeatureGrid } from "./feature-grid";
import { Hero } from "./hero";
import { MediaText } from "./media-text";
import { RichText } from "./rich-text";

/**
 * Block Type → Block Component. Adding a Block Type means one entry here.
 * `satisfies` makes the build fail if a Block Type has no component.
 */
const components = {
  hero: Hero,
  richText: RichText,
  featureGrid: FeatureGrid,
  mediaText: MediaText,
  ctaBanner: CtaBanner,
} satisfies { [T in BlockType]: ComponentType<Extract<ContentBlock, { type: T }>> };

type Props = {
  blocks: Block[];
  /** Show placeholders for Unsupported Blocks (development and Draft Preview only). */
  showUnsupported?: boolean;
};

export function BlockRenderer({ blocks, showUnsupported = false }: Props) {
  return (
    <>
      {blocks.map((block) => {
        if (block.type === "unsupported") {
          return showUnsupported ? <UnsupportedPlaceholder key={block.id} {...block} /> : null;
        }
        const Component = components[block.type] as ComponentType<ContentBlock>;
        return <Component key={block.id} {...block} />;
      })}
    </>
  );
}

function UnsupportedPlaceholder({ source, reason }: UnsupportedBlock) {
  return (
    <div role="note" className="my-6 rounded-lg border-2 border-dashed border-destructive/50 p-6 text-sm text-destructive">
      Unsupported block: {source} ({reason})
    </div>
  );
}
