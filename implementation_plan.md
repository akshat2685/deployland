# DeployLand — Full Implementation Plan

> *"You don't study DevOps. You operate it."*

---

## 1. What This Project Is

**DeployLand** is a web-based game that teaches DevOps engineering through interactive simulations, drag-and-drop puzzles, resource management, incident response, and infrastructure construction — wrapped in a 16-bit retro-futuristic cyberpunk pixel-art world.

It is **not** an online course with pixel fonts. It is not a SaaS dashboard. It is not a quiz platform. The player should feel like they are running **Factorio meets SimCity meets a DevOps simulator**, set in a neon-lit futuristic city in the year 2147.

### The Core Fantasy

The player is the newest infrastructure engineer in a futuristic city whose deployment system has collapsed. They must rebuild the CI/CD pipeline, scale it, secure it, and eventually expand the city into a full DevOps metropolis.

```
DEPLOYLAND — YEAR 2147

Humanity runs on automated infrastructure.
You are the newest engineer in a city
that has just lost its deployment system.

Build it. Scale it. Secure it. Keep the city alive.
```

---

## 2. My Analysis & What I'd Do Differently

After reading the full ChatGPT conversation, here is where I agree, where I'd push further, and what I'd change:

### ✅ Strong ideas to keep exactly as-is
- **Game-first, not course-first.** Every screen must feel like a game, never like a learning management system.
- **Visual metaphors for every concept.** Docker = shipping container. Git = branching railway. CI = automated factory. This is the heart of the product.
- **Lifetime one-time purchase model.** No subscriptions. "Pay once. Keep the world forever." This is perfect positioning against Udemy/Coursera fatigue.
- **The paywall should feel like a game expansion**, not a pricing page. "The city needs a deployment engineer" → unlock next region.
- **Build Level 1 before building anything else.** The 5-minute MVP experience must be exceptional before we touch auth, payments, or profiles.

### 🔧 What I'd change or add

| Area | ChatGPT Suggestion | My Take |
|------|-------------------|---------|
| **Framework** | React + Node.js (generic) | **Vite + React + TypeScript** — no SSR needed, this is a client-side game. Node backend comes later. |
| **Rendering** | Canvas / SVG / CSS (vague) | **HTML/CSS pixel-art components first**, Canvas only for the world map and animated scenes. Don't over-engineer rendering early. |
| **State management** | Not specified | **Zustand** — lightweight, perfect for game state. No Redux boilerplate. |
| **Drag-and-drop** | Generic mention | **@dnd-kit** library — accessible, performant, built for React. |
| **Audio** | "Architecture for optional audio" | **Howler.js** — small footprint, sprite support. Add ambient loops + UI sfx from the start, they make the game feel *real*. |
| **Pixel font** | Not specified | **Press Start 2P** (Google Fonts) for headings/HUD. **Silkscreen** for body text. Both are free, pixel-perfect, and readable. |
| **Engineer Mode** | Optional post-level real-world view | **Yes, but implement it in Phase 6+**, not at launch. The game must stand alone first. |
| **Incident system** | Random events post-learning | **Weave incidents into the campaign levels**, not as a separate system. Level 8 (Emergency Rollback) *is* an incident. |
| **10 future courses** | Listed as planned | **Don't architect for 10 courses right now.** Architect for *exactly two*: CI/CD (the launch course) and one placeholder. That proves the system works without over-engineering. |

---

## 3. Technical Architecture

### Stack Decision

| Layer | Technology | Why |
|-------|-----------|-----|
| Build tool | **Vite** | Fast HMR, zero-config TypeScript, tiny bundle |
| UI framework | **React 19 + TypeScript** | Component model fits game UI panels well |
| Routing | **React Router v7** | Simple client-side routing for game screens |
| State | **Zustand** | Lightweight game state store, easy persistence |
| Drag & drop | **@dnd-kit** | Accessible, performant, React-native |
| Animation | **CSS animations + Anime.js** | CSS for UI transitions, Anime.js for pipeline/conveyor animations |
| Audio | **Howler.js** | Lightweight, sprite sheets, volume control |
| Fonts | **Press Start 2P + Silkscreen** | Pixel-perfect Google Fonts |
| Persistence | **localStorage → Supabase later** | Mock locally, swap to real backend later |
| Payments | **Mock → Razorpay later** | Indian payment gateway, supports ₹ one-time payments |

