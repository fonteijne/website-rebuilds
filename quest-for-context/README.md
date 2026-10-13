# The Quest for Context

A 95-second pixel-art fantasy short, built with [HyperFrames](https://github.com/heygen-com/hyperframes).
It has no dialogue: the story is told through animation, expressions, music and effects. The only text is the
end title, **CONTEXT ENGINEERING · The Holy Grail of AI Engineering**.

This is a real 2D animation, not an animated storyboard. The storyboard (`assets/src/storyboard.png`) was used as a
shot reference only. Every scene is drawn and animated in code:

- **The hero** is cut from the character sheet (`assets/src/character-sheet.png` → `assets/sprites/`). That gives
  5 turnaround poses, the run, map, cheer and laptop poses, and 8 expression heads. He walks, runs, jumps,
  turns, cheers and reacts in close-ups.
- **The world** is generated as pixel art with seeded randomness: sky, clouds, mountains, the castle town, the cliffs and
  chasm with a waterfall, the forest, the temple outside and inside, torches, and the bridge stones.
- **The magic is simulated**. The crystal floats and rotates. Blocks fly in to build the duck, then the looping
  wrong bridge, which wobbles and collapses. The grail bursts into 520 gold pixels that gather into the four symbols.
  The crystal scans the gap, draws a blueprint, and the bridge is built stone by stone (146 blocks).
  A golden wave lights up the crystals around the world and makes flowers bloom.

Everything renders into a 640×360 canvas, upscaled 3× with nearest-neighbour for crisp pixels. Each frame is a pure
function of time, so HyperFrames can seek and render deterministically.

## Scenes

| # | Time | Scene | On screen |
|---|------|-------|-----------|
| 1 | 0–10 s | De wereld van AI | Tilt down from the sky and castle to the hero at the chasm, then pan to the chest. He turns and pulls a crystal from his backpack. It floats up, spins and glows. |
| 2 | 10–22 s | De verkeerde magie | A thought bubble shows a bridge, and a beam carries it to the crystal, which builds a **giant block duck**. Close-up: a sigh. The duck poofs, he unrolls a huge spell scroll, and the crystal builds a bridge that **loops back over his head**. It wobbles and collapses into the gap. Close-up: frustration. |
| 3 | 22–34 s | De zoektocht begint | A map flutters out of the backpack. Close-up of the map: a chalice, a mountain, and the path drawing itself. He looks up, and the camera tilts to the temple on the peak. Montage: running through the forest, jumping between rocks, dodging falling stones, outrunning a boulder. He climbs the temple steps. |
| 4 | 34–46 s | De Heilige Graal | Torch-lit hall with the grail floating in a beam of light. He walks in, reaches out, and it **explodes into golden pixels**. They swirl into four symbols: target, book, clock, tools. Close-ups: surprised, then a confident smile. |
| 5 | 46–62 s | De ontdekking | The lightbulb moment. Four items pop out of the backpack: the bridge drawing, the measurements, the book of failed attempts, the toolbox. Each flies into its symbol. Golden beams link them into one emblem, the chaotic particles settle into ordered orbits, and light floods the temple. |
| 6 | 62–76 s | De kracht van context | The same crystal again, now with the four symbols orbiting it. It scans the gap, measures it and projects a blueprint. The bridge is built **stone by stone**. He jumps for joy, and a close-up shows him laughing. |
| 7 | 76–85 s | De echte schat | He crosses the bridge and opens the chest. The emblem (four connected points around a core) rises, and a golden wave spreads. The camera pulls back as crystals across the world light up and flowers bloom. |
| 8 | 85–95 s | De onthulling | A close-up grin, then a wink with a glint on his glasses. Sunset wide shot with his scarf blowing in the wind. Fade to black, golden pixels form the title, and one bright magical tone plays. |

The script set 85–90 s for the last scene. It runs to 95 s so the pixel title has time to form and be read.

## Project layout

```
index.html                 HyperFrames root: shot list, transitions, flash/black overlays, gold-pixel title, audio
src/engine.js              pixel primitives, camera, sprite drawing, seeded RNG
src/art.js                 procedural backgrounds + props (crystal, duck, blocks, chest, grail, symbols, items…)
src/scenes.js              the choreography of every shot, as draw(t)
assets/sprites/            hero poses + expression heads cut from the character sheet
assets/audio/soundtrack.mp3
assets/fonts/              Press Start 2P, Silkscreen (OFL)
assets/src/                the original storyboard + character sheet
scripts/extract_sprites.py character sheet -> assets/sprites/*.png
scripts/make_music.py      numpy chiptune synth (music + SFX cued to the animation)
```

## Build and render

```bash
pip install numpy pillow opencv-python-headless
python3 scripts/extract_sprites.py
python3 scripts/make_music.py && ffmpeg -y -i assets/audio/soundtrack.wav -b:a 192k assets/audio/soundtrack.mp3

npm run check                       # lint + runtime checks
npx hyperframes preview             # scrub it in HyperFrames Studio
npx hyperframes render --fps 30 -o renders/the-quest-for-context.mp4
```

Requires Node 22+ and FFmpeg.
