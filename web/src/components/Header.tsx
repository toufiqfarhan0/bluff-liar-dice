import React from "react";
import { ConnectedWallet } from "../lib/wallet";
import { Wordmark } from "./Wordmark";
import { shortKey } from "./Avatar";
import { Flame, LogOut, ShieldCheck, Wallet } from "lucide-react";

export function Header({
  wallet,
  balance,
  onOpenWallet,
  onDisconnect,
  onOpenFairness,
  onGoHome,
  onAirdrop,
}: {
  wallet: ConnectedWallet | null;
  balance: number | null;
  onOpenWallet: () => void;
  onDisconnect: () => void;
  onOpenFairness: () => void;
  onGoHome: () => void;
  onAirdrop?: () => void;
}) {
  return (
    <header className="w-full flex items-center justify-between py-4 px-4 sm:px-6 border-b border-[#2a3122]/50 bg-[#0c0f0b]/80 backdrop-blur-md sticky top-0 z-40">
      <div className="flex items-center gap-4">
        <button
          onClick={onGoHome}
          className="flex items-center cursor-pointer hover:opacity-90 transition-opacity"
        >
          <Wordmark small />
        </button>

        <button
          onClick={onOpenFairness}
          className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-[#98a08e] hover:text-[#FBD53D] bg-[#171b14] border border-[#2a3122] px-3 py-1.5 rounded-full transition-colors cursor-pointer"
        >
          <ShieldCheck className="w-3.5 h-3.5 text-[#FBD53D]" />
          <span>Why this is fair</span>
        </button>
      </div>

      <div className="flex items-center gap-2.5">
        {wallet ? (
          <>
            {/* Quick devnet airdrop button if low on balance */}
            {onAirdrop && (
              <button
                onClick={onAirdrop}
                title="Airdrop 1 Devnet SOL"
                className="hidden sm:flex items-center gap-1 text-xs font-bold text-[#FBD53D] bg-[#201d10] border border-[#FBD53D]/30 hover:border-[#FBD53D] px-2.5 py-1.5 rounded-full transition-all cursor-pointer"
              >
                <Flame className="w-3.5 h-3.5" />
                <span>+1 SOL</span>
              </button>
            )}

            {/* Balance & Wallet details */}
            <div
              onClick={onOpenWallet}
              className="flex items-center gap-2 bg-[#171b14] border border-[#2a3122] hover:border-[#3f4a33] px-3.5 py-1.5 rounded-full cursor-pointer transition-all"
            >
              <div className="w-2 h-2 rounded-full bg-[#FBD53D] shadow-[0_0_6px_#FBD53D]" />
              <span className="font-extrabold text-xs text-[#f1f4ec] tabular-nums">
                {balance !== null ? `${balance.toFixed(2)} ◎` : "… ◎"}
              </span>
              <span className="text-xs font-semibold text-[#98a08e] hidden sm:inline">
                · {shortKey(wallet.address)}
              </span>
            </div>

            <button
              onClick={onDisconnect}
              title="Disconnect"
              className="p-2 text-[#6b7362] hover:text-[#f2603c] hover:bg-[#1f241a] rounded-full transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </>
        ) : (
          <button
            onClick={onOpenWallet}
            className="flex items-center gap-2 bg-[#FBD53D] hover:bg-[#fce06b] text-[#141004] text-xs font-extrabold px-4 py-2 rounded-full shadow-[0_0_15px_-3px_rgba(251, 213, 61,0.35)] transition-all cursor-pointer"
          >
            <Wallet className="w-3.5 h-3.5" />
            <span>Connect Wallet</span>
          </button>
        )}
      </div>
    </header>
  );
}