### No backend for Phase 1–6
All game state lives in `localStorage` via Zustand's `persist` middleware. The persistence layer is behind an interface so we can swap in Supabase/Firebase later without rewriting game logic.

### Project Structure

```
deployland/
│
├── public/
│   ├── fonts/
│   ├── sprites/              # Pixel-art sprite sheets
│   ├── audio/                # SFX + ambient loops
│   └── favicon.ico
│
├── src/
│   ├── main.tsx              # Entry point
│   ├── App.tsx               # Router + layout shell
│   │
│   ├── design/               # THE VISUAL CONSTITUTION
│   │   ├── tokens.css        # CSS custom properties (colors, spacing, fonts)
│   │   ├── reset.css         # Minimal reset
│   │   ├── pixel-ui.css      # Base pixel-art component styles
│   │   └── effects.css       # Scanlines, CRT glow, neon pulse
│   │
│   ├── components/           # Reusable pixel-art UI primitives
│   │   ├── PixelButton/
│   │   ├── PixelPanel/       # Bordered panel (replaces "cards")
│   │   ├── PixelDialog/      # Modal dialogs (in-world terminal style)
│   │   ├── HudBar/           # Top HUD: XP, rank, uptime, budget
│   │   ├── ReactorMeter/     # Progress bar (reactor charge aesthetic)
│   │   ├── RadioTerminal/    # Notification/message panel
│   │   ├── PipelineSlot/     # Drag-and-drop slot for pipeline stages
│   │   ├── PipelineBlock/    # Draggable block (SOURCE, BUILD, TEST, etc.)
│   │   └── StatusIndicator/  # ✅ ❌ ⏳ pipeline stage status
│   │
│   ├── screens/              # Full-page game screens
│   │   ├── TitleScreen/      # Boot sequence → DEPLOYLAND title
│   │   ├── WorldMap/         # Pixel-art city overview (Canvas-rendered)
│   │   ├── CommandCenter/    # Player's HQ: stats, status, active mission
│   │   ├── MissionBrief/     # Pre-level story + objectives
│   │   ├── GameLevel/        # The actual interactive level
│   │   ├── LevelComplete/    # Reward screen: XP, badge, explanation
│   │   ├── Inventory/        # Collected DevOps tools/concepts
│   │   ├── Skills/           # Skill tree visualization
│   │   ├── Archive/          # Concept encyclopedia (unlocked post-level)
│   │   ├── Profile/          # Engineer ID card + rank + stats
│   │   └── UnlockRegion/     # Paywall disguised as game expansion
│   │
│   ├── engine/               # PURE GAME LOGIC (zero React imports)
│   │   ├── types.ts          # Core type definitions
│   │   ├── simulation.ts     # Pipeline simulation runner
│   │   ├── rules.ts          # Win/fail condition evaluator
│   │   ├── scoring.ts        # XP calculation, rank thresholds
│   │   ├── progression.ts    # Level unlock logic, entitlement checks
│   │   └── events.ts         # Event bus for game events
│   │
│   ├── store/                # Zustand stores
│   │   ├── playerStore.ts    # XP, rank, inventory, achievements
│   │   ├── gameStore.ts      # Current level state, pipeline state
│   │   ├── courseStore.ts     # Course progress, level completion
│   │   └── settingsStore.ts  # Audio, display preferences
│   │
│   ├── content/              # DATA-DRIVEN COURSE DEFINITIONS
│   │   ├── courses.ts        # Course registry
│   │   └── cicd/
│   │       ├── index.ts      # Course metadata
│   │       ├── level-01.ts   # "The Broken Factory"
│   │       ├── level-02.ts   # "Continuous Integration"
│   │       ├── level-03.ts   # "The Test Lab" (locked)
│   │       └── ...
│   │
│   ├── hooks/                # React hooks
│   │   ├── useDragPipeline.ts
│   │   ├── useSimulation.ts
│   │   ├── useAudio.ts
│   │   └── useEntitlement.ts
│   │
│   └── utils/
│       ├── persistence.ts    # localStorage adapter (swappable)
│       └── audio.ts          # Howler.js wrapper
│
├── DESIGN_SYSTEM.md          # Visual constitution (enforced rules)
├── index.html
├── package.json
├── tsconfig.json
└── vite.config.ts
```

