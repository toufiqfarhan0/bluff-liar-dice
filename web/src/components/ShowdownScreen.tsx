import React from "react";
import { DieFace, dieSymbol, faceNamePlural, PlayerDiceState, ShowdownResult } from "../lib/dice";
import { DieItem } from "./DiceTray";
import { Avatar } from "./Avatar";
import { AlertCircle, ArrowRight, CheckCircle2, ShieldAlert, Sparkles, XCircle } from "lucide-react";

export function ShowdownScreen({
  showdown,
  players,
  onNextRound,
  nextRoundCountdown,
}: {
  showdown: ShowdownResult;
  players: PlayerDiceState[];
  onNextRound: () => void;
  nextRoundCountdown: number;
}) {
  const { bid, totalMatching, wasBluff, loserName, reason } = showdown;

  return (
    <div className="flex flex-col max-w-lg w-full mx-auto space-y-5 animate-in fade-in duration-300">
      {/* Showdown Banner */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#f2603c]/20 border border-[#f2603c]/40 text-[#f2603c] text-xs font-black tracking-widest uppercase">
          <ShieldAlert className="w-4 h-4" />
          <span>SHOWDOWN · CUPS LIFTED</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black italic tracking-tight text-[#f1f4ec]">
          {wasBluff ? "Bluff Caught!" : "Claim was True!"}
        </h2>
        <p className="text-xs text-[#98a08e]">
          The TEE enclaves have decrypted and revealed all player cups simultaneously.
        </p>
      </div>

      {/* Claim vs Actual Result Card */}
      <div className={`p-4 rounded-2xl border ${
        wasBluff ? "bg-[#f2603c]/10 border-[#f2603c]/40" : "bg-[#201d10] border-[#FBD53D]/40"
      } space-y-2`}>
        <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider">
          <span className="text-[#98a08e]">CHALLENGED CLAIM</span>
          <span className="text-[#f1f4ec]">ACTUAL ON TABLE</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-[#f1f4ec] font-mono">
              {bid.quantity}
            </span>
            <span className="text-2xl text-[#FBD53D]">
              {dieSymbol(bid.face)}
            </span>
            <span className="text-xs text-[#98a08e]">
              claimed by <strong className="text-[#f1f4ec]">{bid.bidderName}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-2xl font-black font-mono ${wasBluff ? "text-[#f2603c]" : "text-[#FBD53D]"}`}>
              {totalMatching}
            </span>
            <span className="text-xs text-[#98a08e]">
              found {faceNamePlural(bid.face)}
            </span>
          </div>
        </div>

        <div className="pt-1 text-xs text-[#f1f4ec] font-semibold border-t border-[#2a3122]/60 leading-relaxed">
          {reason}
        </div>
      </div>

      {/* All Players Cups & Dice Revealed */}
      <div className="p-4 bg-[#12160e] border border-[#2a3122] rounded-3xl space-y-3">
        <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-widest text-[#6b7362]">
          <span>ALL REVEALED HANDS</span>
          <span className="text-[#FBD53D] flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Wild Aces highlighted
          </span>
        </div>

        <div className="space-y-2.5">
          {players.map((player) => {
            const isLoser = player.name === loserName;

            return (
              <div
                key={player.address}
                className={`p-3 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                  isLoser
                    ? "bg-[#251614] border-[#f2603c]/50 shadow-[0_0_15px_-3px_rgba(242,96,60,0.3)]"
                    : "bg-[#171c13] border-[#252e1c]"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Avatar who={player.address} name={player.name} size={34} you={player.isHuman} />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-[#f1f4ec]">
                        {player.isHuman ? "You" : player.name}
                      </span>
                      {isLoser && (
                        <span className="text-[9px] bg-[#f2603c] text-white font-extrabold px-1.5 py-0.2 rounded-full uppercase">
                          -1 Die
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#6b7362]">
                      {player.diceCount} {player.diceCount === 1 ? "die" : "dice"} remaining
                    </span>
                  </div>
                </div>

                {/* Hand of Dice */}
                <div className="flex items-center gap-1.5">
                  {player.hand.length > 0 ? (
                    player.hand.map((d, idx) => {
                      const isMatch = bid.face === 1 ? d === 1 : d === bid.face || d === 1;
                      return <DieItem key={idx} face={d} highlighted={isMatch} size="sm" />;
                    })
                  ) : (
                    <span className="text-[11px] text-[#6b7362] italic">
                      Eliminated
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Next Round Button */}
      <button
        type="button"
        onClick={onNextRound}
        className="w-full py-4 px-6 rounded-full bg-[#FBD53D] hover:bg-[#fce06b] text-[#141004] font-black text-base tracking-wide shadow-[0_0_20px_rgba(251, 213, 61,0.35)] transition-all flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>CONTINUE TO NEXT ROUND</span>
        <span className="text-xs opacity-75">({nextRoundCountdown}s)</span>
        <ArrowRight className="w-5 h-5 stroke-[2.5]" />
      </button>
    </div>
  );
}
