import React, { useState } from "react";
import type { RoomState } from "../lib/bluff";
import { EndingTally } from "./EndingPick";
import { Avatar } from "./Avatar";
import { Bot, Check, Copy, Play } from "lucide-react";

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
  const enough = room.seats.length >= 2;

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    onCopyNotice?.();
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8 space-y-5 text-left animate-in fade-in duration-300">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-100">
          Waiting for Players
        </h1>
        <p className="text-xs text-slate-400 mt-0.5">
          {enough ? "Table minimum met. You can start anytime." : "Seat bots to test immediately or share the code."}
        </p>
      </div>

      {/* Roster Panel */}
      <div className="panel p-5 space-y-3">
        <div className="flex items-center justify-between text-xs text-slate-400 border-b border-white/5 pb-2">
          <span>SEATED ({room.seats.length} / 6 PLAYERS)</span>
          <span className="text-orange-400 font-mono font-semibold">POT: {(pot / 1e9).toFixed(2)} SOL</span>
        </div>

        <div className="space-y-2">
          {room.seats.map((seat, idx) => {
            const key = seat.wallet.toBase58();
            const isYou = key === you;
            const displayName = isYou ? "You" : nameOf?.(key) ?? `Player ${idx + 1}`;

            return (
              <div
                key={key}
                className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900/60 border border-white/5"
              >
                <div className="flex items-center gap-2.5">
                  <Avatar who={key} name={displayName} size={28} you={isYou} />
                  <span className={`text-xs font-semibold ${isYou ? "text-orange-400" : "text-slate-200"}`}>
                    {displayName}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 px-2 py-0.5 rounded">
                  Ready
                </span>
              </div>
            );
          })}

          {Array.from({ length: Math.max(0, 6 - room.seats.length) }).map((_, idx) => (
            <div
              key={`empty-${idx}`}
              className="flex items-center justify-between p-2.5 rounded-lg border border-dashed border-white/5 text-slate-600"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full border border-dashed border-white/10 flex items-center justify-center text-[10px] font-mono">
                  +
                </div>
                <span className="text-xs font-mono text-slate-500">Open Seat {room.seats.length + idx + 1}</span>
              </div>
              <span className="text-[10px] font-mono text-slate-600">Empty</span>
            </div>
          ))}
        </div>
      </div>

      {/* Share room code */}
      <div className="panel p-4 space-y-2">
        <label className="text-xs text-slate-400 block font-medium">Invite Code</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs font-mono text-orange-300 truncate">
            {code}
          </div>
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 border border-white/10 text-slate-200 text-xs font-medium hover:bg-slate-700 transition cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
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

      <EndingTally room={room} />

      {/* Actions */}
      <div className="space-y-2.5 pt-1">
        {isHost ? (
          <>
            {unseatedBots > 0 && (
              <button
                type="button"
                onClick={onAddBots}
                disabled={busy}
                className="w-full rounded-lg border border-white/10 bg-slate-900/60 px-5 py-3 text-sm font-semibold text-slate-200 hover:border-white/25 transition cursor-pointer flex items-center justify-center gap-2"
              >
                <Bot className="w-4 h-4 text-orange-400" />
                <span>Seat {unseatedBots} AI Bots</span>
              </button>
            )}

            <button
              type="button"
              onClick={onStart}
              disabled={busy || !enough}
              className="w-full rounded-lg bg-orange-600 px-5 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-600/30 transition hover:bg-orange-500 cursor-pointer disabled:opacity-40 flex items-center justify-center gap-2"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Start Game</span>
            </button>
          </>
        ) : (
          <div className="panel p-4 text-center text-xs text-slate-400">
            Waiting for table host to start match…
          </div>
        )}

        <button
          type="button"
          onClick={onLeave}
          disabled={busy}
          className="w-full py-2 text-xs text-slate-500 hover:text-rose-400 transition cursor-pointer"
        >
          Leave table & reclaim stake
        </button>
      </div>
    </div>
  );
}
