import Image from "next/image";
import { CardBody, CardContainer, CardItem } from "@/components/ui/3d-card";
import { Prose } from "@/components/site/prose";
import { Reveal } from "@/components/site/reveal";
import type { MediaTextBlock } from "@/lib/cms/types";

/** Media + Text: the image tilts in 3D towards the cursor (Aceternity's 3D Card Effect). */
export function MediaText({ image, content, imagePosition }: MediaTextBlock) {
  const media = (
    <CardContainer containerClassName="py-0" className="w-full">
      <CardBody className="size-auto w-full">
        <CardItem translateZ={50} className="w-full">
          <div className="rounded-[1.75rem] border bg-card p-2 shadow-xl shadow-primary/10">
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width}
              height={image.height}
              sizes="(min-width: 768px) 50vw, 100vw"
              className="h-auto w-full rounded-[1.25rem]"
            />
          </div>
        </CardItem>
      </CardBody>
    </CardContainer>
  );
  const text = (
    <Reveal>
      <Prose html={content} className="md:prose-lg" />
    </Reveal>
  );

  // Source order follows the editor's choice so screen readers and small screens match what they see.
  return (
    <section className="container-page grid items-center gap-10 py-16 md:grid-cols-2 md:py-24 lg:gap-16">
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
