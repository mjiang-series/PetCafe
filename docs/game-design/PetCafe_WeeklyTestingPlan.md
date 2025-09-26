# PetCafe Weekly Testing & Validation Plan

*Generated on September 22, 2025*  
*Updated on September 23, 2025*

---

## 🧪 Automated Validation Suite Available!

**Quick Test:** Copy `/validate.js` into browser console  
**Full Test:** Copy `/tests/complete-validation.js` into browser console  
**Coverage:** Weeks 1-4 fully automated with 25+ test categories

---

## Overview

This document provides specific testing criteria and validation checkpoints for each week of development. Each week includes acceptance criteria, manual testing procedures, and automated tests to ensure deliverables are complete and functional before proceeding.

---

## Week 1: Project Setup & Architecture ✅

### Acceptance Criteria
- [ ] Project runs without errors: `npm install && npm run dev`
- [ ] TypeScript compiles without errors: `npm run type-check`
- [ ] All core interfaces are properly typed
- [ ] Basic navigation between screens works
- [ ] Save/load system persists data across refreshes

### Manual Testing Checklist
1. **Environment Setup**
   ```bash
   npm install
   npm run dev
   # Should start on http://localhost:3000 without errors
   ```

2. **TypeScript Validation**
   ```bash
   npm run type-check
   # Should complete with no errors
   ```

3. **Screen Navigation**
   - Open browser to http://localhost:3000
   - Should see Title Screen with logo
   - Click "Start Game" → Should navigate to Cafe Overview
   - Browser console should have no errors

4. **Save System Test**
   - Open browser DevTools → Application → Local Storage
   - Make any state change
   - Refresh page
   - Check if `petcafe_save` key exists in localStorage

### Automated Tests
```typescript
// tests/week1.test.ts
describe('Week 1: Foundation Tests', () => {
  test('Game initializes without errors', () => {
    const game = new PetCafeGame();
    expect(game).toBeDefined();
  });

  test('All models have required properties', () => {
    // Test Pet, NPC, Player, Memory, Shift interfaces
  });

  test('EventSystem emits and receives events', () => {
    const eventSystem = new EventSystem();
    let received = false;
    eventSystem.on('test', () => { received = true; });
    eventSystem.emit('test');
    expect(received).toBe(true);
  });

  test('SaveSystem can save and load data', () => {
    // Test save/load functionality
  });
});
```

### Validation Output
```
✅ Project Structure Complete
✅ TypeScript Configuration Working
✅ Core Systems Initialized
✅ Basic UI Navigation Functional
✅ Asset Pipeline Configured
```

---

## Week 2: Core Game Loop Implementation & Responsive UI

### Acceptance Criteria
- [x] Can assign pets to café sections
- [x] Shift timers count down in real-time
- [x] Completing shifts generates rewards
- [x] Coins update correctly in UI
- [x] Memory objects are created from shifts
- [x] Unified responsive design implemented
- [x] Mobile navigation (bottom nav) works correctly
- [x] Desktop navigation (action buttons) works correctly
- [x] No container overlap blocking interactions
- [x] Touch events work on mobile devices

### Manual Testing Checklist
1. **Pet Assignment Flow**
   - Navigate to Bakery section
   - Drag pet to slot (or click assign)
   - Pet should appear in slot
   - "Start Shift" button should enable

2. **Shift Timer Test**
   - Start a shift with 3-minute duration
   - Timer should count down visually
   - Can use debug command to speed up: `PetCafe.debugSkipTime(180000)`
   - Shift should auto-complete at 0:00

3. **Reward Calculation**
   - Complete a shift
   - Should receive:
     - Base coins (10-50)
     - Helper XP (5-20)
     - 1 Memory object
   - UI should update immediately

4. **State Persistence**
   - Start a shift
   - Refresh page
   - Shift should continue from correct time

### Debug Commands
```javascript
// Console commands for testing
PetCafe.debugCompleteShift('bakery'); // Instantly complete shift
PetCafe.debugAddCoins(1000); // Add coins
PetCafe.debugSetShiftTime(30); // Set all shifts to 30 seconds
PetCafe.debugAddTestPets(); // Add test pets for development
PetCafe.getGameState(); // Inspect current state
```

### Responsive UI Testing
1. **Mobile Layout Test (<768px)**
   - Open Chrome DevTools → Toggle device mode (Ctrl+Shift+M)
   - Select iPhone X or similar mobile device
   - Verify:
     - Bottom navigation bar is visible
     - Contains 5 items: Café, Pets, Gacha, Blog, Shop
     - FAB button appears in bottom right
     - Sections display in single column
     - Touch events work properly

2. **Desktop Layout Test (≥768px)**
   - Set viewport to desktop size (1024px+)
   - Verify:
     - Bottom navigation is hidden
     - Desktop action buttons visible
     - Sections display in grid (2-3 columns)
     - Hover effects work on cards
     - No mobile-specific elements visible

