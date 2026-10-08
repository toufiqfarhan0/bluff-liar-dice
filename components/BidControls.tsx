import React, { useState, useEffect, useMemo } from "react";
import { Bid, DieFace, faceName, faceNamePlural, isValidRaise } from "../lib/dice";
import { AlertTriangle, ArrowUpRight, Clock, Flame, Minus, Plus, ShieldAlert } from "lucide-react";
import { DieIcon } from "./Die";

function FaceDieButton({
  face,
  isSelected,
  disabled,
  onClick,
}: {
  face: DieFace;
  isSelected: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      title={faceName(face)}
      className={`aspect-square p-1.5 sm:p-2 rounded-2xl border transition-all duration-200 flex items-center justify-center cursor-pointer select-none ${
        isSelected
          ? "border-2 border-[#FBD53D] bg-[#232111] shadow-[0_0_16px_rgba(251,213,61,0.45)] scale-105"
          : "border border-[#26301e] bg-[#141911] hover:border-[#3e4e30] hover:bg-[#1b2216] opacity-80 hover:opacity-100"
      } disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none`}
    >
      <div className="w-full h-full max-w-[42px] max-h-[42px] flex items-center justify-center">
        <DieIcon face={face} />
      </div>
    </button>
  );
}

export function BidControls({
  currentBid,
  totalDiceOnTable,
  onBid,
  onCallBluff,
  isMyTurn,
  disabled,
  activePlayerName,
}: {
  currentBid: Bid | null;
  totalDiceOnTable: number;
  onBid: (quantity: number, face: DieFace) => void;
  onCallBluff: () => void;
  isMyTurn: boolean;
  disabled: boolean;
  activePlayerName?: string;
}) {
  // Initial suggestion
  const defaultQuantity = currentBid ? (currentBid.face === 6 ? currentBid.quantity + 1 : currentBid.quantity) : 1;
  const defaultFace = currentBid ? (currentBid.face === 6 ? 2 : (currentBid.face + 1) as DieFace) : 2;

  const [quantity, setQuantity] = useState<number>(defaultQuantity);
  const [face, setFace] = useState<DieFace>(defaultFace);

  // Compute the next 3 legal raises
  const quickRaises = useMemo(() => {
    if (!currentBid) {
      return [
        { quantity: 1, face: 2 as DieFace },
        { quantity: 1, face: 3 as DieFace },
        { quantity: 2, face: 2 as DieFace },
      ];
    }

    const results: { quantity: number; face: DieFace }[] = [];

    // 1. Same quantity with higher faces
    for (let f = currentBid.face + 1; f <= 6; f++) {
      results.push({ quantity: currentBid.quantity, face: f as DieFace });
      if (results.length >= 3) return results;
    }

    // 2. Next quantities with faces
    for (let q = currentBid.quantity + 1; q <= totalDiceOnTable; q++) {
      for (let f = 1; f <= 6; f++) {
        results.push({ quantity: q, face: f as DieFace });
        if (results.length >= 3) return results;
      }
    }

    return results;
  }, [currentBid, totalDiceOnTable]);

  // Sync suggestion when currentBid changes
  useEffect(() => {
    if (currentBid) {
      if (currentBid.face === 6) {
        setQuantity(Math.min(totalDiceOnTable, currentBid.quantity + 1));
        setFace(2);
      } else {
        setQuantity(Math.min(totalDiceOnTable, currentBid.quantity));
        setFace((currentBid.face + 1) as DieFace);
      }
    } else {
      setQuantity(Math.min(totalDiceOnTable, 1));
      setFace(2);
    }
  }, [currentBid, totalDiceOnTable]);

  const { valid, error } = isValidRaise(currentBid, quantity, face, totalDiceOnTable);

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity(quantity - 1);
    }
  };

  const handleIncrement = () => {
    if (quantity < totalDiceOnTable) {
      setQuantity(quantity + 1);
    }
  };

  // When it is not your turn, hide all bid pickers and show a clean waiting card
  if (!isMyTurn) {
    return (
      <div className="w-full p-5 rounded-3xl bg-[#12160e] border border-[#2a3122] shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7b8970] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FBD53D] animate-ping" />
            OPPONENTS ARE PLAYING
          </span>
          <span className="text-xs font-semibold text-[#98a08e]">
            Table Total: <strong className="text-[#f1f4ec] font-bold">{totalDiceOnTable} dice</strong>
          </span>
        </div>

        <div className="py-7 px-5 rounded-2xl bg-[#161c12] border border-[#232b1a] flex flex-col items-center justify-center text-center space-y-3 w-full">
          <div className="relative flex items-center justify-center">
            <div className="w-12 h-12 rounded-full border-2 border-[#2b3720] border-t-[#FBD53D] animate-spin" />
            <Clock className="w-5 h-5 text-[#FBD53D] absolute" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-[#f1f4ec]">
              {activePlayerName ? `${activePlayerName} is thinking...` : "Opponent is thinking..."}
            </h4>
            <p className="text-xs text-[#7b8970] max-w-xs leading-relaxed">
              Bot actions and bluff decisions run privately inside the TEE. Your controls will appear on your turn.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-5 rounded-3xl bg-[#12160e] border border-[#2a3122] shadow-2xl space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FBD53D]">
          YOUR MOVE
        </span>
        <span className="text-xs font-semibold text-[#98a08e]">
          Table Total: <strong className="text-[#f1f4ec] font-bold">{totalDiceOnTable} dice</strong>
        </span>
      </div>

      {/* Next Legal Raise Quick Chips */}
      {quickRaises.length > 0 && (
        <div className="space-y-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#7b8970] block">
            NEXT LEGAL RAISE
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {quickRaises.map((b) => {
              const isSelected = quantity === b.quantity && face === b.face;
              return (
                <button
                  key={`${b.quantity}-${b.face}`}
                  type="button"
                  disabled={disabled || !isMyTurn}
                  onClick={() => {
                    setQuantity(b.quantity);
                    setFace(b.face);
                  }}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition-all duration-200 cursor-pointer select-none ${
                    isSelected
                      ? "border-[#FBD53D] bg-[#242111] text-[#FBD53D] shadow-[0_0_14px_rgba(251,213,61,0.35)] scale-[1.02]"
                      : "border-[#252f1e] bg-[#141911] text-[#f1f4ec] hover:border-[#3d4d2f] hover:bg-[#1b2216]"
                  } disabled:opacity-40 disabled:cursor-not-allowed`}
                >
                  <span className="font-mono font-bold text-xs tracking-normal">
                    {b.quantity} ×
                  </span>
                  <div className="w-5 h-5 shrink-0 flex items-center justify-center">
                    <DieIcon face={b.face} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Stepper + Face Selection */}
      <div className="space-y-3">
        {/* Quantity selector */}
        <div className="flex items-center justify-between p-2 bg-[#171c13] border border-[#232a1b] rounded-2xl">
          <span className="text-xs font-bold text-[#98a08e] pl-2 uppercase tracking-wide">
            Quantity
          </span>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={disabled || !isMyTurn || quantity <= 1}
              className="w-9 h-9 rounded-xl bg-[#20271b] border border-[#2d3725] text-[#f1f4ec] hover:border-[#FBD53D] disabled:opacity-40 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-2xl font-black font-mono text-[#f1f4ec] w-8 text-center tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrement}
              disabled={disabled || !isMyTurn || quantity >= totalDiceOnTable}
              className="w-9 h-9 rounded-xl bg-[#20271b] border border-[#2d3725] text-[#f1f4ec] hover:border-[#FBD53D] disabled:opacity-40 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Die Face selector (1 to 6) */}
        <div className="space-y-1.5">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6b7362] block">
            FACE
          </span>
          <div className="grid grid-cols-6 gap-2">
            {([1, 2, 3, 4, 5, 6] as DieFace[]).map((f) => (
              <FaceDieButton
                key={f}
                face={f}
                isSelected={face === f}
                disabled={disabled || !isMyTurn}
                onClick={() => setFace(f)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Validation / Helper text */}
      <div className="text-xs text-center min-h-[1.25rem]">
        {valid ? (
          <span className="text-[#FBD53D] font-semibold">
            ✓ Bidding {quantity} {quantity === 1 ? faceName(face) : faceNamePlural(face)}
          </span>
        ) : (
          <span className="text-[#f2603c] font-medium">
            {error}
          </span>
        )}
      </div>

      {/* Primary Actions */}
      <div className={`grid gap-3 pt-1 ${currentBid ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1"}`}>
        {/* Raise Bid button */}
        <button
          type="button"
          onClick={() => valid && onBid(quantity, face)}
          disabled={disabled || !isMyTurn || !valid}
          className="w-full min-h-[52px] py-3.5 px-4 rounded-2xl bg-[#FBD53D] hover:bg-[#fce06b] active:scale-[0.98] text-[#141004] font-black text-sm tracking-wider shadow-[0_0_20px_rgba(251,213,61,0.35)] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
        >
          <ArrowUpRight className="w-4 h-4 stroke-[3] shrink-0" />
          <span className="whitespace-nowrap">RAISE BID</span>
        </button>

        {/* Call Bluff button */}
        {currentBid && (
          <button
            type="button"
            onClick={onCallBluff}
            disabled={disabled || !isMyTurn}
            className="w-full min-h-[52px] py-3.5 px-4 rounded-2xl bg-[#f2603c] hover:bg-[#ff714e] active:scale-[0.98] text-white font-black text-sm tracking-wider shadow-[0_0_20px_rgba(242,96,60,0.35)] disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none transition-all flex items-center justify-center gap-2 cursor-pointer select-none"
          >
            <ShieldAlert className="w-4 h-4 stroke-[2.5] shrink-0" />
            <span className="whitespace-nowrap">CALL BLUFF</span>
          </button>
        )}
      </div>
    </div>
  );
}
