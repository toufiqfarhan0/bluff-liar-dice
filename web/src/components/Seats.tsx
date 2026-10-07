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
            className={`flex items-center gap-3 py-2 px-3.5 bg-[#140d09]/80 border rounded-xl transition-all duration-200 ${
              !seat.alive
                ? "opacity-40 border-[#331f15]"
                : done
                  ? "border-orange-500/40 bg-[#22140c]/80 shadow-[0_0_12px_-4px_rgba(249,115,22,0.25)]"
                  : "border-[#331f15]"
            }`}
          >
            <Avatar who={key} name={name} size={32} out={!seat.alive} you={isYou} />

            <div className="flex-1 min-w-0">
              <span
                className={`text-sm font-semibold truncate block ${
                  isYou ? "text-orange-400" : "text-[#faf5f0]"
                }`}
              >
                {name}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-semibold">
              {!seat.alive ? (
                <>
                  <XCircle className="w-3.5 h-3.5 text-red-400" />
                  <span className="text-red-400">out</span>
                </>
              ) : done ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-400" />
                  <span className="text-orange-400">ready</span>
                </>
              ) : (
                <>
                  <Clock className="w-3.5 h-3.5 text-[#6e5e54] animate-pulse" />
                  <span className="text-[#6e5e54]">waiting…</span>
                </>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
