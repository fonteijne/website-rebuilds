"""Generate index.html (the HyperFrames composition) from the shot list below.

Edit the SHOTS table / FX here and re-run:  python3 scripts/build_index.py
Camera keys: s = zoom (1.0 = panel fits the 1080px height), f = focus point
(fraction of the panel that is pulled toward the frame centre).
Transitions (tr): fade | cut | whip | white (flash) | black (dip).
"""
import json, os
import numpy as np
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
W, H = 1920, 1080
TOTAL = 95.0

# id, start, end, transition, transition duration, cam from, cam to, ease, extras
SHOTS = [
    # S1 · De wereld van AI
    dict(img="s1-1", a=0.0, b=3.0, tr="black", x=0.0, c0=(1.3, .45, .6), c1=(1.0, .5, .5), ease="sine.out"),
    dict(img="s1-2", a=3.0, b=5.2, tr="fade", x=0.6, c0=(1.35, .3, .55), c1=(1.35, .75, .45), ease="sine.inOut",
         fx=[("glow", .78, .33, 260, "#ffd860", 3.4, 5.2)]),
    dict(img="s1-3", a=5.2, b=7.6, tr="fade", x=0.3, c0=(1.0, .5, .5), c1=(1.18, .66, .62), ease="sine.inOut",
         fx=[("glow", .66, .68, 300, "#7fc8ff", 5.6, 7.6)]),
    dict(img="s1-4", a=7.6, b=10.0, tr="fade", x=0.3, c0=(1.18, .62, .45), c1=(1.0, .55, .45), ease="sine.out",
         fx=[("glow", .74, .29, 420, "#8fd0ff", 7.7, 10.0)]),
    # S2 · De verkeerde magie
    dict(img="s2-1", a=10.0, b=13.0, tr="fade", x=0.5, c0=(1.1, .3, .5), c1=(1.22, .58, .45), ease="sine.inOut",
         fx=[("holo", .58, .45, 760, "#58b8ff", 10.2, 13.0), ("glow", .18, .22, 220, "#8fd0ff", 10.0, 13.0)]),
    dict(img="s2-2", a=13.0, b=16.0, tr="cut", x=0.0, c0=(1.6, .5, .42), c1=(1.05, .5, .5), ease="back.out(1.6)",
         dur=0.7, c2=(1.12, .45, .5)),
    dict(img="s2-3", a=16.0, b=18.8, tr="whip", x=0.35, c0=(1.25, .45, .4), c1=(1.05, .55, .45), ease="power2.out",
         fx=[("glow", .82, .33, 300, "#8fd0ff", 16.2, 18.8), ("glow", .38, .45, 520, "#fff3c0", 16.4, 18.8)]),
    dict(img="s2-4", a=18.8, b=22.0, tr="fade", x=0.3, c0=(1.0, .5, .5), c1=(1.2, .72, .38), ease="sine.inOut",
         shake=(19.6, 1.1, 18)),
    # S3 · De zoektocht begint
    dict(img="s3-1", a=22.0, b=25.0, tr="black", x=0.5, c0=(1.35, .28, .45), c1=(1.08, .35, .5), ease="sine.out",
         fx=[("glow", .22, .38, 260, "#ffd860", 22.6, 25.0)]),
    dict(img="s3-2", a=25.0, b=27.8, tr="fade", x=0.5, c0=(1.45, .5, .8), c1=(1.3, .6, .3), ease="sine.inOut",
         fx=[("glow", .62, .33, 240, "#ffd860", 25.6, 27.8)]),
    dict(img="s3-3", a=27.8, b=28.7, tr="whip", x=0.2, c0=(2.1, .24, .26), c1=(2.25, .28, .24), ease="none"),
    dict(img="s3-3", a=28.7, b=29.6, tr="whip", x=0.2, c0=(2.1, .76, .2), c1=(2.25, .72, .22), ease="none"),
    dict(img="s3-3", a=29.6, b=30.5, tr="whip", x=0.2, c0=(2.1, .26, .78), c1=(2.25, .3, .76), ease="none",
         shake=(29.7, 0.4, 10)),
    dict(img="s3-3", a=30.5, b=31.4, tr="whip", x=0.2, c0=(2.1, .74, .74), c1=(2.25, .7, .72), ease="none",
         shake=(30.4, 0.5, 12)),
    dict(img="s3-4", a=31.4, b=34.0, tr="white", x=0.4, c0=(1.0, .5, .65), c1=(1.22, .5, .38), ease="sine.inOut",
         fx=[("glow", .5, .27, 260, "#ffd860", 31.8, 34.0)]),
    # S4 · De Heilige Graal
    dict(img="s4-1", a=34.0, b=37.0, tr="black", x=0.6, c0=(1.25, .58, .4), c1=(1.05, .55, .45), ease="sine.out",
         fx=[("glow", .6, .32, 420, "#ffd860", 34.0, 37.0)]),
    dict(img="s4-2", a=37.0, b=39.5, tr="fade", x=0.4, c0=(1.05, .5, .5), c1=(1.3, .62, .32), ease="power1.in",
         fx=[("glow", .63, .27, 520, "#ffe27a", 37.0, 39.5)], shake=(38.8, 0.7, 6)),
    dict(img="s4-3", a=39.5, b=42.5, tr="white", x=0.15, c0=(1.15, .55, .4), c1=(1.0, .5, .5), ease="power2.out",
         shake=(39.5, 0.9, 22)),
    dict(img="s4-4", a=42.5, b=46.0, tr="fade", x=0.5, c0=(1.25, .5, .62), c1=(1.05, .5, .45), ease="sine.inOut",
         fx=[("pop", .36, .2, 230, "#ff5a5a", 42.6), ("pop", .7, .2, 230, "#5ab0ff", 43.0),
             ("pop", .19, .45, 230, "#5aff8a", 43.4), ("pop", .8, .47, 230, "#c070ff", 43.8)]),
    # S5 · De ontdekking
    dict(img="s5-1", a=46.0, b=50.0, tr="fade", x=0.5, c0=(1.0, .5, .5), c1=(1.14, .45, .4), ease="sine.inOut",
         fx=[("pop", .84, .17, 260, "#ffe27a", 46.2)]),
    dict(img="s5-2", a=50.0, b=54.0, tr="fade", x=0.5, c0=(1.3, .42, .3), c1=(1.3, .5, .72), ease="sine.inOut"),
    dict(img="s5-3", a=54.0, b=58.0, tr="fade", x=0.5, c0=(1.0, .5, .5), c1=(1.12, .5, .45), ease="sine.inOut",
         fx=[("pop", .12, .22, 220, "#ff5a5a", 54.0), ("pop", .37, .22, 220, "#5ab0ff", 54.6),
             ("pop", .62, .22, 220, "#5aff8a", 55.2), ("pop", .87, .22, 220, "#c070ff", 55.8),
             ("beam", .5, .5, 1200, "#ffe9a0", 56.2, 58.0)]),
    dict(img="s5-4", a=58.0, b=62.0, tr="white", x=0.4, c0=(1.0, .5, .5), c1=(1.28, .5, .42), ease="sine.in",
         fx=[("glow", .5, .38, 700, "#fff1b0", 58.0, 62.0)]),
    # S6 · De kracht van context
    dict(img="s6-1", a=62.0, b=65.5, tr="cut", x=0.0, c0=(1.18, .62, .45), c1=(1.0, .55, .5), ease="sine.out",
         fx=[("glow", .8, .55, 320, "#8fd0ff", 62.0, 65.5)]),
    dict(img="s6-2", a=65.5, b=69.0, tr="fade", x=0.4, c0=(1.0, .5, .5), c1=(1.15, .53, .47), ease="sine.inOut",
         fx=[("halo", .53, .47, 560, "#ffd860", 65.5, 69.0), ("glow", .53, .47, 380, "#8fd0ff", 65.5, 69.0)]),
    dict(img="s6-3", a=69.0, b=72.9, tr="fade", x=0.4, c0=(1.0, .5, .5), c1=(1.0, .5, .5), ease="none",
         fx=[("scan", 0, 0, 0, "#8fe8ff", 69.1, 70.4)]),
    dict(img="s6-4", a=70.4, b=76.0, tr="build", x=0.0, c0=(1.0, .5, .5), c1=(1.15, .32, .42), ease="sine.inOut",
         hold=72.9, fx=[("glow", .86, .27, 260, "#ffd860", 73.0, 76.0)]),
    # S7 · De echte schat
    dict(img="s7-1", a=76.0, b=78.2, tr="fade", x=0.5, c0=(1.25, .4, .5), c1=(1.25, .62, .45), ease="none"),
    dict(img="s7-2", a=78.2, b=80.4, tr="fade", x=0.3, c0=(1.0, .5, .5), c1=(1.18, .64, .55), ease="sine.inOut",
         fx=[("glow", .66, .55, 420, "#ffe27a", 78.8, 80.4)]),
    dict(img="s7-3", a=80.4, b=82.6, tr="white", x=0.25, c0=(1.15, .55, .3), c1=(1.0, .5, .4), ease="sine.out",
         fx=[("glow", .55, .25, 520, "#fff1b0", 80.4, 82.6)]),
    dict(img="s7-4", a=82.6, b=85.0, tr="fade", x=0.4, c0=(1.6, .5, .45), c1=(1.0, .5, .5), ease="power2.out",
         fx=[("wave", .5, .4, 400, "#ffe27a", 82.7, 85.0), ("pop", .1, .4, 160, "#8fd0ff", 83.2),
             ("pop", .78, .14, 160, "#8fd0ff", 83.5), ("pop", .87, .5, 160, "#8fd0ff", 83.8),
             ("pop", .52, .2, 160, "#8fd0ff", 84.1)]),
    # S8 · De onthulling
    dict(img="s8-1", a=85.0, b=87.0, tr="fade", x=0.5, c0=(1.85, .5, .24), c1=(1.95, .5, .28), ease="sine.inOut"),
    dict(img="s8-2", a=87.0, b=88.8, tr="cut", x=0.0, c0=(1.95, .5, .28), c1=(2.05, .5, .3), ease="sine.inOut",
         fx=[("star", .86, .23, 120, "#fff7c0", 87.5)]),
    dict(img="s8-3", a=88.8, b=91.0, tr="fade", x=0.3, c0=(2.3, .52, .28), c1=(1.0, .5, .5), ease="power2.inOut"),
]