> [!IMPORTANT]
> The `engine/` directory must have **zero React imports**. All game logic (simulation, rules, scoring, progression) is pure TypeScript. React components consume the engine, never the other way around. This means the game logic is testable with plain unit tests.

---

## 4. Design System — The Visual Constitution

This is not a style guide. It is a **hard contract** that every component must follow.

### Color Palette

| Token | Hex | Usage |
|-------|-----|-------|
| `--void` | `#0a0a12` | Deepest background, outer space |
| `--night` | `#121228` | Primary background |
| `--navy` | `#1a1a3e` | Panel backgrounds |
| `--steel` | `#2a2a5c` | Borders, dividers |
| `--cyan` | `#00f5d4` | Success, active systems, healthy infra |
| `--magenta` | `#f72585` | Errors, failures, critical alerts |
| `--amber` | `#ffbe0b` | Warnings, XP, currency |
| `--orange` | `#fb5607` | Sunset highlights, fire, builds |
| `--purple` | `#7209b7` | Locked content, mystery |
| `--white` | `#e0e0ff` | Primary text (slightly blue-tinted) |
| `--dim` | `#6a6a8e` | Secondary text, disabled states |

### Typography

| Use | Font | Size | Notes |
|-----|------|------|-------|
| HUD / Headings | Press Start 2P | 12–16px | Pixel-perfect, no anti-aliasing |
| Body / Dialogue | Silkscreen | 14–16px | Readable pixel font |
| Code/Terminal | Press Start 2P | 10px | Monospace feel |

> [!WARNING]
> **Never use** `border-radius` above `2px`. No rounded corners. All elements must feel like they were drawn on a pixel grid. Use hard `1px` borders with `--steel` color.

### Prohibited Patterns
- ❌ Glassmorphism, blur effects
- ❌ `border-radius: 8px+` or pill shapes
- ❌ Generic gradient backgrounds
- ❌ SaaS-style card grids
- ❌ Hero sections with abstract illustrations
- ❌ Floating blobs or decorative circles
- ❌ Generic dashboard layouts
- ❌ Stock photos or AI-generated illustrations
- ❌ The word "Dashboard" anywhere in the UI

### Required Patterns
- ✅ Hard pixel borders (1–2px)
- ✅ Panel components with bevel/inset effects
- ✅ Scanline overlay (subtle, `opacity: 0.03`)
- ✅ Neon glow on active/interactive elements (`box-shadow` with color spread)
- ✅ CRT screen flicker on terminal/dialog panels (subtle CSS animation)
- ✅ Dark-dominant layouts (80%+ dark space)
- ✅ Environmental pixel-art backgrounds (not flat colors)
- ✅ UI elements that feel like in-world machines

### Component → Game World Mapping

| Traditional UI | DeployLand Equivalent |
|---------------|----------------------|
| Progress bar | Reactor charge meter |
| Notifications | Radio terminal messages |
| Course list | City world map (regions) |
| Level select | Physical locations on the map |
| Profile page | Engineer ID card |
| Settings | Control panel with toggles |
| Achievements | Mission patches on a wall |
| Cards | Machine panels with indicator lights |

---

## 5. The CI/CD Campaign — All 10 Levels

### Level Structure Template

Every level follows this loop:

```
STORY INTRO → OBJECTIVE → INTERACTIVE SIMULATION → FAILURE → 
INVESTIGATION → FIX → EXPLANATION → REWARD → NEW MECHANIC UNLOCKED
```

The explanation comes **after** the player has experienced the problem. Never before.

---

### 🆓 Level 1 — "The Broken Factory"
**Concept:** What is a pipeline?

**Story:** *"Developers are pushing code, but nothing reaches production. The release line is broken."*

