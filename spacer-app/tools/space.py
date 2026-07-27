"""Backdrop, engine and explosion textures.

Interstellar's space is almost monochrome: a black that is genuinely black,
cold white stars, and one warm light source — Gargantua's accretion disk. The
starfields here drop the rainbow palette of the original assets for that,
keeping only a couple of amber stars so the warm end of the range still exists.

The three parallax layers tile, so everything is drawn with wrapped coordinates;
a star clipped at an edge would show up as a seam every 384px on screen.
"""

from __future__ import annotations

import math

from pixel import Canvas, RGBA, mix, rgba, seeded

TILE = 128

VOID = rgba("#04050a")
DUST = rgba("#0a0d16")
DUST_WARM = rgba("#120e12")

STAR_WHITE = rgba("#ffffff")
STAR_COLD = rgba("#cfe4ff")
STAR_DIM = rgba("#8fa6c4")
STAR_FAINT = rgba("#54627a")
STAR_AMBER = rgba("#e8b06a")

DISK_CORE = rgba("#fff6e4")
DISK_HOT = rgba("#ffd79a")
DISK_MID = rgba("#f0a24a")
DISK_EDGE = rgba("#b9611d")
DISK_FAINT = rgba("#6d3510")
EVENT_HORIZON = rgba("#000000")

PLUME_CORE = rgba("#ffffff")
PLUME_HOT = rgba("#dff1ff")
PLUME_MID = rgba("#93c9f6")
PLUME_EDGE = rgba("#4a8fd0")
PLUME_FAINT = rgba("#2a5684")

BLAST_WHITE = rgba("#fffdf6")
BLAST_HOT = rgba("#ffe6a8")
BLAST_MID = rgba("#ffa63f")
BLAST_EDGE = rgba("#d9581c")
BLAST_SMOKE = rgba("#4a3428")


def _wrap(c: Canvas, x: int, y: int, color: RGBA) -> None:
    c.px(x % c.width, y % c.height, color)


def _star_cross(c: Canvas, x: int, y: int, arm: int, core: RGBA, tip: RGBA) -> None:
    _wrap(c, x, y, core)
    for i in range(1, arm + 1):
        shade = mix(core, tip, i / arm)
        _wrap(c, x + i, y, shade)
        _wrap(c, x - i, y, shade)
        _wrap(c, x, y + i, shade)
        _wrap(c, x, y - i, shade)
    if arm >= 2:
        for dx, dy in ((1, 1), (1, -1), (-1, 1), (-1, -1)):
            _wrap(c, x + dx, y + dy, tip)


def space_layer() -> Canvas:
    """The opaque backdrop: black, with barely-there dust and the faintest stars."""
    c = Canvas(TILE, TILE)
    c.rect(0, 0, TILE - 1, TILE - 1, VOID)

    rng = seeded(20141107)  # Interstellar's release date, for a stable field

    # Two soft dust banks. Kept very low contrast — this layer tiles every 384px
    # on screen and any visible structure would advertise the repeat.
    for _ in range(3):
        cx, cy = rng.randrange(TILE), rng.randrange(TILE)
        radius = rng.randint(26, 44)
        tint = DUST if rng.random() < 0.7 else DUST_WARM
        for y in range(cy - radius, cy + radius):
            for x in range(cx - radius, cx + radius):
                d = math.hypot(x - cx, y - cy) / radius
                if d < 1.0 and rng.random() < (1.0 - d) * 0.30:
                    _wrap(c, x, y, tint)

    for _ in range(26):
        _wrap(c, rng.randrange(TILE), rng.randrange(TILE), STAR_FAINT)
    for _ in range(10):
        _wrap(c, rng.randrange(TILE), rng.randrange(TILE), STAR_DIM)

    return c


def far_stars_layer() -> Canvas:
    """Mid-distance field: single cold pixels, nothing ornamental."""
    c = Canvas(TILE, TILE)
    rng = seeded(1997)

    for _ in range(54):
        x, y = rng.randrange(TILE), rng.randrange(TILE)
        roll = rng.random()
        if roll < 0.62:
            _wrap(c, x, y, STAR_DIM)
        elif roll < 0.92:
            _wrap(c, x, y, STAR_COLD)
        else:
            _wrap(c, x, y, STAR_AMBER)

    # A handful of slightly brighter pinpoints with a one-pixel cross.
    for _ in range(7):
        _star_cross(c, rng.randrange(TILE), rng.randrange(TILE), 1, STAR_COLD, STAR_FAINT)

    return c


def close_stars_layer() -> Canvas:
    """Foreground field: flared stars that streak past fastest."""
    c = Canvas(TILE, TILE)
    rng = seeded(2067)

    for _ in range(9):
        _star_cross(c, rng.randrange(TILE), rng.randrange(TILE), 2, STAR_WHITE, STAR_DIM)
    for _ in range(5):
        _star_cross(c, rng.randrange(TILE), rng.randrange(TILE), 3, STAR_WHITE, STAR_COLD)
    for _ in range(2):
        _star_cross(c, rng.randrange(TILE), rng.randrange(TILE), 2, STAR_AMBER, STAR_FAINT)
    for _ in range(12):
        _wrap(c, rng.randrange(TILE), rng.randrange(TILE), STAR_COLD)

    return c


GARGANTUA_SIZE = 96