def size(name):
    w, h = Image.open(os.path.join(ROOT, f"assets/panels/{name}.png")).size
    return w, h


def cam(img, c):
    s, fx, fy = c
    w, h = size(img)
    bh = H
    bw = w / h * H
    dw, dh = bw * s, bh * s
    x = -(fx - 0.5) * dw
    y = -(fy - 0.5) * dh
    mx = max(0.0, (dw - W) / 2)
    my = max(0.0, (dh - H) / 2)
    x = max(-mx, min(mx, x)) if dw > W else 0.0  # a panel narrower than the frame stays centred
    y = max(-my, min(my, y))
    return dict(scale=round(s, 4), x=round(x, 1), y=round(y, 1))


FXDIR = os.path.join(ROOT, "assets/fx")
BGDIR = os.path.join(ROOT, "assets/panels/bg")
os.makedirs(FXDIR, exist_ok=True)
os.makedirs(BGDIR, exist_ok=True)


def hexrgb(c):
    c = c.lstrip("#")
    return tuple(int(c[i:i + 2], 16) for i in (0, 2, 4))


def glow_sprite(color, core=False):
    """Pre-rendered radial glow (keeps CSS radial-gradients out of the capture path)."""
    name = f"glow-{color.lstrip('#')}{'-core' if core else ''}.png"
    path = os.path.join(FXDIR, name)
    if not os.path.exists(path):
        n = 256
        yy, xx = np.mgrid[0:n, 0:n]
        d = np.sqrt((xx - n / 2 + 0.5) ** 2 + (yy - n / 2 + 0.5) ** 2) / (n / 2)
        a = np.clip(1 - d / 0.68, 0, 1) ** 1.6
        rgb = np.array(hexrgb(color), float)
        mix = np.clip(1 - d / (0.24 if core else 0.08), 0, 1)[..., None]
        col = rgb * (1 - mix) + 255 * mix
        img = np.dstack([col, a * 255]).astype(np.uint8)
        Image.fromarray(img, "RGBA").save(path)
    return f"assets/fx/{name}"


