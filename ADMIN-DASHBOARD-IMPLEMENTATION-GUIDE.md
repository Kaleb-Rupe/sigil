# Admin Dashboard — Standalone Implementation Guide

**Status:** READY FOR IMPLEMENTATION
**Created:** 2026-03-25
**Parent plan:** ADMIN-DASHBOARD-PLAN.md (design decisions, council review, architecture)
**Lives in:** Private `sigil-infra` repo at `apps/admin/` (NOT in public `agent-middleware` repo — see STORAGE-IMPLEMENTATION-PLAN.md Section 3)
**Target:** Any agent or developer can implement this end-to-end without ambiguity
**Convention:** Follows DASHBOARD-PLAN.md warm palette design system

---

## Audit of ADMIN-DASHBOARD-PLAN.md

Before implementing, these gaps in the original plan were identified and resolved below:

| Gap | Resolution |
|-----|-----------|
| No file tree specified | Complete file tree in Section 1 |
| No component hierarchy | Full component tree in Section 5 |
| "Composable form builder" not specified | Concrete `OperationForm` component with field type registry in Step B.1 |
| SIWS library choice ambiguous | Using `@web3auth/sign-in-with-solana` (Phantom-originated, CAIP-74) |
| JWT library not specified | Using `jose` (Ed25519 JWS, zero-dependency) |
| Postgres client not specified | Using `@neondatabase/serverless` (Vercel-compatible) or `pg` with connection pooling |
| No error boundary strategy | Global error boundary + per-operation error handling in Section 9 |
| No testing strategy | Unit tests for auth, integration tests for operations in Section 11 |
| Helius billing API confirmed unavailable | Manual tracking via admin config + rate limit header tracking |
| No WebSocket strategy for real-time feed | SSE (Server-Sent Events) via Next.js Route Handler — simpler than WebSocket for single user |

---

## 1. Complete File Tree

```
apps/admin/
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
├── postcss.config.js
├── .env.local                          # Local dev secrets
├── .env.example                        # Template for deployment
│
├── public/
│   └── favicon.ico
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout (providers, sidebar, ⌘K)
│   │   ├── page.tsx                    # Dashboard home (redirect to /operations)
│   │   ├── unauthorized/
│   │   │   └── page.tsx                # "Connect authorized wallet" page
│   │   │
│   │   ├── operations/
│   │   │   ├── layout.tsx              # Operations sidebar layout
│   │   │   ├── page.tsx                # Operations home (recent + quick actions)
│   │   │   ├── vaults/
│   │   │   │   └── page.tsx            # Vault operations (create, freeze, reactivate, close)
│   │   │   ├── agents/
│   │   │   │   └── page.tsx            # Agent operations (register, revoke, pause, etc.)
│   │   │   ├── funds/
│   │   │   │   └── page.tsx            # Fund operations (deposit, withdraw)
│   │   │   ├── policy/
│   │   │   │   └── page.tsx            # Policy operations (update, queue, apply, cancel)
│   │   │   ├── constraints/
│   │   │   │   └── page.tsx            # Constraint operations (create, update, close, etc.)
│   │   │   ├── escrow/
│   │   │   │   └── page.tsx            # Escrow operations (create, settle, refund, close)
│   │   │   └── infrastructure/
│   │   │       └── page.tsx            # ALT + Program + IDL operations
│   │   │
│   │   ├── state/
│   │   │   ├── layout.tsx              # State panel layout
│   │   │   ├── page.tsx                # State overview (vault list)
│   │   │   ├── vaults/
│   │   │   │   └── [vault]/
│   │   │   │       └── page.tsx        # Vault detail (drill-down)
│   │   │   ├── activity/
│   │   │   │   └── page.tsx            # Real-time event feed
│   │   │   ├── alt/
│   │   │   │   └── page.tsx            # ALT contents viewer
│   │   │   └── program/
│   │   │       └── page.tsx            # Program info panel
│   │   │
│   │   ├── infra/
│   │   │   ├── layout.tsx              # Infrastructure panel layout
│   │   │   ├── page.tsx                # Infrastructure overview (all metrics)
│   │   │   ├── helius/
│   │   │   │   └── page.tsx            # Helius metrics detail
│   │   │   ├── postgres/
│   │   │   │   └── page.tsx            # Postgres metrics detail
│   │   │   ├── arweave/
│   │   │   │   └── page.tsx            # Arweave status detail
│   │   │   └── pipeline/
│   │   │       └── page.tsx            # Pipeline health detail
│   │   │
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── challenge/
│   │       │   │   └── route.ts        # GET  — generate SIWS challenge
│   │       │   └── verify/
│   │       │       └── route.ts        # POST — verify signature, issue JWT
│   │       │
│   │       ├── admin/
│   │       │   ├── metrics/
│   │       │   │   ├── postgres/
│   │       │   │   │   └── route.ts    # GET — table sizes, row counts, connections
│   │       │   │   ├── arweave/
│   │       │   │   │   └── route.ts    # GET — wallet balance, archive status
│   │       │   │   ├── pipeline/
│   │       │   │   │   └── route.ts    # GET — lag, events/min, cron statuses
│   │       │   │   └── helius/
│   │       │   │       └── route.ts    # GET — manual credit tracking, rate limits
│   │       │   │
│   │       │   ├── events/
│   │       │   │   ├── route.ts        # GET — paginated event list from Postgres
│   │       │   │   └── stream/
│   │       │   │       └── route.ts    # GET — SSE stream for real-time events
│   │       │   │
│   │       │   └── audit/
│   │       │       └── route.ts        # GET — admin audit log
│   │       │
│   │       └── rpc/
│   │           └── simulate/
│   │               └── route.ts        # POST — simulate transaction server-side
│   │
│   ├── components/
│   │   ├── providers/
│   │   │   ├── wallet-provider.tsx      # Solana wallet adapter context
│   │   │   ├── auth-provider.tsx        # SIWS JWT auth context
│   │   │   ├── query-provider.tsx       # TanStack Query provider
│   │   │   └── rpc-provider.tsx         # Solana RPC connection context
│   │   │
│   │   ├── layout/
│   │   │   ├── sidebar.tsx              # Main navigation sidebar
│   │   │   ├── header.tsx               # Top bar (wallet status, network badge)
│   │   │   ├── command-palette.tsx       # ⌘K global search
│   │   │   └── mobile-nav.tsx           # Mobile bottom navigation
│   │   │
│   │   ├── auth/
│   │   │   ├── connect-button.tsx       # Wallet connect + SIWS sign-in
│   │   │   ├── auth-guard.tsx           # Route protection wrapper
│   │   │   └── unauthorized-view.tsx    # "Connect authorized wallet" UI
│   │   │
│   │   ├── operations/
│   │   │   ├── operation-form.tsx       # Generic composable form builder
│   │   │   ├── operation-card.tsx       # Operation selector card
│   │   │   ├── field-registry.tsx       # Field type → React component mapping
│   │   │   ├── simulation-preview.tsx   # Pre-sign transaction preview
│   │   │   ├── tx-confirmation.tsx      # Post-sign success/error toast
│   │   │   ├── destructive-gate.tsx     # Typed confirmation for dangerous ops
│   │   │   └── squads-proposal.tsx      # Squads multisig proposal creator
│   │   │
│   │   ├── state/
│   │   │   ├── vault-table.tsx          # Vault list with health badges
│   │   │   ├── vault-detail.tsx         # Single vault expanded view
│   │   │   ├── agent-feed.tsx           # Real-time event stream
│   │   │   ├── alt-viewer.tsx           # ALT contents + diff
│   │   │   └── program-info.tsx         # Program authority/hash/IDL
│   │   │
│   │   ├── infra/
│   │   │   ├── metric-card.tsx          # Reusable metric display card
│   │   │   ├── sparkline.tsx            # Inline sparkline chart
│   │   │   ├── status-indicator.tsx     # Green/yellow/red dot
│   │   │   ├── progress-bar.tsx         # Credit usage / storage bar
│   │   │   └── alert-banner.tsx         # Low balance / high lag warnings
│   │   │
│   │   └── ui/                          # shadcn/ui components (installed via CLI)
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dialog.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       ├── select.tsx
│   │       ├── toast.tsx
│   │       ├── toaster.tsx
│   │       ├── badge.tsx
│   │       ├── table.tsx
│   │       ├── tabs.tsx
│   │       ├── command.tsx              # cmdk for ⌘K palette
│   │       ├── separator.tsx
│   │       ├── skeleton.tsx
│   │       └── tooltip.tsx
│   │
│   ├── lib/
│   │   ├── auth/
│   │   │   ├── siws.ts                  # SIWS challenge/verify logic
│   │   │   ├── jwt.ts                   # JWT sign/verify with jose
│   │   │   ├── nonce-store.ts           # In-memory nonce replay protection
│   │   │   └── middleware.ts            # JWT validation for API routes
│   │   │
│   │   ├── solana/
│   │   │   ├── connection.ts            # RPC connection factory
│   │   │   ├── tx-sender.ts             # Sign + send + confirm flow
│   │   │   ├── simulate.ts             # Transaction simulation
│   │   │   └── alt-ops.ts              # ALT create/extend/deactivate/close
│   │   │
│   │   ├── db/
│   │   │   └── client.ts               # Postgres connection (server-side only)
│   │   │
│   │   ├── arweave/
│   │   │   └── client.ts               # Arweave balance/status queries
│   │   │
│   │   ├── operations/
│   │   │   ├── registry.ts             # Master operation registry (31 ops)
│   │   │   ├── vault-ops.ts            # Vault operation definitions
│   │   │   ├── agent-ops.ts            # Agent operation definitions
│   │   │   ├── fund-ops.ts             # Fund operation definitions
│   │   │   ├── policy-ops.ts           # Policy operation definitions
│   │   │   ├── constraint-ops.ts       # Constraint operation definitions
│   │   │   ├── escrow-ops.ts           # Escrow operation definitions
│   │   │   └── infra-ops.ts            # Infrastructure operation definitions
│   │   │
│   │   ├── hooks/
│   │   │   ├── use-admin-auth.ts        # SIWS auth state hook
│   │   │   ├── use-vault-state.ts       # TanStack Query for vault state
│   │   │   ├── use-operation.ts         # Execute operation hook (build → sim → sign)
│   │   │   ├── use-metrics.ts           # Infrastructure metrics polling
│   │   │   ├── use-events.ts            # SSE event stream hook
│   │   │   └── use-command-palette.ts   # ⌘K keyboard shortcut
│   │   │
│   │   ├── constants.ts                 # Admin pubkeys, network config
│   │   └── utils.ts                     # Shared utilities
│   │
│   └── styles/
│       └── globals.css                  # Tailwind + CSS custom properties (warm palette)
│
└── tests/
    ├── auth.test.ts                     # SIWS + JWT tests
    ├── operations.test.ts               # Operation registry tests
    └── metrics.test.ts                  # Infrastructure metrics tests
```

