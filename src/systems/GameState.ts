// Central game state management system
import { GameState, Player, Shift, CafeSection, UnlockState, UIState, GameSession, Memory, BlogPost, BlogComment, ConversationMessage, Conversation } from '../models';
import { EventSystem } from './EventSystem';
import { SceneConfig, scenes } from '../utils/sceneData';
import npcData from '../data/npcs.json';

interface UnlockCheckResult {
  meetsRequirements: boolean;
  missing: string[];
}

export class GameStateManager {
  private state: GameState;
  private eventSystem: EventSystem;
  private saveCallback?: (state: GameState) => void;

  constructor() {
    this.eventSystem = new EventSystem();
    this.state = this.createInitialState();
    this.setupEventListeners();
  }

  // State getters
  getState(): GameState {
    return { ...this.state }; // Return a copy to prevent direct mutation
  }

  getPlayer(): Player {
    return { ...this.state.player };
  }

  getActiveShifts(): Shift[] {
    return [...this.state.activeShifts];
  }

  getCafeSections(): CafeSection[] {
    return [...this.state.cafeLayout];
  }

  getEventSystem(): EventSystem {
    return this.eventSystem;
  }

  getPlayerPetAffinity(npcId: string) {
    return this.state.player.petAffinity?.[npcId] || { totalOwned: 0, byRarity: { Common: 0, Rare: 0, UltraRare: 0 } };
  }

  canUnlockNpcContent(npcId: string, milestoneId: string): boolean {
    const result = this.getUnlockCheckResult(npcId, milestoneId);
    return result.meetsRequirements;
  }

  getUnlockCheckResult(npcId: string, milestoneId: string): UnlockCheckResult {
    const npc = this.getNpcConfig(npcId);
    if (!npc?.unlockConditions) return { meetsRequirements: false, missing: ['No conditions found'] };

    const milestone = npc.unlockConditions.find(m => m.milestoneId === milestoneId);
    if (!milestone) return { meetsRequirements: false, missing: ['Milestone not defined'] };

    const missing: string[] = [];
    const bond = this.state.player.npcBonds.find(b => b.npcId === npcId);
    const affinity = this.getPlayerPetAffinity(npcId);
    const subscribers = this.state.player.subscribers;

    if (!bond) missing.push('Bond not started');
    if (bond && bond.bondLevel < milestone.requiredBondLevel) missing.push(`Bond level ${milestone.requiredBondLevel}`);
    if (bond && milestone.requiredBondPoints && bond.bondPoints < milestone.requiredBondPoints) missing.push(`${milestone.requiredBondPoints} bond points`);
    if (milestone.requiredPets && affinity.totalOwned < milestone.requiredPets) missing.push(`${milestone.requiredPets} pets`);
    if (milestone.requiredSubscribers && subscribers < milestone.requiredSubscribers) missing.push(`${milestone.requiredSubscribers} subscribers`);

    return {
      meetsRequirements: missing.length === 0,
      missing
    };
  }

  getAvailableConversationTopics(npcId: string): string[] {
    const npc = this.getNpcConfig(npcId);
    if (!npc?.unlockConditions) return [];

    const unlocked: string[] = [];
    npc.unlockConditions.forEach(condition => {
      if (condition.unlocks?.conversationTopics && this.canUnlockNpcContent(npcId, condition.milestoneId)) {
        unlocked.push(...condition.unlocks.conversationTopics);
      }
    });
    return unlocked;
  }

  // Reset state to initial values
  resetState(): void {
    this.state = this.createInitialState();
    this.eventSystem.emit('game:state_reset');
  }

  // Set entire state (for loading saves)
  setState(newState: GameState): void {
    this.state = newState;
    this.eventSystem.emit('game:state_loaded');
  }

