# Quest System Implementation Summary

## Overview
The PetCafe game now features an interactive map-based quest system for the Bakery section (prototype). This replaces the traditional shift assignment UI with a more engaging, visual experience where players tap on locations in the cafe to assign pets to specific quests.

## Key Features

### 1. **Interactive Map Interface**
- Background image showing the Bakery layout
- 3 tappable quest locations strategically placed on the map
- Visual feedback with pulsing `+` icons for available quests
- Pets appear on the map with transparent portraits after assignment

### 2. **Quest Modal System**
The modal has 5 sections as specified:

#### a) Quest Description
- Thematic description relating to the Bakery and Aria
- Contextual narrative for each quest

#### b) Special Trait Requirement
- Displays the required special trait prominently
- Visual badge styling with gold gradient
- Clear subtitle explaining the requirement

#### c) Pet Selector
- Grid display of eligible pets (filtered by special trait)
- Only shows owned pets with matching traits
- Sorted by rarity (5★ → 4★ → 3★) then alphabetically
- Transparent pet portraits for visual consistency
- Click to select with highlight animation

#### d) Rewards Calculator
- Shows quest duration
- Displays expected rewards:
  - Coins (base × rarity multiplier)
  - NPC Bond XP (base × rarity multiplier)
  - Gacha tickets (if applicable)
- Rarity multipliers: 3★ = 1.0x, 4★ = 1.5x, 5★ = 2.0x

#### e) Confirmation Button
- Disabled until a pet is selected
- Primary button styling
- "Confirm & Start Quest" with icon

### 3. **Pet Placement & Animation**
Once confirmed:
- Pet's transparent portrait appears at the quest location
- Smooth bounce-in animation
- Floating animation during active quest
- Countdown timer displays remaining time (MM:SS format)
- Completion badge with glow animation when ready

### 4. **Quest Management**
- 3 simultaneous quests per section
- Each quest runs independently
- Real-time countdown timers (updates every second)
- Tap completed quest to collect rewards
- Auto-stops update loop when no active quests

## Technical Implementation

### New Files Created

1. **Models**
   - `src/models/Quest.ts` - Quest and ActiveQuest interfaces
   - `src/data/quests.ts` - Quest data for all 3 sections

2. **UI Components**
   - `src/ui/components/QuestModal.ts` - Modal for pet selection
   - `src/ui/MapSectionScreen.ts` - Interactive map screen

3. **Styles**
   - `src/styles/quest-modal.css` - Quest modal styling
   - `src/styles/map-section.css` - Map section styling with animations

### Updated Files

1. **Pet Model** (`src/models/Pet.ts`)
   - Added `specialTrait?: string` property
   - Added `transparentPortrait?: string` to artRefs

2. **Pet Data Utility** (`src/utils/petData.ts`)
   - Added special trait mapping for all 15 pets
   - Auto-generates transparent portrait paths
   - Returns transparent portraits in getPetById

3. **Main Entry** (`src/entry/main.ts`)
   - Initialized QuestModal component
   - Conditional rendering: Bakery uses MapSectionScreen, others use SectionScreen

4. **Styles** (`src/styles/main.css`)
   - Imported quest-modal.css and map-section.css

## Quest Data Structure

### Bakery Quests
1. **Morning Taste Test**
   - Trait: "Expert Taste Tester"
   - Duration: 3 minutes
   - Pets: Muffin (5★)

2. **Oven Watch Duty**
   - Trait: "Temperature Detective"
   - Duration: 3 minutes
   - Pets: Peanut (3★)

3. **Cookie Decorating**
   - Trait: "Cookie Artist"
   - Duration: 3 minutes
   - Pets: Luna (4★)

### Quest Positioning
Quests are positioned using percentage-based coordinates (x%, y%) on the map:
- Quest 1: 25%, 55% (left side)
- Quest 2: 70%, 60% (right side)
- Quest 3: 50%, 35% (center-top)

## Special Traits System

Each pet has a unique special trait that determines which quests they can complete:

| Pet | Rarity | Special Trait | Section |
|-----|--------|---------------|---------|
| Muffin | 5★ | Expert Taste Tester | Bakery |
| Peanut | 3★ | Temperature Detective | Bakery |
| Luna | 4★ | Cookie Artist | Bakery |
| Buddy | 3★ | Welcome Committee | Playground |
| Prince | 3★ | Royal Judge | Salon |
| Patches | 4★ | Glitter Enthusiast | Playground |
| Chip | 3★ | Organization Expert | Bakery |
| Turbo | 3★ | Determination Master | Playground |
| Sunny | 4★ | Melody Composer | Playground |
| Whiskers | 4★ | Fashion Assistant | Salon |
| Storm | 3★ | Dust Bath Artist | Salon |
| Rue | 4★ | Mood Reader | Salon |
| Harmony | 5★ | Memory Keeper | Bakery |
| Blaze | 5★ | Game Inventor | Playground |
| Iris | 5★ | Beauty Teacher | Salon |

## Animations

### Quest Markers
- **Pulse Animation**: Available quest markers pulse to draw attention
- **Bounce-in**: Pets animate in with a bouncy scale effect
- **Float**: Active pets float gently up and down
- **Glow**: Completed quests have a glowing gold effect

### Modal
- **Backdrop fade-in**: Smooth modal appearance
- **Pet selection**: Selected pet card highlights with gold gradient
- **Hover effects**: Cards lift on hover

## Rewards System

Rewards are calculated dynamically based on:
- Base rewards defined in quest data
- Pet rarity multiplier (1.0x, 1.5x, 2.0x)
- Awarded to player on collection:
  - Coins added to player.currency.coins
  - Bond XP added to NPC relationship
  - Gacha tickets added to player.currency.freeGachaCurrency

## User Flow

1. Player enters Bakery section
2. Sees interactive map with 3 `+` icons
3. Taps a `+` icon
4. Quest Modal opens showing:
   - Quest description
   - Required trait
   - Eligible pets (filtered and sorted)
5. Player selects a pet
6. Rewards calculator updates with expected rewards
7. Player confirms selection
8. Pet appears on map at quest location
9. Countdown timer shows remaining time
10. Pet floats/animates while working
11. Completion badge appears when done
12. Player taps completed quest to collect rewards
13. Rewards modal shows earnings
14. Quest marker returns to `+` icon

## Future Expansion

The system is designed to be easily expandable:
- Playground quests are defined but not yet active
- Salon quests are defined but not yet active
- To enable for other sections, update the conditional in `main.ts`:
  ```typescript
  const screen = ['bakery', 'playground', 'salon'].includes(data.data.sectionType)
    ? new MapSectionScreen(...)
    : new SectionScreen(...);
  ```

## Notes

- The old SectionScreen (shift-based) is still available for Playground and Salon
- Quest system preserves existing reward collection flow
- No memory generation in quest system (yet)
- Quest states are currently session-based (not persisted)
- For persistence, add activeQuests to GameState and save/load them

