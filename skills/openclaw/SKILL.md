---
name: agent-shield
description: Financial guardrails for AI agents — three-tier security with spending caps, TEE custody, and on-chain vaults
homepage: https://agentshield.xyz
user-invocable: true
command-dispatch: tool
command-tool: shield_setup_status
metadata:
  openclaw:
    requires:
      bins: ["node"]
    os: ["darwin", "linux"]
---

# AgentShield Skill

You have access to AgentShield tools that enforce financial guardrails on your Solana trading activity. AgentShield uses three compounding security layers — each adds protection on top of the previous.

## Three-Tier Security Model

| Tier | Layer | What It Adds | Cost | Setup Time |
|------|-------|-------------|------|------------|
| 1 | **Shield** | Software spending controls, protocol whitelists, rate limits | Free | Instant |
| 2 | **TEE** | Hardware enclave key protection — key can't be extracted | Free | ~30s |
| 3 | **Vault** | Blockchain-enforced policy — even a compromised agent can't bypass | ~0.003 SOL | ~2min |

**Recommended combinations:**
- Shield only — getting started, testing
- Shield + TEE — production use with real money
- Shield + TEE + Vault — maximum security (recommended for >$5k/day)

## Available Tools

### Setup & Onboarding (always available)
| Tool | Purpose |
|------|---------|
| `shield_setup_status` | Check current setup — which tiers are active, wallet, policy |
| `shield_configure` | Set up AgentShield with any tier (1/2/3) |
| `shield_fund_wallet` | Generate funding links (Blink URL, Solana Pay, raw address) |
| `shield_upgrade_tier` | Upgrade from current tier to a higher one |

### Vault Operations (require configured wallet)
| Tool | Purpose |
|------|---------|
| `shield_check_vault` | Check vault status and current policy |
| `shield_check_spending` | View rolling 24h spend and remaining budget |
| `shield_create_vault` | Create a new vault with policy |
| `shield_update_policy` | Update vault policy (immediate if no timelock) |
| `shield_register_agent` | Register your signing key to a vault |
| `shield_deposit` | Deposit tokens into a vault |
| `shield_withdraw` | Withdraw tokens (owner-only) |
| `shield_revoke_agent` | Emergency kill switch — revoke agent and freeze vault |
| `shield_reactivate_vault` | Reactivate a frozen vault |
| `shield_execute_swap` | Execute a Jupiter swap through the vault |
| `shield_open_position` | Open a leveraged position via Flash Trade |
| `shield_close_position` | Close a leveraged position |
| `shield_provision` | Generate a Blink URL for one-click vault creation |
| `shield_queue_policy_update` | Queue a timelocked policy change |
| `shield_apply_pending_policy` | Execute a queued policy after timelock expires |
| `shield_cancel_pending_policy` | Cancel a pending policy change |
| `shield_check_pending_policy` | View current pending policy state |
| `shield_agent_transfer` | Transfer tokens from vault to an allowed destination |

## Onboarding Flow

When a user mentions trading, security, wallet setup, or protecting their agent:

### Step 1: Check Current Status
Call `shield_setup_status`. If not configured, start the onboarding conversation.

### Step 2: Explain the Tiers
Present the three tiers in plain language:

> "I can set up three layers of protection for your wallet:
>
> **Shield (Tier 1)** — Software spending controls. I'll enforce daily spending caps, protocol whitelists, and rate limits. It's free and instant. Great for getting started.
>
> **TEE (Tier 2)** — Hardware enclave protection. Your agent's private key is stored in a Trusted Execution Environment — no one can extract it, not even the server operator. Also free, takes about 30 seconds.
>
> **Vault (Tier 3)** — On-chain enforcement. Your spending limits are enforced by a Solana smart contract. Even if I'm compromised, I physically cannot exceed the limits. Costs about 0.003 SOL, takes about 2 minutes.
>
> **I recommend combining all three layers** for the best protection. For production use with real money, at minimum use Shield + TEE."

### Step 3: Choose Setup Mode
Offer two modes:

**Quick setup** — You pick conservative defaults:
- "Quick setup will configure $500/day cap, Jupiter only, no leverage. Want me to go ahead?"

**Manual setup** — Ask each question:
1. "What's your daily spending tolerance?" (suggest $500 as safe default)
2. "Which protocols do you want to trade on?" (suggest Jupiter for beginners)
3. "Do you want leveraged trading?" (suggest none for beginners)
4. "Which network — devnet (testing) or mainnet-beta (real money)?"

### Step 4: Configure
Call `shield_configure` with the chosen tier and settings.

### Step 5: Funding
After configuration, call `shield_fund_wallet` to generate funding links.

Say: "Your wallet is set up! Here's how to fund it:" then present the Blink URL, Solana Pay URL, and raw address.

### Step 6: Tier Upgrade (if needed)
If the user later asks for more security, call `shield_upgrade_tier`.

## Important Warnings

### Vault Without TEE
If a user picks Tier 3 (Vault) without Tier 2 (TEE), warn them:
> "Your agent's private key is stored locally without hardware protection. While the on-chain vault limits what I can do, someone with access to this machine could steal the agent key. I recommend adding TEE custody."

### Keypair Backup (Tier 1)
After Tier 1 setup, always remind:
> "Important: Back up your keypair file. If you lose it, you lose access to your wallet."

### TEE Custody Disclosure
After Tier 2 setup, disclose:
> "Your TEE wallet is custodied by AgentShield's platform. You can export or migrate later."

### Production Recommendation
For any amount over $100, recommend at least Tier 2:
> "For real money, I strongly recommend adding TEE custody to protect your agent's private key."

## Core Trading Rules

1. **Always check before trading.** Before any swap or position over $100, call `shield_check_spending` to verify remaining budget.
2. **Use shielded execution.** Use `shield_execute_swap` instead of raw Jupiter instructions. This routes through the vault's policy enforcement.
3. **Report budget on request.** When asked about trading capacity, call `shield_check_spending` and report the remaining daily allowance.
4. **Never bypass limits.** If a trade is denied, explain why (cap exceeded, token not allowed, etc.) and suggest alternatives.
5. **Provision via Blink.** When a user needs a new vault, use `shield_provision` to generate a Blink link — never attempt to create a vault without user wallet approval.

## Policy Updates with Timelock

If the vault has a timelock configured (timelock_duration > 0):
1. Call `shield_queue_policy_update` instead of `shield_update_policy`
2. Tell the user: "Policy change queued. It will take effect in [X hours]."
3. If the user wants to cancel: call `shield_cancel_pending_policy`
4. When the timelock expires: call `shield_apply_pending_policy`
5. Check status anytime: call `shield_check_pending_policy`

Never attempt to bypass the timelock — it exists to protect the user.

## Agent Transfers

Use `shield_agent_transfer` to send tokens from the vault to a destination address. The destination must be in the vault's allowed destinations list (if configured). This is useful for paying bills, funding other wallets, or moving profits out of the vault.

## Error Handling

When a tool returns an error:
- **DailyCapExceeded**: Tell the user their daily limit is reached. Show remaining time until reset.
- **TokenNotAllowed**: Suggest adding the token via policy update, or use an allowed token.
- **ProtocolNotAllowed**: Suggest adding the protocol, or route through an allowed one.
- **TransactionTooLarge**: Suggest splitting into smaller amounts.
- **LeverageTooHigh**: Suggest reducing leverage or updating the policy.
- **VaultNotActive**: The vault is frozen. Suggest using `shield_reactivate_vault`.
- **Not configured**: Guide the user through setup with `shield_configure`.
