import React, { useState, useEffect } from "react";
import { Bid, DieFace, dieSymbol, faceNamePlural, isValidRaise } from "../lib/dice";
import { ArrowUpRight, Flame, Minus, Plus, ShieldAlert } from "lucide-react";

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
  const defaultQuantity = currentBid ? (currentBid.face === 6 ? currentBid.quantity + 1 : currentBid.quantity) : 1;
  const defaultFace = currentBid ? (currentBid.face === 6 ? 2 : (currentBid.face + 1) as DieFace) : 2;

  const [quantity, setQuantity] = useState<number>(defaultQuantity);
  const [face, setFace] = useState<DieFace>(defaultFace);

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
    <div className="w-full p-4 sm:p-5 tactical-panel space-y-4">
      {/* Top turn indicator & table total */}
      <div className="flex items-center justify-between border-b border-[#2b1a10] pb-3">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#9c897d] flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full ${
              isMyTurn
                ? "bg-orange-500 shadow-[0_0_8px_#f97316] animate-pulse"
                : "bg-[#635349]"
            }`}
          />
          <span className={isMyTurn ? "text-orange-400 font-black" : "text-[#9c897d]"}>
            {isMyTurn ? "YOUR TURN TO ACT" : "AWAITING OPPONENT MOVE"}
          </span>
        </span>
        <span className="text-xs font-mono text-[#9c897d]">
          TABLE POOL: <strong className="text-[#faf5f0]">{totalDiceOnTable} DICE</strong>
        </span>
      </div>

      {/* Inputs: Quantity Stepper + Die Face Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Quantity Stepper */}
        <div className="p-3 bg-[#130d08] border border-[#2b1a10] rounded-xl flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-[#9c897d] uppercase tracking-wide">
            Quantity
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDecrement}
              disabled={disabled || !isMyTurn || quantity <= 1}
              className="w-9 h-9 rounded-lg bg-[#1c120c] border border-[#331f15] text-[#faf5f0] hover:border-orange-500 hover:text-orange-400 disabled:opacity-30 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-2xl font-black font-mono text-orange-400 w-9 text-center tabular-nums">
              {quantity}
            </span>
            <button
              type="button"
              onClick={handleIncrement}
              disabled={disabled || !isMyTurn || quantity >= totalDiceOnTable}
              className="w-9 h-9 rounded-lg bg-[#1c120c] border border-[#331f15] text-[#faf5f0] hover:border-orange-500 hover:text-orange-400 disabled:opacity-30 flex items-center justify-center transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Die Face Selector (1-6) */}
        <div className="p-2.5 bg-[#130d08] border border-[#2b1a10] rounded-xl flex flex-col justify-center gap-1">
          <span className="text-[10px] font-mono font-bold text-[#9c897d] uppercase tracking-wider block">
            Face Claimed
          </span>
          <div className="grid grid-cols-6 gap-1">
            {([1, 2, 3, 4, 5, 6] as DieFace[]).map((f) => {
              const isSelected = face === f;
              const isAce = f === 1;

              return (
                <button
                  key={f}
                  type="button"
                  disabled={disabled || !isMyTurn}
                  onClick={() => setFace(f)}
                  className={`py-1.5 px-0.5 rounded-lg border flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isSelected
                      ? "bg-gradient-to-br from-orange-500 to-amber-600 border-amber-300 text-black font-black shadow-[0_0_12px_rgba(249,115,22,0.5)] scale-105"
                      : "bg-[#1c120c] text-[#faf5f0] border-[#2b1a10] hover:border-orange-500/40 hover:bg-[#251710]"
                  }`}
                >
                  <span className="text-base leading-none">{dieSymbol(f)}</span>
                  <span className={`text-[9px] mt-0.5 font-mono ${isSelected ? "text-black font-bold" : "text-[#9c897d]"}`}>
                    {isAce ? "Ace" : f}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Validation status pill */}
      <div className="text-xs font-mono text-center min-h-[1.25rem]">
        {valid ? (
          <span className="text-amber-400 font-semibold flex items-center justify-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-orange-400" />
            <span>Valid claim: {quantity} {faceNamePlural(face)}</span>
          </span>
        ) : (
          <span className="text-red-400 font-medium">
            {error}
          </span>
        )}
      </div>

      {/* Action Buttons: Raise and Call Bluff */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {/* Raise Claim button */}
        <button
          type="button"
          onClick={() => valid && onBid(quantity, face)}
          disabled={disabled || !isMyTurn || !valid}
          className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-400 hover:via-amber-400 hover:to-orange-500 text-black font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_4px_22px_-2px_rgba(249,115,22,0.45)] disabled:opacity-35 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer border border-amber-300/40"
        >
          <ArrowUpRight className="w-4 h-4 stroke-[3]" />
          <span>RAISE CLAIM</span>
        </button>

        {/* Call Bluff button */}
        {currentBid && (
          <button
            type="button"
            onClick={onCallBluff}
            disabled={disabled || !isMyTurn}
            className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-black text-xs sm:text-sm tracking-wider uppercase shadow-[0_4px_20px_-2px_rgba(220,38,38,0.5)] disabled:opacity-35 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 cursor-pointer border border-red-400/40 animate-pulse"
          >
            <ShieldAlert className="w-4 h-4 stroke-[2.5]" />
            <span>CALL BLUFF! (LIAR)</span>
          </button>
        )}
      </div>
    </div>
  );
}
