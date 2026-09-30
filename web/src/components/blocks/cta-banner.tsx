import { ArrowUpRight } from "lucide-react";
import { BackgroundBeamsWithCollision } from "@/components/ui/background-beams-with-collision";
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient";
import { CmsLink } from "@/components/site/cms-link";
import { Reveal } from "@/components/site/reveal";
import type { CtaBannerBlock } from "@/lib/cms/types";

/**
 * CTA Banner: falling beams that burst on the floor (Aceternity's Background Beams With Collision)
 * and a button with a light that circles its border (Hover Border Gradient).
 */
export function CtaBanner({ heading, text, cta }: CtaBannerBlock) {
  return (
    <section className="container-page py-16 md:py-24">
      <BackgroundBeamsWithCollision className="h-auto rounded-[2rem] border px-6 py-20 md:h-auto md:py-28">
        <Reveal className="relative z-20 mx-auto max-w-2xl space-y-5 text-center">
          <h2 className="text-3xl font-semibold md:text-5xl">{heading}</h2>
          {text && <p className="text-lg text-muted-foreground">{text}</p>}
          {cta && (
            <CmsLink link={cta} className="inline-block rounded-full pt-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
              <HoverBorderGradient as="span" containerClassName="mx-auto" className="flex items-center gap-2 px-6 py-3 font-medium">
                {cta.label}
                <ArrowUpRight aria-hidden className="size-4" />
              </HoverBorderGradient>
            </CmsLink>
          )}
        </Reveal>
      </BackgroundBeamsWithCollision>
    </section>
  );
}
