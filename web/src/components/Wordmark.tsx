import React from "react";
import { Dices } from "lucide-react";

export function Wordmark({ small = false }: { small?: boolean }) {
  if (small) {
    return (
      <div className="flex items-center gap-2 select-none">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-[0_0_12px_rgba(249,115,22,0.4)]">
          <Dices className="w-5 h-5 text-black stroke-[2.5]" />
        </div>
        <span
          className="text-xl font-black tracking-tight text-[#faf5f0]"
          style={{ fontFamily: "var(--font-display, sans-serif)" }}
        >
          BLUFF
        </span>
        <sup className="text-[9px] font-mono font-bold text-orange-400 tracking-wider">
          TEE
        </sup>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center select-none space-y-1">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 via-amber-500 to-orange-600 flex items-center justify-center shadow-[0_0_24px_rgba(249,115,22,0.5)]">
          <Dices className="w-7 h-7 text-black stroke-[2.5]" />
        </div>
        <span
          className="text-5xl sm:text-6xl font-black tracking-tighter bg-gradient-to-r from-orange-400 via-amber-300 to-orange-500 bg-clip-text text-transparent drop-shadow-[0_0_24px_rgba(249,115,22,0.4)]"
          style={{ fontFamily: "var(--font-display, sans-serif)" }}
        >
          BLUFF
        </span>
      </div>
      <div className="flex items-center gap-2 text-[10px] font-mono tracking-widest text-[#9c897d] uppercase">
        <span>Solana Devnet</span>
        <span>·</span>
        <span className="text-orange-400">MagicBlock TEE Enclave</span>
      </div>
    </div>
  );
}