def gargantua() -> Canvas:
    """Gargantua: an edge-on accretion disk, lensed into a halo around the hole.

    Three pieces, drawn in the order light reaches the camera — the far side of
    the disk bent up over the top, the black hole itself, then the near side
    crossing in front of its lower edge.
    """
    c = Canvas(GARGANTUA_SIZE, GARGANTUA_SIZE)
    cx = cy = (GARGANTUA_SIZE - 1) / 2
    horizon = 11.5

    # The far side of the disk, gravity-bent into a thin halo. A narrow band,
    # not a glow — the shape is what makes it read as lensing.
    halo_inner, halo_outer = 14.0, 18.5
    for y in range(GARGANTUA_SIZE):
        for x in range(GARGANTUA_SIZE):
            d = math.hypot(x - cx, y - cy)
            if not (halo_inner <= d <= halo_outer):
                continue
            t = (d - halo_inner) / (halo_outer - halo_inner)
            # Brightest just outside the shadow, falling away outward.
            colour = mix(DISK_HOT, DISK_EDGE, t**0.8)
            if t < 0.18:
                colour = mix(DISK_CORE, DISK_HOT, t / 0.18)
            c.px(x, y, colour)

    # The flat disk, seen almost edge-on, running out past the halo both ways.
    for x in range(GARGANTUA_SIZE):
        dx = abs(x - cx)
        falloff = max(0.0, 1.0 - dx / (GARGANTUA_SIZE / 2))
        thickness = 0.4 + falloff * 2.6
        for dy in range(-4, 5):
            if abs(dy) > thickness:
                continue
            t = abs(dy) / max(thickness, 1e-6)
            colour = mix(DISK_CORE, DISK_MID, min(1.0, t * 0.8 + (1.0 - falloff) * 0.5))
            if dx > 34:
                colour = mix(colour, DISK_FAINT, min(1.0, (dx - 34) / 14.0))
            c.px(x, cy + dy, colour)

    # The shadow, punched through everything behind it.
    c.disc(cx, cy, horizon, EVENT_HORIZON)
    # Photon ring: a hard, thin, bright edge hugging the shadow.
    c.ring(cx, cy, horizon - 0.4, horizon + 0.9, DISK_CORE)

    # The near side of the disk passes in front of the shadow's lower half.
    for x in range(GARGANTUA_SIZE):
        dx = abs(x - cx)
        if dx > halo_outer:
            continue
        lift = (1.0 - (dx / halo_outer) ** 2) * 3.0
        arc = cy + 2.0 + lift
        c.px(x, arc - 1, DISK_HOT)
        c.px(x, arc, DISK_CORE)
        c.px(x, arc + 1, mix(DISK_HOT, DISK_MID, 0.5))

    return c


def turbo_plume() -> Canvas:
    """Two-frame engine plume: a white throat fading to cold blue.

    The plume starts six rows above the frame centre, which is the contract
    `tools/ships.py` uses when it turns nozzle positions into thruster offsets.
    """
    frames = []
    for length, spread in ((16, 3.0), (12, 2.5)):
        f = Canvas(48, 48)
        top = 18
        for i in range(length):
            y = top + i
            t = i / (length - 1)
            outer = spread * (1.0 - t) ** 0.75
            inner = outer * 0.45

            if t < 0.30:
                envelope = PLUME_HOT
            elif t < 0.60:
                envelope = PLUME_MID
            elif t < 0.85:
                envelope = PLUME_EDGE
            else:
                envelope = PLUME_FAINT

            # Even-width spans centred on column 23.5 — the same mirror axis the
            # hull sprites use, so a plume lines up with its engine exactly.
            half = max(1, round(outer))
            for x in range(24 - half, 24 + half):
                f.px(x, y, envelope)

            core = PLUME_CORE if t < 0.40 else PLUME_HOT if t < 0.70 else PLUME_MID
            half = max(1, round(inner))
            for x in range(24 - half, 24 + half):
                f.px(x, y, core)
        frames.append(f)

    from pixel import strip

    return strip(frames)


def explosion() -> Canvas:
    """Seven frames: white flash, fireball, then debris and smoke."""
    rng = seeded(4077)
    debris = [
        (math.cos(a) * 1.0, math.sin(a) * 1.0)
        for a in [rng.uniform(0, math.tau) for _ in range(14)]
    ]

    frames = []
    steps = [
        (3.5, BLAST_WHITE, BLAST_WHITE, 0.0),
        (8.0, BLAST_WHITE, BLAST_HOT, 0.0),
        (13.0, BLAST_WHITE, BLAST_MID, 0.0),
        (17.5, BLAST_HOT, BLAST_EDGE, 0.28),
        (20.5, BLAST_MID, BLAST_EDGE, 0.55),
        (22.5, BLAST_EDGE, BLAST_SMOKE, 0.76),
        (23.5, BLAST_SMOKE, BLAST_SMOKE, 0.88),
    ]

    for index, (radius, inner, outer, hollow) in enumerate(steps):
        f = Canvas(48, 48)
        cx = cy = 23.5
        for y in range(48):
            for x in range(48):
                d = math.hypot(x - cx, y - cy)
                if d > radius:
                    continue
                t = d / radius
                if t < hollow:
                    continue
                shade = mix(inner, outer, (t - hollow) / max(1e-6, 1 - hollow))
                # A ragged rim rather than a perfect circle.
                if t > 0.82 and rng.random() < 0.35:
                    continue
                f.px(x, y, shade)
        # Debris thrown clear of the fireball.
        if index >= 2:
            for dx, dy in debris:
                dist = radius * (0.85 + index * 0.10)
                colour = BLAST_HOT if index < 4 else BLAST_SMOKE
                f.px(cx + dx * dist, cy + dy * dist, colour)
        frames.append(f)

    from pixel import strip

    return strip(frames)
