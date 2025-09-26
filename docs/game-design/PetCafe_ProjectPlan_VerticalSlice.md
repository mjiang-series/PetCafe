# PetCafe Vertical Slice - Project Plan

*Generated on September 22, 2025*  
*Last Updated: September 26, 2025*

**Current Status:** Week 7 Core Systems ✅ | Week 8 Narrative Sprint 🎯

---

## Executive Summary

This project plan outlines the development of a vertical slice for **Love & Pets Café** (formerly PetCafe), a romance dating sim × idle pet café hybrid game. The vertical slice demonstrates the core gameplay loop: collecting pets through gacha, running café shifts, publishing memories to a blog, and deepening relationships with three NPCs (Aria, Kai, Elias) through DMs and voice calls.

**Target Platform:** HTML5 Web (mobile-first, desktop compatible)  
**Development Timeline:** 8-10 weeks  
**Team Size:** 2-4 developers + 1-2 artists  
**Scope:** Playable prototype demonstrating all core mechanics with 3 NPCs, 15 pets, and complete player journey

---

## 1. Vertical Slice Scope Definition

### Core Features (MUST HAVE)
- **Pet Collection System**: 15-pet starter roster with gacha mechanics
- **Café Management**: 3 sections (Cat Lounge, Puppy Patio, Bird Bistro) with shift system
- **Memory & Blog System**: Publish café moments, tag NPCs, gain subscribers
- **Romance Progression**: DM conversations and voice calls with 3 NPCs *(DM foundation ✅ | voice UI TBD)*
- **Economy System**: Coins, premium currency, consumables, duplicate tokens
- **Save/Load System**: Local storage with cloud sync preparation

### NPCs & Content
- **Aria (Cat Lounge)**: Warm, nurturing personality with cat-themed memories
- **Kai (Puppy Patio)**: Energetic, playful personality with dog-themed memories  
- **Elias (Bird Bistro)**: Artistic, thoughtful personality with bird-themed memories
- **15 Starter Pets**: 5 per NPC, distributed across Common/Rare/Ultra Rare tiers

### Player Journey Coverage
- **Session 1**: Tutorial, first gacha pull, basic shift mechanics, first blog post
- **Session 2**: Multi-section management, first NPC call, progression unlocks *(voice call UI upcoming)*
- **Session 3**: Advanced features, event banner tease, deeper romance interactions *(story scenes planned Weeks 8-9)*

---

## 2. Development Phases

### Phase 1: Foundation & Core Systems (Weeks 1-3) ✅

#### Week 1: Project Setup & Architecture ✅
**Completed Deliverables:**
- ✅ Project repository with folder structure
- ✅ TypeScript + Vite setup (no heavy game engine needed)
- ✅ Basic TypeScript interfaces for core entities
- ✅ Asset pipeline and build system
- ✅ Development environment setup

**Key Files Created:**
```
/src/
  /models/ - Pet.ts, NPC.ts, Player.ts, Memory.ts, Shift.ts
  /systems/ - GameState.ts, SaveSystem.ts, EventSystem.ts
  /ui/ - UIManager.ts, ScreenManager.ts
  /data/ - pets.json, npcs.json, scenes.json
/assets/
  /art/ - placeholder sprites and UI mockups
  /audio/ - placeholder sound files
```

#### Week 2: Core Game Loop & Unified Responsive UI ✅
**Completed Deliverables:**
- ✅ Pet assignment to café sections
- ✅ Shift timer system with completion rewards  
- ✅ Basic memory generation from shifts
- ✅ Coin economy and simple progression
- ✅ Unified responsive design implementation
- ✅ Mobile-first UI with bottom navigation
- ✅ Desktop-compatible layout with CSS media queries

**Achievements:**
- Eliminated code duplication with unified `UnifiedCafeScreen`
- Fixed mobile button blocking issues
- Simplified maintenance with CSS-only responsive behavior
- Comprehensive validation test suite for all features

#### Week 3: Data Persistence & Advanced UI Features ✅
**Completed Deliverables:**
- ✅ Save/load system with localStorage
- ✅ Screen navigation system
- ✅ Multiple save slots system (3 slots)
- ✅ Save/Load UI with visual previews
- ✅ Modal confirmation system

