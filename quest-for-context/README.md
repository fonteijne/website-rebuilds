# The Quest for Context

A 95-second 3D animated short, rendered with [HyperFrames](https://github.com/heygen-com/hyperframes) and Three.js.
It has no dialogue. The story is told through the hero's acting, the camera, the effects and the music. The only
text is the end title, **CONTEXT ENGINEERING · The Holy Grail of AI Engineering**.

Every asset is built in code. There are no images, sprites or models from outside. The storyboard and character
sheet in `assets/src/` were used only as a design reference.

- **The hero** (`src3d/hero.js`) is a rigged low-poly character made from primitives: spiky brown hair, black glasses,
  a red scarf, a white shirt, leather harness and boots, blue trousers, a backpack and a sword.
  - The skeleton runs hips → spine → chest → neck → head, plus shoulder, elbow and wrist joints and hip, knee and ankle joints.
  - The face rig has blinking eyes, happy-closed eyes and a wink, eyebrows, and mouths for smile, smirk, grin, open, frown and flat.
  - The scarf tail is a chain of joints that sways and streams in the wind.
  - He is animated with keyframed poses and procedural walk and run cycles. His gestures are reaching, facepalming, sighing, kneeling, jumping, ducking, cheering, pushing up his glasses and winking. The facepalm and glasses angles were solved with a small inverse-kinematics search.
- **The worlds** (`src3d/worlds.js`) are generated with seeded randomness:
  - **The chasm:** two plateaus split by a deep canyon, with a river, a waterfall, trees, a castle on a hill, snowy mountains, the temple peak, drifting clouds and birds.
  - **The montage trail:** a forest, rock pillars over a void, a rock-fall cliff, a boulder slope, and the temple stairs.
  - **The temple hall:** a torch-lit hall with pillars, an altar, a shaft of light and floating dust.
- **The props and effects** (`src3d/props.js`):
  - the crystal, with glow, light and a sparkle ring
  - the treasure chest, with a hinged lid
  - a voxel duck made of 354 cubes
  - the looping wrong bridge, which collapses with simple physics
  - the stone-arch bridge, built from 522 blocks
  - the grail, which explodes into 600 gold cubes
  - the four symbols, the emblem, the items, the scroll, and a map that draws itself
  - the scanning cone, the dimension lines and the blueprint ghost
  - flowers, light pillars and a golden wave

The scene renders at 960×540 and is upscaled ×2 with nearest-neighbour, which gives a crisp pixel-art finish on top of toon shading.
Every frame is a pure function of time, so HyperFrames can seek and render deterministically.

## Scenes

| # | Time | Scene | What happens |
|---|------|-------|--------------|
| 1 | 0–10 s | De wereld van AI | A crane shot down from the castle and mountains to the hero at the chasm. The camera flies over the canyon to the chest. He reaches into his backpack, takes out the crystal, and it floats up glowing. |
| 2 | 10–22 s | De verkeerde magie | He projects a bridge drawing into the crystal, which builds a **giant voxel duck**. Close-up: a long sigh and a head shake. He unrolls a huge blueprint scroll. The crystal builds a bridge that **loops back over his head**. It wobbles and collapses as he ducks. Close-up: a facepalm under his own little rain cloud. |
| 3 | 22–34 s | De zoektocht begint | A map flutters out of the backpack. Close-up of the map as the path draws itself to a chalice on a mountain. He looks up, and far away the temple lights up. Montage: running through the forest, leaping between rock pillars, dodging falling rocks, outrunning a boulder. He climbs the temple stairs at dusk. |
| 4 | 34–46 s | De Heilige Graal | He walks carefully into the torch-lit hall. The grail floats in a beam of light. He reaches out, and it **explodes into 600 golden cubes**. He is blown back. The cubes swirl into four symbols: target, book, clock, tools. Close-up: surprise, then a confident smile. |
| 5 | 46–62 s | De ontdekking | A lightbulb pops on, and he has an idea. He takes off his backpack, kneels, and four items pop out: the bridge drawing, the measurements, the book of failed attempts, the toolbox. Each flies into its symbol. Golden beams link them into one emblem, the chaotic sparks settle into ordered orbits, and light floods the hall. |
| 6 | 62–76 s | De kracht van context | Back at the chasm, the **same crystal** rises, now with the four symbols orbiting it. It scans the gap, measures it (10 m) and projects a blueprint. The bridge is built **stone by stone**. He jumps for joy. Close-up: laughing. |
| 7 | 76–85 s | De echte schat | He walks across the bridge and opens the chest. The emblem (four connected points around a core) rises and bursts into a golden wave. Crystals across the world light up with pillars of light, flowers bloom, and the sky turns gold. |
| 8 | 85–95 s | De onthulling | A golden-hour close-up and a grin. He pushes up his glasses, they glint, and he winks. Pull back to a sunset wide shot, his scarf streaming in the wind. Fade to night, and gold pixels form the title. One bright magical tone plays. |

The script set 85–90 s for the last scene. It runs to 95 s so the title has time to form and be read.

## Project layout

```
index.html               HyperFrames root: renderer, pixel upscale, flash/black overlays, gold-pixel title, audio
src3d/core.js            math, seeded RNG, toon materials, geometry builder (merges low-poly pieces), sky shader
src3d/hero.js            the rigged character + pose/animation system (poses, keyframe tracks, gait, blinks)
src3d/props.js           crystal, chest, voxel duck, blocks, symbols, emblem, grail, items, scroll, map, torches…
src3d/worlds.js          the chasm, the trail, the temple hall
src3d/film.js            the shot list: cameras, the hero's performance, effects, per frame
vendor/                  three.js r181 (MIT), loaded locally so renders need no network
assets/audio/            soundtrack (generated by scripts/make_music.py)
assets/fonts/            Press Start 2P, Silkscreen (OFL) for the end title
assets/src/              the original storyboard + character sheet (reference only)
```

## Build and render

```bash
pip install numpy
python3 scripts/make_music.py && ffmpeg -y -i assets/audio/soundtrack.wav -b:a 192k assets/audio/soundtrack.mp3

npm run check                       # lint + runtime checks
npx hyperframes preview             # scrub it in HyperFrames Studio
npx hyperframes render --fps 30 -o renders/the-quest-for-context-3d.mp4
```

Requires Node 22+ and FFmpeg.