  // State setters with event emission
  updatePlayer(updates: Partial<Player>): void {
    const oldPlayer = { ...this.state.player };
    this.state.player = { ...this.state.player, ...updates };
    
    this.eventSystem.emit('player:updated', {
      old: oldPlayer,
      new: this.state.player,
      changes: updates
    });

    // Emit specific events for UI updates
    if (updates.currencies) {
      this.eventSystem.emit('player:currencies_updated', {
        old: oldPlayer.currencies,
        new: this.state.player.currencies
      });
    }
    
    if (updates.subscribers !== undefined) {
      this.eventSystem.emit('blog:subscriber_gained', {
        oldCount: oldPlayer.subscribers,
        newCount: this.state.player.subscribers
      });
    }

    this.triggerSave();
  }

  addBondPoints(npcId: string, points: number): void {
    const player = this.state.player;
    const bondIndex = player.npcBonds.findIndex(bond => bond.npcId === npcId);
    
    if (bondIndex === -1) {
      // Create new bond if it doesn't exist
      player.npcBonds.push({
        npcId,
        bondLevel: 1,
        bondPoints: points,
        maxBondPoints: 150, // Level 1 > 2 threshold
        milestones: []
      });
    } else {
      // Add points to existing bond
      const bond = player.npcBonds[bondIndex];
      const oldPoints = bond.bondPoints;
      bond.bondPoints += points;
      
      // Check for level up
      while (bond.bondPoints >= bond.maxBondPoints) {
        bond.bondPoints -= bond.maxBondPoints;
        bond.bondLevel++;
        
        // Update max points based on new level thresholds
        switch (bond.bondLevel) {
          case 2:
            bond.maxBondPoints = 500; // Level 2 > 3
            break;
          case 3:
            bond.maxBondPoints = 1500; // Level 3 > 4
            break;
          case 4:
            bond.maxBondPoints = 5000; // Level 4 > 5
            break;
          default:
            bond.maxBondPoints = 10000; // Level 5+ (future expansion)
        }
        
        this.eventSystem.emit('npc:bond_level_up', {
          npcId,
          oldLevel: bond.bondLevel - 1,
          newLevel: bond.bondLevel
        });
      }
      
      this.eventSystem.emit('npc:bond_increased', {
        npcId,
        oldPoints,
        newPoints: bond.bondPoints,
        totalGained: points
      });
    }
    
    this.triggerSave();
  }

  addMemory(memory: Memory): void {
    if (!this.state.player.memories) {
      this.state.player.memories = [];
    }
    this.state.player.memories.push(memory);
    this.eventSystem.emit('memory:created', { memory });
    this.triggerSave();
  }

  updateMemory(memoryId: string, updates: Partial<Memory>): void {
    if (!this.state.player.memories) return;
    
    const memoryIndex = this.state.player.memories.findIndex(m => m.memoryId === memoryId);
    if (memoryIndex !== -1) {
      this.state.player.memories[memoryIndex] = {
        ...this.state.player.memories[memoryIndex],
        ...updates
      };
      this.triggerSave();
    }
  }

  // Conversation operations
  getConversation(npcId: string): Conversation | null {
    if (!this.state.player.conversations) {
      return null;
    }
    return this.state.player.conversations[npcId] || null;
  }

  getAllConversations(): Conversation[] {
    if (!this.state.player.conversations) {
      return [];
    }
    return Object.values(this.state.player.conversations);
  }

  getTotalUnreadMessages(): number {
    if (!this.state.player.conversations) {
      return 0;
    }
    return Object.values(this.state.player.conversations)
      .reduce((total, conv) => total + conv.unreadCount, 0);
  }

  addMessage(npcId: string, message: ConversationMessage): void {
    // Initialize conversations if needed
    if (!this.state.player.conversations) {
      this.state.player.conversations = {};
    }

    // Initialize conversation for this NPC if needed
    if (!this.state.player.conversations[npcId]) {
      this.state.player.conversations[npcId] = {
        npcId,
        messages: [],
        lastMessageTime: Date.now(),
        unreadCount: 0,
        totalMessages: 0
      };
    }

    const conversation = this.state.player.conversations[npcId];
    conversation.messages.push(message);
    conversation.lastMessageTime = message.timestamp;
    conversation.totalMessages++;

    // Update unread count if message is from NPC
    if (message.sender === 'npc' && !message.isRead) {
      conversation.unreadCount++;
    }

    // Update statistics
    if (message.sender === 'npc') {
      this.state.player.statistics.totalDMsReceived++;
    }

    // Emit events
    this.eventSystem.emit('conversation:message_added', { npcId, message });
    this.triggerSave();
  }

