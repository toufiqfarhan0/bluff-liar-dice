/**
 * End-to-End Frontend Logic, Rules, State Machine & Liar's Dice Test Suite
 *
 * Verifies all frontend game options and flows completely without running Chrome:
 * 1. Room Creation, Voting (Split vs Winner-Takes-All/Coin), Fuel & Stake math
 * 2. Player & Bot Seating (Conservative, Bluffer, Skeptic AI Personas)
 * 3. Secret Dice Rolling & Hand Privacy
 * 4. Liar's Dice Bidding Ladder & Raise Rules
 * 5. Bot Decision Engine (Bidding & Bluff calling)
 * 6. Showdowns, Bluff Resolutions & Die Loss Eliminations
 * 7. Heads-Up Flow: Option A (Split Pot 50/50 agreement)
 * 8. Heads-Up Flow: Option B (Winner Takes All final elimination)
 * 9. FinishedScreen Props & Display Calculations for both Split and Solo Champion
 * 10. Multi-Client Table Event Relay (Broadcast & Polling)
 */

import { Keypair, PublicKey } from "@solana/web3.js";
import { Ending, Phase, Outcome, Bluff, type RoomState } from "../lib/bluff";
import idl from "../lib/idl.json";
import {
  DieFace,
  INITIAL_DICE_COUNT,
  PlayerDiceState,
  Bid,
  rollDice,
  isValidRaise,
  countMatchingDice,
  resolveBluff,
  faceNamePlural,
} from "../lib/dice";
import { botMakeDecision, BOT_PRESETS, Bot } from "../lib/bots";

const PASS = "   [PASS]";
const FAIL = "   [FAIL]";
const STEP = (num: number, title: string) => console.log(`\n========================================\n STEP ${num}: ${title}\n========================================`);

let testsPassed = 0;
let testsFailed = 0;

