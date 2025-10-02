// Shift Rewards Modal - Modern rewards display with bond progress
import { EventSystem } from '../../systems/EventSystem';
import { GameStateManager } from '../../systems/GameState';
import { ShiftRewards } from '../../models/Shift';
import { getNPCById } from '../../utils/npcData';
import { getPetById } from '../../utils/petData';
import { getAssetPath } from '../../utils/AssetPaths';
import { Memory } from '../../models/Memory';

export interface ShiftRewardsData {
  shift: any;
  rewards: ShiftRewards;
  npcId: string;
  bondPointsEarned?: number;
  newBondLevel?: number;
  questTitle?: string;
  questDescription?: string;
  assignedPetId?: string;
}

export class ShiftRewardsModal {
  private element: HTMLElement | null = null;
  private eventSystem: EventSystem;
  private gameState: GameStateManager;
  private onClose?: () => void;
  private isClosing: boolean = false;

  constructor(eventSystem: EventSystem, gameState: GameStateManager) {
    this.eventSystem = eventSystem;
    this.gameState = gameState;
  }

  show(data: ShiftRewardsData, onClose?: () => void): void {
    this.onClose = onClose;
    this.isClosing = false; // Reset the closing flag
    this.createElement(data);
    document.body.appendChild(this.element!);

    // Add show animation
    requestAnimationFrame(() => {
      this.element?.classList.add('show');
    });

    // Setup close handlers
    this.setupEventListeners();
    
    // Show tutorial on first rewards collection
    this.eventSystem.emit('tutorial:show', {
      tutorialId: 'tutorial_first_rewards',
      title: "You're building memories with us!",
      message: "Check out the Journal if you haven't already."
    });
  }

  private createElement(data: ShiftRewardsData): void {
    // Generate and save memory if quest data is provided
    let generatedMemory: Memory | null = null;
    if (data.assignedPetId && data.questTitle) {
      generatedMemory = this.generateQuestMemory(data);
      this.saveMemoryToJournal(generatedMemory);
    }
    
    const container = document.createElement('div');
    container.className = 'shift-rewards-modal';
    
    container.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <div class="rewards-header">
          <h2>${data.questTitle ? 'Task Complete!' : 'Shift Complete!'}</h2>
        </div>
        
        <div class="rewards-body">
          ${generatedMemory ? this.createMemorySection(generatedMemory) : ''}
          ${this.createCafeProgressSection(data)}
          ${this.createRewardsSection(data.rewards)}
          ${this.createBondSection(data, generatedMemory)}
        </div>
        
        <div class="rewards-footer">
          <button class="btn-primary collect-btn">
            <span class="btn-text">Collect Rewards</span>
            <span class="btn-icon material-icons">auto_awesome</span>
          </button>
        </div>
      </div>
    `;
    
    this.element = container;
  }

  private createRewardsSection(rewards: ShiftRewards): string {
    let html = '<div class="rewards-section">';
    html += '<h3>Rewards Earned</h3>';
    
    // Add staffing bonus message if coins are above base
    if (rewards.coins > 1800) {
      const bonusCoinAmount = rewards.coins - 1800;
      html += `<p class="staffing-bonus">+${bonusCoinAmount} bonus coins</p>`;
    }
    
    html += '<div class="reward-items">';
    
    // Base rewards
    html += `
      <div class="reward-item">
        <span class="reward-icon material-icons icon-gold">paid</span>
        <span class="reward-text">
          <span class="reward-amount">${rewards.coins}</span>
          <span class="reward-label">Coins</span>
        </span>
      </div>
    `;
    
    // Gacha tickets (if present)
    if (rewards.freeGachaCurrency && rewards.freeGachaCurrency > 0) {
      html += `
        <div class="reward-item">
          <span class="reward-icon material-icons icon-ticket">confirmation_number</span>
          <span class="reward-text">
            <span class="reward-amount">+${rewards.freeGachaCurrency}</span>
            <span class="reward-label">Gacha Ticket${rewards.freeGachaCurrency !== 1 ? 's' : ''}</span>
          </span>
        </div>
      `;
    }
    
    if (rewards.helperXP > 0) {
      // Skip helper XP display - deprecated
    }
    
    // Bonus rewards
    if (rewards.bonusRewards) {
      if (rewards.bonusRewards.premiumCurrency) {
        html += `
          <div class="reward-item bonus">
            <span class="reward-icon material-icons icon-gem">diamond</span>
            <span class="reward-text">
              <span class="reward-amount">+${rewards.bonusRewards.premiumCurrency}</span>
              <span class="reward-label">Gems</span>
            </span>
          </div>
        `;
      }
      
      if (rewards.bonusRewards.freeGachaCurrency) {
        html += `
          <div class="reward-item bonus">
            <span class="reward-icon material-icons">confirmation_number</span>
            <span class="reward-text">
              <span class="reward-amount">+${rewards.bonusRewards.freeGachaCurrency}</span>
              <span class="reward-label">Gacha Ticket</span>
            </span>
          </div>
        `;
      }
      
      if (rewards.bonusRewards.dupeTokens) {
        html += `
          <div class="reward-item bonus">
            <span class="reward-icon material-icons">local_activity</span>
            <span class="reward-text">
              <span class="reward-amount">+${rewards.bonusRewards.dupeTokens}</span>
              <span class="reward-label">Tokens</span>
            </span>
          </div>
        `;
      }
    }
    
    html += '</div></div>';
    return html;
  }

  private createBondSection(data: ShiftRewardsData, memory: Memory | null): string {
    if (!data.bondPointsEarned || data.bondPointsEarned === 0) return '';
    
    const bond = this.gameState.getPlayer().npcBonds.find(b => b.npcId === data.npcId);
    if (!bond) return '';
    
    const npc = getNPCById(data.npcId);
    const npcName = npc?.name || 'Helper';
    
    let html = '<div class="bond-progress-section">';
    html += '<h3>Relationship Progress</h3>';
    
    // Bond points earned
    html += `
      <div class="bond-points-earned">
        <span class="bond-icon material-icons icon-love">favorite</span>
        <span class="bond-text">+${data.bondPointsEarned} Relationship Points</span>
      </div>
    `;
    
    // Progress bar
    const percentage = (bond.bondPoints / bond.maxBondPoints) * 100;
    html += `
      <div class="bond-progress-display">
        <div class="bond-level-info">
          <span>Level ${bond.bondLevel}</span>
          <span>${bond.bondPoints}/${bond.maxBondPoints}</span>
        </div>
        <div class="bond-progress-bar">
          <div class="bond-progress-fill" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
    
    // Level up notification
    if (data.newBondLevel) {
      html += `
        <div class="bond-level-up">
          <span class="level-up-icon material-icons">celebration</span>
          <span class="level-up-text">Relationship Level ${data.newBondLevel}!</span>
        </div>
      `;
    }
    
    // NPC Reaction (moved below summary)
    html += `
      <div class="npc-reaction">
        <img src="${this.getNPCPortraitPath(npc)}" alt="${npcName}" class="npc-portrait">
        <div class="speech-bubble">
          ${this.getQuestNPCReaction(data, memory)}
        </div>
      </div>
    `;
    
    html += '</div>';
    return html;
  }

