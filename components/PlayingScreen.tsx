import React from "react";
import { Ending, type RoomState } from "../lib/bluff";
import { Bid, DieFace, faceName, faceNamePlural } from "../lib/dice";
import { BluffTable, SeatInfo } from "./BluffTable";
import { DiceTray } from "./DiceTray";
import { BidControls } from "./BidControls";
import { Button } from "./Button";
import { Clock, Dices, Divide, ShieldCheck } from "lucide-react";
import { DieIcon } from "./Die";

import { NetworkActivity } from "./NetworkActivity";

export function PlayingScreen({
  room,
  roomAddress,
  round,
  erUrl,
  isDelegated,
  pot,
  myHand,
  currentBid,
  turnTimeLeft,
  isMyTurn,
  alive,
  busy,
  seats,
  totalDiceOnTable,
  onBid,
  onCallBluff,
  onLeave,
  onSplitPot,
}: {
  room: RoomState;
  roomAddress?: string;
  round?: number;
  erUrl?: string;
  isDelegated?: boolean;
  pot: number;
  myHand: DieFace[];
  currentBid: Bid | null;
  turnTimeLeft: number;
  isMyTurn: boolean;
  alive: boolean;
  busy: boolean;
  seats: SeatInfo[];
  totalDiceOnTable: number;
  onBid: (quantity: number, face: DieFace) => void;
  onCallBluff: () => void;
  onLeave: () => void;
  onSplitPot?: () => void;
}) {
  const activeSurvivors = seats.filter((s) => s.isAlive);

  return (
    <div className="flex flex-col max-w-6xl w-full mx-auto space-y-4 animate-in fade-in duration-200">
      {/* Top Match Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-2">
        <div className="flex items-center gap-2 sm:gap-3">
          <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#FBD53D] bg-[#201d10] border border-[#FBD53D]/30 px-3.5 py-1 rounded-full shadow-sm">
            Round {round ?? room.round ?? 1}
          </span>
          <span className="text-xs sm:text-sm font-semibold text-[#98a08e]">
            {totalDiceOnTable} dice in play
          </span>
        </div>

        {/* 2-Finalists Heads-Up Split Pot trigger */}
        {activeSurvivors.length === 2 && room.ending === Ending.Split && onSplitPot && (
          <button
            type="button"
            onClick={onSplitPot}
            disabled={busy}
            className="flex items-center gap-1.5 py-1.5 px-3.5 rounded-full bg-[#201d10] border border-[#FBD53D]/50 text-[#FBD53D] hover:bg-[#FBD53D] hover:text-[#141004] text-xs font-black transition-all cursor-pointer shadow-md active:scale-95"
            title="Final 2 players can agree to split the pot 50/50 per table vote"
          >
            <Divide className="w-3.5 h-3.5" />
            <span>Final 2: Split Pot 50/50</span>
          </button>
        )}

        <div className="flex items-center gap-2 bg-[#171b14] border border-[#2a3122] px-3.5 py-1.5 rounded-full shadow-sm">
          <span className="text-[10px] text-[#6b7362] uppercase font-bold tracking-wider">POT</span>
          <span className="text-sm sm:text-base font-black text-[#FBD53D] tabular-nums">
            {(pot / 1e9).toFixed(2)} ◎
          </span>
        </div>
      </div>

      {/* Side-by-side Layout on md/lg screens, stacked on small mobile */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full items-start">
        {/* Left: The Felt Table Arena Stage & Current Bid Card */}
        <div className="lg:col-span-7 flex flex-col space-y-3 w-full">
          {/* Current Bid Display matching reference */}
          <div className="p-4 rounded-2xl bg-[#12160e] border border-[#232b1a] shadow-lg flex items-center justify-between">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#8b9580] block mb-1">
                Current bid
              </span>
              {currentBid ? (
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-[#f1f4ec] font-mono">
                    {currentBid.quantity} ×
                  </span>
                  <div className="w-5 h-5 inline-flex items-center justify-center">
                    <DieIcon face={currentBid.face} className="w-full h-full" />
                  </div>
                  <span className="text-base font-bold text-[#f1f4ec]">
                    {faceNamePlural(currentBid.face)}
                  </span>
                  <span className="text-sm text-[#7e8774] font-normal ml-1">
                    by <strong className="text-[#f1f4ec] font-semibold">{seats.find((s) => s.isYou)?.address === currentBid.bidderAddress ? "You" : currentBid.bidderName}</strong>
                  </span>
                </div>
              ) : (
                <span className="text-sm text-[#6b7362]">
                  Waiting for opening bid...
                </span>
              )}
            </div>
          </div>

          {/* The Felt Table Arena Stage (Grand, Spacious & High-res) */}
          <div className="flex flex-col items-center justify-center p-2 sm:p-3 rounded-3xl bg-[#0f140d]/90 border border-[#232b1a] shadow-[0_20px_50px_rgba(0,0,0,0.7),inset_0_0_60px_rgba(15,25,10,0.5)] min-h-[440px] sm:min-h-[490px] lg:min-h-[520px] w-full relative">
            <BluffTable
              seats={seats}
              currentBid={currentBid}
              turnTimeLeft={turnTimeLeft}
              totalDiceOnTable={totalDiceOnTable}
              yourAddress={seats.find((s) => s.isYou)?.address}
            />
          </div>
        </div>

        {/* Right: Dice Tray, Turn Action Controls & Table activity (Side Panel) */}
        <div className="lg:col-span-5 flex flex-col space-y-4 w-full">
          {/* Your Private Dice Tray (Decrypted from TEE) */}
          {alive ? (
            <DiceTray
              dice={myHand}
              highlightTarget={currentBid?.face}
            />
          ) : (
            <div className="p-4 bg-[#f2603c]/10 border border-[#f2603c]/30 rounded-2xl text-center space-y-2">
              <div className="text-sm font-extrabold text-[#f2603c]">
                You have lost all your dice
              </div>
              <p className="text-xs text-[#98a08e]">
                Spectating the remaining players competing for the pot.
              </p>
              <Button ghost label="Leave Room" onClick={onLeave} className="text-xs py-2" />
            </div>
          )}

          {/* Interactive Turn Action Controls */}
          {alive && (
            <BidControls
              currentBid={currentBid}
              totalDiceOnTable={totalDiceOnTable}
              onBid={onBid}
              onCallBluff={onCallBluff}
              isMyTurn={isMyTurn}
              disabled={busy}
              activePlayerName={seats.find((s) => s.isCurrentTurn)?.name}
            />
          )}

        </div>
      </div>

      {/* Live Network Activity Dock */}
      <div className="w-full pt-2">
        <NetworkActivity
          roomAddress={roomAddress}
          round={round ?? room.round ?? 1}
          erUrl={erUrl}
          isDelegated={isDelegated}
        />
      </div>
    </div>
  );
}
