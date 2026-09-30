import { buttonVariants } from "@/components/ui/button";
import { CmsLink } from "@/components/site/cms-link";
import type { CtaBannerBlock } from "@/lib/cms/types";

export function CtaBanner({ heading, text, cta }: CtaBannerBlock) {
  return (
    <section className="my-12 flex flex-col items-start gap-4 rounded-xl bg-primary p-8 text-primary-foreground md:flex-row md:items-center md:justify-between">
      <div className="space-y-1">
        <h2 className="text-2xl font-semibold">{heading}</h2>
        {text && <p className="opacity-80">{text}</p>}
      </div>
      {cta && <CmsLink link={cta} className={buttonVariants({ variant: "secondary", size: "lg" })} />}
    </section>
  );
}
