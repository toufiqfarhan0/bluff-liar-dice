import React from "react";
import { Wordmark } from "./Wordmark";
import { Button } from "./Button";
import { GuardBar } from "./FairnessModal";
import { Search } from "lucide-react";

export function LobbyScreen({
  stake,
  botSeats,
  joinCode,
  onChangeJoinCode,
  onFindRoom,
  onOpenRoom,
  onOpenFairness,
  busy,
}: {
  stake: bigint;
  botSeats: number;
  joinCode: string;
  onChangeJoinCode: (code: string) => void;
  onFindRoom: () => void;
  onOpenRoom: () => void;
  onOpenFairness: () => void;
  busy: boolean;
}) {
  const stakeSol = (Number(stake) / 1e9).toFixed(2);
  const estPotSol = ((Number(stake) * (botSeats + 1)) / 1e9).toFixed(2);

  return (
    <div className="w-full mx-auto flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 xl:gap-16 animate-in fade-in duration-300">
      {/* Left Column: Brand Hero, Actions & Room Joining */}
      <div className="flex flex-col items-center lg:items-start text-center lg:text-left max-w-md w-full space-y-5">
        {/* Brand Header */}
        <div className="flex flex-col items-center lg:items-start space-y-2 select-none">
          <Wordmark />
          <h1 className="text-xl sm:text-2xl font-black text-[#f1f4ec] tracking-tight pt-1">
            Bid high. Call bluff. Take the pot.
          </h1>
          <p className="text-xs sm:text-sm text-[#98a08e] leading-relaxed max-w-sm">
            Roll secret dice in Private TEE enclaves. Bid higher, challenge liars, and be the last player standing.
          </p>
        </div>

        {/* Main Play Action & Room Joining */}
        <div className="w-full space-y-3.5">
          <Button
            label="PLAY  →"
            onClick={onOpenRoom}
            disabled={busy}
            className="w-full text-base py-3.5 shadow-[0_0_25px_rgba(251,213,61,0.25)] hover:shadow-[0_0_35px_rgba(251,213,61,0.4)]"
          />

          {/* Stake & Pot Stats - Sleek minimal badges */}
          <div className="grid grid-cols-2 gap-2.5 w-full">
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#131810]/70 border border-[#232d1b]/70">
              <span className="text-[10px] font-semibold text-[#6d7764] uppercase tracking-wider">
                Entry fee
              </span>
              <span className="text-xs sm:text-sm font-black text-[#f1f4ec] font-mono">
                {stakeSol} ◎
              </span>
            </div>
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#131810]/70 border border-[#232d1b]/70">
              <span className="text-[10px] font-semibold text-[#6d7764] uppercase tracking-wider">
                Est. pot (6 seats)
              </span>
              <span className="text-xs sm:text-sm font-black text-[#FBD53D] font-mono">
                ~{estPotSol} ◎
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 w-full py-0.5">
            <div className="h-px flex-1 bg-[#222a1b]" />
            <span className="text-[10px] font-bold text-[#5e6755] uppercase tracking-widest">
              or join private room
            </span>
            <div className="h-px flex-1 bg-[#222a1b]" />
          </div>

          {/* Clean Integrated Search & Join Input */}
          <div className="flex items-center gap-2 p-1.5 pl-3.5 bg-[#12160e] border border-[#242e1c] focus-within:border-[#FBD53D]/60 focus-within:ring-1 focus-within:ring-[#FBD53D]/30 rounded-2xl transition-all">
            <Search className="w-4 h-4 text-[#636d5a] shrink-0" />
            <input
              type="text"
              value={joinCode}
              onChange={(e) => onChangeJoinCode(e.target.value)}
              placeholder="Paste room code or invite link..."
              className="w-full bg-transparent text-xs sm:text-sm text-[#f1f4ec] placeholder-[#555f4d] outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0 border-0 shadow-none"
              style={{ outline: "none", boxShadow: "none" }}
            />
            <button
              type="button"
              onClick={onFindRoom}
              disabled={busy || !joinCode.trim()}
              className="shrink-0 px-4 py-2 bg-[#1c2317] hover:bg-[#FBD53D] text-[#8e9883] hover:text-[#141004] disabled:opacity-40 disabled:hover:bg-[#1c2317] disabled:hover:text-[#8e9883] rounded-xl text-xs font-bold transition-all cursor-pointer disabled:cursor-not-allowed"
            >
              Join
            </button>
          </div>
        </div>

        {/* Clean trust / privacy note */}
        <GuardBar onClick={onOpenFairness} />
      </div>

      {/* Right Column: Clean Animated Table Only (Enlarged Hero Display) */}
      <div className="w-full lg:flex-1 max-w-[620px] xl:max-w-[680px] flex items-center justify-center">
        <div className="relative w-full max-w-[560px] xl:max-w-[620px] aspect-square flex items-center justify-center select-none">
          <img
            src="/bluff-table-animation.gif"
            alt="Bluff Liar's Dice Live Table Match"
            className="w-full h-full object-contain select-none pointer-events-none drop-shadow-[0_24px_70px_rgba(0,0,0,0.9)]"
            loading="eager"
          />
        </div>
      </div>
    </div>
  );
}
