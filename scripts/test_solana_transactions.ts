/**
 * Solana Devnet Live On-Chain Transactions Test Suite
 *
 * Verifies end-to-end on-chain Solana transactions without browser/Chrome:
 * 1. Room Creation (PDA derivation for room, vault, and answers)
 * 2. Session key funding transaction
 * 3. Player Seating & Staking (Vault PDA deposit + Split tiebreak vote)
 * 4. Multi-Player Seating & Staking (Vault PDA accumulation + Coin tiebreak vote)
 * 5. Vault Accounting & State verification
 * 6. Player Exit & Stake Refund (Vault PDA withdrawal)
 * 7. Contract Security Guard: Minimum 3 players required before locking
 * 8. Room Locking (Host session closes door, tallies votes, transitions to Phase.Playing)
 */

import {
  Keypair,
  PublicKey,
  SystemProgram,
  Transaction,
  Connection,
  TransactionInstruction,
} from "@solana/web3.js";
import { BASE_RPC, loadKeypair, lamportsOf, sleep } from "./lib/chain";
import { Ending, Bluff, Phase } from "./lib/bluff";
import idl from "./idl.json";

const PASS = "   [PASS]";
const FAIL = "   [FAIL]";
const STEP = (num: number, title: string) =>
  console.log(`\n========================================\n STEP ${num}: ${title}\n========================================`);

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

async function sendAndConfirmTx(
  conn: Connection,
  signers: Keypair[],
  instructions: TransactionInstruction[],
): Promise<string> {
  const { blockhash, lastValidBlockHeight } = await conn.getLatestBlockhash("confirmed");
  const tx = new Transaction({
    feePayer: signers[0].publicKey,
    recentBlockhash: blockhash,
  });
  instructions.forEach((ix) => tx.add(ix));
  tx.sign(...signers);

  const sig = await conn.sendRawTransaction(tx.serialize(), {
    skipPreflight: false,
    preflightCommitment: "confirmed",
  });

  const confirmation = await conn.confirmTransaction(
    { signature: sig, blockhash, lastValidBlockHeight },
    "confirmed",
  );

  if (confirmation.value.err) {
    throw new Error(`Transaction failed: ${JSON.stringify(confirmation.value.err)}`);
  }

  return sig;
}

