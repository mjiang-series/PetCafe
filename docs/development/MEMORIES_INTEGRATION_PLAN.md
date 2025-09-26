# Memories Integration Plan - Journal System

## Current State Analysis

### What Currently Exists
1. **Memory Generation**
   - Memories are generated at 100% rate after every shift completion
   - Each memory has: content, mood, location, tagged NPCs, pet IDs
   - Memory templates exist for each cafe section (bakery, playground, salon)
   - Memories are stored but not immediately visible to players

2. **Memory Publishing**
   - Players can publish memories as blog posts
   - Publishing flow: Memory Selection Screen → Add Caption → Publish
   - Published memories generate engagement (likes, views, subscribers)
   - NPC reactions are generated for published posts

3. **Memory Display**
   - Memory Selection Screen shows unpublished memories as cards with camera icon
   - Blog Screen shows published memories as social media posts
   - No dedicated memory viewing experience

### Current Issues
1. **Discovery Problem**: Players don't know memories are being created
2. **No Immediate Gratification**: Memories are hidden until blog publishing
3. **Lack of Visual Appeal**: Using placeholder camera icons instead of actual images
4. **Disconnected from Core Loop**: Memories feel like a separate system
5. **No Memory Management**: Can't view, browse, or delete memories

## Revised Integration Plan - Journal Collection System

### Navigation Restructure

#### Blog Relocation
- **Move Blog from bottom nav to Cafe screen**
- **Create "Cafe Blog" section card** matching the style of cafe areas (Bakery, Playground, Salon)
- **Blog becomes a 4th cafe section** with its own status badge and engagement metrics
- **Access**: Click "Cafe Blog" card from main Cafe screen

#### Journal as Primary Collection
- **Replace Blog in bottom nav with "Journal" icon**
- **Journal becomes the memory collection hub** (like Pets for pet collection)
- **Icon suggestion**: Book/notebook icon from Material Icons

### Phase 1: Navigation Restructure (Week 1)

#### 2.1 Shift Completion Memory Preview
- **When**: Show memory preview in shift rewards modal (when generated)
- **What**: Small card showing memory was captured
- **Visual**: Thumbnail image, mood, "New Memory!" badge
- **Action**: "View in Journal" button opens journal to that memory

#### 3.1 Cafe Blog Section
- **Location**: 4th card on main Cafe screen
- **Visual Design**: Matches other cafe section cards
- **Status Badge Options**:
  - "Ready to Post" - has unpublished memories
  - "Posted Today" - already published today
  - "X New Reactions" - engagement on recent posts
- **Section Content**:
  - Blog feed (existing BlogScreen content)
  - "Create Post" button (opens memory selection)
  - Engagement metrics dashboard

#### 3.2 Publishing Flow Update
- **From Journal**: "Share to Blog" action in memory detail
- **From Blog**: "Select Memory" opens filtered journal view
- **Multi-select**: Can combine multiple memories into one post
- **Caption Editor**: Enhanced with templates and suggestions

### Phase 2: Journal Interface (Week 2)

#### 1.1 Journal Main Screen
- **Calendar View Header**:
  - Monthly calendar widget showing dots on days with memories
  - Tap any date to jump to that day's memories
  - Current month displayed by default
  - Swipe left/right to navigate months

- **Infinite Scroll Timeline**:
  - Memories grouped by day with date headers
  - Each memory shows as a card with:
    - Memory image (using `memories_image_placeholder.png`)
    - Time stamp
    - Mood indicator
    - NPC portrait (small)
    - Pet portraits (if any)
    - Memory snippet (first 2 lines)
  - Tap memory to view full detail
  - Pull-to-refresh for newest memories

#### 1.2 Filter System
- **Filter Bar** (below calendar, above timeline):
  - Cafe Section: All, Bakery, Playground, Salon
  - NPC: All, Aria, Kai, Elias
  - Pets: All, then specific pets owned
  - Mood: All, Happy, Excited, Peaceful, etc.
- **Active filters shown as chips** that can be removed
- **Filter persistence** remembered between sessions

#### 1.3 Memory Detail View
- **Full-screen memory viewer**
- **Header**: Date, time, location
- **Main content**:
  - Large image (placeholder for now)
  - Full memory text
  - Mood badge
  - NPC involved (with portrait)
  - Pets involved (with portraits)
- **Actions**:
  - Share to Cafe Blog
  - Delete memory
  - Favorite (for quick access)
- **Navigation**: Swipe left/right between memories in current filter

### Phase 3: Collection System (Week 3)

#### 4.1 Journal Statistics
- **Header Stats** (like Pet Collection):
  - Total Memories: X/∞
  - Days Recorded: X
  - Rarest Mood: [mood]
  - Favorite NPC: [most memories with]