  markConversationAsRead(npcId: string): void {
    if (!this.state.player.conversations?.[npcId]) {
      return;
    }

    const conversation = this.state.player.conversations[npcId];
    
    // Mark all messages as read
    conversation.messages.forEach(msg => {
      if (msg.sender === 'npc') {
        msg.isRead = true;
      }
    });

    // Reset unread count
    conversation.unreadCount = 0;

    this.eventSystem.emit('conversation:marked_read', { npcId });
    this.triggerSave();
  }

  addBlogPost(blogPost: BlogPost): void {
    if (!this.state.blogPosts) {
      this.state.blogPosts = [];
    }
    this.state.blogPosts.push(blogPost);
    
    // Also add to player's blog post list
    if (!this.state.player.blogPosts) {
      this.state.player.blogPosts = [];
    }
    this.state.player.blogPosts.push(blogPost.postId);
    
    this.triggerSave();
  }

  getBlogPosts(): BlogPost[] {
    return this.state.blogPosts || [];
  }

  addCommentToBlogPost(postId: string, comment: BlogComment): void {
    const post = this.state.blogPosts?.find(p => p.postId === postId);
    if (post) {
      post.engagement.comments.push(comment);
      this.triggerSave();
    }
  }

  addLikeToBlogPost(postId: string): void {
    const post = this.state.blogPosts?.find(p => p.postId === postId);
    if (post) {
      post.engagement.likes++;
      this.triggerSave();
    }
  }

  updateShift(shiftId: string, updates: Partial<Shift>): void {
    const shiftIndex = this.state.activeShifts.findIndex(s => s.shiftId === shiftId);
    if (shiftIndex === -1) return;

    const oldShift = { ...this.state.activeShifts[shiftIndex] };
    this.state.activeShifts[shiftIndex] = { 
      ...this.state.activeShifts[shiftIndex], 
      ...updates 
    };

    this.eventSystem.emit('shift:updated', {
      shiftId,
      old: oldShift,
      new: this.state.activeShifts[shiftIndex],
      changes: updates
    });

    this.triggerSave();
  }

  addShift(shift: Shift): void {
    this.state.activeShifts.push(shift);
    this.eventSystem.emit('shift:started', { shift });
    this.triggerSave();
  }

  removeShift(shiftId: string): void {
    const shiftIndex = this.state.activeShifts.findIndex(s => s.shiftId === shiftId);
    if (shiftIndex === -1) return;

    const removedShift = this.state.activeShifts.splice(shiftIndex, 1)[0];
    this.eventSystem.emit('shift:removed', { shift: removedShift });
    this.triggerSave();
  }

  updateUIState(updates: Partial<UIState>): void {
    const oldUIState = { ...this.state.uiState };
    this.state.uiState = { ...this.state.uiState, ...updates };
    
    this.eventSystem.emit('ui:updated', {
      old: oldUIState,
      new: this.state.uiState,
      changes: updates
    });
  }

  // Unlock system
  unlock(category: keyof UnlockState, key: string): void {
    if (!this.state.unlockedContent[category]) {
      this.state.unlockedContent[category] = {};
    }
    
    if (!this.state.unlockedContent[category][key]) {
      this.state.unlockedContent[category][key] = true;
      this.eventSystem.emit('content:unlocked', { category, key });
      this.triggerSave();
    }
  }

  isUnlocked(category: keyof UnlockState, key: string): boolean {
    return this.state.unlockedContent[category]?.[key] || false;
  }

  // Event system integration
  on(event: string, callback: Function): void {
    this.eventSystem.on(event, callback);
  }

  off(event: string, callback: Function): void {
    this.eventSystem.off(event, callback);
  }

  emit(event: string, data?: any): void {
    this.eventSystem.emit(event, data);
  }

  // Save system integration
  setSaveCallback(callback: (state: GameState) => void): void {
    this.saveCallback = callback;
  }

