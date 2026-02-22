/**
 * Devnet Spending Tests — 8 tests
 *
 * Multi-token spending with rolling windows and per-token caps.
 * Exercises aggregate USD caps, per-token base caps, token_index
 * correctness, and tracker audit log.
 */
import * as anchor from "@coral-xyz/anchor";
import { Keypair, PublicKey, SystemProgram } from "@solana/web3.js";
import {
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createMint,
  createAssociatedTokenAccount,
  mintTo,
} from "@solana/spl-token";
import { expect } from "chai";
import BN from "bn.js";
import {
  getDevnetProvider,
  makeAllowedToken,
  nextVaultId,
  derivePDAs,
  deriveSessionPda,
  createFullVault,
  authorize,
  finalize,
  authorizeAndFinalize,
  fundKeypair,
  expectError,
  FullVaultResult,
} from "./helpers/devnet-setup";

describe("devnet-spending", () => {
  const { provider, program, connection, owner } = getDevnetProvider();
  const payer = (owner as any).payer;

  const agent = Keypair.generate();
  const feeDestination = Keypair.generate();
  const jupiterProgramId = Keypair.generate().publicKey;

  let mintA: PublicKey; // 6 decimals (USDC-like stablecoin)
  let mintB: PublicKey; // 9 decimals (SOL-like stablecoin, oracleFeed=default)

  before(async () => {
    await fundKeypair(provider, agent.publicKey);
    mintA = await createMint(connection, payer, owner.publicKey, null, 6);
    mintB = await createMint(connection, payer, owner.publicKey, null, 9);
    console.log("  MintA (6 dec):", mintA.toString());
    console.log("  MintB (9 dec):", mintB.toString());
  });

  /** Helper to create a two-token vault and deposit both mints */
  async function createDualTokenVault(opts: {
    dailyCap: BN;
    maxTx: BN;
    tokenA?: ReturnType<typeof makeAllowedToken>;
    tokenB?: ReturnType<typeof makeAllowedToken>;
  }) {
    const vaultId = nextVaultId(5);
    const tokenASpec = opts.tokenA ?? makeAllowedToken(mintA);
    const tokenBSpec = opts.tokenB ?? makeAllowedToken(mintB, PublicKey.default, 9);

    const vault = await createFullVault({
      program,
      connection,
      owner,
      agent,
      feeDestination: feeDestination.publicKey,
      mint: mintA,
      vaultId,
      dailyCap: opts.dailyCap,
      maxTx: opts.maxTx,
      allowedTokens: [tokenASpec, tokenBSpec],
      allowedProtocols: [jupiterProgramId],
      depositAmount: new BN(500_000_000),
    });

    // Deposit mintB
    const mintBVaultAta = anchor.utils.token.associatedAddress({
      mint: mintB,
      owner: vault.vaultPda,
    });
    const ownerMintBAta = await createAssociatedTokenAccount(
      connection,
      payer,
      mintB,
      owner.publicKey,
    );
    await mintTo(
      connection,
      payer,
      mintB,
      ownerMintBAta,
      owner.publicKey,
      500_000_000_000, // 500 tokens (9 dec)
    );
    await program.methods
      .depositFunds(new BN(500_000_000_000))
      .accounts({
        owner: owner.publicKey,
        vault: vault.vaultPda,
        mint: mintB,
        ownerTokenAccount: ownerMintBAta,
        vaultTokenAccount: mintBVaultAta,
        tokenProgram: TOKEN_PROGRAM_ID,
        associatedTokenProgram: ASSOCIATED_TOKEN_PROGRAM_ID,
        systemProgram: SystemProgram.programId,
      } as any)
      .rpc();

    return { ...vault, mintBVaultAta };
  }

  it("1. aggregate USD cap tracks across both tokens", async () => {
    const vault = await createDualTokenVault({
      dailyCap: new BN(200_000_000), // 200 USD
      maxTx: new BN(200_000_000),
    });

    // Spend 100 USDC via mintA (6 dec, stablecoin → 1:1 USD)
    const sessionA = deriveSessionPda(
      vault.vaultPda,
      agent.publicKey,
      mintA,
      program.programId,
    );
    await authorizeAndFinalize({
      program,
      agent,
      vaultPda: vault.vaultPda,
      policyPda: vault.policyPda,
      trackerPda: vault.trackerPda,
      sessionPda: sessionA,
      vaultTokenAta: vault.vaultTokenAta,
      mint: mintA,
      amount: new BN(100_000_000), // 100 USDC
      protocol: jupiterProgramId,
      feeDestinationAta: null,
      protocolTreasuryAta: vault.protocolTreasuryAta,
    });

    // Spend 100 mintB (9 dec stablecoin → 100 * 10^(6-9) = 0.1M per token → 100 * 1M = 100M USD)
    // For 9-decimal stablecoin: amount / 10^(9-6) = USD
    // 100 tokens = 100_000_000_000 (9 dec), USD = 100_000_000_000 / 1000 = 100_000_000
    const sessionB = deriveSessionPda(
      vault.vaultPda,
      agent.publicKey,
      mintB,
      program.programId,
    );
    await authorizeAndFinalize({
      program,
      agent,
      vaultPda: vault.vaultPda,
      policyPda: vault.policyPda,
      trackerPda: vault.trackerPda,
      sessionPda: sessionB,
      vaultTokenAta: vault.mintBVaultAta,
      mint: mintB,
      amount: new BN(100_000_000_000), // 100 tokens (9 dec) = 100 USD
      protocol: jupiterProgramId,
      feeDestinationAta: null,
      protocolTreasuryAta: vault.protocolTreasuryAta,
    });

    // Now at 200 USD cap — 1 more of either should fail
    const sessionC = deriveSessionPda(
      vault.vaultPda,
      agent.publicKey,
      mintA,
      program.programId,
    );
    try {
      await authorize({
        program,
        agent,
        vaultPda: vault.vaultPda,
        policyPda: vault.policyPda,
        trackerPda: vault.trackerPda,
        sessionPda: sessionC,
        vaultTokenAta: vault.vaultTokenAta,
        mint: mintA,
        amount: new BN(1_000_000), // 1 USDC more
        protocol: jupiterProgramId,
      });
      expect.fail("Should have thrown");
    } catch (err: any) {
      expectError(err, "DailyCapExceeded", "cap");
    }
    console.log("    Aggregate USD cap enforced across two tokens");
  });

  it("2. per-token dailyCapBase enforced independently", async () => {
    const vault = await createDualTokenVault({
      dailyCap: new BN(500_000_000), // 500 USD aggregate (plenty)
      maxTx: new BN(200_000_000),
      tokenA: makeAllowedToken(
        mintA,
        PublicKey.default,
        6,
        new BN(50_000_000), // per-token cap: 50 USDC
      ),
      tokenB: makeAllowedToken(
        mintB,
        PublicKey.default,
        9,
        new BN(50_000_000_000), // per-token cap: 50 tokens (9 dec)
      ),
    });

    // Spend 50 USDC of token A (hits per-token cap)
    const sessionA = deriveSessionPda(
      vault.vaultPda,
      agent.publicKey,
      mintA,
      program.programId,
    );
    await authorizeAndFinalize({
      program,
      agent,
      vaultPda: vault.vaultPda,
      policyPda: vault.policyPda,
      trackerPda: vault.trackerPda,
      sessionPda: sessionA,
      vaultTokenAta: vault.vaultTokenAta,
      mint: mintA,
      amount: new BN(50_000_000),
      protocol: jupiterProgramId,
      feeDestinationAta: null,
      protocolTreasuryAta: vault.protocolTreasuryAta,
    });

    // Token B should still work
    const sessionB = deriveSessionPda(
      vault.vaultPda,
      agent.publicKey,
      mintB,
      program.programId,
    );
    await authorizeAndFinalize({
      program,
      agent,
      vaultPda: vault.vaultPda,
      policyPda: vault.policyPda,
      trackerPda: vault.trackerPda,
      sessionPda: sessionB,
      vaultTokenAta: vault.mintBVaultAta,
      mint: mintB,
      amount: new BN(10_000_000_000), // 10 tokens of B
      protocol: jupiterProgramId,
      feeDestinationAta: null,
      protocolTreasuryAta: vault.protocolTreasuryAta,
    });

    // 1 more of token A should fail (per-token cap)
    const sessionC = deriveSessionPda(
      vault.vaultPda,
      agent.publicKey,
      mintA,
      program.programId,
    );
    try {
      await authorize({
        program,
        agent,
        vaultPda: vault.vaultPda,
        policyPda: vault.policyPda,
        trackerPda: vault.trackerPda,
        sessionPda: sessionC,
        vaultTokenAta: vault.vaultTokenAta,
        mint: mintA,
        amount: new BN(1_000_000),
        protocol: jupiterProgramId,
      });
      expect.fail("Should have thrown");
    } catch (err: any) {
      expectError(err, "PerTokenCapExceeded", "cap");
    }
    console.log("    Per-token dailyCapBase enforced independently");
  });

  it("3. update_policy with new allowed_tokens clears rolling_spends", async () => {
    const vault = await createDualTokenVault({
      dailyCap: new BN(200_000_000),
      maxTx: new BN(200_000_000),
    });

    // Spend some
    const sessionA = deriveSessionPda(
      vault.vaultPda,
      agent.publicKey,
      mintA,
      program.programId,
    );
    await authorizeAndFinalize({
      program,
      agent,
      vaultPda: vault.vaultPda,
      policyPda: vault.policyPda,
      trackerPda: vault.trackerPda,
      sessionPda: sessionA,
      vaultTokenAta: vault.vaultTokenAta,
      mint: mintA,
      amount: new BN(100_000_000),
      protocol: jupiterProgramId,
      feeDestinationAta: null,
      protocolTreasuryAta: vault.protocolTreasuryAta,
    });

    // Verify tracker has spend entries
    const trackerBefore = await program.account.spendTracker.fetch(
      vault.trackerPda,
    );
    expect(trackerBefore.rollingSpends.length).to.be.greaterThan(0);

    // Update allowed_tokens (triggers rolling_spends.clear())
    await program.methods
      .updatePolicy(
        null,
        null,
        [makeAllowedToken(mintA), makeAllowedToken(mintB, PublicKey.default, 9)],
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      )
      .accounts({
        owner: owner.publicKey,
        vault: vault.vaultPda,
        policy: vault.policyPda,
        tracker: vault.trackerPda,
      } as any)
      .rpc();

    // Verify rolling_spends cleared
    const trackerAfter = await program.account.spendTracker.fetch(
      vault.trackerPda,
    );
    expect(trackerAfter.rollingSpends.length).to.equal(0);

    // Can spend full cap again
    const sessionB = deriveSessionPda(
      vault.vaultPda,
      agent.publicKey,
      mintA,
      program.programId,
    );
    await authorizeAndFinalize({
      program,
      agent,
      vaultPda: vault.vaultPda,
      policyPda: vault.policyPda,
      trackerPda: vault.trackerPda,
      sessionPda: sessionB,
      vaultTokenAta: vault.vaultTokenAta,
      mint: mintA,
      amount: new BN(200_000_000),
      protocol: jupiterProgramId,
      feeDestinationAta: null,
      protocolTreasuryAta: vault.protocolTreasuryAta,
    });
    console.log("    Token list update cleared rolling_spends");
  });

  it("4. token_index correctness after policy update", async () => {
    const vault = await createDualTokenVault({
      dailyCap: new BN(500_000_000),
      maxTx: new BN(200_000_000),
    });

    // Update policy to [mintB, mintA] (reversed order)
    await program.methods
      .updatePolicy(
        null,
        null,
        [makeAllowedToken(mintB, PublicKey.default, 9), makeAllowedToken(mintA)],
        null,
        null,
        null,
        null,
        null,
        null,
        null,
      )
      .accounts({
        owner: owner.publicKey,
        vault: vault.vaultPda,
        policy: vault.policyPda,
        tracker: vault.trackerPda,
      } as any)
      .rpc();

    // Spend mintB (now index 0) — should work
    const sessionB = deriveSessionPda(
      vault.vaultPda,
      agent.publicKey,
      mintB,
      program.programId,
    );
    await authorizeAndFinalize({
      program,
      agent,
      vaultPda: vault.vaultPda,
      policyPda: vault.policyPda,
      trackerPda: vault.trackerPda,
      sessionPda: sessionB,
      vaultTokenAta: vault.mintBVaultAta,
      mint: mintB,
      amount: new BN(50_000_000_000),
      protocol: jupiterProgramId,
      feeDestinationAta: null,
      protocolTreasuryAta: vault.protocolTreasuryAta,
    });
    console.log("    token_index correctness verified after reorder");
  });

  it("5. spending exactly at cap boundary succeeds", async () => {
    const vault = await createDualTokenVault({
      dailyCap: new BN(100_000_000), // 100 USD
      maxTx: new BN(100_000_000),
    });

    const sessionPda = deriveSessionPda(
      vault.vaultPda,
      agent.publicKey,
      mintA,
      program.programId,
    );
    // Spend exactly 100 USDC = cap
    await authorizeAndFinalize({
      program,
      agent,
      vaultPda: vault.vaultPda,
      policyPda: vault.policyPda,
      trackerPda: vault.trackerPda,
      sessionPda,
      vaultTokenAta: vault.vaultTokenAta,
      mint: mintA,
      amount: new BN(100_000_000),
      protocol: jupiterProgramId,
      feeDestinationAta: null,
      protocolTreasuryAta: vault.protocolTreasuryAta,
    });
    console.log("    Spend exactly at cap boundary succeeded (<=)");
  });

  it("6. max_transaction_size_usd enforced", async () => {
    const vault = await createDualTokenVault({
      dailyCap: new BN(500_000_000),
      maxTx: new BN(50_000_000), // 50 USD max per tx
    });

    const sessionPda = deriveSessionPda(
      vault.vaultPda,
      agent.publicKey,
      mintA,
      program.programId,
    );
    try {
      await authorize({
        program,
        agent,
        vaultPda: vault.vaultPda,
        policyPda: vault.policyPda,
        trackerPda: vault.trackerPda,
        sessionPda,
        vaultTokenAta: vault.vaultTokenAta,
        mint: mintA,
        amount: new BN(51_000_000), // 51 > maxTx=50
        protocol: jupiterProgramId,
      });
      expect.fail("Should have thrown");
    } catch (err: any) {
      expectError(err, "TransactionTooLarge", "maximum");
    }
    console.log("    max_transaction_size_usd enforced");
  });

  it("7. tracker audit log records all transactions", async () => {
    const vault = await createDualTokenVault({
      dailyCap: new BN(500_000_000),
      maxTx: new BN(200_000_000),
    });

    // Execute 3 authorize+finalize cycles
    for (let i = 0; i < 3; i++) {
      const sessionPda = deriveSessionPda(
        vault.vaultPda,
        agent.publicKey,
        mintA,
        program.programId,
      );
      await authorizeAndFinalize({
        program,
        agent,
        vaultPda: vault.vaultPda,
        policyPda: vault.policyPda,
        trackerPda: vault.trackerPda,
        sessionPda,
        vaultTokenAta: vault.vaultTokenAta,
        mint: mintA,
        amount: new BN(10_000_000),
        protocol: jupiterProgramId,
        feeDestinationAta: null,
        protocolTreasuryAta: vault.protocolTreasuryAta,
      });
    }

    const tracker = await program.account.spendTracker.fetch(vault.trackerPda);
    expect(tracker.recentTransactions.length).to.equal(3);
    console.log(`    Audit log has ${tracker.recentTransactions.length} entries`);
  });

  it("8. agent_transfer spends tracked alongside session spends", async () => {
    const vault = await createDualTokenVault({
      dailyCap: new BN(100_000_000), // 100 USD total
      maxTx: new BN(100_000_000),
    });

    // Session spend 50
    const sessionPda = deriveSessionPda(
      vault.vaultPda,
      agent.publicKey,
      mintA,
      program.programId,
    );
    await authorizeAndFinalize({
      program,
      agent,
      vaultPda: vault.vaultPda,
      policyPda: vault.policyPda,
      trackerPda: vault.trackerPda,
      sessionPda,
      vaultTokenAta: vault.vaultTokenAta,
      mint: mintA,
      amount: new BN(50_000_000),
      protocol: jupiterProgramId,
      feeDestinationAta: null,
      protocolTreasuryAta: vault.protocolTreasuryAta,
    });

    // agent_transfer 50
    const { getOrCreateAssociatedTokenAccount } = await import(
      "@solana/spl-token"
    );
    const dest = Keypair.generate();
    const destAta = await getOrCreateAssociatedTokenAccount(
      connection,
      payer,
      mintA,
      dest.publicKey,
    );
    await program.methods
      .agentTransfer(new BN(50_000_000))
      .accounts({
        agent: agent.publicKey,
        vault: vault.vaultPda,
        policy: vault.policyPda,
        tracker: vault.trackerPda,
        vaultTokenAccount: vault.vaultTokenAta,
        destinationTokenAccount: destAta.address,
        feeDestinationTokenAccount: null,
        protocolTreasuryTokenAccount: vault.protocolTreasuryAta,
        tokenProgram: TOKEN_PROGRAM_ID,
      } as any)
      .signers([agent])
      .rpc();

    // Now at 100 USD — 1 more should fail
    const sessionPda2 = deriveSessionPda(
      vault.vaultPda,
      agent.publicKey,
      mintA,
      program.programId,
    );
    try {
      await authorize({
        program,
        agent,
        vaultPda: vault.vaultPda,
        policyPda: vault.policyPda,
        trackerPda: vault.trackerPda,
        sessionPda: sessionPda2,
        vaultTokenAta: vault.vaultTokenAta,
        mint: mintA,
        amount: new BN(1_000_000),
        protocol: jupiterProgramId,
      });
      expect.fail("Should have thrown");
    } catch (err: any) {
      expectError(err, "DailyCapExceeded", "cap");
    }
    console.log(
      "    Session + agent_transfer spends tracked together at cap",
    );
  });
});