---

## 2. Step-by-Step Implementation

### STEP 1: Project Scaffold (apps/admin/)

**File: `apps/admin/package.json`**

```json
{
  "name": "@usesigil/admin",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev -p 3001",
    "build": "next build",
    "start": "next start -p 3001",
    "lint": "next lint",
    "test": "vitest"
  },
  "dependencies": {
    "next": "^14.2.0",
    "react": "^18.3.0",
    "react-dom": "^18.3.0",
    "@usesigil/kit": "workspace:*",
    "@solana/wallet-adapter-base": "^0.9.23",
    "@solana/wallet-adapter-react": "^0.15.35",
    "@solana/wallet-adapter-react-ui": "^0.9.35",
    "@solana/wallet-adapter-wallets": "^0.19.32",
    "@solana/web3.js": "^1.95.0",
    "@solana/kit": "^2.1.0",
    "@web3auth/sign-in-with-solana": "^4.0.0",
    "@sqds/multisig": "^2.1.0",
    "jose": "^5.9.0",
    "pg": "^8.13.0",
    "arweave": "^1.15.0",
    "@tanstack/react-query": "^5.60.0",
    "cmdk": "^1.0.4",
    "recharts": "^2.13.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "tailwind-merge": "^2.5.0",
    "lucide-react": "^0.460.0",
    "bs58": "^6.0.0",
    "tweetnacl": "^1.0.3"
  },
  "devDependencies": {
    "typescript": "^5.6.0",
    "@types/react": "^18.3.0",
    "@types/react-dom": "^18.3.0",
    "@types/pg": "^8.11.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "vitest": "^2.1.0"
  }
}
```

**File: `apps/admin/next.config.ts`**

```typescript
import type { NextConfig } from "next";

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@usesigil/kit"],

  // Security headers — critical for admin dashboard
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval'",  // Next.js requires unsafe-eval in dev
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "connect-src 'self' https://*.helius-rpc.com https://*.solana.com https://arweave.net wss://*.solana.com",
              "font-src 'self'",
              "frame-ancestors 'none'",
            ].join("; "),
          },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
        ],
      },
    ];
  },
};

export default config;
```

**File: `apps/admin/.env.example`**

```env
# ─── Network ──────────────────────────────────────────
NEXT_PUBLIC_NETWORK=devnet
NEXT_PUBLIC_RPC_URL=https://devnet.helius-rpc.com/?api-key=YOUR_KEY
NEXT_PUBLIC_PROGRAM_ID=4ZeVCqnjUgUtFrHHPG7jELUxvJeoVGHhGNgPrhBPwrHL

# ─── Admin Auth ───────────────────────────────────────
# Comma-separated Solana pubkeys allowed to access admin
NEXT_PUBLIC_ADMIN_PUBKEYS=YourWalletPubkeyHere
JWT_SECRET=generate-a-random-256-bit-secret-here

# ─── Server-Side Secrets (never exposed to client) ────
DATABASE_URL=postgresql://user:pass@host:5432/sigil
HELIUS_API_KEY=your-helius-api-key
ARWEAVE_WALLET_ADDRESS=your-arweave-wallet-address
INDEXER_HEALTH_URL=http://localhost:4000/health

# ─── Helius Manual Tracking ───────────────────────────
HELIUS_PLAN_TIER=developer
HELIUS_MONTHLY_CREDITS=10000000
```

