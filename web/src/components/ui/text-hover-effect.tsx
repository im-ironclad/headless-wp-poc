"use client";
/**
 * Aceternity UI "Text Hover Effect" (https://ui.aceternity.com/components/text-hover-effect), adapted:
 * - the viewBox grows with the text, so any word fits (the original fits about four letters)
 * - heading font and brand gradient instead of Helvetica and a rainbow
 * - outline strokes use the theme foreground, so it works in light and dark
 * - the outline draws in when scrolled into view (the original draws on mount, usually off-screen)
 * - unique SVG ids, so two instances on a page don't clash
 */
import { motion } from "motion/react";
import { useEffect, useId, useRef, useState } from "react";

export const TextHoverEffect = ({ text, duration }: { text: string; duration?: number }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [cursor, setCursor] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);
  const [maskPosition, setMaskPosition] = useState({ cx: "50%", cy: "50%" });
  const id = useId();
  const width = Math.max(300, text.length * 78);

  useEffect(() => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setMaskPosition({
      cx: `${((cursor.x - rect.left) / rect.width) * 100}%`,
      cy: `${((cursor.y - rect.top) / rect.height) * 100}%`,
    });
  }, [cursor]);

  const textProps = {
    x: "50%",
    y: "50%",
    textAnchor: "middle",
    dominantBaseline: "middle",
    strokeWidth: "0.4",
    className: "fill-transparent font-heading text-7xl font-bold",
  } as const;

  return (
    <svg
      ref={svgRef}
      width="100%"
      height="100%"
      viewBox={`0 0 ${width} 100`}
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY })}
      className="select-none"
    >
      <defs>
        <linearGradient id={`${id}-gradient`} gradientUnits="userSpaceOnUse">
          {hovered && (
            <>
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="35%" stopColor="#d946ef" />
              <stop offset="70%" stopColor="#22d3ee" />
              <stop offset="100%" stopColor="#6366f1" />
            </>
          )}
        </linearGradient>
        <motion.radialGradient
          id={`${id}-reveal`}
          gradientUnits="userSpaceOnUse"
          r="20%"
          initial={{ cx: "50%", cy: "50%" }}
          animate={maskPosition}
          transition={{ duration: duration ?? 0, ease: "easeOut" }}
        >
          <stop offset="0%" stopColor="white" />
          <stop offset="100%" stopColor="black" />
        </motion.radialGradient>
        <mask id={`${id}-mask`}>
          <rect x="0" y="0" width="100%" height="100%" fill={`url(#${id}-reveal)`} />
        </mask>
      </defs>
      <text {...textProps} className={`${textProps.className} stroke-foreground/15`} style={{ opacity: hovered ? 0.7 : 0 }}>
        {text}
      </text>
      <motion.text
        {...textProps}
        className={`${textProps.className} stroke-foreground/25`}
        initial={{ strokeDashoffset: 1000, strokeDasharray: 1000 }}
        whileInView={{ strokeDashoffset: 0, strokeDasharray: 1000 }}
        viewport={{ once: true }}
        transition={{ duration: 4, ease: "easeInOut" }}
      >
        {text}
      </motion.text>
      <text {...textProps} stroke={`url(#${id}-gradient)`} mask={`url(#${id}-mask)`}>
        {text}
      </text>
    </svg>
  );
};
