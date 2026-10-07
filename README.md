# Bluff

You win by knowing who is lying.

Five dice under every cup. You bid on how many dice of a face exist across the
entire table. You can raise the bid or call someone a liar. When bluff is called,
all cups lift. Someone loses a die. Last one standing with dice takes the pot.

Built for the Solana Blitz v9 Hackathon, with MagicBlock doing three jobs that
nothing else can do.

## Why it needs a rollup

**The dice are sealed.** They live in an account delegated to a Private ER whose
permission has no members at all, so the program inside the rollup can read them
and nobody else can — not the other players, not the host, not the node operator.
If dice were visible on-chain anyone could count the table and the game would be
pointless. On a public chain the only alternative is commit-reveal: multiple
transactions per player per round, doubled latency, and anyone who declines to
reveal stalls the round. In a fast-paced game of deception, that is unplayable.

**Sub-second turns with gasless sessions.** Bidding happens in seconds: raise,
raise, call bluff. Signing wallet approval popups and waiting for base layer
confirmations on every single bid kills the psychological momentum. Session keys
inside the rollup let players bid and challenge with sub-50ms finality and zero
fees.

**The money never leaves Solana.** Stakes sit in a vault PDA that is never
delegated. The rollup runs the table rounds and decides who won; it cannot pay
anybody. Settlement happens on the base layer from state the rollup committed back
and this program checked.

## Layout

```
programs/bluff/    the Anchor program
web/               the web app, with live table, 3D dice, and AI bots
scripts/           IDL-driven client and test runs
```

## Running it

```bash
anchor build && cargo test -p bluff   # 32 tests
cd scripts && bun run game.ts         # the whole game, live on devnet
cd web && bun run dev                 # the web app, at :5173
```

## Testing and Invariant Verification

The on-chain protocol includes 32 deterministic tests running against the compiled BPF binary via LiteSVM (an in-memory Solana runtime). This executes transactions directly against the program bytecode in milliseconds without needing an external validator cluster.

To execute the test suite:

```bash
anchor build
cargo test -p bluff
```

### Test Coverage Breakdown

1. **Room Lifecycle and Vault Constraints (`tests/phase2_room.rs` - 19 tests)**
   - **Initial State**: Verifies new rooms initialize in the Open phase with exact stake and host parameters.
   - **Privacy Headroom**: Confirms the sealed answers account carries sufficient rent-exempt headroom to self-fund private rollup permissions.
   - **Vault Isolation**: Ensures stakes reside in a program-derived vault PDA that is never delegated to the rollup.
   - **Seat Access Control**: Rejects duplicate seating by the same wallet and enforces table capacity limits (3 to 6 players).
   - **Refund Guarantees**: Confirms players leaving an open room receive their stake back without disturbing remaining seats.
   - **State Locking**: Locks the room once round one begins, rejecting further joins and preventing mid-game exits.
   - **Session Key Authorization**: Validates that delegated session keys are tied to specific seats and cannot act on behalf of unauthorized wallets.

2. **Settlement and Payout Safety (`tests/phase8_settle.rs` - 10 tests)**
   - **Winner Payouts**: Single survivors collect the accumulated pot, while ties split proceeds evenly.
   - **Rent Exemption Invariant**: Proves the vault PDA remains exactly at its rent-exempt minimum after all payouts.
   - **Deadlock Refunds**: Fully refunds all seated participants if all players are eliminated simultaneously.
   - **Anti-Tampering Checks**: Rejects payouts if the provided winner list is incomplete, swapped, or does not match the attested survivors.
   - **Idempotency**: Prevents double-settlement on already paid-out rooms.
   - **Permissionless Trigger**: Allows any caller to trigger the payout as long as the payout recipients strictly match verified game survivors.

3. **Core Instruction Logic (`src/instructions/` - 3 tests)**
   - Verifies turn transitions, queue arithmetic, and state serialization.

`ARCHITECTURE.md` records what was proven before any of this was written.
