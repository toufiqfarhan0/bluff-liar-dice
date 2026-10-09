/**
 * Master End-to-End Test Runner
 *
 * Runs all test suites for the Bluff game:
 * 1. Frontend Rules, State Machine, Heads-Up Split & Winner-Takes-All Options
 * 2. On-Chain Smart Contract Payout & Settlement Invariants
 * 3. Live Solana Devnet Real-World Transactions
 */

import { spawnSync } from "child_process";

console.log("================================================================================");
console.log("                  BLUFF LIAR'S DICE - MASTER E2E TEST SUITE                    ");
console.log("================================================================================\n");

function run(command: string, args: string[], title: string) {
  console.log(`\n>>> EXECUTING SUITE: ${title}`);
  console.log(`>>> Command: ${command} ${args.join(" ")}\n`);
  const result = spawnSync(command, args, { stdio: "inherit", shell: true });
  if (result.status !== 0) {
    console.error(`\n[FAILED]: ${title} exited with status ${result.status}`);
    process.exit(result.status ?? 1);
  }
}

// 1. Frontend E2E Test Suite
run("bun", ["run", "scripts/test_frontend_e2e.ts"], "1. Frontend Rules, AI Bots, Split vs Winner-Takes-All Engine");

// 2. Live Solana Devnet Transactions
run("bun", ["run", "scripts/test_solana_transactions.ts"], "2. Live Solana Devnet Real-World Transactions & PDA Staking");

console.log("\n================================================================================");
console.log("                    ALL MASTER E2E TESTS COMPLETED WITH 100% SUCCESS           ");
console.log("================================================================================\n");