  private getQuestNPCReaction(data: ShiftRewardsData, memory: Memory | null): string {
    const pet = data.assignedPetId ? getPetById(data.assignedPetId) : null;
    const petName = pet?.name || 'them';
    const questTitle = data.questTitle || 'the task';
    
    const reactions = [
      `${petName} did such an amazing job with ${questTitle}! I'm so grateful for their help today.`,
      `Wow, ${petName} really went above and beyond! ${questTitle} has never gone so smoothly.`,
      `I couldn't have done ${questTitle} without ${petName}. They're truly special!`,
      `${petName} made today so much easier! Their work on ${questTitle} was outstanding.`,
      `What a wonderful day! ${petName} brought such positive energy to ${questTitle}.`
    ];
    
    return reactions[Math.floor(Math.random() * reactions.length)];
  }


  private getNPCReaction(npcId: string, rewards: ShiftRewards): string {
    // Get the NPC data
    const npc = getNPCById(npcId);
    if (!npc) return "That was a good shift!";
    
    // Build context for the reaction
    const hasMemory = !!rewards.memoryCandidateId;
    const bonusCoins = rewards.coins - 1800;
    const hasPetBonus = bonusCoins > 0;
    
    // Create contextual reactions based on NPC personality
    if (npcId === 'aria') {
      if (hasMemory) {
        return "Oh my! Something special happened today - I can feel it! The cafe was filled with such warmth and joy! 🍰";
      } else if (hasPetBonus && bonusCoins >= 500) {
        return "The pets were absolutely wonderful today! They helped make everything run so smoothly!";
      } else if (hasPetBonus) {
        return "Thank you for the help! The pets really made a difference in the bakery today.";
      } else {
        return "Another lovely shift! Even without extra helpers, we managed to get everything done.";
      }
    } else if (npcId === 'kai') {
      if (hasMemory) {
        return "WHOA! That was EPIC! Something super cool happened - I gotta remember this one! 🎉";
      } else if (hasPetBonus && bonusCoins >= 500) {
        return "DUDE! The pets were ON FIRE today! Best. Team. EVER!";
      } else if (hasPetBonus) {
        return "Nice! The pets brought some extra energy to the playground!";
      } else {
        return "That was fun! Next time bring some pets - they make everything more exciting!";
      }
    } else if (npcId === 'elias') {
      if (hasMemory) {
        return "How... remarkable. Today's session revealed something quite special. I must document this... ✨";
      } else if (hasPetBonus && bonusCoins >= 500) {
        return "Exquisite work... The pets demonstrated exceptional grace today.";
      } else if (hasPetBonus) {
        return "Adequate... The pets contributed nicely to today's aesthetic.";
      } else {
        return "The shift is complete. Consider bringing assistants next time for enhanced results.";
      }
    }
    
    return "That was a good shift!";
  }

