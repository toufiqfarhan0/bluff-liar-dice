/**
 * Liar's Dice AI Bots with distinct personalities:
 * 1. "Conservative" (Mila / Bones): Bids safely on dice it holds, calls bluff when math is bad.
 * 2. "Aggressive Bluffer" (Viper / 0xTeo): Loves raising even without matching dice, rarely calls bluff early.
 * 3. "Skeptic" (Fox / QuietHunter): Always doubts opponents and frequently calls "BLUFF!".
 */

import { Keypair } from "@solana/web3.js";
import { secureStore } from "./storage";
import { Bid, DieFace, isValidRaise } from "./dice";

export type BotArchetype = "conservative" | "bluffer" | "skeptic";

export type BotDifficulty = "easy" | "medium" | "hard";

export interface BotPersona {
  archetype: BotArchetype;
  aggression: number; // 0 to 1
  skepticism: number;  // 0 to 1
  speed: number;       // haste 0 to 1
  difficulty?: BotDifficulty;
}

export interface Bot {
  name: string;
  persona: BotPersona;
  keypair: Keypair;
}

export interface BotDecision {
  action: "bid" | "bluff";
  bid?: {
    quantity: number;
    face: DieFace;
  };
}

const BOT_NAMES = ["Viper", "Mila", "0xTeo", "Fox", "Bones", "Slick", "Rico", "Nova"];

const ARCHETYPES: Record<BotArchetype, BotPersona> = {
  conservative: { archetype: "conservative", aggression: 0.25, skepticism: 0.6, speed: 0.4 },
  bluffer: { archetype: "bluffer", aggression: 0.85, skepticism: 0.2, speed: 0.7 },
  skeptic: { archetype: "skeptic", aggression: 0.35, skepticism: 0.85, speed: 0.3 },
};

export const BOT_PRESETS: { name: string; persona: BotPersona }[] = [
  { name: "Viper", persona: ARCHETYPES.bluffer },
  { name: "Mila", persona: ARCHETYPES.conservative },
  { name: "0xTeo", persona: ARCHETYPES.bluffer },
  { name: "Fox", persona: ARCHETYPES.skeptic },
  { name: "Bones", persona: ARCHETYPES.conservative },
  { name: "Slick", persona: ARCHETYPES.skeptic },
  { name: "Rico", persona: ARCHETYPES.bluffer },
  { name: "Nova", persona: ARCHETYPES.conservative },
];

export function getBotPresetsForDifficulty(difficulty: BotDifficulty = "medium"): { name: string; persona: BotPersona }[] {
  return BOT_PRESETS.map((preset) => {
    let aggression = preset.persona.aggression;
    let skepticism = preset.persona.skepticism;
    let speed = 0.85;

    if (difficulty === "easy") {
      aggression = Math.min(0.9, aggression + 0.2);
      skepticism = Math.max(0.15, skepticism - 0.25);
    } else if (difficulty === "hard") {
      aggression = Math.max(0.2, aggression - 0.15);
      skepticism = Math.min(0.95, skepticism + 0.2);
    }

    return {
      name: preset.name,
      persona: {
        ...preset.persona,
        aggression,
        skepticism,
        speed,
        difficulty,
      },
    };
  });
}

/**
 * Determine Bot's move given its private hand and table state.
 */
