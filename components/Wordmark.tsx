import React from "react";

export function Wordmark({ small = false }: { small?: boolean }) {
  return (
    <div className="flex items-center gap-3.5 sm:gap-4 select-none">
      <span
        className={`font-black tracking-wider text-[#FBD53D] drop-shadow-[0_0_16px_rgba(251,213,61,0.4)] ${
          small ? "text-2xl" : "text-5xl sm:text-6xl"
        }`}
        style={{ fontFamily: "var(--font-display, sans-serif)", letterSpacing: small ? "0.05em" : "0.08em" }}
      >
        BLUFF
      </span>
      {!small && (
        <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-[#FBD53D] bg-[#FBD53D]/10 border border-[#FBD53D]/40 shadow-[0_0_14px_rgba(251,213,61,0.35)] px-2.5 py-0.5 rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FBD53D] shadow-[0_0_8px_#FBD53D] animate-pulse" />
          Devnet
        </span>
      )}
    </div>
  );
}
