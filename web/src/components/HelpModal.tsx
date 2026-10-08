import React, { useState, useEffect } from "react";
import {
  Check,
  ShieldCheck,
  X,
  BookOpen,
  Dices,
  Lock,
  Eye,
  EyeOff,
  ChevronRight,
  Shield,
  Award,
  RefreshCw,
  HelpCircle,
  Bot,
  Coins,
  Divide,
  Wallet,
} from "lucide-react";
import { Button } from "./Button";

export type HelpTab = "rules" | "tutorial" | "fairness";

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
    body: "Not opponents, not the host, not us. Your dice are encrypted inside hardware enclaves and only decrypted on Showdown.",
    by: "Private Rollup (TEE)",
    badgeBg: "bg-[#241d3d]",
    badgeText: "text-[#b9a9ff]",
  },
  {
    title: "Verifiable fair dice rolls",
    body: "Dice rolls are generated using on-chain verifiable randomness (VRF) — nobody can predict or manipulate them.",
    by: "VRF Oracle",
    badgeBg: "bg-[#2b2a12]",
    badgeText: "text-[#FBD53D]",
  },
  {
    title: "Simultaneous cup showdown",
    body: "When someone calls 'Bluff!', all cups lift at the exact same millisecond. No player can alter or peek early.",
    by: "Private Rollup (TEE)",
    badgeBg: "bg-[#241d3d]",
    badgeText: "text-[#b9a9ff]",
  },
  {
    title: "Your stake never leaves Solana",
    body: "The rollup runs fast gameplay. Stakes sit securely in a Solana L1 vault PDA it cannot touch.",
    by: "Solana Vault PDA",
    badgeBg: "bg-[#12291f]",
    badgeText: "text-[#5fd39a]",
  },
  {
    title: "Instant refund if game cancels",
    body: "Leave before a game starts and your buy-in refunds immediately. Abandoned tables can be settled by anyone.",
    by: "On Chain",
    badgeBg: "bg-[#1f241a]",
    badgeText: "text-[#98a08e]",
  },
  {
    title: "Open source, zero hidden state",
    body: "Every transition rule is compiled to Solana BPF bytecode. Inspect the code, verify the build hash, run it locally.",
    by: "Open Source",
    badgeBg: "bg-[#1f241a]",
    badgeText: "text-[#98a08e]",
  },
];

