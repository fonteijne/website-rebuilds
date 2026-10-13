"""Synthesise the soundtrack for The Quest for Context (deterministic, numpy only).

120 BPM -> 1 beat = 0.5 s, 1 bar = 2 s. Section cues follow the script:
  0-22  playful 8-bit RPG (C major)          | duck "wah-wah" @13, collapse @19.6
 22-34  adventurous build (A minor, drums)   |
 34-46  temple mystery                       | grail explodes @39.5
 46-62  discovery, rising arpeggios          | light floods temple ~60
 62-76  climax: bridge construction          | stone thunks 70.4-72.8
 76-85  celebration, the world blooms        |
 85-95  soft reprise, one bright magical tone at 91.2
Writes assets/audio/soundtrack.wav
"""
import os, wave
import numpy as np

SR = 44100
DUR = 95.0
N = int(SR * DUR)
BEAT = 0.5
rng = np.random.default_rng(7)

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets/audio/soundtrack.wav")
os.makedirs(os.path.dirname(OUT), exist_ok=True)

L = np.zeros(N)
R = np.zeros(N)
VERB = np.zeros(N)  # reverb send (mono)


def hz(m):
    return 440.0 * 2 ** ((m - 69) / 12)


NOTE = {n: i for i, n in enumerate(["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"])}


def m(name):
    """'C4' -> 60, 'A#3' -> 58"""
    p, o = name[:-1], int(name[-1])
    return 12 * (o + 1) + NOTE[p]


def env(n, a=0.005, d=0.08, s=0.6, r=0.06):
    t = np.arange(n) / SR
    dur = n / SR
    e = np.ones(n) * s
    a_n = max(1, int(a * SR))
    e[:a_n] = np.linspace(0, 1, a_n)
    d_n = int(d * SR)
    if d_n > 0:
        seg = e[a_n:a_n + d_n]
        e[a_n:a_n + len(seg)] = 1 - (1 - s) * np.linspace(0, 1, len(seg))
    r_n = int(r * SR)
    if r_n > 0 and n > r_n:
        e[-r_n:] *= np.linspace(1, 0, r_n)
    return e


def osc(kind, f, n, duty=0.5, phase0=0.0):
    t = np.arange(n) / SR
    if callable(f):
        ph = np.cumsum(f(t)) / SR + phase0
    else:
        ph = f * t + phase0
    x = ph % 1.0
    if kind == "square":
        return np.where(x < duty, 1.0, -1.0)
    if kind == "tri":
        return 4 * np.abs(x - 0.5) - 1
    if kind == "saw":
        return 2 * x - 1
    if kind == "sine":
        return np.sin(2 * np.pi * ph)
    raise ValueError(kind)


def put(sig, start, gain=1.0, pan=0.0, verb=0.0):
    i = int(start * SR)
    if i >= N:
        return
    sig = sig[: N - i]
    gl = gain * np.sqrt((1 - pan) / 2) * np.sqrt(2)
    gr = gain * np.sqrt((1 + pan) / 2) * np.sqrt(2)
    L[i:i + len(sig)] += sig * gl
    R[i:i + len(sig)] += sig * gr
    if verb:
        VERB[i:i + len(sig)] += sig * gain * verb


# ---------------------------------------------------------------- instruments
def lead(t, midi, beats, gain=0.13, duty=0.25, pan=0.1, verb=0.25, vib=True):
    n = int(beats * BEAT * SR)
    f0 = hz(midi)
    if vib:
        f = lambda tt: f0 * (1 + 0.006 * np.sin(2 * np.pi * 5.5 * tt) * np.clip((tt - 0.15) * 4, 0, 1))
    else:
        f = f0
    s = osc("square", f, n, duty) * env(n, 0.004, 0.1, 0.55, 0.05)
    put(s, t, gain, pan, verb)


def brass(t, midi, beats, gain=0.07, pan=-0.1, verb=0.3):
    n = int(beats * BEAT * SR)
    f0 = hz(midi)
    s = sum(osc("saw", f0 * d, n, phase0=k * 0.31) for k, d in enumerate([1.0, 1.004, 0.996]))
    # simple one-pole low-pass that opens with the attack ("brassy")
    e = env(n, 0.04, 0.2, 0.75, 0.12)
    s = lowpass(s, 900 + 2600 * e) * e
    put(s / 3, t, gain, pan, verb)


