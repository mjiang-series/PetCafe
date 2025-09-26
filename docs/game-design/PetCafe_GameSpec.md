# My Game Spec

*Generated on 9/19/2025*

---

## 🤖 AI Implementation Instructions

### CRITICAL: Read These Instructions Before Implementation

#### 1. Planning Phase (MANDATORY - Do This First)
- **Read the entire specification** before writing any code
- **Create a implementation plan** listing all files to be created/modified
- **Identify dependencies** and external libraries needed
- **Map out the component hierarchy** and data flow
- **Plan the game state management** approach

#### 2. Code Quality Requirements
- **Debugging & Logging**:
  - Add console.log statements for all major game events
  - Include debug mode toggle for development
  - Log all state changes and user interactions
  - Add error boundaries and try-catch blocks for critical functions
- **Code Structure**:
  - Use clear, descriptive variable and function names
  - Add comments for complex logic
  - Separate concerns (game logic, UI, state management)
  - Create reusable components/functions

#### 3. UI Implementation Requirements
- **Event Handlers**: Every interactive element MUST have proper event listeners
- **Visual Feedback**: All user actions must provide immediate feedback
- **Error States**: Handle and display all error conditions gracefully
- **Loading States**: Show loading indicators for async operations
- **Responsive Design**: Ensure UI works on both mobile and desktop

#### 4. Testing Protocol (MANDATORY Before Completion)
- **Functional Testing**:
  - Test every button/interactive element for responsiveness
  - Verify all game mechanics work as specified
  - Test state transitions between screens
  - Verify win/lose conditions trigger correctly
- **UI/UX Testing**:
  - Confirm all visual feedback is working
  - Test on both mobile and desktop viewports
  - Verify touch/click events work properly
  - Check that no UI elements are unresponsive
- **Error Testing**:
  - Test edge cases and invalid inputs
  - Verify error messages display correctly
  - Test recovery from error states
- **Console Check**:
  - Ensure no errors in browser console
  - Verify debug logs are working
  - Check for any performance warnings

#### 5. Game-Specific Implementation Notes
- **Interaction Methods**: Implement support for: Tap/click for actions; drag‑drop pets into slots; swipe/scroll feeds; long‑press tooltips; keyboard input for chat (desktop).
- **Critical Interactive Elements**: Ensure these are fully functional: Title: Start/Continue/Settings.
Café Overview: Section tiles, Blog, Gacha, Shop, Pause.
Section: Assign Helpers, Pet Slots, Start Shift, Consumable slot, Back.
Results: Collect Rewards, Blog Preview.
Blog: Memory Card, Tag NPC, Publish, Feed entries, Back.
NPC Interactions: DM reply buttons/free-text, Call Accept/End.
Gacha: Single/10x Pull, Buy Currency, Back.
Shop: Purchase entries, Subscribe, Back.
Settings: Resume, Audio toggles, Notifications, Back.
- **AI Integration**: Include proper error handling and loading states for all AI/LLM API calls
- **API Key Management**: Ensure secure handling of API keys (use environment variables)
- **Data Persistence**: Implement save/load functionality with error handling
- **Local Storage**: Add try-catch blocks for all localStorage operations
- **Core Game Loop**: Carefully implement and test: Assign pets → Run café shift → Collect coins/XP/memories → Post memories to blog (bond boost) → Unlo...

#### 6. Pre-Delivery Checklist
- [ ] All interactive elements have event handlers
- [ ] Visual feedback works for all user actions
- [ ] No errors in browser console
- [ ] Game mechanics function as specified
- [ ] UI is responsive on mobile and desktop
- [ ] Loading states show for async operations
- [ ] Error states are handled gracefully
- [ ] Debug logging is implemented
- [ ] Code is well-commented and organized
- [ ] All specified features are implemented

### Implementation Order Recommendation
1. Set up project structure and dependencies
2. Create basic HTML/CSS layout with all screens
3. Implement navigation between screens
4. Add interactive elements with event handlers
5. Implement core game mechanics
6. Add visual feedback and animations
7. Implement data persistence (if applicable)
8. Add error handling and edge cases
9. Implement debug mode and logging
10. Perform comprehensive testing

