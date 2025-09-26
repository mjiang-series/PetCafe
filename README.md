# Pet Café - Love & Pets

A romance dating sim and idle pet café hybrid game built with TypeScript and modern web technologies.

## 🎮 Game Overview

Pet Café combines the cozy charm of an idle café management game with heartfelt romance simulation. Players collect adorable pets through gacha mechanics, run café shifts to earn coins and memories, and build meaningful relationships with three NPCs (Aria, Kai, and Elias) through DMs, voice calls, and shared experiences.

### Core Features

- **Pet Collection**: 15 starter pets across 3 rarity tiers (Common, Rare, Ultra Rare)
- **Café Management**: 3 sections (Bakery, Playground, Styling) with shift-based gameplay
- **Romance System**: DM conversations and voice calls with 3 NPCs
- **Memory & Blog System**: Publish café moments to build relationships and gain subscribers
- **Progressive Unlocks**: Content unlocks based on bonds and café level

## 🚀 Quick Start

### Prerequisites

- Node.js 16.0.0 or higher
- npm or yarn package manager

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd PetCafe

# Install dependencies
npm install

# Start development server
npm run dev
```

The game will be available at `http://localhost:3000`

### Build for Production

```bash
# Build optimized production bundle
npm run build

# Preview production build
npm run preview
```

## 🏗️ Project Structure

```
PetCafe/
├── src/
│   ├── models/          # TypeScript interfaces and data models
│   │   ├── Pet.ts       # Pet-related interfaces
│   │   ├── NPC.ts       # NPC and romance system interfaces
│   │   ├── Player.ts    # Player state and progression
│   │   ├── Memory.ts    # Blog and memory system
│   │   ├── Shift.ts     # Café shift management
│   │   └── index.ts     # Consolidated exports
│   ├── systems/         # Core game systems
│   │   ├── GameState.ts # Central state management
│   │   ├── EventSystem.ts # Event-driven communication
│   │   └── SaveSystem.ts  # Save/load with localStorage
│   ├── ui/              # UI management and screens
│   │   ├── UIManager.ts # UI system coordinator
│   │   └── ScreenManager.ts # Screen navigation
│   ├── data/            # Game content and configuration
│   │   ├── pets.json    # Pet roster and gacha rates
│   │   ├── npcs.json    # NPC data and dialogue templates
│   │   └── scenes.json  # Story scenes and tutorials
│   └── entry/           # Application entry points
│       └── main.ts      # Main game initialization
├── assets/              # Game assets (art, audio, etc.)
├── docs/                # Documentation (organized by category)
│   ├── assets/          # Asset tracking and specifications
│   ├── development/     # Development docs and fixes
│   └── game-design/     # Game design documents
├── index.html           # Main HTML entry point
├── package.json         # Project dependencies and scripts
├── tsconfig.json        # TypeScript configuration
├── vite.config.ts       # Build system configuration
└── README.md           # This file
```

## 🎯 Development Status

This is the **Week 1** deliverable focusing on:

- ✅ Project setup and architecture
- ✅ TypeScript interfaces for all core entities
- ✅ Game state management system
- ✅ Event system for decoupled communication
- ✅ Save/load system with localStorage
- ✅ UI management framework
- ✅ Basic screen navigation
- ✅ Game data structure (pets, NPCs, scenes)
- ✅ Build system with Vite
- ✅ Development environment setup

### Next Steps (Week 2)

- Implement core game loop (pet assignment → shifts → rewards)
- Add shift timer system with completion mechanics
- Create memory generation from completed shifts
- Build coin economy and basic progression
- Add visual feedback for all interactions

## 🛠️ Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build optimized production bundle
- `npm run preview` - Preview production build locally
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint code linting
- `npm run lint:fix` - Fix auto-fixable linting issues
- `npm run test` - Run test suite (to be implemented)
- `npm run clean` - Clean build artifacts

## 🎨 Asset Pipeline

Assets are organized in the `/assets` directory:

```
assets/
├── art/
│   ├── npc/             # Character portraits and expressions
│   ├── pets/            # Pet sprites and animations
│   └── ui/              # UI elements and backgrounds
├── audio/
│   ├── music/           # Background music tracks
│   ├── sfx/             # Sound effects
│   └── voice/           # Voice snippets (TTS generated)
└── data/                # Runtime game data
```

**Note**: Placeholder assets are used during development. Final art assets will be integrated in later phases.

## 🔧 Technical Architecture

### Core Systems

- **GameStateManager**: Centralized state management with event emission
- **EventSystem**: Decoupled communication between systems
- **SaveSystem**: Automatic save/load with compression and validation
- **UIManager**: Screen navigation and user interface coordination

### Data Flow

1. **User Action** → Event System → State Update → UI Refresh
2. **Shift Completion** → Reward Calculation → Memory Generation → Blog Update
3. **Pet Assignment** → Validation → Shift Creation → Timer Start
4. **Memory Publishing** → Bond Calculation → NPC Notification → Feed Update

### Mobile-First Design

- Responsive viewport handling with CSS custom properties
- Touch-friendly interactions with proper event handling
- Performance optimized for mid-tier mobile devices
- PWA-ready with service worker support (to be implemented)

## 🎮 Game Design

### Player Journey

1. **Session 1**: Tutorial, first gacha pull, basic shift mechanics, first blog post
2. **Session 2**: Multi-section management, first NPC call, progression unlocks
3. **Session 3**: Advanced features, event banner tease, deeper romance interactions

### NPCs

- **Aria (Bakery)**: Warm, nurturing personality with baking-themed content
- **Kai (Playground)**: Energetic, playful personality with activity-themed content
- **Elias (Styling)**: Artistic, thoughtful personality with beauty-themed content

### Pet Collection

- **15 Starter Pets**: Distributed across 3 NPCs and 3 rarity tiers
- **Gacha Rates**: 70% Common, 27% Rare, 3% Ultra Rare
- **Ultra Rare Vignettes**: Cinematic backstory scenes for premium pets

## 🐛 Debug Features

The game instance is available globally as `window.PetCafe` for debugging:

```javascript
// Access game state
PetCafe.getGameState()

// Emit events
PetCafe.getEventSystem().emit('custom:event', data)

// Force save
PetCafe.getSaveSystem().save(gameState)
```

## 📱 Browser Support

- Chrome/Edge 87+
- Firefox 78+
- Safari 14+
- iOS Safari 12+
- Android Chrome 90+

## 🤝 Contributing

This is a prototype development project. See the project plan for detailed development phases and milestones.

### Development Workflow

1. Feature branches for all changes
2. TypeScript strict mode enabled
3. ESLint for code quality
4. Automatic formatting on save
5. Type checking before commits

## 📄 License

MIT License - see LICENSE file for details

---

**Development Team**: PetCafe Development Team  
**Version**: 1.0.0  
**Last Updated**: September 22, 2025

