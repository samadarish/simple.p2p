# Architecture notes for the real build

These were written before the demo and are **not final**. The real build waits for demo approval.

| File | What it is | Status |
|---|---|---|
| [`custody-design.md`](custody-design.md) | **Custodial** money system: one deposit address with a memo per user, a Postgres double-entry ledger, a capped hot wallet with a separate signer, and a cold Ledger | **Current direction.** The owner chose custodial ("I will hold it, I am the admin"). |
| [`custody-review-ops.md`](custody-review-ops.md) | Operations review of that design, issues ranked by severity | Apply its fixes |
| [`custody-review-security.md`](custody-review-security.md) | Hostile security review of that design | Apply its fixes |
| [`stack.md`](stack.md) | First stack proposal | **Partly replaced.** It was written for a **non-custodial** setup: an escrow contract per deal, a 2-of-3 multisig arbiter, users signing every move. Those parts are replaced by the custody docs above. Its frontend, backend, database, realtime, bot, auth, files and ops choices still stand as the starting point. |

Before building, also settle the open decisions in [`../product-brief.md`](../product-brief.md): chains (TON vs TRC20/BEP20), currency, and auto-release rules.
