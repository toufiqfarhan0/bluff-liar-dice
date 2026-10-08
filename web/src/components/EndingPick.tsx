import React from "react";
import { Ending, type RoomState } from "../lib/bluff";
import { Coins, Divide } from "lucide-react";

export function EndingPick({
  value,
  onChange,
  disabled = false,
}: {
  value: Ending;
  onChange: (next: Ending) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-2">
      <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#6b7362]">
        HEADS-UP SHOWDOWN TIEBREAK (FINAL 2 PLAYERS)
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Split Option */}
        <button
          type="button"
          onClick={() => onChange(Ending.Split)}
          disabled={disabled}
          className={`group flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
            value === Ending.Split
              ? "bg-[#201d10] border-[#FBD53D] shadow-[0_0_15px_-3px_rgba(251, 213, 61,0.25)]"
              : "bg-[#171b14] border-[#2a3122] hover:border-[#3f4a33] opacity-75 hover:opacity-100"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Divide
              className={`w-4 h-4 ${
                value === Ending.Split ? "text-[#FBD53D]" : "text-[#98a08e]"
              }`}
            />
            <span
              className={`text-sm font-extrabold ${
                value === Ending.Split ? "text-[#FBD53D]" : "text-[#f1f4ec]"
              }`}
            >
              Split Pot
            </span>
          </div>
          <span className="text-xs text-[#98a08e] leading-snug">
            If final 2 finalists tie or stalemate, split pot 50/50.
          </span>
        </button>

        {/* Coin Flip Option */}
        <button
          type="button"
          onClick={() => onChange(Ending.Coin)}
          disabled={disabled}
          className={`group flex flex-col items-start p-3.5 rounded-2xl border text-left transition-all duration-200 cursor-pointer ${
            value === Ending.Coin
              ? "bg-[#201d10] border-[#FBD53D] shadow-[0_0_15px_-3px_rgba(251, 213, 61,0.25)]"
              : "bg-[#171b14] border-[#2a3122] hover:border-[#3f4a33] opacity-75 hover:opacity-100"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Coins
              className={`w-4 h-4 ${
                value === Ending.Coin ? "text-[#FBD53D]" : "text-[#98a08e]"
              }`}
            />
            <span
              className={`text-sm font-extrabold ${
                value === Ending.Coin ? "text-[#FBD53D]" : "text-[#f1f4ec]"
              }`}
            >
              Winner Takes All
            </span>
          </div>
          <span className="text-xs text-[#98a08e] leading-snug">
            Sole champion rule. Verifiable coin flip picks 1 winner.
          </span>
        </button>
      </div>

      <p className="text-[11px] text-[#6b7362] leading-relaxed">
        Eliminate all opponents to win 100% solo! This tiebreak vote only triggers if the table reaches the final 2 finalists.
      </p>
    </div>
  );
}

export function EndingTally({ room }: { room: RoomState }) {
  const coins = room.seats.filter((seat) => seat.endingVote === Ending.Coin).length;
  const splits = room.seats.length - coins;
  const winning = coins > splits ? "Winner Takes All" : "Split Pot";

  return (
    <div className="bg-[#171b14] border border-[#2a3122] rounded-2xl p-4 space-y-1.5">
      <div className="text-[10px] font-extrabold uppercase tracking-widest text-[#6b7362]">
        SHOWDOWN RULE VOTES
      </div>
      <div className="text-sm text-[#98a08e]">
        <strong className="text-[#f1f4ec] font-bold">{winning}</strong>
        {coins === splits
          ? ` — table is tied ${coins}–${splits} (defaults to Split Pot).`
          : ` — ${Math.max(coins, splits)} of ${room.seats.length} players favor this.`}
      </div>
    </div>
  );
}
