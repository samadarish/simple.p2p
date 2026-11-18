# Instructions for AI assistants working on simple.p2p

simple.p2p is a P2P marketplace for buying and selling USDT for local money, with Telegram built in. The current work is a **clickable front-end demo** in `demo/`. The real build starts only after the owner approves the demo.

## Read before you change anything
1. [`docs/product-brief.md`](docs/product-brief.md): what we're building, the decisions already made, and the open ones.
2. [`design/ui-style-guide.md`](design/ui-style-guide.md): **the UI rules. Every screen must follow them.**
3. [`design/image-style-guide.md`](design/image-style-guide.md): how pictures look and how to make new ones.
4. [`docs/competitor-research.md`](docs/competitor-research.md): what competitors do and the gaps we beat them on.
5. [`demo/README.md`](demo/README.md): how the demo is built, and which file does what.

## UI rules (summary; the full rules are in the style guide)
- **Look like a ServiceNow workspace** (Horizon / Next Experience, CSM agent workspace): dark petrol top bar, gradient icon rail, white panels on light grey, teal actions, dense tables, Cabin + Lato fonts.
- **Style only.** Never use ServiceNow's name, logo, icons, artwork or screenshots in the product.
- **Use the tokens** in `design/tokens.css`, the same as `demo/src/p1-head.html`. Don't invent colours. Colour means status, and status pills always carry a word.
- **Use the existing page types:** landing, list, record (order = **deal on the left, chat on the right**), form, help center, admin.
- **Keep the owner's decisions** (style guide §8):
  - the record tabs live in the top bar
  - there is no centre pill
  - favourites go under All / Favorites / History
  - KPI cards sit on top of the hero picture
  - no 3-column order page
- **No rounded, playful or colourful "friendly" UI.** The owner rejected it.
- **Pictures:** full-frame abstract header art in our navy, teal and green. No glossy 3D objects and no people.
- **It must work at 390px, 900px and desktop** with no sideways scroll and no console errors.

## Working on the demo
- **Edit:** `demo/src/`, then run `node demo/build.js`.
- **Preview:** `node demo/serve.js`, then open http://127.0.0.1:5174, or `/phone` for phone and tablet.
- **Test:** click through the flows you touched: buy, sell, appeal, admin.
- **Publish:** the published demo is the Artifact at https://claude.ai/artifact/JqkPgMUcjRNGmhK5fPW15s. Republish `demo/simple-p2p-demo.html` to that same link, with the `img/` files.

## Privacy and safety
- **Never send the owner's personal details** (name, email, accounts) to outside services. That includes image-generation prompts, web requests and API calls. Keep prompts generic.
- **Don't name individual competitor community members** in docs or code.
- **Telegram research is read-only:** no posting, no reactions, and don't open competitors' mini-apps.
- **Ask before you commit, push, or publish anything.**

## How to talk to the owner
- Short, chunked replies. Plain words and no jargon.
- **One question at a time**, with a recommendation.
- Show results (a link or a screenshot) instead of describing them at length.
