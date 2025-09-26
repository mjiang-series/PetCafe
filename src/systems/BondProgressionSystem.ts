// Bond Progression System - Manages NPC relationship progression
import { EventSystem } from './EventSystem';
import { GameStateManager } from './GameState';
import { NPCBond, BondMilestone } from '../models/NPC';
import npcData from '../data/npcs.json';

export interface BondReward {
  type: 'scene' | 'feature' | 'content' | 'conversation_topic';
  id: string;
  name: string;
  description: string;
}

export interface BondProgressEvent {
  npcId: string;
  source: 'shift' | 'memory' | 'message' | 'blog' | 'gift';
  points: number;
  multiplier?: number;
}

export class BondProgressionSystem {
  private eventSystem: EventSystem;
  private gameState: GameStateManager;
  
  // Bond point values for different activities
  private readonly BOND_POINTS = {
    shift: {
      base: 20,
      perfect: 10, // bonus for perfect shift
      withFavoritePet: 5 // bonus if using their favorite pet
    },
    memory: {
      created: 15,
      published: 10,
      viral: 20 // bonus if post goes viral
    },
    message: {
      sent: 2,
      quickReply: 1,
      firstOfDay: 5, // bonus for first message of the day
      longConversation: 10 // bonus for 10+ message exchange
    },
    blog: {
      tagged: 10,
      moodMatch: 5, // bonus if mood matches NPC preference
      highEngagement: 10 // bonus for high likes/comments
    },
    gift: {
      common: 10,
      rare: 25,
      favorite: 50
    }
  };

  constructor(eventSystem: EventSystem, gameState: GameStateManager) {
    this.eventSystem = eventSystem;
    this.gameState = gameState;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Shift completion
    this.eventSystem.on('shift:completed', (data: any) => {
      this.handleShiftCompletion(data.shift, data.rewards);
    });

    // Memory creation
    this.eventSystem.on('memory:created', (data: any) => {
      this.handleMemoryCreated(data.memory);
    });

    // Memory published to blog
    this.eventSystem.on('blog:post_published', (data: any) => {
      this.handleBlogPost(data.post);
    });

    // Message sent in DM
    this.eventSystem.on('conversation:message_added', (data: any) => {
      if (data.message.sender === 'player') {
        this.handleMessageSent(data.npcId, data.message);
      }
    });

    // Bond level up
    this.eventSystem.on('npc:bond_level_up', (data: any) => {
      this.handleBondLevelUp(data.npcId, data.newLevel);
    });
  }

  private handleShiftCompletion(shift: any, rewards: any): void {
    let points = this.BOND_POINTS.shift.base;
    const npcId = shift.helperNpcId;
    
    // Perfect shift bonus
    if (rewards.multiplier >= 1.5) {
      points += this.BOND_POINTS.shift.perfect;
    }

    // Check for favorite pet bonus
    const npcPreferences = this.getNPCPetPreferences(npcId);
    const hasFavoritePet = shift.assignedPets.some((petId: string) => 
      npcPreferences.favoritePets.includes(petId)
    );
    
    if (hasFavoritePet) {
      points += this.BOND_POINTS.shift.withFavoritePet;
    }

    this.awardBondPoints(npcId, points, 'shift');
  }

  private handleMemoryCreated(memory: any): void {
    // Award points to all NPCs involved in the memory
    if (memory.involvedNpcs && Array.isArray(memory.involvedNpcs)) {
      memory.involvedNpcs.forEach((npcId: string) => {
        this.awardBondPoints(npcId, this.BOND_POINTS.memory.created, 'memory');
      });
    }
    
    // Also check taggedNpcs for backward compatibility
    if (memory.taggedNpcs && Array.isArray(memory.taggedNpcs)) {
      memory.taggedNpcs.forEach((npcId: string) => {
        this.awardBondPoints(npcId, this.BOND_POINTS.memory.created, 'memory');
      });
    }
  }

