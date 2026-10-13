"""Cut the hero sprites out of assets/src/character-sheet.png (transparent PNGs)."""
import os
import numpy as np, cv2
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "assets/sprites")
os.makedirs(OUT, exist_ok=True)
sheet = np.asarray(Image.open(os.path.join(ROOT, "assets/src/character-sheet.png")).convert("RGB"))

# name: (x, y, w, h) in sheet pixels
BOXES = {
    "front": (808, 50, 140, 292), "three-quarter": (947, 54, 128, 288), "side": (1087, 51, 133, 290),
    "back-three-quarter": (1231, 54, 149, 288), "back": (1375, 50, 149, 292),
    "head-neutral": (812, 360, 151, 181), "head-smirk": (996, 360, 141, 181), "head-laugh": (1173, 360, 147, 181),
    "head-determined": (1350, 360, 161, 181), "head-frown": (816, 557, 148, 182), "head-sigh": (997, 557, 154, 182),
    "head-surprised": (1174, 556, 150, 183), "head-wink": (1354, 557, 155, 182),
    "run": (806, 764, 150, 193), "map": (1084, 766, 120, 222),
    "laptop": (1196, 740, 170, 250), "cheer": (1362, 760, 150, 232),
}


def cut(name, box):
    x, y, w, h = box
    c = sheet[y:y + h, x:x + w].astype(int)
    mx, mn = c.max(2), c.min(2)
    bgish = ((mn > 168) & ((mx - mn) < 30)).astype(np.uint8)
    # background = bg-coloured pixels connected to the crop border
    n, lab = cv2.connectedComponents(bgish, connectivity=4)
    border = set(np.unique(np.concatenate([lab[0], lab[-1], lab[:, 0], lab[:, -1]]))) - {0}
    bg = np.isin(lab, list(border)) & (bgish == 1)
    alpha = (~bg).astype(np.uint8)
    # keep the biggest blob(s) only (drops stray neighbour fragments), then trim a 1px halo
    # keep only the character: the largest blob (after a small dilation so loose hair tips stay attached)
    n2, lab2, st, _ = cv2.connectedComponentsWithStats(cv2.dilate(alpha, np.ones((5, 5), np.uint8)), 8)
    big = 1 + int(np.argmax(st[1:, 4]))
    alpha = alpha * (lab2 == big).astype(np.uint8)
    alpha = cv2.erode(alpha, np.ones((2, 2), np.uint8))
    rgba = np.dstack([c.astype(np.uint8), alpha * 255])
    ys, xs = np.nonzero(alpha)
    rgba = rgba[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    Image.fromarray(rgba, "RGBA").save(os.path.join(OUT, f"{name}.png"))
    return rgba.shape[1], rgba.shape[0]


for k, b in BOXES.items():
    print(k, cut(k, b))
