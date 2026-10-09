import React from "react";
import { Check, ShieldCheck, X } from "lucide-react";

interface Guarantee {
  title: string;
  body: string;
  by: string;
  badgeBg: string;
  badgeText: string;
}

export const GUARANTEES: Guarantee[] = [
  {
    title: "Nobody sees your dice",
    body: "Not other players, not the host, not us. Your dice are encrypted inside hardware enclaves and only decrypted on Showdown.",
    by: "PRIVATE ROLLUP (TEE)",
    badgeBg: "bg-[#241d3d]",
    badgeText: "text-[#b9a9ff]",
  },
  {
    title: "Friends can't sit together",
    body: "Public rooms are dealt from a queue. You don't pick your table, so nobody can stack one.",
    by: "VRF ORACLE",
    badgeBg: "bg-[#2b2a12]",
    badgeText: "text-[#FBD53D]",
  },
  {
    title: "The coin can't be rigged",
    body: "If the last two flip for the pot, verifiable randomness decides — nobody can predict or choose it.",
    by: "VRF ORACLE",
    badgeBg: "bg-[#2b2a12]",
    badgeText: "text-[#FBD53D]",
  },
  {
    title: "Your stake never leaves Solana",
    body: "The rollup runs fast sealed gameplay. Stakes sit securely in a Solana vault PDA it cannot touch.",
    by: "SOLANA VAULT PDA",
    badgeBg: "bg-[#12291f]",
    badgeText: "text-[#5fd39a]",
  },
  {
    title: "You can always get it back",
    body: "Leave before a game starts and your stake refunds immediately. An abandoned game can be settled by anyone.",
    by: "ON CHAIN",
    badgeBg: "bg-[#13243a]",
    badgeText: "text-[#7bb6f0]",
  },
  {
    title: "Playing costs no signature",
    body: "Approve once when sitting down. The session key that bids is throwaway and can never touch money.",
    by: "SESSION KEYS",
    badgeBg: "bg-[#2f2113]",
    badgeText: "text-[#e8a765]",
  },
];

export function FairnessModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-lg bg-[#0c0f0b] border border-[#2a3122] rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#6b7362] hover:text-[#f1f4ec] hover:bg-[#1f241a] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <ShieldCheck className="w-7 h-7 text-[#FBD53D]" />
          <h2 className="text-2xl sm:text-3xl font-black italic tracking-tight text-[#f1f4ec]">
            Why this is fair
          </h2>
        </div>
        <p className="text-sm text-[#98a08e] leading-relaxed mb-6">
          Six ways games like this are usually rigged — and what cryptographically prevents each one in Bluff.
        </p>

        <div className="space-y-4 mb-6">
          {GUARANTEES.map((g) => (
            <div
              key={g.title}
              className="p-3.5 bg-[#171b14] border border-[#232a1b] rounded-2xl space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[9.5px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded ${g.badgeBg} ${g.badgeText}`}
                >
                  {g.by}
                </span>
                <Check className="w-4 h-4 text-[#FBD53D]" />
              </div>
              <h3 className="text-sm font-bold text-[#f1f4ec]">{g.title}</h3>
              <p className="text-xs text-[#98a08e] leading-relaxed">{g.body}</p>
            </div>
          ))}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-full font-extrabold text-[#141004] bg-[#FBD53D] hover:bg-[#fce06b] text-base tracking-wide shadow-[0_4px_20px_-4px_rgba(251,213,61,0.35)] hover:shadow-[0_4px_28px_-2px_rgba(251,213,61,0.5)] transition-all cursor-pointer active:scale-[0.98] select-none"
        >
          Got it
        </button>
      </div>
    </div>
  );
}

export function GuardBar({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-full hover:bg-[#141910] transition-all cursor-pointer group text-xs text-[#828c77]"
    >
      <ShieldCheck className="w-3.5 h-3.5 text-[#5fd39a] group-hover:text-[#FBD53D] transition-colors shrink-0" />
      <span>Protected by MagicBlock Private TEE ·</span>
      <span className="text-[#FBD53D] font-bold group-hover:underline">How it works</span>
    </button>
  );
}
