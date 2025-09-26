# Unified Memories and Cafe Moments Plan

## Overview

This plan unifies the Memory Journal system and Cafe Moments (formerly Blog) into a cohesive experience that enhances NPC relationships and creates meaningful player narratives.

## Core Concept

### Memory Journal (Private Collection)
- **Purpose**: Personal collection of cafe memories
- **Access**: Bottom navigation "Journal" icon
- **Function**: Browse, filter, and relive special moments
- **Feel**: Like a personal diary/scrapbook

### Cafe Moments (Public Sharing)
- **Purpose**: Share special moments with the community
- **Access**: 4th section card on main Cafe screen
- **Function**: Curated public-facing moments that build cafe reputation
- **Feel**: Like a cafe's social media presence

## Current State Analysis

### What Currently Exists
1. **Memory Generation**
   - Memories generated at 100% rate after shifts
   - Each memory has: content, mood, location, tagged NPCs, pet IDs
   - Templates exist for each cafe section
   - Memories stored but not immediately visible

2. **Publishing System**
   - Memory Selection Screen → Caption → Publish flow
   - Published memories generate engagement metrics
   - NPC reactions for published posts
   - Disconnected from core gameplay loop

### Key Issues
1. **Discovery Problem**: Players don't know memories are being created
2. **No Immediate Gratification**: Memories hidden until blog publishing
3. **Lack of Visual Appeal**: Camera icons instead of actual images
4. **Disconnected Systems**: Memories and Blog feel separate
5. **Generic Feel**: Doesn't integrate with cafe/NPC theme
6. **No Collection Management**: Can't browse or organize memories

## Implementation Phases

### Phase 1: Navigation & Core Structure ✅ (Completed)

#### 1.1 Navigation Restructure
- ✅ **Move Blog to Cafe**: Create "Cafe Blog" as 4th section card
- ✅ **Add Journal to Bottom Nav**: Replace Blog position
- ✅ **Update Blog Header**: Add back navigation to Cafe
- ✅ **Status Badges**: Dynamic states for Cafe Blog section

#### 1.2 Memory Preview Integration
- ✅ **Shift Rewards Modal**: Show memory preview when generated
- ✅ **Visual Preview**: Use `memories_image_placeholder.png`
- ✅ **Quick Action**: "View in Journal" button
- ✅ **Mood Badge**: Display memory mood on preview

### Phase 2: Journal Collection System (Current Priority)

#### 2.1 Journal Main Screen
```
[Journal Header]
Total Memories: X | Days Recorded: X | Favorite NPC: [Name]

[Calendar Widget]
- Monthly view with dots on days with memories
- Tap date to jump to that day
- Swipe to navigate months

[Filter Bar]
All | Bakery | Playground | Salon | [NPC filters] | [Mood filters]

[Memory Timeline - Infinite Scroll]
[Date Header: Today]
  [Memory Card 1] - Image, mood, NPC, time, snippet
  [Memory Card 2] - Image, mood, NPC, time, snippet
[Date Header: Yesterday]
  [Memory Card 3] - Image, mood, NPC, time, snippet
```

**Key Features:**
- Infinite scroll with date grouping
- Pull-to-refresh for new memories
- Unviewed memory indicators
- Quick filter system
- Memory count badges

#### 2.2 Memory Detail View
- Full-screen memory viewer
- Large placeholder image
- Complete memory text
- NPC and pet portraits
- Actions: Share to Cafe Moments, Favorite, Delete
- Swipe navigation between memories

#### 2.3 Filter System
- **Cafe Section**: All, Bakery, Playground, Salon
- **NPC**: All, Aria, Kai, Elias
- **Pets**: All, then specific owned pets
- **Mood**: All moods + specific selections
- **Special**: Unviewed, Shared, Favorites

### Phase 3: Cafe Moments Enhancement

#### 3.1 Rebrand as "Cafe Moments"
- Update all UI text from "Blog" to "Cafe Moments"
- New framing: Sharing special cafe moments with community
- NPCs as co-authors suggesting what to share

#### 3.2 Simplified Sharing Flow

**From Journal:**
1. Memory has "Share Moment" button
2. Opens quick publish modal:
   - NPC caption suggestions
   - Mood-based templates
   - One-click share

**From Cafe Moments:**
1. "Share a Moment" shows memory grid
2. Select → Caption → Share
3. No separate selection screen

#### 3.3 NPC Integration
- **Suggestions**: NPCs recommend memories to share
- **Co-authoring**: Personality-based caption templates
- **Special Reactions**: +20 relationship points for featuring NPC
- **Daily Prompts**: "Kai wants to see energetic moments!"

