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

```
cd web && bun install && bun run dev   # the web app, at :5173
anchor build                           # the Anchor program
```

`ARCHITECTURE.md` records what was proven before any of this was written.
