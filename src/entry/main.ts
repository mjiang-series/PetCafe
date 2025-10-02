// Main entry point for the PetCafe game
import { GameStateManager } from '../systems/GameState';
import { EventSystem } from '../systems/EventSystem';
import { SaveSystem } from '../systems/SaveSystem';
import { UIManager } from '../ui/UIManager';
import { ScreenFactory } from '../ui/ScreenManager';
import { ShiftManager } from '../systems/ShiftManager';
import { GachaSystem } from '../systems/GachaSystem';
import { OfflineProgressionSystem } from '../systems/OfflineProgressionSystem';
import { SectionScreen } from '../ui/SectionScreen';
import { MapSectionScreen } from '../ui/MapSectionScreen';
import { SaveSlotsScreen } from '../ui/SaveSlotsScreen';
import { GachaScreen } from '../ui/GachaScreen';
import { PetCollectionScreen } from '../ui/PetCollectionScreen';
import { PetProfileScreen } from '../ui/PetProfileScreen';
import { MemorySelectionScreen } from '../ui/MemorySelectionScreen';
import { BlogScreen } from '../ui/BlogScreen';
import { JournalScreen } from '../ui/JournalScreen';
import { MemoryDetailScreen } from '../ui/MemoryDetailScreen';
import { QuickShareModal } from '../ui/components/QuickShareModal';
import { QuestModal } from '../ui/components/QuestModal';
import { ShopModal } from '../ui/components/ShopModal';
import { AlertNotificationSystem } from '../ui/components/AlertNotificationSystem';
import { NotificationsOverlay } from '../ui/components/NotificationsOverlay';
import { BlogPublisher } from '../systems/BlogPublisher';
import { BondProgressionSystem } from '../systems/BondProgressionSystem';
import { MemoryAchievementSystem } from '../systems/MemoryAchievementSystem';
import { DMListScreen } from '../ui/DMListScreen';
import { DMScreen } from '../ui/DMScreen';
import { getPetById, getAllPets, getPetsByRarity } from '../utils/petData';
import { getNPCById, getAllNPCs, getNPCsBySectionType } from '../utils/npcData';
import npcData from '../data/npcs.json';
import { ScenePlayer } from '../ui/components/ScenePlayer';
import { VoiceCallOverlay } from '../ui/components/VoiceCallOverlay';
import scenesData from '../data/scenes.json';
import VenusAPI from “venus-sdk-api”;

class PetCafeGame {
  private eventSystem: EventSystem;
  private gameState: GameStateManager;
  private saveSystem: SaveSystem;
  private uiManager: UIManager;
  private shiftManager: ShiftManager;
  private gachaSystem: GachaSystem;
  private offlineSystem: OfflineProgressionSystem;
  private blogPublisher: BlogPublisher;
  private bondProgressionSystem: BondProgressionSystem;
  private memoryAchievementSystem: MemoryAchievementSystem;
  private voiceCallOverlay: VoiceCallOverlay;
  private isInitialized: boolean = false;

