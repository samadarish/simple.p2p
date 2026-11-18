# simple.p2p UI style guide

Every screen of simple.p2p looks like a **ServiceNow workspace**: the Horizon design system and the "Next Experience" UI, especially the **Customer Service (CSM) agent workspace**. The owner picked this look and approved it.

> **Copy the style only.** Never use ServiceNow's name, logo, wordmark, icons, illustrations or screenshots inside the product. Our logo is the teal "⇄" mark plus the word **simple.p2p**.

- **The demo is the reference build.** It lives in `demo/src` and implements every rule here. When this guide and the demo disagree, the demo wins: fix this guide.
- **Exact values** are in [`tokens.css`](tokens.css).
- **Pictures** follow [`image-style-guide.md`](image-style-guide.md).
- **Screenshots and links** are in [`reference/`](reference/).

---

## 1. The look in five lines

1. **A dark petrol-blue top bar** (`#032B3A`). The left icon rail below it fades from petrol to teal to green.
2. **White panels on a light grey page** (`#F1F3F4`), 1px grey borders and almost no shadow.
3. **One teal for actions** (`#0081A2`). Colour otherwise only means status: green good, yellow warning, orange high, red critical, purple moderate, blue info.
4. **Packed and businesslike.** 14px body text, 13.5px tables, small line icons, sentence-case labels.
5. **Cabin** for titles, **Lato** for text, and **IBM Plex Mono** only for the small "SIMPLE.P2P / PAGE" label on page headers.

Rejected looks: rounded, colourful and friendly ("kiddish"), big airy cards, emoji-style icons, and glossy 3D pictures.

---

## 2. Tokens

| What | Value |
|---|---|
| Top bar | `--hdr #032B3A`, hover `--hdr-2 #0C3F51`, search field `--hdr-field #163F4F` |
| Primary (teal) | `--pri #0081A2`, dark `--pri-d #00566E`, darkest `--pri-dd #002C38`, light `--pri-l #BCDFE7`, lightest `--pri-ll #E8F4F7` |
| Page / panel | `--bg #F1F3F4`, `--card #FFFFFF`, `--soft #F6F8F9` |
| Lines | `--line #D9DFE2`, stronger `--line-2 #BCC4C9` |
| Text | `--text #1D262A`, `--text-2 #3D4A50`, `--muted #65727A`, links `--link #00739A` |
| Side panel | `--panel #E2EDF1`, icon bar `--iconbar #C2DCE4` |
| Left rail | `linear-gradient(180deg,#0A3A4C,#0F5466 40%,#1B7480 68%,#3B9A5A)` |
| Active-tab underline | lime `#62D84E` |
| Internal notes | pale yellow `--note #FFF8DC`, border `--note-line #EDDC98` |
| Summary card | green border `--sum-line #71BC8F`, `--sum-bg #F4FAF6` |

**Status colours.** Each level has a text colour, a background (`-bg`), a dot (`-dot`) and a border (`-line`).

| Level | Use it for | Text / dot / background |
|---|---|---|
| `pos` | done, verified, released, online | `#2F6301` / `#3F8500` / `#E0EFD3` |
| `info` | information, new, mobile money | `#005D9A` / `#0079CC` / `#DDECF9` |
| `mod` | paid and waiting for release | `#4F3BA6` / `#7A5DF0` / `#EBE6FD` |
| `warn` | locked, waiting, check this | `#5E5007` / `#C9AC10` / `#FFF6C4` |
| `high` | close to the deadline, appeal | `#7A4700` / `#FD9601` / `#FFE7C4` |
| `crit` | failed, scam alert, sell side, errors | `#A81A29` / `#E52238` / `#FCDDE0` |
| `low` | cancelled, offline, neutral | `#4A5053` / `#6D7376` / `#E6E8E9` |

**Shape**
- **Corners:** 2px for badges and pills, 6px for buttons and inputs, 8px for cards, modals and big containers, 12px for page heroes only.
- **Heights:** controls are 32px, with 28px small and 38px large buttons. The top bar is 48px and table rows are 40px.
- **Spacing:** 14px inside cards and 12–14px between blocks. Keep the page padding at 16px 20px.
- **Shadow:** none on panels. Use a shadow only for things floating above the page: menus, modals, the chat window, and the KPI cards on top of a hero.

---

## 3. App shell (every page)