**Remember**: A working game with proper UI responsiveness is better than a feature-complete game with broken interactions. Focus on making every implemented feature robust and fully functional.

---

## 1. Game Concept Overview

### Scope (Prototype vs Full Experience)
This document targets a playable prototype. The scope and recommendations below are intentionally limited.

### Game Concept

#### One-sentence summary
**An idle pet café × dating-sim hybrid** where players assign collectible pets to café helpers to run shifts that earn coins and “memories,” then use those memories—plus `DMs` and voice calls—to deepen earnest, heartfelt romances with Aria, Kai, and Elias.

#### Prototype scope (what's in / out)
- **In scope (prototype):**
  - A playable slice that demonstrates both the café collection loop and the romance progression loop together.
  - All three romanceable NPCs present from the start (Aria — Bakery, Kai — Playground, Elias — Styling), with roughly equal narrative depth for each.
  - A curated starter pet roster of **15 pets** distributed across the three helpers and across rarity tiers (Commons, Rares, Ultra Rares), with each tier tied to progressively deeper narrative beats.
  - The blog/memory-sharing feature implemented in full form as a **single chronological feed** that mixes memories from all NPCs and tags moments to characters.
  - Communication channels limited to `DMs` and voice calls for the prototype (video calls reserved for later development).

- **Out of scope (for the prototype; left to full game):**
  - Large-scale roster expansions, extensive branching romance trees, or deeply branching long-term endings for each route.
  - Additional romanceable characters beyond the three core NPCs.
  - Video call interactions and other higher-fidelity communication formats.
  - Complex multiplayer or social layers beyond the single-player café + narrative experience.

#### High-level gameplay fantasy (what playing feels like)
- Players feel like a warm, attentive café manager who grows intimacy through small, meaningful actions: pairing the right pets with helpers, watching the café fill with small moments, posting and rereading shared memories, and receiving tender `DMs` or voice messages that respond to those moments.
- The emotional tone is **earnest and heartfelt**, threaded with light, flirty moments so romance feels warm and devoted rather than purely playful or purely dramatic.
- Collection is rewarding not only as a completion task, but because specific pets unlock stronger, more cinematic story beats that reveal character history and grow bonds.

#### Audience
- Female-leaning mobile players aged 18–34 who enjoy cozy sims, idle/tycoon progression loops, and romance-forward gacha-like collection experiences.

#### References / Inspirations
- Love and Deepspace (romance-focused character routes),
- Cats & Soup (cozy collection and idling charm),
- Cookie Run: Kingdom (gacha-style roster variety and tiered characters).

#### Notes on narrative focus
- The prototype is designed to prove the emotional interplay between collectible pets and relationship beats: pets create moments, the blog makes them feel shared and consequential, and `DMs` + voice calls let NPCs react in a way that fosters intimacy across three equally supported romance paths.

### List of Mechanics
**Pet Gacha & Skins** — Collect and customize pets, with dupes → tokens for skins/buffs.
**Café Shifts** — Assign pets to helpers; timers yield income + memories.
**Memories & Blog** — Publish café moments, tag NPCs, gain prestige/subscribers.
**NPC Bonds** — Deepen via DMs, calls, story scenes.
**Event Banners** — Seasonal pets/skins tied to side stories.

## 2. Game Definition

### Non-UI Mechanic Definition
### Game Flow & Mechanics

#### Main screens / states

- **Title / Main Menu** → entry point (Start / Continue).
- **Café Overview (hub)** — central hub showing three section tiles and access to Blog, Gacha, Shop, and NPC interactions.
- **Section Screen** — per-section view (Bakery, Playground, Styling) with current shift slots and local helpers.
- **Shift Setup** — assign pets to a helper, select consumables, and start the shift.
- **Shift In-Progress** — active timer view showing time remaining and quick-return/finish options.
- **Shift Results** — rewards summary (coins, XP, memory) with a single publish action for the memory.
- **Blog / Memory Feed** — single chronological feed that lists published memories, tags NPCs, and increments bond impact.
- **Gacha / Pet Management** — obtain pets, view roster, and convert duplicate pets into tokens.
- **NPC Interaction (DMs & Voice Calls)** — discrete narrative interactions unlocked by bond milestones.
- **Pause / Settings Overlay** — accessible from any state to pause or adjust options.