def lowpass(x, cutoff):
    cutoff = np.broadcast_to(cutoff, x.shape)
    a = 1 - np.exp(-2 * np.pi * cutoff / SR)
    y = np.empty_like(x)
    acc = 0.0
    for i in range(len(x)):  # short notes only; fine in pure python
        acc += a[i] * (x[i] - acc)
        y[i] = acc
    return y


def bass(t, midi, beats, gain=0.16, verb=0.0):
    n = int(beats * BEAT * SR)
    s = osc("tri", hz(midi), n) * env(n, 0.003, 0.05, 0.85, 0.03)
    put(s, t, gain, 0.0, verb)


def arp(t, midi, beats, gain=0.06, duty=0.125, pan=-0.35, verb=0.35):
    n = int(beats * BEAT * SR)
    s = osc("square", hz(midi), n, duty) * env(n, 0.002, 0.06, 0.25, 0.03)
    put(s, t, gain, pan, verb)


def bell(t, midi, dur=2.0, gain=0.12, pan=0.0, verb=0.6):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = hz(midi)
    mod = np.sin(2 * np.pi * f * 3.5 * tt) * 2.2 * np.exp(-tt * 3)
    s = np.sin(2 * np.pi * f * tt + mod) * np.exp(-tt * 2.2)
    s *= np.minimum(1, tt / 0.003)
    put(s, t, gain, pan, verb)


def pad(t, midis, dur, gain=0.05, verb=0.5, bright=0.0):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    s = np.zeros(n)
    for k, mm in enumerate(midis):
        for d in (0.997, 1.003):
            ph = (hz(mm) * d * tt + 0.17 * k) % 1.0
            s += (2 * np.abs(2 * ph - 1) - 1) * (1 - bright) + (2 * ph - 1) * bright * 0.5
    a = min(0.8, dur / 3)
    e = np.minimum(1, tt / a) * np.minimum(1, (dur - tt) / min(0.9, dur / 3))
    put(s * e / len(midis), t, gain, 0.0, verb)


def noise(n):
    return rng.uniform(-1, 1, n)


def kick(t, gain=0.5):
    n = int(0.22 * SR)
    tt = np.arange(n) / SR
    f = 150 * np.exp(-tt * 28) + 45
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 14)
    put(s, t, gain)


def snare(t, gain=0.22, verb=0.2):
    n = int(0.2 * SR)
    tt = np.arange(n) / SR
    s = noise(n) * np.exp(-tt * 18) + 0.4 * np.sin(2 * np.pi * 190 * tt) * np.exp(-tt * 25)
    put(s, t, gain, 0.05, verb)


def hat(t, gain=0.05, open_=False):
    n = int((0.18 if open_ else 0.05) * SR)
    tt = np.arange(n) / SR
    x = noise(n)
    x = np.diff(np.concatenate([[0], x]))  # crude high-pass
    s = x * np.exp(-tt * (14 if open_ else 60))
    put(s, t, gain, 0.3)


def tom(t, midi, gain=0.3):
    n = int(0.35 * SR)
    tt = np.arange(n) / SR
    f = hz(midi) * (1 + 0.6 * np.exp(-tt * 20))
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-tt * 9)
    put(s, t, gain, -0.2, 0.2)


def crash(t, gain=0.18, dur=2.5):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    x = np.diff(np.concatenate([[0], noise(n)]))
    put(x * np.exp(-tt * 1.8), t, gain, 0.0, 0.3)


def riser(t, dur, gain=0.12, f0=200, f1=2400):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    f = f0 * (f1 / f0) ** (tt / dur)
    s = osc("square", lambda x: f0 * (f1 / f0) ** (x / dur), n, 0.5) * 0.3
    s += np.diff(np.concatenate([[0], noise(n)])) * 0.6
    put(s * (tt / dur) ** 2, t, gain, 0.0, 0.5)


def whoosh(t, dur=0.45, gain=0.12):
    n = int(dur * SR)
    tt = np.arange(n) / SR
    x = noise(n)
    s = lowpass(x, 300 + 4000 * np.sin(np.pi * tt / dur)) * np.sin(np.pi * tt / dur) ** 2
    put(s, t, gain, 0.0, 0.2)