```
┌ top bar (48px, dark petrol) ─────────────────────────────────────────────────┐
│ ⇄ simple.p2p  All  Favorites  History │ [Home] [maya ×] [D-2091 ×] + │ 🔍 Search  💬 ? 🔔 (Y) │
├──────┬───────────────────────────────────────────────────────────────────────┤
│ rail │ page                                                                   │
│ 52px │                                                                        │
│ icons│                                                                        │
└──────┴───────────────────────────────────────────────────────────────────────┘
```

- **Top bar:**
  - **Left:** the logo, then the text menus **All**, **Favorites** and **History**.
  - **Middle:** the record tabs.
  - **Right:** the search box, the assistant chat, help **?**, the bell with a red count badge, and an avatar circle.
- **Record tabs live in the top bar**, not in a strip below it. Every opened order, trader or page becomes a tab with a close **×**, and **+** adds one. The active tab has a lighter background and a lime underline.
- **No context pill in the middle** of the top bar. The owner removed it.
- **Favourites:**
  - A star on a tab saves that place.
  - Saved places show under **Favorites**.
  - Recently visited places show under **History**.
  - **All** lists every page.
- **Menus** open as dark panels under the top bar and dim the page behind them. Each has a filter box at the top and a pin icon. Pinning turns the menu into a fixed dark left sidebar 250px wide.
- **Left rail:** 52px of round icon buttons on the gradient, with red badges for counts. The active button is a white circle.
- **Pop-out windows** (the chat assistant, compose) dock at the bottom right. They have a dark title bar and a filled teal send button.
- **Alerts** show as a tinted bar inside the page: icon, **bold title**, text, link and **×**. Announcements use the `info` colours.
- **Toasts** appear at the bottom centre and disappear on their own.

---

## 4. Page types

Each page type copies one ServiceNow page type.

### Landing page (Home, Market, Wallet, Admin)
- **Hero header** with header art. See the image guide.
- **The KPI cards sit on top of the bottom of the hero**, overlapping it in white frosted cards. Don't leave a block of empty space under the picture. The owner asked for this.
- **KPI card layout:** title row, then a big number (Cabin 28px) with a small unit, a muted sub-line, an optional sparkline or progress bar, and a link.
- **Below the KPIs:** a live board (4 columns: Open → Locked → Paid → Done) next to a **Your to-dos** column. Your own orders are outlined in teal.

### List page (Buy, Sell, My orders, Admin queues)
- **Left list menu** (230px) of saved lists, grouped and collapsible, each with a count. The active one is tinted with a teal left bar.
- **Table area:**
  - title, search-by-column box and actions on the right
  - **filter breadcrumb** (`All > Buy > Bank transfer`), where each crumb is a link
  - **condition builder** (fields + Run) in a soft grey box
- **Dense table:**
  - checkbox column, sortable headers, the record number as a blue link, and coloured pills with a dot (`• Locked`)
  - "Actions on selected rows"
  - paging like **1 to 20 of 622**
- **On a phone** the list menu becomes a select box and every row becomes a stacked card with label–value lines.

### Record page = the order page ("Deal + chat")
The owner chose **two parts** instead of ServiceNow's three columns:
- **Left: the order.**
  - stage arrows on top (Created › You pay › Release › Completed)
  - the key numbers
  - the payment details
  - then tabs: Activity, Details, Receipts, Seller/Buyer, Help
- **Right: the chat**, always visible:
  - quick replies, receipt photos, read ticks and a "typing…" indicator
  - system events in the timeline
  - internal or admin notes in yellow
- **Title bar:** the record title on the left. On the right, outlined secondary buttons and **one** filled teal primary button (for example **I have paid** or **Release**).
- **On a phone:** an **Order | Chat** switch at the top.

### Help center
Styled like ServiceNow's Employee Center:
- a hero with a big search box
- topic cards
- articles with KB numbers (`KB0010013`)
- support requests as records
- the "Is this really us?" checker card

### Forms (post an ad, withdraw, verification)
- Labels **above** the fields, with a red `*` on required ones.
- Sections stacked in cards. Read-only values sit in grey boxes with a copy button.
- **Step-by-step flows** (ID check) use a numbered step list.
- **Risky actions** (release, withdraw) ask for the Telegram bot code.

### Admin
Landing page with KPI cards for user money, hot and cold wallet and coverage. Queues as list pages for appeals, withdrawals, ID checks, merchant requests and risk alerts. User and appeal records follow the record-page pattern.

---

## 5. Components

