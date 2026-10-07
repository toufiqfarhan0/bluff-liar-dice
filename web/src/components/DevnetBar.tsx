import React from "react";
import { Activity, Flame, Shield } from "lucide-react";

export function DevnetBar({
  onAirdrop,
  airdropping,
  activeRoom,
}: {
  onAirdrop: () => void;
  airdropping: boolean;
  activeRoom?: string | null;
}) {
  return (
    <div className="w-full bg-[#12160f] border-t border-[#2a3122]/60 py-2 px-4 text-[11px] text-[#6b7362] flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#c9f24a] animate-pulse" />
          <span className="font-semibold text-[#98a08e]">MagicBlock Devnet TEE</span>
        </span>

        {activeRoom && (
          <span className="hidden sm:inline font-mono text-[#98a08e]">
            Room: {activeRoom}
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onAirdrop}
          disabled={airdropping}
          className="flex items-center gap-1 text-[#c9f24a] hover:underline cursor-pointer disabled:opacity-50"
        >
          <Flame className="w-3 h-3" />
          <span>{airdropping ? "Airdropping 1 SOL…" : "Free Devnet Faucet"}</span>
        </button>
      </div>
    </div>
  );
}
