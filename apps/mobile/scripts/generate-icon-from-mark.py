"""Turns source/yocabs-mark.jpg (the ink Y-mark on cream artwork) into every app asset: the app
icon, Android adaptive icon layers, splash, notification icon, and the two in-app logo marks (for
dark and light surfaces). Needs Pillow and numpy: pip install pillow numpy
Run: python apps/mobile/scripts/generate-icon-from-mark.py
"""
import os
import numpy as np
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "source", "yocabs-mark.jpg")
OUT = os.path.join(HERE, "..", "assets")

CREAM = (243, 234, 217)   # matches colors.background in brand.ts
INK = (11, 18, 32)        # matches colors.ink in brand.ts
WHITE = (255, 255, 255)

img = Image.open(SRC).convert("RGB")
arr = np.asarray(img).astype(np.float32)
luminance = arr @ np.array([0.299, 0.587, 0.114])

bg_lum = luminance[:20, :20].mean()
fg_lum = np.percentile(luminance, 1)  # the darkest pixels are the mark's solid fill

# Smooth alpha from luminance (anti-aliased edges survive instead of a jagged hard cutoff).
alpha = np.clip((bg_lum - luminance) / (bg_lum - fg_lum), 0.0, 1.0)

# Find the Y-mark's row band: it sits above the "YoCabs" wordmark, separated by a near-empty gap.
row_coverage = (alpha > 0.5).sum(axis=1)
active_rows = np.where(row_coverage > 2)[0]
gaps = np.where(np.diff(active_rows) > 5)[0]
mark_end_row = active_rows[gaps[0]] if len(gaps) else active_rows[-1]

mark_alpha = alpha.copy()
mark_alpha[int(mark_end_row) + 1:, :] = 0.0

cols = np.where((mark_alpha > 0.5).sum(axis=0) > 2)[0]
rows = np.where((mark_alpha > 0.5).sum(axis=1) > 2)[0]
pad = 4
x0, x1 = max(cols[0] - pad, 0), min(cols[-1] + pad, mark_alpha.shape[1])
y0, y1 = max(rows[0] - pad, 0), min(rows[-1] + pad, mark_alpha.shape[0])

mark_crop = mark_alpha[y0:y1, x0:x1]
mh, mw = mark_crop.shape


def colored_mark(color):
    """The cropped mark as a transparent RGBA cutout in a solid colour."""
    rgba = np.zeros((mh, mw, 4), dtype=np.uint8)
    rgba[:, :, 0] = color[0]
    rgba[:, :, 1] = color[1]
    rgba[:, :, 2] = color[2]
    rgba[:, :, 3] = (mark_crop * 255).astype(np.uint8)
    return Image.fromarray(rgba, "RGBA")


def on_canvas(mark_img, size, fraction, background=None):
    """Centres the mark on a size x size canvas, scaled so its longer side is `fraction` of size."""
    canvas = Image.new("RGBA", (size, size), background or (0, 0, 0, 0))
    scale = (size * fraction) / max(mark_img.size)
    resized = mark_img.resize(
        (max(1, round(mark_img.width * scale)), max(1, round(mark_img.height * scale))),
        Image.LANCZOS,
    )
    x = (size - resized.width) // 2
    y = (size - resized.height) // 2
    canvas.alpha_composite(resized, (x, y))
    return canvas


def save(name, image):
    image.save(os.path.join(OUT, name))
    print("wrote", name, image.size)


ink_mark = colored_mark(INK)
cream_mark = colored_mark(CREAM)
white_mark = colored_mark(WHITE)

# App icon: ink mark on the app's cream background, like the source artwork.
save("icon.png", on_canvas(ink_mark, 1024, 0.64, background=CREAM + (255,)).convert("RGB"))

# Android adaptive icon: the launcher masks these to any shape, so art stays well inside.
save("android-icon-background.png", Image.new("RGB", (1024, 1024), CREAM))
save("android-icon-foreground.png", on_canvas(ink_mark, 1024, 0.5))
save("android-icon-monochrome.png", on_canvas(white_mark, 1024, 0.5))

# Splash: shown on the ink background set in app.config.ts, so the mark needs to be light.
save("splash-icon.png", on_canvas(cream_mark, 1024, 0.62))

# In-app logo: cream mark for dark surfaces, ink mark for light surfaces.
save("logo-mark.png", on_canvas(cream_mark, 512, 0.92))
save("logo-mark-dark.png", on_canvas(ink_mark, 512, 0.92))

# Android draws the status-bar icon from its shape alone: white on transparent.
save("notification-icon.png", on_canvas(white_mark, 96, 0.78))
