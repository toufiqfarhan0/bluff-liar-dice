import React from "react";
import type { RoomState, Seat } from "../lib/bluff";
import { Avatar, shortKey } from "./Avatar";
import { CheckCircle2, Clock, XCircle } from "lucide-react";

export function answered(seat: Seat, round: number): boolean {
  return seat.hasAnswered && seat.answeredRound === round;
}

export function Seats({
  room,
  you,
  nameOf,
}: {
  room: RoomState;
  you?: string;
  nameOf?: (key: string) => string;
}) {
  return (
    <div className="flex flex-col gap-2">
      {room.seats.map((seat) => {
        const key = seat.wallet.toBase58();
        const done = answered(seat, room.round);
        const isYou = key === you;
        const name = isYou ? "You" : nameOf?.(key) ?? shortKey(key);

        return (
          <div
            key={key}
            className={`flex items-center gap-3 py-2 px-3.5 bg-[#171b14] border rounded-xl transition-all duration-200 ${
              !seat.alive
                ? "opacity-40 border-[#2a3122]"
                : done
                  ? "border-[#FBD53D]/40 bg-[#201d10]/50 shadow-[0_0_12px_-4px_rgba(251, 213, 61,0.15)]"
                  : "border-[#2a3122]"
            }`}
          >
            <Avatar who={key} name={name} size={32} out={!seat.alive} you={isYou} />

            <div className="flex-1 min-w-0">
              <span
                className={`text-sm font-semibold truncate block ${
                  isYou ? "text-[#FBD53D]" : "text-[#f1f4ec]"
                }`}
              >
                {name}
              </span>
              {name !== shortKey(key) && name !== "You" && (
                <span className="text-[10px] font-mono text-[#6b7362] block truncate">
                  {shortKey(key)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold">
              {!seat.alive ? (
                <>
                  <XCircle className="w-3.5 h-3.5 text-[#f2603c]" />
                  <span className="text-[#f2603c]">out</span>
                </>
              ) : done ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#FBD53D]" />
                  <span className="text-[#FBD53D]">locked in</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-[#6b7362] animate-pulse" />
                  <span className="text-[#6b7362]">thinking…</span>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
