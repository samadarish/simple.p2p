# simple.p2p: recommended stack

The base is Proposal 2's small setup: one language, Postgres and SSE. Custody follows Proposals 1 and 3 and fixes every gap the critics found. No server key can move user USDT.

---

## 1. Recommended stack

| Layer | Choice | Why |
|---|---|---|
| Chain and asset | **TON only, USDT jetton** (master `EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs`) | Telegram's rules require TON for Mini Apps. One chain means one contract, one audit and one indexer. |
| Escrow | **One immutable Tolk contract per deal**, built with Blueprint and tested in @ton/sandbox. No factory. External TON audit. | The rule "pay only the buyer or the seller" is enforced in code. A bug affects one deal, not a shared pool. |
| Arbiter | **Official TON multisig v2, 2-of-3.** Each key is on a Ledger held by a different person. | No arbiter key sits on any server. Lost or departing signers can be rotated without changing the arbiter address. |
| Wallets | @tonconnect/ui-react 2.x with server-checked `ton_proof`. Recommend Wallet in Telegram or Tonkeeper. | Users sign every money move themselves. `ton_proof` proves the wallet is theirs. |
| Frontend | **React 19 + Vite 7 + TS SPA**, TanStack Query/Router, Tailwind 4, @telegram-apps/sdk-react, Motion for tile movement | One build runs as both the website and the Mini App. The SPA is served from the single canonical origin. |
| Backend | **Node 24 LTS + Fastify 5 + Zod + Drizzle**, one pnpm monorepo, **2 Render services**: `web` (public) and `worker` (private) | The setup stays small, and the internet-facing process holds no bot token and no chain keys. |
| Database / jobs / pub-sub | **Render Postgres 17** (paid plan with PITR), **pg-boss** for jobs and outbox, **LISTEN/NOTIFY** for fan-out | One system to back up. Row locks and versioning stop double-takes. |
| Realtime | **SSE**: a public board stream plus a private user stream, with Last-Event-ID replay | Simpler than WebSockets, and it works in Telegram webviews and behind Cloudflare. |
| Bot | **grammY 1.x** in the worker, using **long polling** (with the auto-retry and throttler plugins) | The bot token never touches a public process, and there is no webhook to forge. |
| Auth | Mini App: **initData verified with the Ed25519 `signature`**. Web: **Telegram OIDC + PKCE**. Admins: **passkey** (@simplewebauthn) | The API holds no secret that can forge logins. Both login paths resolve to the same Telegram `id`. |
| KYC | **Sumsub** if it supports the new country's ID documents. Otherwise a manual video check that stores no ID images. | Trading needs a verified legal name so the bank-name match works. |
| Files | Cloudflare R2 private bucket, 5-min presigned URLs, re-encoded with `sharp` | Dispute evidence stays private, with no EXIF data or polyglot files. |
| Chain data | **TON Center v3 (paid key) as primary, TonAPI as second source** | Two sources must agree before LOCKED. Other states use failover. |
| Edge / ops | Cloudflare (DNS, WAF, DDoS, Turnstile on web login), Sentry, Better Stack uptime, private ops Telegram group | No servers to patch, and alerts arrive where the owner already is. |
| Secrets / supply chain | Render env groups split per service, pnpm lockfile, Renovate, branch protection, hardware-key 2FA on GitHub, Render, Cloudflare, the domain registrar and the BotFather account | A swapped frontend or a hijacked provider account is the realistic way funds get drained. |

**Cut from v1:** Redis/Valkey, Centrifugo, Socket.IO, Doppler, AWS KMS, Cloudflare Access, a factory contract, inline mode, bot reply-relay chat, and TRON in any form.

---

## 2. Escrow and money flow

**Custody: non-custodial.** The platform holds no hot or cold wallet for user USDT. Each deal has its own `DealEscrow` contract.

**Set in contract code** (covered by the pinned code hash, so the backend cannot change them):
- the official USDT master address
- the arbiter (the multisig address)
- the fee recipient (a cold Ledger address)
- `MAX_FEE_BPS = 100` (1%)