def thunk(t, gain=0.25, pitch=1.0):
    n = int(0.16 * SR)
    tt = np.arange(n) / SR
    s = np.sin(2 * np.pi * np.cumsum(110 * pitch * (1 + np.exp(-tt * 40))) / SR) * np.exp(-tt * 22)
    s += noise(n) * np.exp(-tt * 45) * 0.5
    put(s, t, gain, 0.0, 0.15)


def sparkle(t, base=84, count=8, step=0.06, gain=0.05):
    seq = [0, 4, 7, 12, 16, 19, 24, 28]
    for i in range(count):
        bell(t + i * step, base + seq[i % len(seq)], 0.8, gain, pan=((i % 3) - 1) * 0.5, verb=0.8)


def explosion(t, gain=0.4):
    n = int(2.4 * SR)
    tt = np.arange(n) / SR
    s = lowpass(noise(n), 3000 * np.exp(-tt * 1.5) + 120) * np.exp(-tt * 1.6)
    s += np.sin(2 * np.pi * np.cumsum(60 * np.exp(-tt * 2) + 30) / SR) * np.exp(-tt * 3) * 0.8
    put(s, t, gain, 0.0, 0.4)


# ---------------------------------------------------------------- music
C, G, Am, F, Dm, Em, Bb = (
    [60, 64, 67], [55, 59, 62], [57, 60, 64], [53, 57, 60], [62, 65, 69], [52, 55, 59], [58, 62, 65]
)


def bar_t(b):
    return b * 2.0


def chords_arp(b0, chords, gain=0.05, pattern=(0, 1, 2, 1, 0, 1, 2, 1), oct_=12, step=0.5):
    for i, ch in enumerate(chords):
        for k, p in enumerate(pattern):
            arp(bar_t(b0 + i) + k * BEAT * step, ch[p] + oct_, step * 0.9, gain)


def bassline(b0, chords, pattern="1 . 5 . 1 . 5 .", gain=0.16, oct_=-24):
    steps = pattern.split()
    for i, ch in enumerate(chords):
        for k, s in enumerate(steps):
            if s == ".":
                continue
            mm = ch[0] + oct_ + (7 if s == "5" else 12 if s == "8" else 0)
            bass(bar_t(b0 + i) + k * BEAT * 0.5, mm, 0.45, gain)


def melody(b0, notes, inst=lead, **kw):
    """notes: list of (beat_offset, 'E5', beats)"""
    for off, nm, ln in notes:
        if nm == "-":
            continue
        inst(bar_t(b0) + off * BEAT, m(nm), ln, **kw)


THEME_A = [  # 2 bars, playful
    (0, "E5", 0.5), (0.5, "G5", 0.5), (1, "C6", 1), (2, "B5", 0.5), (2.5, "G5", 0.5), (3, "A5", 1),
    (4, "G5", 0.5), (4.5, "E5", 0.5), (5, "F5", 0.5), (5.5, "A5", 0.5), (6, "G5", 1.5),
]
THEME_B = [
    (0, "E5", 0.5), (0.5, "G5", 0.5), (1, "C6", 1), (2, "D6", 0.5), (2.5, "C6", 0.5), (3, "A5", 1),
    (4, "F5", 0.5), (4.5, "A5", 0.5), (5, "G5", 0.5), (5.5, "B5", 0.5), (6, "C6", 1.8),
]

# --- S1/S2: playful (bars 0..9.8)
prog = [C, G, Am, F]
chords_arp(0, prog * 2 + [C, G], gain=0.045)
bassline(1, prog + prog + [C], gain=0.14)
melody(1, THEME_A)
melody(3, THEME_B)
for b in range(1, 6):
    for k in range(4):
        hat(bar_t(b) + k * BEAT + BEAT * 0.5, 0.035)
# crystal shimmer as it rises (7.6s)
sparkle(7.55, 84, 8, 0.05, 0.05)
bell(5.6, m("E6"), 1.6, 0.06)
# S2 starts 10s: hologram projection hum
pad(10.0, [72, 76, 79], 3.0, 0.035, bright=0.3)
melody(5, [(0, "C6", 0.5), (0.5, "E6", 0.5), (1, "G6", 1)], gain=0.1)
# duck at 13s: comic pop + "wah-wah-waaah"
bell(13.0, m("C5"), 0.5, 0.1)
for i, (nm, ln) in enumerate([("G4", 0.9), ("F#4", 0.9), ("F4", 0.9), ("E4", 2.4)]):
    start = 13.6 + i * 0.5
    n = int(ln * BEAT * SR)
    f0 = hz(m(nm))
    f = lambda tt, f0=f0: f0 * (1 + 0.03 * np.sin(2 * np.pi * 6 * tt))
    put(osc("square", f, n, 0.5) * env(n, 0.03, 0.1, 0.7, 0.1), start, 0.08, 0, 0.2)
