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
    <div className="space-y-2.5">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        If down to the final two players
      </div>

      <div className="grid grid-cols-2 gap-3">
        {/* Split Option */}
        <button
          type="button"
          onClick={() => onChange(Ending.Split)}
          disabled={disabled}
          className={`panel p-4 text-left transition-all cursor-pointer ${
            value === Ending.Split
              ? "border-orange-500/50 bg-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.2)]"
              : "hover:border-white/20"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Divide
              className={`w-4 h-4 ${
                value === Ending.Split ? "text-orange-400" : "text-slate-400"
              }`}
            />
            <span
              className={`text-sm font-semibold ${
                value === Ending.Split ? "text-orange-400" : "text-slate-200"
              }`}
            >
              Split
            </span>
          </div>
          <span className="text-xs text-slate-400 leading-snug">
            Both players split the pot 50/50.
          </span>
        </button>

        {/* Coin Flip Option */}
        <button
          type="button"
          onClick={() => onChange(Ending.Coin)}
          disabled={disabled}
          className={`panel p-4 text-left transition-all cursor-pointer ${
            value === Ending.Coin
              ? "border-orange-500/50 bg-orange-500/10 shadow-[0_0_15px_rgba(249,115,22,0.2)]"
              : "hover:border-white/20"
          } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Coins
              className={`w-4 h-4 ${
                value === Ending.Coin ? "text-orange-400" : "text-slate-400"
              }`}
            />
            <span
              className={`text-sm font-semibold ${
                value === Ending.Coin ? "text-orange-400" : "text-slate-200"
              }`}
            >
              Coin flip
            </span>
          </div>
          <span className="text-xs text-slate-400 leading-snug">
            On-chain VRF oracle picks one winner.
          </span>
        </button>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        Everyone at the table votes and majority rules. Ties default to split.
      </p>
    </div>
  );
}

export function EndingTally({ room }: { room: RoomState }) {
  const coins = room.seats.filter((seat) => seat.endingVote === Ending.Coin).length;
  const splits = room.seats.length - coins;
  const winning = coins > splits ? "Coin flip" : "Split";

  return (
    <div className="panel p-4 space-y-1 text-left">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        Table vote status
      </div>
      <div className="text-sm text-slate-300">
        <strong className="text-orange-400 font-semibold">{winning}</strong>
        {coins === splits
          ? ` — table is tied ${coins}–${splits} (defaults to Split).`
          : ` — ${Math.max(coins, splits)} of ${room.seats.length} players favor this.`}
      </div>
    </div>
  );
}
