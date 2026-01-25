---
active: true
iteration: 1
max_iterations: 100
completion_promise: "SPACER_VERIFIED_COMPLETE"
started_at: "2026-01-24T14:55:20Z"
---

# Spacer: Godot → React Native (Feature Parity)

## Reference
Study existing implementation for logic and UX flow:
- world.gd, world.tscn — game loop, layout
- player_ship/ — ship states
- effects/ — animations
- docs/spacer.gif — target feel and flow

DO NOT reuse existing assets. Generate all new pixel art.

## Build
Expo TypeScript app with:
- HealthKit integration (mock fallback)
- Fuel = steps / 10
- Goal = monthly average - 20%
- Ship damage states → destruction on consecutive fails
- Calibration period

## Pixel Art (generate fresh)
Create original 64x64 sprites, retro arcade aesthetic, limited palette:
- ship_healthy.png — clean spacecraft
- ship_warning.png — sparks, flickering lights
- ship_damaged.png — hull breach, smoke
- ship_critical.png — fire, systems sparking
- ship_destroyed.png — explosion debris
- background.png — tileable starfield

Style: chunky pixels, visible detail, vibrant against dark space

## Tech
Expo, TypeScript, react-native-health, Zustand, clean architecture

## Verification Process
1. Generate all sprites first, inspect each visually
2. Run: npx expo run:ios
3. In simulator, test each state manually
4. Modify mock data to trigger all transitions
5. Kill app, reopen — verify persistence
6. Compare look/feel to docs/spacer.gif

## Checklist (verify ALL in iOS Simulator)
[ ] App launches, no crashes
[ ] All 5 ship sprites generated and look good (not placeholder boxes)
[ ] Ship renders crisp (nearest neighbor scaling)
[ ] Each damage state visually distinct and polished
[ ] Fuel display works
[ ] State transitions animate smoothly
[ ] Persistence works across app restart
[ ] Overall aesthetic matches retro space game quality

## Rules
- NO completion until simulator tested
- NO completion if sprites look bad or placeholder
- NO completion if any visual is broken
- If something looks off, fix it and retest
- Iterate on visuals until polished

When verified working AND looking good in simulator:
<promise>SPACER_VERIFIED_COMPLETE</promise>
