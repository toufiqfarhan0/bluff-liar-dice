import React, { useState } from "react";
import type { RoomState } from "../lib/bluff";
import { RingTable } from "./RingTable";
import { EndingTally } from "./EndingPick";
import { Button } from "./Button";
import { Bot, Check, Copy, Play, Users } from "lucide-react";

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
  onAddBots: () => void;
  onStart: () => void;
  onLeave: () => void;
  nameOf?: (key: string) => string;
  you?: string;
  onCopyNotice?: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const enough = room.seats.length >= 3;
  const seats = room.seats.map((seat) => ({
    key: seat.wallet.toBase58(),
    alive: seat.alive,
  }));

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    onCopyNotice?.();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col items-center max-w-md w-full mx-auto space-y-6 animate-in fade-in duration-300">
      {/* Title */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl sm:text-3xl font-black italic tracking-tight text-[#f1f4ec]">
          Assembling Table…
        </h2>
        <p className="text-xs text-[#98a08e]">
          {enough ? "Table ready! Host can launch." : "Liar's Dice needs at least 2 or 3 players. Seat bots to test solo!"}
        </p>
      </div>

      {/* Ring of seated players */}
      <div className="my-2 py-2">
        <RingTable seats={seats} you={you} nameOf={nameOf} size={280}>
          <div className="flex flex-col items-center">
            <span className="text-4xl font-black text-[#f1f4ec] tracking-tighter">
              {room.seats.length}
            </span>
            <span className="text-xs font-semibold text-[#98a08e]">
              {room.seats.length === 1 ? "player joined" : "players joined"}
            </span>
          </div>
        </RingTable>
      </div>

      {/* Stats row */}
      <div className="w-full grid grid-cols-2 rounded-2xl bg-[#171b14] border border-[#2a3122] overflow-hidden divide-x divide-[#2a3122]">
        <div className="p-3.5 flex flex-col gap-0.5">
          <span className="text-[11px] font-semibold text-[#6b7362] uppercase tracking-wider">
            Entry fee
          </span>
          <span className="text-lg font-black text-[#f1f4ec] tracking-tight">
            {(Number(room.stake) / 1e9).toFixed(2)} ◎
          </span>
        </div>
        <div className="p-3.5 flex flex-col gap-0.5">
          <span className="text-[11px] font-semibold text-[#6b7362] uppercase tracking-wider">
            Current pot
          </span>
          <span className="text-lg font-black text-[#FBD53D] tracking-tight">
            {(pot / 1e9).toFixed(2)} ◎
          </span>
        </div>
      </div>

      {/* Share room code */}
      <div className="w-full p-4 bg-[#171b14] border border-[#2a3122] rounded-2xl space-y-2">
        <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6b7362] block">
          SHARE THIS CODE TO INVITE PLAYERS
        </span>
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-[#1f241a] border border-[#2a3122] rounded-xl px-3 py-2 text-xs font-mono text-[#f1f4ec] truncate">
            {code}
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 py-2 px-3 rounded-xl bg-[#FBD53D] text-[#141004] text-xs font-extrabold hover:bg-[#fce06b] transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
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
      <div className="w-full space-y-3 pt-2">
        {isHost ? (
          <>
            {unseatedBots > 0 && (
              <Button
                ghost
                label={
                  <span className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-[#FBD53D]" />
                    <span>Seat {unseatedBots} Bot Players</span>
                  </span>
                }
                onClick={onAddBots}
                disabled={busy}
                className="w-full"
              />
            )}

            <Button
              label={
                <span className="flex items-center gap-2">
                  <Play className="w-4 h-4 fill-current" />
                  <span>START GAME  →</span>
                </span>
              }
              onClick={onStart}
              disabled={busy || !enough}
              className="w-full text-base py-4"
            />

            {!enough && (
              <p className="text-xs text-[#6b7362] text-center">
                Three players are needed to start. Click "Seat Bot Players" to test solo!
              </p>
            )}
          </>
        ) : (
          <div className="p-3.5 bg-[#171b14] border border-[#2a3122] rounded-2xl text-center text-xs text-[#98a08e]">
            Waiting for the host to launch the match…
          </div>
        )}

        <Button
          ghost
          label="Leave and reclaim stake"
          onClick={onLeave}
          disabled={busy}
          className="w-full py-2.5 text-xs text-[#6b7362] hover:text-[#f2603c]"
        />
      </div>
    </div>
  );
}
