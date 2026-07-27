# Spacer — React Native

A React Native (Expo) port of the Godot version of Spacer that lives in the parent directory.

The **game** is a faithful port: the same model, the same numbers, the same scene coordinates. Where
the logic differs, it is listed under [Deliberate deviations](#deliberate-deviations).

The **art** is not a port. Every sprite was redrawn around Interstellar — see [Art](#art).

## Running it

```bash
npm install
```

The app uses [React Native Skia](https://shopify.github.io/react-native-skia/), which is a native
module, so it needs a development build rather than Expo Go:

```bash
npx expo run:ios
```

If CocoaPods trips over the locale, prefix the command with `LANG=en_US.UTF-8 LC_ALL=en_US.UTF-8`.

Other scripts:

```bash
npm test          # jest
npm run typecheck # tsc --noEmit
```

The pure game logic is tested directly; the screens are rendered with
`@testing-library/react-native` (Skia and Reanimated are stubbed in `jest.setup.js`,
since neither draws anything a test can assert on).

## How the port maps onto the Godot project

| Godot | React Native |
| --- | --- |
| `project.godot` (viewport 393x852, stretch `viewport`, portrait, nearest filtering) | `src/game/constants.ts`, `src/game/stageMetrics.ts`, `app.json` |
| `world.tscn` + `world.gd` | `src/screens/WorldScreen.tsx` |
| `menus/start_menu.*` | `src/screens/StartMenuScreen.tsx` |
| `menus/hangar.*` | `src/screens/HangarScreen.tsx`, `src/screens/hangarLayout.ts`, `src/components/ShipCarousel.tsx` |
| `menus/game_over.*` | `src/screens/GameOverScreen.tsx` |
| `player_ship/ship.tscn` + `ship.gd` | `src/components/Ship.tsx`, `src/components/shipGeometry.ts` |
| `effects/space_background.*` | `src/components/SpaceBackground.tsx` |
| `effects/explosion_effect.tscn`, `components/onetime_animated_effect.gd` | `src/components/ExplosionEffect.tsx` |
| `components/spawner_component.gd`, `components/destroyed_component.gd` | folded into `WorldScreen.destroyShip()` and `shipGeometry.getShipDestroyPosition()` |
| `resources/goal.gd` + `goal.tres` | `src/models/Goal.ts` + `src/resources/index.ts` |
| `resources/step.gd` + `step.tres` | `src/models/Step.ts` + `src/resources/index.ts` |
| `world.gd -> validate_goal()` | `src/models/goalValidation.ts` |
| Godot `ConfigFile` on `user://settings.cfg` | `src/storage/ConfigFile.ts` (AsyncStorage) |
| Godot `Time` singleton | `src/time/godotTime.ts` |
| `get_tree().change_scene_to_file()` | `src/game/SceneContext.tsx` |
| `Engine.get_singleton("HealthKit")` | `src/health/healthKit.ts` |

## Art

The direction is Interstellar: hard vacuum black, bleached white hulls, cold starlight, and exactly one
warm light source in the sky. The palette is deliberately near-monochrome — the original assets' rainbow
stars are gone, leaving white and pale blue with a handful of amber pinpoints.

The six selectable hulls are the film's vehicles:

| Hull | Craft |
| --- | --- |
| 1 | **Ranger** — the delta lifting body, twin plasma nozzles |
| 2 | **Lander** — squat four-engine workhorse on braced landing struts |
| 3 | **Endurance** — the twelve-module ring, seen down its axis |
| 4 | **TARS** — four slabs locked in the block configuration |
| 5 | **CASE** — the same monolith, splayed into its walking gait |
| 6 | **Lazarus Pod** — one-way capsule with solar wings |

**Gargantua** hangs on the horizon of every scene: an edge-on accretion disk lensed into a halo around
the shadow, drawn once rather than tiled, and deliberately *not* scrolling — the parallax rushes past it
and it never gets any closer. Which is the game's premise.

It sits at the very back. React Native Skia sorts sibling groups by `zIndex` and treats a missing one as
`0`, so every layer in `SpaceBackground` carries an explicit index — leave one off and the opaque
backdrop sorts above the black hole and hides it. `spaceBackground.test.ts` locks that ordering down.

The parallax runs at `FLIGHT_SPEED` (0.4) of the Godot original's 100/200/500 px/s. At full speed the
nearest field crosses the screen in 1.7s, which at three pixels per star strobes rather than glides; the
ratios between the layers are untouched, so the depth cue is the same.

### Regenerating the sprites

The art is authored as code, so a hull can be reshaped by moving a few numbers instead of repainting
pixels. The PNGs in `assets/` are build output that happens to be committed.

```bash
cd tools && python3 generate.py   # needs Pillow
```

`tools/ships.py` holds the hulls, `tools/space.py` the starfields, Gargantua, the engine plume and the
explosion, and `tools/pixel.py` is the drawing toolkit. The generator also prints the thruster offsets
derived from where each hull's nozzles were actually drawn — paste them into
`src/components/shipGeometry.ts` so a redesigned engine cannot drift away from its flame.

### Keeping the pixels sharp

Godot renders the whole game to a fixed 393x852 viewport and scales that surface onto the device,
letterboxing the remainder (`window/stretch/mode = "viewport"`, `aspect = "keep"`). Every scene in this
port is authored against the same surface, so the coordinates in the `.tscn` files carry over unchanged.

Each scene is two layers:

- **`GameCanvas`** — a Skia canvas laid out at the device's full size, with the design-space transform
  applied *inside* the scene graph. Sprites are sampled with `FilterMode.Nearest`
  (Godot's `textures/canvas_textures/default_texture_filter = 0`), so the 48x48 art stays blocky at 3x
  and 5x instead of being smeared by bilinear filtering. Scaling a canvas *view* would rasterise at 1x
  and resample, which is exactly what pixel art must avoid.
- **`UiLayer`** — ordinary React Native views for text, the username field and the start button, scaled
  as one unit. Text stays vector-crisp at any scale.

The hangar's ship carousel straddles both: the thumbnails are drawn on the canvas so they get the same
nearest-neighbour upscale as everything else, while a transparent `ScrollView` sits on the same
rectangle to provide the scroll gesture. `src/screens/hangarLayout.ts` resolves that shared geometry.

## Apple Health

Neither project ships a HealthKit implementation — in the Godot build it is a separately compiled
`libHealthKitPlugin.a` you drop into `ios/plugins/healthkit`, and `resources/step.gd` falls back to
simulated numbers whenever `Engine.has_singleton("HealthKit")` is false.

The port keeps that contract. `src/models/Step.ts` asks `resolveHealthKit()` for a provider and
simulates when there is none, which is why the game is playable on a simulator. To wire up real data,
implement `HealthKitProvider` from `src/health/types.ts` and register it before the first scene mounts:

```ts
import { registerHealthKitProvider } from './src/health/healthKit';

registerHealthKitProvider({
  runTodayStepsQuery: () => { /* ... */ },
  runPeriodStepsQuery: (days) => { /* ... */ },
  getTodaySteps: () => todaySteps,
  getPeriodStepsDict: () => periodSteps,
});
```

`app.json` already declares `NSHealthShareUsageDescription`; a real provider will also need the HealthKit
entitlement adding to the iOS target.

## Deliberate deviations

Everything else is a straight port. These four are not:

1. **The hangar's preselected ship.** `hangar.gd` writes `selected_index + 1` in `save_selection()` but
   reads that number straight back into `selected_index` in `load_selection()`, so returning to the
   hangar preselects the ship *after* the one you picked. `shipHullToIndex()` converts the hull number
   back to an index.
2. **`destroy_ship()` runs once.** `validate_goal()` calls it once per missed day, which in Godot spawns
   one explosion per failure on top of an already-freed ship. The port guards it so a single explosion
   plays.
3. **Widget styling is approximated.** Godot's built-in theme draws the `Button`, `LineEdit` and
   `HScrollBar`; those are hand-written here from the theme's colours and metrics
   (`src/components/theme.ts`) rather than reimplemented exactly.
4. **Snap animation.** `hangar.gd` tweens the carousel to the nearest ship over 0.3s on release; the
   port uses the platform's `snapToInterval` with fast deceleration.

These are about the game logic; the art is a deliberate redesign rather than a port, described under
[Art](#art) above.

Two details that look like deviations but are not. Every `Label` draws in `#ffffff`, because all of
them carry a `LabelSettings` resource and none of the three sets `font_color` — `LabelSettings`
defaults to white, not to the theme's `#dfdfdf`, which reaches only the Start button and the username
field. And `app.json` uses `"orientation": "default"` to match `window/handheld/orientation = 6`
(`SCREEN_SENSOR`); the stage letterboxes a landscape window the same way Godot does.

One thing that is *not* a deviation, and is preserved on purpose: Godot formats timestamps in local time
but parses them as UTC (`Time.get_datetime_string_from_system()` vs
`Time.get_unix_time_from_datetime_string()`). Both sides of every comparison in the game go through the
same pair of calls, so the offset cancels; `src/time/godotTime.ts` reproduces it so goal expiry and goal
validation land on the same days as the Godot build.

`project.godot` also registers two autoloads, `resource_stash.gd` and `music_player.tscn`, whose files
are not in the repository — there was nothing to port.