**Mechanic:** Drag-and-drop. The player receives 5 shuffled blocks:
`DEPLOY`, `SOURCE`, `PACKAGE`, `BUILD`, `TEST`

They must arrange them in correct order:
`SOURCE → BUILD → TEST → PACKAGE → DEPLOY`

**Simulation:** Press `▶ START PIPELINE`. Animated packages flow through each block. If order is wrong, the pipeline jams at the incorrect stage with a visible ❌ and a pixel-art engineer runs over to explain what went wrong.

**Reward:** +150 XP, Badge #001 "Pipeline Understood", unlocks `⚙ BUILD NODE` in inventory.

---

### 🆓 Level 2 — "Merge Conflict City"
**Concept:** Continuous Integration

**Story:** *"Three developers are pushing code at the same time. The build factory is overwhelmed."*

**Mechanic:** Triage incoming changes. The player sees 3 developer avatars submitting code. They must:
1. Route each change into the shared pipeline (or reject it)
2. Decide merge order
3. Watch the automated build trigger on each merge

**Failure scenario:** Two conflicting changes break the build. The player must identify which merge caused it.

**Reward:** +200 XP, Badge #002 "Integration Engineer", unlocks `🔀 MERGE CONTROLLER` in inventory.

---

### 🔒 Level 3 — "The Test Lab"
**Concept:** Automated Testing (unit tests, integration tests, pipeline gates)

**Story:** *"Deployments keep reaching production with bugs. The test lab has been offline."*

**Mechanic:** The player configures test gates. They receive test blocks:
- `UNIT TEST`, `INTEGRATION TEST`, `SMOKE TEST`, `LOAD TEST`

They must place them at correct pipeline stages. Then run a build that has a hidden bug — the correct test catches it. Wrong placement = bug reaches production = city health drops.

**Reward:** +250 XP, Badge #003, unlocks `🧪 TEST RUNNER`.

---

### 🔒 Level 4 — "Build Factory"
**Concept:** Build systems, compilation, dependencies

**Story:** *"The factory is producing builds, but they keep failing. Dependencies are missing."*

**Mechanic:** Visual dependency management. The player sees a build recipe that requires 4 dependencies. They must:
1. Find the right dependency versions in the Artifact Warehouse
2. Connect them to the build config
3. Hit build — mismatched versions cause failures with specific error messages

**Reward:** +250 XP, Badge #004, unlocks `🏭 BUILD OPTIMIZER`.

---

### 🔒 Level 5 — "Artifact Warehouse"
**Concept:** Artifact management, versioning, immutable packages

**Story:** *"Someone deployed v1.2 over v1.3 and now production is broken. The warehouse is chaos."*

**Mechanic:** Inventory management puzzle. The player must:
1. Sort artifacts by version (semantic versioning visual)
2. Mark artifacts as immutable (lock them)
3. Configure the deployment bay to always pull the latest stable version
4. Identify and quarantine a corrupted artifact

**Reward:** +300 XP, Badge #005, unlocks `📦 ARTIFACT STORE`.

---

### 🔒 Level 6 — "Staging District"
**Concept:** Environments (dev → staging → production), Continuous Delivery

**Story:** *"A release passed all tests but crashes in production. There's no staging environment."*

**Mechanic:** Environment routing puzzle. The player must:
1. Build a 3-environment pipeline: DEV → STAGING → PROD
2. Route a release through all 3
3. Discover that staging catches a config difference that tests missed
4. Learn why staging exists

The city literally has 3 districts that light up as releases flow through.

**Reward:** +300 XP, Badge #006, unlocks `🌐 ENVIRONMENT CONTROLLER`.

---

### 🔒 Level 7 — "Blue vs Green"
**Concept:** Blue/green deployment, traffic routing, zero-downtime

**Story:** *"Production needs an update but we can't afford downtime. The city has two identical districts."*

**Mechanic:** Traffic controller. The player sees:
- BLUE CITY (current, serving users)
- GREEN CITY (idle, ready for new version)

They must:
1. Deploy the new version to GREEN
2. Run health checks on GREEN
3. Gradually shift traffic from BLUE → GREEN (slider control)
4. If GREEN fails health checks → snap back to BLUE

