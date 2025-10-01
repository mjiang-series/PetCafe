// Interactive map-based section screen for quest assignment
import { UnifiedBaseScreen } from './UnifiedBaseScreen';
import { EventSystem } from '../systems/EventSystem';
import { GameStateManager } from '../systems/GameState';
import { SectionType, Pet } from '../models';
import { Quest, ActiveQuest } from '../models/Quest';
import { getQuestsBySectionType } from '../data/quests';
import { getPetById } from '../utils/petData';
import { getNPCById } from '../utils/npcData';
import { getAssetPath } from '../utils/assetPaths';
import { ScreenHeaderConfig } from './components/ScreenHeader';
import { ShiftRewardsModal, ShiftRewardsData } from './components/ShiftRewardsModal';

interface MapQuestState {
  quest: Quest;
  activeQuest: ActiveQuest | null;
  element: HTMLElement | null;
}

export class MapSectionScreen extends UnifiedBaseScreen {
  private sectionType: SectionType;
  private quests: Quest[] = [];
  private questStates: Map<string, MapQuestState> = new Map();
  private updateInterval: number | null = null;

  constructor(
    id: string,
    eventSystem: EventSystem,
    gameState: GameStateManager,
    sectionType: SectionType
  ) {
    super(id, eventSystem, gameState);
    this.sectionType = sectionType;
    this.quests = getQuestsBySectionType(sectionType);
    
    // Initialize quest states
    this.quests.forEach(quest => {
      this.questStates.set(quest.questId, {
        quest,
        activeQuest: null,
        element: null
      });
    });
  }

  protected getScreenHeaderConfig(): ScreenHeaderConfig | null {
    return {
      title: this.getSectionDisplayName(),
      showBackButton: true,
      backTarget: 'cafe-overview'
    };
  }

  protected showBottomNav(): boolean {
    return false; // Sub-screen, hide bottom nav
  }

  private getSectionDisplayName(): string {
    const names: Record<SectionType, string> = {
      'bakery': 'Bakery',
      'playground': 'Playground',
      'salon': 'Salon'
    };
    return names[this.sectionType] || 'Cafe Section';
  }

  private getHelperName(): string {
    const helpers: Record<SectionType, string> = {
      'bakery': 'Aria',
      'playground': 'Kai',
      'salon': 'Elias'
    };
    return helpers[this.sectionType] || 'Helper';
  }

  private getMapAsset(): string {
    const maps: Record<SectionType, string> = {
      'bakery': 'art/scenes/bakery_map_placeholder.png',
      'playground': 'art/scenes/playground_placeholder.png',
      'salon': 'art/scenes/salon_placeholder.png'
    };
    return getAssetPath(maps[this.sectionType] || 'art/scenes/default.svg');
  }

  protected createContent(): string {
    const mapAsset = this.getMapAsset();
    
    return `
      <div class="map-section-container">
        <!-- Interactive Map -->
        <div class="map-section-hero">
          <div class="map-container" id="map-container">
            <img src="${mapAsset}" alt="${this.getSectionDisplayName()} Map" class="map-background" />
            
            <!-- Quest markers will be rendered here -->
            <div class="quest-markers" id="quest-markers">
              ${this.renderQuestMarkers()}
            </div>
          </div>
        </div>

        <!-- Section Info -->
        <div class="map-section-info">
          <h2 class="section-subtitle">
            <span class="material-icons">info</span>
            Tap a + to assign a pet to a task for the cafe.
          </h2>
          <p class="section-helper-text">
            Managed by <strong>${this.getHelperName()}</strong>
          </p>
        </div>

        <!-- Stats Section -->
        <div class="map-section-stats" id="map-stats">
          ${this.renderStats()}
        </div>
      </div>
    `;
  }

  private renderQuestMarkers(): string {
    const player = this.gameState.getPlayer();
    const unlockedSlots = player.unlockedQuestSlots?.[this.sectionType] || 2;
    
    return this.quests.map((quest, index) => {
      const isLocked = index >= unlockedSlots;
      
      return `
        <div class="quest-marker ${isLocked ? 'quest-marker--locked' : ''}" 
             id="quest-marker-${quest.questId}"
             data-quest-id="${quest.questId}"
             data-slot-index="${index}"
             style="left: ${quest.position.x}%; top: ${quest.position.y}%;">
          <button class="quest-add-btn">
            <span class="material-icons">${isLocked ? 'lock' : 'add'}</span>
          </button>
        </div>
      `;
    }).join('');
  }

