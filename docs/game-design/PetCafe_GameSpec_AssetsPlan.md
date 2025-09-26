# Assets Plan for My Game Spec

*Generated on 9/19/2025*

---

### UI Art

#### Core Screens & HUD

- **Café Overview / Hub Background** — single layered diorama background showing three section tiles (Bakery, Playground, Styling). Export as `webp` background + layered PSD/AI source.
- **Section Screens (3)** — Bakery / Playground / Styling backgrounds sized for mobile safe area. Export as `webp` + PSD source.
- **Shift Setup Panel** — rounded card UI for assigning pets, consumable slot, and `Start Shift` button. Provide `webp` sprites and UI source files.
- **Shift In-Progress HUD** — circular timer widget + remaining time numeric. Export as `svg`/`png` and include `json` config for the animated conic progress.
- **Shift Results Panel** — reward counters, memory preview capture slot, `Publish` button. Deliver layered art for optimistic insert animation.
- **Blog / Memory Feed UI** — card layout for feed items, author tag badge, timestamp, like/subscriber count areas. Provide `webp` UI elements and `svg` icons.
- **Gacha Screen UI** — pull button, pull count chip, reveal canvas frame, rarity-bars. Provide layered UI art and particles sheet source for reveals.
- **Pet Roster / Compendium UI** — grid card templates, filter chips (rarity/section), pet detail panel.
- **DM / Call UI** — messaging card assets, message bubble sprites, call overlay card (accept/end buttons). No recorded VO assets are included.
- **Shop UI** — store shelf card art, consumable tiles, currency purchase flow art.
- **Title / Main Menu** — logo art and start button art.


### Icons

- **Currencies (3)** — **Coins**, **Premium Diamonds**, **Pet Dupe Token** as `svg` + `png` (usable as HUD icons).
- **Rarity Badges (3)** — `Common`, `Rare`, `Ultra Rare` badges as small `svg` icons and color passes.
- **Notifications (3)** — `New DM`, `New Memory`, `New Pull` as `svg`.
- **Core UI Icons** — `Back`, `Settings`, `Start Shift`, `Publish`, `Collect`, `Drag Handle` (each as `svg`).
- **Consumable Icon (1)** — `Finish Shift` consumable.


### Images / Illustrations

#### NPC Art

- **Aria (Bakery)**
  - **Portrait set:** layered master PSD/AI + exported `webp` portrait.
  - **Expressions:** **3–4 variants** (happy, flustered, thoughtful, affectionate) exported as separate `webp`/`png` slices.
  - **Café pose / pushable scene image** — single 3-quarter body illustration for café context.

- **Kai (Playground)** — same deliverables as Aria (portrait set + **3–4** expressions + café pose).

- **Elias (Styling)** — same deliverables as Aria (portrait set + **3–4** expressions + café pose).


#### Pets (starter roster: **15**)

- For each pet in the curated roster (list provided in the concept):
  - **Small portrait / collection icon** (`webp`/`png`) for roster and gacha thumbnails.
  - **Large art / showcase still** used for vignette cards (`webp`).
  - Keep source layered files (PSD/AI) for future skins.

- Exports must include a transparent trimmed `png`/`webp` at mobile sprite sizes and a 2x/3x scale variant for high-DPI devices.


### Animations & Video

#### Pet Animation (Skeletal rigs)

- **Pet rigs:** **15 skeletal rigs** (`Spine` or `DragonBones`) — one per pet, each containing at minimum:
  - **Idle loop** (gentle bob / breathing / small tail/ear movement).
  - **Small interaction loop** (playful hop / chirp reaction) used in café shift interactions.
  - Export runtime `json`/`atlas` and trimmed frame atlas `webp` for fallback.

- **Ultra-Rare enhancement:** for **Harmony, Blaze, Iris** add an extra flourish animation state used during unlocks (longer idle-to-flourish transition).

#### NPC Portrait Motion

- **Layered cutouts (3 NPCs)** that support subtle **breathing / blink / gesture loops**. Provide:
  - PSD/AI with layer groups (eyes, mouth, hair, clothing, hands) for cutout rigging.
  - Exported portrait animation (small looping `json` rig or `webp` sprite-sequence) for pushable scenes.

#### Gacha Reveal & Vignette Intros

- **In-engine gacha reveal sequence** assets (particles, confetti sprites, UI vignette overlays). Provide particle spritesheets and layered frames for staged reveals.
- **Pre-rendered cinematic clips (`.webm`)** for Ultra Rares **(3 clips — one per Ultra Rare)** used as a brief cinematic intro on pull/unlock. Each clip should be short (3–7s), optimized for mobile streaming.