Visual: tiny pixel users (dots) flowing between cities, with a traffic percentage indicator.

**Reward:** +350 XP, Badge #007, unlocks `🚦 TRAFFIC ROUTER`.

---

### 🔒 Level 8 — "Emergency Rollback"
**Concept:** Production incidents, rollback, release history, recovery

**Story:** *"🚨 CRITICAL INCIDENT: Production is down. Error rate at 94%. Revenue loss: $12,000/minute."*

**Mechanic:** Incident response under pressure. Timer counts losses. The player must:
1. Identify the bad deployment in the release history
2. Select the last stable version
3. Execute rollback
4. Verify production recovers
5. Write a mini post-mortem (multiple choice: what caused it?)

The city goes from neon-lit to dark/red during the incident, then gradually recovers.

**Reward:** +400 XP, Badge #008 "Incident Commander", unlocks `⏪ ROLLBACK MODULE`.

---

### 🔒 Level 9 — "Secrets Vault"
**Concept:** Secrets management, credentials, environment variables, security

**Story:** *"⚠ SECURITY ALERT: An API key was found in the source code. The vault has been breached."*

**Mechanic:** Classification puzzle. The player receives items:
- `API_KEY`, `DB_PASSWORD`, `DEPLOY_TOKEN`, `APP_NAME`, `LOG_LEVEL`, `STRIPE_SECRET`

They must sort them into:
- 🔐 SECRET VAULT (encrypted, never in code)
- 📋 ENV CONFIG (environment variables, non-secret)
- ❌ NEVER STORE (should be rotated/regenerated)

Wrong placement = security breach animation (alarm, red lights, city lockdown).

**Reward:** +400 XP, Badge #009 "Security Officer", unlocks `🔐 SECRET VAULT`.

---

### 🔒 Level 10 — "Build the Pipeline" (Final Exam)
**Concept:** Complete CI/CD system design

**Story:** *"A brand new city district has opened. It has no infrastructure. Build everything from scratch."*

**Mechanic:** Open sandbox. The player gets an empty infrastructure grid and all unlocked components from their inventory:
- Source Control, Build Node, Test Runner, Artifact Store, Environment Controller, Traffic Router, Rollback Module, Secret Vault

They must:
1. Place components in a logical architecture
2. Wire connections between them
3. Configure each component (basic settings)
4. Run a simulated release through the entire system
5. Handle a triggered incident mid-simulation

**Scoring:** Graded on reliability (%), security (pass/fail), speed (deploy time), cost efficiency.

**Reward:** +500 XP, Final Badge "Pipeline Architect", Rank up to "Release Engineer".

---

## 6. Player Progression System

### XP & Ranks

| Rank | XP Required | Title |
|------|------------|-------|
| 1 | 0 | Junior Operator |
| 2 | 500 | Pipeline Technician |
| 3 | 1,500 | Build Engineer |
| 4 | 3,000 | Release Engineer |
| 5 | 5,000 | DevOps Engineer |
| 6 | 8,000+ | Platform Engineer |

### Inventory System
Items collected during levels aren't cosmetic — they represent mastered concepts and are used as building blocks in later levels (especially Level 10).

### Persistent World Growth
Completing levels visually transforms the World Map. After Level 1, the Build Factory lights up. After Level 7, both Blue and Green cities glow. This gives the player a tangible sense of progress that no progress bar can match.

---

## 7. Monetization Architecture

### Model: One-time lifetime purchase per course

```
FREE TIER:
├── Level 1: The Broken Factory       ✅
├── Level 2: Merge Conflict City      ✅
├── Level 3: The Test Lab             🔒
├── ...
└── Level 10: Build the Pipeline      🔒

UNLOCK: ₹799 one-time → Lifetime access to all 10 levels + future updates
```

### Implementation (data model, not hard-coded)

```typescript
// Entitlement check — NEVER hard-code "if (level > 2)"
interface CourseEntitlement {
  courseId: string;        // "cicd", "docker", "kubernetes"
  accessType: 'free' | 'purchased' | 'locked';
  purchaseDate?: Date;
}

interface LevelAccess {
  levelId: string;
  isFreePreview: boolean;  // Defined per-level in course data
}
```

