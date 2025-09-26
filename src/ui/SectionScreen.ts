// Section screen for pet assignment and shift management
import { UnifiedBaseScreen } from './UnifiedBaseScreen';
import { EventSystem } from '../systems/EventSystem';
import { GameStateManager } from '../systems/GameState';
import { ShiftManager } from '../systems/ShiftManager';
import { SectionType, PlayerPet, Shift } from '../models';
import { getPetById } from '../utils/petData';
import { getNPCById } from '../utils/npcData';
import { getAssetPath } from '../utils/assetPaths';
import { ShiftRewardsModal, ShiftRewardsData } from './components/ShiftRewardsModal';
import { ScreenHeaderConfig } from './components/ScreenHeader';

export class SectionScreen extends UnifiedBaseScreen {
  private sectionType: SectionType;
  private shiftManager: ShiftManager;
  private selectedPets: Set<string> = new Set();
  private maxPets: number = 3;
  private lastBondPointsEarned: number = 0;
  private pendingRewards: any = null;

  constructor(
    id: string, 
    eventSystem: EventSystem, 
    gameState: GameStateManager,
    sectionType: SectionType,
    shiftManager: ShiftManager
  ) {
    super(id, eventSystem, gameState);
    console.log('[SectionScreen] Creating with sectionType:', sectionType);
    if (!sectionType) {
      console.error('[SectionScreen] sectionType is undefined!');
    }
    this.sectionType = sectionType;
    this.shiftManager = shiftManager;
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

  protected createContent(): string {
    return `
      <div class="section-profile-container">
        <!-- Hero Section -->
        <div class="section-hero npc-${this.sectionType}" id="helper-spotlight">
          <img class="section-hero-portrait" id="helper-portrait" src="${getAssetPath('art/ui/placeholder_icon.svg')}" alt="${this.getHelperName()}" />
        </div>

        <!-- Header Section -->
        <div class="section-header">
          <h1 class="section-name">${this.getSectionName()}</h1>
        </div>

        <!-- Shift Section -->
        <div class="section-content-block">
          <h2 class="section-title">
            <span class="material-icons">schedule</span>
            Current Shift
          </h2>
          
          <div class="shift-status" id="shift-status">
            <p class="shift-status__message">No active shift</p>
          </div>
          
          <div class="pet-slots" id="pet-slots">
            <h3 class="subsection-title">Assigned Pets</h3>
            <div class="pet-slots__container">
              ${this.createPetSlots()}
            </div>
          </div>

          <div class="shift-controls">
            <button class="btn btn--primary btn--large" id="start-shift-btn" disabled>
              <span class="material-icons">play_arrow</span>
              Start Shift
            </button>
            <button class="btn btn--secondary" id="instant-finish-btn" style="display: none;">
              <span class="material-icons">flash_on</span>
              Instant Finish
            </button>
          </div>
        </div>

        <!-- Available Pets Section -->
        <div class="section-content-block">
          <h2 class="section-title">
            <span class="material-icons">pets</span>
            Available Pets
          </h2>
          <div class="pet-grid" id="available-pets">
            <!-- Pets will be populated here -->
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="section-actions">
          <button class="btn btn--secondary" id="helper-dm-btn">
            <span class="material-icons">chat</span>
            Chat with ${this.getHelperName()}
          </button>
        </div>
      </div>
    `;
  }

  onShow(data?: any): void {
    this.updatePetDisplay();
    this.updateShiftStatus();
    this.checkActiveShift();
    this.updateHelperPortrait();
    
    // Check for pending rewards
    if (this.pendingRewards) {
      this.showRewards(this.pendingRewards);
      this.pendingRewards = null;
    }
  }

  onHide(): void {
    this.selectedPets.clear();
  }

  protected setupEventListeners(): void {
    super.setupEventListeners();

    // Start shift button
    this.addClickHandler('#start-shift-btn', () => {
      this.startShift();
    });

    // Instant finish button
    this.addClickHandler('#instant-finish-btn', () => {
      this.instantFinishShift();
    });


    // Listen for shift updates
    this.eventSystem.on('shift:timer_update', (data) => {
      if (data.sectionType === this.sectionType) {
        this.updateShiftTimer(data.remainingTime, data.progress);
      }
    });

    this.eventSystem.on('shift:completed', (data) => {
      if (data.shift.sectionType === this.sectionType) {
        // Only show rewards if this screen is currently visible
        if (this.isVisible) {
          this.showRewards(data.rewards);
        } else {
          // Store the pending rewards to show when player enters this section
          this.pendingRewards = data.rewards;
        }
      }
    });

    // Listen for bond points earned
    this.eventSystem.on('bond:points_earned', (data) => {
      const section = this.gameState.getCafeSections()
        .find(s => s.sectionType === this.sectionType);
      if (section?.helper?.npcId === data.npcId) {
        this.lastBondPointsEarned = data.points;
      }
    });

    // Listen for bond level changes
    this.eventSystem.on('npc:bond_level_up', (data) => {
      const helper = this.getHelperNpc();
      if (helper && helper.npcId === data.npcId) {
        this.updateBondLevel();
      }
    });

    this.addClickHandler('#helper-dm-btn', () => {
      const helper = this.getHelperNpc();
      if (helper) {
        this.eventSystem.emit('ui:show_screen', { 
          screenId: 'dm', 
          params: { npcId: helper.npcId } 
        });
      } else {
        this.eventSystem.emit('ui:show_screen', { screenId: 'dm-list' });
      }
    });
  }

  private createPetSlots(): string {
    const section = this.gameState.getCafeSections()
      .find(s => s.sectionType === this.sectionType);
    
    this.maxPets = section?.capacity.petSlots || 3;
    
    let slots = '';
    for (let i = 0; i < this.maxPets; i++) {
      slots += `
        <div class="pet-slot" data-slot="${i}">
          <div class="pet-slot__empty">+</div>
        </div>
      `;
    }
    return slots;
  }

  private updatePetDisplay(): void {
    const player = this.gameState.getPlayer();
    const availablePetsContainer = this.element.querySelector('#available-pets');
    
    if (!availablePetsContainer) return;

    // Get pets that aren't currently in shifts
    const activeShifts = this.gameState.getActiveShifts();
    const assignedPetIds = new Set(
      activeShifts.flatMap(shift => shift.assignedPets)
    );

    const availablePets = player.pets.filter(pet => 
      !assignedPetIds.has(pet.petId) && !this.selectedPets.has(pet.petId)
    );

    availablePetsContainer.innerHTML = availablePets.map(pet => {
      const fullPetData = getPetById(pet.petId);
      const portrait = fullPetData?.artRefs.portrait ? getAssetPath(fullPetData.artRefs.portrait) : getAssetPath('art/pets/placeholder_pet.svg');
      const petName = fullPetData?.name || pet.petId;
      
      const rarity = fullPetData?.rarity || '3-star';
      const npcAffinity = fullPetData?.npcAffinity || '';
      const npcName = this.getNpcName(npcAffinity);
      
      return `
        <div class="pet-card ${this.selectedPets.has(pet.petId) ? 'selected' : ''}" 
             data-pet-id="${pet.petId}"
             draggable="true">
          ${npcName ? `<div class="pet-affinity-tag">${npcName}</div>` : ''}
          <div class="pet-portrait">
            <img src="${portrait}" alt="${petName}" />
          </div>
          <div class="pet-info">
            <h4 class="pet-name">${petName}</h4>
            <div class="pet-rarity rarity--${rarity.toLowerCase()}">${rarity}</div>
          </div>
        </div>
      `;
    }).join('');

    // Add drag and drop handlers
    this.setupDragAndDrop();
  }

  private setupDragAndDrop(): void {
    // Drag handlers for pets
    const petCards = this.element.querySelectorAll('.pet-card');
    petCards.forEach(card => {
      card.addEventListener('click', (e) => {
        const petId = (e.currentTarget as HTMLElement).getAttribute('data-pet-id');
        if (petId) {
          this.togglePetSelection(petId);
        }
      });

      card.addEventListener('dragstart', (e) => {
        const petId = (e.currentTarget as HTMLElement).getAttribute('data-pet-id');
        if (petId) {
          (e as DragEvent).dataTransfer!.setData('petId', petId);
        }
      });
    });

    // Drop handlers for slots
    const petSlots = this.element.querySelectorAll('.pet-slot');
    petSlots.forEach(slot => {
      slot.addEventListener('dragover', (e) => {
        e.preventDefault();
        slot.classList.add('pet-slot--drag-over');
      });

      slot.addEventListener('dragleave', () => {
        slot.classList.remove('pet-slot--drag-over');
      });

      slot.addEventListener('drop', (e) => {
        e.preventDefault();
        slot.classList.remove('pet-slot--drag-over');
        
        const petId = (e as DragEvent).dataTransfer!.getData('petId');
        const slotIndex = parseInt(slot.getAttribute('data-slot') || '0');
        
        if (petId) {
          this.assignPetToSlot(petId, slotIndex);
        }
      });
    });
  }

  private togglePetSelection(petId: string): void {
    if (this.selectedPets.has(petId)) {
      this.selectedPets.delete(petId);
    } else if (this.selectedPets.size < this.maxPets) {
      this.selectedPets.add(petId);
    }

    this.updateSelectedPetsDisplay();
    this.updateStartButton();
  }

  private assignPetToSlot(petId: string, slotIndex: number): void {
    if (this.selectedPets.size >= this.maxPets) return;
    
    this.selectedPets.add(petId);
    this.updateSelectedPetsDisplay();
    this.updateStartButton();
  }

  private updateSelectedPetsDisplay(): void {
    const slotsContainer = this.element.querySelector('.pet-slots__container');
    if (!slotsContainer) return;

    const selectedArray = Array.from(this.selectedPets);
    const slots = slotsContainer.querySelectorAll('.pet-slot');

    slots.forEach((slot, index) => {
      if (index < selectedArray.length) {
        const petId = selectedArray[index];
        const fullPetData = getPetById(petId);
        const portrait = fullPetData?.artRefs.portrait ? getAssetPath(fullPetData.artRefs.portrait) : getAssetPath('art/pets/placeholder_pet.svg');
        const petName = fullPetData?.name || petId;
        
        slot.innerHTML = `
          <div class="pet-slot__filled">
            <img src="${portrait}" alt="${petName}" />
            <span class="pet-slot__name">${petName}</span>
            <button class="pet-slot__remove" data-pet-id="${petId}">×</button>
          </div>
        `;

        // Add remove handler
        const removeBtn = slot.querySelector('.pet-slot__remove');
        removeBtn?.addEventListener('click', (e) => {
          e.stopPropagation();
          const petId = (e.currentTarget as HTMLElement).getAttribute('data-pet-id');
          if (petId) {
            this.selectedPets.delete(petId);
            this.updateSelectedPetsDisplay();
            this.updatePetDisplay();
            this.updateStartButton();
          }
        });
      } else {
        slot.innerHTML = '<div class="pet-slot__empty">+</div>';
      }
    });

    // Update available pets display
    this.updatePetDisplay();
  }

  private updateStartButton(): void {
    const startBtn = this.element.querySelector('#start-shift-btn') as HTMLButtonElement;
    if (startBtn) {
      startBtn.disabled = this.selectedPets.size === 0;
    }
  }

  private startShift(): void {
    if (this.selectedPets.size === 0) return;

    const petIds = Array.from(this.selectedPets);
    const shiftId = this.shiftManager.startShift(this.sectionType, petIds);

    if (shiftId) {
      this.selectedPets.clear();
      this.updateShiftStatus();
      this.updatePetDisplay();
      this.updateSelectedPetsDisplay();
    }
  }

  private checkActiveShift(): void {
    const section = this.gameState.getCafeSections()
      .find(s => s.sectionType === this.sectionType);
    
    if (section?.currentShift && section.currentShift.status === 'running') {
      this.showActiveShift(section.currentShift);
    }
  }

  private updateShiftStatus(): void {
    const section = this.gameState.getCafeSections()
      .find(s => s.sectionType === this.sectionType);
    
    const statusElement = this.element.querySelector('#shift-status');
    const startBtn = this.element.querySelector('#start-shift-btn') as HTMLButtonElement;
    const instantFinishBtn = this.element.querySelector('#instant-finish-btn') as HTMLButtonElement;
    const petSlotsArea = this.element.querySelector('.pet-slots') as HTMLElement;

    if (!statusElement) return;

    if (section?.currentShift && section.currentShift.status === 'running') {
      // Active shift
      const remainingTime = this.shiftManager.getRemainingTime(section.currentShift.shiftId);
      
      const circumference = 2 * Math.PI * 45; // radius = 45
      const elapsedTime = section.currentShift.duration - remainingTime;
      const accruedRewards = this.calculateAccruedRewards(section.currentShift, elapsedTime);
      
      statusElement.innerHTML = `
        <div class="shift-timer">
          <div class="shift-timer__circle">
            <svg viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" class="shift-timer__track" />
              <circle cx="50" cy="50" r="45" class="shift-timer__progress" 
                      style="stroke-dasharray: ${circumference}; stroke-dashoffset: ${circumference}" />
            </svg>
            <div class="shift-timer__time" id="timer-display">
              ${this.formatTime(remainingTime)}
            </div>
          </div>
          <p>Shift in progress...</p>
          <div class="shift-accrued-rewards">
            <div class="accrued-reward">
              <span class="material-icons icon-sm icon-gold">paid</span>
              <span class="accrued-amount" id="accrued-coins">${accruedRewards.coins}</span>
            </div>
            <div class="accrued-reward">
              <span class="material-icons icon-sm">favorite</span>
              <span class="accrued-amount" id="accrued-xp">${accruedRewards.xp}</span>
            </div>
            <div class="accrued-reward">
              <span class="material-icons icon-sm">photo_camera</span>
              <span class="accrued-status" id="memory-status">${accruedRewards.memoryReady ? '✓' : '...'}</span>
            </div>
          </div>
        </div>
      `;

      startBtn.style.display = 'none';
      instantFinishBtn.style.display = 'inline-flex';
      petSlotsArea.style.opacity = '0.5';
      petSlotsArea.style.pointerEvents = 'none';
    } else {
      // No active shift
      statusElement.innerHTML = '<p class="shift-status__message">No active shift</p>';
      startBtn.style.display = 'inline-flex';
      instantFinishBtn.style.display = 'none';
      petSlotsArea.style.opacity = '1';
      petSlotsArea.style.pointerEvents = 'auto';
    }
  }

  private showActiveShift(shift: any): void {
    // Update selected pets display to show assigned pets
    const slotsContainer = this.element.querySelector('.pet-slots__container');
    if (!slotsContainer) return;

    const slots = slotsContainer.querySelectorAll('.pet-slot');
    shift.assignedPets.forEach((petId: string, index: number) => {
      if (slots[index]) {
        const fullPetData = getPetById(petId);
        const portrait = fullPetData?.artRefs.portrait ? getAssetPath(fullPetData.artRefs.portrait) : getAssetPath('art/pets/placeholder_pet.svg');
        const petName = fullPetData?.name || petId;
        
        slots[index].innerHTML = `
          <div class="pet-slot__filled pet-slot__locked">
            <img src="${portrait}" alt="${petName}" />
            <span class="pet-slot__name">${petName}</span>
          </div>
        `;
      }
    });
  }

  private updateShiftTimer(remainingTime: number, progress: number): void {
    const timerDisplay = this.element.querySelector('#timer-display');
    const progressCircle = this.element.querySelector('.shift-timer__progress') as SVGCircleElement;

    if (timerDisplay) {
      timerDisplay.textContent = this.formatTime(remainingTime);
    }

    if (progressCircle) {
      const circumference = 2 * Math.PI * 45; // radius = 45
      const offset = circumference * (1 - progress);
      
      // Ensure stroke-dasharray is set
      if (!progressCircle.style.strokeDasharray) {
        progressCircle.style.strokeDasharray = circumference.toString();
      }
      
      progressCircle.style.strokeDashoffset = offset.toString();
    }

    // Update accrued rewards
    const section = this.gameState.getCafeSections()
      .find(s => s.sectionType === this.sectionType);
    if (section?.currentShift) {
      const elapsedTime = section.currentShift.duration - remainingTime;
      const accruedRewards = this.calculateAccruedRewards(section.currentShift, elapsedTime);
      
      const coinsElement = this.element.querySelector('#accrued-coins');
      const xpElement = this.element.querySelector('#accrued-xp');
      const memoryElement = this.element.querySelector('#memory-status');
      
      if (coinsElement) coinsElement.textContent = accruedRewards.coins.toString();
      if (xpElement) xpElement.textContent = accruedRewards.xp.toString();
      if (memoryElement) memoryElement.textContent = accruedRewards.memoryReady ? '✓' : '...';
    }
  }

  private formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }

  private instantFinishShift(): void {
    const section = this.gameState.getCafeSections()
      .find(s => s.sectionType === this.sectionType);
    
    if (section?.currentShift) {
      // completeShift will emit 'shift:completed' event which triggers showRewards
      this.shiftManager.completeShift(section.currentShift.shiftId, true);
    }
  }

  private showRewards(rewards: any): void {
    // Get the shift data for the modal
    const section = this.gameState.getCafeSections()
      .find(s => s.sectionType === this.sectionType);
    
    if (!section || !section.helper) return;
    
    // Use the bond points from the event or fall back to helperXP
    const bondPointsEarned = this.lastBondPointsEarned || rewards.helperXP || 0;
    
    // Check if there was a level up
    const bond = this.gameState.getPlayer().npcBonds.find(b => b.npcId === section.helper.npcId);
    const oldLevel = bond ? Math.floor((bond.bondPoints - bondPointsEarned) / bond.maxBondPoints) + 1 : 1;
    const newLevel = bond?.bondLevel;
    
    const rewardsData: ShiftRewardsData = {
      shift: { sectionType: this.sectionType },
      rewards,
      npcId: section.helper.npcId,
      bondPointsEarned,
      newBondLevel: newLevel && newLevel > oldLevel ? newLevel : undefined
    };
    
    // Show the new modal
    const modal = new ShiftRewardsModal(this.eventSystem, this.gameState);
    modal.show(rewardsData, () => {
      // Update shift status after modal closes
      this.updateShiftStatus();
    });
  }


