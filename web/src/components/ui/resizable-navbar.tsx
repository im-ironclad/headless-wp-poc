"use client";
/**
 * Aceternity UI "Resizable Navbar" (https://ui.aceternity.com/components/resizable-navbar),
 * adapted for this site:
 * - colours come from the theme tokens (works in light and dark)
 * - one bar for every screen size (the original renders separate desktop and mobile bars)
 * - the body shrinks with max-width instead of `width: 40%` + `min-width: 800px`, so mid-size screens don't overflow
 * - the mobile toggle is a real <button> with aria-expanded (the original is a clickable icon)
 * - lucide icons instead of @tabler/icons-react
 * Link rendering is left to the caller, so this stays unaware of the CMS.
 */
import { cn } from "@/lib/utils";
import { Menu, X } from "lucide-react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from "motion/react";
import React, { useState } from "react";

const floatingShadow =
  "0 0 24px rgba(34, 42, 53, 0.06), 0 1px 1px rgba(0, 0, 0, 0.05), 0 0 0 1px rgba(34, 42, 53, 0.04), 0 0 4px rgba(34, 42, 53, 0.08), 0 16px 68px rgba(47, 48, 55, 0.05), 0 1px 0 rgba(255, 255, 255, 0.1) inset";

/** Sticky wrapper. Tells its children when the page has scrolled, so they can shrink into a floating pill. */
export const Navbar = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  const { scrollY } = useScroll();
  const [visible, setVisible] = useState(false);

  useMotionValueEvent(scrollY, "change", (latest) => setVisible(latest > 80));

  return (
    <div className={cn("sticky inset-x-0 top-0 z-40 w-full pt-3", className)}>
      {React.Children.map(children, (child) =>
        React.isValidElement(child)
          ? React.cloneElement(child as React.ReactElement<{ visible?: boolean }>, { visible })
          : child,
      )}
    </div>
  );
};

/** The bar itself: full width at the top of the page, a floating pill once scrolled. */
export const NavBody = ({
  children,
  className,
  visible,
}: {
  children: React.ReactNode;
  className?: string;
  visible?: boolean;
}) => (
  <motion.div
    animate={{
      backdropFilter: visible ? "blur(12px)" : "blur(0px)",
      boxShadow: visible ? floatingShadow : "none",
      maxWidth: visible ? "56rem" : "72rem",
      y: visible ? 8 : 0,
    }}
    transition={{ type: "spring", stiffness: 200, damping: 50 }}
    className={cn(
      "relative z-[60] mx-auto flex w-[calc(100%-2rem)] items-center justify-between gap-4 rounded-full border border-transparent py-2 pl-4 pr-2",
      visible && "border-border bg-background/75",
      className,
    )}
  >
    {children}
  </motion.div>
);

export const MobileNavMenu = ({
  children,
  className,
  isOpen,
  id,
}: {
  children: React.ReactNode;
  className?: string;
  isOpen: boolean;
  id?: string;
}) => (
  <AnimatePresence>
    {isOpen && (
      <motion.div
        id={id}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        className={cn(
          "absolute inset-x-0 top-full mt-2 z-50 flex w-full flex-col items-start gap-4 rounded-2xl border bg-popover px-4 py-6 text-popover-foreground shadow-xl",
          className,
        )}
      >
        {children}
      </motion.div>
    )}
  </AnimatePresence>
);

export const MobileNavToggle = ({
  isOpen,
  onClick,
  controls,
}: {
  isOpen: boolean;
  onClick: () => void;
  /** id of the menu this button shows and hides. */
  controls?: string;
}) => (
  <button
    type="button"
    onClick={onClick}
    aria-expanded={isOpen}
    aria-controls={controls}
    aria-label={isOpen ? "Close menu" : "Open menu"}
    className="inline-flex size-9 items-center justify-center rounded-full text-foreground transition hover:bg-muted"
  >
    {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
  </button>
);