- Note: deliver animation sources (Spine/DragonBones project files or exported JSON + atlas) and lightweight runtime exports.


### Audio (no recorded voice assets)

#### Music

- **Café Hub Loop — 1**: gentle lo‑fi / mellow keys loop (`.ogg` / `.mp3`) sized for streaming.
- **Romance Scene Music**: confirm preferred approach — include either **one shared romance track** or **three distinct short romance tracks (one per NPC)**. Deliver as `ogg` and `mp3` stems.

#### SFX (shared/species groups)

- **Species SFX Groups (~6)** (shared library; multiple short cues per group for idle / interact / unlock):
  - **Dogs** (covers Corgi, Golden, Pomeranian)
  - **Cats** (covers Calico, Persian)
  - **Birds** (covers Cockatiel, Parakeet, Peacock)
  - **Small Mammals** (Rabbit, Hamster, Ferret, Chinchilla)
  - **Aquatic** (Betta fish — bubbles/ripple)
  - **Exotic (Fox)** (Blaze)

- **Gacha Stingers**: short reveal stings for `Common`, `Rare`, and **Ultra Rare** (Ultra Rare has layered flourish cue). Export as `ogg` and `mp3`.
- **UI SFX**: taps, confirms, error/shake, publish shimmer, toast pop (short `.ogg`).
- **Ambience**: optional low-volume café room tone for hub (loopable `.ogg`).

Notes: per your direction, shared/species SFX replaces bespoke per-pet audio for prototype scope. Ultra Rares get an audio flourish layer paired with the cinematic clip.


### Non-Asset Visuals (CSS / Guidelines)

- **Color & Typography**
  - Primary palette: warm pastels — `#FDEBD0` (cream), `#FFDCC6` (peach), `#DFF3E6` (mint). Use accent `#FF9E80` (coral) or `#FFD166` (gold) for CTAs.
  - Use a rounded-friendly UI font (support `font-weight` 400/600) and scalable `rem` units for text.

- **Form & Spacing**
  - Buttons: `.btn { border-radius: 12px; padding: 10px 14px; }`.
  - Cards: `.card { border-radius: 14px; box-shadow: 0 6px 18px rgba(30,20,10,0.06); }`.

- **Motion Classes (naming & intent)**
  - `.btn--press`, `.tile--press`, `.slot--valid-drop`, `.slot--invalid-drop`, `.feed-item--optimistic` (use exactly these class names in exported UI assets to match engine hooks).
  - Respect `prefers-reduced-motion`: reduce parallax and long easing curves when set.

- **Iconography & Rarity Cues**
  - Always pair color + shape for rarity: e.g., gold rounded star + `Ultra Rare` coral hue to avoid purely color-dependent cues.

- **Export Guidelines**
  - Provide `2x` and `3x` scaled `webp` exports for all UI / hero art.
  - Deliver layered source files (PSD/AI) and an `assets/README.md` documenting export sizes, format targets (`webp` primary, `png` fallback), and Spine/DragonBones export settings.


### Deliverables Checklist (concrete)

- UI Art
  - **1** Café Overview background (layered PSD + `webp`)
  - **3** Section backgrounds (`webp` + PSD)
  - **1** Shift Setup panel art (layers + exported sprites)
  - **1** Shift Results panel art
  - **1** Blog feed card set (slices)
  - **1** Gacha UI frame + particle spritesheet
  - **1** Title/logo image

- Characters & Pets
  - **3** NPC portrait master files (PSD/AI) + **3–4** expression sprites each
  - **15** Pet portrait icons (`webp`) + layered masters
  - **15** Pet skeletal rigs (`Spine`/`DragonBones`) with `idle` + `interaction` states

- Animations & Video
  - In-engine particle spritesheets for gacha reveal
  - **3** Ultra Rare `.webm` intro clips (one per Ultra Rare)

- Audio
  - **1** Café hub music loop (`ogg`/`mp3`)
  - **(TBD)** Romance music: confirm 1 shared or 3 distinct tracks
  - Species SFX groups (Dogs, Cats, Birds, Small Mammals, Aquatic, Exotic) — short loopables/cues
  - UI SFX set (taps, small chimes, error/warn, publish shimmer)

- Non-Asset Visuals
  - `assets/README.md` with export rules
  - CSS guidelines and motion class list (as above)


### Constraints / Exclusions

- No pre-recorded voice acting / VO files will be delivered for the prototype (per current constraint). Use runtime TTS if voice snippets are required.
- Localization-ready source (string keys) included, but only English audio/music assets are planned for the prototype unless you confirm otherwise.



## Structured Asset List

### Types of Assets Needed
- UI Art
- Icons
- Images
- Videos
- Animations
- Non-asset implementation (CSS, graphics processing)