| Component | Rules |
|---|---|
| **Button** | 32px tall, 6px corners, 1px teal border. The default is white with teal text. `.pri` is filled teal (only one per area), `.plain` has a grey border, and `.bad` has a red border for destructive actions. |
| **Field** | 32px tall (38px and 16px text on phones), 1px `--line-2` border, teal ring on focus. |
| **Pill** (status) | 20px tall, 2px corners, tinted background, dot plus a bold 12px label. Never use colour alone: always add the word. |
| **Tag** (fact) | 20px, white with a grey border. Variants: `.ok` green, `.warn` amber, `.bad` red, for example "Same bank", "New", "Unusual price". |
| **Card** | white, 1px border, 8px corners; header row 46px tall with a Cabin 15.5px title and a count chip. |
| **Table** | 36px header, 40px rows, row hover `#F1F8FA`, numbers in tabular figures and right-aligned. |
| **Alert** | tinted bar with icon, bold title, text, link and × in one of the 7 status levels. |
| **Stage arrows** (`.flow`) | 30px chevrons joined in a row: done steps pale green with green text, the current step filled dark teal (`--pri-d`) with white text, future steps grey `#E3E9EC`, a failed step red. |
| **Timer** | rounded 30px chip with a clock, amber by default; `.ok` green when time is safe, `.low` and `.bad` when it is running out or over. |
| **Chat bubble** | theirs white with a border, yours `--pri-d` filled with white text, system or admin notes yellow. 8px corners. |
| **Modal** | centred, 8px corners, title row plus body plus button row with the primary on the right. On phones it becomes a bottom sheet. |
| **Badge** | red `#E52238` circle with white 10.5px bold text, on icons. |
| **Empty state** | short muted sentence plus one link ("Nothing to do right now. Find an ad"). No pictures. |
| **Icons** | small line icons, 1.6–2px stroke, 14–18px, in the text colour. |

---

## 6. Words

- **Plain and short.** "I have paid", "Release USDT", "Appeal". Avoid jargon and anything that sounds like marketing.
- **Sentence case** everywhere ("Open ads", not "Open Ads").
- **Numbers:** `1,250 USDT`, `3.65 LC`, `1 to 20 of 622`, and times like `4 min`.
- Say what happens next: "simple.p2p holds the USDT until the money arrives."
- **Currency:** the demo uses `LC` as the placeholder. The real currency is still open (see `docs/product-brief.md`).

---

## 7. Screen sizes

| Width | What changes |
|---|---|
| ≥1200px | the full layout |
| ≤1199px | list preview panel hidden, record side panel moves under the content, landing grid becomes one column |
| ≤980px | KPIs in 2 columns, **History** menu hidden |
| ≤760px (phone) | the rail becomes a **bottom tab bar** with labels; Favorites and search are hidden in the top bar; tables stack; modals become bottom sheets; the chat window is full width; fields grow to 38px |
| ≤420px | the logo wordmark is hidden, only the mark shows |

**Must pass at 390px, 900px and desktop:** no sideways scrolling, a 16px side gutter, and nothing hidden behind the bottom bar.

---

## 8. Owner feedback log

These are the decisions in order. Don't undo them.

1. A first, rounded and colourful demo was rejected: "looks kiddish and bad".
2. The owner chose the ServiceNow look, specifically the CSM agent workspace screen.
3. No 3-column order page. It is **order on the left, chat on the right**.
4. "Match ServiceNow in everything": colours, fonts, density, page types.
5. Pictures must look like Horizon header art (see the image guide). Two picture styles were rejected first: flat vector people, then glossy 3D glass objects.
6. The KPI blocks were moved **on top of** the hero picture, because the gap below it left too much blank space.
7. Record tabs were moved **into the top bar**. The centre "Home ★" pill was removed, and starred places show under **All / Favorites / History**.

Screenshots of points 6 and 7 are in `reference/feedback/`.

---

## 9. Checklist before you ship a UI change

- [ ] Uses tokens from `tokens.css`, with no new colours. Colour means status, and pills carry words.
- [ ] Each area has one filled primary button at most.
- [ ] Fits the page type it belongs to (landing, list, record, form, help).
- [ ] Titles in Cabin, text in Lato, numbers in tabular figures.
- [ ] Works at 390px, 900px and desktop with no sideways scroll.
- [ ] No console errors. Every button does something.
- [ ] No ServiceNow name, logo or artwork in the product.
