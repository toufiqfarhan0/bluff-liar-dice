import React from "react";

export const PALETTE = ["#f97316", "#f59e0b", "#fb923c", "#ef4444", "#fbbf24", "#ea580c"];

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
        className={`relative flex items-center justify-center rounded-full bg-[#1c120c] transition-all duration-200 select-none ${
          you ? "ring-2 ring-orange-500 shadow-[0_0_14px_rgba(249,115,22,0.45)]" : ""
        }`}
        style={{
          width: size,
          height: size,
          border: you ? `2.5px solid #f97316` : `2px solid ${ring}`,
        }}
        title={`${displayName} (${who})`}
      >
        <span
          className="font-extrabold uppercase"
          style={{
            fontSize: Math.max(10, size * 0.4),
            color: out ? "#6e5e54" : you ? "#fb923c" : ring,
          }}
        >
          {initial(name ?? who)}
        </span>
        {you && (
          <span className="absolute -bottom-1 -right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-[8px] font-black text-orange-950">
            ✓
          </span>
        )}
      </div>

      {showName && (
        <span
          className={`text-[11px] font-semibold truncate max-w-[70px] text-center ${
            out ? "text-[#6e5e54] line-through" : you ? "text-orange-400" : "#a69488"
          }`}
        >
          {you ? "You" : displayName}
        </span>
      )}
    </div>
  );
}
