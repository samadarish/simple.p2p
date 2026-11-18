# simple.p2p custodial design review: issues ranked by severity

## Critical (fix before launch)

**1. Anyone can steal a suspense deposit through the claim form.**
- **Problem:** The claim form asks for the transaction hash and the sender address. Both are public on tonviewer. An attacker can find a deposit that had no memo and claim it as their own.
- **Fix:** Never credit suspense to whoever claims it.
  - The default is to refund the deposit to the address that sent it, minus the fee.
  - A deposit from an exchange's hot wallet is the only exception. Those go to manual review, and the owner needs the exchange withdrawal ID or a screenshot.
  - A claimant who wants a credit instead must prove they control the sender address with `ton_proof`.

**2. If the owner is unavailable, every user's money is stuck (bus factor of one).**
- **Problem:** The owner is the only person who can do any of these:
  - refill the hot wallet
  - approve large withdrawals
  - decide disputes
  - touch cold funds

  If the owner dies, is in hospital, or loses both the Ledger and the steel plates, all user funds are frozen for good.
- **Fix:** A recovery kit, with no multisig.
  - Steel copy #2 of the seed goes in a sealed envelope at a lawyer's office or in a bank deposit box.
  - Next to it, a one-page "wind-down runbook": pause new deals, export balances, send every user their balance.
  - Add a **Wind-down mode** button. It stops new deals and sets every withdrawal to auto-approve within the hot balance.

**3. There is no database backup plan, and the ledger is the only record of who owns what.**
- **Problem:** If Postgres is lost, the platform still holds the coins but has no record of who owns them.
- **Fix:**
  - Use Render point-in-time recovery (PITR).
  - Add a nightly encrypted `pg_dump` to a different provider, such as Cloudflare R2.
  - Email the owner a nightly CSV of balances per user, encrypted with age or GPG. That file alone is enough to refund everyone.
  - Do a restore drill once a month. Put it in the calendar.

**4. The limits contradict each other, so the owner has to approve almost every real withdrawal.**
- **Problem:**
  - The largest deal is 2,000, but the auto-approve limit per withdrawal is 500. A buyer who receives 2,000 always needs the owner.
  - The velocity pause is 1,000 per hour, so one normal large withdrawal pauses the signer.
  - "10% of liabilities, floor 500" makes the hot wallet tiny at launch, so it needs constant refills.
  - The sweep is triggered at "cap + 1,000" and the alert at "below 500", so funds keep moving back and forth between hot and cold.
  - Nobody has defined how to undo a pause.
- **Fix:** Use a few fixed numbers instead of percentages:
  - hot target 3,000
  - sweep down to 3,000 when hot is above 6,000
  - alert when hot is below 1,000
  - auto-approve per withdrawal up to the largest deal size (2,000)
  - per user per day 2,000
  - platform-wide auto-approve 5,000 per day
  - velocity pause above 3,000 per hour
  - the owner un-pauses with a `/resume` button in the signer's bot

  Buyers and sellers move USDT in and out at roughly the same rate, so deposits refill the hot wallet on their own and owner refills should be rare.

**5. Legal and custody: holding user money makes the platform a regulated business (a VASP).**
- **Problem:** The design already says so, but it needs to be a hard gate before launch. The owner also personally holds user funds, mixed with nothing else, under no legal entity.
- **Fix:** All of the following before the first real deposit:
  - set up a company
  - write Terms covering custody, the dispute process and what happens in a wind-down
  - get the lawyer's written opinion
  - keep a ledger for the cold wallet that is used for nothing else (no personal funds)

## High

**6. The 24-hour cooldown for new addresses gives no real protection, and it annoys real users.**
- **Problem:**
  - `ton_proof` only proves that someone controls the address. An attacker can prove control of their own wallet, so the exemption skips the cooldown both for an attacker who owns the web server and for one who has taken over a Telegram account.
  - That makes the claim in section 4, "cannot skip the 24 h cooldown", false.
  - Meanwhile real buyers get stuck for 24 hours on their first withdrawal.
- **Fix:**
  - Drop the `ton_proof` exemption.
  - Start the cooldown when the address is linked, not when it is first used. The signer stores the time it first saw the address in its own table.
  - Addresses the user has deposited from are trusted straight away.
  - Rely mainly on the caps and the velocity pause.
  - Correct the threat table: the worst case is the hot wallet's balance.

