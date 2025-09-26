# Persistent Header Visual Mockup

## Layout Structure (Mobile First)

```
┌────────────────────────────────────────────────────────────┐
│ [Portrait] Lv.12  💎 2,450 [+]  🪙 125.3K  🎫 x5  📊 48.2K [🔔3] │
└────────────────────────────────────────────────────────────┘
```

## Detailed Breakdown

### Left Section (Player Identity)
```
┌───────────┐
│ [Portrait]│ Lv.12
│   Lv.12   │
└───────────┘
```
- Player portrait with decorative frame
- Level badge overlapping bottom-right
- Tap to open player profile (includes settings)

### Center Section (Primary Currencies)
```
┌───────────────────────────┐
│ 💎 2,450 [+]  🪙 125.3K   │
└───────────────────────────┘
```
- Premium currency (Diamonds) with inline "+" button
- Soft currency (Coins) - no purchase option
- Animated count changes

### Right Section (Secondary Resources)
```
┌─────────────────────┐
│ 🎫 x5  📊 48.2K [🔔3]│
└─────────────────────┘
```
- Gacha tickets with count
- Blog subscribers (social metric)
- Notification bell with badge

## Screen-Specific Variations

### Gacha Screen Header
```
┌────────────────────────────────────────────────────────────┐
│ [Portrait] Lv.12  💎 2,450 [+]  🎫 x5  Pity: 72/90  [🔔3] │
└────────────────────────────────────────────────────────────┘
```
- Shows pity counter
- Emphasizes gacha-relevant currencies
- Hides blog subscribers

### Messages Screen Header
```
┌────────────────────────────────────────────────────────────┐
│ [Portrait] Lv.12  Aria♥♥♥ Kai♥♥ Elias♥  📊 48.2K  [🔔12] │
└────────────────────────────────────────────────────────────┘
```
- Shows bond summary
- Emphasizes notifications
- Social focus

### Pet Collection Header
```
┌────────────────────────────────────────────────────────────┐
│ [Portrait] Lv.12  Collection: 42/60  🏆 15%  🪙 125.3K [🔔3]│
└────────────────────────────────────────────────────────────┘
```
- Collection progress
- Completion percentage
- Shows coins for potential purchases

## Visual Styling

### Colors
- **Background**: Semi-transparent dark overlay (#000000CC)
- **Player Level**: Bright gold (#FFD700)
- **Premium Currency**: Gradient gold (#FFD700 → #FFA500)
- **Soft Currency**: Silver blue (#C0C0C0 → #87CEEB)
- **Gacha Tickets**: Purple accent (#9370DB)
- **Subscribers**: Warm pink (#FFB6C1)
- **"+" Button**: Bright green (#32CD32) with subtle glow

### Typography
- **Level Number**: Bold, 18px
- **Currency Values**: Medium, 16px
- **Labels**: Light, 12px
- **Notification Badge**: Bold, 10px

### Effects
- **Portrait Frame**: Animated shimmer effect
- **Low Currency**: Gentle red pulse
- **Currency Gain**: Green +value float up
- **Currency Spend**: Red -value float down
- **Level Up**: Golden burst particles

## Responsive Breakpoints

### Mobile Portrait (< 375px)
- Compact view, no labels
- Abbreviated numbers (2.4K not 2,450)
- Smaller touch targets (40x40)

### Mobile Landscape (375px - 768px)
- Full number display
- Standard touch targets (44x44)
- Some labels visible

### Tablet (> 768px)
- All labels visible
- Extended stats (play time, etc.)
- Larger portrait (64x64)
- Additional quick actions

## Implementation Notes
- Use CSS Grid for flexible layout
- Implement smooth transitions (0.3s ease)
- Add haptic feedback on iOS
- Support theme variations (dark/light)
- Ensure WCAG AA compliance
