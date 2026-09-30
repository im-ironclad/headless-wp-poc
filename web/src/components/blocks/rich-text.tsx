import { Prose } from "@/components/site/prose";
import type { RichTextBlock } from "@/lib/cms/types";

export function RichText({ content }: RichTextBlock) {
  return (
    <section className="mx-auto max-w-2xl py-12">
      <Prose html={content} />
    </section>
  );
}
