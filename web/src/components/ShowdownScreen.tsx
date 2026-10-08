import React from "react";
import { DieFace, faceNamePlural, PlayerDiceState, ShowdownResult } from "../lib/dice";
import { DieIcon, DieItem } from "./Die";
import { Avatar } from "./Avatar";
import { AlertCircle, ArrowRight, CheckCircle2, ShieldAlert, XCircle } from "lucide-react";

export function ShowdownScreen({
  showdown,
  players,
  onNextRound,
  nextRoundCountdown,
  you,
}: {
  showdown: ShowdownResult;
  players: PlayerDiceState[];
  onNextRound: () => void;
  nextRoundCountdown: number;
  you?: string;
}) {
  const { bid, totalMatching, wasBluff, loserName, reason } = showdown;

  return (
    <div className="flex flex-col max-w-lg w-full mx-auto space-y-3 animate-in fade-in duration-300">
      {/* Showdown Banner */}
      <div className="text-center space-y-0.5">
        <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#f2603c]/20 border border-[#f2603c]/40 text-[#f2603c] text-[10px] font-black tracking-widest uppercase">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>SHOWDOWN · CUPS LIFTED</span>
        </div>
        <h2 className="text-xl sm:text-2xl font-black tracking-wide text-[#f1f4ec]">
          {wasBluff ? "Bluff Caught!" : "Claim was True!"}
        </h2>
        <p className="text-[11px] text-[#98a08e]">
          The TEE enclaves have decrypted and revealed all player cups simultaneously.
        </p>
      </div>

      {/* Claim vs Actual Result Card */}
      <div className={`p-3 rounded-2xl border ${
        wasBluff ? "bg-[#f2603c]/10 border-[#f2603c]/40" : "bg-[#201d10] border-[#FBD53D]/40"
      } space-y-1.5`}>
        <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider">
          <span className="text-[#98a08e]">CHALLENGED CLAIM</span>
          <span className="text-[#f1f4ec]">ACTUAL ON TABLE</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-[#f1f4ec] font-mono">
              {bid.quantity}
            </span>
            <div className="w-5 h-5 inline-flex items-center justify-center">
              <DieIcon face={bid.face} className="w-full h-full" />
            </div>
            <span className="text-[11px] text-[#98a08e]">
              claimed by <strong className="text-[#f1f4ec]">{bid.bidderName}</strong>
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <span className={`text-xl font-black font-mono ${wasBluff ? "text-[#f2603c]" : "text-[#FBD53D]"}`}>
              {totalMatching}
            </span>
            <span className="text-[11px] text-[#98a08e]">
              found {faceNamePlural(bid.face)}
            </span>
          </div>
        </div>

        <div className="pt-1 text-[11px] text-[#f1f4ec] font-semibold border-t border-[#2a3122]/60 leading-snug">
          {reason}
        </div>
      </div>

      {/* All Players Cups & Dice Revealed */}
      <div className="p-3 bg-[#12160e] border border-[#2a3122] rounded-2xl space-y-2">
        <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-[#6b7362]">
          <span>ALL REVEALED HANDS</span>
          <span className="text-[#98a08e]">Matching dice highlighted</span>
        </div>

        <div className="space-y-1.5">
          {players.map((player) => {
            const isLoser = player.address === showdown.loserAddress;
            const isYou = you ? player.address === you : player.isHuman;

            return (
              <div
                key={player.address}
                className={`py-2 px-3 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                  isLoser
                    ? "bg-[#251614] border-[#f2603c]/50 shadow-[0_0_15px_-3px_rgba(242,96,60,0.3)]"
                    : "bg-[#171c13] border-[#252e1c]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Avatar who={player.address} name={player.name} size={28} you={isYou} />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#f1f4ec]">
                        {isYou ? "You" : player.name}
                      </span>
                      {isLoser && (
                        <span className="text-[8px] bg-[#f2603c] text-white font-extrabold px-1.5 py-0.2 rounded-full uppercase">
                          -1 Die
                        </span>
                      )}
                    </div>
                    <span className="text-[9px] text-[#6b7362]">
                      {player.diceCount} {player.diceCount === 1 ? "die" : "dice"} remaining
                    </span>
                  </div>
                </div>

                {/* Hand of Dice */}
                <div className="flex items-center gap-2 sm:gap-2.5">
                  {player.hand.length > 0 ? (
                    player.hand.map((d, idx) => {
                      const isMatch = d === bid.face;
                      return <DieItem key={idx} face={d} highlighted={isMatch} size="sm" />;
                    })
                  ) : (
                    <span className="text-[10px] text-[#6b7362]">
                      Eliminated
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Round / View Winner Button */}
      {(() => {
        const survivors = players.filter((p) => p.isAlive && p.diceCount > 0);
        const isGameOver = survivors.length <= 1;

        return (
          <button
            type="button"
            onClick={onNextRound}
            className="w-full py-3.5 px-5 rounded-full bg-[#FBD53D] hover:bg-[#fce06b] active:scale-[0.99] text-[#141004] font-black text-sm tracking-wide shadow-[0_0_20px_rgba(251,213,61,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
          >
            {isGameOver ? (
              <>
                <span>VIEW FINAL RESULTS & CLAIM POT</span>
                <span className="text-xs opacity-75">({nextRoundCountdown}s)</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            ) : (
              <>
                <span>CONTINUE TO NEXT ROUND</span>
                <span className="text-xs opacity-75">({nextRoundCountdown}s)</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </>
            )}
          </button>
        );
      })()}
    </div>
  );
}
