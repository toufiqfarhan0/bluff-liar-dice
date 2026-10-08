# Step 1 — Architectural Validation & Rollup Feasibility

Conducted against MagicBlock's live devnet TEE ephemeral rollup (`devnet-tee.magicblock.app`) alongside the on-chain VRF oracle. All criteria verified successfully to support Bluff's high-speed Liar's Dice mechanics.

---

### Step 1.1 · Committing Rollup State to Solana Base Layer — PASS

- **Mechanism**: A delegated game table state account executed inside the TEE rollup and committed state back to L1 without requiring full account undelegation.
- **Latency**: State changes were confirmed and viewable on Solana within ~10 seconds.
- **Rationale for Bluff**: While gameplay turns and dice bidding occur within the ephemeral rollup at millisecond speeds, player stakes reside securely in Solana's base-layer vault PDA. Settlement and payouts require the final survivor record to reliably land on the base layer. Successful state commits ensure atomic, tamper-proof payouts.

---

### Step 1.2 · Hidden Dice Cups & Zero-Knowledge Table Privacy — PASS

- **Mechanism**: Ephemeral rollup permissions initialized with `is_private: true` and an **empty** authorized member list.
- **Result**: The account is inaccessible to outside observers — whether anonymous RPC queries, authenticated wallets, or the table host. Only the verified on-chain program running inside the secure enclave can access and verify the underlying state.
- **Rationale for Bluff**: In Liar's Dice, hidden information is the foundation of gameplay. If dice rolls were readable on a public ledger, opponents could compute optimal bids and destroy the psychological deception. Enclave-protected private state allows cups to remain concealed until the showdown call, completely avoiding costly, high-latency commit-reveal schemes.

---

### Step 1.3 · Provably Fair Randomness & Enclave VRF — PASS

- **Mechanism**: Initiated `request_roll` calls directly from within the rollup against `DEFAULT_EPHEMERAL_QUEUE`. The VRF callback populated verifiable randomness into the table state within a few seconds.
- **Rationale for Bluff**: Cryptographic randomness is essential for authentic dice rolling and impartial sudden-death tiebreaks between finalists. Integrating MagicBlock VRF inside the rollup guarantees that dice outcomes cannot be predicted or manipulated by players or sequencers.

---

### Step 1.4 · Client Integration & Protocol Considerations

1. **Dynamic PDA Derivation**:
   - The Anchor IDL specifies delegation and metadata records derived under the account reference (`delegation_program`) rather than a hardcoded literal. Client SDKs must dynamically resolve this program account to prevent seeds constraint mismatches.

2. **Commitment Pinning**:
   - All state reads within the client pipeline must explicitly specify `commitment: "confirmed"`. Relying on default finalized queries causes newly seated rooms or freshly committed rounds to appear temporarily uninitialized.
