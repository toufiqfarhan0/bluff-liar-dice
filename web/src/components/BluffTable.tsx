import React from "react";
import { Bid, dieSymbol, faceNamePlural } from "../lib/dice";
import { Avatar } from "./Avatar";
import { Clock, Dices, Shield, Zap } from "lucide-react";

export interface SeatInfo {
  address: string;
  name: string;
  diceCount: number;
  isAlive: boolean;
  isYou: boolean;
  isCurrentTurn: boolean;
  lastAction?: string;
}

export function BluffTable({
  seats,
  currentBid,
  turnTimeLeft,
  totalDiceOnTable,
}: {
  seats: SeatInfo[];
  currentBid: Bid | null;
  turnTimeLeft: number;
  totalDiceOnTable: number;
}) {
  return (
    <div className="w-full space-y-4 select-none">
      {/* 1. Opponents Roster Strip (UltraPong / Hecliar style) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {seats.map((seat) => {
          return (
            <div
              key={seat.address}
              className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                !seat.isAlive
                  ? "bg-[#0b0805]/60 border-[#1f130b] opacity-40"
                  : seat.isCurrentTurn
                  ? "bg-[#1f140c] border-orange-500 shadow-[0_0_18px_rgba(249,115,22,0.35)] ring-1 ring-orange-500/80"
                  : "bg-[#110c07]/80 border-[#2b1a10] hover:border-orange-500/30"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="relative">
                  <Avatar
                    who={seat.address}
                    name={seat.name}
                    size={32}
                    out={!seat.isAlive}
                    you={seat.isYou}
                  />
                  {seat.isCurrentTurn && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-orange-500 animate-ping" />
                  )}
                </div>

                <div className="min-w-0">
                  <span
                    className={`text-xs font-bold truncate block ${
                      seat.isYou
                        ? "text-orange-400 font-black"
                        : !seat.isAlive
                        ? "text-[#635349] line-through"
                        : "text-[#faf5f0]"
                    }`}
                  >
                    {seat.isYou ? "You" : seat.name}
                  </span>
                  <div className="text-[10px] font-mono text-[#9c897d] flex items-center gap-1">
                    {seat.isAlive ? (
                      <>
                        <span className="text-amber-400 font-bold">{seat.diceCount}</span>
                        <span>{seat.diceCount === 1 ? "die" : "dice"}</span>
                      </>
                    ) : (
                      <span className="text-red-400">Eliminated</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Status / Last action tag */}
              <div className="text-right shrink-0">
                {seat.lastAction && seat.isAlive ? (
                  <span className="text-[9px] font-mono bg-[#1c120c] border border-orange-500/30 text-amber-300 px-2 py-0.5 rounded-md block truncate max-w-[85px]">
                    {seat.lastAction}
                  </span>
                ) : seat.isCurrentTurn ? (
                  <span className="text-[9px] font-mono text-orange-400 font-bold animate-pulse">
                    ACTING…
                  </span>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>

      {/* 2. Center Stage: The Live High Claim Deck */}
      <div className="tactical-panel p-5 relative overflow-hidden text-center border-orange-500/20 shadow-2xl">
        {/* Subtle orange ambient glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-orange-500/5 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center justify-center space-y-2">
          <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-widest text-[#9c897d]">
            <Zap className="w-3.5 h-3.5 text-orange-400" />
            <span>TABLE HIGH CLAIM</span>
          </div>

          {currentBid ? (
            <div className="space-y-1 py-1">
              <div className="flex items-center justify-center gap-3">
                <span className="text-5xl font-black font-mono text-orange-400 tabular-nums drop-shadow-[0_0_20px_rgba(249,115,22,0.5)]">
                  {currentBid.quantity}
                </span>
                <span className="text-4xl text-amber-300">
                  ×
                </span>
                <span className="text-5xl text-amber-400 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)]">
                  {dieSymbol(currentBid.face)}
                </span>
              </div>

              <div className="text-sm font-bold text-[#faf5f0] tracking-wide">
                {currentBid.quantity} {faceNamePlural(currentBid.face)}
              </div>

              <div className="text-xs font-mono text-[#9c897d]">
                Locked by <strong className="text-orange-400">{currentBid.bidderName}</strong>
              </div>
            </div>
          ) : (
            <div className="py-4 space-y-2">
              <Dices className="w-9 h-9 text-orange-400/70 mx-auto animate-pulse" />
              <div className="text-sm font-bold tracking-wider text-[#faf5f0] uppercase">
                TABLE IS OPEN
              </div>
              <div className="text-xs text-[#9c897d]">
                Waiting for first player to place opening claim
              </div>
            </div>
          )}

          {/* Turn timer and total table pool */}
          <div className="flex items-center justify-center gap-4 pt-3 border-t border-[#2b1a10] w-full max-w-xs text-xs font-mono text-[#9c897d]">
            <span className="flex items-center gap-1.5 text-amber-300">
              <Clock className="w-3.5 h-3.5 text-orange-400" />
              <span>{turnTimeLeft}s TURN TIMER</span>
            </span>
            <span>|</span>
            <span className="text-[#faf5f0] font-semibold">
              {totalDiceOnTable} TOTAL DICE
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