### Phase 4: Enhanced Engagement

#### 4.1 Meaningful Rewards
- **Relationship Boosts**: +20 points with featured NPCs
- **Follower Milestones**: Unlock decorations, special scenes
- **Viral Moments**: Rare chance for huge follower boost
- **NPC Gifts**: Thank-you messages in DMs

#### 4.2 Visual Updates
```
[Cafe Moments Layout]
[Featured Moment Banner - Latest popular moment]

[Quick Stats]
Followers: X | This Week: X moments | Trending: [Mood]

[NPC Suggestion]
"Aria thinks this would brighten someone's day!" [Preview]

[Recent Moments Feed]
- Polaroid-style cards with memory images
- NPC reaction badges
- Simplified engagement (❤️ and 👁️)
```

#### 4.3 Collection Goals
- **Memory Achievements**:
  - "First Week" - 7 consecutive days
  - "Mood Master" - All mood types
  - "Storyteller" - 50 memories
  - "Bond Chronicles" - 10+ per NPC
- **Sharing Achievements**:
  - "Influencer" - 1000 followers
  - "Viral Moment" - 100+ likes
  - "Daily Poster" - 7 days straight

### Phase 5: Future Enhancements

#### 5.1 Memory Generation Tuning
- Reduce to 30% base chance
- Bonuses for special moments:
  - New pet: +50%
  - Perfect shift: +25%
  - Milestone: Guaranteed

#### 5.2 Memory Quality System
- **Common** (70%): Regular moments
- **Rare** (25%): Special interactions
- **Epic** (5%): Perfect shifts, milestones
- Visual indicators in journal

#### 5.3 Advanced Features
- Memory search and tags
- Themed collections
- Monthly summaries
- Export options
- Journal themes/customization

## Technical Implementation

### New Screens
1. **JournalScreen** - Main collection interface
2. **MemoryDetailScreen** - Full viewer
3. **QuickShareModal** - Streamlined publishing

### UI Components
1. **CalendarWidget** - Month view navigation
2. **MemoryCard** - Consistent card design
3. **FilterBar** - Horizontal chip filters
4. **MemoryGrid** - For selection views

### Data Updates
```typescript
interface Memory {
  // Existing fields...
  viewed: boolean;
  shared: boolean;
  favorited: boolean;
  rarity?: 'common' | 'rare' | 'epic';
}

interface GameState {
  // Add tracking for:
  unviewedMemoryCount: number;
  journalFilterPreferences: FilterState;
  memoryCalendarData: Map<string, number>; // date -> count
}
```

### Event System
- `memory:created` - New memory generated
- `memory:viewed` - First time viewing
- `memory:shared` - Published to Cafe Moments
- `journal:opened` - Track engagement
- `moments:viral` - Special engagement threshold

### Mobile-First Design
1. **Infinite Scroll** with virtual rendering
2. **Touch Gestures** for navigation
3. **Pull-to-Refresh** for updates
4. **Sticky Headers** for dates
5. **Responsive Layouts** for all screens

## Success Metrics

### Journal Engagement
- Discovery Rate: % opening journal after shift
- Collection Rate: Average memories per player
- Retention: DAU with 10+ memories

### Cafe Moments Engagement
- Publishing Rate: % of memories shared
- NPC Engagement: Reactions per post
- Quality: Average likes per moment
- Virality: % achieving viral status

## Integration Points

### With Shifts
- Memory preview in rewards
- Special memories for milestones
- NPC-specific memory templates

### With Messages
- NPCs thank for featuring
- Discuss shared moments
- Unlock conversation topics

### With Progression
- Follower count as currency
- Unlock decorations/features
- Achievement rewards

## Risk Mitigation
- **Performance**: Implement virtual scrolling
- **Storage**: Pagination for large collections
- **Discovery**: Clear UI indicators and tutorials
- **Complexity**: Progressive feature disclosure

## Next Steps

### Immediate (Phase 2 Priority)
1. Create JournalScreen with calendar widget
2. Implement memory timeline with infinite scroll
3. Build filter system
4. Create memory detail viewer
5. Add unviewed badges to Journal icon

### Following Week
1. Rebrand Blog to Cafe Moments
2. Implement NPC suggestions
3. Create quick share modal
4. Update visual design
5. Add relationship rewards

### Long Term
1. Tune memory generation rates
2. Add rarity system
3. Implement achievements
4. Advanced search/organization
5. Customization options

This unified plan creates a cohesive memory system where private journaling and public sharing complement each other, with NPC relationships at the center of both experiences.