def star_sprite(color):
    name = f"star-{color.lstrip('#')}.png"
    path = os.path.join(FXDIR, name)
    if not os.path.exists(path):
        n = 128
        im = Image.new("RGBA", (n, n), (0, 0, 0, 0))
        d = ImageDraw.Draw(im)
        c = n / 2
        pts = [(c, 0), (c + 9, c - 9), (n, c), (c + 9, c + 9), (c, n), (c - 9, c + 9), (0, c), (c - 9, c - 9)]
        d.polygon(pts, fill=hexrgb(color) + (255,))
        im.save(path)
    return f"assets/fx/{name}"


def bg_image(name):
    """Blurred, darkened backdrop baked to a small JPEG (no CSS filter: blur at render time)."""
    path = os.path.join(BGDIR, f"{name}.jpg")
    if not os.path.exists(path):
        im = Image.open(os.path.join(ROOT, f"assets/panels/{name}.png")).convert("RGB")
        tw, th = 520, 293
        sc = max(tw / im.width, th / im.height)
        im = im.resize((round(im.width * sc), round(im.height * sc)), Image.LANCZOS)
        l, t = (im.width - tw) // 2, (im.height - th) // 2
        im = im.crop((l, t, l + tw, t + th)).filter(ImageFilter.GaussianBlur(7))
        im = ImageEnhance.Color(im).enhance(1.25)
        im = ImageEnhance.Brightness(im).enhance(0.6)
        im.save(path, quality=88)
    return f"assets/panels/bg/{name}.jpg"


