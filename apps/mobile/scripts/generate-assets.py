"""Generates the YoCabs logo artwork and the notification sounds.

Everything is drawn or synthesised here, so there is nothing to license and the files can be
regenerated (needs Pillow: pip install pillow). Run: python apps/mobile/scripts/generate-assets.py
"""
import math, os, struct, wave
from PIL import Image, ImageDraw

OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'assets')
os.makedirs(os.path.join(OUT, 'sounds'), exist_ok=True)

INK = (11, 18, 32, 255)
GOLD = (176, 141, 87, 255)
GOLD_LIGHT = (214, 181, 122, 255)
WHITE = (255, 255, 255, 255)
CLEAR = (0, 0, 0, 0)


# ---------------------------------------------------------------- logo
def mark(size, colour=GOLD, background=None, ring=True, scale=1.0):
    """A ring and a bold "Y" whose arms open like a road forking. Drawn 4x and shrunk to smooth it."""
    big = size * 4
    image = Image.new('RGBA', (big, big), background or CLEAR)
    draw = ImageDraw.Draw(image)

    centre = big / 2
    radius = big * 0.5 * 0.86 * scale

    if ring:
        width = max(4, int(big * 0.028 * scale))
        draw.ellipse(
            [centre - radius, centre - radius, centre + radius, centre + radius],
            outline=colour, width=width,
        )

    stroke = int(big * 0.085 * scale)
    top = centre - radius * 0.50
    fork = centre - radius * 0.02
    bottom = centre + radius * 0.52
    spread = radius * 0.42

    def line(a, b):
        draw.line([a, b], fill=colour, width=stroke)
        for x, y in (a, b):
            draw.ellipse([x - stroke / 2, y - stroke / 2, x + stroke / 2, y + stroke / 2], fill=colour)

    line((centre - spread, top), (centre, fork))
    line((centre + spread, top), (centre, fork))
    line((centre, fork), (centre, bottom))

    return image.resize((size, size), Image.LANCZOS)


def save(name, image):
    image.save(os.path.join(OUT, name))
    print('wrote', name, image.size)


# the app icon: the gold mark on ink
icon = Image.new('RGBA', (1024, 1024), INK)
icon.alpha_composite(mark(1024, GOLD, scale=0.9))
save('icon.png', icon.convert('RGB'))

# adaptive icon layers (the launcher masks these to any shape, so the art stays well inside)
save('android-icon-background.png', Image.new('RGB', (1024, 1024), INK[:3]))
save('android-icon-foreground.png', mark(1024, GOLD, scale=0.72))
save('android-icon-monochrome.png', mark(1024, WHITE, scale=0.72))

# the splash: the mark on transparent, shown on the ink background set in app.config.ts
save('splash-icon.png', mark(1024, GOLD, scale=0.9))

# the in-app logo, for dark and for light surfaces
save('logo-mark.png', mark(512, GOLD, scale=1.0))
save('logo-mark-dark.png', mark(512, INK, scale=1.0))

# Android draws the status-bar icon from its shape alone: white on transparent, no ring
save('notification-icon.png', mark(96, WHITE, ring=False, scale=1.25))


# ---------------------------------------------------------------- sounds
RATE = 44100


def note(freq, duration, volume=1.0, decay=6.0, partials=((1.0, 1.0),), attack=0.004):
    """One struck note: a few harmonics that fade away, like a bell or a marimba bar."""
    total = int(RATE * duration)
    samples = []
    for i in range(total):
        t = i / RATE
        envelope = min(1.0, t / attack) * math.exp(-decay * t)
        value = sum(amp * math.sin(2 * math.pi * freq * ratio * t) for ratio, amp in partials)
        samples.append(volume * envelope * value)
    return samples


def mix(parts, length):
    """Lays notes at their start times (seconds) on one track."""
    track = [0.0] * int(RATE * length)
    for start, samples in parts:
        offset = int(RATE * start)
        for i, value in enumerate(samples):
            if offset + i < len(track):
                track[offset + i] += value
    return track


def write(name, track):
    peak = max(abs(v) for v in track) or 1.0
    scale = 0.8 / peak
    fade = int(RATE * 0.02)
    with wave.open(os.path.join(OUT, 'sounds', name), 'wb') as file:
        file.setnchannels(1)
        file.setsampwidth(2)
        file.setframerate(RATE)
        frames = bytearray()
        for i, value in enumerate(track):
            tail = min(1.0, (len(track) - i) / fade)   # no click at the end
            frames += struct.pack('<h', int(max(-1, min(1, value * scale * tail)) * 32767))
        file.writeframes(bytes(frames))
    print('wrote sounds/' + name, f'{len(track) / RATE:.2f}s')


BELL = ((1.0, 1.0), (2.0, 0.35), (3.0, 0.12))          # warm
MARIMBA = ((1.0, 1.0), (4.0, 0.25))                     # woody
COIN = ((1.0, 1.0), (2.76, 0.5), (5.4, 0.25))           # metallic
SQUARE = ((1.0, 1.0), (3.0, 0.33), (5.0, 0.2))          # buzzy

# A new or confirmed booking: a bright rising arpeggio.
write('bookings.wav', mix([
    (0.00, note(523.25, 0.7, decay=6, partials=BELL)),
    (0.12, note(659.25, 0.7, decay=6, partials=BELL)),
    (0.24, note(783.99, 0.7, decay=6, partials=BELL)),
    (0.36, note(1046.5, 0.9, decay=5, partials=BELL)),
], 1.3))

# An offer to look at: two quick pings, the second higher.
write('offers.wav', mix([
    (0.00, note(880.0, 0.5, decay=9, partials=BELL)),
    (0.17, note(1318.5, 0.6, decay=8, partials=BELL)),
], 0.85))

# Something on the road: a doorbell "ding-dong".
write('trips.wav', mix([
    (0.00, note(659.25, 1.0, decay=4.2, partials=BELL)),
    (0.38, note(523.25, 1.1, decay=4.0, partials=BELL)),
], 1.5))

# Money: a coin drop.
write('payments.wav', mix([
    (0.00, note(987.77, 0.18, decay=14, partials=COIN, attack=0.002)),
    (0.09, note(1318.5, 0.8, decay=5.5, partials=COIN, attack=0.002)),
], 1.0))

# Something went wrong: three firm beeps, the last one lower.
write('alerts.wav', mix([
    (0.00, note(880.0, 0.16, volume=0.9, decay=3, partials=SQUARE, attack=0.002)),
    (0.22, note(880.0, 0.16, volume=0.9, decay=3, partials=SQUARE, attack=0.002)),
    (0.44, note(587.33, 0.30, volume=0.9, decay=3, partials=SQUARE, attack=0.002)),
], 0.85))

# A message from support: soft, friendly marimba.
write('support.wav', mix([
    (0.00, note(783.99, 0.45, decay=11, partials=MARIMBA)),
    (0.13, note(1174.66, 0.55, decay=10, partials=MARIMBA)),
], 0.8))

# Everything else: one gentle bell.
write('updates.wav', mix([
    (0.00, note(1046.5, 1.0, decay=5.5, partials=BELL)),
], 1.1))
