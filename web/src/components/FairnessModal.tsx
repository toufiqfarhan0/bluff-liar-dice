import React from "react";
import { Check, ShieldCheck, X } from "lucide-react";
import { Button } from "./Button";

interface Guarantee {
  title: string;
  body: string;
  by: string;
  badgeBg: string;
  badgeText: string;
}

const GUARANTEES: Guarantee[] = [
  {
    title: "Nobody sees your dice",
    body: "Not opponents, not the host, not validators. Your dice are encrypted inside hardware enclaves and only decrypted on Showdown.",
    by: "Private Rollup (TEE)",
    badgeBg: "bg-orange-950/60",
    badgeText: "text-orange-400",
  },
  {
    title: "Verifiable fair dice rolls",
    body: "Dice rolls are generated using on-chain verifiable randomness (VRF) — nobody can predict or manipulate them.",
    by: "VRF Oracle",
    badgeBg: "bg-amber-950/60",
    badgeText: "text-amber-400",
  },
  {
    title: "Simultaneous cup showdown",
    body: "When someone calls 'Bluff!', all cups lift at the exact same millisecond. No player can alter or peek early.",
    by: "Private Rollup (TEE)",
    badgeBg: "bg-orange-950/60",
    badgeText: "text-orange-400",
  },
  {
    title: "Your stake never leaves Solana",
    body: "The rollup runs fast gameplay. Stakes sit securely in a Solana L1 vault PDA it cannot touch.",
    by: "Solana Vault PDA",
    badgeBg: "bg-emerald-950/60",
    badgeText: "text-emerald-400",
  },
  {
    title: "Instant refund if game cancels",
    body: "Leave before a game starts and your buy-in refunds immediately. Abandoned tables can be settled by anyone.",
    by: "On Chain",
    badgeBg: "bg-amber-950/60",
    badgeText: "text-amber-300",
  },
  {
    title: "Bids cost no wallet popups",
    body: "Approve once when sitting down. Throwaway session keys submit bids and calls instantly with zero gas fees.",
    by: "Session Keys",
    badgeBg: "bg-orange-950/60",
    badgeText: "text-orange-400",
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
        className="relative w-full max-w-lg bg-[#0c0805] border border-[#331f15] rounded-3xl p-6 sm:p-7 shadow-2xl flex flex-col max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-[#a69488] hover:text-[#faf5f0] hover:bg-[#1f130c] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2.5 mb-2">
          <ShieldCheck className="w-7 h-7 text-orange-400" />
          <h2 className="text-2xl sm:text-3xl font-black italic tracking-tight text-[#faf5f0]">
            Why this is fair
          </h2>
        </div>
        <p className="text-sm text-[#a69488] leading-relaxed mb-6">
          Six ways games like this are usually rigged — and what cryptographically prevents each one in Bluff.
        </p>

        <div className="space-y-4 mb-6">
          {GUARANTEES.map((g) => (
            <div
              key={g.title}
              className="p-3.5 bg-[#140d09] border border-[#2b180f] rounded-2xl space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <span
                  className={`text-[9.5px] font-extrabold tracking-wider uppercase px-2 py-0.5 rounded border border-orange-500/20 ${g.badgeBg} ${g.badgeText}`}
                >
                  {g.by}
                </span>
                <Check className="w-4 h-4 text-orange-400" />
              </div>
              <h3 className="text-sm font-bold text-[#faf5f0]">{g.title}</h3>
              <p className="text-xs text-[#a69488] leading-relaxed">{g.body}</p>
            </div>
          ))}
        </div>

        <Button label="Got it" onClick={onClose} className="w-full" />
      </div>
    </div>
  );
}

export function GuardBar({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-[#140d09]/80 border border-[#331f15] hover:border-orange-500/40 hover:bg-[#1c120c] transition-all cursor-pointer group text-xs font-bold backdrop-blur-md"
    >
      <ShieldCheck className="w-4 h-4 text-[#a69488] group-hover:text-orange-400 transition-colors" />
      <span className="text-[#a69488]">Protected by MagicBlock Private TEE</span>
      <span className="text-orange-400 font-extrabold underline underline-offset-2">Why?</span>
    </button>
  );
}
