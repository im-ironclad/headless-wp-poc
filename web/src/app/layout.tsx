import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Footer } from "@/components/site/footer";
import { Header } from "@/components/site/header";
import { getGlobals } from "@/lib/cms";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { template: "%s | Headless WP", default: "Headless WP" },
};

/** Globals (Primary Menu + Site Settings) are fetched once here, cached under the "globals" tag. */
export default async function RootLayout({ children }: LayoutProps<"/">) {
  const globals = await getGlobals();
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Header globals={globals} />
        <main className="mx-auto w-full max-w-6xl flex-1 px-4">{children}</main>
        <Footer globals={globals} />
      </body>
    </html>
  );
}