  private renderStats(): string {
    const player = this.gameState.getPlayer();
    const unlockedSlots = player.unlockedQuestSlots?.[this.sectionType] || 2;
    
    const activeCount = Array.from(this.questStates.values())
      .filter(s => s.activeQuest?.status === 'active').length;
    const completeCount = Array.from(this.questStates.values())
      .filter(s => s.activeQuest?.status === 'complete').length;

    return `
      <div class="stats-grid">
        <div class="stat-item">
          <span class="material-icons">schedule</span>
          <div class="stat-content">
            <span class="stat-label">Active Quests</span>
            <span class="stat-value">${activeCount}/${unlockedSlots}</span>
          </div>
        </div>
        <div class="stat-item">
          <span class="material-icons">check_circle</span>
          <div class="stat-content">
            <span class="stat-label">Ready to Collect</span>
            <span class="stat-value">${completeCount}</span>
          </div>
        </div>
      </div>
    `;
  }

  protected setupEventListeners(): void {
    super.setupEventListeners();
    // Quest marker event listeners will be set up in setupQuestMarkerListeners()
    // which is called from onShow() after the DOM is ready
  }

  private setupQuestMarkerListeners(): void {
    // Quest marker clicks
    const markers = this.element?.querySelectorAll('.quest-marker');
    const player = this.gameState.getPlayer();
    const unlockedSlots = player.unlockedQuestSlots?.[this.sectionType] || 2;
    
    markers?.forEach((marker, index) => {
      const questId = marker.getAttribute('data-quest-id');
      const slotIndex = parseInt(marker.getAttribute('data-slot-index') || '0');
      const isLocked = slotIndex >= unlockedSlots;
      
      if (!questId) return;

      const questState = this.questStates.get(questId);
      if (!questState) return;

      const addBtn = marker.querySelector('.quest-add-btn');
      
      addBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        
        // Handle locked slots - show level up message
        if (isLocked) {
          this.showLockedQuestDialog();
          return;
        }
        
        if (questState.activeQuest?.status === 'complete') {
          this.collectQuestRewards(questId);
        } else if (!questState.activeQuest) {
          this.showQuestModal(questState.quest);
        }
      });
    });
  }

  private showLockedQuestDialog(): void {
    const modal = document.createElement('div');
    modal.className = 'confirmation-modal show';
    modal.innerHTML = `
      <div class="modal__backdrop"></div>
      <div class="modal__content confirmation-modal__content">
        <h3 class="confirmation-title">Quest Slot Locked</h3>
        <div class="confirmation-body">
          <div class="unlock-visual">
            <span class="material-icons unlock-icon">lock</span>
          </div>
          <p class="confirmation-message">
            Level up your cafe by completing tasks to unlock more quest slots!
          </p>
          <p class="unlock-hint">
            Complete more tasks with your pets to bring in more cafe visitors and level up.
          </p>
        </div>
        <div class="confirmation-actions">
          <button class="btn btn--primary" id="locked-ok">Got it!</button>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Handle OK
    const okHandler = () => modal.remove();
    modal.querySelector('#locked-ok')?.addEventListener('click', okHandler);
    modal.querySelector('.modal__backdrop')?.addEventListener('click', okHandler);
  }

  private refreshQuestMarkers(): void {
    const questMarkersContainer = this.element?.querySelector('.quest-markers');
    if (questMarkersContainer) {
      questMarkersContainer.innerHTML = this.renderQuestMarkers();
      this.setupQuestMarkerListeners();
      
      // Update all quest marker states
      this.questStates.forEach((_, questId) => {
        this.updateQuestMarker(questId);
      });
    }
  }

  private showQuestModal(quest: Quest): void {
    this.eventSystem.emit('quest:show_modal', {
      quest,
      onConfirm: (petId: string) => this.startQuest(quest.questId, petId)
    });
  }

  private startQuest(questId: string, petId: string): void {
    const questState = this.questStates.get(questId);
    if (!questState || questState.activeQuest) return;

    const quest = questState.quest;
    const pet = getPetById(petId);
    if (!pet) return;

    // Calculate rewards based on pet rarity
    const multiplier = quest.rarityMultipliers[pet.rarity];
    const coins = Math.floor(quest.baseRewards.coins * multiplier);
    const bondXP = Math.floor(quest.baseRewards.npcBondXP * multiplier);
    const tickets = quest.baseRewards.freeGachaCurrency ? 
      Math.floor(quest.baseRewards.freeGachaCurrency * multiplier) : 0;

    const now = Date.now();
    const activeQuest: ActiveQuest = {
      questId,
      assignedPetId: petId,
      startedAt: now,
      completesAt: now + quest.duration,
      status: 'active',
      rewards: {
        coins,
        npcBondXP: bondXP,
        freeGachaCurrency: tickets > 0 ? tickets : undefined
      }
    };

    questState.activeQuest = activeQuest;
    this.saveQuestStates(); // Persist quest state
    this.updateQuestMarker(questId);
    this.updateStats();
    
    // Start the update loop if not already running
    if (!this.updateInterval) {
      this.startUpdateLoop();
    }
  }

  private updateQuestMarker(questId: string): void {
    const questState = this.questStates.get(questId);
    if (!questState) return;

    const marker = this.element?.querySelector(`#quest-marker-${questId}`);
    if (!marker) return;

    // Check if this slot is locked
    const slotIndex = parseInt(marker.getAttribute('data-slot-index') || '0');
    const player = this.gameState.getPlayer();
    const unlockedSlots = player.unlockedQuestSlots?.[this.sectionType] || 2;
    const isLocked = slotIndex >= unlockedSlots;

    // Don't update locked markers (they stay locked)
    if (isLocked) {
      return;
    }

    const activeQuest = questState.activeQuest;

    if (!activeQuest) {
      // Show + button (only for unlocked slots)
      marker.innerHTML = `
        <button class="quest-add-btn">
          <span class="material-icons">add</span>
        </button>
      `;
    } else {
      const pet = getPetById(activeQuest.assignedPetId);
      if (!pet) return;

      const transparentPortrait = pet.artRefs.transparentPortrait || pet.artRefs.portrait;
      const timeRemaining = this.getTimeRemaining(activeQuest);
      const isComplete = activeQuest.status === 'complete';

      marker.innerHTML = `
        <div class="quest-pet-marker ${isComplete ? 'complete' : 'active'}">
          <img src="${transparentPortrait}" alt="${pet.name}" class="quest-pet-image" />
          ${isComplete ? `
            <div class="quest-complete-badge">
              <span class="material-icons">check_circle</span>
            </div>
          ` : `
            <div class="quest-timer">${timeRemaining}</div>
          `}
        </div>
      `;
    }

    // Re-attach event listener
    const addBtn = marker.querySelector('.quest-add-btn, .quest-pet-marker');
    addBtn?.addEventListener('click', () => {
      if (activeQuest?.status === 'complete') {
        this.collectQuestRewards(questId);
      } else if (!activeQuest) {
        this.showQuestModal(questState.quest);
      }
    });
  }

  private getTimeRemaining(activeQuest: ActiveQuest): string {
    const now = Date.now();
    const remaining = Math.max(0, activeQuest.completesAt - now);
    
    const minutes = Math.floor(remaining / 60000);
    const seconds = Math.floor((remaining % 60000) / 1000);
    
    if (minutes > 0) {
      return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  }

  private startUpdateLoop(): void {
    this.updateInterval = window.setInterval(() => {
      let hasActiveQuests = false;
      
      this.questStates.forEach((questState, questId) => {
        if (questState.activeQuest && questState.activeQuest.status === 'active') {
          hasActiveQuests = true;
          
          // Check if quest is complete
          if (Date.now() >= questState.activeQuest.completesAt) {
            questState.activeQuest.status = 'complete';
            this.saveQuestStates(); // Persist completion
            this.updateQuestMarker(questId);
            this.updateStats();
            
            // Play completion notification
            this.eventSystem.emit('game:notification', {
              type: 'success',
              message: `Quest "${questState.quest.title}" is complete!`
            });
          } else {
            // Update timer display
            this.updateQuestMarker(questId);
          }
        }
      });

      // Stop update loop if no active quests
      if (!hasActiveQuests) {
        this.stopUpdateLoop();
      }
    }, 1000); // Update every second
  }

  private stopUpdateLoop(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  private collectQuestRewards(questId: string): void {
    const questState = this.questStates.get(questId);
    if (!questState || !questState.activeQuest || questState.activeQuest.status !== 'complete') {
      return;
    }

    const rewards = questState.activeQuest.rewards;
    const player = this.gameState.getPlayer();

    // Track quest completion
    if (!player.statistics.totalQuestsCompleted) {
      player.statistics.totalQuestsCompleted = 0;
    }
    player.statistics.totalQuestsCompleted++;

    // Check if this is the 5th quest - award bonus ticket
    const questCount = player.statistics.totalQuestsCompleted;
    const bonusTicket = (questCount % 5 === 0) ? 1 : 0;

    // Award rewards
    player.currencies.coins += rewards.coins;
    if (rewards.freeGachaCurrency) {
      player.currencies.freeGachaCurrency += rewards.freeGachaCurrency;
    }
    if (bonusTicket > 0) {
      player.currencies.freeGachaCurrency += bonusTicket;
    }

    // Award NPC bond XP
    const npcId = this.getSectionNPCId();
    const npcBonds = player.npcBonds || [];
    const bondIndex = npcBonds.findIndex(b => b.npcId === npcId);
    if (bondIndex >= 0) {
      npcBonds[bondIndex].bondPoints = (npcBonds[bondIndex].bondPoints || 0) + rewards.npcBondXP;
    }

    // Update player
    this.gameState.updatePlayer(player);

    // Show rewards modal with bonus ticket if applicable
    const rewardsData: ShiftRewardsData = {
      shift: { sectionType: this.sectionType },
      rewards: {
        coins: rewards.coins,
        npcBondXP: rewards.npcBondXP,
        freeGachaCurrency: (rewards.freeGachaCurrency || 0) + bonusTicket
      },
      npcId: this.getSectionNPCId(),
      bondPointsEarned: rewards.npcBondXP,
      questTitle: questState.quest.title,
      questDescription: questState.quest.description,
      assignedPetId: questState.activeQuest.assignedPetId
    };
    
    const modal = new ShiftRewardsModal(this.eventSystem, this.gameState);
    modal.show(rewardsData, () => {
      // Clear quest after modal closes
      questState.activeQuest = null;
      this.saveQuestStates(); // Persist quest state
      this.updateQuestMarker(questId);
      this.updateStats();
      // Force header update
      this.eventSystem.emit('player:currencies_updated', {});
    });
  }

  private getSectionNPCId(): string {
    const npcIds: Record<SectionType, string> = {
      'bakery': 'aria',
      'playground': 'kai',
      'salon': 'elias'
    };
    return npcIds[this.sectionType] || 'aria';
  }

  private updateStats(): void {
    const statsContainer = this.element?.querySelector('#map-stats');
    if (statsContainer) {
      statsContainer.innerHTML = this.renderStats();
    }
  }

  onShow(data?: any): void {
    super.onShow(data);
    
    // Load saved quest states from player data
    this.loadQuestStates();
    
    // Set up quest marker event listeners (after DOM is ready)
    this.setupQuestMarkerListeners();
    
    // Show tutorial on first cafe section visit
    this.eventSystem.emit('tutorial:show', {
      tutorialId: 'tutorial_first_cafe_section',
      title: "Pets help bring visitors!",
      message: "Complete tasks with pets so you can grow your cafe."
    });
    
    // Check and update all quest markers
    this.questStates.forEach((_, questId) => {
      this.updateQuestMarker(questId);
    });
    
    this.updateStats();
    
    // Start update loop if there are active quests
    const hasActiveQuests = Array.from(this.questStates.values())
      .some(s => s.activeQuest?.status === 'active');
    
    if (hasActiveQuests) {
      this.startUpdateLoop();
    }
  }

  private loadQuestStates(): void {
    const player = this.gameState.getPlayer();
    if (!player.activeQuests) {
      player.activeQuests = {};
    }

    // Load any saved active quests for this section
    this.questStates.forEach((questState, questId) => {
      const savedQuest = player.activeQuests![questId];
      if (savedQuest) {
        questState.activeQuest = savedQuest;
      }
    });
  }

  private saveQuestStates(): void {
    const player = this.gameState.getPlayer();
    if (!player.activeQuests) {
      player.activeQuests = {};
    }

    // Save all active quests
    this.questStates.forEach((questState, questId) => {
      if (questState.activeQuest) {
        player.activeQuests![questId] = questState.activeQuest;
      } else {
        delete player.activeQuests![questId];
      }
    });

    this.gameState.updatePlayer(player);
  }

  onHide(): void {
    super.onHide();
    this.stopUpdateLoop();
  }
}

