"""The six selectable hulls, drawn as 48x48 top-down sprites.

Every craft is modelled on something from Interstellar: the Ranger and the
Lander, the Endurance ring, TARS and CASE, and a Lazarus mission pod. They are
drawn nose-up because `world.tscn` flies the ship straight at the screen top.

`ENGINES` records where each hull's nozzles sit, in sprite pixels. That is the
single source of truth for the thruster offsets the game uses — see
`export_engine_offsets()`.
"""

from __future__ import annotations

from pixel import Canvas, RGBA, rgba

SIZE = 48
CENTRE = 23  # last column of the left half; sprites are mirrored about 23/24

# Interstellar's palette: bleached white hulls, gunmetal shadow, a single muted
# NASA orange, and cold blue glass. Nothing saturated.
WHITE = rgba("#e6e9ee")
HULL = rgba("#c2c8d2")
HULL_MID = rgba("#939bab")
HULL_DARK = rgba("#5f6775")
SHADOW = rgba("#3b414d")
PANEL = rgba("#252b35")
NEAR_BLACK = rgba("#12151b")
GLASS = rgba("#24405c")
GLASS_HI = rgba("#8fc0e0")
ACCENT = rgba("#c0562c")
ACCENT_DIM = rgba("#7d3a20")
GOLD = rgba("#c2a05f")
ENGINE = rgba("#2a2f38")
ENGINE_HOT = rgba("#9fd4ff")
STATUS = rgba("#e0b45a")
SOLAR = rgba("#1d2b4a")
SOLAR_HI = rgba("#2f4470")

# hull number -> ((left engine x, y), (right engine x, y)) in sprite pixels
ENGINES: dict[int, tuple[tuple[int, int], tuple[int, int]]] = {}


def _nozzle(c: Canvas, x0: int, x1: int, y0: int, y1: int) -> None:
    """An engine bell: dark housing, one hot pixel row at the throat."""
    c.rect(x0, y0, x1, y1, ENGINE)
    c.rect(x0, y0, x1, y0, HULL_DARK)
    c.rect(x0 + 1, y1 - 1, x1 - 1, y1 - 1, ENGINE_HOT)


def _ranger() -> Canvas:
    """Ranger — the single-stage lifting body the crew flies down to the planets."""
    c = Canvas(SIZE, SIZE)

    # Cranked delta, swept hard back from the mid-fuselage.
    c.region([(23, 18), (40, 2), (45, 3)], [(23, 18), (40, 17), (45, 16)], HULL_MID)
    c.region([(26, 16), (45, 13)], [(26, 23), (45, 23)], HULL)

    # Lifting-body fuselage: a blunt wedge nose opening into a broad tail.
    c.region(
        [(7, 21), (11, 20), (16, 19), (23, 18), (31, 17), (40, 17), (47, 17)],
        [(7, 23), (47, 23)],
        HULL,
    )
    # Spine highlight and flank shading.
    c.region([(7, 22), (47, 20)], [(7, 23), (47, 23)], WHITE)
    c.region([(14, 20), (40, 17)], [(14, 21), (40, 18)], HULL_MID)

    # Black thermal leading edge along the wing.
    c.line(23, 23, 3, 40, NEAR_BLACK)
    c.line(22, 23, 3, 39, NEAR_BLACK)
    c.rect(2, 40, 5, 45, PANEL)

    # Canopy, set into the nose — narrow, so it reads as glass and not a hole.
    c.region([(12, 22), (14, 21), (19, 21), (20, 22)], [(12, 23), (20, 23)], GLASS)
    c.rect(21, 12, 23, 12, GLASS_HI)

    # One mission stripe down the spine (mirrors into a 2px centre line).
    c.rect(23, 26, 23, 42, ACCENT)
    c.rect(10, 36, 14, 37, ACCENT_DIM)

    # Panel lines.
    c.rect(20, 32, 23, 32, HULL_MID)
    c.rect(18, 41, 23, 41, HULL_MID)

    _nozzle(c, 17, 20, 43, 47)

    c.mirror_x()
    c.shade_edges(SHADOW)
    ENGINES[1] = ((18, 47), (29, 47))
    return c