**7. Highload Wallet v3 is more complexity than this volume needs.**
- **Problem:** The `query_id`, the timeout, the "unknown" state and the two-transaction check are where costly bugs tend to hide. A small new country will produce tens of withdrawals a day, not thousands.
- **Fix:** Use **Wallet V5 (W5)**.
  - It can send up to 255 messages in one external message.
  - Each message carries a seqno and a `valid_until`.
  - The rule is easy to check: if the seqno moved, the batch was processed. If `valid_until` passed and the seqno did not move, it is safe to sign again.
  - The signer resolves an "unknown" batch automatically and never pages the owner for it.

**8. "Corrections" are an edit-balance button under another name.**
- **Problem:** The design says there is no edit-balance button, but an adjustment from the admin panel can create money for anyone.
- **Fix:**
  - Remove adjustments from the admin panel.
  - The only allowed move is suspense → user, or a refund to the sender.
  - Real bug fixes are posted from a CLI script with the database-owner credential, which is not kept on any server. Each one is still shown in the affected user's history.

**9. Deposits that send no notification are invisible, and users without TON cannot deposit.**
- **Problem:**
  - Some exchanges and wallets send USDT with `forward_ton_amount = 0`. No notification reaches the hot wallet, so the money arrives without being credited.
  - Many Telegram users hold only USDT and no TON, so they fail the 0.06 TON gas check.
- **Fix:**
  - Detect deposits on the hot **jetton wallet** side: incoming `internal_transfer` messages, for example TON Center v3 `/jetton/transfers` filtered by direction "in". Check the field names first.
  - Keep the main check: the receiving jetton wallet must equal the computed hot USDT jetton wallet.
  - Make the manual memo flow a first-class option, not a fallback. Most users will deposit from the custodial Telegram Wallet or from exchanges.

**10. A withdrawal that bounces after it is marked done cannot be reversed.**
- **Problem:** The "done" and "failed" journals share the key `wd:<id>:done`. If the destination's `internal_transfer` bounces after "done" is posted, the reversal is blocked and the chain shows money the ledger does not explain.
- **Fix:**
  - Mark a withdrawal done only after the **whole trace** has finalized.
  - Add a separate `wd:<id>:bounced` journal that returns the money to the user.
  - Detect a pasted jetton-wallet address by calling `get_wallet_data` on the destination. If it answers, reject the address.

**11. The only admin is protected by a single Telegram login.**
- **Problem:** Whoever takes over the owner's Telegram account gets dispute settlement, withdrawal approval and account freezing.
- **Fix:**
  - Put the admin panel on its own subdomain behind **Cloudflare Access** (free tier), with a passkey.
  - Turn on a Telegram 2FA password.
  - Store every credential in one password manager, with printed recovery codes kept beside the Ledger.

**12. Fiat-side fraud is missing from the design, and in P2P it is the biggest real-world loss.**
- **Problem:** Buyers pay with stolen bank funds, banks reverse the payment, or a buyer runs a triangulation scam.
- **Fix:**
  - Require the bank account holder's name to match the user's verified name.
  - Show the seller "payer name must equal X".
  - Hold a new user's first release for a short time.
  - Do basic KYC for anyone above a small limit.

**13. A silent failure looks exactly like "all good".**
- **Problem:** If the signer or the alarm bot dies, the owner simply stops getting messages. On the other side, reconciliation that compares chain and database at slightly different moments will raise false alarms and pause withdrawals. The owner will soon start ignoring alerts.
- **Fix:**
  - The signer sends a daily "all OK" heartbeat and pings an external dead-man check such as healthchecks.io.
  - Auto-pause only after **2 failed reconciliation checks in a row**.
  - Send one daily digest and keep instant alerts for critical events only.

## Medium

**14. Owner approval through `signData` adds little and costs effort.**
- **Problem:**
  - The most anyone can steal is already capped by the hot balance.
  - The Ledger with Tonkeeper may not support `signData` (needs checking).
  - The signer needs custom code to verify the signature.
- **Fix:** Approve and reject with inline buttons in the signer's own bot. It uses long-polling, which is outbound only, accepts only the owner's Telegram ID, and its token exists only on the signer.

