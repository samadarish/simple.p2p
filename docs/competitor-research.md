# Competitor research: OG OTC and QikCrypto

These two Telegram P2P communities are our direct competitors. Their users are mostly Indian traders who swap USDT for rupees.

- **How:** read-only in Telegram on 18 Nov 2026. Nothing was posted, nothing was reacted to, and their mini-app was not opened, because opening it shares your Telegram identity with them.
- **How much:**
  - **OG OTC:** about 3,200 messages, covering 6–16 Nov.
  - **QikCrypto:** about 500 messages from the last 5 days, plus their guides and announcements.
- **Privacy:** individual members are not named in this repo.

---

## 1. How OG OTC works
*About 1,400 members, invite-only, one admin.*

**The deal flow**
1. **Ads are plain text** in the group, for example `WTS 500$ @102 SBI CDM fee yours`.
2. **`/deal @user`** makes their bot open a numbered **deal room**.
3. The **seller sends USDT to the admin's wallet**, and the buyer pays.
4. **The admin releases the USDT by hand.**

**Rules and money**
- **Payment:** mostly **cash deposit at bank machines (CDM)** at SBI, HDFC and ICICI. **UPI is banned** because of the risk of account freezes. The wallet address is written on the CDM receipt as proof.
- **Fee:** 0.2%, minimum $1.
- **Chains:** BSC (BEP20), TRON (TRC20) and Solana.
- **Joining:** by invite or referral, after a questionnaire.
- **Daily post:** a bot posts a 24-hour summary.

**Numbers, 6–16 Nov**
- **Outcomes:** 229 deals done, 54 cancelled and 61 rooms expired. **About 1 in 3 deals fails.**
- **Speed:**
  - Half of all deals took **more than 82 minutes**.
  - 1 in 3 took more than 2 hours.
  - The slowest took 5 days.

## 2. How QikCrypto works
*697 members, new, has a Telegram mini-app.*

**The deal flow**
1. Offers list.
2. Chat before the trade.
3. **The seller locks USDT** in escrow.
4. The buyer pays.
5. The seller releases.

**Timing and disputes**
- **Auto-release 60 minutes after "Paid"** if the seller does nothing.
- A dispute freezes the order.

**Extras**
- **Payments:** partial payments and **backup payment accounts**.
- **Offers:** **private offers**, shared as a link.
- **Trader cards:** level, completion % and average time.

**Advice to users:** **film the cash slip** when paying by cash.

**Weak liquidity**
- Very few sellers. Support staff keep asking "is any seller online?"
- Many offers show as "Unavailable".

## 3. What both communities show about the market

- **Cash methods:** CDM, cardless cash withdrawal (CCW) and QR cash.
- **Chains:** everyone uses **TRC20 or BEP20** and keeps asking for swaps between them. **Nobody mentioned TON.**
- **Scams:**
  - fake admin DMs
  - WhatsApp impostors
  - edited cash slips
  - fake USDT
  - wallet-drainer links
- **Biggest fear: bank account freezes**, including by police. One "Misc" topic even sells credit-card bills at 40% off, which looks like stolen money.

---

## 4. Their gaps and our answer

| # | Their gap | Our answer | In the demo? |
|---|---|---|---|
| 1 | **The admin is the bottleneck.** He's offline after about 9pm, and buyers wait hours. | The seller releases with a bot code, which is instant. Auto-release has safety rules. The admin only handles appeals. See §5. | Seller release: yes. Auto-release rules: **not yet** |
| 2 | **Deals die.** Sellers don't lock USDT in advance, and offers show "Unavailable". | The USDT is locked when the ad goes live. A **Ready now** list, a 🔒 Locked badge, trading hours, and auto-pause after 2 missed orders. | Yes |
| 3 | **Reviews can be faked:** anyone types "thanks for the deal". | You can rate only after a finished order. Each review shows "Verified order", the order number and the measured release time. Profiles show average reply time and appeals lost. | Yes |
| 4 | **Scams happen outside the deal.** | The chat hides phone numbers, links and "WhatsApp me". The app shows the verified bank details, so nobody types them. Every order gets a payment reference, "I have paid" needs a receipt, and an **"Is this really us?"** checker flags lookalike admin accounts. | Yes |
| 5 | **Bank freezes.** | Payer-name match with KYC, and new accounts capped at 500 USDT per order. Unusual prices get a warning, card-bill and gift-card ads are blocked, and a **Proof pack** (order record, IDs, payment, receipts, chat, check code) can be shown to the bank. There is also a "My bank account was frozen" guide. | Yes |
| 6 | **Hard to find a match:** ads are spam text. | Bank and city filters, a "Same bank" tag, **Alert me** match notifications, and a 24-hour summary in our channel. | Yes |

## 5. Plan for gap #1: release without the admin

Our app is custodial: the USDT already sits in our ledger, so releasing it is only a balance change and software can do it.

1. **The seller taps Release and enters the bot code.** The USDT moves instantly, with no admin. *(In the demo.)*
2. **The seller goes quiet after the buyer pays:**
   - The bot reminds them at 10, 20 and 30 minutes.
   - At **60 minutes** it auto-releases, but **only if every check passes**:
     - a receipt is uploaded
     - the payer name matches KYC
     - the payment reference is there
     - the amount is under a set limit
   - If any check fails, an appeal opens instead. The seller can stop auto-release at any time with "Money not received".
3. **Nobody pays in time:** the USDT goes back to the seller automatically. *(In the demo.)*
4. **Withdrawals under 2,000 USDT** go out automatically from the hot wallet, and only bigger ones wait for the owner. *(In the demo.)*
5. **The owner handles only appeals,** pinged on their phone by the bot. Later: a night helper who can decide small appeals but can't move money.
6. **Sellers who don't respond** get their ads auto-paused, and their stats show it.
7. **Later and harder:** automatic bank checks, from SMS or statements.

## 6. What we copy from them

- From **OG OTC:** the **24-hour summary** post in the channel *(in the demo)*.
- From **QikCrypto:**
  - auto-release 60 minutes after "Paid", but with our safety checks
  - "film the cash slip" *(in the demo)*
- **Later:** partial payments, private offer links, backup payment accounts, and trader levels.

## 7. Open decisions this raises

- **Chains.** TON-only may block Indian traders, who use TRC20 and BEP20. Decide before the real build.
- **Currency and methods.** The demo says "LC". If India is the market, switch to ₹ with CDM, CCW and QR cash.
