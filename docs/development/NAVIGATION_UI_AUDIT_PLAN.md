# Navigation & UI Audit – September 25, 2025

## Navigation Overview
- **Persistent Header**
  - Branding, player currencies, quick actions
  - Needs NPC bond highlight and consistent stat styling
- **Bottom Navigation**
  - Café, Pets, Gacha, Messages, Blog
  - Should surface NPC relationship context in labels/badges
- **Screen Header**
  - Contextual titles/back navigation
  - Ensure action buttons align with Material design tokens
- **Modal & Overlay Layer**
  - Shift rewards, scenes, voice calls
  - Must funnel players back into NPC-driven loops

## Screen-by-Screen Findings

### Café Overview (`cafe-overview`)
- **Should Show**: Daily shift summary, NPC relationship cues, quick DM/scene access
- **Has**: Sections grid, numeric stats, helper references (minimal)
- **Styling**: Mobile-friendly layout but inconsistent spacing, older card styles
- **Consistency**: Card shadows/radii differ from other screens
- **Action**: Replace stats panel with NPC spotlight card, unify grid spacing, add CTA to current milestone DM/scene

### Section Screens (`section-screen-*`)
- **Should Show**: Assigned pets, helper NPC presence, bond rewards forecast, shift timers
- **Has**: Shift panel with modal-only bond info
- **Styling**: Padding misaligned, mixed button styles
- **Consistency**: Icon usage varies by section
- **Action**: Add banner with helper portrait + bond progress, standardize control buttons, surface bond gain estimates pre-shift

### Pets Collection (`pet-collection`)
- **Should Show**: Pet inventory, filter state, NPC affinity progress, collection goals
- **Has**: Filters, pet cards without affinity cues
- **Styling**: Filters match guidelines; cards align with grid
- **Consistency**: Progress widgets differ from Gacha modal
- **Action**: Add NPC affinity badges per pet, introduce bond impact summary panel, share card tokens with other screens

### Gacha (`gacha`)
- **Should Show**: Banner info, pull results, bond boosts, NPC reactions
- **Has**: Result summary with bond boosts (modal only)
- **Styling**: Consistent with Material icons; main screen currency heavy
- **Consistency**: CTA buttons close to spec
- **Action**: Add persistent helper affinity widget, reference unlocked DM topics/scenes after pulls, align button typography with DM quick replies

### Messages List (`dm-list`)
- **Should Show**: NPC portraits, unread counts, bond progression hints, unlock guidance
- **Has**: Portraits, unread badges; no bond meter
- **Styling**: Items fit mobile-first patterns
- **Consistency**: Badges/colors aligned with nav tokens
- **Action**: Display bond level pill + next milestone tooltip, include recent shared activity snippet per NPC

### DM Conversation (`dm-*`)
- **Should Show**: Bond bar, history, quick replies, scene follow-up, affinity reminders
- **Has**: Bond bar, quick replies, scene card; locked replies use tooltip
- **Styling**: Bubble spacing solid; locked tooltip needs consistency
- **Consistency**: Header buttons match global style
- **Action**: Add milestone banner, standardize tooltip style, highlight recent pet affinity and last shared memory in header

### Blog (`blog`)
- **Should Show**: Memories, NPC reactions, bond gains, next actions
- **Has**: NPC tag/bond points; no DM link
- **Styling**: Padding larger than other cards; button style differs
- **Consistency**: Typography off relative to pet cards
- **Action**: Add "Message {NPC}" CTA on cards, align card spacing with shared tokens, insert bond progress recap at top

### Memory Selection (`memory-selection`)
- **Should Show**: Unpublished memories, NPC tags, bond reward preview, publish CTA
- **Has**: Tagged memories; no bond forecast
- **Styling**: Matches responsive layout
- **Action**: Show bond reward estimate + suggested DM topic per memory

### Shift Rewards Modal
- **Should Show**: Coins, bond gains, NPC reactions, follow-up path
- **Has**: All; lacks next-step CTA
- **Styling**: Cohesive, modern
- **Action**: Add direct DM/scene CTA post-shift

### Scene Player / Voice Call
- **Should Show**: Narrative beats, bond rewards, follow-up prompt
- **Has**: Scenes with rewards; no automatic DM prompt
- **Styling**: Consistent overlay design
- **Action**: Trigger DM suggestion or milestone checklist after completion

## UI Container Consistency
- **Stat Blocks**: Align fonts and spacing across header, modals, bond bars
- **Cards**: Adopt shared radius/shadow/padding tokens across Café, Pets, Blog
- **Buttons**: Standardize primary/secondary styles to match DM quick replies and gacha CTAs
- **Tooltips**: Reuse unified tooltip styling for locked content (filters, replies, milestones)
- **Typography**: Ensure `--font-size-base` tokens applied uniformly to labels, values, nav text

## Relationship-First Course Correction
1. **Navigation Narrative Layer**
   - Add “Closest Bond” summary to persistent header
   - Update bottom nav badges to reference NPCs (e.g., Messages shows top NPC name)

2. **Screen Enhancements**
   - Café: Relationship spotlight card with quick DM/scene links
   - Section Screens: Helper spotlight + bond gains forecast
   - Pets/Gacha: NPC affinity progress while browsing/adopting
   - Blog/Memories: CTA back to NPC conversations and milestone status
   - DM: Recent shared activities banner

3. **Styling Sprint**
   - Introduce shared `ui-tokens.css` for cards/buttons/tooltips
   - Normalize padding, shadows, radius across components
   - Apply consistent Material icon sizing and typography scale

4. **Relationship Systems Surfacing**
   - Global bond widget accessible from all screens
   - Notifications prioritize bond milestones and new NPC content

5. **Validation & Testing**
   - Extend validation suite for bond widget presence, NPC CTA visibility, tooltip consistency
   - UX checklist to confirm each navigation path reinforces NPC relationships

## Implementation Progress – September 25, 2025 (Afternoon)
- **Persistent Header & Café**: Relationship spotlight and closest-bond badge implemented.
- **Section Screens**: Helper spotlight banner with DM/scene shortcuts now live.
- **Pets Collection**: Affinity summary panel and per-pet bond tags added.
- **Gacha Screen**: Helper affinity overview displayed before pulls with scene CTA.
- **Blog & Memories**: Bond-centric banners guide players back to DMs before/after publishing.
- **Styling**: Shared spotlight styles introduced in `main.css`, applied across relationship widgets.
- Next up: unify remaining button/card tokens and expand validation coverage per plan.
