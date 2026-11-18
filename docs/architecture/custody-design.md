# simple.p2p custodial money system (TON + USDT)

**Core idea in one line.** Users deposit USDT to one platform address with a personal memo. All trading happens in a Postgres double-entry ledger. A separate signer process with no inbound network sends withdrawals from a small, capped hot wallet. The owner's Ledger holds most of the money.

---

## 1. Deposits

**Choice: one deposit address plus a permanent memo for each user.** I did not pick a separate wallet per user.
- **Why:** it means one key and one jetton wallet to watch, and nothing to sweep. Per-user wallets need deployment, gas top-ups, sweeps and many keys. TON docs present the two designs as a trade-off. The main weakness of a memo is that users forget it, and TON Connect removes that risk for in-app deposits.
- **Deposit address:** the hot wallet itself (Highload Wallet v3). Anything above the hot cap is swept to cold automatically (see section 4).
- **Memo format:** `P2P-1234567-9`. The last digit is a Luhn check digit, so a typo goes to a suspense account instead of crediting the wrong user. The code is permanent, so it can be reused from exchanges.

**Foolproof in-app flow (TON Connect `sendTransaction`):**
1. The user taps Deposit and enters an amount.
2. The app looks up the user's own USDT jetton wallet by calling `get_wallet_address(userAddr)` on the USDT master.
3. The app builds one message to that jetton wallet. It attaches 0.05 TON, and the body is a TEP-74 `transfer` with:
   - `destination` = hot wallet
   - `response_destination` = the user
   - `forward_ton_amount` = 1 nanoton or more (without it no notification is sent and the deposit is invisible)
   - `forward_payload` = text comment (opcode `0x00000000`) holding the memo
4. Before opening the wallet, the app checks that the user has at least 0.06 TON for gas. If not, it shows "You need ~0.06 TON for the network fee."
5. The user only taps Approve. They never type the address or the memo.

**Manual deposit (from an exchange or another wallet):** show the address and the memo with copy buttons, a QR code, a red "MEMO REQUIRED" warning and "Only USDT on TON."

**Detection (pg-boss worker, not the web process):**
- **Primary:** TON Center Streaming API v2 (SSE) on the hot address with `min_finality: "finalized"`. Since Catchain 2.0 (April 2026), finalized arrives about 1 second after the transaction.
- **Backfill:** poll TON Center v3 every 30 s from the last processed `lt` and hash, which are stored in the database. This catches gaps when the stream drops.
- **Large deposits:** for deposits of 1,000 USDT or more, cross-check the transaction with a second indexer (TonAPI) before crediting.
- **Confirmations:** credit only at `finalized`. Never credit at `pending` or `confirmed`, because balance events at `confirmed` can roll back silently.

**Validation, in this exact order (TON docs warn that changing the order can lose funds):**
1. `in_msg.source` equals the hot wallet's USDT jetton wallet. Compute that address once at startup with `get_wallet_address(hot)` on the allowlisted master `EQCxE6mU…_sDs`, and compare in raw `0:hex` form.
2. The transaction succeeded: not aborted, compute phase OK, and it is not a bounce.
3. The opcode is `0x7362d09c` (`transfer_notification`). Parse `amount`, `sender` and `forward_payload`. The payload is `Either Cell ^Cell`, so handle both the inline and the reference form, and treat malformed payloads as "no memo."
4. The memo is valid and its Luhn digit checks. Credit that user.
   - Bad or missing memo goes to `suspense`.
   - The owner resolves suspense through a claim form (the user gives the transaction hash and the sender address).
5. **Thresholds:**
   - Under the minimum deposit (5 USDT) goes to suspense. This also absorbs dust spam.
   - A sender equal to the cold address is a refill (cold to hot), not a user deposit.

**Fake-jetton defence:** anything not sent by the computed USDT jetton wallet is ignored. That covers fake "USDT" with the same name or icon, fake masters and native TON sends. Never match by symbol or metadata.

**Idempotency:** the `deposits` table has `UNIQUE(tx_hash)`, and the ledger idempotency key is `dep:<tx_hash>`.

---

## 2. Internal ledger (double-entry)

**Units:** micro-USDT stored as `bigint` (6 decimals). Never use floats.