**Init data per deal:** `deal_id`, seller, buyer, amount, `fee_bps` (must be ≤ the cap, otherwise the deploy fails), `lock_deadline`, `pay_window`, `release_window`.

**Allowed code hashes** are pinned in the frontend bundle and in the backend config. A new contract version means a new hash. Old deals keep the old code.

**Flow**
1. **Take.** The buyer takes an offer. This is rate-limited by tier, and abandoned takes count against reputation. The DB pins both bound wallets, and the deal is TAKEN.
2. **Lock.** The seller's wallet signs one TON Connect request with two messages:
   - (a) deploy the escrow (StateInit, about 0.15 TON attached)
   - (b) a USDT jetton transfer to the escrow

   No platform deployer key is needed, so griefing the platform's gas is impossible. Before signing, the seller's client recomputes the address from StateInit and checks the code hash, the arbiter, the fee cap and the buyer's wallet.

   For the auditor: test message ordering in sandbox, including a notification reaching an escrow that is not yet deployed. If the ordering is unsafe, fall back to two signatures from the seller's wallet.
3. **Funding.** The escrow accepts `transfer_notification` only when all of these hold:
   - the sender is its own USDT jetton wallet, computed from the master in code and never supplied by the backend
   - the amount is exact
   - the original sender is the seller

   Anything else is bounced or refunded. On success the state is FUNDED, and the escrow forwards a **0.05 TON gas grant to the buyer** out of the TON the seller attached. A buyer who starts with no TON can still sign `mark_paid` or `cancel`, and the platform needs no gas-drip hot wallet.
4. **Before the buyer pays.** The buyer's client independently recomputes the escrow from StateInit and checks that the buyer address equals its own bound wallet. Only then does the backend reveal the seller's bank details.
5. **Payment.** The buyer pays by bank, then signs **on-chain `mark_paid`**. This blocks the timeout refund.
6. **Release.** The seller's UI has two ticks: "I see X in MY bank app" and "Release". Release is disabled for 60 s after PAID. The seller then signs `release`. The buyer receives the amount minus the fee, and the fee goes to the address in code.

**Other exits** (all on-chain, so they work even if the platform is gone)
- `cancel`: the buyer can cancel at any time, which refunds the seller.
- `timeout_refund`: anyone can trigger it after `pay_window` if `mark_paid` was not sent. The worker runs a keeper for this, but any user can call it too.
- `resolve(bit)`: callable only by the arbiter multisig. The bit chooses buyer or seller. It carries no address field.
- **Bounced payouts:** the contract sets its state before sending and reserves gas. A bounced or failed USDT payout (for example, a recipient frozen by Tether) returns the deal to `PAYOUT_FAILED`. The arbiter can then pay the other party, so the deal never shows "closed" while the USDT is stuck.

**How the arbiter is constrained**
- **On-chain:**
  - `resolve` can only pick one of the two fixed parties.
  - There is no upgrade, pause, setCode, owner or withdraw function.
  - Payout targets are only buyer, seller and the fee address in code.
- **Multisig v2, 2-of-3, three different people:** the owner, admin A and admin B, each with their own Ledger. Signers can be changed through a multisig order, so the arbiter address stays the same.
- **Off-chain rules:**
  - The assigned admin is never a party to the deal.
  - Every ruling is shown to both parties, and every admin action goes to the audit log.
  - Above 100 USDT, a ruling waits 2 hours for objections before signing.
  - Admins are rated by users.

**Key inventory**

| Key | Where it lives | Can it move USDT? |
|---|---|---|
| Arbiter signers (3) | Ledgers held by 3 different people | Only to buyer or seller, and only with 2 of 3 signing |
| Fee recipient | Cold Ledger | Receives fees only |
| Bot token | `worker` env only | No |
| OIDC client secret | `web` env | No |
| Field-encryption key (bank details) | `web` env | No |
| Indexer API keys | `worker` env | No |

