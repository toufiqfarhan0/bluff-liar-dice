import React from "react";
import { dieSymbol, faceNamePlural, PlayerDiceState, ShowdownResult } from "../lib/dice";
import { DieItem } from "./DiceTray";
import { Avatar } from "./Avatar";
import { ArrowRight, ShieldAlert } from "lucide-react";

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
    <div className="w-full max-w-2xl mx-auto px-4 py-8 space-y-5 text-left animate-in fade-in duration-300">
      {/* Verdict Header */}
      <div className="text-center space-y-1">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
          <ShieldAlert className="w-4 h-4" />
          <span>Showdown · Cups Lifted</span>
        </div>
        <h1 className="text-3xl font-semibold text-slate-100">
          {wasBluff ? "Bluff Caught!" : "Claim was True!"}
        </h1>
        <p className="text-sm text-slate-400">
          The TEE enclaves have revealed all cups simultaneously.
        </p>
      </div>

      {/* Claim vs Actual Result Card */}
      <div className="panel p-5 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
          <span>CHALLENGED CLAIM</span>
          <span>ACTUAL ON TABLE</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-bold font-mono text-slate-100">
              {bid.quantity}
            </span>
            <span className="text-3xl text-orange-400">
              {dieSymbol(bid.face)}
            </span>
            <span className="text-xs text-slate-400">
              by <strong className="text-slate-200">{bid.bidderName}</strong>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-3xl font-bold font-mono ${
                wasBluff ? "text-rose-400" : "text-orange-400"
              }`}
            >
              {totalMatching}
            </span>
            <span className="text-xs text-slate-400">
              found {faceNamePlural(bid.face)}
            </span>
          </div>
        </div>

        <div className="text-xs text-slate-300 pt-2 border-t border-white/5 leading-relaxed">
          {reason}
        </div>
      </div>

      {/* All Revealed Hands */}
      <div className="panel p-5 space-y-3">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          All Revealed Hands
        </div>

        <div className="space-y-2.5">
          {players.map((player) => {
            const isLoser = player.name === loserName;

            return (
              <div
                key={player.address}
                className={`p-3 rounded-lg border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                  isLoser
                    ? "bg-rose-500/10 border-rose-500/40"
                    : "bg-slate-900/60 border-white/5"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Avatar who={player.address} name={player.name} size={32} you={player.isHuman} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-200">
                        {player.isHuman ? "You" : player.name}
                      </span>
                      {isLoser && (
                        <span className="text-[10px] bg-rose-600 text-white font-semibold px-2 py-0.5 rounded-full">
                          -1 Die
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {player.diceCount} {player.diceCount === 1 ? "die" : "dice"} remaining
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {player.hand.length > 0 ? (
                    player.hand.map((d, idx) => {
                      const isMatch = bid.face === 1 ? d === 1 : d === bid.face || d === 1;
                      return <DieItem key={idx} face={d} highlighted={isMatch} size="sm" />;
                    })
                  ) : (
                    <span className="text-xs text-slate-500 italic">
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
        className="w-full rounded-lg bg-orange-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-500 flex items-center justify-center gap-2 cursor-pointer"
      >
        <span>Continue to next round</span>
        <span className="text-xs opacity-75">({nextRoundCountdown}s)</span>
        <ArrowRight className="w-4 h-4" />
      </button>
    </div>
  );
}
