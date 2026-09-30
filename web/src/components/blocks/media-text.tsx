import Image from "next/image";
import { Prose } from "@/components/site/prose";
import type { MediaTextBlock } from "@/lib/cms/types";

export function MediaText({ image, content, imagePosition }: MediaTextBlock) {
  const media = (
    <Image
      src={image.src}
      alt={image.alt}
      width={image.width}
      height={image.height}
      className="h-auto w-full rounded-xl"
    />
  );
  const text = <Prose html={content} />;

  // Source order follows the editor's choice so screen readers and small screens match what they see.
  return (
    <section className="grid items-center gap-8 py-12 md:grid-cols-2">
      {imagePosition === "left" ? (
        <>
          {media}
          {text}
        </>
      ) : (
        <>
          {text}
          {media}
        </>
      )}
    </section>
  );
}
