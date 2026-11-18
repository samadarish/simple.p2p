# simple.p2p product brief

## What it is
simple.p2p is a P2P marketplace where people **buy and sell USDT for local money**, by bank transfer, mobile money or cash. It started for a newly created country. A Telegram **bot**, **channel** and **group** are built in.

- **Buyers and sellers** post ads, search ads, start orders, chat inside the order, and rate each other after a finished order.
- **Ongoing orders are visible** on a live board: Open → Locked → Paid → Done.
- **The owner** holds the funds and is the **only admin and dispute judge**.

## Decisions already made
Don't re-open these without the owner.

| Topic | Decision |
|---|---|
| Custody | **Custodial.** Users deposit to the platform, and trading moves balances in our own ledger. The owner holds the funds: a small hot wallet for withdrawals and the rest in a cold wallet (Ledger). |
| Admin | The owner is the only admin and the only judge of appeals. |
| Asset | **USDT on TON** for now. Telegram requires TON for Mini Apps. *(Under review: see open decisions.)* |
| Telegram | **Bot:** order alerts and the release/withdraw codes. **Channel:** auto-posts of new ads and a 24-hour summary. **Group:** chat and rules. Login with Telegram. |
| Safety | USDT is locked when an ad goes live. You can rate only after a finished order. Phone numbers and links are hidden in chat. A receipt is needed to mark "paid". Payer-name match, KYC, a 500 USDT cap per order for new accounts, and banned offer types (card bills, gift cards, loans). |
| Look | ServiceNow workspace style. See `design/ui-style-guide.md`. |
| Process | **Clickable demo first.** The real build starts only after the owner approves the demo. |

## Open decisions
1. **Chains.** TON only, or add TRC20 and BEP20? Our competitors' users only use TRC20 and BEP20 (see `competitor-research.md`).
2. **Currency and payment methods.** The demo uses the placeholder "LC". If the market is India: ₹, with CDM, cardless cash (CCW) and QR cash.
3. **Auto-release rules** for silent sellers: 60 minutes plus safety checks (`competitor-research.md` §5). Not in the demo yet.
4. **Later features:** partial payments, private offer links, backup payment accounts, trader levels.

## Status
- **Demo:** Version 10, "Trust fixes 2–6".
  - **Live:** https://claude.ai/artifact/JqkPgMUcjRNGmhK5fPW15s
  - **Local:** `demo/`, see `demo/README.md`.
- **Real build:** planned in `docs/architecture/`, and waiting for demo approval.

## What the demo covers
| Area | Pages and features |
|---|---|
| Home | Hero with KPIs, live board of orders, to-dos, announcements |
| Trade | Ready now / Buy / Sell lists with filters (method, bank, city), trader badges, Locked badge, trading hours, unusual-price warning, Alert me, Quick trade |
| Order | Deal + chat page: stage arrows, countdown, pay-to details with payment reference, "I have paid" with a required receipt, release with a bot code, cancel, appeal, rating, Proof pack, bank-freeze checklist |
| My ads | Post and edit ads, fixed or floating price, trading hours, online/offline, banned-offer check |
| Wallet | Deposit (address + memo), withdraw with a code, send to a user, history, address book |
| Account | Profile with verified reviews and stats, ID check, payment methods, security (2-step login, anti-phishing code, devices), notifications, invite friends, merchant program, follow/block |
| Market | Price chart, order book, volume, price alerts |
| Help | Articles, support requests, assistant chat, "Is this really us?" checker |
| Telegram | Previews of the bot, channel and group |
| Admin | Dashboard, appeal / withdrawal / ID-check / merchant / risk queues, user and appeal records with internal notes, treasury, announcements, settings, audit log |
| Sign-in | "Log in with Telegram" screen |