#### 4.2 Memory Achievements
- **Collection Goals**:
  - "First Week" - 7 consecutive days with memories
  - "Mood Master" - Collect all mood types
  - "Storyteller" - 50 total memories
  - "Bond Chronicles" - 10+ memories with each NPC

### Phase 4: Future Enhancements (Week 4+)

#### 2.2 Memory Generation Tuning
- **Reduce frequency**: 30% base chance (not 100%)
- **Increase chances with**:
  - Special pet combinations (+20%)
  - High efficiency shifts (+15%)
  - First shift with new pet (+50%)
  - Milestone moments (guaranteed)

#### 2.3 Journal Entry Notifications
- **In-game notification**: "New journal entry!" when memory created
- **Journal icon badge**: Red dot indicator for unviewed memories
- **Calendar update**: New dot appears on today's date

#### 4.3 Memory Quality System
- **Common Memories** (70%): Regular shift moments
- **Rare Memories** (25%): Special interactions
- **Epic Memories** (5%): Perfect shifts, milestones
- **Visual**: Border glow/style in journal

### Phase 5: Advanced Features (Month 2+)

#### 5.1 Journal Customization
- **Themes**: Unlock different journal styles
- **Covers**: Customize journal appearance
- **Bookmarks**: Mark favorite memories
- **Tags**: Custom tags for organization

#### 5.2 Memory Search
- **Text search**: Find memories by content
- **Date picker**: Jump to specific date
- **Advanced filters**: Combine multiple criteria
- **Saved searches**: Quick access to common filters

#### 5.3 Export & Sharing
- **Monthly summaries**: Auto-generated recap
- **Memory books**: Create themed collections
- **Social sharing**: Export memories as images
- **Backup**: Export journal data

## Implementation Priority

### Phase 1 - Navigation Restructure (Immediate)
1. ✅ Add memory preview to shift rewards modal (2.1)
2. ✅ Move Blog from bottom nav to Cafe screen as 4th section (3.1)
3. ✅ Update Blog section with status badges and metrics
4. ✅ Update publishing flow from Blog section (3.2)

### Phase 2 - Journal Interface (Week 1)
1. ✅ Add Journal to bottom nav (replacing Blog)
2. ✅ Create JournalScreen with calendar and timeline (1.1)
3. ✅ Implement filter system (1.2)
4. ✅ Create memory detail view (1.3)
5. ✅ Use `memories_image_placeholder.png` consistently

### Phase 3 - Collection System (Week 2)
1. ✅ Add journal statistics header (4.1)
2. ✅ Implement memory achievements (4.2)
3. ✅ Connect journal to blog for sharing

### Phase 4 - Future Enhancements (Week 3+)
1. Reduce memory generation rate
2. Add memory quality/rarity
3. Implement notifications and badges
4. Memory-based NPC conversations

### Phase 5 - Advanced Features (Month 2+)
1. Journal customization
2. Advanced search and filters
3. Export and sharing features
4. Memory collections and albums

## Success Metrics
- **Discovery Rate**: % of players who open journal after seeing shift notification
- **Collection Rate**: Average memories per player, days with entries
- **Engagement Rate**: % of memories shared to blog
- **Retention Impact**: Daily active users with 10+ journal entries

## Technical Requirements

### New Screens
1. **JournalScreen**: Main collection screen with calendar and timeline
2. **MemoryDetailScreen**: Full-screen memory viewer
3. **BlogSectionScreen**: Cafe blog as a cafe section

### UI Components
1. **CalendarWidget**: Month view with memory indicators
2. **MemoryCard**: Consistent card design for timeline
3. **FilterBar**: Horizontal scrolling filter chips
4. **MemoryViewer**: Full-screen swipeable viewer

### Data Updates
1. **Memory Interface**:
   - Add `viewed` boolean flag
   - Add `rarity` field (common/rare/epic)
   - Add `favorited` boolean flag
2. **GameState**:
   - Track unviewed memory count
   - Store filter preferences
   - Calendar data structure for quick date lookups

### Event Hooks
- `memory:created` - When new memory generated
- `memory:viewed` - First time viewing memory
- `memory:shared` - Published to blog
- `memory:milestone` - Collection achievements
- `journal:opened` - Track engagement

### Mobile-First Design Principles
1. **Infinite Scroll**: Smooth scrolling with dynamic loading
2. **Touch Gestures**: Swipe between months, memories
3. **Pull-to-Refresh**: Update with latest memories
4. **Sticky Headers**: Date headers stick during scroll
5. **Responsive Layout**: Adapts to screen size

## Risk Mitigation
- **Performance**: Virtual scrolling for large collections
- **Storage**: Implement pagination, load on demand
- **Discovery**: Clear visual indicators for new content
- **Complexity**: Progressive disclosure of features

This revised plan positions memories as a collectible journal system that complements the pet collection, creating a personal narrative of the player's cafe journey while maintaining clean separation between private memories (journal) and public sharing (blog).