**File: `apps/admin/tailwind.config.ts`**

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Sigil warm palette (dark mode dashboard)
        bg: {
          primary: "#1C1A17",
          surface: "#262220",
          elevated: "#332E2A",
          input: "#211F1C",
        },
        border: {
          DEFAULT: "#3D3529",
          focus: "#9E7C4E",
        },
        accent: {
          primary: "#9E7C4E",
          hover: "#B8943F",
          muted: "#7A6340",
        },
        text: {
          primary: "#F5F0E8",
          secondary: "#BFB5A3",
          muted: "#8C7E6A",
        },
        status: {
          secure: "#4A6741",
          warning: "#C4922A",
          danger: "#B84233",
          info: "#5A7E8C",
        },
      },
      fontFamily: {
        display: ["Archivo", "system-ui", "sans-serif"],
        body: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

**File: `apps/admin/src/styles/globals.css`**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@import url("https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700;900&family=Inter:wght@400;500;600&display=swap");

@layer base {
  :root {
    --bg-primary: 28 26 23;
    --bg-surface: 38 34 32;
    --bg-elevated: 51 46 42;
    --bg-input: 33 31 28;
    --border-default: 61 53 41;
    --border-focus: 158 124 78;
    --accent-primary: 158 124 78;
    --status-secure: 74 103 65;
    --status-warning: 196 146 42;
    --status-danger: 184 66 51;
  }

  body {
    @apply bg-bg-primary text-text-primary font-body antialiased;
  }
}
```

---

### STEP 2: Auth Layer (SIWS + JWT)

**File: `apps/admin/src/lib/auth/siws.ts`**

```typescript
import { SolanaSignInInput } from "@web3auth/sign-in-with-solana";
import { randomBytes } from "crypto";

const DOMAIN = process.env.NEXT_PUBLIC_ADMIN_DOMAIN ?? "localhost:3001";
const STATEMENT = "Sign in to Sigil Admin Dashboard";

/** Generate a SIWS challenge for the client to sign. */
export function createChallenge(): { message: SolanaSignInInput; nonce: string } {
  const nonce = randomBytes(16).toString("hex");
  const now = new Date();
  const expiry = new Date(now.getTime() + 30_000); // 30 seconds to sign

  const message: SolanaSignInInput = {
    domain: DOMAIN,
    statement: STATEMENT,
    nonce,
    issuedAt: now.toISOString(),
    expirationTime: expiry.toISOString(),
    version: "1",
    chainId: "mainnet", // Solana doesn't use chainId but SIWS spec requires it
  };

  return { message, nonce };
}

/** Verify a SIWS signature from the wallet adapter signIn() response. */
export async function verifySiwsSignature(params: {
  signature: Uint8Array;
  message: string;
  publicKey: string;
}): Promise<boolean> {
  // Use tweetnacl for Ed25519 verification
  const nacl = await import("tweetnacl");
  const bs58 = await import("bs58");

  const pubkeyBytes = bs58.default.decode(params.publicKey);
  const messageBytes = new TextEncoder().encode(params.message);

  return nacl.default.sign.detached.verify(
    messageBytes,
    params.signature,
    pubkeyBytes,
  );
}
```

**File: `apps/admin/src/lib/auth/jwt.ts`**

```typescript
import { SignJWT, jwtVerify, type JWTPayload } from "jose";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret-change-in-production",
);
const ISSUER = "sigil-admin";
const JWT_TTL_SECONDS = 900; // 15 minutes

export interface AdminJwtPayload extends JWTPayload {
  sub: string;   // Solana pubkey
  iss: string;   // "sigil-admin"
}

/** Issue a JWT for an authenticated admin. */
export async function issueJwt(publicKey: string): Promise<string> {
  return new SignJWT({ sub: publicKey })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuer(ISSUER)
    .setIssuedAt()
    .setExpirationTime(`${JWT_TTL_SECONDS}s`)
    .sign(JWT_SECRET);
}

/** Verify and decode an admin JWT. Returns null if invalid. */
export async function verifyJwt(token: string): Promise<AdminJwtPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: ISSUER,
    });
    // Double-check pubkey is still in allowlist
    const adminPubkeys = (process.env.NEXT_PUBLIC_ADMIN_PUBKEYS ?? "").split(",");
    if (!adminPubkeys.includes(payload.sub as string)) return null;
    return payload as AdminJwtPayload;
  } catch {
    return null;
  }
}
```

**File: `apps/admin/src/lib/auth/nonce-store.ts`**

```typescript
/**
 * In-memory nonce store for replay protection.
 * For production with multiple instances, replace with Redis.
 * For a single-user admin dashboard, in-memory is sufficient.
 */
const usedNonces = new Map<string, number>(); // nonce → expiry timestamp
const NONCE_TTL_MS = 300_000; // 5 minutes

/** Record a nonce as used. Returns false if already used (replay attempt). */
export function consumeNonce(nonce: string): boolean {
  // Garbage collect expired nonces
  const now = Date.now();
  for (const [n, expiry] of usedNonces) {
    if (expiry < now) usedNonces.delete(n);
  }

  if (usedNonces.has(nonce)) return false;
  usedNonces.set(nonce, now + NONCE_TTL_MS);
  return true;
}
```

**File: `apps/admin/src/lib/auth/middleware.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifyJwt } from "./jwt";

/** Verify JWT from Authorization header. Returns pubkey or 401 response. */
export async function requireAdmin(
  req: NextRequest,
): Promise<{ pubkey: string } | NextResponse> {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return NextResponse.json({ error: "Missing authorization" }, { status: 401 });
  }

  // Verify custom header for CSRF protection
  if (!req.headers.get("x-sigil-admin")) {
    return NextResponse.json({ error: "Missing X-Sigil-Admin header" }, { status: 403 });
  }

  const token = authHeader.slice(7);
  const payload = await verifyJwt(token);
  if (!payload) {
    return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
  }

  return { pubkey: payload.sub as string };
}
```

**File: `apps/admin/src/app/api/auth/challenge/route.ts`**

```typescript
import { NextResponse } from "next/server";
import { createChallenge } from "@/lib/auth/siws";

export async function GET() {
  const { message, nonce } = createChallenge();
  return NextResponse.json({ message, nonce });
}
```

**File: `apps/admin/src/app/api/auth/verify/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { verifySiwsSignature } from "@/lib/auth/siws";
import { issueJwt } from "@/lib/auth/jwt";
import { consumeNonce } from "@/lib/auth/nonce-store";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { signature, message, publicKey, nonce } = body;

  // 1. Check pubkey is in admin allowlist
  const adminPubkeys = (process.env.NEXT_PUBLIC_ADMIN_PUBKEYS ?? "").split(",");
  if (!adminPubkeys.includes(publicKey)) {
    return NextResponse.json({ error: "Not an admin" }, { status: 403 });
  }

  // 2. Consume nonce (replay protection)
  if (!consumeNonce(nonce)) {
    return NextResponse.json({ error: "Nonce already used" }, { status: 403 });
  }

  // 3. Verify signature
  const signatureBytes = typeof signature === "string"
    ? Buffer.from(signature, "base64")
    : new Uint8Array(signature);

  const valid = await verifySiwsSignature({
    signature: signatureBytes,
    message,
    publicKey,
  });

  if (!valid) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  // 4. Issue JWT
  const token = await issueJwt(publicKey);
  const expiresAt = Date.now() + 900_000; // 15 min

  return NextResponse.json({ token, expiresAt });
}
```

---

### STEP 3: Providers + Layout Shell

**File: `apps/admin/src/components/providers/wallet-provider.tsx`**

```tsx
"use client";

import { useMemo } from "react";
import {
  ConnectionProvider,
  WalletProvider as SolanaWalletProvider,
} from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter, BackpackWalletAdapter } from "@solana/wallet-adapter-wallets";

import "@solana/wallet-adapter-react-ui/styles.css";

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const endpoint = process.env.NEXT_PUBLIC_RPC_URL ?? "https://api.devnet.solana.com";
  const wallets = useMemo(
    () => [new PhantomWalletAdapter(), new BackpackWalletAdapter()],
    [],
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
}
```

**File: `apps/admin/src/components/providers/auth-provider.tsx`**

```tsx
"use client";

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { useWallet } from "@solana/wallet-adapter-react";

interface AuthState {
  jwt: string | null;
  expiresAt: number | null;
  isAdmin: boolean;
  signIn: () => Promise<void>;
  signOut: () => void;
}