**Tables:**
- `accounts(id, kind, user_id NULL, deal_id NULL, balance bigint, CHECK (kind NOT IN ('user_available','user_withdrawing','deal_escrow') OR balance >= 0))`
- `journals(id, type, idempotency_key UNIQUE, actor, reason, created_at)`
- `entries(id, journal_id, account_id, amount bigint)`. Rows are append-only: no UPDATE and no DELETE, enforced by a trigger and by role grants.

**Account kinds:**

| Kind | Meaning |
|---|---|
| `user_available` | Free balance (one per user) |
| `deal_escrow` | Money locked in one deal (one per deal) |
| `user_withdrawing` | Withdrawal requested, not yet final |
| `custody_hot` / `custody_cold` | On-chain assets (negative mirror) |
| `fees` | Platform revenue |
| `suspense` | Unmatched deposits |

**Invariants:**
- **Zero-sum journals:** the entries of every journal sum to 0. Check this in the same database transaction with a deferred constraint trigger.
- **Cached balances:** `accounts.balance = SUM(entries)` for that account. A nightly job recomputes every balance and alerts on any difference.
- **Custody matches liabilities:** −(custody_hot + custody_cold) = Σ all liabilities.
- **No overdraft:** user, escrow and withdrawing balances are ≥ 0, enforced by the CHECK constraint.

**Write procedure (one function `post(journal)`, used everywhere):**
1. `BEGIN`.
2. Insert the journal row. Return early on an idempotency-key conflict, so retries are safe.
3. `SELECT … FOR UPDATE` the affected accounts in ascending id order, to avoid deadlocks.
4. Insert the entries and update the cached balances. The CHECK constraint blocks overdrafts.
5. Update the deal or withdrawal status in the same transaction.
6. `COMMIT`.

**Mapping:**

| Event | Entries | Idempotency key |
|---|---|---|
| Deposit | custody_hot −X, user_available +X | `dep:<tx_hash>` |
| Deal lock (seller) | seller_available −A, deal_escrow +A | `deal:<id>:lock` |
| Release (seller or owner) | escrow −A, buyer_available +(A−fee), fees +fee | `deal:<id>:settle` |
| Refund / cancel / timeout | escrow −A, seller_available +A | `deal:<id>:settle` (same key, so a deal can never be both released and refunded) |
| Dispute opened | no entries; deal.status = `disputed` freezes it | none |
| Dispute split | escrow −A, buyer +B, seller +(A−B) | `deal:<id>:settle` |
| Withdrawal request | user_available −W, user_withdrawing +W | `wd:<id>:req` |
| Withdrawal final | user_withdrawing −W, custody_hot +(W−fee), fees +fee | `wd:<id>:done` |
| Withdrawal failed or rejected | user_withdrawing −W, user_available +W | `wd:<id>:done` |
| Refill / sweep | custody_cold ↔ custody_hot | `mv:<tx_hash>` |
| Correction (bugs only) | `type=adjustment`, reason required, shown in the user's history | `adj:<uuid>` |

---

## 3. Withdrawals

**Flow:**
1. **Request (web):** the user enters an address and amount, and the request is posted to the ledger (available → withdrawing).
2. **Policy check (web):** the request is marked `auto_ok` or `needs_owner`.
3. **Signer:** it re-checks every rule itself, batches, signs and sends.
4. **Watcher:** it waits for `finalized`, then posts the done journal (or reverses it on failure).

**Suggested defaults:**

| Rule | Default |
|---|---|
| Minimum withdrawal | 10 USDT |
| Fee | 1 USDT flat. The platform attaches about 0.05 TON per jetton transfer, and the excess returns via `response_destination` = hot |
| Auto-approve per withdrawal | ≤ 500 USDT |
| Auto-approve per user per 24 h | ≤ 1,000 USDT |
| Platform-wide auto per 24 h | ≤ 3,000 USDT (never more than the hot cap) |
| Above the limits | Owner approval, signed (see section 4) |
| New address | 24 h cooldown before first use. A wallet linked via TON Connect `ton_proof` skips the cooldown |
| After a sensitive change (new linked wallet, first login from a new Telegram account) | 24 h withdrawal hold |
| Batching | Signer runs every 60 s and takes up to 100 withdrawals per Highload v3 batch (hard limit 254 messages) |