### Future pricing (not implemented now, just architected for)

| Course | Price |
|--------|-------|
| CI/CD | ₹799 |
| Docker | ₹499 |
| Kubernetes | ₹999 |
| ALL ACCESS | ₹2,499 |

### The paywall screen is NOT a pricing page
It's a story beat:

```
     ╔═══════════════════════════════╗
     ║   THE PRODUCTION DISTRICT     ║
     ║                               ║
     ║        🚧 RESTRICTED 🚧       ║
     ║                               ║
     ║   "The city needs a           ║
     ║    deployment engineer."       ║
     ║                               ║
     ║   ┌─────────────────────┐     ║
     ║   │ UNLOCK NEXT REGION  │     ║
     ║   │    ₹799 lifetime    │     ║
     ║   └─────────────────────┘     ║
     ╚═══════════════════════════════╝
```

---

## 8. Audio Design (Minimal but Impactful)

| Event | Sound | Notes |
|-------|-------|-------|
| App boot | Retro synth startup chime | 2-second, sets the tone |
| Ambient (world map) | Lo-fi cyberpunk ambient loop | Subtle, not distracting |
| Pipeline stage pass | Mechanical click + electrical hum | Short, satisfying |
| Pipeline fail | Error buzz + alarm | Alarming but not annoying |
| Level complete | Achievement synth fanfare | Celebratory, 3 seconds |
| XP gain | Coin collect sound | Instant dopamine |
| Button hover | Soft pixel click | Barely audible |
| Incident alert | Klaxon alarm | Urgent, drives action |
| City lights on | Electrical power-up hum | World-building |

Master volume control + mute toggle, always accessible. **Never autoplay at full volume.**

---

## 9. Development Roadmap — 10 Phases

### Phase 1 — Project Scaffolding & Design System
- `npx create-vite deployland --template react-ts`
- Install dependencies: `zustand`, `@dnd-kit/core`, `@dnd-kit/sortable`, `howler`, `react-router`, `animejs`
- Create `DESIGN_SYSTEM.md` (enforced visual rules)
- Implement `tokens.css`, `reset.css`, `pixel-ui.css`, `effects.css`
- Build primitive components: `PixelButton`, `PixelPanel`, `HudBar`

### Phase 2 — Title Screen & Boot Sequence
- CRT-style boot animation → "DEPLOYLAND" title reveal
- Scanline effect, flickering neon text
- "NEW GAME" / "CONTINUE" buttons
- This screen alone must look stunning. If this screen looks generic, everything fails.

### Phase 3 — Level 1 MVP ("The Broken Factory")
**This is the most critical phase.** The 5-minute experience must be exceptional.
- Mission briefing screen (story intro)
- Drag-and-drop pipeline builder (5 blocks)
- Pipeline simulation animation (packages flowing through stages)
- Success/failure states with visual feedback
- Level complete screen with XP + badge reward
- Short concept explanation overlay

### Phase 4 — World Map & Command Center
- Canvas-rendered pixel-art world map with CI Valley
- Clickable locations that light up as completed
- Locked regions visible but inaccessible (fog/barrier)
- Command Center HUD: uptime, XP, rank, current mission

### Phase 5 — Level 2 ("Merge Conflict City")
- Multiple developer avatars submitting code
- Merge order triage mechanic
- Conflict detection and resolution
- Introduces branching visual (railway metaphor)

### Phase 6 — Progression System & Persistence
- Zustand stores with localStorage persistence
- XP accumulation, rank advancement
- Inventory system (collected tools)
- Achievement/badge display
- Profile (Engineer ID Card)
- Settings (audio controls)

### Phase 7 — Locked Content & Paywall Flow
- Level 3 story → "RESTRICTED REGION" paywall screen
- Mock purchase flow (button that grants entitlement in localStorage)
- Entitlement-gated level access
- Build remaining locked levels (3–10) as data configurations

