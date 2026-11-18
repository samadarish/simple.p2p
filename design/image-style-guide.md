# simple.p2p image style guide

This guide covers how to make more pictures that match the 10 approved ones in `demo/img/`.

## 1. What the pictures look like

They are **abstract header art**, like the hero images on ServiceNow's Horizon design-system site. Three screenshots of the originals are in [`reference/horizon-style/`](reference/horizon-style/).

**Do**
- Use **big, bold, overlapping shapes that fill the whole frame** edge to edge: discs, arcs, rings, bands.
- Use **smooth painterly gradients** with a **visible fine film grain**.
- Add a few **thin straight guide lines**, **thin circle outlines** and **small dots**, the Horizon signature.
- Keep it mostly flat, with soft depth and soft light.
- Only **hint** at the page's subject through the shapes: a coin and a banknote for Home, rings for the Wallet, a keyhole for Security.
- Keep the **left third calm and light** (cream fading to pale aqua), because the title sits there.
- Use **our colours only:**

| Colour | Hex |
|---|---|
| deep navy | `#032D42` |
| dark teal | `#00566E` |
| teal | `#0081A2` |
| aqua | `#8FD3E2` |
| pale aqua | `#D7EEF2` |
| lime green | `#62D84E` |
| soft mint | `#C9F2D6` |
| warm cream glow | `#FBF7EC` |

**Don't**
- No glossy 3D glass objects floating in the middle. That style was rejected.
- No flat-vector people or clip art. Also rejected.
- No text, letters, numbers, logos, people or hands.
- No Horizon purple, pink or red: those are ServiceNow's picture colours. We keep the same style in our own colours.
- No pictures in small cards, empty states or the rating box. Pictures go **only in page headers**.

## 2. Where pictures go

A picture is the **background of the page header** (`.hero`):
- It is pinned to the right.
- A cream gradient fades it out behind the title on the left.
- On phones it becomes a band above the title.

```html
<section class="hero sm">
  <div class="hero-art" style="background-image:url(img/wallet.jpg)" aria-hidden="true"></div>
  <div class="hero-t">
    <p class="eyebrow">simple.p2p / Wallet</p>
    <h1>Your wallet</h1>
    <p>One line that says what this page is for.</p>
  </div>
</section>
```

The CSS is in `demo/src/p2b-css.html`, and a copy is in `tokens.css`. In the demo, `hero(art, eyebrow, title, text, extra, big)` in `demo/src/j1-data.js` builds this markup.

**Pages using a picture now:**

| Page | Image |
|---|---|
| Home | hero |
| Market | market |
| Wallet | wallet |
| Help center | help |
| Verification | kyc |
| Security | security |
| Invite friends | referral |
| Merchant program | merchant |
| Telegram | telegram |
| Sign-in screen | signin, as a full-screen background |

## 3. Making a new picture

You need Codex CLI with its image tool, signed in.

```bash
# 1. Generate (writes design/images/new/<name>.png, 1536x1024)
bash design/tools/gen-image.sh appeals "Hint of fairness: a large balance shape made of two broad arcs on a thin vertical guide line, with small dots at each end."

# 2. Look at it. Regenerate if it breaks a rule above (delete the PNG first; the script skips existing files).

# 3. Convert it for the web (writes demo/img/<name>.jpg, 1600px wide, JPEG quality 78)
powershell -ExecutionPolicy Bypass -File design/tools/resize-images.ps1 appeals

# 4. Use it in a page header: hero('appeals', 'simple.p2p / Appeals', 'Appeals', 'One line of text')
```

To **regenerate an existing picture**, run `bash design/tools/gen-image.sh hero` with no subject. The script already has the subject prompt for each of the 10 pictures (see below).

**Prompt rules**
- Write only the **subject hint** ("Hint of …: shapes …"). The script adds the fixed style text below, so every picture shares one style.
- Keep prompts generic. Never put the owner's name, email or any personal or company details into a prompt: prompts are sent to an outside service.

### The fixed style text (sent with every prompt)

> Style: abstract header artwork like the hero images on a modern software design-system website. Large bold overlapping shapes that fill the whole frame edge to edge, smooth painterly gradients, a clearly visible fine film-grain noise texture, a few thin straight guide lines and thin concentric circle outlines, and a few small dots. Mostly flat with soft depth and soft light. NOT a 3D icon, NOT glossy glass, NOT clip-art, nothing sitting in the middle of an empty background. The subject is only hinted through the shapes. Colours only: deep navy #032D42, dark teal #00566E, teal #0081A2, aqua #8FD3E2, pale aqua #D7EEF2, lime green #62D84E, soft mint #C9F2D6, and a warm cream glow #FBF7EC. No text, no letters, no numbers, no logos, no people, no hands. Wide landscape 1536x1024. The left third is calm, light and soft (cream fading to pale aqua) with almost no shapes; the bold shapes live in the right two thirds.

### Subject hints of the approved pictures

| Name | Subject hint |
|---|---|
| hero | Hint of an exchange between two people: two large overlapping discs, one solid like a coin and one striped like a banknote, with broad flowing arcs sweeping between them. |
| help | Hint of conversation and help: several large rounded speech-bubble forms overlapping like cut paper, with thin concentric circles radiating from one of them. |
| market | Hint of a market chart: large sweeping fan-shaped arc segments and rising stepped bands, thin concentric circles and small dots along an upward curve. |
| wallet | Hint of a safe vault: a very large set of concentric rings and thick ring segments, layered, with a soft warm glow at the centre. |
| kyc | Hint of an identity card: a large rounded rectangle form with a circular cut-out and a few soft horizontal bands, crossed by thin guide grid lines. |
| security | Hint of protection: a large arch or shield-like form built from overlapping translucent bands, with a small keyhole-shaped light at its heart. |
| referral | Hint of friends connected: three overlapping circles of different sizes linked by thin arcs, like a small network, with a few small dots. |
| merchant | Hint of a verified badge: a large rosette made of overlapping petal-like arc segments, with a small burst of light at its centre. |
| telegram | Hint of a message being sent: a large folded paper-plane form made of flat overlapping triangles, soaring diagonally upward with thin trailing lines. |
| signin | Hint of an entrance: a tall arched doorway seen in perspective, glowing with soft light inside, with thin light rays and a faint floor grid. |

## 4. Check every new picture

- [ ] Shapes fill the frame, and nothing floats in an empty background.
- [ ] Grain, thin lines and circles, and small dots are visible.
- [ ] It uses our colours only.
- [ ] The left third is calm enough for a dark title to stay readable.
- [ ] It has no text, logos or people.
- [ ] It looks like part of the same family as `demo/img/hero.jpg`.
- [ ] Final file is `demo/img/<name>.jpg`, 1600px wide, around 150 KB (the approved ones are 130–160 KB).

## 5. History

| Try | Style | Result |
|---|---|---|
| 1 | Flat vector illustrations with simple people | Rejected: not the style of the reference screenshots |
| 2 | One glossy 3D glass object in the centre | Rejected: "does not look or match" |
| 3 | Full-frame abstract shapes with grain, used as the header background | **Approved**, and in use now |

The three unused pictures from try 2 (dispute, empty, success) are kept in `images/archive/` only for comparison.
