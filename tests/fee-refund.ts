/**
 * Fee Refund Tests — 10 tests (LiteSVM)
 *
 * Tests the self-replenishing fee loop: finalize_session refunds agent's
 * transaction fee from vault PDA lamports. MAX_FEE_REFUND = 100,000 lamports.
 */
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Phalnx } from "../target/types/phalnx";
import {
  Keypair,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL,
  SYSVAR_INSTRUCTIONS_PUBKEY,
} from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
} from "@solana/spl-token";
import { expect } from "chai";
import BN from "bn.js";
import {
  createTestEnv,
  airdropSol,
  createMintAtAddress,
  DEVNET_USDC_MINT,
  createAtaHelper,
  createAtaIdempotentHelper,
  mintToHelper,
  getTokenBalance,
  accountExists,
  sendVersionedTx,
  recordCU,
  printCUSummary,
  TestEnv,
  LiteSVM,
} from "./helpers/litesvm-setup";

const FULL_PERMISSIONS = new BN((1n << 21n) - 1n);
const MAX_FEE_REFUND = 100_000; // matches on-chain constant

describe("fee-refund", () => {
  let env: TestEnv;
  let svm: LiteSVM;
  let program: Program<Phalnx>;

  let owner: anchor.Wallet;
  const agent = Keypair.generate();
  const feeDestination = Keypair.generate();

  let usdcMint: PublicKey;
  const vaultId = new BN(500);

  // PDAs
  let vaultPda: PublicKey;
  let policyPda: PublicKey;
  let trackerPda: PublicKey;
  let overlayPda: PublicKey;
  let sessionPda: PublicKey;

  // Token accounts
  let ownerUsdcAta: PublicKey;
  let vaultUsdcAta: PublicKey;

  const jupiterProgramId = Keypair.generate().publicKey;

  // Protocol treasury (matches hardcoded constant in program)
  const protocolTreasury = new PublicKey(
    "ASHie1dFTnDSnrHMPGmniJhMgfJVGPm3rAaEPnrtWDiT",
  );
  let protocolTreasuryUsdcAta: PublicKey;

  after(() => printCUSummary());

  /** Helper: build validate + finalize instructions */
  async function buildComposedIx(
    agentKey: Keypair,
    amount: BN,
    refundLamports: BN | null,
  ) {
    const sess = PublicKey.findProgramAddressSync(
      [
        Buffer.from("session"),
        vaultPda.toBuffer(),
        agentKey.publicKey.toBuffer(),
        usdcMint.toBuffer(),
      ],
      program.programId,
    )[0];

    const validateIx = await program.methods
      .validateAndAuthorize(
        { swap: {} },
        usdcMint,
        amount,
        jupiterProgramId,
        null,
      )
      .accountsPartial({
        agent: agentKey.publicKey,
        vault: vaultPda,
        policy: policyPda,
        tracker: trackerPda,
        session: sess,
        vaultTokenAccount: vaultUsdcAta,
        tokenMintAccount: usdcMint,
        protocolTreasuryTokenAccount: protocolTreasuryUsdcAta,
        feeDestinationTokenAccount: null,
        outputStablecoinAccount: null,
        agentSpendOverlay: overlayPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        instructionsSysvar: SYSVAR_INSTRUCTIONS_PUBKEY,
      })
      .instruction();

    const finalizeIx = await program.methods
      .finalizeSession(true, refundLamports)
      .accountsPartial({
        payer: agentKey.publicKey,
        vault: vaultPda,
        session: sess,
        sessionRentRecipient: agentKey.publicKey,
        policy: policyPda,
        tracker: trackerPda,
        vaultTokenAccount: vaultUsdcAta,
        agentSpendOverlay: overlayPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        instructionsSysvar: SYSVAR_INSTRUCTIONS_PUBKEY,
        outputStablecoinAccount: null,
      })
      .instruction();

    return { validateIx, finalizeIx, sessionPda: sess };
  }

  before(async () => {
    env = createTestEnv();
    svm = env.svm;
    program = env.program;
    owner = env.provider.wallet;

    // Airdrop
    airdropSol(svm, owner.publicKey, 100 * LAMPORTS_PER_SOL);
    airdropSol(svm, agent.publicKey, 10 * LAMPORTS_PER_SOL);
    airdropSol(svm, feeDestination.publicKey, 2 * LAMPORTS_PER_SOL);

    // Create USDC mint at hardcoded address
    createMintAtAddress(svm, DEVNET_USDC_MINT, owner.publicKey, 6);
    usdcMint = DEVNET_USDC_MINT;

    // Create owner USDC ATA and mint tokens
    ownerUsdcAta = createAtaHelper(
      svm,
      (owner as any).payer,
      usdcMint,
      owner.publicKey,
    );
    mintToHelper(
      svm,
      (owner as any).payer,
      usdcMint,
      ownerUsdcAta,
      owner.publicKey,
      2_000_000_000n, // 2000 USDC
    );

    // Protocol treasury ATA (off-curve)
    protocolTreasuryUsdcAta = createAtaIdempotentHelper(
      svm,
      (owner as any).payer,
      usdcMint,
      protocolTreasury,
      true,
    );

    // Derive PDAs
    [vaultPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("vault"),
        owner.publicKey.toBuffer(),
        vaultId.toArrayLike(Buffer, "le", 8),
      ],
      program.programId,
    );
    [policyPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("policy"), vaultPda.toBuffer()],
      program.programId,
    );
    [trackerPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("tracker"), vaultPda.toBuffer()],
      program.programId,
    );
    [overlayPda] = PublicKey.findProgramAddressSync(
      [Buffer.from("agent_spend"), vaultPda.toBuffer(), Buffer.from([0])],
      program.programId,
    );
    [sessionPda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("session"),
        vaultPda.toBuffer(),
        agent.publicKey.toBuffer(),
        usdcMint.toBuffer(),
      ],
      program.programId,
    );

    vaultUsdcAta = anchor.utils.token.associatedAddress({
      mint: usdcMint,
      owner: vaultPda,
    });

    // Initialize vault
    await program.methods
      .initializeVault(
        vaultId,
        new BN(500_000_000), // daily cap: 500 USDC
        new BN(100_000_000), // max tx: 100 USDC
        1, // protocolMode: allowlist
        [jupiterProgramId],
        new BN(0) as any, // max_leverage_bps
        3, // max_concurrent_positions
        0, // developer_fee_rate
        100, // maxSlippageBps (1%)
        new BN(0), // timelockDuration
        [], // allowedDestinations
        [], // protocolCaps
      )
      .accounts({
        owner: owner.publicKey,
        vault: vaultPda,
        policy: policyPda,
        tracker: trackerPda,
        agentSpendOverlay: overlayPda,
        feeDestination: feeDestination.publicKey,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();

    // Register agent
    await program.methods
      .registerAgent(agent.publicKey, FULL_PERMISSIONS, new BN(0))
      .accounts({
        owner: owner.publicKey,
        vault: vaultPda,
        agentSpendOverlay: overlayPda,
      } as any)
      .rpc();

    // Deposit USDC
    await program.methods
      .depositFunds(new BN(500_000_000)) // 500 USDC
      .accounts({
        owner: owner.publicKey,
        vault: vaultPda,
        mint: usdcMint,
        ownerTokenAccount: ownerUsdcAta,
        vaultTokenAccount: vaultUsdcAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();
  });

  it("1. finalize_session refunds SOL from vault to agent", async () => {
    // Fund vault PDA with SOL (simulates owner seeding)
    airdropSol(svm, vaultPda, LAMPORTS_PER_SOL);

    const agentBefore = svm.getBalance(agent.publicKey);
    const vaultSolBefore = svm.getBalance(vaultPda);

    const { validateIx, finalizeIx } = await buildComposedIx(
      agent,
      new BN(10_000_000), // 10 USDC
      new BN(50_000), // request 50K lamports refund
    );

    const result = sendVersionedTx(svm, [validateIx, finalizeIx], agent);
    recordCU("fee-refund:basic", result);

    const agentAfter = svm.getBalance(agent.publicKey);
    const vaultSolAfter = svm.getBalance(vaultPda);

    // Agent should have gained ~50K lamports (minus tx fee, plus refund)
    // Vault PDA should have lost exactly 50K lamports
    const vaultDelta = Number(vaultSolBefore) - Number(vaultSolAfter);
    expect(vaultDelta).to.equal(50_000);

    console.log(
      `    Vault SOL delta: -${vaultDelta}, agent SOL net change: ${Number(agentAfter) - Number(agentBefore)}`,
    );
  });

  it("2. finalize_session caps refund at MAX_FEE_REFUND", async () => {
    const vaultSolBefore = svm.getBalance(vaultPda);

    const { validateIx, finalizeIx } = await buildComposedIx(
      agent,
      new BN(10_000_000),
      new BN(LAMPORTS_PER_SOL), // request 1 SOL — way above cap
    );

    const result = sendVersionedTx(svm, [validateIx, finalizeIx], agent);
    recordCU("fee-refund:capped", result);

    const vaultSolAfter = svm.getBalance(vaultPda);
    const vaultDelta = Number(vaultSolBefore) - Number(vaultSolAfter);

    // Should be capped at MAX_FEE_REFUND (100K lamports), not 1 SOL
    expect(vaultDelta).to.equal(MAX_FEE_REFUND);
    console.log(`    Requested 1 SOL, capped at ${vaultDelta} lamports`);
  });

  it("3. finalize_session gracefully handles zero vault SOL", async () => {
    // Create a fresh vault with 0 extra SOL (just rent-exempt minimum)
    const zeroSolVaultId = new BN(501);
    const [zeroVault] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("vault"),
        owner.publicKey.toBuffer(),
        zeroSolVaultId.toArrayLike(Buffer, "le", 8),
      ],
      program.programId,
    );
    const [zeroPolicy] = PublicKey.findProgramAddressSync(
      [Buffer.from("policy"), zeroVault.toBuffer()],
      program.programId,
    );
    const [zeroTracker] = PublicKey.findProgramAddressSync(
      [Buffer.from("tracker"), zeroVault.toBuffer()],
      program.programId,
    );
    const [zeroOverlay] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("agent_spend"),
        zeroVault.toBuffer(),
        Buffer.from([0]),
      ],
      program.programId,
    );
    const zeroVaultAta = anchor.utils.token.associatedAddress({
      mint: usdcMint,
      owner: zeroVault,
    });

    await program.methods
      .initializeVault(
        zeroSolVaultId,
        new BN(500_000_000),
        new BN(100_000_000),
        1,
        [jupiterProgramId],
        new BN(0) as any,
        3,
        0,
        100,
        new BN(0),
        [],
        [],
      )
      .accounts({
        owner: owner.publicKey,
        vault: zeroVault,
        policy: zeroPolicy,
        tracker: zeroTracker,
        agentSpendOverlay: zeroOverlay,
        feeDestination: feeDestination.publicKey,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();

    await program.methods
      .registerAgent(agent.publicKey, FULL_PERMISSIONS, new BN(0))
      .accounts({
        owner: owner.publicKey,
        vault: zeroVault,
        agentSpendOverlay: zeroOverlay,
      } as any)
      .rpc();

    await program.methods
      .depositFunds(new BN(100_000_000))
      .accounts({
        owner: owner.publicKey,
        vault: zeroVault,
        mint: usdcMint,
        ownerTokenAccount: ownerUsdcAta,
        vaultTokenAccount: zeroVaultAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();

    // Vault PDA has only rent-exempt minimum SOL — no surplus to refund
    const vaultSolBefore = svm.getBalance(zeroVault);

    const [zeroSession] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("session"),
        zeroVault.toBuffer(),
        agent.publicKey.toBuffer(),
        usdcMint.toBuffer(),
      ],
      program.programId,
    );

    const validateIx = await program.methods
      .validateAndAuthorize(
        { swap: {} },
        usdcMint,
        new BN(10_000_000),
        jupiterProgramId,
        null,
      )
      .accountsPartial({
        agent: agent.publicKey,
        vault: zeroVault,
        policy: zeroPolicy,
        tracker: zeroTracker,
        session: zeroSession,
        vaultTokenAccount: zeroVaultAta,
        tokenMintAccount: usdcMint,
        protocolTreasuryTokenAccount: protocolTreasuryUsdcAta,
        feeDestinationTokenAccount: null,
        outputStablecoinAccount: null,
        agentSpendOverlay: zeroOverlay,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        instructionsSysvar: SYSVAR_INSTRUCTIONS_PUBKEY,
      })
      .instruction();

    const finalizeIx = await program.methods
      .finalizeSession(true, new BN(50_000))
      .accountsPartial({
        payer: agent.publicKey,
        vault: zeroVault,
        session: zeroSession,
        sessionRentRecipient: agent.publicKey,
        policy: zeroPolicy,
        tracker: zeroTracker,
        vaultTokenAccount: zeroVaultAta,
        agentSpendOverlay: zeroOverlay,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        instructionsSysvar: SYSVAR_INSTRUCTIONS_PUBKEY,
        outputStablecoinAccount: null,
      })
      .instruction();

    // Should NOT fail — refund gracefully skipped when no surplus SOL
    sendVersionedTx(svm, [validateIx, finalizeIx], agent);

    const vaultSolAfter = svm.getBalance(zeroVault);
    // Vault SOL should be unchanged (no surplus to refund)
    expect(Number(vaultSolAfter)).to.be.at.most(Number(vaultSolBefore));
    console.log(
      `    Vault SOL: ${vaultSolBefore} -> ${vaultSolAfter} (no surplus to refund)`,
    );
  });

  it("4. finalize_session with refund_lamports = None skips refund", async () => {
    const vaultSolBefore = svm.getBalance(vaultPda);

    const { validateIx, finalizeIx } = await buildComposedIx(
      agent,
      new BN(10_000_000),
      null, // No refund requested
    );

    sendVersionedTx(svm, [validateIx, finalizeIx], agent);

    const vaultSolAfter = svm.getBalance(vaultPda);
    // No SOL should be transferred from vault
    expect(Number(vaultSolAfter)).to.equal(Number(vaultSolBefore));
    console.log("    No refund requested, vault SOL unchanged");
  });

  it("5. finalize_session preserves vault rent-exempt minimum", async () => {
    // Create another vault and fund it with exactly rent + tiny surplus
    const rentVaultId = new BN(502);
    const [rentVault] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("vault"),
        owner.publicKey.toBuffer(),
        rentVaultId.toArrayLike(Buffer, "le", 8),
      ],
      program.programId,
    );
    const [rentPolicy] = PublicKey.findProgramAddressSync(
      [Buffer.from("policy"), rentVault.toBuffer()],
      program.programId,
    );
    const [rentTracker] = PublicKey.findProgramAddressSync(
      [Buffer.from("tracker"), rentVault.toBuffer()],
      program.programId,
    );
    const [rentOverlay] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("agent_spend"),
        rentVault.toBuffer(),
        Buffer.from([0]),
      ],
      program.programId,
    );
    const rentVaultAta = anchor.utils.token.associatedAddress({
      mint: usdcMint,
      owner: rentVault,
    });

    await program.methods
      .initializeVault(
        rentVaultId,
        new BN(500_000_000),
        new BN(100_000_000),
        1,
        [jupiterProgramId],
        new BN(0) as any,
        3,
        0,
        100,
        new BN(0),
        [],
        [],
      )
      .accounts({
        owner: owner.publicKey,
        vault: rentVault,
        policy: rentPolicy,
        tracker: rentTracker,
        agentSpendOverlay: rentOverlay,
        feeDestination: feeDestination.publicKey,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();

    await program.methods
      .registerAgent(agent.publicKey, FULL_PERMISSIONS, new BN(0))
      .accounts({
        owner: owner.publicKey,
        vault: rentVault,
        agentSpendOverlay: rentOverlay,
      } as any)
      .rpc();

    await program.methods
      .depositFunds(new BN(100_000_000))
      .accounts({
        owner: owner.publicKey,
        vault: rentVault,
        mint: usdcMint,
        ownerTokenAccount: ownerUsdcAta,
        vaultTokenAccount: rentVaultAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();

    // Add exactly 500 lamports surplus above rent
    airdropSol(svm, rentVault, 500);

    const vaultSolBefore = svm.getBalance(rentVault);

    const [rentSession] = PublicKey.findProgramAddressSync(
      [
        Buffer.from("session"),
        rentVault.toBuffer(),
        agent.publicKey.toBuffer(),
        usdcMint.toBuffer(),
      ],
      program.programId,
    );

    const validateIx = await program.methods
      .validateAndAuthorize(
        { swap: {} },
        usdcMint,
        new BN(10_000_000),
        jupiterProgramId,
        null,
      )
      .accountsPartial({
        agent: agent.publicKey,
        vault: rentVault,
        policy: rentPolicy,
        tracker: rentTracker,
        session: rentSession,
        vaultTokenAccount: rentVaultAta,
        tokenMintAccount: usdcMint,
        protocolTreasuryTokenAccount: protocolTreasuryUsdcAta,
        feeDestinationTokenAccount: null,
        outputStablecoinAccount: null,
        agentSpendOverlay: rentOverlay,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        instructionsSysvar: SYSVAR_INSTRUCTIONS_PUBKEY,
      })
      .instruction();

    const finalizeIx = await program.methods
      .finalizeSession(true, new BN(50_000)) // request 50K, only 500 surplus available
      .accountsPartial({
        payer: agent.publicKey,
        vault: rentVault,
        session: rentSession,
        sessionRentRecipient: agent.publicKey,
        policy: rentPolicy,
        tracker: rentTracker,
        vaultTokenAccount: rentVaultAta,
        agentSpendOverlay: rentOverlay,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        instructionsSysvar: SYSVAR_INSTRUCTIONS_PUBKEY,
        outputStablecoinAccount: null,
      })
      .instruction();

    sendVersionedTx(svm, [validateIx, finalizeIx], agent);

    const vaultSolAfter = svm.getBalance(rentVault);
    const delta = Number(vaultSolBefore) - Number(vaultSolAfter);

    // Should only refund 500 (the surplus), not the full 50K requested
    expect(delta).to.equal(500);
    console.log(
      `    Requested 50K, only ${delta} refunded (surplus above rent floor)`,
    );
  });

  it("6. refund works with success=false (failed session)", async () => {
    // When a session fails (success=false), the refund should still work —
    // the agent still paid the tx fee and deserves reimbursement.
    const vaultSolBefore = svm.getBalance(vaultPda);

    const validateIx = await program.methods
      .validateAndAuthorize(
        { swap: {} },
        usdcMint,
        new BN(10_000_000),
        jupiterProgramId,
        null,
      )
      .accountsPartial({
        agent: agent.publicKey,
        vault: vaultPda,
        policy: policyPda,
        tracker: trackerPda,
        session: sessionPda,
        vaultTokenAccount: vaultUsdcAta,
        tokenMintAccount: usdcMint,
        protocolTreasuryTokenAccount: protocolTreasuryUsdcAta,
        feeDestinationTokenAccount: null,
        outputStablecoinAccount: null,
        agentSpendOverlay: overlayPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        instructionsSysvar: SYSVAR_INSTRUCTIONS_PUBKEY,
      })
      .instruction();

    // finalize with success=false AND refund
    const finalizeIx = await program.methods
      .finalizeSession(false, new BN(50_000))
      .accountsPartial({
        payer: agent.publicKey,
        vault: vaultPda,
        session: sessionPda,
        sessionRentRecipient: agent.publicKey,
        policy: policyPda,
        tracker: trackerPda,
        vaultTokenAccount: vaultUsdcAta,
        agentSpendOverlay: overlayPda,
        tokenProgram: TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
        instructionsSysvar: SYSVAR_INSTRUCTIONS_PUBKEY,
        outputStablecoinAccount: null,
      })
      .instruction();

    sendVersionedTx(svm, [validateIx, finalizeIx], agent);

    const vaultSolAfter = svm.getBalance(vaultPda);
    const delta = Number(vaultSolBefore) - Number(vaultSolAfter);

    // Refund should still happen even on failed session
    expect(delta).to.equal(50_000);
    console.log(
      `    success=false session still refunded ${delta} lamports to agent`,
    );
  });

  it("7. agent SOL balance stable over 5 composed txs with refund", async () => {
    // Ensure vault has SOL
    airdropSol(svm, vaultPda, LAMPORTS_PER_SOL);

    const agentStart = svm.getBalance(agent.publicKey);

    for (let i = 0; i < 5; i++) {
      const { validateIx, finalizeIx } = await buildComposedIx(
        agent,
        new BN(1_000_000), // 1 USDC per tx
        new BN(50_000), // refund 50K lamports
      );
      sendVersionedTx(svm, [validateIx, finalizeIx], agent);
    }

    const agentEnd = svm.getBalance(agent.publicKey);
    const netChange = Number(agentEnd) - Number(agentStart);

    // Agent balance should be approximately stable: losing ~5K fee per tx,
    // gaining 50K refund. Net gain ~45K per tx = ~225K over 5 txs.
    // (LiteSVM base fee is ~5K lamports)
    expect(netChange).to.be.greaterThan(-50_000); // not significantly drained
    console.log(
      `    Agent SOL after 5 txs: net ${netChange > 0 ? "+" : ""}${netChange} lamports`,
    );
  });

  it("8. refund_lamports = 0 skips refund", async () => {
    const vaultSolBefore = svm.getBalance(vaultPda);

    const { validateIx, finalizeIx } = await buildComposedIx(
      agent,
      new BN(1_000_000),
      new BN(0), // explicit zero
    );

    sendVersionedTx(svm, [validateIx, finalizeIx], agent);

    const vaultSolAfter = svm.getBalance(vaultPda);
    expect(Number(vaultSolAfter)).to.equal(Number(vaultSolBefore));
    console.log("    refund_lamports=0, vault SOL unchanged");
  });

  it("9. refund exactly MAX_FEE_REFUND succeeds", async () => {
    const vaultSolBefore = svm.getBalance(vaultPda);

    const { validateIx, finalizeIx } = await buildComposedIx(
      agent,
      new BN(1_000_000),
      new BN(MAX_FEE_REFUND), // exactly at cap
    );

    const result = sendVersionedTx(svm, [validateIx, finalizeIx], agent);
    recordCU("fee-refund:max", result);

    const vaultSolAfter = svm.getBalance(vaultPda);
    const delta = Number(vaultSolBefore) - Number(vaultSolAfter);
    expect(delta).to.equal(MAX_FEE_REFUND);
    console.log(`    Refund exactly MAX_FEE_REFUND: ${delta} lamports`);
  });

  it("10. fundVaultSol pattern: owner transfers SOL to vault PDA", async () => {
    const vaultSolBefore = svm.getBalance(vaultPda);
    const fundAmount = LAMPORTS_PER_SOL / 100; // 0.01 SOL

    // Simulate what fundVaultSol() does: System Program transfer
    airdropSol(svm, vaultPda, fundAmount);

    const vaultSolAfter = svm.getBalance(vaultPda);
    const delta = Number(vaultSolAfter) - Number(vaultSolBefore);
    expect(delta).to.equal(fundAmount);
    console.log(
      `    Funded vault with ${fundAmount} lamports, balance: ${vaultSolAfter}`,
    );
  });
});
