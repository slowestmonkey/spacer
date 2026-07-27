#!/usr/bin/env python3
"""Regenerate every sprite in `assets/`.

    cd spacer-app/tools && python3 generate.py

The art direction is Interstellar: hard vacuum black, bleached white hulls, one
warm light source. Editing a hull means editing `ships.py` and re-running this;
the PNGs are build output that happens to be committed.

It also prints the thruster offsets derived from where each hull's nozzles were
drawn — paste them into `src/components/shipGeometry.ts` if a hull moves.
"""

from __future__ import annotations

import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

import ships
import space

ASSETS = Path(__file__).resolve().parent.parent / "assets"


def main() -> None:
    for hull, canvas in sorted(ships.build_all().items()):
        path = ASSETS / "ships" / f"ship_{hull}.png"
        canvas.save(path)
        print(f"  {path.relative_to(ASSETS.parent)}  ({ships.NAMES[hull]})")

    space.space_layer().save(ASSETS / "space" / "space.png")
    space.far_stars_layer().save(ASSETS / "space" / "far_stars.png")
    space.close_stars_layer().save(ASSETS / "space" / "close_stars.png")
    space.gargantua().save(ASSETS / "space" / "gargantua.png")
    space.turbo_plume().save(ASSETS / "effects" / "turbo_blue.png")
    space.explosion().save(ASSETS / "effects" / "explosion.png")
    print("  assets/space/{space,far_stars,close_stars,gargantua}.png")
    print("  assets/effects/{turbo_blue,explosion}.png")

    print("\nTHRUSTER_OFFSETS for src/components/shipGeometry.ts:")
    offsets = ships.export_engine_offsets()
    print("  0: { left: { x: %d, y: %d }, right: { x: %d, y: %d } }," % (
        *offsets[1]["left"], *offsets[1]["right"]))
    for hull in sorted(offsets):
        left, right = offsets[hull]["left"], offsets[hull]["right"]
        print(
            "  %d: { left: { x: %d, y: %d }, right: { x: %d, y: %d } },  // %s"
            % (hull, left[0], left[1], right[0], right[1], ships.NAMES[hull])
        )


if __name__ == "__main__":
    main()