  private setupEventListeners(): void {
    // Close on backdrop click
    const backdrop = this.element?.querySelector('.modal-backdrop');
    backdrop?.addEventListener('click', () => this.close());
    
    // Collect button
    const collectBtn = this.element?.querySelector('.collect-btn');
    collectBtn?.addEventListener('click', () => this.close());
    
    // View in Journal button
    const viewMemoryBtn = this.element?.querySelector('.view-memory-btn');
    viewMemoryBtn?.addEventListener('click', () => {
      this.close();
      // Navigate to journal screen (will be implemented when journal screen exists)
      this.eventSystem.emit('ui:show_screen', { screenId: 'journal' });
    });
    
    // ESC key
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.close();
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);
  }

  private close(): void {
    // Prevent double-closing
    if (this.isClosing) return;
    this.isClosing = true;
    
    this.element?.classList.add('hide');
    
    setTimeout(() => {
      this.element?.remove();
      this.element = null;
      this.onClose?.();
    }, 300);
  }

  private getNPCPortraitPath(npc: any): string {
    if (!npc) return 'art/ui/placeholder_icon.svg';
    
    // Try the defined portrait first
    const portrait = npc.artRefs?.portrait;
    if (portrait) {
      // Remove any leading slashes for relative paths
      return portrait.startsWith('/') ? portrait.substring(1) : portrait;
    }
    
    // Fallback to placeholder
    const npcId = npc.npcId || 'aria';
    return `art/npc/${npcId}/placeholder_portrait.svg`;
  }

  private generateQuestMemory(data: ShiftRewardsData): Memory {
    const pet = getPetById(data.assignedPetId!);
    const petName = pet?.name || 'A pet';
    const questTitle = data.questTitle || 'Quest';
    
    // Generate a fun tagline (max 280 characters)
    const tagline = this.generateMemoryTagline(petName, questTitle, data.questDescription || '');
    
    const memory: Memory = {
      memoryId: `quest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      shiftId: 'quest',
      title: questTitle,
      snippet: tagline,
      extendedStory: tagline, // Can expand this later
      mood: this.getQuestMood(),
      imageUrl: getAssetPath('art/memories_image_placeholder.png'),
      location: data.shift.sectionType,
      taggedNPCs: [data.npcId],
      taggedPets: [data.assignedPetId!],
      generatedAt: Date.now(),
      isPublished: false,
      isFavorite: false,
      viewed: false
    };
    
    return memory;
  }

  private generateMemoryTagline(petName: string, questTitle: string, questDescription: string): string {
    const templates = [
      `${petName} absolutely shined during ${questTitle}! Their dedication and skill made everything run smoothly today.`,
      `What a success! ${petName} tackled ${questTitle} with such enthusiasm. The cafe felt extra special today.`,
      `${petName} was amazing at ${questTitle} today! Their unique talents really made a difference for everyone.`,
      `Today ${petName} showed everyone what they're capable of during ${questTitle}. Simply wonderful!`,
      `${petName}'s hard work on ${questTitle} really paid off! The whole cafe benefited from their special touch.`
    ];
    
    const tagline = templates[Math.floor(Math.random() * templates.length)];
    return tagline.length > 280 ? tagline.substring(0, 277) + '...' : tagline;
  }

  private getQuestMood(): string {
    const moods = ['joyful', 'accomplished', 'satisfied', 'proud', 'content'];
    return moods[Math.floor(Math.random() * moods.length)];
  }

  private saveMemoryToJournal(memory: Memory): void {
    const player = this.gameState.getPlayer();
    if (!player.memories) {
      player.memories = [];
    }
    player.memories.unshift(memory); // Add to beginning
    this.gameState.updatePlayer(player);
    
    // Emit event for journal badge update
    this.eventSystem.emit('memory:created', { memory });
  }

  private createMemorySection(memory: Memory): string {
    return `
      <div class="memory-section">
        <h3>New Memory</h3>
        <div class="memory-card">
          <div class="memory-image">
            <img src="${memory.imageUrl}" alt="${memory.title}" />
            <div class="memory-mood-badge">${memory.mood}</div>
          </div>
          <div class="memory-content">
            <p class="memory-tagline">${memory.snippet}</p>
          </div>
        </div>
      </div>
    `;
  }

  private createCafeProgressSection(data: ShiftRewardsData): string {
    const player = this.gameState.getPlayer();
    const visitorsEarned = Math.floor((data.rewards.coins || 0) / 2);
    const oldVisitors = player.subscribers || 0;
    const newVisitors = oldVisitors + visitorsEarned;
    
    // Calculate player level based on visitors FIRST
    const oldLevel = this.calculatePlayerLevel(oldVisitors);
    const newLevel = this.calculatePlayerLevel(newVisitors);
    
    // Update subscribers (now "Cafe Visitors") and level
    player.subscribers = newVisitors;
    player.profile.cafeLevel = newLevel;
    this.gameState.updatePlayer(player); // Save the update
    
    // Emit event to update UI
    this.eventSystem.emit('player:level_changed', { oldLevel, newLevel });
    const leveledUp = newLevel > oldLevel;
    
    // Get level progress
    const currentLevelThreshold = this.getLevelThreshold(newLevel - 1);
    const nextLevelThreshold = this.getLevelThreshold(newLevel);
    const progressInLevel = newVisitors - currentLevelThreshold;
    const totalLevelProgress = nextLevelThreshold - currentLevelThreshold;
    const percentage = Math.min(100, (progressInLevel / totalLevelProgress) * 100);
    
    let html = '<div class="cafe-progress-section">';
    html += '<h3>Cafe Progress</h3>';
    
    // Visitors earned
    html += `
      <div class="progress-points-earned">
        <span class="progress-icon material-icons icon-visitors">groups</span>
        <span class="progress-text">+${visitorsEarned} Cafe Visitors</span>
      </div>
    `;
    
    // Progress bar
    html += `
      <div class="progress-display">
        <div class="progress-level-info">
          <span>Level ${newLevel}</span>
          <span>${newVisitors}/${nextLevelThreshold}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
    
    // Level up notification with unlock grant
    if (leveledUp) {
      // Grant 1 unlock per level gained
      const levelsGained = newLevel - oldLevel;
      player.availableQuestSlotUnlocks = (player.availableQuestSlotUnlocks || 0) + levelsGained;
      this.gameState.updatePlayer(player); // Save the unlock grant
      
      html += `
        <div class="level-up-badge">
          <span class="material-icons">star</span>
          <span>Level Up! Now Level ${newLevel}</span>
        </div>
        <div class="unlock-hint">
          <span class="material-icons">lock_open</span>
          <span>+${levelsGained} Cafe Task Slot Unlock${levelsGained > 1 ? 's' : ''} Available!</span>
        </div>
      `;
    }
    
    html += '</div>';
    return html;
  }

  private getMaxQuestSlotsForLevel(level: number): number {
    // Level 1 = 2 (start), Level 2 = 3, Level 3 = 4, ..., Level 10+ = 5 (max per section)
    // Total slots across 3 sections: Level 1 = 6, Level 2 = 9, ..., Level 10+ = 15
    return Math.min(5, 1 + level);
  }

  private calculatePlayerLevel(visitors: number): number {
    if (visitors < 150) return 1;
    if (visitors < 250) return 2;
    if (visitors < 500) return 3;
    if (visitors < 1000) return 4;
    // After level 5, require 1000 more subscribers per level
    return 4 + Math.floor((visitors - 1000) / 1000) + 1;
  }

  private getLevelThreshold(level: number): number {
    if (level <= 0) return 0;
    if (level === 1) return 0; // Start at level 1
    if (level === 2) return 150;
    if (level === 3) return 250;
    if (level === 4) return 500;
    if (level === 5) return 1000;
    // After level 5, each level requires 1000 more subscribers
    return 1000 + (level - 5) * 1000;
  }
}