bass(13.6, m("C3"), 4, 0.12)
# second, bigger attempt (16s): faster, brighter arps
chords_arp(8, [F, G], gain=0.05, pattern=(0, 1, 2, 1, 2, 1, 0, 1, 0, 1, 2, 1, 2, 1, 0, 1), step=0.25)
bassline(8, [F, G], "1 1 5 5 8 8 5 5", gain=0.13)
melody(8, [(0, "A5", 0.5), (0.5, "C6", 0.5), (1, "F6", 1), (2, "E6", 0.5), (2.5, "D6", 0.5), (3, "B5", 1),
           (4, "D6", 0.5), (4.5, "G6", 1.2)], gain=0.12)
whoosh(18.6, 0.5, 0.1)
# collapse (19.6s)
crash(19.6, 0.14, 2.0)
thunk(19.7, 0.3, 0.7); thunk(20.05, 0.25, 0.6); thunk(20.4, 0.25, 0.5); thunk(20.9, 0.2, 0.45)
melody(9.8, [(0, "G4", 0.5), (0.5, "F#4", 0.5), (1, "F4", 0.5), (1.5, "E4", 1.5)], gain=0.09, duty=0.5, vib=False)

# --- S3: adventure, A minor, bars 11..16 (22-34s)
bell(22.0, m("A4"), 1.5, 0.09)  # map falls
whoosh(21.9, 0.4, 0.08)
pad(22.0, [57, 60, 64], 3.0, 0.04)
advp = [Am, F, C, G, Am, F]
bassline(12.5, [Am, F, C, G], "1 1 1 1 5 5 8 5", gain=0.15)
chords_arp(12.5, [Am, F, C, G], gain=0.04, pattern=(0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1), step=0.25)
for b in [12.5, 13.5, 14.5, 15.5]:
    for k in range(4):
        kick(bar_t(b) + k * BEAT, 0.42)
        hat(bar_t(b) + k * BEAT + 0.25, 0.04)
    snare(bar_t(b) + BEAT, 0.2); snare(bar_t(b) + 3 * BEAT, 0.2)
for k, mm in enumerate([50, 47, 45, 43, 50, 47, 45, 43]):
    tom(bar_t(16.5) + k * 0.125 * 2, mm + 12, 0.25)
HERO_MIN = [
    (0, "A4", 0.5), (0.5, "C5", 0.5), (1, "E5", 1), (2, "D5", 0.5), (2.5, "C5", 0.5), (3, "D5", 1),
    (4, "C5", 0.5), (4.5, "E5", 0.5), (5, "G5", 1), (6, "F5", 0.5), (6.5, "E5", 0.5), (7, "D5", 1),
]
melody(12.5, HERO_MIN, inst=brass, gain=0.08)
melody(14.5, [(0, "A5", 1), (1, "G5", 0.5), (1.5, "E5", 0.5), (2, "G5", 1), (3, "B5", 1), (4, "C6", 1.5), (5.5, "B5", 0.5), (6, "D6", 2)], inst=brass, gain=0.08)
melody(14.5, [(0, "A5", 1), (1, "G5", 0.5), (1.5, "E5", 0.5), (2, "G5", 1), (3, "B5", 1), (4, "C6", 1.5), (5.5, "B5", 0.5), (6, "D6", 2)], gain=0.06, duty=0.5)
# falling rocks during montage
thunk(29.6, 0.2, 0.8); thunk(30.3, 0.2, 0.7); whoosh(27.8, 0.35, 0.08); whoosh(28.7, 0.35, 0.08); whoosh(29.6, 0.35, 0.08); whoosh(30.5, 0.35, 0.08)
crash(31.4, 0.1, 2.2)

