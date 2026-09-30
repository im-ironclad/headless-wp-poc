import Image from "next/image";
import { GlowingEffect } from "@/components/ui/glowing-effect";
import { Reveal } from "@/components/site/reveal";
import type { FeatureGridBlock } from "@/lib/cms/types";
import { cn } from "@/lib/utils";

/**
 * Bento layout on large screens, in groups of three: one tall card beside two wide ones.
 * Leftovers fill the row. Works for any number of features, because editors choose how many.
 */
function bentoSpan(index: number, count: number) {
  const remaining = count - (index - (index % 3));
  const position = index % 3;
  if (remaining >= 3) return position === 0 ? "lg:row-span-2" : "lg:col-span-2";
  if (remaining === 2) return position === 0 ? "lg:col-span-2" : "";
  return "lg:col-span-3";
}

/** Feature Grid: bento cards with Aceternity's Glowing Effect, a border glow that follows the cursor. */
export function FeatureGrid({ heading, features }: FeatureGridBlock) {
  return (
    <section className="container-page py-16 md:py-24">
      {heading && (
        <h2 className="mx-auto mb-12 max-w-2xl text-center text-3xl font-semibold md:text-4xl">{heading}</h2>
      )}
      <ul className="grid gap-4 md:grid-cols-2 lg:auto-rows-[minmax(16rem,auto)] lg:grid-cols-3">
        {features.map((feature, index) => (
          <li key={index} className={cn("relative rounded-[1.75rem] border p-2", bentoSpan(index, features.length))}>
            <GlowingEffect spread={40} glow disabled={false} proximity={64} inactiveZone={0.01} borderWidth={2} />
            <Reveal delay={index * 0.08} className="relative flex h-full flex-col gap-5 overflow-hidden rounded-[1.25rem] border bg-card p-4 shadow-sm">
              {feature.image && (
                <div className="relative min-h-40 flex-1 overflow-hidden rounded-xl">
                  <Image
                    src={feature.image.src}
                    alt={feature.image.alt}
                    fill
                    sizes="(min-width: 1024px) 40vw, (min-width: 768px) 50vw, 100vw"
                    className="object-cover"
                  />
                </div>
              )}
              <div className="space-y-2 px-1 pb-1">
                <h3 className="text-lg font-semibold">{feature.title}</h3>
                {feature.text && <p className="text-sm leading-relaxed text-muted-foreground">{feature.text}</p>}
              </div>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
