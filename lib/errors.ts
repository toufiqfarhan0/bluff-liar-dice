/**
 * Turning chain errors into human-friendly explanations.
 */

import idl from "./idl.json";

const BLUFF_ERRORS: string[] = ((idl as any).errors ?? []).map((e: { name: string }) => e.name);
const FIRST_CODE = (idl as any).errors?.[0]?.code ?? 6000;

const PLAIN: Record<string, string> = {
  RoundClosed: "Too slow — that round closed before your answer landed.",
  AlreadyAnswered: "You've already answered this round.",
  Eliminated: "You're out of this game.",
  NotAPlayer: "You're not in this room.",
  RoundStillOpen: "The round hasn't finished yet.",
  RoomFull: "That room is full.",
  AlreadySeated: "You're already in this room.",
  TooFewPlayers: "A room needs at least three players.",
  RoomNotOpen: "That room has already started.",
  NotTheHost: "Only the host can do that.",
  AlreadySettled: "This pot has already been paid out.",
  EmptyAnswer: "Type something first.",
  AnswerTooLong: "That answer is too long.",
  RoomLayoutDrift: "This room looks wrong to the program. Open a fresh one.",
};

export function explainChainError(e: unknown): string | null {
  const raw = e instanceof Error ? e.message : String(e);

  const custom = /custom program error: (0x[0-9a-f]+|\d+)/i.exec(raw);
  if (custom) {
    const value = custom[1].startsWith("0x") ? parseInt(custom[1], 16) : Number(custom[1]);
    const index = value - FIRST_CODE;
    if (index >= 0 && index < BLUFF_ERRORS.length) {
      const name = BLUFF_ERRORS[index];
      return PLAIN[name] ?? `The program refused that: ${name}.`;
    }
    if (value === 1) {
      return "Not enough SOL to cover that. Devnet SOL is free — request an airdrop.";
    }
  }

  if (/insufficient (lamports|funds)/i.test(raw)) {
    return "Not enough SOL to cover that. Use the airdrop button to get devnet SOL.";
  }

  return null;
}