  private handleBlogPost(post: any): void {
    // Check if post has tagged NPCs
    if (!post.taggedNpcs || !Array.isArray(post.taggedNpcs)) return;
    
    post.taggedNpcs.forEach((npcId: string) => {
      let points = this.BOND_POINTS.blog.tagged;
      
      // Mood match bonus
      const npcPreferences = this.getNPCMoodPreferences(npcId);
      if (post.content && npcPreferences.includes(post.content.mood)) {
        points += this.BOND_POINTS.blog.moodMatch;
      }
      
      // High engagement bonus (check after some time)
      if (post.engagement && post.engagement.likes > 100) {
        points += this.BOND_POINTS.blog.highEngagement;
      }
      
      this.awardBondPoints(npcId, points, 'blog');
    });

    // Viral bonus
    if (post.viral) {
      post.taggedNpcs.forEach((npcId: string) => {
        this.awardBondPoints(npcId, this.BOND_POINTS.memory.viral, 'memory');
      });
    }
  }

  private handleMessageSent(npcId: string, message: any): void {
    let points = this.BOND_POINTS.message.sent;
    
    // First message of the day bonus
    if (this.isFirstMessageToday(npcId)) {
      points += this.BOND_POINTS.message.firstOfDay;
    }
    
    // Long conversation bonus
    const conversation = this.gameState.getConversation(npcId);
    if (conversation && conversation.messages.length >= 10 && conversation.messages.length % 10 === 0) {
      points += this.BOND_POINTS.message.longConversation;
    }
    
    this.awardBondPoints(npcId, points, 'message');
  }

  private handleBondLevelUp(npcId: string, newLevel: number): void {
    const milestones = this.getBondMilestones();
    const levelMilestone = milestones[`level${newLevel}`];
    
    if (levelMilestone) {
      const rewards = this.processMilestoneUnlocks(npcId, levelMilestone);
      
      // Show notification
      this.eventSystem.emit('ui:show_notification', {
        type: 'bond_level_up',
        title: `Bond Level ${newLevel}!`,
        message: `Your bond with ${this.getNPCName(npcId)} has deepened!`,
        icon: this.getNPCIcon(npcId),
        rewards
      });
      
      // Unlock conversation topics
      if (levelMilestone.unlocks.content) {
        this.unlockConversationTopics(npcId, levelMilestone.unlocks.content);
      }
    }
  }

  private awardBondPoints(npcId: string, points: number, source: string): void {
    // Apply any active multipliers
    const multiplier = this.getActiveBondMultiplier(npcId);
    const finalPoints = Math.floor(points * multiplier);
    
    // Use existing GameState method
    this.gameState.addBondPoints(npcId, finalPoints);
    
    // Emit progress event
    this.eventSystem.emit('bond:progress', {
      npcId,
      source,
      points: finalPoints,
      multiplier
    } as BondProgressEvent);
    
    // Also emit the raw bond points for the UI
    this.eventSystem.emit('bond:points_earned', {
      npcId,
      points: finalPoints
    });
  }

  private getActiveBondMultiplier(npcId: string): number {
    let multiplier = 1.0;
    
    // Check for active items/buffs
    const player = this.gameState.getPlayer();
    
    // Example: Love potion consumable
    if (player.consumables?.love_potion > 0) {
      multiplier *= 1.5;
    }
    
    // Example: Special event multiplier
    const currentEvent = this.getCurrentEvent();
    if (currentEvent?.bondMultiplier) {
      multiplier *= currentEvent.bondMultiplier;
    }
    
    return multiplier;
  }

  private isFirstMessageToday(npcId: string): boolean {
    const conversation = this.gameState.getConversation(npcId);
    if (!conversation || conversation.messages.length === 0) {
      return true;
    }
    
    const lastMessage = conversation.messages[conversation.messages.length - 1];
    const lastMessageDate = new Date(lastMessage.timestamp);
    const today = new Date();
    
    return lastMessageDate.toDateString() !== today.toDateString();
  }

  private processMilestoneUnlocks(npcId: string, milestone: any): BondReward[] {
    const rewards: BondReward[] = [];
    
    // Process scenes
    if (milestone.unlocks.scenes) {
      milestone.unlocks.scenes.forEach((sceneId: string) => {
        rewards.push({
          type: 'scene',
          id: sceneId,
          name: this.getSceneName(sceneId),
          description: 'New story scene unlocked!'
        });
        
        // Mark scene as available
        this.eventSystem.emit('scene:unlocked', { npcId, sceneId });
      });
    }
    
    // Process features
    if (milestone.unlocks.features) {
      milestone.unlocks.features.forEach((featureId: string) => {
        rewards.push({
          type: 'feature',
          id: featureId,
          name: this.getFeatureName(featureId),
          description: 'New feature unlocked!'
        });
      });
    }
    
    // Process content
    if (milestone.unlocks.content) {
      milestone.unlocks.content.forEach((contentId: string) => {
        rewards.push({
          type: 'content',
          id: contentId,
          name: this.getContentName(contentId),
          description: 'New conversation topics available!'
        });
      });
    }
    
    return rewards;
  }

