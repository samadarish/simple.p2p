# simple.p2p custodial design: hostile security review

## Ranked issues

**1. CRITICAL: Deposits land in the hot wallet, so the "worst case = hot cap" claim is false.**
- **Problem:** Every deposit arrives in the hot wallet, which uses the online key. Hot is swept to cold only when it goes above cap + 1,000. Between sweeps, and while a sweep is stuck (for example when the signer is paused or out of TON), the hot wallet holds any amount.
- **Attack:** a thief who has the hot key also takes every deposit that arrives until the owner notices. A 20,000 USDT deposit lands in hot, and the signer gets compromised before the next sweep.
- **Fix:** make the **deposit address the cold Ledger address**. Receiving needs no signature. Hot is then fed only by owner refills, so the cap really is the most you can lose. This also deletes the auto-sweep code path.
- **If refilling by hand becomes too much work:** keep deposits on hot, but sweep every 60 s any amount above the cap (not above cap + 1,000), and alarm if hot stays above the cap for more than 5 minutes.

**2. CRITICAL: The signer's own safety state lives in the shared Postgres, so anyone with DB-owner access can reset it.**
- **Problem:** The caps, 24 h counters, velocity pause and address first-seen times are all "kept in its own table", in the same Render Postgres. Someone who takes over the main Render account (which has DB owner access, a restore button and the connection string) can zero the counters and backdate addresses.
- **Fix:** the signer derives its caps from the chain. It reads its own hot jetton wallet's outgoing transfers over the last 1 h and 24 h from an indexer, which is not the DB. Address first-seen times and the "paused" flag go in signer-local storage (SQLite on the VPS disk). If the local state is missing, the signer fails closed. A plain Render worker has no persistent disk, which is one more reason to put the signer on a VPS.

**3. CRITICAL: A `ton_proof` wallet skips the cooldown, so an account takeover drains a balance instantly, and the web server can fake the proof.**
- **Problem 1:** `ton_proof` proves that the attacker controls the wallet. It does not prove that the account owner does. Steal a Telegram session, link your own wallet with `ton_proof`, and you can withdraw immediately. The design's "24 h hold after a new linked wallet" contradicts the skip.
- **Problem 2:** The signer only sees a "verified via ton_proof" flag in the DB. A compromised web server sets that flag for its own address, so the claim that an attacker cannot skip the cooldown is false.
- **Fix:**
  - The skip applies only to wallets linked more than 24 h ago, **and** only to an address that the chain shows has deposited to the platform before.
  - The signer re-verifies the stored `ton_proof` blob itself: signature, domain, timestamp, and the public key taken from on-chain state, never from the response.

**4. CRITICAL: The owner's Telegram account is both the admin login and the alarm channel.**
- **Problem:** Someone who hijacks the owner's Telegram (a session-stealing phishing link, SIM swap without a cloud password, malware) can:
  - decide disputes for colluding accounts. That is up to 2,000 USDT per deal, with no limit on the number of deals.
  - freeze accounts
  - post "corrections"
  - delete or mute the alarm messages, so nothing reaches the owner.
- **Fix:**
  - Admin login uses a passkey or hardware key (WebAuthn) behind Cloudflare Access. Never use Telegram login for the admin panel.
  - Set a Telegram cloud password.
  - Send alarms to a **second channel** as well (email or a push app), and keep repeating critical ones until the owner acknowledges them.
  - Limit dispute decisions per day, and require a `signData` signature for any dispute worth more than 500 USDT.

**5. HIGH: "Correction" is an edit-balance button.**
- **Problem:** Insider fraud or a compromised admin can post `adj` (user +X, offset by custody) and then withdraw. Showing the correction in the user's history does not stop that.
- **Fix:**
  - The other side of a correction may only be `suspense` or `fees` (accounts backed by real assets), never custody.
  - Cap each correction (for example 200 USDT).
  - Corrected funds can be traded but cannot be withdrawn for 72 h.
  - Corrections go in the hash-chained audit log.