### Phase 8 — Levels 3–10 Implementation
- Implement each level's unique mechanic
- Test gates (Level 3), dependency management (Level 4), versioning (Level 5)
- Environment routing (Level 6), blue/green traffic (Level 7)
- Incident response (Level 8), secrets classification (Level 9)
- Final sandbox (Level 10)

### Phase 9 — Backend & Authentication
- Set up Supabase (or Firebase) for:
  - User accounts (email/Google auth)
  - Cloud save (progress sync)
  - Purchase records
- Swap localStorage adapter for Supabase adapter
- Server-side entitlement verification

### Phase 10 — Payments & Launch
- Integrate Razorpay for ₹ one-time payments
- Real purchase → entitlement flow
- Landing page (itself pixel-art styled, not a SaaS landing page)
- Deploy to Vercel/Netlify
- Release Levels 1–2 free, Levels 3–10 paid

---

## 10. Proposed Changes — File Summary

### [NEW] Project initialization
- Initialize Vite + React + TypeScript project at `C:\Users\ijain\.gemini\antigravity\scratch\deployland\`

### [NEW] Design system files
- `src/design/tokens.css` — CSS custom properties
- `src/design/reset.css` — Minimal CSS reset
- `src/design/pixel-ui.css` — Pixel-art base styles
- `src/design/effects.css` — Scanlines, CRT, neon glow
- `DESIGN_SYSTEM.md` — Visual rules document

### [NEW] Component library
- `src/components/PixelButton/` — All button variants
- `src/components/PixelPanel/` — Bordered panel containers
- `src/components/HudBar/` — Top HUD strip
- `src/components/PipelineBlock/` — Draggable pipeline stage
- `src/components/PipelineSlot/` — Drop target for pipeline
- `src/components/StatusIndicator/` — ✅❌⏳ indicators

### [NEW] Game engine (pure TypeScript)
- `src/engine/types.ts` — All type definitions
- `src/engine/simulation.ts` — Pipeline simulation runner
- `src/engine/rules.ts` — Win/fail evaluation
- `src/engine/scoring.ts` — XP calculations
- `src/engine/progression.ts` — Level unlock + entitlement logic

### [NEW] Game screens
- `src/screens/TitleScreen/` — Boot sequence + title
- `src/screens/GameLevel/` — Level 1 interactive experience
- `src/screens/MissionBrief/` — Story intro before each level
- `src/screens/LevelComplete/` — Reward + explanation

### [NEW] Content definitions
- `src/content/courses.ts` — Course registry
- `src/content/cicd/level-01.ts` — "The Broken Factory" data
- `src/content/cicd/level-02.ts` — "Merge Conflict City" data

### [NEW] State management
- `src/store/playerStore.ts` — XP, rank, inventory
- `src/store/gameStore.ts` — Current level state
- `src/store/courseStore.ts` — Course progress

---

## 11. Verification Plan

### Automated Tests
- Unit tests for `engine/simulation.ts` — verify pipeline order validation
- Unit tests for `engine/rules.ts` — verify win/fail conditions
- Unit tests for `engine/scoring.ts` — verify XP calculations
- Unit tests for `engine/progression.ts` — verify entitlement logic
- Run with `npx vitest`

### Manual Verification
- Boot the dev server (`npm run dev`)
- Play through Level 1 end-to-end: boot → title → briefing → drag blocks → run pipeline → fail → fix → succeed → reward
- Verify pixel-art aesthetic matches design system rules
- Verify no generic SaaS patterns slipped in
- Verify drag-and-drop works on desktop (mouse) and tablet (touch)
- Verify audio plays on interaction and respects mute toggle
- Verify localStorage persistence: close tab, reopen, progress is saved

---

> [!IMPORTANT]
> ## Decision Point
> Before I start building, please confirm:
> 1. **Are you happy with the name "DeployLand"?** Or do you prefer one of the alternatives (Pipeline Quest, OpsCraft, InfraForge)?
> 2. **Should I start with Phase 1 + 2 + 3** (scaffolding + title screen + Level 1 MVP)? This gets us to the first playable demo fastest.
> 3. **Do you have the pixel-art reference image** from your ChatGPT conversation? If yes, share it and I'll use it as the art direction anchor. If not, I'll generate pixel-art assets for the prototype.