#### Core game loop (player-visible)

1. Assign pets to a café helper in a Section (one helper per shift).
2. Start up to one shift per section (max 3 concurrent shifts).
3. Wait for a short shift to complete (target ~3 minutes) or use a consumable to finish early.
4. Open Shift Results, collect coins/XP, and publish the single memory produced by that shift to the Blog.
5. Published memory grants a bond boost to the tagged NPC and may unlock DMs or voice-call scenes.
6. Use coins/tokens in Gacha/Shop to obtain new pets or skins; duplicate pets convert to tokens.
7. Repeat the loop, aiming to collect pets that produce stronger narrative memories and deepen bonds.

#### Core mechanics and simple rules

1. **Café Shifts**
   - Each Section holds one shift slot; three sections → up to three concurrent shifts.
   - Shifts have a base duration (~3 minutes for prototype). Consumables can finish a shift immediately.
   - Completing a shift yields coins, helper XP, and exactly one memory eligible for publishing.

2. **Memory Publishing & Blog**
   - Each completed shift can publish exactly one memory to the single chronological Blog feed.
   - Publishing is required to convert the in-shift memory into bond progress; unpublished memories do not count.
   - Memories are tagged to the helper that was on shift; tags determine which NPC bond receives the boost.

3. **NPC Bonds & Narrative Unlocks**
   - Bonds increase when memories are published. Early bond milestones unlock DMs and short scenes; larger milestones unlock more cinematic beats.
   - Prototype pace targets fast early progress: first scene per NPC unlocked after 1–2 published memories.

4. **Pet Collection (Gacha) & Dupes**
   - Pets are obtained through Gacha pulls; each pet is tied to one helper.
   - Duplicate pets automatically convert to `tokens` used for skins or targeted pulls.
   - Pet rarity influences the strength/quality of memories (Commons → light anecdotes; Rares → vignettes; Ultra Rares → cinematic beats).

5. **Consumables & Economy**
   - A simple consumable item allows immediate shift completion; item usage is explicit at Shift Setup or In-Progress.
   - Consumables are limited and intended to let players control pacing without changing core loop structure.

#### Transitions & triggers (flow rules)

- Player taps a tile or icon to navigate between hub and screens.
- Starting a shift moves its state to In-Progress; timer expiry or consumable use triggers Shift Results.
- Collecting rewards on Shift Results returns the player to Café Overview.
- Publishing a memory immediately applies bond gains and posts to the Blog; associated NPC notifications may appear.
- Opening an unlocked DM or voice scene consumes no shift slot and returns to the hub when closed.

### UI

#### UI Implementation Requirements
**CRITICAL: All UI elements MUST be properly wired with event handlers and state management.**

#### Screen List / Map
Title → Café Overview: Start/Continue.
Café Overview → Section: Tap section tile.
Section → Shift Setup: Tap Assign.
Shift Setup → Shift Results → Café Overview: After completion.
Café Overview → Blog/Gacha/Shop/NPC Interaction: Tap icons.
Any state → Settings/Pause: Pause icon.

#### Interaction Methods
Tap/click for actions; drag‑drop pets into slots; swipe/scroll feeds; long‑press tooltips; keyboard input for chat (desktop).

#### Interactive Elements (MUST have event handlers)
Title: Start/Continue/Settings.
Café Overview: Section tiles, Blog, Gacha, Shop, Pause.
Section: Assign Helpers, Pet Slots, Start Shift, Consumable slot, Back.
Results: Collect Rewards, Blog Preview.
Blog: Memory Card, Tag NPC, Publish, Feed entries, Back.
NPC Interactions: DM reply buttons/free-text, Call Accept/End.
Gacha: Single/10x Pull, Buy Currency, Back.
Shop: Purchase entries, Subscribe, Back.
Settings: Resume, Audio toggles, Notifications, Back.
**Implementation Note:** Each of these elements MUST have proper event listeners attached (click, touch, etc.)