  private getSectionDisplayName(): string {
    const names: Record<SectionType, string> = {
      'bakery': 'Bakery',
      'playground': 'Playground',
      'salon': 'Styling Salon'
    };
    return names[this.sectionType] || this.sectionType;
  }

  private calculateAccruedRewards(shift: Shift, elapsedTime: number): { coins: number, xp: number, memoryReady: boolean } {
    const progress = elapsedTime / shift.duration;
    const baseCoins = 30; // Base reward
    const baseXp = 50;
    
    // Calculate proportional rewards based on progress
    const coins = Math.floor(baseCoins * progress);
    const xp = Math.floor(baseXp * progress);
    
    // Memory is ready after 50% progress
    const memoryReady = progress >= 0.5;
    
    return { coins, xp, memoryReady };
  }

  private updateHelperPortrait(): void {
    const helper = this.getHelperNpc();
    if (!helper) return;

    const portraitEl = this.element.querySelector('#helper-portrait') as HTMLImageElement;
    if (portraitEl) {
      const portrait = helper.artRefs?.portrait || 'art/ui/placeholder_icon.svg';
      portraitEl.src = getAssetPath(portrait);
    }
  }

  private updateHelperSpotlight(player: any): void {
    // Deprecated - kept for compatibility
  }

  private getHelperHighlight(player: any, npcId: string): string | null {
    const recentMemory = (player.memories || []).slice().reverse().find((memory: any) => memory.taggedNpcs?.includes(npcId));
    if (recentMemory) {
      return `Shared memory: ${recentMemory.location} (+${recentMemory.bondPointsAwarded || 0} bond)`;
    }

    const recentPet = player.recentPetAcquisitions?.find((entry: any) => entry.npcId === npcId);
    if (recentPet) {
      return `New pet ${recentPet.petId} is boosting their mood!`;
    }

    return null;
  }