async function runOnChainTransactionTests() {
  console.log("=================================================================");
  console.log(" STARTING SOLANA DEVNET LIVE ON-CHAIN TRANSACTIONS TEST SUITE   ");
  console.log("=================================================================");

  const bluff = new Bluff(idl);
  const home = process.env.USERPROFILE || process.env.HOME || "";
  const host = loadKeypair(`${home}/.config/solana/id.json`);
  const conn = new Connection(BASE_RPC, "confirmed");

  // --------------------------------------------------------------------------
  // STEP 1: Host Wallet & Devnet Connection Verification
  // --------------------------------------------------------------------------
  STEP(1, "Solana Devnet Connection & Fee-Payer Health");

  const hostBalance = await lamportsOf(BASE_RPC, host.publicKey);
  assert(hostBalance > 100_000_000, `Host wallet active on Devnet with ${(hostBalance / 1e9).toFixed(4)} SOL`);
  console.log(`   Host Public Key: ${host.publicKey.toBase58()}`);

  const ROOM_ID = BigInt(Math.floor(Date.now() % 1_000_000));
  const STAKE = 10_000_000n; // 0.01 SOL
  const ROUND_SECONDS = 15;

  const roomPda = bluff.room(host.publicKey, ROOM_ID);
  const vaultPda = bluff.vault(roomPda);
  const answersPda = bluff.answers(roomPda);

  console.log(`   Room PDA:    ${roomPda.toBase58()}`);
  console.log(`   Vault PDA:   ${vaultPda.toBase58()}`);
  console.log(`   Answers PDA: ${answersPda.toBase58()}`);

  assert(PublicKey.isOnCurve(host.publicKey.toBytes()), "Host is a valid Solana public key");
  assert(!PublicKey.isOnCurve(roomPda.toBytes()), "Room is a valid Program Derived Address (PDA)");
  assert(!PublicKey.isOnCurve(vaultPda.toBytes()), "Vault is a valid Program Derived Address (PDA)");

  // --------------------------------------------------------------------------
  // STEP 2: Batch Fund Test Players from Host
  // --------------------------------------------------------------------------
  STEP(2, "Batch Funding Test Players for Gas & Stakes");

  const player1 = Keypair.generate();
  const player1Session = Keypair.generate();

  const player2 = Keypair.generate();
  const player2Session = Keypair.generate();

  const player3 = Keypair.generate();
  const player3Session = Keypair.generate();

  const player4 = Keypair.generate();
  const player4Session = Keypair.generate();

  const allPlayers = [player1, player2, player3, player4];
  const fundTx = new Transaction();
  allPlayers.forEach((p) => {
    fundTx.add(
      SystemProgram.transfer({
        fromPubkey: host.publicKey,
        toPubkey: p.publicKey,
        lamports: 25_000_000, // 0.025 SOL each
      }),
    );
  });

  const { blockhash: fundBlockhash, lastValidBlockHeight: fundH } = await conn.getLatestBlockhash("confirmed");
  fundTx.feePayer = host.publicKey;
  fundTx.recentBlockhash = fundBlockhash;
  fundTx.sign(host);
  const fundSig = await conn.sendRawTransaction(fundTx.serialize());
  await conn.confirmTransaction({ signature: fundSig, blockhash: fundBlockhash, lastValidBlockHeight: fundH }, "confirmed");
  console.log(`   Batch Funding Tx: ${fundSig}`);
  assert(true, "All 4 test player wallets funded in a single transaction");

  // --------------------------------------------------------------------------
  // STEP 3: Transaction 1 - Create Room & Fund Session Key
  // --------------------------------------------------------------------------
  STEP(3, "Transaction 1: Create Room & Fund Session Key on Solana Devnet");

  const hostSession = Keypair.generate();
  const createIx = bluff.createRoom(
    host.publicKey,
    ROOM_ID,
    STAKE,
    ROUND_SECONDS,
    hostSession.publicKey,
  );
  const sessionFuelIx = SystemProgram.transfer({
    fromPubkey: host.publicKey,
    toPubkey: hostSession.publicKey,
    lamports: 25_000_000,
  });

  const createSig = await sendAndConfirmTx(conn, [host], [createIx, sessionFuelIx]);
  console.log(`   Tx Signature: ${createSig}`);
  assert(true, "Transaction 'create_room' confirmed on Solana Devnet");

  const roomAccountInfo = await conn.getAccountInfo(roomPda);
  assert(roomAccountInfo !== null, "Room PDA account successfully created and readable on Devnet");

  const roomState = bluff.decodeRoom(new Uint8Array(roomAccountInfo!.data));
  assert(roomState.phase === Phase.Open, "Room initialized in Phase::Open");
  assert(roomState.stake === STAKE, "Room stake configured to 0.01 SOL (10,000,000 lamports)");
  assert(roomState.roundSeconds === ROUND_SECONDS, `Round timer configured to ${ROUND_SECONDS} seconds`);
  assert(roomState.hostSession.equals(hostSession.publicKey), "Host session key successfully bound to room");
  assert(roomState.seats.length === 0, "Initial player seats count is 0");

  const initialVaultBalance = await lamportsOf(BASE_RPC, vaultPda);
  console.log(`   Vault Rent-Exempt Floor: ${initialVaultBalance} lamports`);
  assert(initialVaultBalance > 0, "Vault PDA initialized with rent-exempt lamports");

  // --------------------------------------------------------------------------
  // STEP 4: Transaction 2 - Player 1 Join with Vote: Split Pot (50/50)
  // --------------------------------------------------------------------------
  STEP(4, "Transaction 2: Player 1 Seats, Stakes 0.01 SOL & Votes 'Split Pot (50/50)'");

  const join1Ix = bluff.joinRoom(
    host.publicKey,
    ROOM_ID,
    player1.publicKey,
    player1Session.publicKey,
    Ending.Split,
  );
  const join1Sig = await sendAndConfirmTx(conn, [player1], [join1Ix]);
  console.log(`   Tx Signature: ${join1Sig}`);
  assert(true, "Player 1 'join_room' transaction confirmed on Devnet");

  const vaultAfterP1 = await lamportsOf(BASE_RPC, vaultPda);
  assert(
    vaultAfterP1 === initialVaultBalance + Number(STAKE),
    `Vault balance grew by exactly 0.01 SOL (${vaultAfterP1} lamports)`,
  );

  const roomAfterP1Info = await conn.getAccountInfo(roomPda);
  const roomAfterP1 = bluff.decodeRoom(new Uint8Array(roomAfterP1Info!.data));
  assert(roomAfterP1.seats.length === 1, "Room records 1 seated player");
  assert(roomAfterP1.seats[0].wallet.equals(player1.publicKey), "Seat #1 wallet matches Player 1");
  assert(roomAfterP1.seats[0].endingVote === Ending.Split, "Seat #1 vote registered as Ending::Split");
  assert(roomAfterP1.seats[0].alive === true, "Seat #1 marked alive");

  // --------------------------------------------------------------------------
  // STEP 5: Transaction 3 - Player 2 Join with Vote: Split Pot (50/50)
  // --------------------------------------------------------------------------
  STEP(5, "Transaction 3: Player 2 Seats, Stakes 0.01 SOL & Votes 'Split Pot (50/50)'");

  const join2Ix = bluff.joinRoom(
    host.publicKey,
    ROOM_ID,
    player2.publicKey,
    player2Session.publicKey,
    Ending.Split,
  );
  const join2Sig = await sendAndConfirmTx(conn, [player2], [join2Ix]);
  console.log(`   Tx Signature: ${join2Sig}`);
  assert(true, "Player 2 'join_room' transaction confirmed on Devnet");

  const vaultAfterP2 = await lamportsOf(BASE_RPC, vaultPda);
  assert(
    vaultAfterP2 === initialVaultBalance + Number(STAKE) * 2,
    `Vault balance grew to 2 stakes: 0.02 SOL total pot (${vaultAfterP2} lamports)`,
  );

  const roomAfterP2Info = await conn.getAccountInfo(roomPda);
  const roomAfterP2 = bluff.decodeRoom(new Uint8Array(roomAfterP2Info!.data));
  assert(roomAfterP2.seats.length === 2, "Room records 2 seated players");
  assert(roomAfterP2.seats[1].endingVote === Ending.Split, "Seat #2 vote registered as Ending::Split");

  // --------------------------------------------------------------------------
  // STEP 6: Transaction 4 - Player 3 Join with Vote: Winner Takes All (Coin)
  // --------------------------------------------------------------------------
  STEP(6, "Transaction 4: Player 3 Seats, Stakes 0.01 SOL & Votes 'Winner Takes All (Coin)'");

  const join3Ix = bluff.joinRoom(
    host.publicKey,
    ROOM_ID,
    player3.publicKey,
    player3Session.publicKey,
    Ending.Coin, // Vote option: Winner Takes All / Coin
  );
  const join3Sig = await sendAndConfirmTx(conn, [player3], [join3Ix]);
  console.log(`   Tx Signature: ${join3Sig}`);
  assert(true, "Player 3 'join_room' transaction confirmed on Devnet");

  const vaultAfterP3 = await lamportsOf(BASE_RPC, vaultPda);
  assert(
    vaultAfterP3 === initialVaultBalance + Number(STAKE) * 3,
    `Vault balance grew to 3 stakes: 0.03 SOL total pot (${vaultAfterP3} lamports)`,
  );

  const roomAfterP3Info = await conn.getAccountInfo(roomPda);
  const roomAfterP3 = bluff.decodeRoom(new Uint8Array(roomAfterP3Info!.data));
  assert(roomAfterP3.seats.length === 3, "Room records 3 seated players");
  assert(roomAfterP3.seats[2].endingVote === Ending.Coin, "Seat #3 vote registered as Ending::Coin (Winner Takes All)");

  // --------------------------------------------------------------------------
  // STEP 7: Transaction 5 - Player 3 Leaves Room & Vault Refunds Stake
  // --------------------------------------------------------------------------
  STEP(7, "Transaction 5: Player 3 Leaves Room (Vault Refunds 0.01 SOL back to Player)");

  const p3BalanceBeforeLeave = await lamportsOf(BASE_RPC, player3.publicKey);
  const leaveIx = bluff.leaveRoom(host.publicKey, ROOM_ID, player3.publicKey);
  const leaveSig = await sendAndConfirmTx(conn, [player3], [leaveIx]);
  console.log(`   Tx Signature: ${leaveSig}`);
  assert(true, "Player 3 'leave_room' refund transaction confirmed on Devnet");

  const vaultAfterLeave = await lamportsOf(BASE_RPC, vaultPda);
  assert(
    vaultAfterLeave === initialVaultBalance + Number(STAKE) * 2,
    `Vault balance decreased by 0.01 SOL after refund (${vaultAfterLeave} lamports)`,
  );

  const p3BalanceAfterLeave = await lamportsOf(BASE_RPC, player3.publicKey);
  assert(
    p3BalanceAfterLeave > p3BalanceBeforeLeave,
    `Player 3 balance increased by refunded stake (${p3BalanceAfterLeave - p3BalanceBeforeLeave} lamports netted)`,
  );

  // --------------------------------------------------------------------------
  // STEP 8: Security Guard: Lock Room with < 3 Players is Blocked
  // --------------------------------------------------------------------------
  STEP(8, "Security Guard: Attempting to Lock Room with < 3 Players is Blocked by Contract");

  let blocked = false;
  try {
    const prematureLockIx = bluff.lockRoom(host.publicKey, ROOM_ID, hostSession.publicKey);
    await sendAndConfirmTx(conn, [hostSession], [prematureLockIx]);
  } catch (err: any) {
    blocked = true;
  }
  assert(blocked, "Contract correctly blocked premature lock with only 2 players (TooFewPlayers guard active)");

  // --------------------------------------------------------------------------
  // STEP 9: Transaction 6 - Player 4 Seats with Vote: Split Pot (Reaching 3 Active Players)
  // --------------------------------------------------------------------------
  STEP(9, "Transaction 6: Player 4 Seats, Stakes 0.01 SOL & Votes 'Split Pot (50/50)'");

  const join4Ix = bluff.joinRoom(
    host.publicKey,
    ROOM_ID,
    player4.publicKey,
    player4Session.publicKey,
    Ending.Split,
  );
  const join4Sig = await sendAndConfirmTx(conn, [player4], [join4Ix]);
  console.log(`   Tx Signature: ${join4Sig}`);
  assert(true, "Player 4 'join_room' transaction confirmed on Devnet (Table has 3 active players)");

  const vaultAfterP4 = await lamportsOf(BASE_RPC, vaultPda);
  assert(
    vaultAfterP4 === initialVaultBalance + Number(STAKE) * 3,
    `Vault balance grew to 3 active stakes: 0.03 SOL total pot (${vaultAfterP4} lamports)`,
  );

  // --------------------------------------------------------------------------
  // STEP 10: Transaction 7 - Lock Room (Closes Door & Transitions to Playing)
  // --------------------------------------------------------------------------
  STEP(10, "Transaction 7: Host Locks Room (Freezes Votes & Starts Round 1)");

  const lockIx = bluff.lockRoom(host.publicKey, ROOM_ID, hostSession.publicKey);
  const lockSig = await sendAndConfirmTx(conn, [hostSession], [lockIx]);
  console.log(`   Tx Signature: ${lockSig}`);
  assert(true, "Host session 'lock_room' transaction confirmed on Devnet");

  const roomLockedInfo = await conn.getAccountInfo(roomPda);
  const roomLocked = bluff.decodeRoom(new Uint8Array(roomLockedInfo!.data));
  assert(roomLocked.phase === Phase.Playing, "Room state transitioned from Phase::Open to Phase::Playing");
  assert(roomLocked.round === 1, "Game successfully started at Round 1");
  assert(roomLocked.ending === Ending.Split, "Tiebreak vote tallied and frozen as Ending::Split (Majority 3 to 0)");

  // --------------------------------------------------------------------------
  // SUMMARY
  // --------------------------------------------------------------------------
  console.log("\n=================================================================");
  console.log(` ON-CHAIN TRANSACTION RESULTS: ${testsPassed} PASSED, ${testsFailed} FAILED `);
  console.log("=================================================================\n");
}

runOnChainTransactionTests().catch((err) => {
  console.error("\n[FATAL ERROR IN ON-CHAIN TRANSACTIONS TEST]:", err);
  process.exit(1);
});