#### Visual Feedback Requirements
Buttons scale and glow; pet slots pulse when empty; valid drop highlights slot; invalid drop shakes pet. Rare gacha = gold burst; ultra-rare = cinematic reveal; dupes show token sparkle. Blog publish slides card into feed with shimmer; bond up shows portrait glow + vignette. Loading = pawprint progress; shift timers circular countdown.
**Implementation Note:** Use CSS transitions/animations and JavaScript state changes for feedback

#### UI Response Behaviors
Immediate input with micro-animations. Crossfade major screens; slide-in overlays. Confirmation modals for purchases/pulls. Toasts for blog publish, bond up, new memory. Tooltips for locked/insufficient actions.

#### Screen Definitions
##### Layout
Layout ideas / UX flows: Café Overview acts as a central hub with large tappable section tiles. From there, each section flows into a shift setup screen (pets, consumables, start button), then into results and blog posting. The Blog follows a social media feed card layout. Gacha banners and shop use carousel-style layouts for easy scrolling, while NPC chats follow familiar messaging app UIs.

##### Mechanic Definition
**Pet Gacha & Skins** — Collect and customize pets, with dupes → tokens for skins/buffs.
**Café Shifts** — Assign pets to helpers; timers yield income + memories.
**Memories & Blog** — Publish café moments, tag NPCs, gain prestige/subscribers.
**NPC Bonds** — Deepen via DMs, calls, story scenes.
**Event Banners** — Seasonal pets/skins tied to side stories.

#### UI Implementation Guidelines
1. **Event Handling**: All interactive elements must have event listeners (addEventListener or framework equivalents)
2. **State Management**: UI state changes must be properly tracked and reflected in the DOM
3. **User Feedback**: Every user action must provide immediate visual or audio feedback
4. **Error Handling**: Invalid actions should show clear error messages or disabled states
5. **Loading States**: Async operations must show loading indicators
6. **Accessibility**: Include ARIA labels, keyboard navigation, and focus management where applicable

## 3. Implementation

### Platforms
Assumed: HTML5 web (mobile portrait, desktop compatible) unless specified otherwise.

### Technologies
### Tech Stack, Constraints & File Org

#### Platform targets & high-level constraints
- **Primary prototype target:** Native mobile (iOS / Android). Web builds may be added later.
- **Performance target:** Smooth 60fps on mid-tier devices where feasible; prioritize responsiveness and stable timers over heavy visual effects.
- **Package cap:** **Each platform build should aim to stay ≤ 100MB.**
- **Accessibility & localization:** Must support text scaling, color-blind safe rarity cues, and be ready for string table localization even if shipping English only.

#### Build & asset constraints (practical rules)
1. Keep pre-recorded voice assets minimal for the prototype; prefer short snippets and author-approved lines for cinematic beats.
2. Use compressed, streaming-friendly audio for larger ambient or music files to reduce bundle size.
3. Limit high-resolution textures and favor tightly packed spritesheets / atlases for UI and pets.
4. Optimize art export (scaled variants) to match target device density buckets only; avoid shipping redundant oversized assets.
5. Provide accessibility alternatives (icon + color) for any color-coded cues (e.g., rarity indicators).

#### Repository & workflow
- **Source control model:** Feature-branch workflow (short-lived branches merged to `main` via pull requests).
- **Branch naming suggestion:** Use consistent prefixes (e.g., `feature/`, `bugfix/`, `hotfix/`) to keep work organized.
- **Large binary handling:** Keep large masters (voice, layered art) in a parallel asset storage system or LFS; keep the repo lean with final exported assets used by builds.

#### Top-level file / folder organization
- /src — game code and small build scripts
- /assets — art/audio/ui raw exports and build-ready files
  - /assets/art — exported art assets
    - /assets/art/npc/aria, /assets/art/npc/kai, /assets/art/npc/elias
    - /assets/art/pets, /assets/art/ui
  - /assets/audio — music, sfx, voice
    - /assets/audio/music, /assets/audio/sfx/pets, /assets/audio/voice
  - /assets/ui — UI-specific sprites, icons, fonts