### Phase 2: Collection & Social Systems (Weeks 4-6) ✅

#### Week 4: Gacha & Pet Management ✅
**Completed Deliverables:**
- ✅ Pet gacha system with rarity tiers
- ✅ Pet collection interface
- ✅ Duplicate conversion to tokens
- ✅ Pity system implementation
- ✅ Pull history tracking

**Features:**
- 10x and single pull mechanics
- Rarity reveal animations
- Pet roster with collection tracking
- Visual feedback for rare pulls

#### Week 5: Idle Game Loop & Shift Integration ✅
**Completed Deliverables:**
- ✅ Complete shift-to-reward pipeline (RewardSystem)
- ✅ Automatic memory generation from shifts (MemoryGenerator)
- ✅ Pet efficiency bonuses based on affinity
- ✅ Consumable items system (6 types implemented)
- ✅ Offline progression calculation (OfflineProgressionSystem)

**Implemented Systems:**
- RewardSystem with dynamic calculations
- MemoryGenerator with 60+ unique templates
- ConsumableManager for items and effects
- OfflineProgressionSystem with welcome back UI
- Fixed section types and UI navigation
- Integrated all systems into cohesive loop

#### Week 6: Blog & Memory Publishing ✅
**Completed Deliverables:**
- ✅ Memory selection and editing UI
- ✅ Blog feed with chronological posts
- ✅ Publishing workflow (shift → memory → blog)
- ✅ Subscriber growth mechanics
- ✅ NPC tagging and bond points
- ✅ NPC reactions to blog posts
- ✅ 100% memory generation from shifts
- ✅ Love & Pets branding update

**Social Features:**
- Memory card customization with captions
- NPC tagging system
- Automatic NPC comments
- Subscriber milestones
- Viral post mechanics
- Blog engagement tracking

### Phase 3: Romance & Narrative Systems (Weeks 7-8)

#### Week 7: NPC Interactions - DMs & Bond System ✅
**Completed Deliverables (Week 7 Foundation):**
- ✅ DM conversation interface with persistent history
- ✅ Contextual NPC response engine with bond-aware templates
- ✅ Bond level progression from shifts, memories, and DMs
- ✅ Message quick replies + bond progress UI integration
- ✅ Café/NPC notification badges aligned with unified navigation

**Residual Tasks (rolling into Week 8):**
- 🔁 Unlockable conversation topics tied to bond milestones
- 🔁 NPC-specific story scenes & scene triggers
- 🔁 Bond milestone reward UI polish
- 🔁 Pet affinity tracking (gacha impact on bonds)

#### Week 8: Story Unlock Sprint & UI Polish 🎯 (In Progress)
**Focus:** Connect café business progress, pet collection, and NPC intimacy into tangible story payoffs + UI improvements.

**Completed (Sept 26):**
- ✅ Redesigned Cafe Section screens with profile-style layout (hero image, centered design)
- ✅ Updated section names: Aria's Bakery, Kai's Playground, Elias's Salon  
- ✅ Fixed shift completion modal showing multiple times (duplicate prevention)
- ✅ Added "Collect Rewards!" status on Cafe overview for completed shifts
- ✅ Implemented pending rewards system (only shows modal on correct screen)
- ✅ Enhanced pet cards in cafe sections with affinity tags and rarity badges
- ✅ Created 320px hero portraits with NPC-specific gradient backgrounds
- ✅ Removed debug UI elements (bond stats, scene buttons) for cleaner interface
- ✅ Fixed instant finish rewards not showing (visibility check issue)

**Remaining for Week 8:**
- Build conversation topic unlocks based on (café subscribers + bond level)
- Implement scene framework (pre-scene checks, presentation, rewards)
- Create first pass story scenes for Aria, Kai, Elias (intro + milestone)
- Wire memory/blog outcomes into DM dialogue references (dynamic callbacks)
- Author narrative test flow (Session 2 climax)
- Add pet affinity system (pet acquisition grants helper-specific bond boosts)
- Surface gacha bond feedback UI (post-pull summaries, bond badges on cards)

