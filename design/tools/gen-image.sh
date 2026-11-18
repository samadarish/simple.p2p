#!/usr/bin/env bash
# Generate simple.p2p header art with Codex CLI, in the approved style.
#
#   bash design/tools/gen-image.sh <name> ["Hint of ...: subject shapes ..."]
#   bash design/tools/gen-image.sh hero            # regenerate an approved picture from its saved hint
#   bash design/tools/gen-image.sh hero wallet kyc # several approved pictures, 3 at a time
#
# Output: design/images/new/<name>.png (1536x1024). Then run resize-images.ps1 <name>.
# Existing PNGs are skipped: delete one to regenerate it.
# Keep prompts generic: no personal or company details (they go to an outside service).
# Rules: design/image-style-guide.md

set -u
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
OUT="$ROOT/design/images/new"
mkdir -p "$OUT"

STYLE="Style: abstract header artwork like the hero images on a modern software design-system website. Large bold overlapping shapes that fill the whole frame edge to edge, smooth painterly gradients, a clearly visible fine film-grain noise texture, a few thin straight guide lines and thin concentric circle outlines, and a few small dots. Mostly flat with soft depth and soft light. NOT a 3D icon, NOT glossy glass, NOT clip-art, nothing sitting in the middle of an empty background. The subject is only hinted through the shapes. Colours only: deep navy #032D42, dark teal #00566E, teal #0081A2, aqua #8FD3E2, pale aqua #D7EEF2, lime green #62D84E, soft mint #C9F2D6, and a warm cream glow #FBF7EC. No text, no letters, no numbers, no logos, no people, no hands. Wide landscape 1536x1024. The left third is calm, light and soft (cream fading to pale aqua) with almost no shapes; the bold shapes live in the right two thirds."

declare -A P
P[hero]="Hint of an exchange between two people: two large overlapping discs, one solid like a coin and one striped like a banknote, with broad flowing arcs sweeping between them."
P[help]="Hint of conversation and help: several large rounded speech-bubble forms overlapping like cut paper, with thin concentric circles radiating from one of them."
P[market]="Hint of a market chart: large sweeping fan-shaped arc segments and rising stepped bands, thin concentric circles and small dots along an upward curve."
P[wallet]="Hint of a safe vault: a very large set of concentric rings and thick ring segments, layered, with a soft warm glow at the centre."
P[kyc]="Hint of an identity card: a large rounded rectangle form with a circular cut-out and a few soft horizontal bands, crossed by thin guide grid lines."
P[security]="Hint of protection: a large arch or shield-like form built from overlapping translucent bands, with a small keyhole-shaped light at its heart."
P[referral]="Hint of friends connected: three overlapping circles of different sizes linked by thin arcs, like a small network, with a few small dots."
P[merchant]="Hint of a verified badge: a large rosette made of overlapping petal-like arc segments, with a small burst of light at its centre."
P[telegram]="Hint of a message being sent: a large folded paper-plane form made of flat overlapping triangles, soaring diagonally upward with thin trailing lines."
P[signin]="Hint of an entrance: a tall arched doorway seen in perspective, glowing with soft light inside, with thin light rays and a faint floor grid."

command -v codex >/dev/null || { echo "codex CLI not found. Install and sign in to Codex first."; exit 1; }

gen() {
  local name="$1" hint="$2"
  if [ -s "$OUT/$name.png" ]; then echo "skip $name (exists)"; return; fi
  ( cd "$OUT" && timeout 900 codex exec --skip-git-repo-check --ephemeral -s workspace-write -C . \
    "Use your image generation tool to create ONE image, then save the final PNG file into the current working directory as $name.png (copy it from wherever the tool stores it; do not resize). Do nothing else.

$hint $STYLE" > "log-$name.txt" 2>&1 )
  if [ -s "$OUT/$name.png" ]; then echo "done $name -> design/images/new/$name.png"; rm -f "$OUT/log-$name.txt"
  else echo "FAILED $name (see design/images/new/log-$name.txt)"; fi
}

[ $# -eq 0 ] && { sed -n 2,12p "$0"; exit 1; }

# <name> "<hint>": one picture with its own subject hint (the second argument is not a saved name).
if [ $# -eq 2 ] && [ -z "${P[$2]+x}" ]; then gen "$1" "$2"; exit; fi

# Approved pictures by name, 3 at a time.
i=0
for n in "$@"; do
  if [ -z "${P[$n]+x}" ]; then echo "no saved hint for '$n': pass one, e.g. gen-image.sh $n \"Hint of ...\""; continue; fi
  gen "$n" "${P[$n]}" & i=$((i+1)); [ $((i%3)) -eq 0 ] && wait
done
wait