# --- S4: temple mystery bars 17..22 (34-46s)
pad(31.4, [50, 57, 62, 65], 5.0, 0.05)
pad(36.0, [46, 53, 58, 62], 3.6, 0.05)
for k in range(12):
    bell(34.0 + k * 0.5, [74, 77, 81, 77, 74, 81][k % 6], 1.2, 0.035, pan=0.3 * ((k % 2) * 2 - 1))
# reach for the grail: riser into explosion
riser(37.4, 2.1, 0.08, 300, 3000)
explosion(39.5, 0.42)
crash(39.5, 0.12, 3.0)
sparkle(39.6, 88, 8, 0.04, 0.05)
sparkle(40.4, 84, 8, 0.05, 0.04)
# four symbols appear (42.5): one bell each
for k, nm in enumerate(["C5", "E5", "G5", "C6"]):
    bell(42.6 + k * 0.42, m(nm), 2.0, 0.08, pan=-0.6 + 0.4 * k)
pad(42.5, [60, 64, 67, 71], 3.6, 0.045)

# block-building ticks: the duck (11.6-13.0) and the wrong bridge (16.0-18.4)
for k in range(14):
    thunk(11.6 + k * 0.1, 0.09, 1.6 + 0.1 * (k % 4))
for k in range(24):
    thunk(16.0 + k * 0.1, 0.08, 1.4 + 0.08 * (k % 5))
# four items pop out of the backpack (49-52)
for k in range(4):
    whoosh(48.85 + k, 0.3, 0.05)
    bell(49.0 + k, m(["G5", "A5", "B5", "D6"][k]), 1.0, 0.06, pan=-0.4 + 0.27 * k)

# --- S5: discovery bars 23..30 (46-62s)
disc = [F, G, Am, C, F, G, Am, G]
bassline(23, disc, "1 . . . 5 . . .", gain=0.13)
pad(46.0, [53, 57, 60, 64], 8.0, 0.035)
bell(46.2, m("A6"), 1.5, 0.07)  # light-bulb ping
chords_arp(25, disc[2:], gain=0.04, pattern=(0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1), step=0.25)
for k, t in enumerate([54.0, 54.6, 55.2, 55.8]):  # four items placed into four symbols
    bell(t, m(["C6", "E6", "G6", "C7"][k]), 1.4, 0.07, pan=-0.6 + 0.4 * k)
for b in range(27, 30):
    for k in range(4):
        kick(bar_t(b) + k * BEAT, 0.3)
        hat(bar_t(b) + k * BEAT + 0.25, 0.035)
melody(25, [(0, "E5", 1), (1, "G5", 1), (2, "A5", 2), (4, "G5", 1), (5, "E5", 1), (6, "D5", 2),
            (8, "E5", 1), (9, "G5", 1), (10, "C6", 2), (12, "B5", 1), (13, "D6", 1), (14, "G5", 2)], gain=0.09, duty=0.5)
riser(58.0, 3.6, 0.1, 200, 4000)
sparkle(58.2, 84, 8, 0.07, 0.04)
crash(61.6, 0.1, 1.5)

# --- S6: climax bars 31..37 (62-76s)
clim = [C, G, Am, F, C, G, F]
bassline(31, clim, "1 1 5 5 8 8 5 5", gain=0.16)
chords_arp(31, clim, gain=0.045, pattern=(0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1, 0, 1, 2, 1), step=0.25)
pad(62.0, [60, 64, 67], 14.0, 0.04, bright=0.3)
for b in range(31, 38):
    for k in range(4):
        kick(bar_t(b) + k * BEAT, 0.45)
        hat(bar_t(b) + k * BEAT + 0.25, 0.045)
    snare(bar_t(b) + BEAT, 0.22); snare(bar_t(b) + 3 * BEAT, 0.22)
crash(62.0, 0.14)
melody(31, THEME_A, inst=brass, gain=0.09)
melody(31, THEME_A, gain=0.07)
melody(33, THEME_B, inst=brass, gain=0.09)
melody(33, THEME_B, gain=0.07)
melody(35, [(0, "C6", 1), (1, "D6", 0.5), (1.5, "E6", 0.5), (2, "G6", 1), (3, "E6", 1), (4, "F6", 1), (5, "A6", 1), (6, "G6", 2),
            (8, "E6", 1), (9, "D6", 1), (10, "C6", 3)], inst=brass, gain=0.1)