  private triggerSave(): void {
    this.state.gameSession.lastSaveTime = Date.now();
    if (this.saveCallback) {
      this.saveCallback(this.state);
    }
  }

  // State initialization
  private createInitialState(): GameState {
    return {
      player: this.createInitialPlayer(),
      activeShifts: [],
      cafeLayout: this.createInitialCafeLayout(),
      unlockedContent: {
        sections: { 'bakery': true, 'playground': true, 'salon': true }, // All sections unlocked for testing
        npcs: { 'aria': true, 'kai': true, 'elias': true }, // All NPCs unlocked
        features: { 'gacha': true, 'blog': true },
        scenes: {}
      },
      uiState: {
        currentScreen: 'title',
        overlays: [],
        notifications: [],
        loading: false
      },
      gameSession: {
        sessionId: `session_${Date.now()}`,
        startTime: Date.now(),
        lastSaveTime: Date.now(),
        playTime: 0,
        isOnline: false,
        debugMode: false,
        version: '1.0.0'
      },
      blogPosts: []
    };
  }

  private createInitialPlayer(): Player {
    return {
      playerId: `player_${Date.now()}`,
      profile: {
        joinedAt: Date.now(),
        lastActiveAt: Date.now(),
        cafeLevel: 1,
        totalPlayTime: 0
      },
      currencies: {
        coins: 1000,
        premiumCurrency: 50,
        freeGachaCurrency: 10 // Start with 10 gacha tickets
      },
      pets: [],
      npcBonds: [
        {
          npcId: 'aria',
          bondLevel: 1,
          bondPoints: 0,
          maxBondPoints: 100,
          milestones: []
        },
        {
          npcId: 'kai',
          bondLevel: 1,
          bondPoints: 0,
          maxBondPoints: 100,
          milestones: []
        },
        {
          npcId: 'elias',
          bondLevel: 1,
          bondPoints: 0,
          maxBondPoints: 100,
          milestones: []
        }
      ],
      consumables: {
        'finish_shift': 3
      },
      dupeTokens: 0,
      dupesConverted: {},
      petAffinity: {},
      recentPetAcquisitions: [],
      memories: [],
      blogPosts: [],
      subscribers: 0,
      pendingActions: [],
      settings: {
        audio: {
          masterVolume: 1.0,
          musicVolume: 0.8,
          sfxVolume: 1.0,
          voiceVolume: 1.0
        },
        notifications: {
          shiftComplete: true,
          newMessages: true,
          voiceCalls: true
        },
        accessibility: {
          reducedMotion: false,
          highContrast: false,
          textScale: 1.0
        }
      },
      statistics: {
        totalShiftsCompleted: 0,
        totalGachaPulls: 0,
        totalBlogPosts: 0,
        totalDMsReceived: 0,
        totalCallsAnswered: 0,
        pityCounter: 0,
        totalPetsCollected: 0
      }
    };
  }

  private createInitialCafeLayout(): CafeSection[] {
    return [
      {
        sectionId: 'bakery',
        sectionType: 'bakery',
        level: 1,
        isUnlocked: true,
        helper: {
          npcId: 'aria',
          level: 1,
          experience: 0
        },
        upgrades: [],
        capacity: {
          petSlots: 3,
          consumableSlots: 1
        }
      },
      {
        sectionId: 'playground',
        sectionType: 'playground',
        level: 1,
        isUnlocked: true,
        helper: {
          npcId: 'kai',
          level: 1,
          experience: 0
        },
        upgrades: [],
        capacity: {
          petSlots: 3,
          consumableSlots: 1
        }
      },
      {
        sectionId: 'styling',
        sectionType: 'salon' as SectionType,
        level: 1,
        isUnlocked: true,
        helper: {
          npcId: 'elias',
          level: 1,
          experience: 0
        },
        upgrades: [],
        capacity: {
          petSlots: 3,
          consumableSlots: 1
        }
      }
    ];
  }