**Launch caps:**
- 200 USDT per deal
- 10,000 USDT total locked (TVL), checked by the backend before a take
- 0% fee during the beta

---

## 3. Telegram integration

**One bot.** grammY runs in the private worker with long polling and least-privilege rights. The BotFather account has 2-Step Verification on. Staging and production use separate bots, and staging runs on TON testnet.

- **Mini App**
  - Registered in BotFather with a menu button and deep links: `t.me/<bot>/app?startapp=offer_<id>|deal_<id>|profile_<id>`.
  - The client sends raw `initData` to `POST /auth/tma`. The API checks the **Ed25519 `signature`** against Telegram's public key and the `bot_id`, and requires `auth_date` within 5 minutes.
  - The check is exchanged **once** for an opaque, revocable session. It is a Bearer token kept in memory, because cookies are unreliable in Telegram Web's iframe.
  - `initDataUnsafe` is never trusted.
  - Native UI is used where available: BottomButton for the one main action, BackButton, haptics and theme sync. Every feature is detected before use, so the same components work in a normal browser.
- **Web login (linking)**
  - Telegram OIDC: `oauth.telegram.org`, Authorization Code + PKCE (S256), `state` and `nonce`.
  - Scopes: `openid profile phone telegram:bot_access`.
  - The `id_token` is checked against the JWKS, with `iss = https://oauth.telegram.org` and `aud = bot id`.
  - **Accounts are matched on the `id` claim, not `sub`.**
  - The session is an httpOnly, SameSite=Lax cookie on the first-party domain.
  - Because both paths resolve to the same Telegram `id`, there is no separate linking step. `telegram:bot_access` means the bot can DM users who only use the web. **No bot deep-link "Confirm login" flow**, because it can be phished.
- **Notifications**
  - Every deal transition writes an outbox row in the same database transaction. The worker sends the bot DM with throttling and retries.
  - Each DM has inline buttons that open the Mini App at that deal.
  - The bot does only non-money actions itself: view a deal, open a dispute, mute.
  - Anything that needs a wallet signature (lock, mark paid, release, cancel) always opens the Mini App.
  - Each user gets a self-service "Freeze my account" command, and new-login and wallet-change alerts.
- **Channel (read-only)**
  - The bot is an admin with **Post messages** rights only.
  - A pg-boss job posts:
    - new-offer digests, at most one every 60 s and up to 10 offers each
    - "completed" cards showing the amount band and stars, with no names or bank details unless the user opts in
    - admin announcements
  - Each post has a `startapp` URL button. A `channel_posts` table stores the `message_id` so a post can be edited to "Taken" once the offer is taken.
- **Group**
  - A forum supergroup linked as the channel's discussion group. Topics: General, Market talk, Help, Scam reports, Announcements (locked).
  - The bot is an admin with delete and ban rights only.
  - Moderation:
    - Joining needs a join request plus a captcha through the bot (Bot API 10.1 adds `chat_join_request_query_id` to Mini App initData).
    - The bot auto-deletes wallet addresses, IBAN or card numbers, and "DM me" or "trade outside" messages.
    - New members cannot post links for 24 hours.
    - Slow mode is on in General.
  - Commands: `/verify @user` (is this real staff?) and `/profile @user` (stars, trades, volume).
  - Pinned rule: "Staff never DM first. Never trade outside the app. Never release before the money is in YOUR bank app."
  - **Deal chat stays in the app only.** No relay chat and no inline mode.
- **Private ops group:** the bot posts dispute pings, stuck deals, indexer lag, reconciliation mismatches and failed jobs.
- **Compliance:** the bot, channel and group never link to sites that use non-TON crypto. Telegram's rules forbid it.

---

## 4. Live board realtime

- **Source of truth:** every transition is one Postgres transaction that:
  - runs `UPDATE deals … WHERE id=$1 AND state=$expected AND version=$v`
  - inserts a `deal_events` row (bigserial id)
  - inserts an outbox row

  Then it runs `NOTIFY deal_events, '<event_id>'`.
