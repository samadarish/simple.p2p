# simple.p2p clickable demo

This is a front-end-only demo with sample data: no real money, accounts or servers. Every button works inside the demo.

## Open it
- **Quickest:** double-click `demo/index.html`.
- **With live rebuild:** `node demo/serve.js`, then open http://127.0.0.1:5174. Each page load rebuilds from `src/`. **http://127.0.0.1:5174/phone** shows phone (390px) and tablet (900px) side by side.
- **Online:** https://claude.ai/artifact/JqkPgMUcjRNGmhK5fPW15s (Version 10).

## Change it
1. Edit files in `demo/src/`.
2. Run `node demo/build.js`. It checks the JavaScript and writes:
   - `index.html`: the full page
   - `simple-p2p-demo.html`: the page body that gets published as the Artifact
3. Check it at desktop, tablet (900px) and phone (390px): no sideways scrolling and no console errors.
4. Follow `design/ui-style-guide.md` for every UI change.

## Files in `src/`
The files are joined in this order, and the scripts share one scope.

| File | What's in it |
|---|---|
| `p1-head.html` | `<title>`, fonts, **design tokens** (`:root`), base styles, top bar, rail, tabs, buttons, fields, pills, alerts |
| `p2-css.html` | Landing pages (KPIs, live board, to-dos), list pages, tables |
| `p2b-css.html` | Order page (stage arrows, timer, chat), hero header art, trust and safety pieces (Locked badge, verified reviews, checklists, Proof pack, match alerts) |
| `p3-shell.html` | Menu overlays, popovers, chat window, modals, toasts, **screen-size rules**, page markup shell |
| `j1-data.js` | Sample data: traders, ads, orders, reviews, banks, cities, articles; helpers (`img`, `hero`, `SCAMRX`, `BANNED`) |
| `j2-shell.js` | Router, top bar, menus, tabs, favourites, history, rail |
| `j3-list.js` | Shared list-page builder (left menu, crumbs, condition builder, table, paging) |
| `j4-trade.js` | Home, Buy/Sell lists, Ready now, filters, safety checks, start-order dialog, match alerts |
| `j5-order.js` | Order page (deal + chat), order engine, simulated counterpart, reviews, Proof pack |
| `j6-ads.js` | My ads, post/edit ad form, banned-offer check |
| `j7-wallet.js` | Wallet: deposit, withdraw, send, history, address book |
| `j8-account.js` | Profile, verification, payments, security, notifications, invite, merchant |
| `j9-help.js` | Help center, articles, support requests, "Is this really us?" checker |
| `j10-market.js` | Market: chart, order book, best prices |
| `j11-admin.js` | Admin: dashboard, queues, records, treasury, settings, audit |
| `j12-telegram.js` | Telegram bot, channel and group previews; notifications page |
| `j13-modals.js` | All dialogs (paid confirm, release code, appeal, Proof pack, Alert me…), toasts and notifications |
| `j14-actions.js` | Click handlers (`data-a` / `data-x` attributes), timers, and the live board that moves on its own |

Images live in `demo/img/`. See `design/image-style-guide.md` to make more.

## Things to try
1. **Trade › Buy › Ready now.** Buy from **maya**, type 500, then **I have paid**. You must add a receipt. She releases in about 10 seconds; then rate her.
2. **Buy from river.** He tries "Faster on WhatsApp…" and the chat hides it. He doesn't release, so **Appeal**, then decide it in **Admin › Appeals**.
3. **Sell to northdesk.** When he pays, tap **Release** and use **Fill it in (demo)** for the bot code.
4. **Order › Details › Proof pack.** This is what you'd show your bank.
5. **Alert me** on the Buy list. A matching ad appears about 7 seconds later.
6. **kai_new's** cheap ad shows the "Unusual price" and "New account" warnings.
7. **Help › "Is this really us?"** Try `@simplep2p_admln`.
8. **User menu (Y) › Sign out** shows the sign-in screen.
