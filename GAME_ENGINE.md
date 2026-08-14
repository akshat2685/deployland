# DeployLand Game Engine

DeployLand uses a deterministic, pure reducer-based engine.

## Core Principles
1. **Pure Reducers**: Engine state transitions must be `(state, action) => state`.
2. **Zero Side Effects**: No `Date.now()`, no `Math.random()`, no DOM manipulation.
3. **Testable**: Every mechanic must be exhaustively tested in Vitest.
4. **Reusable Mechanics**:
   - `SEQUENCE`: Ordering elements.
   - `TRIAGE`: Diagnosing issues based on clues.
   - `ALLOCATE`: Managing resources/traffic.
   - `CLASSIFY`: Categorizing items (e.g., secrets vs public).
   - `LIVE_TICK`: Time-based simulation layers.
   - `GRAPH_BUILD`: Connecting nodes in a topology.

Do not hard-code level specifics in the engine. The engine provides the primitives; `content` JSON configures them.
