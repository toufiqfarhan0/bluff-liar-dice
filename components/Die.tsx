import React from "react";
import { DieFace, faceName } from "../lib/dice";

export const DIE_DOTS: Record<DieFace, Array<{ cx: number; cy: number; r?: number }>> = {
  1: [{ cx: 50, cy: 50, r: 8.5 }],
  2: [
    { cx: 32, cy: 32, r: 8 },
    { cx: 68, cy: 68, r: 8 },
  ],
  3: [
    { cx: 30, cy: 30, r: 8 },
    { cx: 50, cy: 50, r: 8 },
    { cx: 70, cy: 70, r: 8 },
  ],
  4: [
    { cx: 32, cy: 32, r: 8 },
    { cx: 68, cy: 32, r: 8 },
    { cx: 32, cy: 68, r: 8 },
    { cx: 68, cy: 68, r: 8 },
  ],
  5: [
    { cx: 30, cy: 30, r: 7.5 },
    { cx: 70, cy: 30, r: 7.5 },
    { cx: 50, cy: 50, r: 7.5 },
    { cx: 30, cy: 70, r: 7.5 },
    { cx: 70, cy: 70, r: 7.5 },
  ],
  6: [
    { cx: 32, cy: 28, r: 7.5 },
    { cx: 32, cy: 50, r: 7.5 },
    { cx: 32, cy: 72, r: 7.5 },
    { cx: 68, cy: 28, r: 7.5 },
    { cx: 68, cy: 50, r: 7.5 },
    { cx: 68, cy: 72, r: 7.5 },
  ],
};

/**
 * Pure SVG Ivory Die with dark pips - standard visual identity across entire app.
 */
export function DieIcon({
  face,
  className = "w-full h-full",
}: {
  face: DieFace;
  className?: string;
}) {
  const dots = DIE_DOTS[face] || DIE_DOTS[1];

  return (
    <svg
      viewBox="0 0 100 100"
      className={`select-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.35)] ${className}`}
    >
      <rect
        x="8"
        y="8"
        width="84"
        height="84"
        rx="24"
        fill="#f2ede4"
        stroke="#ded6c5"
        strokeWidth="2"
      />
      {dots.map((d, i) => (
        <circle key={i} cx={d.cx} cy={d.cy} r={d.r ?? 8} fill="#1a1d18" />
      ))}
    </svg>
  );
}

/**
 * Standard game die item tile used in DiceTray, Showdown, and player displays.
 */
export function DieItem({
  face,
  highlighted = false,
  size = "md",
}: {
  face: DieFace;
  highlighted?: boolean;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}) {
  const sizeClasses = {
    xs: "w-6 h-6 rounded-lg",
    sm: "w-8 h-8 rounded-xl",
    md: "w-11 h-11 rounded-2xl",
    lg: "w-14 h-14 rounded-2xl",
    xl: "w-16 h-16 rounded-3xl",
  }[size];

  return (
    <div
      title={faceName(face)}
      className={`relative select-none flex items-center justify-center p-0.5 transition-all duration-200 ${sizeClasses} ${
        highlighted
          ? "ring-2 ring-[#FBD53D] shadow-[0_0_16px_rgba(251,213,61,0.55)] scale-105"
          : "hover:scale-105"
      }`}
    >
      <DieIcon face={face} className="w-full h-full" />
    </div>
  );
}