#### Week 9: Narrative Polish & Voice UI ⏳ (Planned)
**Goals:**
- Prototype voice call UI tied to bond milestones and café thresholds
- Expand story scenes (mid/late relationship beats)
- Tutorial + narrative guidance overlay (explain dual progression: café growth vs. intimacy)
- Accessibility + UX polish for story delivery (text size, skip, log)
- Hook up story analytics checkpoints (for validation and tuning)
- Personalize DM/blog text with recent pets (name/rarity references)
- Trigger rare pet vignettes (first Rare/Ultra per NPC)

### Phase 4: Polish & Final Features (Week 10)
- See updated roadmap below for combined story + systems polish plan.

---

## 3. Technical Architecture

### Technology Stack
- **Frontend Framework**: Custom TypeScript framework (no heavy game engine needed)
- **Language**: TypeScript for type safety
- **Build Tool**: Vite for fast development and optimized bundling
- **Storage**: localStorage with auto-save functionality
- **AI Integration**: OpenAI API (optional, with fallbacks)
- **Audio**: Howler.js for cross-platform audio support
- **CSS Framework**: Custom unified responsive system with CSS Grid/Flexbox
- **Testing**: Custom validation suite with automated and manual tests
- **Live Ops**: CSV/Google Sheets integration for parameter management

### Key Systems Architecture

#### Game State Management
```typescript
interface GameState {
  player: Player;
  activeShifts: Shift[];
  cafeLayout: CafeSection[];
  unlockedContent: UnlockState;
  uiState: UIState;
  gameSession: GameSession;
  blogPosts?: BlogPost[];
}
```

#### Data Flow
1. **User Action** → Event System → State Update → UI Refresh
2. **Shift Completion** → Reward Calculation → Memory Generation → Blog Update
3. **Pet Assignment** → Validation → Shift Creation → Timer Start
4. **Memory Publishing** → Bond Calculation → NPC Notification → Blog Feed Update

---

## 4. Live Operations Management System

### Overview
To enable rapid iteration and balancing without code changes, the game will support external configuration through CSV files or Google Sheets. This allows non-technical team members to adjust game parameters, add content, and run events.

### Configuration Architecture

#### Data Sources
1. **Local CSV Files** (Development)
   - Quick iteration during development
   - Version controlled with Git
   - Easy to edit with any spreadsheet tool

2. **Google Sheets Integration** (Production)
   - Real-time updates without deployment
   - Access control and change history
   - Comments and collaboration features
   - Automatic backup and versioning

### Configurable Parameters

#### Economy Configuration
```csv
parameter_id,value,min_value,max_value,description
base_shift_coins,30,10,100,"Base coins earned per shift"
shift_duration_minutes,3,1,10,"Default shift duration"
memory_generation_chance,1.0,0.1,1.0,"Chance to generate memory"
viral_post_multiplier,10,5,20,"Subscriber gain multiplier for viral posts"
gacha_single_cost,100,50,500,"Cost for single gacha pull"
gacha_multi_cost,900,450,4500,"Cost for 10x gacha pull"
```

#### Pet Configuration
```csv
pet_id,name,rarity,section_affinity,base_efficiency,unlock_level
cat_orange,Marmalade,common,cat-lounge,1.0,1
cat_siamese,Mocha,rare,cat-lounge,1.2,1
cat_persian,Duchess,ultra_rare,cat-lounge,1.5,1
dog_shiba,Mochi,common,puppy-patio,1.0,1
```

#### NPC Configuration
```csv
npc_id,name,personality,section,bond_multiplier,unlock_condition
aria,Aria,warm,cat-lounge,1.0,default
kai,Kai,energetic,puppy-patio,1.0,default
elias,Elias,artistic,bird-bistro,1.0,default
```

#### Memory Templates
```csv
template_id,mood,rarity,content_template,tags
mem_001,joyful,common,"{pet1} had a blast helping {npc} in the {section}!",fun;pets;cafe
mem_002,peaceful,common,"A quiet afternoon with {pet1} in the {section}.",calm;relax
mem_003,playful,rare,"{pet1} caused delightful mischief today!",playful;mischief
```