def fx_html(i, fx):
    out = []
    for k, f in enumerate(fx):
        kind, px, py = f[0], f[1], f[2]
        fid = f"fx{i}-{k}"
        if kind == "scan":
            out.append(f'<div id="{fid}" class="fx fx-scan" style="--c:{f[4]}"></div>')
            continue
        size_px, color = f[3], f[4]
        w = h = size_px
        if kind == "holo":
            h = round(size_px * 0.55)
        box = f'left:{px*100:.1f}%;top:{py*100:.1f}%;width:{w}px;height:{h}px;margin:-{h/2}px 0 0 -{w/2}px'
        if kind in ("glow", "holo", "beam", "pop"):
            src = glow_sprite(color, core=(kind == "pop"))
            out.append(f'<img id="{fid}" class="fx fx-{kind}" src="{src}" alt="" style="{box}" />')
        elif kind == "star":
            out.append(f'<img id="{fid}" class="fx fx-star" src="{star_sprite(color)}" alt="" style="{box}" />')
        else:  # wave / halo rings
            out.append(f'<div id="{fid}" class="fx fx-{kind}" style="{box};--c:{color}"></div>')
    return "".join(out)


def tpl(name):
    return open(os.path.join(ROOT, f"scripts/templates/{name}.html")).read()


# ---- group shots into the eight script scenes -> compositions/sceneN.html
os.makedirs(os.path.join(ROOT, "compositions"), exist_ok=True)
scenes = {}
for i, sh in enumerate(SHOTS):
    scenes.setdefault(int(sh["img"][1]), []).append((i, sh))

