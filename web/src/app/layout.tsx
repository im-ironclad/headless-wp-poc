import type { Metadata } from "next";
import { Inter, Unbounded } from "next/font/google";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { Providers } from "@/components/site/providers";
import { getGlobals } from "@/lib/cms";
import "./globals.css";

// Self-hosted at build time by next/font: no request to Google, no layout shift.
const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const unbounded = Unbounded({ variable: "--font-unbounded", subsets: ["latin"] });

export async function generateMetadata(): Promise<Metadata> {
  const { siteName = "Headless WP" } = await getGlobals();
  return { title: { template: `%s | ${siteName}`, default: siteName } };
}

/** Globals (Primary Menu + Site Settings) are fetched once here, cached under the "globals" tag. */
export default async function RootLayout({ children }: LayoutProps<"/">) {
  const globals = await getGlobals();
  return (
    // suppressHydrationWarning: next-themes sets the theme class on <html> before React hydrates.
    <html lang="en" className={`${inter.variable} ${unbounded.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="flex min-h-full flex-col">
        <Providers>
          <Header globals={globals} />
          {/* Full width: each Block Component sets its own width, so backgrounds can run edge to edge. */}
          <main className="flex-1">{children}</main>
          <Footer globals={globals} />
        </Providers>
      </body>
    </html>
  );
}