const AuthContext = createContext<AuthState>({
  jwt: null,
  expiresAt: null,
  isAdmin: false,
  signIn: async () => {},
  signOut: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const { publicKey, signMessage, connected } = useWallet();
  const [jwt, setJwt] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<number | null>(null);

  const adminPubkeys = (process.env.NEXT_PUBLIC_ADMIN_PUBKEYS ?? "").split(",");
  const isAdmin = connected && publicKey
    ? adminPubkeys.includes(publicKey.toBase58())
    : false;

  const signIn = useCallback(async () => {
    if (!publicKey || !signMessage) return;

    // 1. Get challenge
    const challengeRes = await fetch("/api/auth/challenge");
    const { message, nonce } = await challengeRes.json();

    // 2. Construct SIWS message string
    const messageStr = [
      `${message.domain} wants you to sign in with your Solana account:`,
      publicKey.toBase58(),
      "",
      message.statement,
      "",
      `Nonce: ${message.nonce}`,
      `Issued At: ${message.issuedAt}`,
      `Expiration Time: ${message.expirationTime}`,
    ].join("\n");

    // 3. Sign with wallet
    const encodedMessage = new TextEncoder().encode(messageStr);
    const signature = await signMessage(encodedMessage);

    // 4. Verify on server
    const verifyRes = await fetch("/api/auth/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        signature: Buffer.from(signature).toString("base64"),
        message: messageStr,
        publicKey: publicKey.toBase58(),
        nonce,
      }),
    });

    if (verifyRes.ok) {
      const { token, expiresAt: exp } = await verifyRes.json();
      setJwt(token);
      setExpiresAt(exp);
    }
  }, [publicKey, signMessage]);

  const signOut = useCallback(() => {
    setJwt(null);
    setExpiresAt(null);
  }, []);

  // Auto-refresh JWT before expiry
  useEffect(() => {
    if (!expiresAt) return;
    const refreshAt = expiresAt - 60_000; // Refresh 1 min before expiry
    const timeout = setTimeout(() => {
      signIn(); // Re-sign SIWS challenge
    }, Math.max(0, refreshAt - Date.now()));
    return () => clearTimeout(timeout);
  }, [expiresAt, signIn]);

  // Sign out on wallet disconnect
  useEffect(() => {
    if (!connected) signOut();
  }, [connected, signOut]);

  return (
    <AuthContext.Provider value={{ jwt, expiresAt, isAdmin, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AuthContext);
```

**File: `apps/admin/src/components/auth/auth-guard.tsx`**

```tsx
"use client";

import { useWallet } from "@solana/wallet-adapter-react";
import { useAdminAuth } from "@/components/providers/auth-provider";
import { UnauthorizedView } from "./unauthorized-view";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { connected } = useWallet();
  const { isAdmin } = useAdminAuth();

  if (!connected || !isAdmin) {
    return <UnauthorizedView />;
  }

  return <>{children}</>;
}
```

**File: `apps/admin/src/app/layout.tsx`**

```tsx
import type { Metadata } from "next";
import { WalletProvider } from "@/components/providers/wallet-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { QueryProvider } from "@/components/providers/query-provider";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { CommandPalette } from "@/components/layout/command-palette";
import { Toaster } from "@/components/ui/toaster";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "Sigil Admin",
  description: "Protocol Cockpit",
  robots: "noindex, nofollow", // Never index admin dashboard
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <QueryProvider>
          <WalletProvider>
            <AuthProvider>
              <AuthGuard>
                <div className="flex h-screen bg-bg-primary">
                  <Sidebar />
                  <div className="flex-1 flex flex-col overflow-hidden">
                    <Header />
                    <main className="flex-1 overflow-y-auto p-6">
                      {children}
                    </main>
                  </div>
                </div>
                <CommandPalette />
              </AuthGuard>
              <Toaster />
            </AuthProvider>
          </WalletProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
```

---

### STEP 4: Operation Registry + Composable Form Builder

This is the core architectural pattern — a single registry that maps every operation to its form fields, instruction builder, severity, and category.

**File: `apps/admin/src/lib/operations/registry.ts`**

```typescript
import type { Address, Instruction, TransactionSigner } from "@solana/kit";
import type { Connection } from "@solana/web3.js";

// ─── Field Types ──────────────────────────────────────────────────────

export type FieldType =
  | "address"        // Solana pubkey input with validation
  | "amount"         // Token amount with decimals (BN)
  | "number"         // Plain number (u8, u16, u64)
  | "boolean"        // Toggle/checkbox
  | "select"         // Dropdown from options
  | "permissions"    // 21-bit permission bitmask builder
  | "protocols"      // Protocol address list builder
  | "text"           // Free text input
  | "bytes"          // Hex/base64 bytes input
  | "vault-select"   // Vault picker (fetches user's vaults)
  | "agent-select"   // Agent picker (from selected vault)
  | "mint-select"    // Token mint picker (USDC/USDT)
  | "address-list";  // Multiple addresses (for ALT extend)

export interface OperationField {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  defaultValue?: unknown;
  placeholder?: string;
  helpText?: string;
  options?: { label: string; value: string }[];  // For 'select' type
  validation?: (value: unknown) => string | null; // Returns error message or null
}

// ─── Operation Severity ──────────────────────────────────────────────

export type OperationSeverity = "low" | "normal" | "high" | "critical";

// ─── Operation Definition ────────────────────────────────────────────

export interface OperationDefinition {
  id: string;
  label: string;
  description: string;
  category: "vaults" | "agents" | "funds" | "policy" | "constraints" | "escrow" | "infrastructure";
  severity: OperationSeverity;
  fields: OperationField[];

  /** Build the instruction(s) from form values. */
  buildInstruction: (params: {
    values: Record<string, unknown>;
    owner: TransactionSigner;
    network: "devnet" | "mainnet";
  }) => Promise<Instruction[]>;

  /** Human-readable summary for simulation preview. */
  summarize: (values: Record<string, unknown>) => string;

  /** Whether this operation requires Squads multisig on mainnet. */
  requiresMultisig?: boolean;

  /** Whether to require fresh wallet signature even with valid JWT. */
  requiresReAuth?: boolean;

  /** Icon name from lucide-react. */
  icon: string;

  /** Typed confirmation text for critical ops (user must type this). */
  confirmationText?: string;
}

// ─── Registry ────────────────────────────────────────────────────────

const operations: Map<string, OperationDefinition> = new Map();

export function registerOperation(op: OperationDefinition) {
  operations.set(op.id, op);
}

export function getOperation(id: string): OperationDefinition | undefined {
  return operations.get(id);
}

export function getAllOperations(): OperationDefinition[] {
  return Array.from(operations.values());
}

export function getOperationsByCategory(category: string): OperationDefinition[] {
  return getAllOperations().filter((op) => op.category === category);
}

export function searchOperations(query: string): OperationDefinition[] {
  const q = query.toLowerCase();
  return getAllOperations().filter(
    (op) =>
      op.label.toLowerCase().includes(q) ||
      op.description.toLowerCase().includes(q) ||
      op.category.toLowerCase().includes(q),
  );
}
```

**File: `apps/admin/src/lib/operations/vault-ops.ts`** (example — one category)

```typescript
import {
  getInitializeVaultInstruction,
  getFreezeVaultInstruction,
  getReactivateVaultInstruction,
  getCloseVaultInstruction,
} from "@usesigil/kit";
import { getVaultPDA, getPolicyPDA, getTrackerPDA, getAgentOverlayPDA } from "@usesigil/kit";
import type { Address, TransactionSigner } from "@solana/kit";
import { registerOperation, type OperationField } from "./registry";

// ─── Vault Fields ──────────────────────────────────────────────────

const VAULT_ID_FIELD: OperationField = {
  name: "vaultId",
  label: "Vault ID",
  type: "number",
  required: true,
  placeholder: "1",
  helpText: "Unique vault identifier (u64). First vault is usually 1.",
};

const VAULT_SELECT_FIELD: OperationField = {
  name: "vault",
  label: "Vault",
  type: "vault-select",
  required: true,
  helpText: "Select an existing vault.",
};

// ─── Initialize Vault ──────────────────────────────────────────────

registerOperation({
  id: "initialize-vault",
  label: "Create Vault",
  description: "Initialize a new Sigil vault with default policy.",
  category: "vaults",
  severity: "low",
  icon: "Plus",
  fields: [
    VAULT_ID_FIELD,
    {
      name: "agent",
      label: "Initial Agent",
      type: "address",
      required: true,
      placeholder: "Agent public key",
      helpText: "The first agent to register on this vault.",
    },
    {
      name: "permissions",
      label: "Agent Permissions",
      type: "permissions",
      required: true,
      defaultValue: (1n << 21n) - 1n, // FULL_PERMISSIONS
      helpText: "21-bit permission bitmask for the initial agent.",
    },
    {
      name: "dailyCapUsd",
      label: "Daily Spending Cap (USD)",
      type: "amount",
      required: true,
      defaultValue: "500000000", // $500
      placeholder: "500000000",
      helpText: "Rolling 24h spending cap in USD base units (6 decimals). $500 = 500000000.",
    },
    {
      name: "maxTxSizeUsd",
      label: "Max Transaction Size (USD)",
      type: "amount",
      required: true,
      defaultValue: "100000000", // $100
      placeholder: "100000000",
    },
    {
      name: "maxSlippageBps",
      label: "Max Slippage (BPS)",
      type: "number",
      required: true,
      defaultValue: 300,
      placeholder: "300",
      helpText: "Maximum slippage in basis points. 300 = 3%.",
    },
    {
      name: "agentSpendingLimit",
      label: "Agent Spending Limit (USD)",
      type: "amount",
      required: true,
      defaultValue: "500000000",
    },
    {
      name: "developerFeeRate",
      label: "Developer Fee Rate",
      type: "number",
      required: true,
      defaultValue: 0,
      helpText: "Fee rate in BPS. Max 500 (0.05%). 0 = no developer fee.",
    },
    {
      name: "feeDestination",
      label: "Fee Destination",
      type: "address",
      required: true,
      helpText: "Address to receive developer fees. IMMUTABLE after creation.",
    },
    {
      name: "tokenMint",
      label: "Token Mint",
      type: "mint-select",
      required: true,
      helpText: "USDC or USDT mint for this vault.",
    },
  ],

  buildInstruction: async ({ values, owner, network }) => {
    const vaultId = BigInt(values.vaultId as number);
    const [vault] = await getVaultPDA({ owner: owner.address, vaultId });
    const [policy] = await getPolicyPDA({ vault });
    const [tracker] = await getTrackerPDA({ vault });
    const [overlay] = await getAgentOverlayPDA({ vault });

    // Build the initializeVault instruction using Codama-generated builder
    const ix = getInitializeVaultInstruction({
      owner,
      vault: vault as Address,
      policyConfig: policy as Address,
      spendTracker: tracker as Address,
      agentSpendOverlay: overlay as Address,
      tokenMint: values.tokenMint as Address,
      feeDestination: values.feeDestination as Address,
      agent: values.agent as Address,
      vaultId,
      permissions: BigInt(values.permissions as string),
      dailySpendingCapUsd: BigInt(values.dailyCapUsd as string),
      maxTransactionSizeUsd: BigInt(values.maxTxSizeUsd as string),
      maxSlippageBps: Number(values.maxSlippageBps),
      protocolMode: 0,          // ALLOWLIST default
      allowedProtocols: [],     // Empty — set via update_policy
      developerFeeRate: Number(values.developerFeeRate),
      agentSpendingLimitUsd: BigInt(values.agentSpendingLimit as string),
    });

    return [ix];
  },

  summarize: (values) =>
    `Create vault #${values.vaultId} with agent ${(values.agent as string).slice(0, 8)}... and $${Number(BigInt(values.dailyCapUsd as string)) / 1_000_000} daily cap`,
});

// ─── Freeze Vault ──────────────────────────────────────────────────

registerOperation({
  id: "freeze-vault",
  label: "Freeze Vault",
  description: "Freeze a vault — blocks all agent operations until reactivated.",
  category: "vaults",
  severity: "normal",
  icon: "Snowflake",
  fields: [VAULT_SELECT_FIELD],

  buildInstruction: async ({ values, owner }) => {
    const vault = values.vault as Address;
    return [getFreezeVaultInstruction({ owner, vault })];
  },

  summarize: (values) => `Freeze vault ${(values.vault as string).slice(0, 8)}...`,
});

// ─── Reactivate Vault ──────────────────────────────────────────────

registerOperation({
  id: "reactivate-vault",
  label: "Reactivate Vault",
  description: "Unfreeze a vault — re-enables agent operations.",
  category: "vaults",
  severity: "normal",
  icon: "Play",
  fields: [VAULT_SELECT_FIELD],

  buildInstruction: async ({ values, owner }) => {
    const vault = values.vault as Address;
    return [getReactivateVaultInstruction({ owner, vault })];
  },

  summarize: (values) => `Reactivate vault ${(values.vault as string).slice(0, 8)}...`,
});

// ─── Close Vault ───────────────────────────────────────────────────

registerOperation({
  id: "close-vault",
  label: "Close Vault",
  description: "Permanently close a vault and reclaim rent. IRREVERSIBLE.",
  category: "vaults",
  severity: "critical",
  icon: "Trash2",
  confirmationText: "CLOSE",
  requiresReAuth: true,
  fields: [VAULT_SELECT_FIELD],

  buildInstruction: async ({ values, owner }) => {
    const vault = values.vault as Address;
    return [getCloseVaultInstruction({ owner, vault })];
  },

  summarize: (values) => `CLOSE vault ${(values.vault as string).slice(0, 8)}... — THIS IS IRREVERSIBLE`,
});
```

---

### STEP 5: Composable Form Component

**File: `apps/admin/src/components/operations/operation-form.tsx`**

```tsx
"use client";

import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useConnection } from "@solana/wallet-adapter-react";
import { buildOwnerTransaction } from "@usesigil/kit";
import type { OperationDefinition } from "@/lib/operations/registry";
import { SimulationPreview } from "./simulation-preview";
import { DestructiveGate } from "./destructive-gate";
import { TxConfirmation } from "./tx-confirmation";
import { FieldRenderer } from "./field-registry";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface Props {
  operation: OperationDefinition;
}

