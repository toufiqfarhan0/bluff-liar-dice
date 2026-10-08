import React from "react";
import { Bid, DieFace, dieSymbol, faceNamePlural } from "../lib/dice";
import { Avatar, shortKey } from "./Avatar";
import { Clock, Dices, Flame, Sparkles } from "lucide-react";

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
  size = 320,
}: {
  seats: SeatInfo[];
  currentBid: Bid | null;
  turnTimeLeft: number;
  totalDiceOnTable: number;
  size?: number;
}) {
  const radius = size / 2 - 40;

  return (
    <div
      className="relative mx-auto flex items-center justify-center select-none my-2"
      style={{ width: size, height: size }}
    >
      {/* Felt Table Surface */}
      <div
        className="absolute rounded-full border border-[#2d3822] bg-gradient-to-b from-[#141b10] to-[#0c100a] shadow-[inset_0_0_60px_rgba(0,0,0,0.8),0_10px_30px_rgba(0,0,0,0.6)]"
        style={{ width: size - 30, height: size - 30 }}
      />

      {/* Center Table Info (The Current High Bid) */}
      <div className="absolute z-10 flex flex-col items-center justify-center text-center p-3 max-w-[170px]">
        {currentBid ? (
          <div className="space-y-1 animate-in zoom-in-95 duration-200">
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#6b7362] block">
              CURRENT BID
            </span>

            <div className="flex items-center justify-center gap-1.5 py-1">
              <span className="text-3xl font-black text-[#f1f4ec] font-mono tabular-nums">
                {currentBid.quantity}
              </span>
              <span className="text-3xl font-black text-[#FBD53D] drop-shadow-[0_0_12px_rgba(251, 213, 61,0.4)]">
                {dieSymbol(currentBid.face)}
              </span>
            </div>

            <span className="text-[11px] font-bold text-[#FBD53D] block truncate">
              {currentBid.quantity} {faceNamePlural(currentBid.face)}
            </span>

            <span className="text-[10px] text-[#98a08e] block truncate">
              by <strong className="text-[#f1f4ec]">{currentBid.bidderName}</strong>
            </span>
          </div>
        ) : (
          <div className="space-y-1.5">
            <Dices className="w-8 h-8 text-[#6b7362] mx-auto animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-[#98a08e] block">
              WAITING FOR BID
            </span>
            <span className="text-[10px] text-[#6b7362] block">
              First player opens
            </span>
          </div>
        )}

        {/* Turn clock and total table dice */}
        <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#232a1b] text-[10px] text-[#6b7362]">
          <span className="flex items-center gap-1 font-mono text-[#98a08e]">
            <Clock className="w-3 h-3 text-[#FBD53D]" />
            {turnTimeLeft}s
          </span>
          <span>·</span>
          <span>{totalDiceOnTable} dice</span>
        </div>
      </div>

      {/* Seated Players around the Felt */}
      {seats.map((seat, i) => {
        const angle = (i / Math.max(1, seats.length)) * Math.PI * 2 - Math.PI / 2;
        const x = size / 2 + Math.cos(angle) * radius - 26;
        const y = size / 2 + Math.sin(angle) * radius - 26;

        return (
          <div
            key={seat.address}
            className="absolute z-20 flex flex-col items-center transition-all duration-300"
            style={{ left: `${x}px`, top: `${y}px`, width: "52px" }}
          >
            {/* Avatar & Turn Glow */}
            <div className="relative">
              <div
                className={`rounded-full transition-all duration-300 ${
                  seat.isCurrentTurn
                    ? "ring-2 ring-[#FBD53D] shadow-[0_0_15px_#FBD53D]"
                    : ""
                }`}
              >
                <Avatar
                  who={seat.address}
                  name={seat.name}
                  size={46}
                  out={!seat.isAlive}
                  you={seat.isYou}
                />
              </div>

              {/* Dice Count Badge */}
              {seat.isAlive && (
                <div
                  title={`${seat.diceCount} dice remaining`}
                  className="absolute -bottom-1 -right-1 bg-[#12160e] border border-[#FBD53D]/50 text-[#FBD53D] rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-black shadow-md"
                >
                  {seat.diceCount}
                </div>
              )}
            </div>

            {/* Name */}
            <span
              className={`text-[10px] font-bold truncate max-w-[58px] text-center mt-1.5 ${
                !seat.isAlive
                  ? "text-[#6b7362] line-through"
                  : seat.isYou
                  ? "text-[#FBD53D]"
                  : "text-[#f1f4ec]"
              }`}
            >
              {seat.isYou ? "You" : seat.name}
            </span>

            {/* Last Action Bubble */}
            {seat.lastAction && seat.isAlive && (
              <span className="text-[9px] bg-[#1b2214] border border-[#2f3a22] text-[#FBD53D] font-semibold px-1.5 py-0.2 rounded-full whitespace-nowrap mt-0.5">
                {seat.lastAction}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