3. **Unified Screen Test**
   - Check console for: `[ScreenFactory] Creating unified cafe screen`
   - Verify single HTML structure adapts to viewport
   - No duplicate screens or overlapping containers
   - Start Game button works on all viewport sizes

### Automated Tests
```typescript
describe('Week 2: Core Loop Tests', () => {
  test('Pet assignment validation', () => {
    // Test valid/invalid assignments
  });

  test('Shift timer accuracy', () => {
    // Test timer countdown logic
  });

  test('Reward calculation formulas', () => {
    // Test coin/XP calculations
  });

  test('Memory generation from shifts', () => {
    // Test memory object creation
  });
});
```

### Performance Benchmarks
- Shift timer updates: < 16ms per frame (60 FPS)
- State updates: < 50ms
- Memory usage: < 50MB after 10 shifts

---

## Week 3: Data Persistence & UI Framework

### Acceptance Criteria
- [ ] Auto-save triggers after key actions
- [ ] Can navigate between all planned screens
- [ ] Responsive design works on mobile viewport
- [ ] Loading states display during async operations
- [ ] Error states handle gracefully

### Manual Testing Checklist
1. **Auto-Save Verification**
   - Complete these actions and check localStorage updates:
     - Finish shift → Save within 1 second
     - Assign pet → Save within 1 second
     - Navigate screens → Save within 5 seconds

2. **Screen Navigation Matrix**
   ```
   Title → Cafe Overview ✓
   Cafe Overview → Section (Bakery) ✓
   Section → Shift Setup ✓
   Shift Setup → Back to Section ✓
   Any Screen → Settings Overlay ✓
   ```

3. **Responsive Design Test**
   - Chrome DevTools → Device Mode
   - Test on: iPhone 12, iPad, Pixel 5
   - All UI elements should be accessible
   - No horizontal scrolling
   - Touch targets minimum 44x44px

4. **Loading/Error States**
   - Simulate slow network (DevTools → Network → Slow 3G)
   - All async operations show loading spinner
   - Disconnect network → Error messages appear

### Visual Regression Tests
```bash
# Screenshot comparison tests
npm run test:visual

# Should capture and compare:
# - Title screen on mobile/tablet/desktop
# - Cafe overview with different states
# - Section screens with pets assigned
# - Overlay states
```

### Accessibility Audit
- [ ] Lighthouse accessibility score > 90
- [ ] All interactive elements have labels
- [ ] Keyboard navigation works
- [ ] Screen reader announces key actions

---

## Week 4: Gacha & Pet Management

### Acceptance Criteria
- [ ] Can perform 1x and 10x pulls
- [ ] Rarity rates match specification (70/27/3%)
- [ ] Duplicate pets convert to tokens
- [ ] Pet roster displays all owned pets
- [ ] Can filter/sort pet collection

### Manual Testing Checklist
1. **Gacha Pull Rates** (Debug Mode)
   ```javascript
   // Run 1000 pulls and verify distribution
   PetCafe.debugTestGachaRates(1000);
   // Expected: ~700 Common, ~270 Rare, ~30 Ultra Rare
   ```

2. **First-Time Player Experience**
   - New player gets free 10x pull
   - Guaranteed: Muffin, Buddy, Prince
   - At least 1 Rare in remaining 7

3. **Duplicate Handling**
   - Pull duplicate pet
   - Should show "Duplicate!" animation
   - Check tokens increased by correct amount:
     - Common: 1 token
     - Rare: 3 tokens
     - Ultra Rare: 10 tokens

4. **Collection UI Test**
   - View "My Pets" screen
   - All 15 pets show owned/unowned state
   - Can filter by: Rarity, Section, Owned
   - Sort by: Newest, Rarity, Name

### Statistical Validation
```typescript
describe('Week 4: Gacha Tests', () => {
  test('Rarity distribution over 10,000 pulls', () => {
    const results = simulatePulls(10000);
    expect(results.common).toBeCloseTo(7000, -2); // ±100
    expect(results.rare).toBeCloseTo(2700, -2);
    expect(results.ultraRare).toBeCloseTo(300, -1);
  });

  test('Pity system activates correctly', () => {
    // If implemented: test guaranteed UR after X pulls
  });
});
```

---

## Week 5: Blog & Memory System

### Acceptance Criteria
- [ ] Can publish memories from completed shifts
- [ ] Blog feed shows posts chronologically
- [ ] NPC tagging increases correct bond
- [ ] Subscriber count increases with posts
- [ ] Can edit captions before publishing

### Manual Testing Checklist
1. **Memory Publishing Flow**
   - Complete shift → Get memory
   - Preview shows: Image, suggested caption, NPC tag
   - Can edit caption (character limit: 280)
   - Publish → Appears in blog immediately

