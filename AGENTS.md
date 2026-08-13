# DeployLand rules

Read this file before changing the project. DeployLand is a game-world simulation, never a SaaS course interface.

## Scope

- Build on six reusable mechanics only: `GRAPH_BUILD`, `SEQUENCE`, `TRIAGE`, `ALLOCATE`, `CLASSIFY`, `LIVE_TICK`.
- Levels are content configurations. Do not hard-code a level's win logic in a React component.
- Simulation logic belongs in `src/engine/` and must be a deterministic pure reducer: `(state, action) => state`.
- The engine has zero React imports, no `Date.now`, no random side effects, and is covered by Vitest.

## Visual constitution

- Use only: `#0b0420 #1a0b33 #2d1b4e #4a2c6d #7b2d8e #c2379a #ff4d80 #ff7a3d #ffb454 #ffe0a3 #2de0d0 #4ecdc4 #7ff5ff #f2f0ff`.
- 4px base grid. Use integer scale only and `image-rendering: pixelated` for sprite assets.
- Do not use CSS gradients. Use the shared 4x4 Bayer dither pattern where texture or shading is needed.
- Do not use border radius, blur shadows, glass effects, rounded cards, generic charts, emoji icons, pricing grids, centred hero CTAs, floating blobs, or the word "Dashboard" in product UI.
- Panels use the supplied nine-slice sprite (`public/ui/panel-9slice.svg`), not ordinary CSS borders.
- All animation uses `steps()` timing. Keep scanlines to world surfaces only at 4% opacity or below.
- The only canvas is the ambient parallax city behind the HUD. Interactive gameplay stays in React DOM.