### Implementation Details

#### CSV Loader System
```typescript
class ConfigLoader {
  private configs: Map<string, any[]> = new Map();
  
  async loadCSV(filename: string): Promise<void> {
    const response = await fetch(`/data/configs/${filename}`);
    const text = await response.text();
    const data = this.parseCSV(text);
    this.configs.set(filename, data);
  }
  
  getConfig(filename: string): any[] {
    return this.configs.get(filename) || [];
  }
}
```

#### Google Sheets Integration
```typescript
class GoogleSheetsLoader {
  private readonly SHEET_ID = 'your-sheet-id';
  private readonly API_KEY = process.env.GOOGLE_API_KEY;
  
  async loadSheet(sheetName: string): Promise<any[]> {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${this.SHEET_ID}/values/${sheetName}?key=${this.API_KEY}`;
    const response = await fetch(url);
    const data = await response.json();
    return this.parseSheetData(data.values);
  }
}
```

### Live Events System

#### Event Configuration
```csv
event_id,start_date,end_date,event_type,multipliers,special_rewards
summer_2025,2025-07-01,2025-07-31,seasonal,coins:2;xp:1.5,summer_pet_01
valentine_2025,2025-02-01,2025-02-14,holiday,bonds:2;subs:2,valentine_frame
```

#### A/B Testing Configuration
```csv
test_id,variant,parameter,value,user_percentage
gacha_rates_v1,control,ultra_rare_rate,0.03,50
gacha_rates_v1,variant_a,ultra_rare_rate,0.05,50
```

### Benefits

1. **Rapid Iteration**: Balance changes without code deployment
2. **Non-Technical Access**: Designers can adjust parameters directly
3. **Event Management**: Run time-limited events easily
4. **A/B Testing**: Test different configurations on user segments
5. **Emergency Fixes**: Quick response to balance issues
6. **Content Expansion**: Add new pets, NPCs, memories without coding

### Security Considerations

1. **Validation**: All loaded values must be validated against min/max ranges
2. **Caching**: Cache configurations locally with TTL
3. **Fallbacks**: Always have default values if loading fails
4. **Rate Limiting**: Limit configuration refresh frequency
5. **Authentication**: Secure Google Sheets API access

---

## 5. Risk Assessment & Mitigation

### High-Risk Areas
1. **AI Integration Complexity**
   - *Mitigation*: Build static fallback system first, add AI as enhancement
   - *Timeline Buffer*: 1 week additional if AI features are required

2. **Mobile Performance**
   - *Mitigation*: Regular testing on low-end devices, performance budgets
   - *Optimization*: Sprite atlases, object pooling, efficient animations

3. **Live Ops Complexity**
   - *Mitigation*: Start with local CSV, add Google Sheets later
   - *Testing*: Automated validation of all configuration changes

### Medium-Risk Areas
1. **Save System Complexity**
   - *Mitigation*: Robust versioning and migration system
   
2. **Cross-Platform Compatibility**
   - *Mitigation*: Regular testing on iOS Safari, Android Chrome

3. **Configuration Errors**
   - *Mitigation*: Validation layer, safe defaults, rollback capability

---

## 6. Success Metrics & Testing

### Functional Requirements
- [x] All 15 pets obtainable through gacha
- [x] All 3 café sections operational with shift mechanics
- [x] Complete player journey (3 sessions) playable
- [ ] All NPCs have functional DM and call systems *(DM ✅, voice calls upcoming Week 9)*
- [x] Save/load system preserves all progress
- [x] No critical bugs or console errors
- [ ] Live ops configuration system functional

### Performance Requirements
- [x] 60fps on iPhone 12 and equivalent Android devices
- [x] <3 second load time on 4G connection
- [x] <100MB total package size
- [x] Works on iOS Safari 14+ and Android Chrome 90+

### User Experience Requirements
- [ ] Intuitive tutorial system guides new players
- [x] All UI elements provide immediate feedback
- [x] Responsive design works on phones and tablets
- [ ] Accessibility features functional

---

## 7. Timeline & Milestones (Updated)

| Week | Milestone | Deliverable | Status |
|------|-----------|-------------|---------|
| 1 | Foundation Complete | Runnable project with basic systems | ✅ Complete |
| 2 | Core Loop & Responsive UI | Pet shifts + unified mobile/desktop UI | ✅ Complete |
| 3 | Save System & Persistence | Multiple save slots + modal system | ✅ Complete |
| 4 | Gacha System | Pet collection mechanics | ✅ Complete |
| 5 | Idle Game Integration | Complete shift→reward→memory pipeline | ✅ Complete |
| 6 | Blog & Memory Publishing | Social system with NPC tagging | ✅ Complete |
| 7 | DM Foundations | Messaging, bond progression, unified nav polish | ✅ Complete |
| 8 | Story Unlocks | Conversation topics, first story scenes, café/bond/pet gating | 🎯 In Progress |
| 9 | Narrative Polish | Voice call UI, scene polish, tutorials, pet-personalized content | ⏳ Planned |
| 10 | Finalization | QA, performance, deployment package, pet-bond tuning | ⏳ Planned |

### Updated Weekly Roadmap (Story & Pet Integration Focus)

- **Week 8 – Story Unlock Sprint**
  - Implement bond milestone unlock tables (per NPC)
  - Add café subscriber gates for advanced topics/scenes
  - Build `ScenePlayer` component (UI layout, choice hooks)
  - Script & integrate one milestone scene per NPC
  - Update validation to cover narrative triggers and gating
  - Add pet affinity tracking + immediate bond boosts on acquisition
  - Highlight pet affiliation in gacha (bond badge, post-pull summary)
  - Personalize blog/DM copy using recent pets and unlocked scenes

- **Week 9 – Narrative & Onboarding Polish**
  - Prototype voice call UI tied to high bond tiers
  - Add tutorial beats explaining dual progression (café growth vs. intimacy vs. collection)
  - Expand DM templates to reference recent café achievements and pet pulls
  - Add accessibility settings (text size, auto-advance, skip options)
  - Playtest full Session 1-3 flow for narrative coherence
  - Implement rare/ultra pet vignettes + unlock flags
  - Surface scene follow-ups in DM list and quick replies

- **Week 10 – Integration & Launch Readiness**
  - Full integration testing (café + narrative + pet triggers)
  - Performance profiling during story scenes and calls
  - Audio pass for scenes/calls, ambient café loops
  - Finalize pet-driven bond milestone gating & tuning
  - Prepare distribution build & documentation package

---

## 8. Post-Launch Considerations

### Immediate Priorities (Weeks 11-12)
- User feedback analysis and critical bug fixes
- Performance optimization based on real-world usage
- Analytics integration for player behavior tracking
- Live ops dashboard implementation

### Future Expansion Opportunities
- Additional NPCs and romance routes
- Expanded pet roster (beyond 15 starter pets)
- Multiplayer features and social sharing
- Seasonal events and limited-time content
- Platform expansion (iOS/Android native apps)
- Voice acting integration
- Advanced AI conversation system

### Monetization Preparation
- Premium currency purchase system
- Cosmetic items and pet skins
- Battle pass / subscription model framework
- Ad integration points (optional)
- Special event bundles

---

## 9. Budget Estimation

### Development Costs (10 weeks)
- **Lead Developer**: $8,000 - $12,000
- **UI Developer**: $6,000 - $10,000  
- **Artist**: $4,000 - $8,000
- **Audio Designer**: $2,000 - $4,000
- **Tools & Services**: $500 - $1,000

**Total Estimated Range**: $20,500 - $35,000

### Additional Considerations
- AI API costs (if implemented): $100-500/month
- Cloud hosting for save system: $50-200/month
- App store fees and certificates: $200-500 one-time
- Google Workspace (for Sheets): $12-25/user/month

---

## Conclusion

The Love & Pets Café vertical slice now has robust café management and relationship foundations. The upcoming narrative sprint will leverage the dual progression axes—café business growth (subscribers, shift unlocks) and NPC intimacy (bond levels)—to deliver story moments that tie rewards, scenes, and conversations together. The project remains on track for the 10-week timeline with a clear focus on story delivery in Weeks 8-9.