  constructor() {
    console.log('[PetCafe] Initializing game...');
    
    // Initialize core systems
    this.eventSystem = new EventSystem(true); // Debug mode enabled
    this.gameState = new GameStateManager();
    this.saveSystem = new SaveSystem(this.eventSystem);
    this.uiManager = new UIManager(this.eventSystem);
    this.shiftManager = new ShiftManager(this.eventSystem, this.gameState);
    this.gachaSystem = new GachaSystem(this.eventSystem, this.gameState);
    this.offlineSystem = new OfflineProgressionSystem(this.eventSystem, this.gameState);
    this.blogPublisher = new BlogPublisher(this.eventSystem, this.gameState);
    this.bondProgressionSystem = new BondProgressionSystem(this.eventSystem, this.gameState);
    new ScenePlayer(this.eventSystem);
    this.voiceCallOverlay = new VoiceCallOverlay(this.eventSystem);
    
    // Initialize UI components
    new QuickShareModal(this.gameState, this.eventSystem, this.blogPublisher);
    new QuestModal(this.eventSystem, this.gameState);
    new ShopModal(this.eventSystem, this.gameState);
    
    // Initialize alert notification system
    const alertSystem = new AlertNotificationSystem(this.eventSystem, this.gameState);
    
    // Initialize notifications overlay
    new NotificationsOverlay(this.eventSystem, this.gameState);
    
    // Initialize achievement system
    this.memoryAchievementSystem = new MemoryAchievementSystem(this.eventSystem, this.gameState);

    this.setupSystemIntegration();
    this.setupEventListeners();

    // Basic initialization for
    await VenusAPI.initializeAsync();
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      console.log('[PetCafe] Loading game data...');
      
      // Try to load existing save data
      const savedState = await this.saveSystem.load();
      if (savedState) {
        console.log('[PetCafe] Save data loaded successfully');
        // Note: In a full implementation, we'd merge the saved state
        // For now, we'll just log that we found save data
      }

      // Initialize UI screens
      this.initializeScreens();

      // Start auto-save
      this.saveSystem.startAutoSave(() => this.gameState.getState());

      // Show initial screen
      this.showInitialScreen();

      this.isInitialized = true;
      console.log('[PetCafe] Game initialized successfully');

    } catch (error) {
      console.error('[PetCafe] Failed to initialize game:', error);
      this.uiManager.showError('Failed to initialize game. Please refresh and try again.');
    }
  }

  private setupSystemIntegration(): void {
    // Connect save system to game state
    this.gameState.setSaveCallback((state) => {
      this.saveSystem.save(state, { compress: true, validate: false, backup: false });
    });
  }

  private setupEventListeners(): void {
    // Game lifecycle events
    this.eventSystem.on('game:start_new', this.startNewGame.bind(this));
    this.eventSystem.on('game:continue', this.continueGame.bind(this));
    this.eventSystem.on('game:save', this.saveGame.bind(this));
    this.eventSystem.on('game:reset', this.resetGame.bind(this));
    this.eventSystem.on('game:reload', this.reloadGame.bind(this));

    // UI navigation events
    this.eventSystem.on('ui:show_screen', (data) => {
      // Handle section screens specially
      if (data.screenId === 'section' && data.data?.sectionType) {
        console.log('[PetCafe] Creating section screen for:', data.data.sectionType);
        
        // Use MapSectionScreen for all sections (quest-based system)
        const screen = new MapSectionScreen(
          `section-${data.data.sectionType}`,
          this.eventSystem,
          this.gameState,
          data.data.sectionType
        );
        
        this.uiManager.registerScreen(screen);
        this.uiManager.showScreen(screen.id, data.data);
      } else if (data.screenId === 'save-slots') {
        // Handle save slots screen specially
        const screen = new SaveSlotsScreen(
          'save-slots',
          this.eventSystem,
          this.gameState,
          this.saveSystem
        );
        
        this.uiManager.registerScreen(screen);
        this.uiManager.showScreen(screen.id, data.data);
      } else if (data.screenId === 'gacha') {
        // Handle gacha screen specially
        const screen = new GachaScreen(
          'gacha',
          this.eventSystem,
          this.gameState,
          this.gachaSystem
        );
        
        this.uiManager.registerScreen(screen);
        this.uiManager.showScreen(screen.id, data.data);
      } else if (data.screenId === 'pet-collection' || data.screenId === 'pets') {
        // Handle pet collection screen
        const screen = new PetCollectionScreen(
          'pet-collection',
          this.eventSystem,
          this.gameState,
          this.gachaSystem
        );
        
        this.uiManager.registerScreen(screen);
        this.uiManager.showScreen(screen.id, data.data);
      } else if (data.screenId === 'pet-profile') {
        // Handle pet profile screen
        // Check if screen already exists
        let screen = this.uiManager.getScreen('pet-profile') as PetProfileScreen;
        
        if (!screen) {
          screen = new PetProfileScreen(
            'pet-profile',
            this.eventSystem,
            this.gameState,
            this.gachaSystem
          );
          this.uiManager.registerScreen(screen);
        }
        
        this.uiManager.showScreen(screen.id, data.data);
      } else if (data.screenId === 'memory-selection') {
        // Handle memory selection screen
        const screen = new MemorySelectionScreen(
          'memory-selection',
          this.eventSystem,
          this.gameState,
          this.blogPublisher
        );
        
        this.uiManager.registerScreen(screen);
        this.uiManager.showScreen(screen.id, data.data);
      } else if (data.screenId === 'blog') {
        // Handle blog screen
        const screen = new BlogScreen(
          'blog',
          this.eventSystem,
          this.gameState,
          this.blogPublisher
        );
        
        this.uiManager.registerScreen(screen);
        this.uiManager.showScreen(screen.id, data.data);
      } else if (data.screenId === 'journal') {
        // Handle journal screen
        const screen = new JournalScreen(
          'journal',
          this.eventSystem,
          this.gameState
        );
        
        this.uiManager.registerScreen(screen);
        this.uiManager.showScreen(screen.id, data.data);
      } else if (data.screenId === 'memory-detail') {
        // Handle memory detail screen
        const screen = new MemoryDetailScreen(
          'memory-detail',
          this.eventSystem,
          this.gameState
        );
        
        this.uiManager.registerScreen(screen);
        this.uiManager.showScreen(screen.id, data.data);
      } else if (data.screenId === 'dm-list') {
        // Handle DM list screen
        const screen = new DMListScreen(
          'dm-list',
          this.eventSystem,
          this.gameState
        );
        
        this.uiManager.registerScreen(screen);
        this.uiManager.showScreen(screen.id, data.data);
      } else if (data.screenId === 'dm' && data.params?.npcId) {
        // Handle individual DM screen with unique ID per NPC
        const dmScreenId = `dm-${data.params.npcId}`;
        let screen = this.uiManager.getScreen(dmScreenId);
        
        if (!screen) {
          screen = new DMScreen(
            dmScreenId,
            this.eventSystem,
            this.gameState
          );
          this.uiManager.registerScreen(screen);
        }
        
        this.uiManager.showScreen(dmScreenId, data.params);
      } else {
        this.uiManager.showScreen(data.screenId, data);
      }
    });

    this.eventSystem.on('ui:show_overlay', (data) => {
      this.uiManager.showOverlay(data.overlayId, data);
    });

    // Add navigate back handler
    this.eventSystem.on('ui:navigate_back', () => {
      // For now, use browser history which will maintain proper navigation
      // In the future, we could maintain our own navigation stack
      window.history.back();
    });

    // Tutorial and progression events
    this.eventSystem.on('tutorial:start', this.startTutorial.bind(this));
    this.eventSystem.on('tutorial:complete_step', this.completeTutorialStep.bind(this));

    // Pet and gacha events
    this.eventSystem.on('gacha:pull', this.handleGachaPull.bind(this));
    this.eventSystem.on('pet:assign', this.handlePetAssignment.bind(this));

    // Shift management events
    this.eventSystem.on('shift:start', this.startShift.bind(this));
    this.eventSystem.on('shift:complete', this.completeShift.bind(this));

    // Blog and memory events
    this.eventSystem.on('memory:publish', this.publishMemory.bind(this));
    this.eventSystem.on('blog:update', this.updateBlog.bind(this));

    // NPC interaction events
    this.eventSystem.on('npc:send_dm', this.sendNPCMessage.bind(this));
    this.eventSystem.on('npc:start_call', this.startVoiceCall.bind(this));

    // Error handling
    this.eventSystem.on('game:error', (error) => {
      console.error('[PetCafe] Game error:', error);
      this.uiManager.showError(error.message || 'An unexpected error occurred');
    });
  }

  private initializeScreens(): void {
    // Register all game screens
    const screenIds = ['title', 'cafe-overview'];
    
    // Log viewport info for debugging
    console.log(`[PetCafe] Initializing screens - Viewport: ${window.innerWidth}x${window.innerHeight}, Mobile: ${ScreenFactory.isMobile()}`);
    
    screenIds.forEach(screenId => {
      const screen = ScreenFactory.createScreen(screenId, this.eventSystem, this.gameState, this.shiftManager);
      if (screen) {
        this.uiManager.registerScreen(screen);
      }
    });

    console.log('[PetCafe] Screens initialized');
  }

  private showInitialScreen(): void {
    // Check if player has save data to determine initial screen
    const hasSaveData = this.saveSystem.hasSaveData();
    
    if (hasSaveData) {
      this.uiManager.showScreen('title');
    } else {
      this.uiManager.showScreen('title');
    }
  }

  // Game lifecycle methods
  private async startNewGame(): Promise<void> {
    console.log('[PetCafe] Starting new game...');
    
    try {
      // Reset game state to initial values
      this.gameState.resetState();
      
      // Add initial welcome messages from NPCs
      this.gameState.addInitialWelcomeMessages();
      
      // Perform tutorial pull to give starter pets
      const tutorialPull = await this.gachaSystem.performTutorialPull();
      console.log('[PetCafe] Tutorial pull completed:', tutorialPull.results.length, 'pets acquired');
      
      // Save the game state with starter pets
      await this.saveGame();
      
      // Show intro sequence
      this.eventSystem.emit('tutorial:start');
      
      // Navigate to café overview
      this.uiManager.showScreen('cafe-overview');
      
      // Show tutorial welcome alert
      this.eventSystem.emit('tutorial:show', {
        tutorialId: AlertNotificationSystem.TUTORIALS.NEW_GAME.id,
        title: AlertNotificationSystem.TUTORIALS.NEW_GAME.title,
        message: AlertNotificationSystem.TUTORIALS.NEW_GAME.message
      });
      
    } catch (error) {
      console.error('[PetCafe] Failed to start new game:', error);
      this.uiManager.showError('Failed to start new game');
    }
  }

  private async continueGame(): Promise<void> {
    console.log('[PetCafe] Continuing existing game...');
    
    try {
      const savedState = await this.saveSystem.load();
      if (savedState) {
        // Restore the saved state
        this.gameState.setState(savedState);
        
        // Calculate offline progress
        const lastActiveTime = savedState.player.profile.lastActiveAt;
        const offlineReport = this.offlineSystem.calculateOfflineProgress(lastActiveTime);
        
        if (offlineReport) {
          // Apply offline rewards
          this.offlineSystem.applyOfflineProgress(offlineReport);
          
          // Show offline report after a short delay
          setTimeout(() => {
            this.offlineSystem.showOfflineReport(offlineReport);
          }, 500);
        }
        
        // Navigate to main screen
        this.uiManager.showScreen('cafe-overview');
        this.uiManager.showSuccess('Welcome back!');
      } else {
        this.uiManager.showError('No save data found');
        this.startNewGame();
      }
    } catch (error) {
      console.error('[PetCafe] Failed to continue game:', error);
      this.uiManager.showError('Failed to load save data');
    }
  }

  private async saveGame(): Promise<void> {
    const success = await this.saveSystem.save(this.gameState.getState());
    if (!success) {
      this.uiManager.showError('Failed to save game');
    }
    // Success saves are silent - no notification needed
  }

  private resetGame(): void {
    if (confirm('Are you sure you want to reset all progress? This cannot be undone.')) {
      this.saveSystem.deleteSave();
      location.reload();
    }
  }

  private async reloadGame(): Promise<void> {
    console.log('[PetCafe] Reloading game state...');
    try {
      const savedState = await this.saveSystem.load();
      if (savedState) {
        this.gameState.setState(savedState);
        this.eventSystem.emit('game:state_loaded');
        this.eventSystem.emit('game:state_updated');
      }
    } catch (error) {
      console.error('[PetCafe] Failed to reload game:', error);
      this.uiManager.showError('Failed to reload game state');
    }
  }

  // Tutorial system
  private startTutorial(): void {
    console.log('[PetCafe] Starting tutorial...');
    
    // Show intro scene
    this.eventSystem.emit('scene:play', { sceneId: 'game_intro' });
    
    // Unlock gacha for first pet pull
    this.gameState.unlock('features', 'gacha');
    // Tutorial is now handled by individual screens
  }

  private completeTutorialStep(data: { step: string }): void {
    console.log(`[PetCafe] Tutorial step completed: ${data.step}`);
    
    switch (data.step) {
      case 'first_gacha':
        this.gameState.unlock('features', 'shifts');
        // Tutorial is now handled by individual screens
        break;
      case 'first_shift':
        this.gameState.unlock('features', 'blog');
        // Tutorial is now handled by individual screens
        break;
      case 'first_blog':
        this.uiManager.showSuccess('Tutorial complete! You\'re ready to run your café.');
        break;
    }
  }

  // Gacha system placeholder
  private handleGachaPull(data: { type: '1x' | '10x' }): void {
    console.log(`[PetCafe] Gacha pull: ${data.type}`);
    // Placeholder for gacha logic
    this.uiManager.showSuccess('Gacha pull completed!');
  }

  // Pet management placeholder
  private handlePetAssignment(data: { petId: string; sectionId: string }): void {
    console.log(`[PetCafe] Pet ${data.petId} assigned to ${data.sectionId}`);
    // Placeholder for pet assignment logic
  }

  // Shift management placeholders
  private startShift(data: { sectionId: string; petIds: string[] }): void {
    console.log(`[PetCafe] Starting shift in ${data.sectionId} with pets:`, data.petIds);
    // Placeholder for shift start logic
  }

  private completeShift(data: { shiftId: string }): void {
    console.log(`[PetCafe] Completing shift: ${data.shiftId}`);
    // Placeholder for shift completion logic
  }

  // Blog system placeholders
  private publishMemory(data: { memoryId: string; caption: string; npcTag?: string }): void {
    console.log(`[PetCafe] Publishing memory: ${data.memoryId}`);
    // Placeholder for memory publishing logic
  }

  private updateBlog(): void {
    console.log('[PetCafe] Updating blog feed');
    // Placeholder for blog update logic
  }

  // NPC interaction placeholders
  private sendNPCMessage(data: { npcId: string; message: string }): void {
    console.log(`[PetCafe] Sending message to ${data.npcId}: ${data.message}`);
    // Placeholder for NPC message logic
  }

  private startVoiceCall(data: { npcId: string }): void {
    console.log(`[PetCafe] Starting voice call with ${data.npcId}`);
    // Placeholder for voice call logic
  }

  // Public methods for debugging
  public getGameState() {
    return this.gameState.getState();
  }

  public getGameStateManager() {
    return this.gameState;
  }

  public getEventSystem() {
    return this.eventSystem;
  }

  public getSaveSystem() {
    return this.saveSystem;
  }

  public getShiftManager() {
    return this.shiftManager;
  }

  public getGachaSystem() {
    return this.gachaSystem;
  }

  public getBlogPublisher() {
    return this.blogPublisher;
  }

  public getPetData() {
    // Return pet data utilities
    return {
      getPetById: getPetById,
      getAllPets: getAllPets,
      getPetsByRarity: getPetsByRarity
    };
  }

  // Debug commands
  public debugCompleteShift(sectionType: string) {
    this.shiftManager.debugCompleteShift(sectionType as any);
  }

  public debugAddCoins(amount: number) {
    const player = this.gameState.getPlayer();
    this.gameState.updatePlayer({
      currencies: {
        ...player.currencies,
        coins: player.currencies.coins + amount
      }
    });
    console.log(`[Debug] Added ${amount} coins. Total: ${player.currencies.coins + amount}`);
  }

  public debugSetShiftDuration(seconds: number) {
    this.shiftManager.debugSetShiftDuration(seconds);
    console.log(`[Debug] Shift duration set to ${seconds} seconds`);
  }

  public debugCompleteActiveShifts() {
    const shifts = this.gameState.getActiveShifts();
    shifts.forEach(shift => {
      if (shift.status === 'running') {
        this.shiftManager.completeShift(shift.shiftId, true);
      }
    });
    console.log(`[Debug] Completed ${shifts.length} active shifts`);
  }

  public debugGenerateMemory() {
    const state = this.gameState.getState();
    if (!state.player.memories) {
      state.player.memories = [];
    }
    
    const testMemory = {
      memoryId: `debug_memory_${Date.now()}`,
      shiftId: 'debug_shift',
      content: 'A magical moment at the café! The pets were absolutely adorable today.',
      imageUrl: '/assets/memories/default.jpg',
      taggedNpcs: [],
      mood: 'heartwarming',
      likes: 0,
      views: 0,
      isPublished: false,
      createdAt: Date.now(),
      location: 'Cat Lounge',
      petIds: state.player.pets.slice(0, 2).map(p => p.petId)
    };
    
    state.player.memories.push(testMemory);
    this.eventSystem.emit('memory:created', { memory: testMemory });
    console.log('[Debug] Generated test memory');
  }

  public debugSetShiftTime(seconds: number) {
    this.shiftManager.debugSetShiftDuration(seconds);
  }


  public debugSkipTime(ms: number) {
    // Simulate time passing for active shifts
    const shifts = this.gameState.getActiveShifts();
    shifts.forEach(shift => {
      if (shift.status === 'running' && shift.startedAt) {
        shift.startedAt -= ms;
      }
    });
    console.log(`[Debug] Skipped ${ms}ms for all active shifts`);
  }

  public debugAddTestPets() {
    const testPets = [
      { petId: 'cat_001', name: 'Whiskers', rarity: 'Common' as const, sectionAffinity: 'Bakery' as const },
      { petId: 'dog_001', name: 'Buddy', rarity: 'Common' as const, sectionAffinity: 'Playground' as const },
      { petId: 'bunny_001', name: 'Hoppy', rarity: 'Rare' as const, sectionAffinity: 'Styling' as const },
      { petId: 'cat_002', name: 'Mittens', rarity: 'Common' as const, sectionAffinity: 'Bakery' as const },
      { petId: 'dog_002', name: 'Max', rarity: 'Rare' as const, sectionAffinity: 'Playground' as const }
    ];

    const player = this.gameState.getPlayer();
    const newPets = testPets.map(pet => ({
      ...pet,
      artRefs: {
        portrait: '/art/pets/placeholder_pet.svg',
        showcase: '/art/pets/placeholder_pet.svg',
        animation: '/art/pets/placeholder_pet.svg'
      },
      acquiredAt: Date.now()
    }));

    this.gameState.updatePlayer({
      pets: [...player.pets, ...newPets]
    });

    console.log(`[Debug] Added ${testPets.length} test pets`);
    console.log('Test pets:', testPets.map(p => `${p.petId} (${p.rarity})`).join(', '));
  }
}

