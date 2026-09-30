"use client";
import { MotionConfig } from "motion/react";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";

/**
 * Client-side context for the whole site:
 * - next-themes toggles the `.dark` class on <html> (default: follow the OS setting)
 * - MotionConfig turns off transform/layout animations for people who prefer reduced motion
 */
// next-themes' inline script sets the theme before first paint. It only needs to run from the server HTML;
// when React re-renders it on the client (e.g. the 404 page), a non-JS type stops React 19's
// "Encountered a script tag" dev warning. The server copy has already run by then.
const scriptProps =
  typeof window === "undefined" ? undefined : ({ type: "application/json", suppressHydrationWarning: true } as const);

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange scriptProps={scriptProps}>
      <MotionConfig reducedMotion="user">{children}</MotionConfig>
    </ThemeProvider>
  );
}