- **Fan-out:** each `web` instance LISTENs, reads the event row and pushes it to connected SSE clients. Because the worker writes chain states and `web` serves clients, NOTIFY is needed from day one.
- **Streams:**
  - `GET /board/stream`: public and anonymized. Each tile delta is `{deal_id, column, side, amount, price, fiat, method, maker stars and trades, version}`.
  - `GET /me/stream`: the user's own deals, chat messages and alerts. `EventSource` cannot send headers, so the client first calls `POST /stream-ticket` to get a 60-second single-use ticket and connects with `?ticket=`.
- **Client:**
  1. Load the snapshot with `GET /board?filters` (server-side indexed query plus `pg_trgm` for username search). The response includes the last event id.
  2. Open the stream with Last-Event-ID replay from `deal_events`. If there is a gap, refetch the snapshot.
  3. Patch the TanStack Query cache only when the incoming `version` is higher than the local one.
  4. Filter live deltas on the client against the active filters.
  5. Animate tiles between columns with a FLIP/Motion transition.
  6. Refetch on `visibilitychange`, since Telegram can minimise the webview.
- **Transport details:** heartbeat comment every 20 s, `X-Accel-Buffering: no`, no compression on the stream routes.
- **Chat:** `POST /deals/:id/messages` is validated, stored and rate-limited, then delivered on `/me/stream`.
- **Board columns (fixes the "fake Locked" flaw):**

  | Column | States |
  |---|---|
  | 1 Open | OPEN offers, plus TAKEN shown as "waiting for lock" |
  | 2 Locked | LOCKED only, which means the deposit is confirmed on-chain |
  | 3 Paid | PAID, plus DISPUTED with a red badge |
  | 4 Done | DONE and RESOLVED_*. These fade after N minutes. Refunded or expired deals fade after 1 minute. |

---

## 5. Core data model and deal state machine

**Tables** (Drizzle, `numeric(20,6)` for USDT, `numeric(20,2)` for fiat, `timestamptz` for times)

- **Accounts**
  - `users(id, telegram_id UNIQUE, username, display_name, kyc_tier 0|1|2, legal_name_enc, role user|admin|owner, status active|frozen|banned)`
  - `sessions(id, user_id, token_hash, kind tma|web, device, ip_hash, expires_at)`
  - `passkeys(user_id, credential_id, public_key)`: admins only
  - `wallets(id, user_id, ton_address UNIQUE, proof_verified_at, cooldown_until)`: one active wallet per user
  - `payment_methods(id, user_id, method_type, bank_name, holder_name, account_enc, name_matches_kyc bool)`
  - `kyc_checks(user_id, provider, provider_ref, level, status, reviewed_by)`: no ID images stored
- **Offers and deals**
  - `offers(id, maker_id, side sell|buy, usdt_amount fixed (no partial fills in v1), fiat_currency, price, method_types[], terms, status active|paused|taken|closed)`
  - `deals(id, offer_id, seller_id, buyer_id, admin_id, seller_wallet, buyer_wallet, usdt_amount, fiat_amount, price, fee_bps, escrow_address UNIQUE, code_hash, state, version, lock_by, pay_by, release_by, created_at, updated_at)`
  - `deal_events(id bigserial, deal_id, from_state, to_state, actor user|chain|system|admin, tx_hash, payload, created_at)`: append-only, used for SSE replay and the audit trail
  - `chain_txs(tx_hash, lt, escrow_address, op, amount, source_primary bool, source_secondary bool, confirmed_at, UNIQUE(tx_hash, lt))`
- **Chat, disputes and reputation**
  - `messages(id, deal_id, sender_id, body, attachment_key, created_at)`
  - `disputes(id, deal_id, opened_by, reason, evidence_keys[], admin_id, verdict buyer|seller, verdict_reason, multisig_order_addr, published_at, executed_at)`
  - `reviews(id, deal_id, from_id, to_id, role_of_target buyer|seller|admin, stars 1-5, text, UNIQUE(deal_id, from_id, to_id))`: allowed only in terminal states
  - `user_stats(user_id, trades, volume_usdt, avg_stars, rating_count, completion_rate, avg_release_secs, dispute_rate)`: refreshed by a job
