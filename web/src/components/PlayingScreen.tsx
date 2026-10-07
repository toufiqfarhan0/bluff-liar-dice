import React, { useState } from "react";
import type { RoomState } from "../lib/bluff";
import { Bid, DieFace, dieSymbol, faceNamePlural, isValidRaise } from "../lib/dice";
import { DieItem } from "./DiceTray";
import { SeatInfo } from "./BluffTable";
import { Avatar } from "./Avatar";
import { Clock, Eye, EyeOff, Info, RotateCcw, ShieldAlert, Sparkles } from "lucide-react";

export function PlayingScreen({
  room,
  pot = 0,
  isPractice = false,
  roundNumber = 1,
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
  room?: RoomState | null;
  pot?: number;
  isPractice?: boolean;
  roundNumber?: number;
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
  const [hideDice, setHideDice] = useState(false);

  // Suggested next bid
  const defaultQuantity = currentBid ? (currentBid.face === 6 ? currentBid.quantity + 1 : currentBid.quantity) : 1;
  const defaultFace = currentBid ? (currentBid.face === 6 ? 2 : (currentBid.face + 1) as DieFace) : 2;

  const [quantity, setQuantity] = useState<number>(defaultQuantity);
  const [face, setFace] = useState<DieFace>(defaultFace);

  const { valid, error } = isValidRaise(currentBid, quantity, face, totalDiceOnTable);

  return (
    <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:px-6 space-y-4 text-left animate-in fade-in duration-200">
      {/* Title Bar (Exact FHE Liar's Dice style) */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-50 font-['Archivo']">
              {isPractice ? "Practice table" : "Table Match"}
            </h1>
            <div className="flex h-5 w-5 items-center justify-center rounded-full border border-white/20 text-[11px] font-semibold text-slate-400">
              i
            </div>
          </div>
          <div className="text-xs text-slate-400 mt-0.5 flex items-center gap-2 font-mono">
            <span>Round {room ? room.round : roundNumber}</span>
            <span>·</span>
            <span>{isPractice ? "No wallet, offline" : "Solana Devnet"}</span>
            {!isPractice && pot > 0 && (
              <>
                <span>·</span>
                <span className="text-orange-400 font-bold">Pot: {(pot / 1e9).toFixed(2)} ◎</span>
              </>
            )}
            <span>·</span>
            <button
              onClick={onLeave}
              className="text-orange-400 hover:underline cursor-pointer"
            >
              Restart
            </button>
          </div>
        </div>

        {/* Turn indicator */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span
            className={`w-2 h-2 rounded-full ${
              isMyTurn ? "bg-orange-500 animate-pulse shadow-[0_0_8px_#ea580c]" : "bg-slate-600"
            }`}
          />
          <span className={isMyTurn ? "text-orange-400 font-bold" : "text-slate-400"}>
            {isMyTurn ? "Your turn to bid" : "Opponent is deciding"}
          </span>
        </div>
      </div>

      {/* Main 2-Column Grid (Left: 3D Stage | Right: FHE Action Panels) */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.7fr_1fr] gap-6 items-start">
        {/* Left Column: Felt Arena with 3D Dice and Seated Players */}
        <div className="panel relative h-[420px] sm:h-[480px] flex flex-col justify-between p-6 overflow-hidden bg-gradient-to-b from-[#090d14] via-[#05070d] to-[#070a0f]">
          {/* Subtle felt lighting overlay */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(249,115,22,0.06)_0%,_transparent_70%)] pointer-events-none" />

          {/* Opponents along top of table */}
          <div className="relative z-10 flex flex-wrap items-center justify-center gap-3">
            {seats
              .filter((s) => !s.isYou)
              .map((seat) => (
                <div
                  key={seat.address}
                  className={`px-3 py-2 rounded-lg border transition-all flex items-center gap-2.5 ${
                    !seat.isAlive
                      ? "bg-slate-900/40 border-white/5 opacity-40"
                      : seat.isCurrentTurn
                      ? "bg-slate-900 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.3)] ring-1 ring-orange-500"
                      : "bg-slate-900/70 border-white/10"
                  }`}
                >
                  <Avatar who={seat.address} name={seat.name} size={28} out={!seat.isAlive} />
                  <div className="text-left">
                    <div className="text-xs font-semibold text-slate-200 truncate max-w-[80px]">
                      {seat.name}
                    </div>
                    <div className="text-[10px] font-mono text-slate-400">
                      {seat.isAlive ? `${seat.diceCount} dice` : "Out"}
                    </div>
                  </div>
                  {seat.lastAction && seat.isAlive && (
                    <span className="text-[9px] font-mono bg-orange-950/60 border border-orange-500/30 text-orange-300 px-1.5 py-0.5 rounded">
                      {seat.lastAction}
                    </span>
                  )}
                </div>
              ))}
          </div>

          {/* Curved table felt arc (Matching FHE Liar's Dice Screenshot) */}
          <div className="relative z-10 my-auto flex flex-col items-center justify-center">
            {/* The blue/orange neon rail arc */}
            <div className="w-[320px] sm:w-[460px] h-[70px] border-t-2 border-orange-400/60 rounded-[50%] shadow-[0_-8px_25px_rgba(249,115,22,0.35)] relative flex items-start justify-center">
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-900 border border-orange-400/50 text-slate-100 shadow-lg -translate-y-1/2">
                Your hand
              </span>
            </div>

            {/* 3D Translucent Orange Dice Sitting On The Felt (Like FHE Liar's Dice!) */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 -mt-2">
              {!hideDice && myHand.length > 0 ? (
                myHand.map((faceVal, idx) => {
                  const isMatch = currentBid ? faceVal === currentBid.face || faceVal === 1 : false;
                  return (
                    <div key={idx} className="flex flex-col items-center">
                      <DieItem face={faceVal} highlighted={isMatch} size="lg" />
                    </div>
                  );
                })
              ) : hideDice ? (
                <div className="py-6 text-xs text-slate-400 font-mono flex items-center gap-2">
                  <EyeOff className="w-4 h-4 text-orange-400" />
                  <span>Dice concealed under cup</span>
                </div>
              ) : (
                <div className="py-6 text-xs text-slate-500 italic">
                  Eliminated from match
                </div>
              )}
            </div>
          </div>

          {/* Table summary note at bottom */}
          <div className="relative z-10 text-center text-[11px] font-mono text-slate-500">
            {totalDiceOnTable} total hidden dice on table · {isPractice ? "Simulated offline practice" : "Encrypted inside MagicBlock SGX TEE"}
          </div>
        </div>

        {/* Right Column: Stacked FHE Cards (Your hand | Place a bid | Current bid) */}
        <div className="flex flex-col gap-4">
          {/* 1. Card: "Your hand" (Exact FHE Liar's Dice layout) */}
          <div className="panel p-5 space-y-3.5">
            <h2 className="text-sm font-semibold text-slate-200">
              Your hand
            </h2>

            {/* Row of dice preview */}
            <div className="flex items-center gap-2">
              {!hideDice ? (
                myHand.map((val, idx) => (
                  <div
                    key={idx}
                    className="die-tile-2d w-10 h-10 text-slate-900 font-black text-xl border border-white/20 select-none"
                    title={`Die ${idx + 1}: ${val}`}
                  >
                    {dieSymbol(val)}
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 italic py-2">
                  Dice are hidden
                </div>
              )}
            </div>

            {/* Hide dice / Show dice button */}
            <button
              type="button"
              onClick={() => setHideDice(!hideDice)}
              className="rounded-lg bg-orange-600 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-500 cursor-pointer block"
            >
              {hideDice ? "Show dice" : "Hide dice"}
            </button>
          </div>

          {/* 2. Card: "Place a bid" (Exact FHE Liar's Dice controls) */}
          <div className="panel p-5 space-y-4">
            <h2 className="text-sm font-semibold text-slate-200">
              Place a bid
            </h2>

            {/* Inputs: Quantity and Face */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Quantity</label>
                <input
                  type="number"
                  min={1}
                  max={totalDiceOnTable}
                  value={quantity}
                  disabled={!isMyTurn || disabledAction(busy, alive)}
                  onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500/50"
                />
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Face</label>
                <select
                  value={face}
                  disabled={!isMyTurn || disabledAction(busy, alive)}
                  onChange={(e) => setFace(parseInt(e.target.value) as DieFace)}
                  className="w-full rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-orange-500/50"
                >
                  <option value={1}>1 — one (Ace)</option>
                  <option value={2}>2 — two</option>
                  <option value={3}>3 — three</option>
                  <option value={4}>4 — four</option>
                  <option value={5}>5 — five</option>
                  <option value={6}>6 — six</option>
                </select>
              </div>
            </div>

            {/* Validation notice */}
            {valid ? (
              <div className="text-[11px] text-emerald-400 font-medium">
                ✓ Valid claim: {quantity} {faceNamePlural(face)}
              </div>
            ) : (
              <div className="text-[11px] text-rose-400 font-medium">
                {error}
              </div>
            )}

            {/* Actions: Bid and Call Bluff */}
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => valid && onBid(quantity, face)}
                disabled={!isMyTurn || !valid || disabledAction(busy, alive)}
                className="flex-1 rounded-lg bg-orange-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-500 cursor-pointer disabled:opacity-40"
              >
                Bid
              </button>

              {currentBid && (
                <button
                  type="button"
                  onClick={onCallBluff}
                  disabled={!isMyTurn || disabledAction(busy, alive)}
                  className="flex-1 rounded-lg bg-rose-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-rose-600/30 transition hover:bg-rose-500 cursor-pointer disabled:opacity-40 flex items-center justify-center gap-1.5"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Call Bluff!</span>
                </button>
              )}
            </div>
          </div>

          {/* 3. Card: "Current bid" (Exact FHE Liar's Dice layout) */}
          <div className="panel p-5 space-y-2">
            <h2 className="text-sm font-semibold text-slate-200">
              Current bid
            </h2>

            {currentBid ? (
              <div className="space-y-1">
                <div className="text-base font-semibold text-orange-400 flex items-center gap-2">
                  <span>{currentBid.quantity} — {faceNamePlural(currentBid.face)}</span>
                  <span className="text-xl">{dieSymbol(currentBid.face)}</span>
                </div>
                <div className="text-xs text-slate-400">
                  bid by <strong className="text-slate-200">{currentBid.bidderName}</strong>
                </div>
                <div className="text-[11px] font-mono text-slate-500 pt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3 text-orange-400" />
                  <span>{turnTimeLeft}s turn limit</span>
                </div>
              </div>
            ) : (
              <p className="text-sm text-slate-500">
                No bid yet this round.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function disabledAction(busy: boolean, alive: boolean) {
  return busy || !alive;
}
