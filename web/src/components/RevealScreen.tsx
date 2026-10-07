import React, { useEffect, useState } from "react";
import { Outcome, type RoomState } from "../lib/bluff";
import { Avatar, shortKey } from "./Avatar";
import { Button } from "./Button";
import { ArrowRight, Skull, Users } from "lucide-react";

interface Group {
  word: string;
  members: { key: string; alive: boolean; isYou: boolean; name: string }[];
}

export function RevealScreen({
  room,
  question,
  you,
  nameOf,
  onNext,
}: {
  room: RoomState;
  question: string;
  you?: string;
  nameOf?: (key: string) => string;
  onNext: () => void;
}) {
  const [left, setLeft] = useState(7);

  useEffect(() => {
    const id = setInterval(() => {
      setLeft((n) => {
        if (n <= 1) {
          onNext();
          return 0;
        }
        return n - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [onNext]);

  // Group by answer
  const groups: Group[] = [];
  room.seats.forEach((seat, i) => {
    const word = room.lastWords[i];
    if (!word) return;
    const key = seat.wallet.toBase58();
    const member = {
      key,
      alive: seat.alive,
      isYou: key === you,
      name: key === you ? "You" : nameOf?.(key) ?? shortKey(key),
    };
    const existing = groups.find((g) => g.word.toLowerCase() === word.toLowerCase());
    if (existing) existing.members.push(member);
    else groups.push({ word, members: [member] });
  });

  groups.sort((a, b) => b.members.length - a.members.length);

  const tied = room.outcome === Outcome.Tied;
  const youSurvived = room.seats.some((x) => x.wallet.toBase58() === you && x.alive);
  const gone = groups.filter((g) => g.members.every((m) => !m.alive));

  return (
    <div className="flex flex-col max-w-md w-full mx-auto space-y-5 animate-in fade-in duration-300">
      {/* Title */}
      <div className="text-center space-y-1">
        <h2 className="text-2xl sm:text-3xl font-black italic tracking-tight text-[#f1f4ec]">
          Here are the answers!
        </h2>
        <p className="text-xs text-[#98a08e] font-medium">{question}</p>
      </div>

      {/* Answer Groupings */}
      <div className="space-y-3">
        {groups.map((group) => {
          const culled = group.members.every((m) => !m.alive);

          return (
            <div
              key={group.word}
              className={`p-4 rounded-2xl border transition-all ${
                culled
                  ? "bg-[#f2603c]/10 border-[#f2603c]/35 shadow-[0_0_20px_-4px_rgba(242,96,60,0.15)]"
                  : "bg-[#1b2411] border-[#c9f24a]/30 shadow-[0_0_20px_-4px_rgba(201,242,74,0.1)]"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  className={`text-[9.5px] font-extrabold uppercase tracking-widest px-2 py-0.5 rounded-full ${
                    culled ? "bg-[#f2603c] text-white" : "bg-[#c9f24a] text-[#0d1408]"
                  }`}
                >
                  {culled ? "ODD ONE OUT" : "THE HERD"}
                </span>

                <span className="text-xs font-bold text-[#6b7362]">
                  {culled ? "strayed" : `${group.members.length} matched`}
                </span>
              </div>

              <div className="flex items-baseline justify-between mb-3">
                <span
                  className={`text-xl font-extrabold capitalize ${
                    culled ? "text-[#f2603c] line-through" : "text-[#f1f4ec]"
                  }`}
                >
                  "{group.word}"
                </span>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {group.members.map((m) => (
                  <Avatar
                    key={m.key}
                    who={m.key}
                    name={m.name}
                    size={34}
                    out={!m.alive}
                    you={m.isYou}
                    showName
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Eliminated info card */}
      {gone.length > 0 && (
        <div className="p-4 bg-[#171b14] border border-[#2a3122] rounded-2xl flex items-start gap-3">
          <Skull className="w-5 h-5 text-[#f2603c] shrink-0 mt-0.5" />
          <p className="text-xs text-[#98a08e] leading-relaxed">
            <strong className="text-[#f1f4ec]">
              {gone.flatMap((g) => g.members.map((m) => m.name)).join(", ")}
            </strong>{" "}
            {gone.flatMap((g) => g.members).length === 1 ? "was" : "were"} the odd group out and eliminated.
          </p>
        </div>
      )}

      {/* Tied info card */}
      {tied && (
        <div className="p-4 bg-[#171b14] border border-[#2a3122] rounded-2xl flex items-start gap-3">
          <Users className="w-5 h-5 text-[#c9f24a] shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-extrabold text-[#c9f24a]">Nobody was the odd one</h4>
            <p className="text-xs text-[#98a08e] leading-relaxed mt-0.5">
              Every group was identical in size. Nobody strayed, so everyone advances!
            </p>
          </div>
        </div>
      )}

      {/* You survived / strayed status card */}
      <div
        className={`p-4 rounded-2xl border ${
          youSurvived ? "bg-[#1b2411] border-[#c9f24a]/30" : "bg-[#f2603c]/10 border-[#f2603c]/30"
        }`}
      >
        <h3 className="text-lg font-black text-[#f1f4ec]">
          {youSurvived ? "Still with the herd" : "You strayed"}
        </h3>
        <p className="text-xs text-[#98a08e] mt-0.5">
          {room.seats.filter((x) => x.alive).length} player
          {room.seats.filter((x) => x.alive).length === 1 ? "" : "s"} remaining
          {youSurvived ? " playing for the pot." : ", playing for the pot without you."}
        </p>
      </div>

      {/* Next round action */}
      <Button
        label={
          <span className="flex items-center gap-2">
            <span>Next round</span>
            <ArrowRight className="w-4 h-4" />
            <span className="opacity-75">({left}s)</span>
          </span>
        }
        onClick={onNext}
        className="w-full text-base py-3.5"
      />
    </div>
  );
}
