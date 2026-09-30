import { ArrowRight } from "lucide-react";
import Image from "next/image";
import { buttonVariants } from "@/components/ui/button";
import { Spotlight } from "@/components/ui/spotlight-new";
import { CmsLink } from "@/components/site/cms-link";
import type { HeroBlock } from "@/lib/cms/types";
import { cn } from "@/lib/utils";

// Violet light beams. Visible in both themes, unlike Aceternity's default pale blue.
const beam = (alpha: number) =>
  `radial-gradient(50% 50% at 50% 50%, hsla(265, 100%, 70%, ${alpha}) 0, hsla(265, 100%, 60%, ${alpha / 4}) 80%, transparent 100%)`;

/**
 * Hero: a CSS grid and glow (no JavaScript) plus Aceternity's Spotlight (a small client island).
 * The heading and image aren't animated in, so they paint immediately (they're the LCP element).
 */
export function Hero({ heading, subheading, image, cta }: HeroBlock) {
  return (
    // As the first Block, the background runs up under the (transparent) header.
    <section className="relative isolate overflow-hidden first:-mt-18 first:pt-18">
      <div aria-hidden className="bg-grid absolute inset-0 -z-10" />
      <div aria-hidden className="absolute left-1/2 top-0 -z-10 h-[28rem] w-[min(56rem,100%)] -translate-x-1/2 rounded-full bg-glow blur-3xl" />
      <div aria-hidden className="absolute inset-0 -z-10">
        <Spotlight
          gradientFirst={`radial-gradient(68.54% 68.72% at 55.02% 31.46%, hsla(265, 100%, 80%, .14) 0, hsla(265, 100%, 60%, .04) 50%, transparent 80%)`}
          gradientSecond={beam(0.1)}
          gradientThird={beam(0.08)}
        />
      </div>

      <div className="container-page grid items-center gap-12 py-20 md:py-28 lg:grid-cols-[1.15fr_1fr]">
        <div className="space-y-6">
          <h1 className="bg-linear-to-b from-foreground to-foreground/65 bg-clip-text pb-1 text-4xl font-semibold leading-[1.08] text-transparent sm:text-5xl lg:text-6xl">
            {heading}
          </h1>
          {subheading && <p className="max-w-xl text-lg leading-relaxed text-muted-foreground">{subheading}</p>}
          {cta && (
            <CmsLink link={cta} className={cn(buttonVariants({ size: "lg" }), "h-11 gap-2 rounded-full px-6 text-base shadow-lg shadow-primary/25")}>
              {cta.label}
              <ArrowRight aria-hidden />
            </CmsLink>
          )}
        </div>
        {image && (
          <div className="relative">
            <div aria-hidden className="absolute -inset-6 rounded-[2.5rem] bg-linear-to-tr from-brand-violet via-brand-fuchsia to-brand-cyan opacity-25 blur-3xl" />
            <div className="relative rounded-[1.75rem] border bg-card/60 p-2 shadow-2xl backdrop-blur">
              <Image
                src={image.src}
                alt={image.alt}
                width={image.width}
                height={image.height}
                priority
                sizes="(min-width: 1024px) 40vw, 100vw"
                className="h-auto w-full rounded-[1.25rem]"
              />
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
