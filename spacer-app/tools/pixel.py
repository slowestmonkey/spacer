"""A tiny pixel-art toolkit for generating Spacer's sprites.

The art is authored as code rather than painted, so a hull can be re-shaped by
moving a couple of numbers instead of editing pixels by hand. Everything is
drawn on an integer grid with no anti-aliasing — the game samples every texture
with nearest-neighbour filtering, so a stray half-transparent pixel would show
up as a blurred block on screen.
"""

from __future__ import annotations

import math
import random
from pathlib import Path

from PIL import Image

RGBA = tuple[int, int, int, int]


def rgba(value: str, alpha: int = 255) -> RGBA:
    """`"#rrggbb"` -> an RGBA tuple."""
    value = value.lstrip("#")
    return (int(value[0:2], 16), int(value[2:4], 16), int(value[4:6], 16), alpha)


def mix(a: RGBA, b: RGBA, t: float) -> RGBA:
    return (
        round(a[0] + (b[0] - a[0]) * t),
        round(a[1] + (b[1] - a[1]) * t),
        round(a[2] + (b[2] - a[2]) * t),
        round(a[3] + (b[3] - a[3]) * t),
    )


TRANSPARENT: RGBA = (0, 0, 0, 0)


class Canvas:
    def __init__(self, width: int, height: int):
        self.width = width
        self.height = height
        self.pixels: list[list[RGBA]] = [
            [TRANSPARENT for _ in range(width)] for _ in range(height)
        ]

    # ---- primitives ----------------------------------------------------

    def px(self, x: float, y: float, color: RGBA) -> None:
        x, y = round(x), round(y)
        if 0 <= x < self.width and 0 <= y < self.height:
            self.pixels[y][x] = color

    def get(self, x: int, y: int) -> RGBA:
        if 0 <= x < self.width and 0 <= y < self.height:
            return self.pixels[y][x]
        return TRANSPARENT

    def rect(self, x0: int, y0: int, x1: int, y1: int, color: RGBA) -> None:
        for y in range(min(y0, y1), max(y0, y1) + 1):
            for x in range(min(x0, x1), max(x0, x1) + 1):
                self.px(x, y, color)

    def line(self, x0: int, y0: int, x1: int, y1: int, color: RGBA) -> None:
        steps = max(abs(x1 - x0), abs(y1 - y0))
        if steps == 0:
            self.px(x0, y0, color)
            return
        for i in range(steps + 1):
            t = i / steps
            self.px(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, color)

    def disc(self, cx: float, cy: float, radius: float, color: RGBA) -> None:
        for y in range(self.height):
            for x in range(self.width):
                if (x - cx) ** 2 + (y - cy) ** 2 <= radius * radius:
                    self.px(x, y, color)

    def ring(self, cx: float, cy: float, inner: float, outer: float, color: RGBA) -> None:
        for y in range(self.height):
            for x in range(self.width):
                d2 = (x - cx) ** 2 + (y - cy) ** 2
                if inner * inner <= d2 <= outer * outer:
                    self.px(x, y, color)

    # ---- profile-driven shapes ----------------------------------------

    @staticmethod
    def _interp(points: list[tuple[float, float]], y: float) -> float:
        """Linear interpolation through `(row, x)` control points."""
        if y <= points[0][0]:
            return points[0][1]
        if y >= points[-1][0]:
            return points[-1][1]
        for (y0, x0), (y1, x1) in zip(points, points[1:]):
            if y0 <= y <= y1:
                if y1 == y0:
                    return x1
                return x0 + (x1 - x0) * (y - y0) / (y1 - y0)
        return points[-1][1]

    def region(
        self,
        left: list[tuple[float, float]],
        right: list[tuple[float, float]],
        color: RGBA,
    ) -> None:
        """Fill between two `(row, x)` edge profiles, row by row."""
        y0 = math.ceil(max(left[0][0], right[0][0]))
        y1 = math.floor(min(left[-1][0], right[-1][0]))
        for y in range(y0, y1 + 1):
            xl = round(self._interp(left, y))
            xr = round(self._interp(right, y))
            for x in range(min(xl, xr), max(xl, xr) + 1):
                self.px(x, y, color)

    # ---- transforms ----------------------------------------------------

    def mirror_x(self) -> None:
        """Reflect the left half onto the right — every craft here is symmetric."""
        for y in range(self.height):
            for x in range(self.width // 2):
                self.pixels[y][self.width - 1 - x] = self.pixels[y][x]

    def outline(self, color: RGBA) -> None:
        """Wrap the silhouette in a one-pixel darker edge, drawn outside it."""
        edges = []
        for y in range(self.height):
            for x in range(self.width):
                if self.pixels[y][x][3] != 0:
                    continue
                neighbours = [
                    self.get(x - 1, y),
                    self.get(x + 1, y),
                    self.get(x, y - 1),
                    self.get(x, y + 1),
                ]
                if any(n[3] != 0 for n in neighbours):
                    edges.append((x, y))
        for x, y in edges:
            self.px(x, y, color)

    def shade_edges(self, color: RGBA) -> None:
        """Darken opaque pixels that sit on the silhouette boundary."""
        edges = []
        for y in range(self.height):
            for x in range(self.width):
                if self.pixels[y][x][3] == 0:
                    continue
                if any(
                    self.get(nx, ny)[3] == 0
                    for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1))
                ):
                    edges.append((x, y))
        for x, y in edges:
            self.px(x, y, color)

    def paste(self, other: "Canvas", ox: int, oy: int) -> None:
        for y in range(other.height):
            for x in range(other.width):
                pixel = other.pixels[y][x]
                if pixel[3] != 0:
                    self.px(x + ox, y + oy, pixel)

    # ---- output --------------------------------------------------------

    def to_image(self) -> Image.Image:
        image = Image.new("RGBA", (self.width, self.height))
        image.putdata([pixel for row in self.pixels for pixel in row])
        return image

    def save(self, path: Path) -> None:
        path.parent.mkdir(parents=True, exist_ok=True)
        self.to_image().save(path)


def strip(frames: list[Canvas]) -> Canvas:
    """Lay frames out left to right, the sprite-sheet layout the game expects."""
    width = sum(frame.width for frame in frames)
    sheet = Canvas(width, frames[0].height)
    x = 0
    for frame in frames:
        sheet.paste(frame, x, 0)
        x += frame.width
    return sheet


def seeded(seed: int) -> random.Random:
    return random.Random(seed)
