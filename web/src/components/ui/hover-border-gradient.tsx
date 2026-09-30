"use client";
// Aceternity UI "Hover Border Gradient", recoloured: a fuchsia light circles a primary-coloured button.
import React, { useState, useEffect } from "react";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

type Direction = "TOP" | "LEFT" | "BOTTOM" | "RIGHT";

export function HoverBorderGradient({
  children,
  containerClassName,
  className,
  as: Tag = "button",
  duration = 1,
  clockwise = true,
  ...props
}: React.PropsWithChildren<
  {
    as?: React.ElementType;
    containerClassName?: string;
    className?: string;
    duration?: number;
    clockwise?: boolean;
  } & React.HTMLAttributes<HTMLElement>
>) {
  const [hovered, setHovered] = useState<boolean>(false);
  const [direction, setDirection] = useState<Direction>("TOP");

  const movingMap: Record<Direction, string> = {
    TOP: "radial-gradient(20.7% 50% at 50% 0%, #d946ef 0%, rgba(217, 70, 239, 0) 100%)",
    LEFT: "radial-gradient(16.6% 43.1% at 0% 50%, #d946ef 0%, rgba(217, 70, 239, 0) 100%)",
    BOTTOM:
      "radial-gradient(20.7% 50% at 50% 100%, #d946ef 0%, rgba(217, 70, 239, 0) 100%)",
    RIGHT:
      "radial-gradient(16.2% 41.199999999999996% at 100% 50%, #d946ef 0%, rgba(217, 70, 239, 0) 100%)",
  };

  const highlight =
    "radial-gradient(75% 181.15942028985506% at 50% 50%, #8b5cf6 0%, rgba(255, 255, 255, 0) 100%)";

  useEffect(() => {
    if (hovered) return;
    const directions: Direction[] = ["TOP", "LEFT", "BOTTOM", "RIGHT"];
    const rotateDirection = (current: Direction): Direction => {
      const index = directions.indexOf(current);
      return directions[clockwise ? (index - 1 + directions.length) % directions.length : (index + 1) % directions.length];
    };
    const interval = setInterval(() => setDirection(rotateDirection), duration * 1000);
    return () => clearInterval(interval);
  }, [hovered, duration, clockwise]);
  return (
    <Tag
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={cn(
        "relative flex rounded-full border content-center bg-foreground/10 hover:bg-foreground/5 transition duration-500 items-center flex-col flex-nowrap gap-10 h-min justify-center overflow-visible p-px decoration-clone w-fit",
        containerClassName
      )}
      {...props}
    >
      <div
        className={cn(
          "w-auto z-10 bg-primary text-primary-foreground px-4 py-2 rounded-[inherit]",
          className
        )}
      >
        {children}
      </div>
      <motion.div
        className={cn(
          "flex-none inset-0 overflow-hidden absolute z-0 rounded-[inherit]"
        )}
        style={{
          filter: "blur(2px)",
          position: "absolute",
          width: "100%",
          height: "100%",
        }}
        initial={{ background: movingMap[direction] }}
        animate={{
          background: hovered
            ? [movingMap[direction], highlight]
            : movingMap[direction],
        }}
        transition={{ ease: "linear", duration: duration ?? 1 }}
      />
      <div className="bg-primary absolute z-1 flex-none inset-[2px] rounded-[100px]" />
    </Tag>
  );
}
