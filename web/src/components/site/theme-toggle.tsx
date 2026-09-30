"use client";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

/**
 * Switches between light and dark. The icon is chosen with CSS (`dark:`), not from state,
 * so server and client render the same markup and there's no hydration mismatch.
 */
export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  return (
    <button
      type="button"
      aria-label="Toggle theme"
      onClick={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
      className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition hover:bg-muted hover:text-foreground"
    >
      <Sun className="size-4.5 dark:hidden" />
      <Moon className="hidden size-4.5 dark:block" />
    </button>
  );
}
