import React from "react";
import { ConnectedWallet } from "../lib/wallet";
import { shortKey } from "./Avatar";
import { Flame, LogOut } from "lucide-react";

export type NavTab = "home" | "practice" | "rules";

export function Header({
  wallet,
  balance,
  activeTab,
  onSelectTab,
  onOpenWallet,
  onDisconnect,
  onAirdrop,
}: {
  wallet: ConnectedWallet | null;
  balance: number | null;
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  onOpenWallet: () => void;
  onDisconnect: () => void;
  onAirdrop?: () => void;
}) {
  return (
    <header className="sticky top-0 z-30 border-b border-white/5 bg-[#05070d]/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6">
        {/* Brand logo & title matching FHE Liar's Dice */}
        <button
          onClick={() => onSelectTab("home")}
          className="flex items-center gap-2.5 text-sm font-semibold tracking-wide text-slate-100 hover:text-white transition cursor-pointer"
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <rect
              x="4"
              y="4"
              width="56"
              height="56"
              rx="14"
              fill="#070a0f"
              stroke="#f97316"
              strokeWidth="4"
            />
            <circle cx="32" cy="32" r="9" fill="#f97316" />
          </svg>
          <span className="font-bold tracking-wider">BLUFF LIAR'S DICE</span>
        </button>

        {/* Navigation Links: Home, Practice, Rules */}
        <nav className="order-3 flex w-full gap-5 text-sm text-slate-400 sm:order-none sm:w-auto sm:gap-6">
          <button
            onClick={() => onSelectTab("home")}
            className={`transition cursor-pointer ${
              activeTab === "home"
                ? "text-slate-100 font-medium"
                : "text-slate-400 hover:text-slate-100"
            }`}
          >
            Home
          </button>
          <button
            onClick={() => onSelectTab("practice")}
            className={`transition cursor-pointer ${
              activeTab === "practice"
                ? "text-slate-100 font-medium"
                : "text-slate-400 hover:text-slate-100"
            }`}
          >
            Practice
          </button>
          <button
            onClick={() => onSelectTab("rules")}
            className={`transition cursor-pointer ${
              activeTab === "rules"
                ? "text-slate-100 font-medium"
                : "text-slate-400 hover:text-slate-100"
            }`}
          >
            Rules
          </button>
        </nav>

        {/* Right side Wallet & Status */}
        <div className="flex items-center gap-2.5">
          {wallet ? (
            <>
              {onAirdrop && (
                <button
                  onClick={onAirdrop}
                  title="Airdrop 1 Devnet SOL"
                  className="hidden sm:flex items-center gap-1 text-xs font-semibold text-orange-400 bg-orange-500/10 border border-orange-500/30 hover:border-orange-500 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                >
                  <Flame className="w-3.5 h-3.5 text-orange-400" />
                  <span>+1 SOL</span>
                </button>
              )}

              <button
                onClick={onOpenWallet}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-200 hover:border-white/20 transition cursor-pointer"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="font-mono text-orange-400 font-bold tabular-nums">
                  {balance !== null ? `${balance.toFixed(2)} ◎` : "… ◎"}
                </span>
                <span className="text-slate-400 hidden sm:inline">
                  · {shortKey(wallet.address)}
                </span>
              </button>

              <button
                onClick={onDisconnect}
                title="Disconnect"
                className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={onOpenWallet}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-500 cursor-pointer"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
