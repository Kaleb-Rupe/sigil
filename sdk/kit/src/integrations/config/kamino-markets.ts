/**
 * Kamino Lending — Static Account Config (mainnet-beta)
 *
 * Main market reserves sourced from @kamino-finance/klend-sdk.
 * These addresses change only on protocol upgrades.
 */

import type { Address } from "@solana/kit";

// ─── Program + Market ────────────────────────────────────────────────────────

export const KAMINO_LEND_PROGRAM = "KLend2g3cP87ber8CzRaqeECGwNvLFM9acPVcRkRHvM" as Address;

/** Main lending market (mainnet) */
export const KAMINO_MAIN_MARKET = "7u3HeHxYDLhnCoErrtycNokbQYbWGzLs6JSDqGAv5PfF" as Address;

/** Lending market authority PDA — derived from [market] + program */
export const KAMINO_MARKET_AUTHORITY = "9TrvXAQB1WeSMaS3G2P3mPt6YMsaJqbGMcjHEaJaf1x1" as Address;

/** Token program */
export const TOKEN_PROGRAM = "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA" as Address;

/** Instructions sysvar */
export const IX_SYSVAR = "Sysvar1nstructions1111111111111111111111111" as Address;

// ─── Reserve Map ─────────────────────────────────────────────────────────────

export interface KaminoReserveConfig {
  reserve: Address;
  liquidityMint: Address;
  liquiditySupply: Address;
  collateralMint: Address;
  collateralSupply: Address;
  feeReceiver: Address;
  decimals: number;
}

export interface KaminoOracleConfig {
  pythOracle?: Address;
  switchboardPriceOracle?: Address;
  switchboardTwapOracle?: Address;
  scopePrices?: Address;
}

/**
 * Reserve configs keyed by token symbol.
 * Note: These are the main market reserves. For USDC and SOL which are
 * the most commonly used in Phalnx vault operations.
 */
export const KAMINO_RESERVES: Record<string, KaminoReserveConfig> = {
  USDC: {
    reserve: "D6q6wuQSrifJKDDkQpJH4jZMJkGDv1NhLKpiAkQvfeWm" as Address,
    liquidityMint: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" as Address,
    liquiditySupply: "Ga4rZytCpFkCrNkTE3CshtUvJSLep61BuoSJhNEPn9i" as Address,
    collateralMint: "7QLUNC7kBDmHyZvRYEGRANbjgaqy1A3shjZNtNLBUBon" as Address,
    collateralSupply: "8DVwJvJRjeDJfVK4t7pVH2fDCMHRkB7DT3K7c4c7ovBa" as Address,
    feeReceiver: "6fZkJHEd3oEaCiqXqL3GfZokHDxRPfLT5BLh3DAKCPGp" as Address,
    decimals: 6,
  },
  SOL: {
    reserve: "d4A2prbA2whesmvHaL88BH6Ewn5N4bTSjnTao2bNFbw" as Address,
    liquidityMint: "So11111111111111111111111111111111111111112" as Address,
    liquiditySupply: "GafSX9BH1tNxFwsQGGHMFyGnjBiAHuGkBq5NYJXMSUHM" as Address,
    collateralMint: "2VD2xPsPNPXgQ9LHR8MKhDqP2bCPKNqLAPiMnr9ZEvTZ" as Address,
    collateralSupply: "EKNR3cPj7K1WEwMMVMFbHH7hahbSM2g9jvQbvSHVNMz" as Address,
    feeReceiver: "61ZxRXAVRhZfvKH8m1mTMsHxjHy12TaBYzDrfXRRk8sk" as Address,
    decimals: 9,
  },
  USDT: {
    reserve: "DNeuk7bXEYEYRn3MNjNFWqB5aVTW48dd55KfnKqBEhpp" as Address,
    liquidityMint: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB" as Address,
    liquiditySupply: "3NeZzU46kBbPkMjNEVS6v37V8gZ7LqF3Y5bdFTGKoZJC" as Address,
    collateralMint: "H7gXVf5Gro2AB1v8r8opEmHCPmHJH2PG7B9JZU7WspGJ" as Address,
    collateralSupply: "HbPCRhYPAiLHCwBiFKwpDDsM9FNzYwpgfS1VZZQA3EEb" as Address,
    feeReceiver: "BGUMAp9Gq7iTEuizy9pqRNqkJ5yS92JkGs7vnE9hhfXr" as Address,
    decimals: 6,
  },
  JitoSOL: {
    reserve: "EVbyPKrHG6WBfm4dLxLMJpUDY43cCAcHSpnAyB5u38Zz" as Address,
    liquidityMint: "J1toso1uCk3RLmjorhTtrVwY9HJ7X8V9yYac6Y7kGCPn" as Address,
    liquiditySupply: "ACHcDbUQEcPH2GpjU7P7CVWLg14rn5YE8XLTL3sXhY4v" as Address,
    collateralMint: "7jJi9qt7DBGfMRxLKjNkhT78jRzmrdSB1TaaEN7ysvV1" as Address,
    collateralSupply: "6RhvUhbHHJ5qJBbtrnQ3xLQn3TGPMiijB7K5SMEWtL6E" as Address,
    feeReceiver: "FcGbxZjMw1nyuCV4r8YcL5aBvkMbwrZqNBPsUxj6PAXG" as Address,
    decimals: 9,
  },
  mSOL: {
    reserve: "HBm5i8Hno8wh4TG3apjLy6BNkb2xMuvo9bbbLsDR7NWR" as Address,
    liquidityMint: "mSoLzYCxHdYgdzU16g5QSh3i5K3z3KZK7ytfqcJm7So" as Address,
    liquiditySupply: "8RB3r3c5a1eJRw1RLXN6sEJ3jQ3fzDePVkJN4iXcSJd8" as Address,
    collateralMint: "G3ick1h2gD1msFn4oSgkH5R5E3XPWML7b2g5UaKJn5MZ" as Address,
    collateralSupply: "CxBLLTTXaFcqDMb3s6praJwf5eoLr5QGH9Kk4B3d3jsu" as Address,
    feeReceiver: "ALdCw2zsqUQ6HjfxqFBdNQJdQt3tr7GXFWXE9TGEcPAg" as Address,
    decimals: 9,
  },
};