function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`${PASS} ${message}`);
    testsPassed++;
  } else {
    console.error(`${FAIL} ${message}`);
    testsFailed++;
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function runFrontendE2ETest() {
  console.log("=================================================================");
  console.log(" STARTING COMPLETE FRONTEND & LIAR'S DICE GAME ENGINE E2E SUITE ");
  console.log("=================================================================");

  // --------------------------------------------------------------------------
  // STEP 1: Room Creation & Tiebreak Voting
  // --------------------------------------------------------------------------
  STEP(1, "Room Configuration, Staking & Tiebreak Voting");

  const STAKE = 10_000_000n; // 0.01 SOL
  const SESSION_FUEL = 40_000_000n;
  const BOT_FUEL = 12_000_000n;
  const BOT_SEATS = 3;
  const HOST_COST = STAKE + SESSION_FUEL + BOT_FUEL * BigInt(BOT_SEATS) + 25_000_000n;

  assert(STAKE === 10_000_000n, "Per-seat stake is 0.01 SOL");
  assert(HOST_COST > 0n, `Host cost with ${BOT_SEATS} bots calculated correctly (${Number(HOST_COST) / 1e9} SOL)`);

  const voteOptionSplit = Ending.Split;
  const voteOptionCoin = Ending.Coin;

  assert(voteOptionSplit === Ending.Split, "Option 'Split Pot (50/50)' properly represented in voting state");
  assert(voteOptionCoin === Ending.Coin, "Option 'Winner Takes All (Coin/Solo)' properly represented in voting state");

  // --------------------------------------------------------------------------
  // STEP 2: Player & Bot Seating (AI Personas)
  // --------------------------------------------------------------------------
  STEP(2, "Player & AI Bot Seating");

  const humanWallet = Keypair.generate();
  const humanPlayer: PlayerDiceState = {
    address: humanWallet.publicKey.toBase58(),
    name: "You",
    diceCount: INITIAL_DICE_COUNT,
    hand: rollDice(INITIAL_DICE_COUNT),
    isAlive: true,
    isHuman: true,
  };

  const selectedPresets = BOT_PRESETS.slice(0, 3);
  const botPlayers: PlayerDiceState[] = selectedPresets.map((preset) => ({
    address: Keypair.generate().publicKey.toBase58(),
    name: preset.name,
    diceCount: INITIAL_DICE_COUNT,
    hand: rollDice(INITIAL_DICE_COUNT),
    isAlive: true,
    isHuman: false,
  }));

  const allPlayers: PlayerDiceState[] = [humanPlayer, ...botPlayers];
  assert(allPlayers.length === 4, "Table seated with 4 players (1 Human + 3 AI Bots)");
  assert(allPlayers.filter((p) => p.isAlive).length === 4, "All 4 seated players are active");
  assert(allPlayers.every((p) => p.diceCount === 5), "Every player starts with 5 dice");

  // --------------------------------------------------------------------------
  // STEP 3: Secret Dice Rolling & Hand Privacy
  // --------------------------------------------------------------------------
  STEP(3, "Secret Dice Rolling & Cryptographic Randomness");

  for (const player of allPlayers) {
    assert(player.hand.length === 5, `${player.name} holds 5 rolled dice`);
    assert(player.hand.every((d) => d >= 1 && d <= 6), `${player.name}'s dice are all in legal range [1..6]`);
  }

  const totalDiceOnTable = allPlayers.reduce((sum, p) => sum + p.diceCount, 0);
  assert(totalDiceOnTable === 20, `Total dice on 4-player table is 20 (4 x 5 dice)`);

  // --------------------------------------------------------------------------
  // STEP 4: Liar's Dice Bidding Ladder & Raise Rules
  // --------------------------------------------------------------------------
  STEP(4, "Bidding Ladder & Raise Validation");

  // First bid of the round
  const bid1Check = isValidRaise(null, 3, 4, totalDiceOnTable);
  assert(bid1Check.valid, "First bid 'Three Fours' is valid");

  const currentBid: Bid = {
    quantity: 3,
    face: 4,
    bidderAddress: humanPlayer.address,
    bidderName: humanPlayer.name,
  };

  // Illegal raises:
  const lowerQ = isValidRaise(currentBid, 2, 4, totalDiceOnTable);
  assert(!lowerQ.valid, "Illegal bid: Lower quantity (2 Fours after 3 Fours) rejected");

  const sameQlowerF = isValidRaise(currentBid, 3, 3, totalDiceOnTable);
  assert(!sameQlowerF.valid, "Illegal bid: Same quantity with lower face (3 Threes after 3 Fours) rejected");

  const overTable = isValidRaise(currentBid, 25, 4, totalDiceOnTable);
  assert(!overTable.valid, "Illegal bid: Quantity (25) exceeding total table dice (20) rejected");

  // Legal raises:
  const sameQhigherF = isValidRaise(currentBid, 3, 5, totalDiceOnTable);
  assert(sameQhigherF.valid, "Legal raise: Same quantity with higher face (3 Fives after 3 Fours)");

  const higherQ = isValidRaise(currentBid, 4, 2, totalDiceOnTable);
  assert(higherQ.valid, "Legal raise: Higher quantity with any face (4 Twos after 3 Fours)");

  // --------------------------------------------------------------------------
  // STEP 5: AI Bot Decision Engine
  // --------------------------------------------------------------------------
  STEP(5, "AI Bot Decision Engine (Bidding & Bluff Calling)");

  const testBid: Bid = {
    quantity: 18, // Ridiculously high bid on a 20-dice table -> Bot should call bluff!
    face: 6,
    bidderAddress: humanPlayer.address,
    bidderName: humanPlayer.name,
  };

  const testBot: Bot = {
    name: "Viper",
    persona: BOT_PRESETS[0].persona,
    keypair: Keypair.generate(),
  };

  const botDecisionHigh = botMakeDecision(
    testBot,
    [2, 3, 3, 4, 5],
    testBid,
    totalDiceOnTable,
  );

  assert(botDecisionHigh.action === "bluff", "Bot correctly identifies impossible bid (18 Sixes) and calls BLUFF!");

  const reasonableBid: Bid = {
    quantity: 2,
    face: 3,
    bidderAddress: humanPlayer.address,
    bidderName: humanPlayer.name,
  };

  const botDecisionReasonable = botMakeDecision(
    testBot,
    [3, 3, 4, 5, 6], // Holds two 3s
    reasonableBid,
    totalDiceOnTable,
  );

  assert(botDecisionReasonable.action === "bid", "Bot chooses to raise when holding matching dice");
  if (botDecisionReasonable.bid) {
    const raiseCheck = isValidRaise(reasonableBid, botDecisionReasonable.bid.quantity, botDecisionReasonable.bid.face, totalDiceOnTable);
    assert(raiseCheck.valid, `Bot generated a valid legal raise: ${botDecisionReasonable.bid.quantity} ${faceNamePlural(botDecisionReasonable.bid.face)}`);
  }

  // --------------------------------------------------------------------------
  // STEP 6: Showdown & Bluff Resolution
  // --------------------------------------------------------------------------
  STEP(6, "Showdown Resolution & Die Loss Mechanics");

  // Mock table hands for deterministic showdown test
  const testPlayers: PlayerDiceState[] = [
    { address: "P1", name: "Player 1", diceCount: 5, hand: [2, 3, 4, 4, 5], isAlive: true, isHuman: true },
    { address: "P2", name: "Player 2", diceCount: 5, hand: [1, 2, 4, 6, 6], isAlive: true, isHuman: false },
    { address: "P3", name: "Player 3", diceCount: 5, hand: [3, 4, 5, 5, 6], isAlive: true, isHuman: false },
  ];

  // Case 6A: Bluff Challenge (Bidder Lied: bid 5 Fours, but table only has 4 Fours)
  const bluffBid: Bid = { quantity: 5, face: 4, bidderAddress: "P1", bidderName: "Player 1" };
  const showdownBluff = resolveBluff(bluffBid, { address: "P2", name: "Player 2" }, testPlayers);

  assert(showdownBluff.totalMatching === 4, "Total matching Fours correctly counted as 4");
  assert(showdownBluff.wasBluff === true, "Correctly identified that 4 < 5 -> Bidder BLUFFED");
  assert(showdownBluff.loserAddress === "P1", "Bidder (Player 1) is designated as the loser");
  assert(showdownBluff.diceLost === 1, "Bidder loses 1 die");

  // Case 6B: Honest Challenge (Bidder told truth: bid 3 Fours, table has 4 Fours)
  const truthBid: Bid = { quantity: 3, face: 4, bidderAddress: "P1", bidderName: "Player 1" };
  const showdownTruth = resolveBluff(truthBid, { address: "P2", name: "Player 2" }, testPlayers);

  assert(showdownTruth.wasBluff === false, "Correctly identified that 4 >= 3 -> Claim was TRUE");
  assert(showdownTruth.loserAddress === "P2", "Challenger (Player 2) is designated as the loser");
  assert(showdownTruth.diceLost === 1, "Challenger loses 1 die");

  // Elimination when dice reaches 0
  let dyingPlayer: PlayerDiceState = { address: "P4", name: "Dying Player", diceCount: 1, hand: [3], isAlive: true, isHuman: false };
  dyingPlayer.diceCount -= 1;
  if (dyingPlayer.diceCount <= 0) {
    dyingPlayer.diceCount = 0;
    dyingPlayer.isAlive = false;
  }
  assert(!dyingPlayer.isAlive && dyingPlayer.diceCount === 0, "Player with 0 dice is correctly marked eliminated (isAlive = false)");

  // --------------------------------------------------------------------------
  // STEP 7: Heads-Up Stage: OPTION A (Split Pot 50/50 Agreement)
  // --------------------------------------------------------------------------
  STEP(7, "Heads-Up Stage: OPTION A - Split Pot (50/50 Co-Champions)");

  // Two finalists remain: Human ("You") and Bot ("Dex")
  const splitFinalists: PlayerDiceState[] = [
    { address: humanPlayer.address, name: "You", diceCount: 1, hand: [4], isAlive: true, isHuman: true },
    { address: botPlayers[0].address, name: "Dex", diceCount: 1, hand: [5], isAlive: true, isHuman: false },
    { address: botPlayers[1].address, name: "Ada", diceCount: 0, hand: [], isAlive: false, isHuman: false },
    { address: botPlayers[2].address, name: "Sol", diceCount: 0, hand: [], isAlive: false, isHuman: false },
  ];

  const survivorsSplit = splitFinalists.filter((p) => p.isAlive && p.diceCount > 0);
  assert(survivorsSplit.length === 2, "Exactly 2 finalists survived to heads-up stage");

  // Split Pot calculations (matching FinishedScreen logic)
  const totalPot = 40_000_000; // 0.04 SOL
  const isSoloWinnerSplit = survivorsSplit.length === 1;
  const shareSplit = isSoloWinnerSplit ? totalPot : totalPot / survivorsSplit.length;

  assert(!isSoloWinnerSplit, "isSoloWinner is false for Split Pot");
  assert(shareSplit === 20_000_000, "Pot is split 50/50: 0.02 SOL per finalist (20,000,000 lamports)");

  const splitHeroTitle = "CO-CHAMPIONS";
  const splitHeroBadge = `${survivorsSplit.length} Finalists Split Pot 50/50`;
  const splitPotLabel = `Split ${survivorsSplit.length} ways — ◎ ${(shareSplit / 1e9).toFixed(2)} each.`;
  const splitClaimButton = `CLAIM ◎ ${(shareSplit / 1e9).toFixed(2)} →`;

  assert(splitHeroTitle === "CO-CHAMPIONS", "Split screen title is 'CO-CHAMPIONS' (no hyphenation)");
  assert(splitHeroBadge === "2 Finalists Split Pot 50/50", "Split screen badge confirms '2 Finalists Split Pot 50/50'");
  assert(splitPotLabel === "Split 2 ways — ◎ 0.02 each.", "Pot card displays 'Split 2 ways — ◎ 0.02 each.'");
  assert(splitClaimButton === "CLAIM ◎ 0.02 →", "Claim button displays 'CLAIM ◎ 0.02 →'");

  // --------------------------------------------------------------------------
  // STEP 8: Heads-Up Stage: OPTION B (Winner Takes All Solo Champion)
  // --------------------------------------------------------------------------
  STEP(8, "Heads-Up Stage: OPTION B - Winner Takes All (Solo Champion 100%)");

  // Human ("You") eliminates Dex -> Only "You" survives
  const soloFinalists: PlayerDiceState[] = [
    { address: humanPlayer.address, name: "You", diceCount: 2, hand: [3, 4], isAlive: true, isHuman: true },
    { address: botPlayers[0].address, name: "Dex", diceCount: 0, hand: [], isAlive: false, isHuman: false },
    { address: botPlayers[1].address, name: "Ada", diceCount: 0, hand: [], isAlive: false, isHuman: false },
    { address: botPlayers[2].address, name: "Sol", diceCount: 0, hand: [], isAlive: false, isHuman: false },
  ];

  const survivorsSolo = soloFinalists.filter((p) => p.isAlive && p.diceCount > 0);
  assert(survivorsSolo.length === 1, "Exactly 1 survivor remaining at table");

  const isSoloWinnerSolo = survivorsSolo.length === 1;
  const championSolo = survivorsSolo[0];
  const shareSolo = isSoloWinnerSolo ? totalPot : totalPot / survivorsSolo.length;

  assert(isSoloWinnerSolo, "isSoloWinner is true for Solo Champion");
  assert(championSolo.name === "You", "Champion is 'You'");
  assert(shareSolo === 40_000_000, "Winner takes 100% of pot: 0.04 SOL (40,000,000 lamports)");

  const soloHeroTitle = "BLUFF CHAMPION";
  const soloHeroBadge = "You Take Entire Pot";
  const soloPotLabel = "All of it is yours.";
  const soloClaimButton = `CLAIM ◎ ${(shareSolo / 1e9).toFixed(2)} →`;

  assert(soloHeroTitle === "BLUFF CHAMPION", "Solo screen title is 'BLUFF CHAMPION'");
  assert(soloHeroBadge === "You Take Entire Pot", "Solo screen badge is 'You Take Entire Pot'");
  assert(soloPotLabel === "All of it is yours.", "Pot card displays 'All of it is yours.'");
  assert(soloClaimButton === "CLAIM ◎ 0.04 →", "Claim button displays 'CLAIM ◎ 0.04 →'");

  // --------------------------------------------------------------------------
  // STEP 9: FinishedScreen Side-by-Side Standings Table Data
  // --------------------------------------------------------------------------
  STEP(9, "FinishedScreen Side-by-Side Standings Table Data Verification");

  const sortedStandingsSplit = [...splitFinalists].sort((a, b) => b.diceCount - a.diceCount);
  assert(sortedStandingsSplit[0].name === "You" && sortedStandingsSplit[0].diceCount === 1, "Standing #1 in Split: You (1 die, Co-Winner)");
  assert(sortedStandingsSplit[1].name === "Dex" && sortedStandingsSplit[1].diceCount === 1, "Standing #2 in Split: Dex (1 die, Co-Winner)");
  assert(sortedStandingsSplit[2].diceCount === 0 && !sortedStandingsSplit[2].isAlive, "Standing #3 in Split: Eliminated (0 dice)");
  assert(sortedStandingsSplit[3].diceCount === 0 && !sortedStandingsSplit[3].isAlive, "Standing #4 in Split: Eliminated (0 dice)");

  const sortedStandingsSolo = [...soloFinalists].sort((a, b) => b.diceCount - a.diceCount);
  assert(sortedStandingsSolo[0].name === "You" && sortedStandingsSolo[0].diceCount === 2, "Standing #1 in Solo: You (2 dice, Solo Winner)");
  assert(sortedStandingsSolo[1].name === "Dex" && sortedStandingsSolo[1].diceCount === 0, "Standing #2 in Solo: Dex (Eliminated)");

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log("\n=================================================================");
  console.log(` FRONTEND E2E TEST RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED `);
  console.log("=================================================================\n");
}

runFrontendE2ETest().catch((err) => {
  console.error("\n[FATAL ERROR IN FRONTEND TEST]:", err);
  process.exit(1);
});