hosts, root_shots = [], []
for n, items in sorted(scenes.items()):
    sid_scene = f"scene{n}"
    s0 = min(sh["a"] - sh["x"] for _, sh in items)
    s1 = max(sh["b"] for _, sh in items)
    clips, js = [], []
    for i, sh in items:
        w, h = size(sh["img"])
        bw = round(w / h * H)
        start = sh["a"] - sh["x"] - s0
        dur = sh["b"] - sh["a"] + sh["x"]
        sid = f"shot{i+1:02d}"
        fxs = sh.get("fx", [])
        if sh["tr"] == "build":
            tiles = "".join(
                f'<div class="tile" style="left:{cx*10}%;top:{ry*10}%;background-position:{cx/9*100:.3f}% {ry/9*100:.3f}%"></div>'
                for cx in range(10) for ry in range(10))
            fg_inner = f'<div class="tiles">{tiles}</div>'
        else:
            fg_inner = f'<img class="panel" src="assets/panels/{sh["img"]}.png" alt="" />'
        clips.append(f"""
          <div id="{sid}" class="clip shot" data-start="{start:.2f}" data-duration="{dur:.2f}" data-track-index="{i % 2}" style="z-index:{i+1}">
            <div class="inner" id="{sid}-inner">
              <img class="bg" id="{sid}-bg" src="{bg_image(sh['img'])}" alt="" />
              <div class="fg" id="{sid}-fg" style="width:{bw}px;left:{(W-bw)/2:.1f}px">{fg_inner}{fx_html(i+1, fxs)}</div>
            </div>
          </div>""")
        js.append(dict(
            id=sid, start=round(start, 3), b=round(sh["b"] - s0, 3), tr=sh["tr"], x=sh["x"], fgw=bw,
            c0=cam(sh["img"], sh["c0"]), c1=cam(sh["img"], sh["c1"]),
            c2=cam(sh["img"], sh["c2"]) if "c2" in sh else None, dur=sh.get("dur"), ease=sh["ease"],
            hold=round(sh["hold"] - s0, 3) if sh.get("hold") else None,
            fx=[dict(id=f"fx{i+1}-{k}", kind=f[0],
                     t0=round(f[5] - s0, 3), t1=round((f[6] if len(f) > 6 else f[5] + 1) - s0, 3))
                for k, f in enumerate(fxs)]))
        root_shots.append(dict(a=sh["a"], x=sh["x"], tr=sh["tr"], shake=sh.get("shake")))
    html = (tpl("scene").replace("__ID__", sid_scene).replace("__DUR__", f"{s1-s0:.2f}")
            .replace("<!--__CLIPS__-->", "".join(clips)).replace("/*__SHOTS__*/[]", json.dumps(js)))
    open(os.path.join(ROOT, f"compositions/{sid_scene}.html"), "w").write(html)
    hosts.append(f"""
        <div id="{sid_scene}" data-composition-id="{sid_scene}" data-composition-src="compositions/{sid_scene}.html"
          data-start="{s0:.2f}" data-duration="{s1-s0:.2f}" data-track-index="{n % 2}" data-width="1920" data-height="1080"
          style="position:absolute;inset:0;z-index:{n}"></div>""")

html = (tpl("root").replace("/*__SHOTS__*/[]", json.dumps(root_shots))
        .replace("<!--__CLIPS__-->", "".join(hosts))
        .replace("__TOTAL__", str(TOTAL)))
open(os.path.join(ROOT, "index.html"), "w").write(html)

# bottom strip of the final storyboard panel (night city) for the title card
im = Image.open(os.path.join(ROOT, "assets/panels/s8-4.png"))
im.crop((0, int(im.height * 0.72), im.width, im.height)).save(os.path.join(ROOT, "assets/title-city.png"))
print("index.html +", len(scenes), "scene compositions written,", len(SHOTS), "shots")
