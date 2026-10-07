import React from "react";

export function Pips({ round, total = 12 }: { round: number; total?: number }) {
  const count = Math.max(round, Math.min(total, round + 2));

  return (
    <div className="flex items-center gap-1.5" title={`Round ${round} of ${total}`}>
      {Array.from({ length: count }, (_, i) => {
        const isCurrent = i === round - 1;
        const isPast = i < round - 1;

        return (
          <div
            key={i}
            className={`h-2 rounded-full transition-all duration-300 ${
              isCurrent
                ? "w-5 bg-[#c9f24a] shadow-[0_0_8px_rgba(201,242,74,0.6)]"
                : isPast
                  ? "w-2 bg-[#c9f24a]/80"
                  : "w-2 bg-[#2a3122]"
            }`}
          />
        );
      })}
    </div>
  );
}