- /narrative — authored dialog, scene scripts, and voice IDs (reference-only content files)
- /ui — reusable UI prefabs or components (editor-ready)
- /data — runtime content tables, string tables (localization), and master roster JSON/CSV
- /build — build outputs and per-platform packaging rules (ignored in main branch)

#### Naming & small conventions
- Filenames should be descriptive and short: `npc_aria_portrait.png`, `pet_blaze_idle.atlas`, `voice_aria_scene03.wav`.
- Keep content referenced by stable IDs in `data/` (e.g., `pets.json`, `npcs.json`) rather than hard-coded paths in code.
- Store localization strings in a single place (per-locale files in `data/strings/en.json`, etc.) and reference via keys in `narrative`.

#### Developer ergonomics & handoff notes
- Include an `assets/README.md` that documents export settings, expected master file types, and which assets are allowed in builds to help artists export correctly.
- Maintain a small `build/README.md` with per-platform size targets and tips for shrinking builds (strip debug, compress audio, reduce atlas sizes).

> These conventions are designed to keep the prototype light, discoverable, and ready for iteration while leaving clear paths for localization and later platform expansion.

### API Integration
### AI/LLM Integration

#### Purpose
- Use runtime language models to enhance immediacy and warmth in narrative touchpoints without changing progression or rewards.
- Primary use cases for the prototype:
  - Generate short `DMs` (1–2 lines) responsive to published memories and player actions.
  - Produce blog caption suggestions (editable) for players when publishing memories (3–4 lines).
  - Create short voice-call lines delivered via on-the-fly `TTS` for routine call snippets (10–20s).* 
  - Provide lightweight NLP parsing for free-text DM replies to surface suggested quick replies.

#### Behavior & Constraints
- All generated output must be **grounded** to current game state (NPC, recent memory, bond level) and must **not** alter unlock pacing, grant items, or change persistent progression.
- Tone: **earnest and heartfelt** with gentle, light-flirty notes. Models must follow the persona guidance for each NPC to keep character voice consistent.
- Length bounds (prototype): `DMs` — 1–2 short lines; blog captions — 3–4 lines; call snippets — short 10–20s script segments.
- Localization: Prototype supports **English only**, with architecture notes for later locales.
- Privacy: Free-text DM inputs are session-scoped by default. If the player links an account, only structured outcomes (bond changes, unlocked flags, memory references) persist unless the player explicitly opts in to retain text content.
- Logging for model improvement is allowed **only with explicit player opt-in**, anonymized, minimal, and deletable on request.
- Safety: Apply content moderation and tone filters tuned to romance/cozy content; block or rewrite explicit or harmful outputs.

#### Integration Points & UX Patterns
1. DM generation
   - Trigger: player publishes a tagged memory or opens an unlocked DM scene.
   - UX: show a brief typing indicator immediately. If generation finishes within the latency window, display the generated DM. If latency exceeds the fallback threshold, show a cached/fallback line and replace it if the final generation arrives.
2. Blog caption generator
   - Trigger: on the Shift Results publish flow, offer one generated caption in the compose box.
   - UX: caption is editable by the player before publishing. Offer a simple `Regenerate` control if desired.
   - Persisted caption becomes the canonical `Memory.caption` on publish.
3. Voice call snippets (TTS)
   - Trigger: when the player accepts a voice call scene.
   - UX: generate a short script, synthesize via `TTS`, and play. If generation/TTS latency exceeds the defined fallback timeout, play an author-written fallback line while continuing generation in the background.
4. Free-text reply parsing
   - Trigger: player types a free-text DM reply.
   - UX: parse for intent to offer quick-reply suggestions or to auto-format into a more polished variant the player can send; never auto-send without confirmation.

#### Performance & Reliability
- Latency targets and fallback behavior:
  - Aim for low observed latency; show a typing indicator immediately.
  - Use a fallback line at the configured timeout (e.g., ~2.5s) to avoid blocking the player experience. Replace with final output if it arrives soon after.
- Cache recent generations per NPC+context to reduce repeat latency for similar interactions.

