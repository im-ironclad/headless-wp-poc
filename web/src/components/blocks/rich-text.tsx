import { Prose } from "@/components/site/prose";
import { Reveal } from "@/components/site/reveal";
import type { RichTextBlock } from "@/lib/cms/types";

/** Rich Text: calm, readable prose. No effects, since this is reading content. */
export function RichText({ content }: RichTextBlock) {
  return (
    <section className="container-page py-16 md:py-24">
      <Reveal className="mx-auto max-w-3xl">
        <Prose html={content} className="md:prose-lg" />
      </Reveal>
    </section>
  );
}
