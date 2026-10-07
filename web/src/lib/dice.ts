/**
 * Core Liar's Dice (Bluff) Game Engine & Rules.
 *
 * Rules:
 * 1. Each active player starts with INITIAL_DICE (5 dice).
 * 2. Dice values are 1 to 6. '1's (Aces) are WILD and count as any face value,
 *    unless the current bid is specifically on 1s.
 * 3. Bidding Ladder:
 *    - To raise, a player must either:
 *      a) Bid a higher quantity of any face (e.g. 3 of anything -> 4 of anything).
 *      b) Bid the same quantity with a higher face value (e.g. 3 Fours -> 3 Fives).
 *      c) Special Ace rule: Switching to 1s requires at least half the quantity (rounded up).
 *         Switching from 1s to another face requires at least 2x + 1.
 * 4. Calling Bluff ("Liar!"):
 *    - Challenges the previous bidder's claim.
 *    - All cups lift. Total matching dice across the entire table are counted.
 *    - If total >= bid.quantity: Challenger was wrong and loses 1 die.
 *    - If total < bid.quantity: Bidder was bluffing and loses 1 die.
 * 5. Elimination: Reaching 0 dice eliminates the player.
 * 6. Victory: Last player with >= 1 die wins the entire pot.
 */

export type DieFace = 1 | 2 | 3 | 4 | 5 | 6;

export const INITIAL_DICE_COUNT = 5;

export interface Bid {
  quantity: number;
  face: DieFace;
  bidderAddress: string;
  bidderName: string;
}

export interface PlayerDiceState {
  address: string;
  name: string;
  diceCount: number; // remaining dice (0 = eliminated)
  hand: DieFace[]; // secret private dice for current round
  isAlive: boolean;
  isHuman: boolean;
}

export interface ShowdownResult {
  bid: Bid;
  challengerAddress: string;
  challengerName: string;
  totalMatching: number;
  wasBluff: boolean;
  loserAddress: string;
  loserName: string;
  diceLost: number;
  reason: string;
}

/** Roll N random dice (values 1 to 6) */
export function rollDice(count: number): DieFace[] {
  const dice: DieFace[] = [];
  for (let i = 0; i < count; i++) {
    dice.push((Math.floor(Math.random() * 6) + 1) as DieFace);
  }
  return dice.sort((a, b) => a - b);
}

/**
 * Validate whether a new bid is a legal raise over the previous bid.
 */
export function isValidRaise(
  prevBid: Bid | null,
  newQuantity: number,
  newFace: DieFace,
  totalDiceOnTable: number,
): { valid: boolean; error?: string } {
  if (newQuantity < 1) {
    return { valid: false, error: "Quantity must be at least 1" };
  }
  if (newQuantity > totalDiceOnTable) {
    return { valid: false, error: `Quantity cannot exceed total dice on table (${totalDiceOnTable})` };
  }

  // First bid of the round can be anything valid
  if (!prevBid) {
    return { valid: true };
  }

  const prevQ = prevBid.quantity;
  const prevF = prevBid.face;

  // Standard raises:
  if (newQuantity > prevQ) {
    return { valid: true };
  }

  if (newQuantity === prevQ && newFace > prevF) {
    return { valid: true };
  }

  return {
    valid: false,
    error: `Must bid higher than ${prevQ} ${faceNamePlural(prevF)} (increase quantity or face value)`,
  };
}

/**
 * Count total matching dice on the table for a given bid face.
 * 1s (Aces) are WILD and count towards any face, unless the bid is on 1s.
 */
export function countMatchingDice(allHands: DieFace[][], targetFace: DieFace): number {
  let count = 0;
  for (const hand of allHands) {
    for (const die of hand) {
      if (targetFace === 1) {
        // When bidding on 1s, only natural 1s count
        if (die === 1) count++;
      } else {
        // When bidding on 2-6, matching face and wild 1s both count
        if (die === targetFace || die === 1) count++;
      }
    }
  }
  return count;
}

/**
 * Resolve a Bluff challenge when a player calls "Liar!".
 */
export function resolveBluff(
  bid: Bid,
  challenger: { address: string; name: string },
  players: PlayerDiceState[],
): ShowdownResult {
  const activeHands = players.filter((p) => p.isAlive).map((p) => p.hand);
  const totalMatching = countMatchingDice(activeHands, bid.face);
  const wasBluff = totalMatching < bid.quantity;

  const loserAddress = wasBluff ? bid.bidderAddress : challenger.address;
  const loserName = wasBluff ? bid.bidderName : challenger.name;

  const faceStr = faceNamePlural(bid.face);
  const reason = wasBluff
    ? `${bid.bidderName} bluffed! Claimed ${bid.quantity} ${faceStr}, but there were only ${totalMatching} on the table.`
    : `${bid.bidderName}'s claim was TRUE! Claimed ${bid.quantity} ${faceStr}, and there were ${totalMatching} on the table. ${challenger.name} loses a die!`;

  return {
    bid,
    challengerAddress: challenger.address,
    challengerName: challenger.name,
    totalMatching,
    wasBluff,
    loserAddress,
    loserName,
    diceLost: 1,
    reason,
  };
}

/** Get Unicode die symbol */
export function dieSymbol(face: DieFace): string {
  const symbols = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
  return symbols[face - 1] ?? "🎲";
}

/** Singular name of die face */
export function faceName(face: DieFace): string {
  switch (face) {
    case 1:
      return "One (Wild Ace)";
    case 2:
      return "Two";
    case 3:
      return "Three";
    case 4:
      return "Four";
    case 5:
      return "Five";
    case 6:
      return "Six";
  }
}

/** Plural name of die face */
export function faceNamePlural(face: DieFace): string {
  switch (face) {
    case 1:
      return "Ones (Aces)";
    case 2:
      return "Twos";
    case 3:
      return "Threes";
    case 4:
      return "Fours";
    case 5:
      return "Fives";
    case 6:
      return "Sixes";
  }
}