#### Voice & Assets
- Prototype uses on-the-fly `TTS` for routine voice snippets. Flag cinematic or milestone scenes to use pre-recorded voice assets authored later; generated scripts may be used as source material but recorded assets are only for high-stakes beats.
- Provide one fallback, author-written line set per NPC for latency/error cases.

#### Privacy, Logging & Consent
- Default: no persistent logging of player-generated or AI-generated text for model training.
- Offer explicit, granular opt-in for anonymous/improved-model logging. Opt-in data must be anonymized, deletable, and minimally retained.
- Retain only the minimum generated metadata required to reconcile UI state (e.g., `localId`, generation timestamp) unless the player opts in to broader retention.

#### Authoring & Safety Practices
- Maintain concise prompt templates per NPC and per interaction type to ensure consistent voice and bounded creativity.
- Keep a curated pool of fallback lines and hard-coded high-stakes dialog to prevent unpredictable outputs in key narrative moments.
- Apply content filters tailored to romance/cozy tone; block explicit adult or abusive content.

> The AI features are additive: they make interactions feel more alive and personalized while keeping player control, predictability, and privacy at the forefront.

### Project Structure
### Codebase / File Structure

#### Purpose
- Provide a lightweight, approachable repository layout that makes it easy for designers and engineers to iterate on the prototype while remaining engine-agnostic. The layout supports TypeScript data models, localized strings, authored narrative, and clear asset ownership.

#### High-level principles
- Keep static content and runtime data separate from code.
- Reference assets by stable IDs in `data/` rather than hard-coded paths.
- Keep the main branch engine-agnostic; provide optional engine template branches for web clients.
- Include tiny demo assets in-repo for runnable scenes; keep production masters in external asset storage and use Git LFS for large files.

#### Top-level folders (recommended)
- `/src` — TypeScript game code and small build scripts
  - `/src/models` — TypeScript interfaces for `Player`, `Pet`, `NPC`, `Memory`, `Shift` (domain models)
  - `/src/ui` — reusable UI helpers (engine-agnostic) and small utility functions
  - `/src/entry` — example entry points or small wrappers for experimentation

- `/data` — runtime content tables and localization
  - `pets.json`, `npcs.json`, `scenes.json` (master rosters referenced by ID)
  - `/data/strings/en.json` — string table(s) keyed for localization
  - `/data/seed/` — small seed content (15 pets, 3–5 blog JSONs, 1–2 scene stubs)

- `/assets` — exported assets used by builds (small demo files only)
  - `/assets/art` — `npc/aria/`, `npc/kai/`, `npc/elias/`, `pets/`, `ui/`
  - `/assets/audio` — `music/`, `sfx/`, `voice/` (tiny demo clips)
  - `/assets/ui` — icons, fonts, `svg` sources
  - `/assets/README.md` — export rules, format guidance, LFS rules, and where masters live

- `/narrative` — authored scene scripts, DM templates, voice IDs (reference-only content files)

- `/ui` — reusable UI prefabs or component examples (engine-agnostic patterns)

- `/docs` — contributor docs (assets export, naming, build/readme)

- `/build` — CI/build outputs and per-platform packaging rules (gitignored)

- `.gitattributes` / `.gitignore` / `README.md` — repo metadata and LFS settings

#### Naming & ID conventions
1. Filenames should be short and descriptive: `npc_aria_portrait.webp`, `pet_blaze_idle.atlas`, `voice_aria_scene03_demo.wav`.
2. Static content is referenced by stable IDs from `data/` (e.g., `petId: "blaze"`, `sceneId: "aria_scene_03"`).
3. Localization keys live in `/data/strings/.json` and are used by narrative files and UI.

#### TypeScript & domain models
- Keep a small `types/` or `models/` folder with interfaces for core entities so designers and engineers can rely on consistent fields (no runtime assumptions).
- Example: `src/models/Pet.ts` exports `interface Pet { petId: string; rarity: 'Common'|'Rare'|'UltraRare'; sectionAffinity: string; artRefs: string[] }`.

#### Engine templates & branches
- Main branch remains engine-agnostic.
- Create `template/phaser` and `template/pixi` branches (or folders) that contain minimal starter projects wired to the same `data/` and `assets/seed` layout so web clients can be bootstrapped quickly.

