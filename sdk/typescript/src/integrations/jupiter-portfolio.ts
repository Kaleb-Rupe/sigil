// ---------------------------------------------------------------------------
// Jupiter Portfolio API v1 (Beta)
// ---------------------------------------------------------------------------
// Read-only portfolio positions across Jupiter-supported platforms.
//
// API: GET /portfolio/v1/positions/{address}
//
// Notes (per Jupiter skill):
//   - Beta API — normalize into stable internal schema
//   - Treat empty positions as valid state
//   - Element types: multiple, liquidity, trade, leverage, borrowlend
// ---------------------------------------------------------------------------

import { jupiterFetch } from "./jupiter-api";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface JupiterPortfolioPosition {
  platform: string;
  platformName: string;
  elementType: "multiple" | "liquidity" | "trade" | "leverage" | "borrowlend";
  value: number;
  tokens: {
    mint: string;
    symbol: string;
    amount: number;
    value: number;
  }[];
}

export interface JupiterPortfolioSummary {
  wallet: string;
  totalValue: number;
  positions: JupiterPortfolioPosition[];
}

// ---------------------------------------------------------------------------
// API Functions
// ---------------------------------------------------------------------------

/**
 * Get portfolio positions for a wallet across Jupiter-supported platforms.
 */
export async function getJupiterPortfolio(
  wallet: string,
): Promise<JupiterPortfolioSummary> {
  const raw = await jupiterFetch<{
    totalValue?: number;
    elements?: JupiterPortfolioPosition[];
  }>(`/portfolio/v1/positions/${wallet}`);

  return {
    wallet,
    totalValue: raw.totalValue ?? 0,
    positions: raw.elements ?? [],
  };
}