**6. HIGH: Double credit if the two indexers encode the hash differently.**
- **Problem:** The SSE stream and the v3 poller can return the same transaction hash as base64, base64url or hex. `UNIQUE(tx_hash)` then sees two different strings and credits the deposit twice.
- **Fix:** store the hash normalised as 32-byte lowercase hex. Add a second `UNIQUE(account_raw, lt)`, the canonical TON identity of a transaction. Credit from a single code path that both sources feed.

**7. HIGH: Deposits are trusted to one indexer, and the cross-check is easy to bypass.**
- **Problem:** A TON Center bug, compromise or MITM, or your own parsing bug, means fake credits that then get withdrawn. A 1,000 USDT threshold for the second check is bypassed by sending 999-USDT deposits.
- **Fix:**
  - Cross-check **every** deposit with TonAPI. It is cheap.
  - A deposit becomes withdrawable only after the next reconciliation passes: on-chain balance from `get_wallet_data` (read from a second provider) ≥ liabilities.
  - The signer runs this reconciliation itself and pauses on any deficit.

**8. HIGH: The poller may break the "finalized only" rule.**
- **Problem:** I verified that the Streaming API's `min_finality: "finalized"` is safe. TON docs also confirm that `confirmed` balance events can roll back with no notification. But I could not find a finality filter on the v3 REST `/transactions` endpoint (pending data comes from separate `pendingTransactions` endpoints).
- **Fix:** the poller only *finds* candidates. Credit only once the transaction's masterchain block is at or below the latest finalized masterchain seqno, or once the stream has delivered it as `finalized`.

**9. HIGH: A DB restore or rollback leads to double payouts.**
- **Problem:** A Render point-in-time restore rolls back withdrawals that have already been paid on-chain. Users can then withdraw again, and the signer's `query_id` records are lost too. Highload only rejects duplicates inside its timeout window.
- **Fix:**
  - Put the withdrawal id into the TEP-74 jetton `transfer.query_id` (uint64) of every payout.
  - Before signing, the signer checks **on-chain** that no outgoing transfer with that id exists.
  - After any restore, withdrawals are frozen automatically and the ledger is replayed from the chain cursor.

**10. HIGH: Two signer instances, or partial batch failures, cause double or missed sends.**
- **Problem 1:** A deploy overlap or restart can run two signers at once. Each builds a batch with its own `query_id`, so withdrawals are paid twice.
- **Problem 2:** With send mode +2, a failed message is silently skipped. A transfer in the middle of a batch can also fail for lack of balance, or bounce at the recipient's jetton wallet.
- **Fix:**
  - A single-instance lock: Postgres advisory lock plus the local lock file, and the on-chain id check from issue 9.
  - Reconcile **each withdrawal** by its jetton `query_id`, not per batch.
  - Send with `bounce = true`.
- **Verified:** for Highload v3, the external transaction marks the `query_id` as processed even if the internal transaction's action phase fails. So "processed" does not mean "sent".

**11. HIGH: Suspense claims can be stolen.**
- **Problem:** The transaction hash and sender address are public on-chain. Anyone can "claim" another person's memo-less deposit.
- **Fix:**
  - The claimant must prove they control the sender: `signData` from that address, or a small challenge deposit from that address with a fresh memo.
  - Senders that are exchange hot wallets need the exchange's withdrawal record plus a 7-day hold.
  - Suspense can never be credited without a written reason in the audit log.

**12. HIGH: The timeout refund after "paid" robs buyers.**
- **Problem:** The buyer pays by bank and marks paid. The seller stalls. The timer expires and the seller gets an automatic refund, while the buyer's fiat is gone.
- **Fix:** after "paid" is marked, timer expiry **opens a dispute automatically**, never a refund. The seller cannot cancel after "paid".

**13. HIGH: Fiat-side fraud.**
- **Problem:** Common attacks are:
  - triangulation: the buyer pays with a third party's stolen money, and the seller's bank account is later frozen
  - bank reversals
  - fake bank screenshots and SMS
- **Fix:**
  - The payer name must match the buyer's verified name.
  - Sellers confirm in their bank app, never from a screenshot.
  - New users get lower deal limits for their first N trades.

