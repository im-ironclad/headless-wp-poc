import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { FeatureGridBlock } from "@/lib/cms/types";

export function FeatureGrid({ heading, features }: FeatureGridBlock) {
  return (
    <section className="space-y-8 py-12">
      {heading && <h2 className="text-center text-3xl font-semibold">{heading}</h2>}
      <ul className="grid gap-6 md:grid-cols-3">
        {features.map((feature, index) => (
          <li key={index}>
            <Card className="h-full">
              {feature.image && (
                <Image
                  src={feature.image.src}
                  alt={feature.image.alt}
                  width={feature.image.width}
                  height={feature.image.height}
                  className="aspect-video w-full object-cover"
                />
              )}
              <CardHeader>
                <h3 className="text-lg font-medium">{feature.title}</h3>
              </CardHeader>
              {feature.text && <CardContent className="text-muted-foreground">{feature.text}</CardContent>}
            </Card>
          </li>
        ))}
      </ul>
    </section>
  );
}