2. **Bond Point Calculation**
   ```javascript
   // Test bond point formula
   PetCafe.debugPublishMemory('aria', 'rare');
   // Expected: +10 base, +5 for rare, total +15 bond points
   ```

3. **Blog Feed Features**
   - Shows last 20 posts (pagination)
   - Each post displays:
     - Timestamp (relative: "2 hours ago")
     - Pet involved
     - NPC tagged
     - Like count
     - Caption

4. **Subscriber Growth**
   - First post: +5 subscribers
   - Rare memory: +10 subscribers
   - Ultra Rare: +25 subscribers
   - Track growth rate over 10 posts

### Content Validation
- [ ] All 15 pets have unique memory templates
- [ ] Memory quality matches pet rarity
- [ ] No duplicate memories in single session
- [ ] Captions are appropriate/filtered

---

## Week 6: NPC Interactions - DMs

### Acceptance Criteria
- [ ] DMs trigger after publishing memories
- [ ] Each NPC has unique message style
- [ ] Bond milestones unlock new conversations
- [ ] Can respond to DMs (even if simplified)
- [ ] Message history persists

### Manual Testing Checklist
1. **DM Trigger Conditions**
   - Publish memory tagged to Aria
   - Within 5-30 seconds: DM notification
   - Message references the memory content
   - Appropriate to character personality

2. **Character Voice Test**
   - Aria: Warm, caring, uses food metaphors
   - Kai: Energetic, uses exclamations, playful
   - Elias: Thoughtful, artistic references

3. **Bond Progression**
   - Level 1 (0 pts): Basic greetings
   - Level 2 (100 pts): Personal questions
   - Level 3 (250 pts): Deeper feelings
   - Test each threshold triggers new content

4. **Response System**
   - Player gets 3 response options
   - Or free text (if implemented)
   - NPC acknowledges response appropriately

### Conversation Quality Tests
```typescript
describe('Week 6: DM Tests', () => {
  test('NPC messages match personality', () => {
    // Sentiment analysis on generated messages
  });

  test('No repeated messages in session', () => {
    // Track last 10 messages per NPC
  });

  test('Bond gates work correctly', () => {
    // Verify content unlocks at right levels
  });
});
```

---

## Week 7: Voice Calls & Advanced Romance

### Acceptance Criteria
- [ ] Call notifications appear at milestones
- [ ] Accept/decline calls works
- [ ] Voice snippets play (or TTS works)
- [ ] Call UI shows character expression
- [ ] Relationship status updates

### Manual Testing Checklist
1. **Call Trigger Test**
   - Reach bond level 2 with any NPC
   - Should get call notification within 1 minute
   - Can accept immediately or decline
   - Declined calls can be returned later

2. **Call Experience**
   - Accept call → Full screen UI
   - Character portrait with expressions
   - Voice plays (20-30 seconds)
   - Subtitles sync with audio
   - Can end call early

3. **TTS Integration** (if implemented)
   - Generated voice matches character
   - Aria: Soft, melodic
   - Kai: Upbeat, energetic  
   - Elias: Calm, contemplative
   - Fallback to text if TTS fails

4. **Romance Progression**
   - Track relationship status:
     - Acquaintance (0-99)
     - Friend (100-249)
     - Close (250-499)
     - Romantic Interest (500-999)
     - Partner (1000+)

### Performance Tests
- Call notification: < 100ms to appear
- Voice loading: < 2 seconds
- No audio stuttering/delays
- Smooth expression transitions

---

## Week 8: Asset Integration & Visual Polish

### Acceptance Criteria
- [ ] All placeholder art replaced
- [ ] Pet animations play smoothly
- [ ] UI animations enhance experience
- [ ] Sound effects trigger correctly
- [ ] Visual cohesion across screens

### Manual Testing Checklist
1. **Asset Replacement Audit**
   ```
   ✓ 15 pet sprites (idle + interaction)
   ✓ 3 NPC portraits (4 expressions each)
   ✓ 3 section backgrounds
   ✓ UI elements (buttons, cards, icons)
   ✓ Logo and branding elements
   ```

2. **Animation Performance**
   - Pet animations: 30-60 FPS
   - No janky transitions
   - Smooth drag-and-drop
   - Loading animations < 3 seconds

3. **Audio Integration**
   - Every button has click sound
   - Shift complete fanfare
   - Gacha reveal stingers (by rarity)
   - Background music loops seamlessly
   - Volume controls work

4. **Polish Details**
   - Micro-interactions on hover/tap
   - Parallax scrolling in blog
   - Particle effects for rare pulls
   - Screen transitions smooth