// Initialize and start the game when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  console.log('[PetCafe] DOM loaded, starting game...');
  
  try {
    const game = new PetCafeGame();
    await game.initialize();
    
    // Make game instance available globally for debugging
    (window as any).PetCafe = {
      game,
      getGameState: () => game.getGameState(),
      getGameStateManager: () => game.getGameStateManager(),
      getNPCData: () => ({
        getNPCById,
        getAllNPCs,
        getNPCsBySectionType,
        data: npcData
      }),
      getPetData: () => ({ getPetById, getAllPets, getPetsByRarity }),
      getSceneData: () => scenesData,
      getVoiceCallOverlay: () => game.voiceCallOverlay,
      getEventSystem: () => game.getEventSystem(),
      getSaveSystem: () => game.getSaveSystem(),
      getShiftManager: () => game.getShiftManager(),
      getGachaSystem: () => game.getGachaSystem(),
      getBlogPublisher: () => game.getBlogPublisher(),
      debugAddTestPets: () => game.debugAddTestPets(),
      debugCompleteActiveShifts: () => game.debugCompleteActiveShifts()
    };
    
    // Load validation tools in development mode
    if (process.env.NODE_ENV === 'development') {
      import('../validation/validate-all').then(module => {
        // Module loads and registers functions automatically
      }).catch(err => {
        console.warn('Validation tools not available:', err);
      });
    }
    
  } catch (error) {
    console.error('[PetCafe] Failed to start game:', error);
    
    // Show basic error message if UI system isn't available
    const errorDiv = document.createElement('div');
    errorDiv.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: #ff6b6b;
      color: white;
      padding: 20px;
      border-radius: 8px;
      text-align: center;
      z-index: 10000;
    `;
    errorDiv.innerHTML = `
      <h3>Failed to start Pet Café</h3>
      <p>Please refresh the page and try again.</p>
      <button onclick="location.reload()" style="margin-top: 10px; padding: 8px 16px;">Refresh</button>
    `;
    document.body.appendChild(errorDiv);
  }
});

export { PetCafeGame };
