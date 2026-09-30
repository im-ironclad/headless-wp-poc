import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function NotFound() {
  return (
    <section className="relative isolate overflow-hidden">
      <div aria-hidden className="bg-grid absolute inset-0 -z-10" />
      <div className="container-page flex flex-col items-center gap-6 py-32 text-center">
        <p className="text-gradient font-heading text-7xl font-bold md:text-9xl">404</p>
        <h1 className="text-2xl font-semibold md:text-3xl">This page doesn&apos;t exist</h1>
        <p className="max-w-md text-muted-foreground">It may have been moved, unpublished or renamed in WordPress.</p>
        <Link href="/" className={cn(buttonVariants({ size: "lg" }), "h-11 rounded-full px-6")}>
          Back to home
        </Link>
      </div>
    </section>
  );
}