**Address hygiene:**
- Accept EQ and UQ forms and normalise to raw.
- Workchain 0 only, and reject testnet-flag addresses.
- Reject the hot, cold, USDT master or any jetton-wallet address. Users often paste their jetton wallet by mistake.
- Offer an optional comment field for exchange deposit memos.

**Highload v3 double-send trap:**
1. Save `query_id` and `created_at` in the database **before** sending.
2. Retries resend the identical message with the same `query_id`. The contract rejects duplicates, so this is safe.
3. If the timeout window (for example 1 h) passes without the batch being seen as processed, mark it `unknown`. Never re-send with a new `query_id` until reconciliation proves the batch did not go out.
4. Verify **both** transactions of the batch: the external one and the internal self-message.

**Failure handling:** if the hot jetton wallet's transfer bounces (tokens come back), mark the withdrawal failed and reverse it to available after an automatic check.

---

## 4. Key management

| Wallet | Holds | Key location |
|---|---|---|
| **Hot** (Highload v3) | Cap: 3,000 USDT or 10% of liabilities, whichever is lower. Floor: 500 USDT. Plus 20 TON for gas | Signer only |
| **Cold** (Ledger Nano, TON app, used via Tonkeeper or Ledger Live) | Everything else | Owner's Ledger. Seed on a steel plate, two copies in two places, never typed into any computer |

**Signer process:**
- **Hosting:** run it as a Render background worker in a **separate Render account** (separate email and 2FA), or on a small VPS with a firewall that denies all inbound traffic. It has no HTTP port.
- **Network:** outbound only, to Postgres and the TON API.
- **Hot key:** a secret env var that exists only on the signer. The web, worker and bot never see it.
- **Database access:** its own Postgres role. It can read withdrawals and write status columns plus the signer's own tables. It cannot write ledger entries. The web uses a non-owner app role, and the DB-owner credentials are kept off all servers.
- **Rules it enforces itself (the database is not trusted):**
  - per-withdrawal and 24 h caps (kept in its own table)
  - the new-address cooldown
  - destination checks
  - automatic pause if more than 1,000 USDT leaves within 1 hour
- **Hard-coded config:** the cold address is the only non-user destination it will ever send to, for sweeps when hot exceeds cap + 1,000.
- **Owner approval:** the owner approves a large withdrawal by signing `wd:<id>|<amount>|<addr>` with **TON Connect `signData` from the owner's own wallet**. The signer verifies the signature against the owner's public key in its config. The web server cannot forge it.
- **Alarm bot:** the signer reports every send, pause and low-balance event through its **own separate Telegram bot** straight to the owner. This keeps working even if the web server is compromised.
- **Kill switch:** the owner suspends the signer service in the Render dashboard. This works without code.

**Refill (owner, about 5 minutes):**
1. The alarm says "Hot low: 420 USDT. Send 2,000."
2. Open Tonkeeper with the Ledger connected and send USDT to the saved "simple.p2p HOT" contact.
3. Approve on the Ledger.
4. The detector sees sender = cold and posts it as cold → hot.

**If an attacker fully owns the web server:**

| Can | Cannot |
|---|---|
| Read user data, fake UI, fake deal outcomes, insert fake ledger rows | Sign any transaction (no key) |
| Queue withdrawals to their own address | Exceed the signer's caps: at most about 3,000 USDT per day, and the hourly velocity pause triggers sooner |
| Hide things in the admin panel | Hide sends from the signer's own alarm bot |
| | Touch cold funds or forge owner approvals |
| | Skip the 24 h cooldown on new addresses (the signer checks it itself) |

**Worst case:** the hot wallet balance, and in practice less because of the 24 h cooldown.

---

## 5. Reconciliation and proof

**Every 10 minutes (worker):**
- on-chain USDT(hot jetton wallet) + on-chain USDT(cold jetton wallet) + in-flight transfers is compared with −(custody_hot + custody_cold) and with Σ liabilities.
- Alert if the gap is more than 1 USDT, or if on-chain is **below** liabilities at all. That second case is critical: auto-pause withdrawals.