  private getHelperNpc() {
    const section = this.gameState.getCafeSections().find(s => s.sectionType === this.sectionType);
    if (!section?.helper?.npcId) return null;
    return this.gameState.getNpcConfig?.(section.helper.npcId);
  }

  private getHelperName(): string {
    const helper = this.getHelperNpc();
    return helper?.name || 'Helper';
  }

  private getSectionName(): string {
    switch (this.sectionType) {
      case 'aria':
        return 'Bakery';
      case 'kai':
        return 'Playground';
      case 'elias':
        return 'Salon';
      default:
        return `${this.sectionType.charAt(0).toUpperCase() + this.sectionType.slice(1)} Section`;
    }
  }
  
  private getNpcName(npcId: string): string {
    const npc = getNPCById(npcId);
    return npc?.name || '';
  }

  private updateBondLevel(): void {
    const helper = this.getHelperNpc();
    if (helper) {
      const playerState = this.gameState.getPlayer();
      const bond = playerState.npcBonds.find(b => b.npcId === helper.npcId);
      const bondLevel = bond?.bondLevel || 1;
      
      const bondLevelDisplay = document.getElementById('bond-level-display');
      if (bondLevelDisplay) {
        bondLevelDisplay.textContent = `Bond Level ${bondLevel}`;
      }
    }
  }
}