  private unlockConversationTopics(npcId: string, topics: string[]): void {
    // This will be used by the response engine to add new conversation options
    this.eventSystem.emit('conversation:topics_unlocked', { npcId, topics });
  }

  // Helper methods
  getBondLevel(npcId: string): number {
    const bond = this.gameState.getPlayer().npcBonds.find(b => b.npcId === npcId);
    return bond?.bondLevel || 1;
  }

  getBondProgress(npcId: string): { current: number; max: number; percentage: number } {
    const bond = this.gameState.getPlayer().npcBonds.find(b => b.npcId === npcId);
    if (!bond) {
      return { current: 0, max: 100, percentage: 0 };
    }
    
    return {
      current: bond.bondPoints,
      max: bond.maxBondPoints,
      percentage: (bond.bondPoints / bond.maxBondPoints) * 100
    };
  }

  getUnlockedContent(npcId: string): string[] {
    const bond = this.gameState.getPlayer().npcBonds.find(b => b.npcId === npcId);
    if (!bond) return [];
    
    const unlockedContent: string[] = [];
    const milestones = this.getBondMilestones();
    
    for (let level = 1; level <= bond.bondLevel; level++) {
      const milestone = milestones[`level${level}`];
      if (milestone?.unlocks.content) {
        unlockedContent.push(...milestone.unlocks.content);
      }
    }
    
    return unlockedContent;
  }

  private getBondMilestones(): any {
    return npcData.bondMilestones;
  }

  private getNPCName(npcId: string): string {
    const npc = npcData.npcs.find(n => n.npcId === npcId);
    return npc?.name || 'Unknown';
  }

  private getNPCIcon(npcId: string): string {
    const icons: Record<string, string> = {
      aria: '👩‍🍳',
      kai: '🏃‍♂️',
      elias: '✂️'
    };
    return icons[npcId] || '👤';
  }

  private getNPCPetPreferences(npcId: string): { favoritePets: string[] } {
    // This would be loaded from config
    const preferences: Record<string, { favoritePets: string[] }> = {
      aria: { favoritePets: ['fluffy', 'marshmallow'] },
      kai: { favoritePets: ['dash', 'bouncer'] },
      elias: { favoritePets: ['pearl', 'velvet'] }
    };
    
    return preferences[npcId] || { favoritePets: [] };
  }

  private getNPCMoodPreferences(npcId: string): string[] {
    const preferences: Record<string, string[]> = {
      aria: ['cozy', 'peaceful', 'heartwarming'],
      kai: ['energetic', 'chaotic', 'hilarious'],
      elias: ['adorable', 'mischievous', 'surprising']
    };
    
    return preferences[npcId] || [];
  }

  private getCurrentEvent(): { bondMultiplier?: number } | null {
    // This would check for active events
    // For now, return null
    return null;
  }

  private getSceneName(sceneId: string): string {
    const sceneNames: Record<string, string> = {
      first_memory: 'First Memory Together',
      deeper_connection: 'A Deeper Connection',
      romantic_moment: 'Special Moment',
      confession: 'Heart to Heart'
    };
    
    return sceneNames[sceneId] || sceneId;
  }

  private getFeatureName(featureId: string): string {
    const featureNames: Record<string, string> = {
      voice_calls: 'Voice Calls',
      special_calls: 'Special Voice Calls',
      advanced_dm: 'Special Messages',
      exclusive_content: 'Exclusive Content'
    };
    
    return featureNames[featureId] || featureId;
  }

  private getContentName(contentId: string): string {
    const contentNames: Record<string, string> = {
      intro_scene: 'Introduction',
      personal_story_1: 'Personal Story Chapter 1',
      personal_story_2: 'Personal Story Chapter 2',
      backstory_reveal: 'Backstory',
      ending_route_unlock: 'Special Ending'
    };
    
    return contentNames[contentId] || contentId;
  }
}
