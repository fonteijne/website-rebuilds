"""Cut the 32 storyboard panels out of assets/src/storyboard.png,
remove the numbered badges, and upscale them 4x with xBR (pixel-art aware)."""
import os, subprocess, sys
import numpy as np, cv2

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = os.path.join(ROOT, "assets/src/storyboard.png")
OUT = os.path.join(ROOT, "assets/panels")
os.makedirs(OUT, exist_ok=True)

img = cv2.imread(SRC)
rgb = img[:, :, ::-1].astype(int)
bg = (rgb.min(axis=2) > 235) & ((rgb.max(axis=2) - rgb.min(axis=2)) < 12)

ROWS = [(3, 195), (201, 382), (388, 584), (589, 794), (800, 1010), (1017, 1226), (1231, 1452), (1458, 1768)]
COLS = [
    [(45, 255), (260, 470), (476, 682), (687, 884)],
    [(45, 254), (260, 470), (476, 682), (687, 884)],
    [(45, 254), (260, 465), (470, 682), (687, 882)],
    [(46, 251), (257, 459), (464, 679), (685, 882)],
    [(45, 228), (234, 464), (470, 683), (689, 882)],
    [(46, 229), (235, 448), (454, 670), (677, 881)],
    [(46, 232), (238, 431), (438, 648), (654, 881)],
    [(45, 229), (236, 419), (426, 631), (639, 881)],
]

def tight_rows(x0, x1, y0, y1):
    prof = bg[:, x0 + 15:x1 - 15].mean(axis=1)
    ys = [y for y in range(max(0, y0 - 4), min(len(prof), y1 + 4)) if prof[y] < 0.5]
    return ys[0], ys[-1] + 1

for r, (y0, y1) in enumerate(ROWS):
    for c, (x0, x1) in enumerate(COLS[r]):
        ty0, ty1 = tight_rows(x0, x1, y0, y1)
        inset = 3
        crop = img[ty0 + inset:ty1 - inset, x0 + inset:x1 - inset].copy()
        # the numbered badge always sits in the same top-left square: paint it out
        mask = np.zeros(crop.shape[:2], np.uint8)
        mask[0:25, 0:25] = 255
        crop = cv2.inpaint(crop, mask, 8, cv2.INPAINT_TELEA)
        name = f"s{r+1}-{c+1}"
        small = os.path.join(OUT, f"{name}-raw.png")
        cv2.imwrite(small, crop)
        big = os.path.join(OUT, f"{name}.png")
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", small, "-vf", "xbr=4", big], check=True)
        os.remove(small)
        print(name, crop.shape[1], "x", crop.shape[0])