- **Ops and logs**
  - `bank_reveals(deal_id, viewer_id, at)`: logs every reveal of bank details
  - `channel_posts(id, kind, ref_ids[], message_id)`
  - `audit_log(id, actor_id, action, target, ip, before, after, created_at)`: UPDATE and DELETE revoked
  - `limits(tier, per_deal, per_day, open_deals)`
  - the pg-boss schema

**DB roles:** `web_role` cannot set chain states. `worker_role` alone may set LOCKED, DONE, REFUNDED, RESOLVED_* and PAYOUT_FAILED. A small trigger rejects transitions that are not in the table below.

**Deal state machine**

| From | To | Trigger / actor |
|---|---|---|
| (offer active) | TAKEN | Taker clicks. Row lock plus version check. Offer becomes `taken`. 15-minute `lock_by` starts. |
| TAKEN | LOCKED | **Chain:** escrow FUNDED and the real USDT balance of the escrow's jetton wallet (derived from the master) is confirmed by **both** indexers. Starts `pay_by` (60 min). Bank details revealed to the buyer only. |
| TAKEN | EXPIRED | `lock_by` passed with nothing on-chain. Offer reopens. Counts against the taker or seller who abandoned it. |
| TAKEN | CANCELLED | Either party, before any deposit. |
| LOCKED | PAID | **Chain:** buyer `mark_paid`. Starts `release_by` (e.g. 2 h). |
| LOCKED | REFUNDED | **Chain:** buyer `cancel`, or `timeout_refund` after `pay_window`. |
| PAID | DONE | **Chain:** seller `release`. |
| PAID | DISPUTED | Either party opens a dispute, or `release_by` passes. Off-chain flag. The admin joins the chat. |
| PAID / DISPUTED | REFUNDED | **Chain:** buyer `cancel`. |
| DISPUTED | DONE | **Chain:** seller releases anyway. |
| DISPUTED | RESOLVED_BUYER / RESOLVED_SELLER | **Chain:** multisig `resolve(bit)`. |
| any payout | PAYOUT_FAILED | **Chain:** bounced payout. Arbiter then resolves to the other party. |

**Terminal states:** DONE, REFUNDED, RESOLVED_*, EXPIRED, CANCELLED. On-chain state always wins over DB state, and a nightly job reconciles chain balances against the DB.

---

## 6. Security must-haves (ranked)

1. **Contract invariants:**
   - payouts only to the buyer, the seller or the fee address in code
   - `resolve` takes a 1-bit verdict
   - no upgrade, pause, owner or withdraw
   - arbiter, fee recipient, fee cap and USDT master are all in the code
   - jetton notifications accepted only from the escrow's own wallet, derived from the master
   - state set before sending, gas reserved, and bounced payouts handled
2. **Audit gate:**
   - a sandbox matrix of every op × sender × state, plus fuzzing of amounts and bounces
   - an external TON-specialist audit (critic estimate: $15–40k and 4–6 weeks; unverified)
   - testnet beta, then an invite-only mainnet beta with 200 USDT per deal and a 10k TVL cap
3. **Arbiter = multisig v2, 2-of-3, three different people on Ledgers.** Never a server key, never one admin's own wallet.
4. **On-chain `mark_paid` and timeouts anyone can trigger,** plus the 0.05 TON gas grant to the buyer from the escrow. Backend timers can never refund a buyer who has paid.
5. **Both clients recompute StateInit:**
   - The seller checks the code hash, arbiter and fee cap before locking.
   - The buyer checks their own wallet before bank details are revealed.