type FormState = "filling" | "simulating" | "confirming" | "signing" | "success" | "error";

export function OperationForm({ operation }: Props) {
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();
  const network = (process.env.NEXT_PUBLIC_NETWORK ?? "devnet") as "devnet" | "mainnet";

  const [values, setValues] = useState<Record<string, unknown>>(() => {
    // Initialize with default values from field definitions
    const defaults: Record<string, unknown> = {};
    for (const field of operation.fields) {
      if (field.defaultValue !== undefined) defaults[field.name] = field.defaultValue;
    }
    return defaults;
  });

  const [state, setState] = useState<FormState>("filling");
  const [simulationResult, setSimulationResult] = useState<unknown>(null);
  const [txSignature, setTxSignature] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSimulate = async () => {
    if (!publicKey) return;
    setState("simulating");
    setError(null);

    try {
      // Build instruction(s)
      const instructions = await operation.buildInstruction({
        values,
        owner: { address: publicKey.toBase58() as any, signTransaction: [] as any } as any,
        network,
      });

      // Build transaction via existing SDK function
      const { transaction, txSizeBytes } = await buildOwnerTransaction({
        rpc: connection as any,
        owner: { address: publicKey.toBase58() as any } as any,
        instructions,
        network,
      });

      // Simulate
      const simResult = await connection.simulateTransaction(transaction as any);

      setSimulationResult({
        summary: operation.summarize(values),
        txSize: txSizeBytes,
        logs: simResult.value.logs,
        unitsConsumed: simResult.value.unitsConsumed,
        error: simResult.value.err,
      });

      setState(simResult.value.err ? "error" : "confirming");
      if (simResult.value.err) {
        setError(`Simulation failed: ${JSON.stringify(simResult.value.err)}`);
      }
    } catch (e) {
      setState("error");
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const handleSign = async () => {
    // If critical, DestructiveGate handles gating before this is called
    setState("signing");
    try {
      // Re-build and sign for real
      const instructions = await operation.buildInstruction({
        values,
        owner: { address: publicKey!.toBase58() as any } as any,
        network,
      });

      const { transaction } = await buildOwnerTransaction({
        rpc: connection as any,
        owner: { address: publicKey!.toBase58() as any } as any,
        instructions,
        network,
      });

      // Sign with wallet adapter
      const signed = await signTransaction!(transaction as any);
      const sig = await connection.sendRawTransaction(signed.serialize());
      await connection.confirmTransaction(sig, "confirmed");

      setTxSignature(sig);
      setState("success");
    } catch (e) {
      setState("error");
      setError(e instanceof Error ? e.message : String(e));
    }
  };

  const handleReset = () => {
    setState("filling");
    setSimulationResult(null);
    setTxSignature(null);
    setError(null);
  };

  return (
    <Card className="bg-bg-surface border-border">
      <CardHeader>
        <CardTitle className="text-text-primary font-display">{operation.label}</CardTitle>
        <CardDescription className="text-text-muted">{operation.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Form Fields */}
        {state === "filling" && (
          <>
            {operation.fields.map((field) => (
              <FieldRenderer
                key={field.name}
                field={field}
                value={values[field.name]}
                onChange={(val) => setValues((prev) => ({ ...prev, [field.name]: val }))}
              />
            ))}
            <Button
              onClick={handleSimulate}
              className="w-full bg-accent-primary hover:bg-accent-hover text-bg-primary font-display"
            >
              Simulate Transaction
            </Button>
          </>
        )}

        {/* Simulation Preview */}
        {state === "simulating" && <div className="text-text-muted">Simulating...</div>}

        {state === "confirming" && simulationResult && (
          <>
            <SimulationPreview result={simulationResult} />
            {operation.severity === "critical" || operation.severity === "high" ? (
              <DestructiveGate
                severity={operation.severity}
                confirmationText={operation.confirmationText}
                onConfirm={handleSign}
                onCancel={handleReset}
              />
            ) : (
              <div className="flex gap-3">
                <Button variant="outline" onClick={handleReset} className="flex-1">Cancel</Button>
                <Button onClick={handleSign} className="flex-1 bg-accent-primary hover:bg-accent-hover text-bg-primary">
                  Sign & Submit
                </Button>
              </div>
            )}
          </>
        )}

        {/* Success */}
        {state === "success" && txSignature && (
          <TxConfirmation signature={txSignature} network={network} onDone={handleReset} />
        )}

        {/* Error */}
        {state === "error" && error && (
          <div className="p-4 bg-status-danger/10 border border-status-danger/30 rounded-lg">
            <p className="text-status-danger text-sm font-mono">{error}</p>
            <Button variant="outline" onClick={handleReset} className="mt-3">
              Try Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

---

### STEP 6: Server-Side Metrics API

**File: `apps/admin/src/lib/db/client.ts`**

```typescript
import { Pool } from "pg";

// Server-side only — never import this in client components
let pool: Pool | null = null;

export function getDb(): Pool {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 5,
      ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : undefined,
    });
  }
  return pool;
}
```

**File: `apps/admin/src/app/api/admin/metrics/postgres/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/middleware";
import { getDb } from "@/lib/db/client";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const db = getDb();

  const [tableSizes, totalSize, connections] = await Promise.all([
    db.query(`
      SELECT
        relname AS table_name,
        n_live_tup AS row_count,
        pg_total_relation_size(quote_ident(relname)) AS size_bytes
      FROM pg_stat_user_tables
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(quote_ident(relname)) DESC
    `),
    db.query(`SELECT pg_database_size(current_database()) AS size_bytes`),
    db.query(`SELECT count(*) AS active FROM pg_stat_activity WHERE state = 'active'`),
  ]);

  return NextResponse.json({
    tables: tableSizes.rows.map((r) => ({
      name: r.table_name,
      rowCount: Number(r.row_count),
      sizeBytes: Number(r.size_bytes),
      sizeMb: (Number(r.size_bytes) / 1_048_576).toFixed(2),
    })),
    totalSizeBytes: Number(totalSize.rows[0].size_bytes),
    totalSizeMb: (Number(totalSize.rows[0].size_bytes) / 1_048_576).toFixed(2),
    activeConnections: Number(connections.rows[0].active),
    poolMax: 5,
  });
}
```

**File: `apps/admin/src/app/api/admin/metrics/arweave/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/middleware";
import { getDb } from "@/lib/db/client";

const ARWEAVE_GATEWAY = "https://arweave.net";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const walletAddress = process.env.ARWEAVE_WALLET_ADDRESS;
  if (!walletAddress) {
    return NextResponse.json({ error: "ARWEAVE_WALLET_ADDRESS not configured" }, { status: 500 });
  }

  const db = getDb();

  // Fetch in parallel: AR balance + archive stats
  const [balanceRes, archiveStats] = await Promise.all([
    fetch(`${ARWEAVE_GATEWAY}/wallet/${walletAddress}/balance`).then((r) => r.text()),
    db.query(`
      SELECT
        count(*) AS total_archives,
        COALESCE(sum(event_count), 0) AS total_events,
        COALESCE(sum(byte_size), 0) AS total_bytes,
        max(archive_date) AS last_archive_date
      FROM event_archives
    `),
  ]);

  const winstonBalance = BigInt(balanceRes);
  const arBalance = Number(winstonBalance) / 1_000_000_000_000; // Winston → AR

  const stats = archiveStats.rows[0];

  return NextResponse.json({
    walletAddress,
    balanceWinston: winstonBalance.toString(),
    balanceAr: arBalance.toFixed(6),
    balanceUsd: (arBalance * 1.70).toFixed(2), // Approximate AR price
    isLowBalance: arBalance < 0.1,
    archives: {
      totalArchives: Number(stats.total_archives),
      totalEvents: Number(stats.total_events),
      totalBytes: Number(stats.total_bytes),
      totalMb: (Number(stats.total_bytes) / 1_048_576).toFixed(2),
      lastArchiveDate: stats.last_archive_date,
    },
  });
}
```

**File: `apps/admin/src/app/api/admin/metrics/pipeline/route.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/middleware";
import { getDb } from "@/lib/db/client";

export async function GET(req: NextRequest) {
  const auth = await requireAdmin(req);
  if (auth instanceof NextResponse) return auth;

  const db = getDb();

  const [latestEvent, eventsPerMin, chainSlot] = await Promise.all([
    db.query(`SELECT MAX(slot) AS max_slot, MAX(block_time) AS last_time FROM events`),
    db.query(`
      SELECT count(*) AS count
      FROM events
      WHERE block_time > NOW() - INTERVAL '5 minutes'
    `),
    // Get current chain slot from Helius RPC
    fetch(process.env.NEXT_PUBLIC_RPC_URL!, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getSlot" }),
    }).then((r) => r.json()),
  ]);

  const maxSlot = Number(latestEvent.rows[0]?.max_slot ?? 0);
  const chainTipSlot = chainSlot.result ?? 0;
  const lagSlots = chainTipSlot - maxSlot;
  const lagSeconds = lagSlots * 0.4; // ~400ms per slot

  // Fetch indexer health if available
  let indexerHealth = null;
  try {
    const healthUrl = process.env.INDEXER_HEALTH_URL;
    if (healthUrl) {
      const res = await fetch(healthUrl, { signal: AbortSignal.timeout(3000) });
      indexerHealth = await res.json();
    }
  } catch {
    indexerHealth = { status: "unreachable" };
  }

  return NextResponse.json({
    status: lagSlots < 100 ? "healthy" : lagSlots < 500 ? "degraded" : "critical",
    lagSlots,
    lagSeconds: Math.round(lagSeconds),
    lastProcessedSlot: maxSlot,
    chainTipSlot: chainTipSlot,
    lastEventTime: latestEvent.rows[0]?.last_time,
    eventsLast5Min: Number(eventsPerMin.rows[0]?.count ?? 0),
    eventsPerMinute: Math.round(Number(eventsPerMin.rows[0]?.count ?? 0) / 5),
    indexerHealth,
  });
}
```

---

### STEP 7: Remaining Operation Categories

Each category follows the same pattern as vault-ops.ts. Here are the files to create:

**File: `apps/admin/src/lib/operations/agent-ops.ts`**

Register 5 operations: `register-agent`, `revoke-agent`, `pause-agent`, `unpause-agent`, `update-permissions`.

- `register-agent`: fields = [vault-select, agent address, permissions bitmask, spending limit]
- `revoke-agent`: fields = [vault-select, agent-select], severity = high
- `pause-agent`: fields = [vault-select, agent-select], severity = normal
- `unpause-agent`: fields = [vault-select, agent-select], severity = normal
- `update-permissions`: fields = [vault-select, agent-select, new permissions, new spending limit], severity = normal

Each uses the corresponding `get{InstructionName}Instruction()` from `@usesigil/kit`.

**File: `apps/admin/src/lib/operations/fund-ops.ts`**

Register 2 operations: `deposit-funds`, `withdraw-funds`.

- `deposit-funds`: fields = [vault-select, token mint, amount], severity = low
- `withdraw-funds`: fields = [vault-select, token mint, amount], severity = normal

**File: `apps/admin/src/lib/operations/policy-ops.ts`**

Register 4 operations: `update-policy`, `queue-policy-change`, `apply-policy-change`, `cancel-policy-change`.

**File: `apps/admin/src/lib/operations/constraint-ops.ts`**

Register 6 operations: `create-constraints`, `update-constraints`, `close-constraints`, `queue-constraints-update`, `apply-constraints-update`, `cancel-constraints-update`.

**File: `apps/admin/src/lib/operations/escrow-ops.ts`**

Register 4 operations: `create-escrow`, `settle-escrow`, `refund-escrow`, `close-settled-escrow`.

**File: `apps/admin/src/lib/operations/infra-ops.ts`**

Register 6 operations: `create-alt`, `extend-alt`, `deactivate-alt`, `close-alt`, `upgrade-program`, `deploy-idl`.

ALT operations use `@solana/web3.js` `AddressLookupTableProgram`. Program upgrade uses `@sqds/multisig` on mainnet or direct BPF loader on devnet.

---

### STEP 8: State Panel Components

**File: `apps/admin/src/app/state/page.tsx`**

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useConnection } from "@solana/wallet-adapter-react";
import { useWallet } from "@solana/wallet-adapter-react";
import { resolveVaultStateForOwner } from "@usesigil/kit";
import { VaultTable } from "@/components/state/vault-table";

export default function StatePage() {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const network = process.env.NEXT_PUBLIC_NETWORK as "devnet" | "mainnet-beta";

  const { data: vaultStates, isLoading } = useQuery({
    queryKey: ["vaultStates", publicKey?.toBase58()],
    queryFn: () =>
      resolveVaultStateForOwner(connection as any, publicKey!.toBase58() as any, network as any),
    enabled: !!publicKey,
    refetchInterval: 30_000, // 30s poll
  });

  if (isLoading) return <div className="text-text-muted">Loading vaults...</div>;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-text-primary">Protocol State</h1>
      <VaultTable vaults={vaultStates?.vaults ?? []} />
    </div>
  );
}
```

---

### STEP 9: Infrastructure Panel

**File: `apps/admin/src/app/infra/page.tsx`**

```tsx
"use client";

import { useQuery } from "@tanstack/react-query";
import { useAdminAuth } from "@/components/providers/auth-provider";
import { MetricCard } from "@/components/infra/metric-card";
import { StatusIndicator } from "@/components/infra/status-indicator";
import { ProgressBar } from "@/components/infra/progress-bar";
import { AlertBanner } from "@/components/infra/alert-banner";

function useMetrics(endpoint: string) {
  const { jwt } = useAdminAuth();
  return useQuery({
    queryKey: ["metrics", endpoint],
    queryFn: async () => {
      const res = await fetch(`/api/admin/metrics/${endpoint}`, {
        headers: {
          Authorization: `Bearer ${jwt}`,
          "X-Sigil-Admin": "1",
        },
      });
      if (!res.ok) throw new Error("Failed to fetch metrics");
      return res.json();
    },
    enabled: !!jwt,
    refetchInterval: 15_000, // 15s poll
  });
}

export default function InfraPage() {
  const { data: postgres } = useMetrics("postgres");
  const { data: arweave } = useMetrics("arweave");
  const { data: pipeline } = useMetrics("pipeline");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-bold text-text-primary">Infrastructure</h1>

      {/* Alerts */}
      {arweave?.isLowBalance && (
        <AlertBanner severity="danger" message={`Low Arweave balance: ${arweave.balanceAr} AR — fund wallet to continue archival`} />
      )}
      {pipeline?.status === "critical" && (
        <AlertBanner severity="danger" message={`Pipeline critical: ${pipeline.lagSlots} slots behind (${pipeline.lagSeconds}s)`} />
      )}

      {/* Pipeline Health */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard label="Pipeline Status" value={<StatusIndicator status={pipeline?.status ?? "unknown"} />} />
        <MetricCard label="Lag" value={`${pipeline?.lagSlots ?? "—"} slots`} subvalue={`${pipeline?.lagSeconds ?? "—"}s`} />
        <MetricCard label="Events/min" value={pipeline?.eventsPerMinute ?? "—"} />
        <MetricCard label="Last Event" value={pipeline?.lastEventTime ? new Date(pipeline.lastEventTime).toLocaleTimeString() : "—"} />
      </div>

      {/* Postgres */}
      <div className="space-y-3">
        <h2 className="text-lg font-display font-semibold text-text-primary">PostgreSQL</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MetricCard label="Total Size" value={`${postgres?.totalSizeMb ?? "—"} MB`} />
          <MetricCard label="Active Connections" value={`${postgres?.activeConnections ?? "—"} / ${postgres?.poolMax ?? "—"}`} />
          <MetricCard label="Tables" value={postgres?.tables?.length ?? "—"} />
        </div>
        {postgres?.tables && (
          <div className="bg-bg-surface rounded-lg border border-border p-4">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-muted border-b border-border">
                  <th className="text-left py-2">Table</th>
                  <th className="text-right py-2">Rows</th>
                  <th className="text-right py-2">Size</th>
                </tr>
              </thead>
              <tbody>
                {postgres.tables.map((t: any) => (
                  <tr key={t.name} className="border-b border-border/50">
                    <td className="py-2 font-mono text-text-secondary">{t.name}</td>
                    <td className="py-2 text-right text-text-primary">{t.rowCount.toLocaleString()}</td>
                    <td className="py-2 text-right text-text-primary">{t.sizeMb} MB</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Arweave */}
      <div className="space-y-3">
        <h2 className="text-lg font-display font-semibold text-text-primary">Arweave Archival</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard label="Wallet" value={arweave?.walletAddress ? `${arweave.walletAddress.slice(0, 8)}...` : "—"} />
          <MetricCard label="Balance" value={`${arweave?.balanceAr ?? "—"} AR`} subvalue={`~$${arweave?.balanceUsd ?? "—"}`} />
          <MetricCard label="Total Archives" value={arweave?.archives?.totalArchives ?? "—"} />
          <MetricCard label="Archived Events" value={arweave?.archives?.totalEvents?.toLocaleString() ?? "—"} />
        </div>
      </div>
    </div>
  );
}
```

---

### STEP 10: Command Palette

**File: `apps/admin/src/components/layout/command-palette.tsx`**

```tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CommandDialog, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { getAllOperations, type OperationDefinition } from "@/lib/operations/registry";

// Import all operation registrations
import "@/lib/operations/vault-ops";
import "@/lib/operations/agent-ops";
import "@/lib/operations/fund-ops";
import "@/lib/operations/policy-ops";
import "@/lib/operations/constraint-ops";
import "@/lib/operations/escrow-ops";
import "@/lib/operations/infra-ops";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  // ⌘K / Ctrl+K to open
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const operations = getAllOperations();

  // Group by category
  const grouped = operations.reduce<Record<string, OperationDefinition[]>>((acc, op) => {
    (acc[op.category] ??= []).push(op);
    return acc;
  }, {});

  const handleSelect = (op: OperationDefinition) => {
    setOpen(false);
    router.push(`/operations/${op.category}?op=${op.id}`);
  };

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Search operations... (⌘K)" />
      <CommandList>
        <CommandEmpty>No operations found.</CommandEmpty>
        {Object.entries(grouped).map(([category, ops]) => (
          <CommandGroup key={category} heading={category.charAt(0).toUpperCase() + category.slice(1)}>
            {ops.map((op) => (
              <CommandItem key={op.id} onSelect={() => handleSelect(op)}>
                <span className="mr-2">{op.label}</span>
                <span className="text-text-muted text-xs">{op.description}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        ))}

        {/* Navigation shortcuts */}
        <CommandGroup heading="Navigate">
          <CommandItem onSelect={() => { setOpen(false); router.push("/state"); }}>
            Protocol State
          </CommandItem>
          <CommandItem onSelect={() => { setOpen(false); router.push("/infra"); }}>
            Infrastructure
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
```

---

### STEP 11: Sidebar Navigation

**File: `apps/admin/src/components/layout/sidebar.tsx`**

```tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  Shield, Users, Wallet, FileText, Lock, Handshake, Settings,
  Activity, LayoutDashboard, Monitor, Keyboard,
} from "lucide-react";

const navGroups = [
  {
    label: "Operations",
    items: [
      { href: "/operations/vaults", label: "Vaults", icon: Shield },
      { href: "/operations/agents", label: "Agents", icon: Users },
      { href: "/operations/funds", label: "Funds", icon: Wallet },
      { href: "/operations/policy", label: "Policy", icon: FileText },
      { href: "/operations/constraints", label: "Constraints", icon: Lock },
      { href: "/operations/escrow", label: "Escrow", icon: Handshake },
      { href: "/operations/infrastructure", label: "Infrastructure", icon: Settings },
    ],
  },
  {
    label: "State",
    items: [
      { href: "/state", label: "Vaults Overview", icon: LayoutDashboard },
      { href: "/state/activity", label: "Activity Feed", icon: Activity },
      { href: "/state/alt", label: "ALT Viewer", icon: Monitor },
      { href: "/state/program", label: "Program Info", icon: Monitor },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      { href: "/infra", label: "Overview", icon: Monitor },
      { href: "/infra/postgres", label: "Postgres", icon: Monitor },
      { href: "/infra/arweave", label: "Arweave", icon: Monitor },
      { href: "/infra/pipeline", label: "Pipeline", icon: Activity },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-bg-surface border-r border-border flex flex-col h-full">
      {/* Logo */}
      <div className="p-4 border-b border-border">
        <h1 className="font-display font-bold text-lg text-text-primary">Sigil Admin</h1>
        <p className="text-xs text-text-muted">Protocol Cockpit</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label}>
            <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2 px-2">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors",
                      pathname === item.href
                        ? "bg-bg-elevated text-accent-primary"
                        : "text-text-secondary hover:bg-bg-elevated hover:text-text-primary",
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer: ⌘K hint */}
      <div className="p-3 border-t border-border">
        <button
          onClick={() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
          className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm text-text-muted hover:bg-bg-elevated"
        >
          <Keyboard className="w-4 h-4" />
          <span>Command Palette</span>
          <kbd className="ml-auto text-xs bg-bg-primary px-1.5 py-0.5 rounded">⌘K</kbd>
        </button>
      </div>
    </aside>
  );
}
```

---

## 3. Implementation Order (Copy-Paste Checklist)

This is the exact order an agent should implement, with WIP commits after each step:

```
[ ] Step 1:  apps/admin/ scaffold (package.json, next.config.ts, tailwind, .env, globals.css)
             → WIP commit: "feat(admin): scaffold Next.js admin dashboard"

[ ] Step 2:  Auth layer (siws.ts, jwt.ts, nonce-store.ts, middleware.ts, API routes)
             → WIP commit: "feat(admin): SIWS authentication + JWT issuance"

[ ] Step 3:  Providers (wallet-provider, auth-provider, query-provider, rpc-provider)
             → WIP commit: "feat(admin): wallet + auth + query providers"

[ ] Step 4:  Layout shell (layout.tsx, sidebar, header, auth-guard, unauthorized-view)
             → WIP commit: "feat(admin): layout shell with sidebar + auth guard"

[ ] Step 5:  Operation registry + vault-ops.ts (4 operations)
             → WIP commit: "feat(admin): operation registry + vault operations"

[ ] Step 6:  Composable form builder (operation-form, field-registry, simulation-preview)
             → WIP commit: "feat(admin): composable form builder with simulation preview"

[ ] Step 7:  Destructive gate + tx confirmation components
             → WIP commit: "feat(admin): destructive operation safeguards"

[ ] Step 8:  Agent operations (5 ops) + fund operations (2 ops)
             → WIP commit: "feat(admin): agent + fund operations"

[ ] Step 9:  Policy (4 ops) + constraint (6 ops) + escrow (4 ops)
             → WIP commit: "feat(admin): policy + constraint + escrow operations"

[ ] Step 10: Infrastructure operations (ALT 4 + program 2)
             → WIP commit: "feat(admin): ALT management + program upgrade operations"

[ ] Step 11: Command palette (⌘K)
             → WIP commit: "feat(admin): command palette with operation search"

[ ] Step 12: State panel — vault overview + vault detail
             → WIP commit: "feat(admin): protocol state panel — vault overview"

[ ] Step 13: State panel — activity feed (SSE) + ALT viewer + program info
             → WIP commit: "feat(admin): activity feed + ALT viewer + program info"

[ ] Step 14: Server-side metrics API (postgres, arweave, pipeline routes)
             → WIP commit: "feat(admin): server-side infrastructure metrics API"

[ ] Step 15: Infrastructure panel UI (overview + detail pages)
             → WIP commit: "feat(admin): infrastructure monitoring panel"

[ ] Step 16: Mobile responsive + keyboard shortcuts + audit log
             → WIP commit: "feat(admin): mobile responsive + keyboard shortcuts"

[ ] Step 17: Tests (auth, operations, metrics)
             → WIP commit: "test(admin): auth + operations + metrics tests"
```

---

## 4. Anti-Patterns (DO NOT)

| DO NOT | DO INSTEAD |
|--------|-----------|
| Build 31 separate page components for operations | Use `OperationForm` + `OperationDefinition` registry pattern |
| Store JWT in localStorage | Store in React state (memory) — re-sign SIWS on refresh |
| Put Postgres credentials in `NEXT_PUBLIC_*` | Server-side only via Route Handlers |
| Import `@solana/web3.js` Connection for wallet adapter AND `@solana/kit` Rpc | Use `@solana/wallet-adapter-react` for signing, `@usesigil/kit` for everything else |
| Build custom wallet connect UI | Use `@solana/wallet-adapter-react-ui` `WalletMultiButton` |
| Rebuild event parsing/decoding | Import from `@usesigil/kit` — already built |
| Rebuild vault state resolution | Import from `@usesigil/kit` — already built |
| Add TOTP/email as additional auth factor | Private key IS the factor (Council consensus) |
| Share deployment with public dashboard | Separate Vercel project (Council consensus) |
| Hardcode admin pubkeys | Use `NEXT_PUBLIC_ADMIN_PUBKEYS` env var |

---

## 5. Testing Strategy

| Test File | What It Tests |
|-----------|--------------|
| `tests/auth.test.ts` | SIWS challenge generation, signature verification, JWT issuance/validation, nonce replay rejection, expired nonce rejection, non-admin pubkey rejection |
| `tests/operations.test.ts` | Registry search, operation field validation, instruction building (mock), severity classification |
| `tests/metrics.test.ts` | Postgres query parsing, Arweave balance parsing, pipeline lag calculation |

---

## 6. Deployment

```bash
# 1. Create Vercel project (separate from public dashboard)
vercel link --project sigil-admin

# 2. Set environment variables
vercel env add NEXT_PUBLIC_NETWORK production
vercel env add NEXT_PUBLIC_RPC_URL production
vercel env add NEXT_PUBLIC_PROGRAM_ID production
vercel env add NEXT_PUBLIC_ADMIN_PUBKEYS production
vercel env add JWT_SECRET production         # generate: openssl rand -hex 32
vercel env add DATABASE_URL production
vercel env add HELIUS_API_KEY production
vercel env add ARWEAVE_WALLET_ADDRESS production

# 3. Deploy
vercel --prod

# 4. Configure domain
vercel domains add admin.sigil.xyz
```
