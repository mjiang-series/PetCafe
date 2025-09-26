# PetCafe Progression Systems Overview

## Currency & Reward Rates

### 1. Shift Duration
- **Base Duration**: 3 minutes (180 seconds)
- All rewards are calculated based on this duration

### 2. Coins (Soft Currency)
- **Base Rate**: 10 coins per second
- **Pet Bonuses**: Additional multipliers based on assigned pets

### 3. NPC Relationship XP
- **Base Rate**: 1 XP per second
- **Display**: Shows as heart icon (♥) in shift timer and rewards

### 4. Gacha Tickets (Free Pull Currency)
- **Bonus Reward**: 1 ticket every 5th shift completed
- **Tracking**: Based on `player.statistics.totalShiftsCompleted`
- **Example**: Shifts 5, 10, 15, 20, etc. award 1 ticket

## NPC Relationship Progression

### Level Thresholds
- **Level 1 → Level 2**: 150 XP
- **Level 2 → Level 3**: 500 XP
- **Level 3 → Level 4**: 1,500 XP
- **Level 4 → Level 5**: 5,000 XP
- **Level 5+**: 10,000 XP (for future expansion)

### Relationship Sources
1. **Shifts**: 180+ XP per shift (with multipliers)
2. **Messages**: 2-10 XP per interaction
3. **Memories**: 15-20 XP when created/published
4. **Pet Acquisition**: Bond bonus for NPC-affiliated pets

## Pet System

### Rarity Tiers
- **3-Star** (Common): ~70% drop rate
- **4-Star** (Rare): ~25% drop rate
- **5-Star** (Ultra Rare): ~5% drop rate

### Pet Bonuses (Coins Only)
- **Efficiency Multiplier**: Based on number of pets assigned
  - 0 pets: 1.0x (no bonus)
  - 1 pet: 1.05x (+5% bonus)
  - 2 pets: 1.1x (+10% bonus)
  - 3 pets: 1.25x (+25% bonus)
- **Star Bonuses** (multiplicative with efficiency):
  - Per 5-star pet: 1.25x (+25% each)
  - Per 4-star pet: 1.1x (+10% each)
- **Affinity Bonus**: Flat coin bonus for matching pets in correct section
  - 0 matching pets: +0 coins
  - 1 matching pet: +100 coins
  - 2 matching pets: +250 coins
  - 3 matching pets: +500 coins
- **Note**: Pet bonuses only apply to coin rewards, not relationship XP
  - Bakery pets: Muffin, Peanut, Chip, Luna, Harmony
  - Playground pets: Buddy, Turbo, Sunny, Blaze
  - Salon pets: Prince, Patches, Whiskers, Storm, Rue, Iris

### Gacha System
- **Pity Timer**: Guaranteed 5-star after 10 pulls (testing mode)
- **Duplicate Rewards** (Coins):
  - 3-Star duplicate: 1,000 coins
  - 4-Star duplicate: 2,500 coins
  - 5-Star duplicate: 5,000 coins

## Shift Rewards Display

### Active Shift Display
Shows real-time accrual:
- Coins: Updates based on 10/sec rate
- NPC XP: Updates based on 1/sec rate (heart icon)

### Example Coin Calculations
Base: 1800 coins (10/sec × 180 seconds)

**Example 1**: 3 matching 3-star pets
- Efficiency: 1.25x (3 pets)
- Star bonus: 1.0x (no bonus for 3-star)
- Multiplier: 1.25 × 1.0 = 1.25x
- Coins: 1800 × 1.25 = 2250
- Affinity bonus: +500 (3 matching)
- **Total: 2750 coins**

**Example 2**: 1 matching 5-star pet
- Efficiency: 1.05x (1 pet)
- Star bonus: 1.25x (5-star)
- Multiplier: 1.05 × 1.25 = 1.3125x
- Coins: 1800 × 1.3125 = 2362
- Affinity bonus: +100 (1 matching)
- **Total: 2462 coins**

**Example 3**: 2 non-matching 4-star pets
- Efficiency: 1.1x (2 pets)
- Star bonus: 1.1 × 1.1 = 1.21x (two 4-stars)
- Multiplier: 1.1 × 1.21 = 1.331x
- Coins: 1800 × 1.331 = 2395
- Affinity bonus: +0 (no matching)
- **Total: 2395 coins**

### Completion Modal Order
1. **Relationship Progress** (shown first)
   - Points earned this shift
   - Progress bar to next level
   - Level up celebration if applicable
2. **Rewards Earned**
   - Coins
   - Bonus rewards (tickets, gems, etc.)
3. **Memory Created** (if applicable)

## Header Currency Display

### Screen-Specific Visibility
- **Cafe**: Coins, Subscribers, Diamonds (right), Notifications
- **Pets/Gacha**: Tickets, Diamonds (right), Notifications
- **Messages**: Diamonds (right), Notifications
- **Blog**: Subscribers, Diamonds (right), Notifications

### Currency Formatting
- Values > 1,000: "1.0K"
- Values > 1,000,000: "1.0M"
- Values > 1,000,000,000: "1.0B"

## Player Progression

### Cafe Level
- Stored in `player.profile.cafeLevel`
- Currently static at Level 12 (no progression system yet)

### Statistics Tracked
- `totalShiftsCompleted`: Used for gacha ticket bonus
- `totalPetsCollected`: Collection progress
- `totalMemoriesCreated`: Blog content
- `totalBlogPosts`: Publishing activity

## Memory System
- **Generation**: Random chance during shifts
- **Bond Points**: 10-20 XP when published
- **Blog Integration**: Increases subscriber count

## Offline Progression
- Accumulates rewards while away
- Caps at 24 hours of progress
- Applies same rates as active play

## Known Issues & Notes

1. **Helper XP**: Deprecated but kept for compatibility
2. **Level Display**: Should show new level on level up, not current
3. **Shift Timer**: Must be in specific cafe section to see completion modal
4. **Bond vs Relationship**: UI uses "Relationship", code uses "bond"

## Testing Values

For testing progression:
- Complete 5 shifts to see gacha ticket bonus
- ~1 shift to reach Level 2 (150 XP)
- ~3 shifts to reach Level 3 (500 XP)
- ~8-9 shifts to reach Level 4 (1,500 XP)
