/**
 * Static asset registry. Metro needs literal `require` calls, so the ship
 * textures are mapped explicitly instead of being built from a path template
 * the way `player_ship/ship.gd` does it:
 *
 *   var texture_path = "res://assets/ships/ship_" + str(ship_hull) + ".png"
 */
export const SHIP_TEXTURES: Record<number, number> = {
  1: require('../../assets/ships/ship_1.png'),
  2: require('../../assets/ships/ship_2.png'),
  3: require('../../assets/ships/ship_3.png'),
  4: require('../../assets/ships/ship_4.png'),
  5: require('../../assets/ships/ship_5.png'),
  6: require('../../assets/ships/ship_6.png'),
};

/** Mirrors `ResourceLoader.exists("res://assets/ships/ship_N.png")`. */
export function shipTextureExists(shipHull: number): boolean {
  return Object.prototype.hasOwnProperty.call(SHIP_TEXTURES, shipHull);
}

export const SPACE_TEXTURE = require('../../assets/space/space.png');
export const FAR_STARS_TEXTURE = require('../../assets/space/far_stars.png');
export const CLOSE_STARS_TEXTURE = require('../../assets/space/close_stars.png');

/** Gargantua — drawn once, not tiled. The destination, never any closer. */
export const GARGANTUA_TEXTURE = require('../../assets/space/gargantua.png');

/** 96x48 sheet, 2 frames — `player_ship/ship.tscn` thruster SpriteFrames. */
export const TURBO_BLUE_TEXTURE = require('../../assets/effects/turbo_blue.png');

/** 336x48 sheet, 7 frames — `effects/explosion_effect.tscn`. */
export const EXPLOSION_TEXTURE = require('../../assets/effects/explosion.png');

export const KENNEY_MINI_SQUARE_FONT = require('../../assets/fonts/kenney_mini_square.ttf');
