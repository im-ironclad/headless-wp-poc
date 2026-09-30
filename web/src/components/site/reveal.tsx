"use client";
import { motion } from "motion/react";
import type { ReactNode } from "react";

/**
 * Fades and lifts its children in the first time they scroll into view.
 * A small client island: the Block around it stays a Server Component.
 * With reduced motion (see Providers) the lift is skipped and only the fade remains.
 */
export function Reveal({ children, className, delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-64px" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