**15. Deposit detection is overbuilt.**
- **Problem:** The streaming API, a 30-second backfill poll and a second indexer (TonAPI) are three integrations to build and keep running.
- **Fix:**
  - Poll only, every 5–10 seconds, from the saved cursor.
  - Drop the streaming API for now.
  - Replace the second-indexer check with a rule: deposits of 1,000 or more cannot be withdrawn until the next reconciliation passes.

**16. The proof-of-reserves page publishes the owner's cold address.**
- **Problem:** In a small country, that tells everyone the solo founder personally holds a known pile of money, which is a risk to their physical safety.
- **Fix:**
  - At launch, show only totals and the reserve ratio.
  - Drop the Merkle tree and posting the audit-log hash on-chain.
  - A hash-chained audit log in the database is enough.

**17. The signer's caps rely on database tables.**
- **Fix:** The signer works out how much it sent in the last hour and the last 24 hours from its **own on-chain history**, which needs no trust. It keeps only its "first seen address" table in the database.

**18. Losing the Render account loses the hot key.**
- **Fix:**
  - Generate the hot mnemonic once, offline.
  - Store it in the password manager and on paper.
  - Write down how to rotate the key: create a new hot wallet, sweep the old one, change the env var.

**19. Dust deposits fill suspense and make the "suspense growing" alert noisy.**
- **Fix:**
  - A deposit with a valid memo is always credited.
  - A deposit with no memo and under 1 USDT is ignored and only logged.
  - The suspense alert counts only real amounts.

**20. Several flows are missing:**
- fee payouts (fees go to cold, and the owner moves them from the Ledger)
- buying TON for gas
- a clear definition that fees are platform equity inside the reconciliation, not a liability
- Tether can freeze USDT wallets, which is another reason to keep the hot wallet small and send nothing from cold except refills

**21. Holiday plan.**
- **Fix:** Before a trip, raise the hot wallet to about a week of net outflow, use a "pause new deals" switch, and show users a published dispute response time.
- **Optional:** a second moderator who can decide disputes but has no withdrawal or key powers.

## Corrected design: what changes

1. **Hot wallet:** W5 (seqno, `valid_until`), also used as the deposit address.
   - Fixed numbers: target 3,000, sweep above 6,000, alert below 1,000.
   - Auto-approve: 2,000 per withdrawal, 2,000 per user per day, 5,000 per day for the platform.
   - Velocity pause above 3,000 per hour, cleared with `/resume` in the bot.
2. **Deposits:**
   - Poll the hot jetton wallet's incoming transfers every 5–10 seconds.
   - The memo flow is primary, with TON Connect as the convenience path.
   - Deposits of 1,000 or more are locked until the next reconciliation passes.
   - No streaming API and no TonAPI.
3. **Suspense:** refund to the sender by default. Credit a claimant only with `ton_proof` or exchange evidence.
4. **Corrections:** removed from the admin panel. Bug fixes go through a CLI script with the database-owner credential and are still shown to the user.
5. **Withdrawals:**
   - Done only after the whole trace finalizes, with a separate `bounced` journal.
   - Destination is checked with `get_wallet_data`.
   - Cooldown starts at link time, and the `ton_proof` exemption is gone.
6. **Signer:**
   - Caps come from its own on-chain history.
   - Approvals, pause and resume happen in its own bot.
   - Daily heartbeat and an external dead-man ping.
   - Hot mnemonic backed up offline, with a written rotation procedure.
7. **Admin:** behind Cloudflare Access with a passkey, plus a Telegram 2FA password.
8. **Backups:** Render PITR, a nightly off-site encrypted dump, a nightly encrypted balances CSV to the owner, and a monthly restore drill.
9. **Bus factor:** a sealed seed copy and wind-down runbook with a lawyer or in a bank box, a Wind-down mode button, and a pause-new-deals switch for holidays.
10. **Alerts:** auto-pause after 2 failed reconciliations in a row, one daily digest, instant alerts for critical events only.
11. **Deferred until later:** the public cold address, the Merkle proof of reserves, the on-chain audit hash, the second indexer and the streaming API.
12. **Launch gates:**
    - the lawyer's written opinion, a company and Terms
    - KYC, plus the rule that the bank name must match the verified name
    - a full testnet rehearsal of deposit, deal, dispute, withdrawal and refill
    - a soft launch with low caps
    - an outside review of `post()` and the signer code
