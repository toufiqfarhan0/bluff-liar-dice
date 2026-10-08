import React, { useState, useEffect } from "react";
import { Bid, DieFace, dieSymbol, faceNamePlural, isValidRaise } from "../lib/dice";
import { AlertTriangle, ArrowUpRight, Flame, Minus, Plus, ShieldAlert } from "lucide-react";

export function BidControls({
  currentBid,
  totalDiceOnTable,
  onBid,
  onCallBluff,
  isMyTurn,
  disabled,
}: {
  currentBid: Bid | null;
  totalDiceOnTable: number;
  onBid: (quantity: number, face: DieFace) => void;
  onCallBluff: () => void;
  isMyTurn: boolean;
  disabled: boolean;
}) {
  // Initial suggestion
  const defaultQuantity = currentBid ? (currentBid.face === 6 ? currentBid.quantity + 1 : currentBid.quantity) : 1;
  const defaultFace = currentBid ? (currentBid.face === 6 ? 2 : (currentBid.face + 1) as DieFace) : 2;

  const [quantity, setQuantity] = useState<number>(defaultQuantity);
  const [face, setFace] = useState<DieFace>(defaultFace);

  // Sync suggestion when currentBid changes
  useEffect(() => {
    if (currentBid) {
      if (currentBid.face === 6) {
        setQuantity(currentBid.quantity + 1);
        setFace(2);
      } else {
        setQuantity(currentBid.quantity);
        setFace((currentBid.face + 1) as DieFace);
      }
    } else {
      setQuantity(1);
      setFace(2);
    }
  }, [currentBid]);

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

  return (
    <div className="w-full p-5 rounded-3xl bg-[#12160e] border border-[#2a3122] shadow-2xl space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6b7362]">
          {isMyTurn ? "YOUR MOVE" : "OPPONENT'S TURN"}
        </span>
        <span className="text-xs font-semibold text-[#98a08e]">
          Table Total: <strong className="text-[#f1f4ec] font-bold">{totalDiceOnTable} dice</strong>
        </span>
      </div>

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
            Select Die Face
          </span>
          <div className="grid grid-cols-6 gap-1.5">
            {([1, 2, 3, 4, 5, 6] as DieFace[]).map((f) => {
              const isSelected = face === f;
              const isAce = f === 1;

              return (
                <button
                  key={f}
                  type="button"
                  disabled={disabled || !isMyTurn}
                  onClick={() => setFace(f)}
                  className={`py-3 px-1 rounded-xl border flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#FBD53D] text-[#141004] border-[#FBD53D] shadow-[0_0_15px_rgba(251, 213, 61,0.4)] scale-105 font-black"
                      : "bg-[#171c13] text-[#f1f4ec] border-[#252d1d] hover:border-[#3d4b2e] hover:bg-[#1e2418]"
                  }`}
                >
                  <span className="text-xl leading-none">{dieSymbol(f)}</span>
                  <span className="text-[10px] mt-1 font-bold">
                    {isAce ? "Ace" : f}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Validation / Helper text */}
      <div className="text-xs text-center min-h-[1.25rem]">
        {valid ? (
          <span className="text-[#FBD53D] font-semibold">
            ✓ Bidding {quantity} {faceNamePlural(face)}
          </span>
        ) : (
          <span className="text-[#f2603c] font-medium">
            {error}
          </span>
        )}
      </div>

      {/* Primary Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Raise Bid button */}
        <button
          type="button"
          onClick={() => valid && onBid(quantity, face)}
          disabled={disabled || !isMyTurn || !valid}
          className="w-full py-3.5 px-4 rounded-2xl bg-[#FBD53D] hover:bg-[#fce06b] text-[#141004] font-black text-sm tracking-wide shadow-[0_0_20px_rgba(251, 213, 61,0.35)] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <ArrowUpRight className="w-4 h-4 stroke-[3]" />
          <span>RAISE BID</span>
        </button>

        {/* Call Bluff button */}
        {currentBid && (
          <button
            type="button"
            onClick={onCallBluff}
            disabled={disabled || !isMyTurn}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#f2603c] hover:bg-[#ff714e] text-white font-black text-sm tracking-wide shadow-[0_0_20px_rgba(242,96,60,0.35)] disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer animate-pulse"
          >
            <ShieldAlert className="w-4 h-4 stroke-[2.5]" />
            <span>CALL BLUFF! (LIAR)</span>
          </button>
        )}
      </div>
    </div>
  );
}
