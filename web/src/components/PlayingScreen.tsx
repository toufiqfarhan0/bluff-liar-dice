import React from "react";
import type { RoomState } from "../lib/bluff";
import { Bid, DieFace } from "../lib/dice";
import { BluffTable, SeatInfo } from "./BluffTable";
import { DiceTray } from "./DiceTray";
import { BidControls } from "./BidControls";
import { Button } from "./Button";
import { Clock, Dices, ShieldCheck, Sparkles } from "lucide-react";

export function PlayingScreen({
  room,
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
}: {
  room: RoomState;
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
}) {
  return (
    <div className="flex flex-col max-w-lg w-full mx-auto space-y-5 animate-in fade-in duration-200">
      {/* Top Match Bar */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-black uppercase tracking-wider text-[#FBD53D] bg-[#201d10] border border-[#FBD53D]/30 px-3 py-1 rounded-full">
            Round {room.round}
          </span>
          <span className="text-xs font-semibold text-[#98a08e]">
            {totalDiceOnTable} dice in play
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-[#171b14] border border-[#2a3122] px-3 py-1 rounded-full">
          <span className="text-[10px] text-[#6b7362] uppercase font-bold">POT</span>
          <span className="text-sm font-black text-[#FBD53D] tabular-nums">
            {(pot / 1e9).toFixed(2)} ◎
          </span>
        </div>
      </div>

      {/* The Felt Table Layout */}
      <BluffTable
        seats={seats}
        currentBid={currentBid}
        turnTimeLeft={turnTimeLeft}
        totalDiceOnTable={totalDiceOnTable}
        size={330}
      />

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
        />
      )}
    </div>
  );
}