melody(35, [(0, "C6", 1), (1, "D6", 0.5), (1.5, "E6", 0.5), (2, "G6", 1), (3, "E6", 1), (4, "F6", 1), (5, "A6", 1), (6, "G6", 2),
            (8, "E6", 1), (9, "D6", 1), (10, "C6", 3)], gain=0.07)
# scan sweep (69s) and stone-by-stone build thunks
riser(68.8, 1.4, 0.05, 600, 2400)
for k in range(22):
    thunk(70.4 + k * 0.11, 0.16, 0.8 + 0.6 * (k % 5) / 5)
crash(72.8, 0.14)
sparkle(72.9, 84, 8, 0.05, 0.05)

# --- S7: celebration bars 38..42 (76-85s)
cel = [F, G, C, Am]
bassline(38, cel, "1 . 5 . 8 . 5 .", gain=0.13)
chords_arp(38, cel, gain=0.04)
for b in range(38, 42):
    for k in range(4):
        hat(bar_t(b) + k * BEAT + 0.25, 0.035)
    kick(bar_t(b), 0.3); kick(bar_t(b) + 2 * BEAT, 0.3)
melody(38, [(0, "A5", 1), (1, "C6", 1), (2, "B5", 1), (3, "D6", 1), (4, "C6", 2), (6, "E6", 2)], gain=0.08, duty=0.5)
whoosh(78.9, 0.4, 0.08)
bell(79.0, m("G5"), 1.5, 0.08)  # chest opens
sparkle(79.2, 84, 8, 0.05, 0.05)
for k, nm in enumerate(["C6", "E6", "G6", "B6"]):  # four connected points
    bell(80.6 + k * 0.2, m(nm), 2.0, 0.07, pan=-0.5 + 0.33 * k)
riser(81.2, 1.4, 0.06, 400, 3000)
crash(82.6, 0.12, 3)
pad(82.6, [53, 60, 64, 69], 2.6, 0.05, bright=0.3)
melody(41.3, [(0, "C6", 1), (1, "E6", 1), (2, "G6", 2), (4, "C7", 2.6)], inst=brass, gain=0.09)
sparkle(83.0, 88, 8, 0.08, 0.035)

# --- S8: soft reprise, then one magical tone
pad(85.0, [60, 64, 67, 72], 6.2, 0.045)
melody(42.5, [(0, "E5", 1), (1, "G5", 1), (2, "C6", 2), (4, "B5", 1), (5, "G5", 1), (6, "A5", 2.4)], gain=0.07, duty=0.5)
bell(87.6, m("E7"), 0.8, 0.05)  # glint as he fixes his glasses
bass(85.0, m("C3"), 8, 0.12)
# the single bright magical tone
for k, (mm, g) in enumerate([(72, 0.11), (79, 0.07), (84, 0.06), (88, 0.04), (91, 0.03)]):
    bell(91.2, mm, 3.8, g, pan=0.0, verb=0.9)
sparkle(91.25, 96, 6, 0.09, 0.02)

# ---------------------------------------------------------------- mix
# FFT-convolution reverb with a synthetic decaying-noise impulse
ir_n = int(2.6 * SR)
tt = np.arange(ir_n) / SR
ir = rng.uniform(-1, 1, ir_n) * np.exp(-tt * 2.6)
ir[: int(0.012 * SR)] = 0
size = 1 << int(np.ceil(np.log2(N + ir_n)))
wet = np.fft.irfft(np.fft.rfft(VERB, size) * np.fft.rfft(ir, size), size)[:N]
wet /= np.max(np.abs(wet)) + 1e-9
dry_peak = max(np.max(np.abs(L)), np.max(np.abs(R)))
wet *= dry_peak * 0.35
L += wet
R += wet * 0.97

# fade in / out and soft limit
fade = np.ones(N)
fade[: int(0.3 * SR)] = np.linspace(0, 1, int(0.3 * SR))
fade[-int(1.8 * SR):] = np.linspace(1, 0, int(1.8 * SR))
L *= fade; R *= fade
peak = max(np.max(np.abs(L)), np.max(np.abs(R)))
L = np.tanh(L / peak * 1.3) / np.tanh(1.3) * 0.89
R = np.tanh(R / peak * 1.3) / np.tanh(1.3) * 0.89
pcm = (np.stack([L, R], axis=1) * 32767).astype("<i2")
with wave.open(OUT, "wb") as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("wrote", OUT, f"{DUR}s")