def _lander() -> Canvas:
    """Lander — the blunt, four-engine workhorse that carries the heavy gear."""
    c = Canvas(SIZE, SIZE)

    # Landing struts, braced out from the hull to wide footpads.
    c.region([(20, 12), (36, 4)], [(20, 14), (36, 6)], HULL_DARK)
    c.rect(2, 36, 8, 38, HULL_DARK)
    c.rect(2, 38, 8, 38, SHADOW)

    # Squat slab body, carried down far enough to seat the engine pods.
    c.region(
        [(9, 19), (13, 13), (33, 12), (38, 14), (44, 15)],
        [(9, 23), (44, 23)],
        HULL,
    )
    # Shoulder shading and a bright top deck.
    c.region([(13, 13), (38, 13)], [(13, 15), (38, 15)], HULL_MID)
    c.region([(12, 18), (34, 18)], [(12, 23), (34, 23)], WHITE)

    # Forward windows.
    c.rect(16, 15, 22, 17, GLASS)
    c.px(21, 16, GLASS_HI)

    # Gold MLI blanket around the mid-section, like the film's cargo wrap.
    c.rect(13, 25, 23, 27, GOLD)
    c.rect(13, 26, 23, 26, ACCENT_DIM)

    # Hull panelling.
    c.rect(13, 32, 23, 32, HULL_MID)
    c.rect(19, 20, 19, 40, HULL_MID)
    c.rect(14, 36, 23, 36, HULL_MID)
    c.rect(10, 40, 23, 41, HULL_DARK)

    # Two nozzles per side: outboard pod and inboard pod.
    _nozzle(c, 11, 15, 41, 46)
    _nozzle(c, 18, 22, 41, 45)

    c.mirror_x()
    c.shade_edges(SHADOW)
    ENGINES[2] = ((13, 46), (34, 46))
    return c


def _endurance() -> Canvas:
    """Endurance — the twelve-module ring, seen down its axis."""
    c = Canvas(SIZE, SIZE)
    cx = cy = 23.5

    c.ring(cx, cy, 15.0, 21.5, HULL)
    c.ring(cx, cy, 15.0, 16.6, HULL_DARK)
    c.ring(cx, cy, 20.2, 21.5, HULL_MID)
    c.ring(cx, cy, 17.4, 19.4, WHITE)

    # Twelve module joints.
    import math

    for i in range(12):
        angle = math.pi * 2 * i / 12
        for r in range(15, 22):
            c.px(cx + math.cos(angle) * r, cy + math.sin(angle) * r, SHADOW)

    # Four modules carry the orange mission markings.
    for i in (1, 4, 7, 10):
        angle = math.pi * 2 * (i + 0.5) / 12
        for r in range(17, 21):
            c.px(cx + math.cos(angle) * r, cy + math.sin(angle) * r, ACCENT)

    # Docking hub and its struts.
    for i in range(4):
        angle = math.pi * 2 * i / 4 + math.pi / 4
        for r in range(5, 16):
            c.px(cx + math.cos(angle) * r, cy + math.sin(angle) * r, SHADOW)
    c.disc(cx, cy, 5.2, HULL)
    c.disc(cx, cy, 3.4, PANEL)
    c.disc(cx, cy, 1.8, GLASS_HI)

    c.shade_edges(SHADOW)
    ENGINES[3] = ((16, 44), (31, 44))
    return c


def _tars() -> Canvas:
    """TARS — four slabs locked together in the block configuration."""
    c = Canvas(SIZE, SIZE)

    slabs = ((11, 16), (18, 23), (24, 29), (31, 36))
    for i, (x0, x1) in enumerate(slabs):
        # Rounded lighting across each slab so it reads as a solid block.
        c.rect(x0, 6, x1, 42, HULL_DARK)
        c.rect(x0, 6, x0 + 1, 42, HULL_MID)
        c.rect(x1 - 1, 6, x1, 42, SHADOW)
        # Machined cap and foot.
        c.rect(x0, 6, x1, 7, HULL_MID)
        c.rect(x0, 41, x1, 42, PANEL)
        # Two articulation seams, not a whole ladder of them.
        for y in (20, 31):
            c.rect(x0, y, x1, y, PANEL)
        if i in (1, 2):
            c.rect(x0 + 1, 11, x1 - 1, 14, PANEL)
            c.rect(x0 + 1, 12, x1 - 1, 12, STATUS)

    # Gaps between the slabs read as deep shadow.
    for x in (17, 30):
        c.rect(x, 6, x, 42, NEAR_BLACK)

    c.shade_edges(SHADOW)
    ENGINES[4] = ((13, 44), (34, 44))
    return c


