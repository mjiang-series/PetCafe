# Mobile-First UI Redesign Plan

## 🎯 Current State Analysis

### What's Working:
- Viewport meta tag properly configured
- Some responsive breakpoints at 767px
- Dynamic viewport height (100dvh) for mobile

### What Needs Improvement:
- Desktop-first approach (styles default to desktop, then adapt to mobile)
- Limited mobile-specific optimizations
- Touch targets may be too small
- Grid layouts not optimized for vertical scrolling

## 📱 Mobile-First Design Principles

### 1. **Base Styles = Mobile Styles**
- Design for 320-375px width first
- Expand layouts for larger screens
- Vertical stacking by default

### 2. **Touch-Friendly Interactions**
- Minimum 44x44px touch targets
- Adequate spacing between interactive elements
- Swipe gestures for navigation

### 3. **Performance First**
- Minimize reflows during interactions
- Optimize animations for 60fps
- Lazy load non-critical content

## 🎨 Proposed UI Changes

### Global Layout
```css
/* Mobile-first base styles */
.screen {
  padding: 1rem;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
}

/* Tablet and up */
@media (min-width: 768px) {
  .screen {
    padding: 2rem;
  }
}

/* Desktop */
@media (min-width: 1024px) {
  .screen {
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

### Navigation Pattern
- **Mobile**: Fixed bottom tab bar for main actions
- **Tablet+**: Side navigation or top bar

### Café Overview Screen
- **Mobile**: Single column, vertical scroll
- **Sections**: Full-width cards with larger touch areas
- **Actions**: Floating action button (FAB) or bottom sheet

### Section Screen (Shift Management)
- **Mobile**: 
  - Pet selection in bottom drawer
  - Shift status takes full width
  - Swipe between sections
- **Tablet+**: 
  - Side-by-side layout
  - Drag-and-drop enhanced

### Key Mobile Optimizations

1. **Bottom Navigation Bar**
```html
<nav class="mobile-nav">
  <button class="nav-item active">
    <span class="icon-emoji">🏠</span>
    <span>Café</span>
  </button>
  <button class="nav-item">
    <span class="icon-emoji">🐾</span>
    <span>Pets</span>
  </button>
  <button class="nav-item featured">
    <span class="icon-emoji">🎰</span>
    <span>Gacha</span>
  </button>
  <button class="nav-item">
    <span class="icon-emoji">📝</span>
    <span>Blog</span>
  </button>
  <button class="nav-item">
    <span class="icon-emoji">🛍️</span>
    <span>Shop</span>
  </button>
</nav>
```

2. **Touch-Optimized Buttons**
```css
.btn {
  min-height: 48px;
  min-width: 48px;
  padding: 12px 24px;
  font-size: 16px; /* Prevents zoom on iOS */
}
```

3. **Swipeable Sections**
- Use touch events for section navigation
- Visual indicators for swipe areas
- Smooth transitions between screens

4. **Progressive Disclosure**
- Show essential info first
- Expandable cards for details
- Modal overlays for complex actions

## 🚀 Implementation Priority

### Phase 1: Core Mobile Layout
1. Refactor CSS to mobile-first
2. Implement bottom navigation
3. Optimize touch targets

### Phase 2: Interaction Improvements
1. Add swipe gestures
2. Implement bottom sheets
3. Enhance pet selection UI

### Phase 3: Performance
1. Optimize animations
2. Implement lazy loading
3. Add offline support

## 📊 Breakpoint Strategy

```css
/* Mobile First Breakpoints */
/* Base: 320px - 767px (Mobile) */
/* Small Tablet: 768px - 1023px */
/* Desktop: 1024px+ */

/* Example Usage */
.container {
  /* Mobile styles (default) */
  width: 100%;
  padding: 1rem;
  
  @media (min-width: 768px) {
    /* Tablet styles */
    padding: 2rem;
  }
  
  @media (min-width: 1024px) {
    /* Desktop styles */
    max-width: 1200px;
    margin: 0 auto;
  }
}
```

## 🎮 Game-Specific Considerations

1. **Portrait Mode Lock**: Consider locking to portrait on mobile
2. **Virtual Keyboard**: Account for keyboard in forms/chat
3. **Safe Areas**: Handle notches and home indicators
4. **Haptic Feedback**: Add tactile responses for actions
5. **Gesture Conflicts**: Avoid conflicts with system gestures