6. **Frontend and supply-chain integrity:**
   - deploys only from protected `main` with review
   - pinned lockfile and Renovate
   - strict CSP: `frame-ancestors` limited to Telegram origins, no third-party scripts beyond telegram-web-app.js and TON Connect
   - hardware-key 2FA on GitHub, Render, Cloudflare and the registrar
7. **Money states come only from the chain:**
   - set only by `worker_role`
   - idempotent on `(tx_hash, lt)`
   - LOCKED needs both indexers to agree on the real USDT balance
   - "Locked" on the board means confirmed on-chain, nothing else
8. **Defence against bank-side fraud** (the #1 real loss):
   - Tier 1 KYC is required to trade.
   - The payer's bank-account name must match the KYC name.
   - The release screen says "check YOUR bank app, screenshots can be faked".
   - 60-second release delay after PAID.
   - New-user limits, velocity checks and a blocklist of reversed payments.
9. **Auth:**
   - Ed25519 initData check with `auth_date` ≤ 5 minutes, exchanged once for a session
   - OIDC with PKCE, matched on `id`
   - opaque revocable sessions
   - passkeys required for admins
   - new-login and wallet-change alerts in the bot
   - wallet change brings a 48h trading cooldown and lower limits
10. **Process and secret split:**
    - The bot token lives only in the private worker, and the bot uses long polling, so there is no public webhook.
    - `web` holds no key that can forge logins or move funds.
    - BotFather owner account has 2-Step Verification, and there is a runbook for rotating the token.
11. **Data protection:**
    - bank details encrypted per field (libsodium XChaCha20-Poly1305)
    - revealed only after LOCKED and only to the counterparty, with every reveal logged
    - R2 private with re-encoded images
    - no ID images stored
12. **Disputes and evidence:**
    - live screen-share or recording of the bank app
    - rulings visible to both parties
    - admins rotated and rated
    - append-only audit log, copied daily to R2 with object lock
13. **Telegram anti-impersonation:** one official bot, channel and group, linked to each other and pinned; `/verify`; auto-delete in the group; deal chat in the app only.
14. **Edge and abuse:** Cloudflare WAF and DDoS, Turnstile on web login, `@fastify/rate-limit` on take, chat and login, idempotency keys on every mutating endpoint.
15. **Recovery:**
    - PITR with a monthly restore drill
    - a "pause new deals" flag (existing escrows keep working, so users can always exit)
    - nightly chain-vs-DB reconciliation that pages the owner

---

## 7. Build phases

- **Phase 0 (week 1–2): decisions and legal.**
  - Get a local legal opinion: VASP or money-service status, KYC and record-keeping duties, data-protection rules.
  - Check whether Sumsub supports the country's ID documents.
  - Get quotes and **book the audit**.
  - Create the bot (production and staging), channel, forum group and ops group.
  - Set up the monorepo, Render, Cloudflare and Sentry, with 2FA everywhere.
  - Recruit the two other multisig signers.
- **Phase 1 (week 2–5): contract first** (it carries the most risk).
  - Write the Tolk `DealEscrow`, the full sandbox matrix, and the test for the two-message lock ordering.
  - Deploy to testnet and set up the multisig on testnet.
  - Hire a Tolk contractor if needed.
- **Phase 2 (week 4–9): core app on testnet.**
  - Auth: Ed25519 initData and OIDC.
  - Wallet binding with `ton_proof`.
  - Offers (create, search, filter), take, lock, mark paid, release, cancel, timeouts.
  - Worker: indexers, keeper and outbox.
  - Live board over SSE, in-app deal chat with R2 uploads.
  - Bot DMs and channel digests.
- **Phase 3 (week 8–12): trust layer.**
  - KYC tiers and the bank-name match.
  - Profiles with stars, reviews, trades and volume, and ratings for buyer, seller and admin.
  - Disputes and the admin console (role-gated in the same SPA, with passkeys) linked to multisig orders.
  - Group moderation, `/verify`, `/profile`.
  - Audit log, reconciliation job.
  - The external audit runs in parallel; fix its findings.
- **Phase 4 (week 12–15): closed mainnet beta.**
  - Invite-only, 200 USDT per deal, 10k TVL cap, 0% fee.
  - The owner reviews every dispute.
  - Run an incident drill.
- **Phase 5: public launch.**
  - Raise caps by tier.
  - Turn on the fee.
  - Run a small self-managed bug bounty, then Immunefi once volume justifies it.

**Cut from MVP:**
- TRON in any form
- partial fills
- safety-deposit (bond) contract (later: a TraderBond that can only be slashed to the harmed counterparty)
- multiple fiat currencies (start with the one local currency)
- inline mode and bot relay chat
- Redis, Centrifugo and KMS
- native mobile apps
- fees during beta

---

## 8. Decisions the owner must make

1. **TON only, no TRON?** **Default: yes.** TRON users bring USDT in through Wallet in Telegram's cross-chain deposit, which converts it 1:1 to USDT on TON. Withdrawals back to TRON were announced only as "soon". It runs through MoonPay, so check that it is available in the new country.
2. **Who holds the 3 arbiter keys?** **Default: the owner plus 2 trusted admins, each with their own Ledger, never the same person twice.** Any 2 can rule.
3. **KYC route?** **Default: Sumsub if it supports the country's ID documents.** Otherwise a manual video check by admins that stores only the result and a document hash. Either way, ID is required before any trading.
4. **Caps and fee?** **Default for the beta: 0% fee, 200 USDT per deal, 10k USDT total locked.** After launch: 0.5% on release only. The code caps the fee at 1%, and refunds are always free.

---

## Verified by search (2026-11-17)

- **Telegram Mini App initData:** the docs describe both the HMAC check and third-party **Ed25519 `signature`** validation. The check string is `bot_id:WebAppData` followed by the sorted fields. The docs publish production and test public keys. The latest Bot API listed is **10.1 (June 11, 2026)**, which added `chat_join_request_query_id`. I did **not** confirm the critic's claimed "Bot API 10.2 domain rule"; running on one canonical origin covers it anyway. [core.telegram.org/bots/webapps](https://core.telegram.org/bots/webapps)
- **Telegram OIDC login:**
  - endpoints `oauth.telegram.org/auth`, `/token` and the JWKS
  - PKCE S256 supported
  - scopes `openid`, `profile`, `phone`, `telegram:bot_access`
  - **Telegram user ID is in the `id` claim (profile scope), not `sub`**
  - set up through BotFather → Login Widget

  [core.telegram.org/bots/telegram-login](https://core.telegram.org/bots/telegram-login)
- **TON-only rule:** Mini Apps must use TON and TON Connect only. Deadlines were Feb 1 and Feb 21, 2025. Bots and channels may not link users to platforms that use non-TON crypto. Plain bots without a Mini App are exempt. [core.telegram.org/bots/blockchain-guidelines](https://core.telegram.org/bots/blockchain-guidelines)
- **USDT-on-TON master address:** confirmed by TON docs, BitGo and Chainstack. [docs.ton.org jettons](https://docs.ton.org/ecosystem/appkit/jettons), [BitGo](https://developers.bitgo.com/docs/ton-tokens)
- **Wallet in Telegram cross-chain deposits:** launched Feb 11, 2026 through MoonPay. TRON USDT converts 1:1 to USDT on TON. Withdrawals were "soon". [decrypt.co/357748](https://decrypt.co/357748/wallet-in-telegram-launches-cross-chain-deposits-in-self-custodial-ton-wallet)
- **Multisig v2:** the official repo is `ton-blockchain/multisig-contract-v2`. The "two audits" claim comes only from a non-official article, so confirm the audit reports in the repo before relying on them. [docs.ton.org multisig](https://docs.ton.org/develop/smart-contracts/tutorials/multisig-js)

**Not verified, so treat as assumptions:**
- audit cost and lead time
- support for jetton-paid gasless relaying in each wallet
- whether a multisig order can rotate signers while keeping the same address (check in the v2 README)
- Sumsub coverage of the new country's ID documents
