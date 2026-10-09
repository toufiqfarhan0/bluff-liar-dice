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
    <div className="w-full max-w-4xl mx-auto flex flex-col items-center space-y-6 animate-in fade-in duration-300">
      {/* Title & Subtitle Centered Spanning Both Columns */}
      <div className="text-center space-y-1 select-none">
        <h2 className="text-2xl sm:text-3xl font-black tracking-wide text-[#f1f4ec]">
          Assembling Table…
        </h2>
        <p className="text-xs sm:text-sm text-[#98a08e]">
          {enough
            ? "Table ready! Host can launch."
            : "Liar's Dice needs at least 3 players to start. Seat bots to test solo!"}
        </p>
      </div>

      {/* Side-by-side Columns: Controls on Left, Seated Table on Right */}
      <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 items-stretch justify-center">
        {/* Left Column: Invites, Showdown Votes, Bots & Start Controls */}
        <div className="flex flex-col w-full space-y-3.5">
          {/* Share room invite & code */}
          <div className="w-full p-4 bg-[#141910] border border-[#242e1c] rounded-2xl space-y-3 shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#6d7764]">
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
              <div
                className="flex-1 bg-[#1a2016] border border-[#242e1c] rounded-xl px-3 py-1.5 text-[11px] font-mono text-[#98a08e] truncate"
                title={code}
              >
                {code}
              </div>
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-[#1a2016] border border-[#242e1c] text-[#f1f4ec] text-xs font-semibold hover:border-[#FBD53D]/50 hover:text-[#FBD53D] transition-colors cursor-pointer"
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
          <div className="w-full space-y-2 pt-0.5">
            {isHost ? (
              <>
                {unseatedBots > 0 && (
                  <div className="space-y-2 p-3 bg-[#141910] border border-[#242e1c] rounded-2xl">
                    <div className="flex items-center justify-between text-[10px] font-extrabold uppercase tracking-wider text-[#6d7764]">
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
                            className="py-1.5 px-2.5 rounded-xl bg-[#1a2016] hover:bg-[#232b1d] border border-[#242e1c] hover:border-[#FBD53D]/50 text-xs font-black text-[#f1f4ec] transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center gap-1.5"
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
              <div className="p-3 bg-[#141910] border border-[#242e1c] rounded-2xl text-center text-xs text-[#98a08e]">
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

        {/* Right Column: Seated Table Ring & Pot/Entry Stats (Matched Height) */}
        <div className="flex flex-col justify-between w-full h-full space-y-3.5">
          {/* Ring of seated players Stage (Enlarged Hero Ring) */}
          <div className="w-full flex-1 flex items-center justify-center p-4 sm:p-6 rounded-3xl bg-[#12160e]/80 border border-[#242e1c] shadow-lg min-h-[350px]">
            <RingTable seats={seats} you={you} nameOf={nameOf} size={350}>
              <div className="flex flex-col items-center">
                <span className="text-4xl font-black text-[#f1f4ec] tracking-normal font-mono">
                  {room.seats.length}
                </span>
                <span className="text-xs font-semibold text-[#98a08e]">
                  {room.seats.length === 1 ? "player joined" : "players joined"}
                </span>
              </div>
            </RingTable>
          </div>

          {/* Stats row pinned to the bottom */}
          <div className="w-full grid grid-cols-2 gap-2.5">
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#131810]/70 border border-[#232d1b]/70">
              <span className="text-[10px] font-semibold text-[#6d7764] uppercase tracking-wider">
                Entry fee
              </span>
              <span className="text-xs sm:text-sm font-black text-[#f1f4ec] font-mono">
                {(Number(room.stake) / 1e9).toFixed(2)} ◎
              </span>
            </div>
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-[#131810]/70 border border-[#232d1b]/70">
              <span className="text-[10px] font-semibold text-[#6d7764] uppercase tracking-wider">
                Current pot
              </span>
              <span className="text-xs sm:text-sm font-black text-[#FBD53D] font-mono">
                {(pot / 1e9).toFixed(2)} ◎
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
