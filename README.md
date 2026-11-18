# simple.p2p

A P2P marketplace to buy and sell USDT for local money (bank, mobile money or cash), with a Telegram bot, channel and group built in. It looks like a ServiceNow workspace.

**Right now:** a clickable demo for approval. The real build comes after.

## See the demo
- **Open `demo/index.html`** in a browser, or
- run `node demo/serve.js` and go to http://127.0.0.1:5174 (add `/phone` for phone and tablet views), or
- online: https://claude.ai/artifact/JqkPgMUcjRNGmhK5fPW15s

## What's where

| Folder | What's in it |
|---|---|
| `demo/` | The demo: `index.html` to open, `src/` the source, `img/` the pictures, `build.js` and `serve.js` |
| `design/ui-style-guide.md` | **UI rules**: colours, fonts, layout, components, owner decisions, checklist |
| `design/image-style-guide.md` | **Picture rules** and how to make new pictures with Codex |
| `design/tokens.css` | Every colour, font and size as CSS variables |
| `design/tools/` | `gen-image.sh` (make a picture) and `resize-images.ps1` (convert it for the web) |
| `design/reference/` | ServiceNow style screenshots, the owner's feedback screenshots, and links |
| `docs/product-brief.md` | What we're building, decisions made, open decisions |
| `docs/competitor-research.md` | How OG OTC and QikCrypto work, their gaps, and our answers |
| `docs/architecture/` | Notes for the real build: stack and custody design |
| `AGENTS.md` / `CLAUDE.md` | Instructions so any AI keeps the same look and rules |

## Make a new picture
```bash
bash design/tools/gen-image.sh appeals "Hint of fairness: a large balance shape made of two broad arcs on a thin vertical guide line."
powershell -ExecutionPolicy Bypass -File design/tools/resize-images.ps1 appeals
```
Details: [`design/image-style-guide.md`](design/image-style-guide.md).