def _case() -> Canvas:
    """CASE — the same monolith, splayed into its walking configuration."""
    c = Canvas(SIZE, SIZE)

    # Two inner slabs stay upright.
    for x0, x1 in ((20, 23), (24, 27)):
        c.rect(x0, 9, x1, 39, HULL_DARK)
        c.rect(x0, 9, x1, 10, HULL_MID)
        c.rect(x0, 38, x1, 39, PANEL)
        for y in (18, 27):
            c.rect(x0, y, x1, y, PANEL)
    c.rect(20, 14, 27, 16, PANEL)
    c.rect(20, 15, 27, 15, GLASS_HI)

    # Outer slabs cant away at the base, like the walking gait.
    c.region([(10, 15), (26, 13), (40, 7)], [(10, 19), (26, 17), (40, 11)], HULL_DARK)
    c.region([(10, 15), (40, 7)], [(10, 16), (40, 8)], HULL_MID)
    c.region([(10, 18), (40, 10)], [(10, 19), (40, 11)], SHADOW)
    for y in (18, 27, 36):
        c.rect(round(15 - (y - 10) * 8 / 30), y, round(19 - (y - 10) * 8 / 30), y, PANEL)

    c.mirror_x()
    c.rect(19, 9, 19, 39, NEAR_BLACK)
    c.rect(28, 9, 28, 39, NEAR_BLACK)
    c.shade_edges(SHADOW)
    ENGINES[5] = ((13, 41), (34, 41))
    return c


def _pod() -> Canvas:
    """Lazarus pod — the one-way capsule the first twelve rode out on."""
    c = Canvas(SIZE, SIZE)

    # Solar wings.
    c.rect(4, 20, 16, 29, SOLAR)
    for x in range(5, 17, 3):
        c.rect(x, 20, x, 29, SOLAR_HI)
    c.rect(4, 24, 16, 24, SOLAR_HI)
    c.rect(4, 19, 16, 19, HULL_DARK)
    c.rect(4, 30, 16, 30, HULL_DARK)
    c.rect(16, 23, 18, 26, HULL_MID)

    # Capsule: conical heat shield up front, cylinder behind.
    c.region([(9, 23), (13, 20), (17, 18), (36, 18), (39, 20)], [(9, 23), (39, 23)], HULL)
    c.region([(11, 22), (17, 20), (36, 20)], [(11, 23), (36, 23)], WHITE)
    c.region([(9, 23), (13, 21), (17, 19)], [(9, 23), (17, 23)], HULL_MID)

    # Ablative shield tip and a hatch window.
    c.region([(9, 23), (12, 21)], [(9, 23), (12, 23)], PANEL)
    c.rect(20, 24, 22, 27, GLASS)
    c.px(22, 25, GLASS_HI)

    # Mission banding.
    c.rect(18, 31, 22, 32, ACCENT)
    c.rect(18, 34, 22, 34, GOLD)

    # Single retro nozzle.
    _nozzle(c, 19, 22, 40, 45)

    c.mirror_x()
    c.shade_edges(SHADOW)
    ENGINES[6] = ((21, 44), (26, 44))
    return c


BUILDERS = {
    1: _ranger,
    2: _lander,
    3: _endurance,
    4: _tars,
    5: _case,
    6: _pod,
}

NAMES = {
    1: "Ranger",
    2: "Lander",
    3: "Endurance",
    4: "TARS",
    5: "CASE",
    6: "Lazarus Pod",
}


def build_all() -> dict[int, Canvas]:
    return {hull: builder() for hull, builder in BUILDERS.items()}


def export_engine_offsets() -> dict[int, dict[str, tuple[int, int]]]:
    """Engine positions -> the thruster offsets `ship.gd` used to hard-code.

    A thruster frame is 48x48 with the plume starting six rows above its centre,
    so the sprite is centred six pixels past the nozzle to make the flame leave
    the engine bell.
    """
    offsets = {}
    for hull, (left, right) in ENGINES.items():
        offsets[hull] = {
            "left": (left[0] - 24, (left[1] - 24) + 6),
            "right": (right[0] - 24, (right[1] - 24) + 6),
        }
    return offsets