export function botMakeDecision(
  bot: Bot,
  hand: DieFace[],
  currentBid: Bid | null,
  totalDiceOnTable: number,
): BotDecision {
  const { persona } = bot;

  // 1. If opening bid (no previous bid):
  if (!currentBid) {
    // Pick the most frequent face in hand (1 to 6)
    const counts = countFacesInHand(hand);
    let bestFace: DieFace = 1;
    let maxCount = 0;

    for (let f = 1; f <= 6; f++) {
      const face = f as DieFace;
      const count = counts[face];
      if (count > maxCount) {
        maxCount = count;
        bestFace = face;
      }
    }

    // Starting bid is usually 1 or 2 of best face, capped by total dice on table
    const openingQuantity = Math.max(1, Math.min(totalDiceOnTable, Math.min(2, maxCount)));
    return {
      action: "bid",
      bid: { quantity: openingQuantity, face: bestFace },
    };
  }

  // 2. We have a current bid to evaluate:
  const claimedQ = currentBid.quantity;
  const claimedF = currentBid.face;

  // If claim already reaches or exceeds all dice on table, cannot raise legally -> call bluff!
  if (claimedQ >= totalDiceOnTable) {
    return { action: "bluff" };
  }

  // Count my matching dice (only natural matching face)
  const myMatching = hand.filter((d) => d === claimedF).length;
  const unknownDice = Math.max(0, totalDiceOnTable - hand.length);

  // Expected probability of match in unknown dice (1/6 for any face)
  const matchProb = 1 / 6;
  const expectedOpponentMatches = unknownDice * matchProb;
  const expectedTotal = myMatching + expectedOpponentMatches;

  // 3. Bluff Challenge Decision
  // If claimed quantity exceeds expectation by threshold, call BLUFF!
  let bluffThreshold = 0.9;
  if (persona.archetype === "skeptic") {
    bluffThreshold = 0.3;
  } else if (persona.archetype === "bluffer") {
    bluffThreshold = 1.4;
  } else {
    // conservative
    bluffThreshold = 0.7;
  }

  if (persona.difficulty === "hard") {
    bluffThreshold = Math.max(0.2, bluffThreshold - 0.3);
  } else if (persona.difficulty === "easy") {
    bluffThreshold += 0.5;
  }

  // If claim is definitely impossible (exceeds all dice on table)
  if (claimedQ > totalDiceOnTable) {
    return { action: "bluff" };
  }

  // Claiming more than 50% of the table is an immediate bluff trigger
  if (claimedQ >= Math.ceil(totalDiceOnTable * 0.45) && claimedQ > myMatching + 1) {
    return { action: "bluff" };
  }

  const disparity = claimedQ - expectedTotal;
  if (disparity >= bluffThreshold) {
    const callProb = Math.min(0.95, 0.7 + disparity * 0.2 + persona.skepticism * 0.2);
    if (Math.random() < callProb) {
      return { action: "bluff" };
    }
  }

  // 4. Raise the Bid
  // Find a legal bid that maximizes bot's advantage
  const possibleRaises: { quantity: number; face: DieFace; strength: number }[] = [];

  for (let q = claimedQ; q <= Math.min(totalDiceOnTable, claimedQ + 1); q++) {
    for (let f = 1; f <= 6; f++) {
      const face = f as DieFace;
      const { valid } = isValidRaise(currentBid, q, face, totalDiceOnTable);
      if (!valid) continue;

      // Calculate strength of this bid for the bot
      const myCount = hand.filter((d) => d === face).length;
      const expTotal = myCount + unknownDice * (1 / 6);
      const risk = q - expTotal;

      let score = -risk; // Higher score = safer
      if (persona.archetype === "bluffer") {
        score += face * 0.2 + (Math.random() * 0.5);
      }

      possibleRaises.push({ quantity: q, face, strength: score });
    }
  }

  if (possibleRaises.length === 0) {
    // Cannot raise legally -> must call bluff
    return { action: "bluff" };
  }

  // Sort by strength descending and pick best or near-best
  possibleRaises.sort((a, b) => b.strength - a.strength);
  const chosen = possibleRaises[0];

  return {
    action: "bid",
    bid: { quantity: chosen.quantity, face: chosen.face },
  };
}

function countFacesInHand(hand: DieFace[]): Record<DieFace, number> {
  const counts: Record<DieFace, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  for (const d of hand) {
    counts[d] = (counts[d] || 0) + 1;
  }
  return counts;
}

/** Delay in ms before bot responds - at least 2 seconds for deliberate, realistic gameplay */
export function botThinkingDelay(persona: BotPersona): number {
  const base = 2000 + (1 - persona.speed) * 800; // 2000ms to 2800ms
  const jitter = Math.random() * 400; // 0 to 400ms
  return Math.max(2000, Math.floor(base + jitter));
}

/** Get or restore bots for a room */
export async function botsFor(room: string, count: number): Promise<Bot[]> {
  const key = `bluff.bots.${room}`;
  const saved = await secureStore.get(key);

  if (saved) {
    try {
      const parsed = JSON.parse(saved) as {
        name: string;
        persona?: BotPersona;
        secret: number[];
      }[];
      return parsed.slice(0, count).map((b, i) => ({
        name: b.name,
        persona: b.persona ?? BOT_PRESETS[i % BOT_PRESETS.length].persona,
        keypair: Keypair.fromSecretKey(Uint8Array.from(b.secret)),
      }));
    } catch {}
  }

  const bots: Bot[] = [];
  for (let i = 0; i < count; i++) {
    const preset = BOT_PRESETS[i % BOT_PRESETS.length];
    bots.push({
      name: preset.name,
      persona: preset.persona,
      keypair: Keypair.generate(),
    });
  }

  await secureStore.set(
    key,
    JSON.stringify(
      bots.map((b) => ({
        name: b.name,
        persona: b.persona,
        secret: Array.from(b.keypair.secretKey),
      })),
    ),
  );

  return bots;
}