  private setupEventListeners(): void {
    this.eventSystem.on('pet:acquired', ({ pet }) => {
      if (!pet) return;
      const npcId = this.getNpcBySection(pet.sectionAffinity);
      if (!npcId) return;

      if (!this.state.player.petAffinity) {
        this.state.player.petAffinity = {};
      }

      if (!this.state.player.petAffinity[npcId]) {
        this.state.player.petAffinity[npcId] = {
          totalOwned: 0,
          byRarity: {
            Common: 0,
            Rare: 0,
            UltraRare: 0
          }
        };
      }

      const affinity = this.state.player.petAffinity[npcId];
      affinity.totalOwned++;
      affinity.byRarity[pet.rarity] = (affinity.byRarity[pet.rarity] || 0) + 1;
      affinity.lastAcquiredAt = Date.now();

      if (!this.state.player.recentPetAcquisitions) {
        this.state.player.recentPetAcquisitions = [];
      }

      this.state.player.recentPetAcquisitions.unshift({
        petId: pet.petId,
        npcId,
        rarity: pet.rarity,
        acquiredAt: Date.now()
      });

      this.state.player.recentPetAcquisitions = this.state.player.recentPetAcquisitions.slice(0, 20);
      this.eventSystem.emit('pet:affinity_updated', { npcId, affinity });
      this.checkForUnlockedScenes(npcId);
      this.triggerSave();
    });

    // Update play time every minute
    setInterval(() => {
      this.state.gameSession.playTime += 60000; // 1 minute in milliseconds
    }, 60000);
  }

  private getNpcBySection(section: SectionType): string | null {
    const mapping: Record<SectionType, string> = {
      bakery: 'aria',
      playground: 'kai',
      salon: 'elias'
    };
    return mapping[section] || null;
  }

  private checkForUnlockedScenes(npcId: string): void {
    const npc = this.getNpcConfig(npcId);
    if (!npc?.unlockConditions) return;

    npc.unlockConditions.forEach(condition => {
      if (!this.canUnlockNpcContent(npcId, condition.milestoneId)) return;

      if (condition.unlocks?.bondBonus) {
        this.addBondPoints(npcId, condition.unlocks.bondBonus);
      }

      condition.unlocks?.scenes?.forEach(sceneId => {
        if (!this.isScenePlayed(sceneId)) {
          const sceneConfig = scenes.find(scene => scene.sceneId === sceneId);
          if (sceneConfig) {
            this.eventSystem.emit('scene:play', { sceneId, config: sceneConfig });
            this.markSceneAsPlayed(sceneId);
          }
        }
      });
    });
  }

  private isScenePlayed(sceneId: string): boolean {
    return !!this.state.unlockedContent.scenes?.[sceneId];
  }

  private markSceneAsPlayed(sceneId: string): void {
    if (!this.state.unlockedContent.scenes) {
      this.state.unlockedContent.scenes = {};
    }
    this.state.unlockedContent.scenes[sceneId] = true;
    this.state.unlockedContent.milestones = this.state.unlockedContent.milestones || {};
    this.state.unlockedContent.milestones[sceneId] = true;
    this.triggerSave();
  }

  private getNpcConfig(npcId: string) {
    const npc = npcData.npcs.find((entry: any) => entry.npcId === npcId);
    if (!npc) {
      console.warn(`[GameState] NPC config not found for id: ${npcId}`);
      return null;
    }
    return npc;
  }

  // Add initial welcome messages from NPCs for new games
  addInitialWelcomeMessages(): void {
    const welcomeMessages: Record<string, string> = {
      aria: "Welcome to Pet Café! 🥰 I'm Aria, and I run the bakery. Can't wait to meet your adorable pets!",
      kai: "Hey there! I'm Kai! 🎉 The playground is all set up for some awesome fun with your pets!",
      elias: "Hello, darling... I'm Elias ✨ The salon is ready whenever you'd like to pamper your precious pets."
    };

    Object.entries(welcomeMessages).forEach(([npcId, message]) => {
      this.addMessage(npcId, {
        id: `welcome_${npcId}_${Date.now()}`,
        sender: 'npc',
        content: message,
        timestamp: Date.now() - 10000, // 10 seconds ago
        isRead: false
      });
    });
  }
}