### Device Testing Matrix
| Device | OS | Performance | Issues |
|--------|----|----|--------|
| iPhone 12 | iOS 15 | 60 FPS | None |
| Pixel 5 | Android 12 | 60 FPS | None |
| iPad Air | iOS 14 | 60 FPS | None |
| Galaxy S10 | Android 11 | 45-60 FPS | Minor stutters |

---

## Week 9: AI Integration & Advanced Features

### Acceptance Criteria
- [ ] AI DMs feel natural and contextual
- [ ] Blog captions are relevant
- [ ] Fallback system works if AI fails
- [ ] Content moderation active
- [ ] Tutorial guides new players

### Manual Testing Checklist
1. **AI Response Quality**
   - Send 10 different DMs
   - Responses should:
     - Match NPC personality
     - Reference game context
     - Feel conversational
     - Avoid repetition

2. **Fallback Testing**
   - Disable network
   - AI features use local fallbacks
   - No error messages to player
   - Experience still enjoyable

3. **Content Safety**
   - Try inappropriate inputs
   - System should filter/redirect
   - Maintain romantic but wholesome tone
   - Log violations for review

4. **Tutorial Completion**
   - Fresh player completes tutorial
   - All features introduced clearly
   - No steps can be skipped accidentally
   - Takes 5-10 minutes maximum

### AI Performance Metrics
- Response time: < 2 seconds (p95)
- Fallback rate: < 5%
- Personality consistency: > 90%
- Player satisfaction: > 4.0/5.0

---

## Week 10: Testing, Bug Fixes & Launch Prep

### Acceptance Criteria
- [ ] All critical bugs fixed
- [ ] Performance meets targets
- [ ] Full playthrough works
- [ ] Build size < 100MB
- [ ] Launch checklist complete

### Final Testing Protocol

1. **Full Playthrough Test** (2 hours)
   - New player experience
   - Complete tutorial
   - Pull all 15 pets
   - Reach bond level 3 with each NPC
   - Publish 20+ blog posts
   - No crashes or blockers

2. **Performance Validation**
   ```
   Target Metrics:
   - Load time: < 3 seconds
   - FPS: > 30 (low-end), > 60 (mid-tier)
   - Memory: < 200MB usage
   - Battery: < 10% drain per hour
   ```

3. **Cross-Platform Testing**
   - iOS Safari (12+)
   - Android Chrome (90+)
   - Desktop Chrome/Firefox/Edge
   - Different screen sizes
   - Network conditions (3G/4G/WiFi)

4. **Build Optimization**
   - Minification working
   - Assets compressed
   - Code splitting active
   - Service worker caching
   - No console.logs in production

### Launch Readiness Checklist
- [ ] Analytics integrated
- [ ] Error tracking active
- [ ] Terms of Service ready
- [ ] Privacy Policy compliant
- [ ] App store assets prepared
- [ ] Social media kit ready
- [ ] Press release drafted
- [ ] Support email active
- [ ] FAQ documented
- [ ] Day 1 patch plan ready

### Rollback Plan
```javascript
// Emergency rollback procedure
if (criticalBugFound) {
  1. Revert to previous stable build
  2. Notify players via in-game message
  3. Fix issue in hotfix branch
  4. Test thoroughly
  5. Deploy fix within 24 hours
}
```

---

## Week 8 Validation Updates
- Verify pet affinity stats update on pet acquisition
- Confirm conversation topics remain locked until milestone met
- Validate `scene:play` displays ScenePlayer overlay and awards bond points
- Confirm scene stylesheet loads and ScenePlayer responds on `/scene:play/`
- Confirm voice-call overlay renders when `voice-call:start` emitted
- Ensure call overlay hides on `voice-call:end`

## Continuous Testing Guidelines

### Daily Smoke Tests (5 minutes)
1. Game loads without errors
2. Can complete one shift
3. Can pull one pet
4. Can send one DM

### Weekly Regression Tests (30 minutes)
1. All features from previous weeks still work
2. No performance degradation
3. Save/load integrity maintained
4. New bugs haven't appeared

### Test Data Management
```javascript
// Reset test environment
PetCafe.debugResetGame();
PetCafe.debugUnlockAll(); // Unlock all content
PetCafe.debugSetBondLevel('aria', 5); // Set specific states
PetCafe.debugTimeTravel(7); // Simulate 7 days passing
```

---

## Success Metrics

### Technical Metrics
- Zero critical bugs
- < 5 minor bugs
- 95% test coverage
- Performance targets met

### Player Experience Metrics  
- Tutorial completion: > 90%
- Day 1 retention: > 60%
- Session length: > 10 minutes
- No rage quits in first hour

### Quality Gates
Each week must pass before proceeding:
- ✅ All acceptance criteria met
- ✅ No blocking bugs
- ✅ Performance acceptable
- ✅ Team sign-off received

---

This testing plan ensures each week's work is properly validated before moving forward, reducing risk and maintaining quality throughout development.