/** Oracle configs keyed by token symbol */
export const KAMINO_ORACLES: Record<string, KaminoOracleConfig> = {
  USDC: {
    pythOracle: "Gnt27xtC473ZT2Mw5u8wZ68Z3gULkSTb5DuxJy7eJotD" as Address,
    scopePrices: "3NJYftD5cfHsKMGqMFbLHC7kWaBQWclEkEkGXCfYFRzm" as Address,
  },
  SOL: {
    pythOracle: "7UVimffxr9ow1uXYxsr4LHAcV58mLzhmwaeKvJ1pjLiE" as Address,
    scopePrices: "3NJYftD5cfHsKMGqMFbLHC7kWaBQWclEkEkGXCfYFRzm" as Address,
  },
  USDT: {
    pythOracle: "3vxLXJqLqF3JG5TCbYycbKWRBbCJQLxQmBGCkyqEEefL" as Address,
    scopePrices: "3NJYftD5cfHsKMGqMFbLHC7kWaBQWclEkEkGXCfYFRzm" as Address,
  },
  JitoSOL: {
    pythOracle: "AxaxyeDT8JnWERSaTKvFXvPKkEdxnamKSqpWbsSjYg1g" as Address,
    scopePrices: "3NJYftD5cfHsKMGqMFbLHC7kWaBQWclEkEkGXCfYFRzm" as Address,
  },
  mSOL: {
    pythOracle: "E4v1BBgoso9s64TQvmyownAVJbhbEPGyzA3qn4n46qAo" as Address,
    scopePrices: "3NJYftD5cfHsKMGqMFbLHC7kWaBQWclEkEkGXCfYFRzm" as Address,
  },
};

// ─── Account Resolution ──────────────────────────────────────────────────────

export interface ResolvedKaminoAccounts {
  lendingMarket: Address;
  lendingMarketAuthority: Address;
  reserve: KaminoReserveConfig;
  oracles: KaminoOracleConfig;
}

/**
 * Resolve Kamino accounts for a lending action.
 *
 * @param tokenSymbol - e.g. "USDC", "SOL"
 * @param market - Optional override for lending market address
 */
export function resolveKaminoAccounts(
  tokenSymbol: string,
  market?: Address,
): ResolvedKaminoAccounts {
  const reserve = KAMINO_RESERVES[tokenSymbol];
  if (!reserve) {
    throw new Error(`Unknown Kamino token: ${tokenSymbol}. Available: ${Object.keys(KAMINO_RESERVES).join(", ")}`);
  }

  const oracles = KAMINO_ORACLES[tokenSymbol] ?? {};

  return {
    lendingMarket: market ?? KAMINO_MAIN_MARKET,
    lendingMarketAuthority: KAMINO_MARKET_AUTHORITY,
    reserve,
    oracles,
  };
}
