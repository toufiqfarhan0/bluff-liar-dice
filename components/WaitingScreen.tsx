import React, { useState } from "react";
import type { RoomState } from "../lib/bluff";
import { RingTable } from "./RingTable";
import { EndingTally } from "./EndingPick";
import { Button } from "./Button";
import { Bot, Check, Copy, Link as LinkIcon, Play, Users } from "lucide-react";

export function WaitingScreen({
  room,
  code,
  pot,
  isHost,
  busy,
  unseatedBots,
  onAddBots,
  onStart,
  onLeave,
  nameOf,
  you,
  onCopyNotice,
}: {
  room: RoomState;
  code: string;
  pot: number;
  isHost: boolean;
  busy: boolean;
  unseatedBots: number;
  onAddBots: (count: number) => void;
  onStart: () => void;
  onLeave: () => void;
  nameOf?: (key: string) => string;
  you?: string;
  onCopyNotice?: (msg?: string) => void;
}) {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const enough = room.seats.length >= 3;
  const seats = room.seats.map((seat) => ({
    key: seat.wallet.toBase58(),
    alive: seat.alive,
  }));

  const inviteUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/?room=${encodeURIComponent(code)}`
      : `/?room=${code}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(inviteUrl);
    setCopiedLink(true);
    onCopyNotice?.("Invite link copied to clipboard!");
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    onCopyNotice?.("Room code copied to clipboard!");
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="flex flex-col items-center max-w-md w-full mx-auto space-y-3.5 animate-in fade-in duration-300">
      {/* Title */}
      <div className="text-center space-y-0.5">
        <h2 className="text-xl sm:text-2xl font-black tracking-wide text-[#f1f4ec]">
          Assembling Table…
        </h2>
        <p className="text-xs text-[#98a08e]">
          {enough ? "Table ready! Host can launch." : "Liar's Dice needs at least 3 players to start. Seat bots to test solo!"}
        </p>
      </div>

      {/* Ring of seated players */}
      <div className="my-1 py-1">
        <RingTable seats={seats} you={you} nameOf={nameOf} size={230}>
          <div className="flex flex-col items-center">
            <span className="text-3xl font-black text-[#f1f4ec] tracking-normal">
              {room.seats.length}
            </span>
            <span className="text-[11px] font-semibold text-[#98a08e]">
              {room.seats.length === 1 ? "player joined" : "players joined"}
            </span>
          </div>
        </RingTable>
      </div>

      {/* Stats row */}
      <div className="w-full grid grid-cols-2 rounded-2xl bg-[#171b14] border border-[#2a3122] overflow-hidden divide-x divide-[#2a3122]">
        <div className="p-2.5 flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold text-[#6b7362] uppercase tracking-wider">
            Entry fee
          </span>
          <span className="text-base font-black text-[#f1f4ec] tracking-wide">
            {(Number(room.stake) / 1e9).toFixed(2)} ◎
          </span>
        </div>
        <div className="p-2.5 flex flex-col gap-0.5">
          <span className="text-[10px] font-semibold text-[#6b7362] uppercase tracking-wider">
            Current pot
          </span>
          <span className="text-base font-black text-[#FBD53D] tracking-wide">
            {(pot / 1e9).toFixed(2)} ◎
          </span>
        </div>
      </div>

      {/* Share room invite & code */}
      <div className="w-full p-3.5 bg-[#171b14] border border-[#2a3122] rounded-2xl space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6b7362]">
            INVITE PLAYERS
          </span>
          <span className="text-[10px] text-[#98a08e] font-mono">
            1-Click Link or Code
          </span>
        </div>

        {/* 1-Click Invite Link Button (Primary) */}
        <button
          type="button"
          onClick={handleCopyLink}
          className="w-full flex items-center justify-between gap-2 py-2.5 px-3.5 rounded-xl bg-[#FBD53D] text-[#141004] text-xs font-black hover:bg-[#fce06b] active:scale-[0.99] transition-all cursor-pointer shadow-sm"
        >
          <span className="flex items-center gap-2">
            {copiedLink ? <Check className="w-4 h-4 text-emerald-950" /> : <LinkIcon className="w-4 h-4" />}
            <span>{copiedLink ? "Invite Link Copied!" : "Copy 1-Click Invite Link"}</span>
          </span>
          <span className="text-[10px] font-bold uppercase tracking-wider bg-black/10 px-2 py-0.5 rounded-md">
            Share URL
          </span>
        </button>

        {/* Room Code with Copy Code Button (Secondary) */}
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-[#1f241a] border border-[#2a3122] rounded-xl px-3 py-1.5 text-[11px] font-mono text-[#98a08e] truncate" title={code}>
            {code}
          </div>
          <button
            type="button"
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#1f241a] border border-[#2a3122] text-[#f1f4ec] text-xs font-semibold hover:border-[#FBD53D]/50 hover:text-[#FBD53D] transition-colors cursor-pointer"
          >
            {copiedCode ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Code</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Voting Tally */}
      <div className="w-full">
        <EndingTally room={room} />
      </div>

      {/* Host / Player Controls */}
      <div className="w-full space-y-2 pt-1">
        {isHost ? (
          <>
            {unseatedBots > 0 && (
              <div className="space-y-1.5 p-3 bg-[#171b14] border border-[#2a3122] rounded-2xl">
                <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-[#6b7362]">
                  <span className="flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-[#FBD53D]" />
                    <span>SEAT BOTS</span>
                  </span>
                  <span className="text-[10px] text-[#98a08e]">{unseatedBots} available</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[3, 4, 5].map((count) => {
                    const maxCanSeat = Math.max(0, 6 - room.seats.length);
                    const canSeatThis = count <= maxCanSeat && count <= unseatedBots;
                    return (
                      <button
                        key={count}
                        type="button"
                        disabled={busy || !canSeatThis}
                        onClick={() => onAddBots(count)}
                        className="py-1.5 px-2.5 rounded-xl bg-[#1f241a] hover:bg-[#283021] border border-[#2a3122] hover:border-[#FBD53D]/50 text-xs font-black text-[#f1f4ec] transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
                      >
                        <Bot className="w-3.5 h-3.5 text-[#FBD53D]" />
                        <span>{count} Bots</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            <Button
              label={
                <span className="flex items-center justify-center gap-2">
                  <Play className="w-4 h-4 fill-current" />
                  <span>START GAME  →</span>
                </span>
              }
              onClick={onStart}
              disabled={busy || !enough}
              className="w-full text-base py-3"
            />

            {!enough && (
              <p className="text-[11px] text-[#6b7362] text-center">
                Three players are needed to start. Click "Seat Bot Players" to test solo!
              </p>
            )}
          </>
        ) : (
          <div className="p-3 bg-[#171b14] border border-[#2a3122] rounded-2xl text-center text-xs text-[#98a08e]">
            Waiting for the host to launch the match…
          </div>
        )}

        <Button
          ghost
          label="Leave and reclaim stake"
          onClick={onLeave}
          disabled={busy}
          className="w-full py-2 text-xs text-[#6b7362] hover:text-[#f2603c]"
        />
      </div>
    </div>
  );
}
