import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { CmsLink } from "@/components/site/cms-link";
import type { HeroBlock } from "@/lib/cms/types";

export function Hero({ heading, subheading, image, cta }: HeroBlock) {
  return (
    <section className="grid items-center gap-8 py-16 md:grid-cols-2">
      <div className="space-y-4">
        <h1 className="text-4xl font-bold tracking-tight md:text-5xl">{heading}</h1>
        {subheading && <p className="text-lg text-muted-foreground">{subheading}</p>}
        {cta && <CmsLink link={cta} className={buttonVariants({ size: "lg" })} />}
      </div>
      {image && (
        <Image
          src={image.src}
          alt={image.alt}
          width={image.width}
          height={image.height}
          priority
          className="h-auto w-full rounded-xl"
        />
      )}
    </section>
  );
}
