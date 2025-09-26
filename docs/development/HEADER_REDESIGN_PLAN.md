# Persistent Header Redesign Plan - F2P Mobile Gacha Standards

## Overview
Redesign the persistent header to align with best practices from successful F2P mobile gacha games like AFK Arena, Love & Deepspace, and similar titles. The header should prioritize player identity, progression visibility, and resource management.

## Current vs. Proposed Structure

### Current Header Elements:
- Logo/Brand (left)
- Coins & Subscribers (center)
- Settings & Notifications (right)

### Proposed Header Structure (Single Line):

#### Left Section - Player Identity
- **Player Portrait** (using provided asset)
  - Circular frame with level indicator badge
  - Tap to open player profile (includes settings)
  - Seasonal/event borders for special occasions

#### Center Section - Core Currencies
- **Premium Currency** (Diamonds)
  - With inline "+" button for shop access
  - Most prominent visual treatment
- **Soft Currency** (Coins)
  - No purchase option
  - Shows abbreviated amounts (e.g., "125.3K")

#### Right Section - Secondary Resources & Actions
- **Gacha Currency** (Tickets)
  - Simple count display
- **Blog Subscribers**
  - Social/community metric
- **Notifications** (bell with badge)
  - Red badge for unread count

## Context-Sensitive Header Variations

### 1. Main Cafe Screen
- Show all currencies
- Highlight cafe level progression
- Quick access to all features

### 2. Gacha Screen
- Emphasize gacha tickets/premium currency
- Show pity counter (subtle indicator)
- Hide irrelevant currencies

### 3. Pet Collection
- Show collection progress (X/Y pets)
- Highlight duplicate tokens
- Pet-specific currencies if any

### 4. Messages/DM Screen
- Show bond levels for active NPCs
- Notification badges prominent
- Social metrics visible

### 5. Blog Screen
- Emphasize subscriber count
- Show trending indicator
- Content creation resources

### 6. Shop Screen
- All currencies visible
- Special offers timer
- VIP/Pass status if applicable

## Visual Design Guidelines

### Typography
- **Player Level**: Bold, larger font
- **Currencies**: Medium weight, good contrast
- **Labels**: Small, subdued color

### Colors
- **Premium Currency**: Gold/Yellow gradient
- **Soft Currency**: Silver/Blue
- **Energy**: Green (full) to Red (empty)
- **Notifications**: Red dot with white number

### Animations
- **Currency Changes**: Smooth count-up animation
- **Level Up**: Burst effect with particles
- **Low Resources**: Gentle pulse/glow
- **New Notifications**: Bounce animation

### Responsive Behavior
- **Mobile Portrait**: Compact view, abbreviated numbers
- **Mobile Landscape**: Full view with labels
- **Tablet**: Extended view with additional stats
- **Collapse Pattern**: Hide labels first, then secondary currencies

## Implementation Priorities

### Phase 1 - Core Redesign
1. Add player portrait with level badge overlay
2. Reorganize currency display in single line
3. Implement proper number formatting (K, M, B)
4. Add inline "+" button for diamond purchases only

### Phase 2 - Context Sensitivity
1. Create header variants for each screen type
2. Implement smooth transitions between variants
3. Add relevant quick actions per screen

### Phase 3 - Polish & Feedback
1. Add animations for value changes
2. Implement long-press tooltips
3. Add haptic feedback for interactions
4. Create special event variations

## Technical Considerations

### State Management
```typescript
interface HeaderState {
  variant: HeaderVariant;
  displayCurrencies: CurrencyType[];
  quickActions: ActionButton[];
  notifications: NotificationData;
  playerProgress: ProgressData;
}
```

### Currency Formatting
```typescript
function formatCurrency(value: number): string {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return value.toString();
}
```

### Animation System
- Use CSS transitions for smooth updates
- Implement value interpolation for count-ups
- Add easing functions for natural motion
- Consider reduced motion preferences

## Monetization Touchpoints

### Direct Purchase Prompts
- "+" button on premium currency
- Low currency warnings
- Special offer badges

### Indirect Encouragement
- Show what player is missing
- Highlight premium benefits
- Create currency pressure points

### Best Practices
- Never hide free options
- Always show earning potential
- Make purchases feel valuable
- Respect player choice

## Player Profile Screen (New)
When tapping the player portrait, open a dedicated profile screen that includes:
- Player stats and achievements
- Settings menu (moved from header)
- Account management
- Progress tracking
- Customization options

## Accessibility Requirements
- High contrast mode support
- Screen reader labels
- Touch target sizes (44x44 minimum)
- Clear visual hierarchy
- No color-only indicators

## Success Metrics
- Click-through rate on currency buttons
- Time to locate specific information
- Player satisfaction with layout
- Conversion on low-currency prompts
- Reduced support tickets about "finding things"