export function HelpModal({
  open,
  onClose,
  initialTab = "rules",
}: {
  open: boolean;
  onClose: () => void;
  initialTab?: HelpTab;
}) {
  const [tab, setTab] = useState<HelpTab>(initialTab);
  const [tutorialStep, setTutorialStep] = useState(0);

  useEffect(() => {
    if (open) {
      setTab(initialTab);
      setTutorialStep(0);
    }
  }, [open, initialTab]);

  if (!open) return null;

  const lessons = [
    {
      icon: EyeOff,
      title: "1. Inspect Your Secret Dice",
      subtitle: "Hardware-isolated roll under your cup",
      body: "Each round, 5 dice are rolled for every player inside a MagicBlock Private TEE enclave. Only you can view your dice under your cup — opponents only see encrypted enclave state.",
    },
    {
      icon: Dices,
      title: "2. Bid or Raise the Claim",
      subtitle: "Quantity and face, strictly escalating",
      body: "Players take turns clockwise bidding on total dice across the entire table (e.g. 'Three 4s'). Each new bid must increase the quantity, or match the quantity with a higher face. Bluff strategically to mislead opponents!",
    },
    {
      icon: Shield,
      title: "3. Call Bluff & Win Showdown",
      subtitle: "Simultaneous reveal and elimination",
      body: "If you think the last bid is too high, challenge it by calling 'Bluff!'. All cups unlock at once. If the true table count meets or beats the bid, you lose a die; if not, the bidder loses a die. Be the last player standing to take the pot!",
    },
    {
      icon: Coins,
      title: "4. Claim Your Pot on Solana",
      subtitle: "Instant settlement & tiebreak options",
      body: "Knock out all opponents to take 100% of the pot solo! If down to the final 2 finalists, the table's vote resolves it (Split 50/50 or Winner Takes All coin flip). Click 'CLAIM POT' to settle SOL directly into your Solana wallet.",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative max-w-xl w-full max-h-[90vh] flex flex-col rounded-3xl bg-[#0f140d] border border-[#2a3122] p-4 sm:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 sm:top-5 sm:right-5 p-2 rounded-full text-[#6b7362] hover:text-[#f1f4ec] hover:bg-[#1f241a] transition-colors cursor-pointer z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2.5 mb-1.5 select-none">
          <HelpCircle className="w-6 h-6 text-[#FBD53D]" />
          <h2 className="text-xl sm:text-2xl font-black tracking-wide text-[#f1f4ec]">
            Game Guide & Rules
          </h2>
        </div>
        <p className="text-xs text-[#98a08e] mb-4">
          Everything you need to know about playing Bluff and cryptographic fairness on Solana.
        </p>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1.5 p-1 bg-[#171b14] border border-[#2a3122] rounded-2xl mb-4 select-none">
          <button
            type="button"
            onClick={() => setTab("rules")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === "rules"
                ? "bg-[#201d10] text-[#FBD53D] shadow-[0_0_12px_rgba(251,213,61,0.25)] border border-[#FBD53D]/30"
                : "text-[#98a08e] hover:text-[#f1f4ec]"
            }`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>Rules</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("tutorial")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === "tutorial"
                ? "bg-[#201d10] text-[#FBD53D] shadow-[0_0_12px_rgba(251,213,61,0.25)] border border-[#FBD53D]/30"
                : "text-[#98a08e] hover:text-[#f1f4ec]"
            }`}
          >
            <Dices className="w-3.5 h-3.5" />
            <span>How to Play</span>
          </button>
          <button
            type="button"
            onClick={() => setTab("fairness")}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
              tab === "fairness"
                ? "bg-[#201d10] text-[#FBD53D] shadow-[0_0_12px_rgba(251,213,61,0.25)] border border-[#FBD53D]/30"
                : "text-[#98a08e] hover:text-[#f1f4ec]"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Fairness & TEE</span>
          </button>
        </nav>

        {/* Tab Contents (Scrollable) */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 text-[#f1f4ec]">
          {/* TAB 1: RULES */}
          {tab === "rules" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              <section className="p-3.5 rounded-2xl bg-[#171b14] border border-[#2a3122] space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FBD53D] block">
                  HOW A TABLE PLAYS
                </span>
                <ol className="list-decimal space-y-2 pl-4 text-xs leading-relaxed text-[#98a08e]">
                  <li>
                    <strong className="text-[#f1f4ec]">3 to 6 players</strong> join a table and each starts with 5 dice.
                  </li>
                  <li>
                    The smart contract rolls everyone's dice as secret encrypted values inside hardware TEE enclaves.
                  </li>
                  <li>
                    Players take turns clockwise making public bids: a quantity and a face (e.g. <span className="text-[#FBD53D] font-mono">"three 4s"</span>).
                  </li>
                  <li>
                    Each new bid must <strong className="text-[#f1f4ec]">raise the quantity</strong> (e.g. "four 2s"), or <strong className="text-[#f1f4ec]">match the quantity with a higher face</strong> (e.g. "three 5s").
                  </li>
                  <li>
                    <strong className="text-[#f1f4ec]">Exact face matching:</strong> Challenges count only the dice that match the exact face bid (faces 1 through 6).
                  </li>
                  <li>
                    Instead of bidding higher, the current player can challenge the last bid by calling <strong className="text-[#f2603c]">"Bluff!"</strong>.
                  </li>
                  <li>
                    A challenge lifts all cups simultaneously and counts every die on the table matching the bid face.
                  </li>
                  <li>
                    If the true count meets or beats the bid, the bid was valid and the <strong className="text-[#f2603c]">challenger loses 1 die</strong>. If fewer matching dice exist, the bidder was lying and the <strong className="text-[#f2603c]">bidder loses 1 die</strong>.
                  </li>
                  <li>
                    Players who lose all 5 dice are eliminated. The <strong className="text-[#FBD53D]">last player standing wins the pot</strong>!
                  </li>
                </ol>
              </section>

              {/* Public vs Private Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-2xl bg-[#171b14] border border-[#2a3122] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#FBD53D]">
                    <EyeOff className="w-4 h-4 text-[#FBD53D]" />
                    <span>What Stays Private</span>
                  </div>
                  <ul className="list-disc pl-4 text-[11px] text-[#98a08e] space-y-1 leading-snug">
                    <li>Your dice values during active bidding rounds</li>
                    <li>Opponents' dice values (cannot be peeked or front-run)</li>
                    <li>Unrevealed roll entropy inside the TEE enclave</li>
                  </ul>
                </div>

                <div className="p-3.5 rounded-2xl bg-[#171b14] border border-[#2a3122] space-y-1.5">
                  <div className="flex items-center gap-2 text-xs font-bold text-[#5fd39a]">
                    <Eye className="w-4 h-4 text-[#5fd39a]" />
                    <span>What Stays Public</span>
                  </div>
                  <ul className="list-disc pl-4 text-[11px] text-[#98a08e] space-y-1 leading-snug">
                    <li>Table membership, host, and turn order</li>
                    <li>Every bid — quantity, face, and bidder</li>
                    <li>Who called bluff, the outcome, and final reveals</li>
                  </ul>
                </div>
              </div>

              {/* 4+ Players, Pot & Claiming Rules */}
              <section className="p-3.5 rounded-2xl bg-[#171b14] border border-[#2a3122] space-y-2.5">
                <div className="flex items-center gap-2">
                  <Coins className="w-4 h-4 text-[#FBD53D]" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FBD53D]">
                    4+ PLAYERS, POT ACCUMULATION & CLAIMING
                  </span>
                </div>
                <div className="space-y-2 text-xs text-[#98a08e] leading-relaxed">
                  <div className="p-2.5 rounded-xl bg-[#12150f] border border-[#232b1c] space-y-1">
                    <span className="text-xs font-bold text-[#f1f4ec] flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-[#FBD53D]" />
                      Solo Champion Takes 100% of the Pot
                    </span>
                    <p className="text-[11px]">
                      When 4 or more players join, every player deposits their buy-in (e.g. 4 × 0.01 = 0.04 SOL) into the Solana Vault PDA. Players lose dice round-by-round. If you knock out all opponents and are the last survivor standing, you take <strong className="text-[#f1f4ec]">100% of the entire table pot</strong>.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#12150f] border border-[#232b1c] space-y-1">
                    <span className="text-xs font-bold text-[#f1f4ec] flex items-center gap-1.5">
                      <Divide className="w-3.5 h-3.5 text-[#5fd39a]" />
                      When Does "Split Pot" Apply?
                    </span>
                    <p className="text-[11px]">
                      The <strong className="text-[#f1f4ec]">Split Pot</strong> rule is specifically a <strong className="text-[#FBD53D]">Heads-Up Showdown Tiebreak</strong> for the final 2 finalists. If the game narrows down to the last 2 players and reaches a stalemate or the maximum round cap:
                    </p>
                    <ul className="list-disc pl-4 text-[11px] space-y-1 pt-0.5">
                      <li>
                        <strong className="text-[#f1f4ec]">Split Pot (Table Vote):</strong> Both remaining finalists split the pot <strong className="text-[#5fd39a]">50/50</strong>.
                      </li>
                      <li>
                        <strong className="text-[#f1f4ec]">Winner Takes All (Table Vote):</strong> An on-chain VRF coin flip picks 1 sole champion for 100%.
                      </li>
                    </ul>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#12150f] border border-[#232b1c] space-y-1">
                    <span className="text-xs font-bold text-[#f1f4ec] flex items-center gap-1.5">
                      <Wallet className="w-3.5 h-3.5 text-[#b9a9ff]" />
                      How Do Winners Claim Their Winnings?
                    </span>
                    <p className="text-[11px]">
                      When the game concludes, the winner(s) click <strong className="text-[#FBD53D]">"CLAIM POT"</strong>. This submits the on-chain <code className="text-[#FBD53D] font-mono text-[10px]">settle</code> transaction on Solana Devnet. The smart contract validates the survivors list, calculates each winner's exact share, and immediately transfers SOL lamports directly from the PDA Vault into the winner's Solana wallet!
                    </p>
                  </div>
                </div>
              </section>

              {/* AI Bots & Wallets Section */}
              <section className="p-3.5 rounded-2xl bg-[#171b14] border border-[#2a3122] space-y-2">
                <div className="flex items-center gap-2">
                  <Bot className="w-4 h-4 text-[#FBD53D]" />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FBD53D]">
                    HOW AI BOTS WORK & DO THEY HAVE WALLETS?
                  </span>
                </div>
                <div className="space-y-1.5 text-[11px] text-[#98a08e] leading-relaxed">
                  <p>
                    <strong className="text-[#f1f4ec]">Yes! Bots have real Solana wallets:</strong> Each bot is generated with an authentic Solana Ed25519 cryptographic keypair (<code className="text-[#FBD53D] font-mono text-[10px]">Keypair.generate()</code>) with a real public address on the blockchain.
                  </p>
                  <p>
                    <strong className="text-[#f1f4ec]">On-Chain Participation:</strong> When you seat bots, each bot signs an authentic <code className="text-[#FBD53D] font-mono text-[10px]">joinRoom</code> transaction on Solana. Their seats and public keys are permanently recorded in the room account.
                  </p>
                  <p>
                    <strong className="text-[#f1f4ec]">Autonomous AI Minds:</strong> Bots run distinctive behavioral archetypes (Viper the aggressive bluffer, Mila the conservative mathematician, 0xTeo the bluff caller). They evaluate hidden dice probabilities and bid or challenge with human-like deliberation.
                  </p>
                  <p>
                    <strong className="text-[#f1f4ec]">On-Chain Payouts:</strong> Because bots have verifiable on-chain public keys, if a bot were to win, the Solana smart contract can settle lamports directly to their address.
                  </p>
                </div>
              </section>
            </div>
          )}

          {/* TAB 2: TUTORIAL / HOW TO PLAY */}
          {tab === "tutorial" && (
            <div className="space-y-4 animate-in fade-in duration-150">
              {/* Step indicator */}
              <div className="flex items-center justify-between p-2 rounded-xl bg-[#171b14] border border-[#2a3122]">
                {lessons.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setTutorialStep(idx)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                      tutorialStep === idx
                        ? "bg-[#FBD53D] text-[#141004] shadow-[0_0_10px_rgba(251,213,61,0.4)]"
                        : "text-[#6b7362] hover:text-[#f1f4ec]"
                    }`}
                  >
                    Step {idx + 1}
                  </button>
                ))}
              </div>

              {/* Current Lesson Card */}
              {(() => {
                const current = lessons[tutorialStep];
                const IconComponent = current.icon;
                return (
                  <div className="p-4 rounded-2xl bg-[#171b14] border border-[#2a3122] space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#201d10] border border-[#FBD53D]/40 flex items-center justify-center text-[#FBD53D]">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-[#f1f4ec]">
                          {current.title}
                        </h3>
                        <span className="text-[11px] text-[#FBD53D] font-semibold">
                          {current.subtitle}
                        </span>
                      </div>
                    </div>
                    <p className="text-xs text-[#98a08e] leading-relaxed">
                      {current.body}
                    </p>
                  </div>
                );
              })()}

              <div className="flex items-center justify-between pt-1">
                <button
                  type="button"
                  disabled={tutorialStep === 0}
                  onClick={() => setTutorialStep((s) => Math.max(0, s - 1))}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold text-[#6b7362] hover:text-[#f1f4ec] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  Previous
                </button>
                {tutorialStep < lessons.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setTutorialStep((s) => Math.min(lessons.length - 1, s + 1))}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FBD53D] text-[#141004] text-xs font-black hover:bg-[#fce06b] transition-all cursor-pointer shadow-[0_0_15px_-3px_rgba(251,213,61,0.3)]"
                  >
                    <span>Next step</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setTab("rules")}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#FBD53D] text-[#141004] text-xs font-black hover:bg-[#fce06b] transition-all cursor-pointer shadow-[0_0_15px_-3px_rgba(251,213,61,0.3)]"
                  >
                    <span>Read Full Rules</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: FAIRNESS & TEE */}
          {tab === "fairness" && (
            <div className="space-y-3 animate-in fade-in duration-150">
              {/* Architecture 3-step pipeline */}
              <div className="grid grid-cols-3 gap-2 p-3 bg-[#171b14] border border-[#2a3122] rounded-2xl text-center">
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#FBD53D]">
                    1. Solana L1
                  </span>
                  <p className="text-[10px] text-[#98a08e] leading-snug">
                    Holds stake in vault PDA
                  </p>
                </div>
                <div className="space-y-1 border-x border-[#2a3122]">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#b9a9ff]">
                    2. MagicBlock TEE
                  </span>
                  <p className="text-[10px] text-[#98a08e] leading-snug">
                    Private enclave rolls & turns
                  </p>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-wider text-[#5fd39a]">
                    3. Solana Payout
                  </span>
                  <p className="text-[10px] text-[#98a08e] leading-snug">
                    Full recorded pot paid to winner
                  </p>
                </div>
              </div>

              {/* Guarantees List */}
              <div className="space-y-2.5">
                {GUARANTEES.map((g) => (
                  <div
                    key={g.title}
                    className="p-3 rounded-2xl bg-[#171b14] border border-[#2a3122] space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${g.badgeBg} ${g.badgeText}`}
                      >
                        {g.by}
                      </span>
                      <Check className="w-3.5 h-3.5 text-[#FBD53D]" />
                    </div>
                    <h3 className="text-xs font-bold text-[#f1f4ec]">{g.title}</h3>
                    <p className="text-[11px] text-[#98a08e] leading-relaxed">{g.body}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-[#2a3122] mt-2">
          <Button label="Got it" onClick={onClose} className="w-full py-2.5 text-xs" />
        </div>
      </div>
    </div>
  );
}

export function FairnessModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return <HelpModal open={open} onClose={onClose} initialTab="fairness" />;
}

export function GuardBar({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl sm:rounded-2xl bg-[#171b14] border border-[#2a3122] hover:border-[#3f4a33] hover:bg-[#1c2219] transition-all cursor-pointer group text-[11px] sm:text-xs font-bold"
    >
      <ShieldCheck className="w-3.5 h-3.5 text-[#98a08e] group-hover:text-[#FBD53D] transition-colors" />
      <span className="text-[#98a08e]">Protected by MagicBlock Private TEE</span>
      <span className="text-[#FBD53D] font-extrabold underline underline-offset-2">Why?</span>
    </button>
  );
}
