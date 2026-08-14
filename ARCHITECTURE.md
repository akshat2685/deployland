# DeployLand Architecture

## Separation of Concerns
1. **CONTENT**: Course definitions and level JSON config in `src/content/`. Must contain no logic.
2. **ENGINE**: Core game logic in `src/engine/`. Must be pure TypeScript, side-effect free, deterministic, fully tested. Zero React.
3. **GAME STATE**: Zustand stores in `src/store/`. Adapts engine state for React.
4. **UI**: React components in `src/components/` and `src/screens/`. Subscribes to store, dispatches actions. Contains no core game rules.
5. **PERSISTENCE**: Save/load mechanisms in `src/utils/persistence.ts`. (To be added)
6. **AUTH / COMMERCE**: Future backend integrations. Separated from game logic.

## Directory Structure
- `/src/engine`: Pure reducers and validators.
- `/src/content`: JSON level definitions and schemas.
- `/src/components`: Presentational React components.
- `/src/screens`: Full-page game screens.
- `/src/store`: Global state management.
- `/src/design`: CSS and assets following `AGENTS.md` and `DESIGN_SYSTEM.md`.
