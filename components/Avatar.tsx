import React from "react";

export const PALETTE = ["#f2a33c", "#5db8f0", "#e86f9e", "#a98cf5", "#5fd39a", "#f2603c"];

export function tint(key: string): string {
  let n = 0;
  for (const c of key.slice(0, 8)) n += c.charCodeAt(0);
  return PALETTE[n % PALETTE.length];
}

export function shortKey(k: string): string {
  if (!k || k.length < 10) return k;
  return `${k.slice(0, 4)}…${k.slice(-4)}`;
}

export function initial(name: string): string {
  const letter = name.split("").find((c) => /[a-z]/i.test(c));
  return (letter ?? name[0] ?? "?").toUpperCase();
}

export function Avatar({
  who,
  name,
  size = 36,
  out = false,
  you = false,
  showName = false,
}: {
  who: string;
  name?: string;
  size?: number;
  out?: boolean;
  you?: boolean;
  showName?: boolean;
}) {
  const ring = tint(who);
  const displayName = name ?? shortKey(who);

  return (
    <div className={`flex flex-col items-center gap-1 ${out ? "opacity-45" : ""}`}>
      <div
        className={`relative flex items-center justify-center rounded-full bg-[#1f241a] transition-all duration-200 select-none ${
          you ? "ring-2 ring-[#FBD53D] shadow-[0_0_12px_rgba(251, 213, 61,0.35)]" : ""
        }`}
        style={{
          width: size,
          height: size,
          border: you ? `2.5px solid #FBD53D` : `2px solid ${ring}`,
        }}
        title={`${displayName} (${who})`}
      >
        <span
          className="font-extrabold uppercase"
          style={{
            fontSize: Math.max(10, size * 0.4),
            color: out ? "#6b7362" : you ? "#FBD53D" : ring,
          }}
        >
          {initial(name ?? who)}
        </span>
        {you && (
          <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-[#FBD53D] text-[8px] font-black text-[#141004]">
            ✓
          </span>
        )}
      </div>

      {showName && (
        <span
          className={`text-[11px] font-semibold truncate max-w-[70px] text-center ${
            out ? "text-[#6b7362] line-through" : you ? "text-[#FBD53D]" : "text-[#98a08e]"
          }`}
        >
          {you ? "You" : displayName}
        </span>
      )}
    </div>
  );
}
