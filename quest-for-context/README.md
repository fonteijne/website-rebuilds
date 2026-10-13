# The Quest for Context

A 95-second pixel-art fantasy short, built with [HyperFrames](https://github.com/heygen-com/hyperframes).
It has no dialogue: the story is told through the storyboard art, camera moves, visual effects and music.
The only on-screen text is the end title, **CONTEXT ENGINEERING · The Holy Grail of AI Engineering**.

The 32 panels from the storyboard (`assets/src/storyboard.png`) are the frames of the film. The character sheet is in
`assets/src/character-sheet.png` for reference. Each panel is cut out, has its number badge painted out, and is
upscaled 4× with xBR, a scaler made for pixel art. HyperFrames then animates the panels with camera moves,
transitions, glows, particles and a synthesized chiptune soundtrack.

## Scenes

| # | Time | Scene | What happens on screen |
|---|------|-------|------------------------|
| 1 | 0–10 s | De wereld van AI | Fade in on the chasm, pan to the chest. The crystal comes out of the backpack and glows (sparkle burst). |
| 2 | 10–22 s | De verkeerde magie | The bridge hologram flickers, then a **duck** pops in (comic "wah-wah"). A whip-cut to the big scroll. The bridge collapses with camera shake and falling debris, and the hero facepalms. |
| 3 | 22–34 s | De zoektocht begint | Dip to black, then the map with the chalice. Tilt up to the temple. A 4-cut montage (forest run, jump, falling rocks, boulder), then a flash to the temple. |
| 4 | 34–46 s | De Heilige Graal | The grail glows and builds up as he reaches for it. A white flash and **900 golden pixels** explode. Four symbols pop in one by one. |
| 5 | 46–62 s | De ontdekking | The lightbulb moment, then the four items from the backpack. Each symbol lights up as an item is placed. The light floods the temple and the frame goes to white. |
| 6 | 62–76 s | De kracht van context | Back at the chasm. The symbols orbit the crystal and a scan sweeps the gap. The bridge is built **tile by tile** (100 stones, each with a thunk). Triumph. |
| 7 | 76–85 s | De echte schat | He crosses the bridge and opens the chest. The four connected points appear, and a golden wave spreads over the world as the crystals light up. |
| 8 | 85–95 s | De onthulling | Close-up, a wink and a glint off his glasses, then a pull-back with the scarf blowing. Fade to black, and golden pixels fly in to form the title. One bright magical tone plays. |

The script gave 85–90 s for the last scene. It runs to 95 s so the pixel title has time to form and be read.

## Project layout

```
index.html                 root composition: scene hosts, overlays (flash/black/shake), particle canvas, title, audio
compositions/scene1-8.html one sub-composition per script scene (shots, camera, per-shot FX)
assets/panels/             32 upscaled panels (+ bg/ baked blurred backdrops)
assets/fx/                 pre-rendered glow / star sprites
assets/audio/soundtrack.mp3
assets/fonts/              Press Start 2P, Silkscreen (OFL)
scripts/extract_panels.py  storyboard -> assets/panels/*.png
scripts/make_music.py      numpy chiptune synth -> assets/audio/soundtrack.wav
scripts/build_index.py     SHOTS table + templates/ -> index.html + compositions/*.html
```

`index.html` and `compositions/*.html` are **generated**. To change timing, camera or effects, edit the `SHOTS`
table in `scripts/build_index.py` (or the files in `scripts/templates/`) and run the build again.

## Rebuild and render

```bash
pip install numpy pillow opencv-python-headless
python3 scripts/extract_panels.py
python3 scripts/make_music.py && ffmpeg -y -i assets/audio/soundtrack.wav -b:a 192k assets/audio/soundtrack.mp3
python3 scripts/build_index.py

npm run check                       # lint + runtime checks
npx hyperframes preview             # scrub it in HyperFrames Studio
npx hyperframes render --fps 30 -o renders/the-quest-for-context.mp4
```

Requires Node 22+ and FFmpeg.