#### Asset handling & size rules
- Include tiny demo `webp/png` assets and short audio clips in the repo for iteration.
- Large masters live in external storage; use Git LFS for any repo file > 5MB and point to the external masters in `/assets/README.md`.
- Prefer `webp` for raster exports with `png` fallback for transparency; use `svg` for icons.

#### Seed content
- Ship a small seed set in `/data/seed` to let designers iterate: the curated pet roster (15 entries), a handful of memory JSONs, and minimal scene stubs.

#### Developer & artist onboarding files
- `/assets/README.md` — export settings, allowed formats, LFS thresholds, naming rules.
- `/docs/CONTRIBUTING.md` — branch workflow, PR expectations, and how to add seed content.

> This structure keeps the repository discoverable, minimizes friction for designers and artists, and provides clear paths to add engine-specific clients without bloating the main branch.

### Data Structures
### Data Structures

#### Overview
- The prototype uses a small set of focused entities to support collection (pets), café shifts, memory publishing, and NPC bond progression.
- Emphasis is on references to master content (art/audio/text by ID), simple per-player records, and a lightweight pending/optimistic queue for in-flight actions.

#### Core entities & key fields

1. **Player**
   - `playerId` (ID reference)
   - `coins`, `premiumCurrency`
   - `subscribers`
   - `pets[]` — array of Player–Pet references (see below)
   - `npcBonds[]` — per-NPC bond meters and milestones
   - `consumables` — counts per consumable item (`finishShiftItem: n`)
   - `dupeTokens` — global token balance and `dupesConverted` counters per pet
   - `blogPosts[]` — list of published Memory IDs (chronological)
   - `pendingActions[]` — optimistic/pending operations (`localId`, `type`, `payload`)

2. **Player–Pet (owned pet entry)**
   - `petId` (master roster ID)
   - `skinId?` (optional)
   - `acquiredAt` (timestamp)
   - `assignedSection?` (current slot assignment)
   - `affinity?` (optional tie to an NPC)
   - `passiveBuffs?` (optional simple fields — include only if prototype needs stat effects)

3. **Pet (master roster record)**
   - `petId`, `name`, `rarity` (`Common`/`Rare`/`UltraRare`)
   - `sectionAffinity` (which helper the pet is tied to)
   - references to art/animation IDs and preview assets

4. **NPC**
   - `npcId`, `sectionType` (Bakery/Playground/Styling)
   - `bondLevel` (numeric)
   - `unlockedScenes[]` — entries with `{ sceneId, viewedAt?, voicePlayed? }`
   - references to DM/voice content by ID

5. **Shift** (transient but persisted while active)
   - `shiftId`, `assignedPets[]` (petIds), `helperNpcId`
   - `duration`, `startedAt`, `status` (`idle|running|complete`)
   - `rewards` — `{ coins, xp, memoryCandidateId }`

6. **Memory** (published blog entry)
   - `memoryId`, `npcId`, `sectionId`
   - `caption` (player text)
   - `publishedAt` (timestamp)
   - analytics: `likes`, `subscriberBoost`
   - references to voice/scene asset IDs if the memory triggers a narrative beat

7. **Consumable / Economy items**
   - tracked on `Player.consumables` as simple integer counts; consumable use produces immediate state change and a logged transaction for saves.

#### Persistence & sync notes
- Store minimal authoritative state server-side for linked accounts; anonymous saves remain device-local until linking.
- Keep `pendingActions[]` on Player so optimistic publishes or pending gacha resolves survive app restarts and can be reconciled with server IDs.
- Reference audio/DM text by content IDs (no inline raw audio blobs) to support localization and lightweight saves.

> Keep data shapes compact and reference-driven. The master roster and content store hold static definitions; Player records hold only what is required to reproduce UI state, support fast restores, and enable replays of unlocked scenes.

### Data Management
#### Player/Save Data
Auto-save after shifts, gacha pulls, blog posts, and story unlocks; cloud sync supported.