**14. MEDIUM-HIGH: Tether's admin powers over USDT.**
- **Problem:** USDT on TON uses the TON stablecoin contract. Its admin can lock any jetton wallet (no-send / no-receive), transfer or burn from it, and change the minter code. Accepting tainted deposits (stolen or sanctioned funds) can get your hot or cold jetton wallet locked.
  - **Not verified:** that a code upgrade would change jetton wallet addresses. That is my inference, because the addresses are derived from the minter.
- **Fix:**
  - Monitor the master's code hash, and recompute the hot and cold jetton wallet addresses every hour. If either changes, alarm and pause.
  - Screen deposit senders against known-bad lists.
  - Disclose the freeze risk in the Terms.

**15. MEDIUM-HIGH: Supply chain.**
- **Problem:** There are real precedents:
  - In February 2025, the npm package `@ton-wallet/create` stole mnemonics.
  - In September 2025, an npm maintainer account was hijacked and malware that swaps crypto addresses was injected.

  A bad dependency in the signer steals the hot key, and Render has no egress firewall to stop it. A bad dependency in the SPA can swap the deposit destination inside the TON Connect message.
- **Fix:**
  - **Signer:** minimal dependencies (`@ton/core`, `@ton/crypto`, `pg`), exact pinned versions, `npm ci --ignore-scripts`, no automatic update PRs, VPS with an egress allowlist.
  - **SPA:** a strict CSP and a lockfile. The bot also states the official deposit address, so users can compare.

**16. MEDIUM: Hot key exposure and account hygiene.**
- **Problem:** A Render environment variable is readable by anyone who controls that Render account. Generating the key on a laptop exposes it to that laptop.
- **Fix:**
  - Generate the key on the signer host.
  - Use a hardware-key (passkey) 2FA on Render, Cloudflare, GitHub, the domain registrar and email, with a unique email for the signer account.
  - Practise the kill switch once.

**17. MEDIUM: Telegram auth.**
- **Problem:** Leaking the bot token lets an attacker forge `initData` for any user. A missing `auth_date` check allows replay of an old login.
- **Fix:** the web server validates the Ed25519 `signature` with the third-party method, which needs only the bot id, so the web server never holds the bot token. Enforce `auth_date` ≤ 1 h, then issue your own short session.

**18. MEDIUM: Alarm fatigue.**
- **Problem:** An alarm for every send means hundreds of messages a day, and an owner with ADHD will ignore all of them.
- **Fix:** alarm only on anomalies (pause, new-address spike, deficit, cap reached), plus one daily digest.

**19. MEDIUM: Outgoing transfers without a notification lose users' money at exchanges.**
- **Problem:** Exchanges credit deposits from `transfer_notification`. With `forward_ton_amount` set to 0, they never see the deposit.
- **Fix:** always set `forward_ton_amount` ≥ 1 nanoton, and put the user's exchange memo in `forward_payload`. TON docs require this.

**20. MEDIUM: Cold wallet is a single point of failure.**
- **Problem:**
  - A thief who finds one steel plate takes everything.
  - If the owner dies or is incapacitated, all user funds are stuck forever.
  - The public proof-of-reserves page in a small country makes the owner a target for physical coercion.
  - Malware that swaps the cold address on the laptop sends funds to the attacker.
- **Fix:**
  - Add a BIP39 passphrase stored apart from the plates.
  - Leave sealed recovery instructions with a lawyer.
  - Confirm the cold address on the Ledger screen before putting it in the signer config.
  - Show reserve totals, not the owner's identity.
  - Move to a TON multisig (2-of-3) once balances grow.

**21. LOW-MEDIUM: Validation gaps.**
- Add the TON docs step "the deposit transaction has no outgoing messages".
- Normalise memos: trim, uppercase, take the first token.
- Treat encrypted comments as no memo.
- Detect sends with zero `forward_ton_amount` (silent balance increases) through reconciliation surplus, and route them to suspense.
- Decide what happens when a deposit pushes a user over the 10,000 cap: credit the funds but lock the excess. Never bounce it.
- "Reject jetton-wallet addresses" needs an on-chain code check.