**Nightly:**
- Recompute every account balance from its entries.
- Check every journal sums to zero.
- Check the indexer cursor has no gaps.

**Other alerts:**
- hot below 500 USDT
- hot TON below 5
- suspense growing
- the stream lagging more than 2 minutes

**Optional public proof-of-reserves page (hourly):**
- Shows the hot and cold addresses with tonviewer links, total liabilities, the reserve ratio and the last check time.
- **Later:** a Merkle tree of user balances so each user can verify they are included.

---

## 6. Owner as admin: disputes and protecting users from the owner

**Dispute flow:**
1. The buyer or seller opens a dispute (allowed after "paid" is marked, or once the timer expires). The deal freezes.
2. Both sides upload evidence: bank screenshot, reference number, chat. They have 24 h.
3. The owner chooses **Release to buyer**, **Refund to seller** or **Split**, and must write a reason of at least 20 characters.
4. Both parties are notified with the reason, and the decision is final.

**What protects users from the owner:**
- **Narrow admin powers.** There is no "edit balance" button. The admin can only:
  - settle **disputed** deals, and only within that deal's escrow
  - approve or reject withdrawals
  - freeze an account, which blocks withdrawals but cannot move funds
  - post corrections, which are shown to the user
- **Append-only audit log.** It is hash-chained (each row stores the hash of the previous one). Optionally, post the daily head hash on-chain as a TON transaction comment, so history cannot be rewritten quietly.
- **Public stats:** disputes per month, % decided for the buyer vs the seller, median resolution time.
- **Caps at launch:**
  - maximum deal 2,000 USDT
  - maximum user balance 10,000 USDT, which limits the damage from any single wrong decision or hack
- **Conflict of interest:** the owner does not trade on the platform, or must disclose it.
- **Honest limit:** custodial means users trust the owner. Transparency lowers that risk but does not remove it. Say so in the Terms.

---

## 7. Legal note

Holding user crypto and facilitating USDT-for-fiat exchange makes the platform a **VASP** under FATF Recommendation 15 almost everywhere: a custodial wallet provider plus an exchange service. That usually means licensing or registration, KYC/AML, transaction monitoring, suspicious-activity reporting and the Travel Rule for transfers of about USD/EUR 1,000 or more. Things to check in the new country:
- whether a virtual-asset law or regulator exists yet
- if not, whether money-transmission or payment-services rules apply
- whether local banks will freeze accounts used for P2P
- whether serving foreign residents (for example in the EU under MiCA) triggers their rules

Get a local lawyer's written opinion **before** taking deposits.

---

**Lower-code alternative worth a look:** the TON docs list *Bicycle*, a self-hosted payment processor. It handles per-user USDT deposit addresses, sweeps to hot or cold, withdrawals with `query_id` idempotency, and webhooks. It could replace sections 1 and 3, but it uses per-user addresses rather than a memo and adds a component the owner must run.

**Sources:**
- [TON docs: Jetton payments processing](https://docs.ton.org/llms/applications/payments/jettons/content.md)
- [TON docs: Gram payments processing (memo vs per-user)](https://docs.ton.org/llms/applications/payments/gram/content.md)
- [TON docs: Payments setup / Bicycle](https://docs.ton.org/llms/applications/payments/setup/content.md)
- [TON docs: Highload Wallet v3 batch transfers](https://docs.ton.org/standard/wallets/highload/v3/send-batch-transfers)
- [TON docs: Highload v3 verify is processed](https://docs.ton.org/standard/wallets/highload/v3/verify-is-processed)
- [TON docs: Sub-second finality / Streaming API v2](https://docs.ton.org/llms/subsecond/content.md)
- [TON docs: Jetton transfer (comment in forward_payload)](https://docs.ton.org/standard/tokens/jettons/transfer)
- [TON docs: TON Connect send transaction](https://docs.ton.org/applications/ton-connect/how-to/send-transaction)
- [Fake Jetton Contract (secure-contracts)](https://secure-contracts.com/not-so-smart-contracts/ton/fake_jetton_contract)
- [MPCVault: proper use of the TON comment field](https://docs.mpcvault.com/blog/reminder-proper-use-of-the-comment-field-for-ton-transactions)