**NPC Bonds:** Meters fill from memories, shifts, chats/calls; unlock scenes/cosmetics.
**Café Growth:** Expand/upgrade sections; blog subscribers act as prestige.
**Collection:** Collect pets via gacha; dupes → tokens for skins/buffs; ultra-rares unlock cross-NPC vignettes.

Cloud sync should support anonymous device-based saves by default, with the option to link an account later for persistence. This keeps onboarding fast while still offering secure progression for invested players.

Only a single profile per device/account is needed. Multiple save slots would add complexity without much benefit for this genre.

Cloud data should be retained indefinitely after uninstall, so returning players can pick up where they left off. This matches expectations set by games like Love and Deepspace.

#### Game Economy
**Coins:** Earned in shifts; spent on consumables/expansions.
**Diamonds/Wishes:** Premium → gacha pulls.
**Pet Tokens:** From dupes → skins/buffs.
**Memories:** Earned in shifts; posted to blog → bond/subscriber boosts.

#### Persistance
Auto-save after shifts, gacha pulls, blog posts, and story unlocks; cloud sync supported.

Cloud sync should support anonymous device-based saves by default, with the option to link an account later for persistence. This keeps onboarding fast while still offering secure progression for invested players.

Only a single profile per device/account is needed. Multiple save slots would add complexity without much benefit for this genre.

Cloud data should be retained indefinitely after uninstall, so returning players can pick up where they left off. This matches expectations set by games like Love and Deepspace.

## 4. Aesthetics

### Aesthetics & Audio

#### Visual Style — Overview
- **Overall tone:** Warm, cozy, and tender. Visuals feel inviting at first glance and soothe the player through rounded shapes, soft lighting, and gentle contrast.
- **Art direction:** Pastel diorama scenes with soft, rounded furniture and simplified props. Illustration style blends chibi-leaning pets with expressive faces and anime-influenced NPC art presented at three-quarter body in pushable scenes.

#### Color Palette & Lighting
- **Primary palette:** Warm pastels — peach, cream, mint — used for backgrounds, surfaces, and key interactive highlights.
- **Accents:** Slightly richer warm hues for call-to-action elements and emotional beats (e.g., mild coral or gold).
- **Lighting:** Soft directional light with subtle bloom to create a comfortable, sunlit café feel.

#### Characters & Pets
- **Pets:** Chibi-leaning proportions, simplified silhouettes, exaggerated expressions. Animations lean playful and frequent to maximize charm.
- **NPCs:** Three-quarter body illustrations for pushable scenes, drawn in a soft anime-romance style. Expressions and pose language communicate earnest, heartfelt emotion.

#### UI Look & Feel
- **Form language:** Rounded cards and buttons, gentle drop shadows, and ample padding to keep screens uncluttered and friendly.
- **Visual feedback:** Warm, subtle highlights and soft chimes for positive actions. Iconography is simple and hand-drawn in style to match the cozy aesthetic.

#### Motion & Animation
1.  Frequent micro-animations for pets (bobs, ear twitches, tail flicks) that make the café feel alive.
2.  Smooth pushable scene transitions with slight parallax to add depth without distraction.
3.  NPC portraits use layered poses and subtle breathing/gesture loops to maintain intimacy.

#### Music & Ambience
- **Café hub:** Gentle lo-fi café tracks with light percussion, mellow keys, and a warm, steady groove to support relaxed play.
- **Romance scenes:** More emotive arrangements using piano and strings, warmer instrumentation, and slightly slower pacing to highlight intimacy.
- **Ambience:** Low-volume café room tone (murmur, distant kettle) can be present under the hub loop for texture where appropriate.

#### Sound Effects & Voice
- **Pet SFX:** Frequent and playful — chirps, purrs, barks, happy squeaks — used both on interaction and in idle moments to reinforce personality.
- **UI SFX:** Soft, warm chimes and tactile sounds for confirmations and small rewards.
- **Voice:** Short, warm/clear voice snippets (10–20s) for scene beats. Delivery is intimate and slightly soft to enhance emotional impact.

> The combined aesthetic and audio approach is designed to make each small moment feel meaningful: visuals invite closeness, animations create life, and sound ties feeling to moment without overwhelming it.