### UI Art
- Café Overview background x1 — Layered PSD/AI master and exported `webp` background showing three section tiles and hub elements.
- Section backgrounds x3 — Bakery, Playground, Styling backgrounds (layered PSD + `webp` exports).
- Shift Setup & Results panels x2 — Rounded card UI art for assignment, consumable slot, timer, rewards, and publish flow (PSD + exported slices).
- Blog feed UI set x1 — Card templates, tags, and feed chrome art (slices + PSD).
- Gacha UI frame & particle sprites x1 — UI layout for pulls, particle spritesheets for in-engine reveals.
- Pet Roster / Compendium UI x1 — Grid card templates and detailed pet panel art.
- DM / Call overlay UI x1 — Message bubble sprites, call overlay card art (no VO assets).
- Title / Logo x1 — App title art for main menu and splash.

### Icons
- Currency icons x3 — `svg` + `png` icons for Coins, Premium Diamonds, Pet Dupe Token.
- Rarity badges x3 — `svg` badges for Common / Rare / Ultra Rare.
- Notification icons x3 — `svg` icons for New DM / New Memory / New Pull.
- Core UI icons x6 — `svg` set including Back, Settings, Start Shift, Publish, Collect, Drag Handle.
- Consumable icon x1 — Icon for Finish Shift consumable.

### Images
- NPC portrait masters x3 — PSD/AI master files for Aria, Kai, Elias with layered groups; exported `webp` portraits.
- NPC expression sprites x9 — 3–4 expression variants per NPC exported as `webp`/`png` slices.
- NPC café pose / pushable scene art x3 — Single three-quarter body café-context illustration per NPC.
- Pet portrait icons (starter 15) x15 — Collection thumbnail and larger showcase still per pet (`webp` + layered master).

### Videos
- Ultra Rare cinematic clips x3 — Short pre-rendered `.webm` clips (optimized for mobile streaming) for each Ultra Rare pet's pull/vignette intro.

### Animations
- Pet skeletal rigs x15 — `Spine`/`DragonBones` rigs for each pet with `idle` and `interaction` states exported as runtime `json` + atlas and trimmed `webp` fallback.
- NPC portrait loops x3 — Layered cutout rigs or exported portrait loops (breathing/blink/gesture) for pushable scenes.
- Gacha in-engine reveal assets x1 — Particle spritesheets and staged reveal frames for in-engine animation sequences.

### Non-Asset Visual Implementation
#### CSS Styles
- Rounded button and card system: `.btn { border-radius: 12px; padding: 10px 14px; }` and `.card { border-radius: 14px; box-shadow: 0 6px 18px rgba(30,20,10,0.06); }`.
- Motion class names to match engine hooks: `.btn--press`, `.tile--press`, `.slot--valid-drop`, `.slot--invalid-drop`, `.feed-item--optimistic`.
- Color palette guidance (warm pastel): primary cream/peach/mint and accent coral/gold; pair color + shape for rarity cues.

#### Visual Guidelines
- Export `webp` primary images with `png` fallbacks for transparency; provide `2x`/`3x` variants for high-DPI.
- Provide layered PSD/AI masters and Spine/DragonBones project files for rigs; include an `assets/README.md` with export rules.
- Respect `prefers-reduced-motion` in animation implementation and provide static fallbacks for heavy effects.

### Sound Effects
- Species SFX groups x6 — Shared sound libraries covering Dogs, Cats, Birds, Small Mammals, Aquatic, Exotic (short idle/interact/unlock cues).
- Gacha reveal stingers x3 — Short stings for Common/Rare/Ultra Rare; Ultra Rare has layered flourish.
- UI SFX set x1 — Taps, confirms, error/shake, publish shimmer, toast pop, pawprint spinner.
- Ambience loop x1 — Optional low-volume café room tone loop for the hub.

### Music
- Café hub music loop x1 — Gentle lo‑fi loop for hub ambience (deliver as `ogg`/`mp3`).
- Romance scene music (TBD) x1 — Either one shared romance track or distinct short romance track(s) per NPC — confirm approach before authoring.

### Assumptions
- Prototype will not include pre-recorded voice acting assets — voice-call snippets will use runtime TTS if voice is required.
- Skeletal rig runtime (`Spine`/`DragonBones`) will be supported in the target engine/build; otherwise fallback to exported sprite atlases will be used.
- Ultra Rare cinematic clips will be short (`3–7s`) `.webm` files to keep package size manageable and stream-friendly.
- Music/localization: English-only assets for prototype; string tables prepared for later localization.
- Audio delivered as compressed `ogg`/`mp3` and images as `webp` primary with `png` fallback.