**22. LOW: Owner approvals with `signData`.**
- **Problem:** I could not confirm that a Ledger used through Tonkeeper supports `signData`. If it does not, approvals come from a phone hot wallet.
- **Fix:**
  - The signer checks domain, timestamp ≤ 15 min, a single-use key and the public key from on-chain state.
  - It re-checks that amount and address match the DB row at send time.
  - The owner reads the address on the wallet screen, not in the admin UI.

## Final corrected design deltas

1. Deposit address = cold Ledger address. Hot only receives refills. Delete auto-sweep, or sweep anything above the cap every 60 s.
2. The signer computes its caps and velocity from the chain, keeps the cooldown and pause state on its own disk, fails closed, runs as a single instance, and preferably runs on a VPS with egress allowlisting.
3. Jetton `transfer.query_id` = withdrawal id. The signer refuses any id already seen on-chain. Reconcile each withdrawal. Any DB restore freezes withdrawals automatically and triggers a replay.
4. Deposit identity = normalised hex hash plus `UNIQUE(account, lt)`. Credit only at finalized. Cross-check every deposit with a second indexer. Funds become withdrawable only after a reconciliation pass.
5. Cooldown skip only for wallets older than 24 h that are proven deposit sources, with `ton_proof` re-verified by the signer.
6. Admin login with a passkey or hardware key. Alarms on a second channel. Daily dispute limit, and `signData` for large disputes.
7. Corrections only from suspense or fees, capped, with a 72 h withdrawal hold.
8. Suspense claims need proof of control of the sender address.
9. "Paid" plus timeout opens a dispute, never a refund. The payer name must match the buyer.
10. Watch the USDT master code hash and the jetton wallet addresses. Screen deposit senders. Disclose Tether's freeze powers.
11. Signer dependencies minimal and pinned, install scripts off. CSP on the SPA. `initData` checked by Ed25519 signature with an `auth_date` limit.
12. Cold wallet gets a BIP39 passphrase and an inheritance plan, and its address is verified on the device.

**Sources:**
- [TON docs: sub-second finality (Catchain 2.0 live since April 9 2026, finalized in about 0.8 s, confirmed balance events can roll back silently)](https://docs.ton.org/llms/subsecond/content.md)
- [TON docs: Streaming API overview (min_finality, trace_invalidated)](https://docs.ton.org/llms/api/streaming/overview/content.md)
- [TON docs: Streaming API notification reference](https://docs.ton.org/llms/api/streaming/reference/content.md)
- [TON docs: Jetton payments processing (validation steps including no outgoing messages, forward_ton_amount ≥ 1 nanoton)](https://docs.ton.org/llms/applications/payments/jettons/content.md)
- [TON docs: Highload v3 verify is processed (query_id stays processed if the action phase fails)](https://docs.ton.org/standard/wallets/highload/v3/verify-is-processed)
- [TON docs: Highload v3 specification](https://docs.ton.org/standard/wallets/highload/v3/specification)
- [TON docs: Highload wallets overview](https://docs.ton.org/llms/contracts/standard/wallets/highload/overview/content.md)
- [TON docs: Jetton implementations comparison (USDT uses the stablecoin contract with governance)](https://docs.ton.org/llms/contracts/standard/tokens/jettons/comparison/content.md)
- [Admin control in TON stablecoins (set_status lock, admin transfer and burn)](https://dev.to/roma_i_m/lets-understand-the-stablecoin-on-ton-blockchain-or-how-your-funds-can-be-blocked-2d3c)
- [TON docs: TON Connect signData (what is signed, verification, 15-minute bound)](https://docs.ton.org/llms/applications/ton-connect/how-to/sign-data/content.md)
- [Tonkeeper help: Ledger in Tonkeeper](https://tonkeeper.helpscoutdocs.com/article/86-how-to-connect-ledger-to-tonkeeper)
- [Telegram initData third-party Ed25519 validation](https://swimmwatch.github.io/telegram-webapp-auth/guide/third-party/)
- [Socket: malicious TON npm package stealing wallet keys](https://socket.dev/blog/ton-wallet-security-threat-malicious-npm-package-steals-cryptocurrency-wallet-keys)
- [Cointelegraph: September 2025 npm crypto-stealer attack](https://cointelegraph.com/news/npm-attack-crypto-stealing-malware-into-core-javascript-libraries)
