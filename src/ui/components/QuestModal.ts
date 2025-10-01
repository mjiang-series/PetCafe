// Quest Modal for selecting pets for map-based quests
import { EventSystem } from '../../systems/EventSystem';
import { GameStateManager } from '../../systems/GameState';
import { Quest } from '../../models/Quest';
import { Pet } from '../../models/Pet';
import { getPetById, getAllPets } from '../../utils/petData';
import { getAssetPath } from '../../utils/assetPaths';

export interface QuestModalData {
  quest: Quest;
  onConfirm: (petId: string) => void;
}

export class QuestModal {
  private eventSystem: EventSystem;
  private gameState: GameStateManager;
  private container: HTMLElement | null = null;
  private selectedPetId: string | null = null;
  private currentQuest: Quest | null = null;
  private onConfirmCallback: ((petId: string) => void) | null = null;

  constructor(eventSystem: EventSystem, gameState: GameStateManager) {
    this.eventSystem = eventSystem;
    this.gameState = gameState;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.eventSystem.on('quest:show_modal', (data: QuestModalData) => {
      this.show(data);
    });
  }

  public show(data: QuestModalData): void {
    this.currentQuest = data.quest;
    this.onConfirmCallback = data.onConfirm;
    this.selectedPetId = null;
    this.render();
  }

  public hide(): void {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    this.selectedPetId = null;
    this.currentQuest = null;
    this.onConfirmCallback = null;
  }

  private render(): void {
    if (!this.currentQuest) return;

    // Remove existing modal
    if (this.container) {
      this.container.remove();
    }

    const quest = this.currentQuest;
    const eligiblePets = this.getEligiblePets(quest.requiredTrait);

    this.container = document.createElement('div');
    this.container.className = 'modal quest-modal';
    this.container.innerHTML = `
      <div class="modal__backdrop"></div>
      <div class="modal__content quest-modal__content">
        <div class="quest-modal__header">
          <h2 class="quest-modal__title">${quest.title}</h2>
          <button class="btn-icon quest-modal__close" id="quest-close">
            <span class="material-icons">close</span>
          </button>
        </div>

        <!-- Quest Description -->
        <div class="quest-modal__section quest-description">
          <p class="quest-description__text">${quest.description}</p>
        </div>

        <!-- Special Trait Requirement -->
        <div class="quest-modal__section quest-requirement">
          <div class="quest-requirement__header">
            <span class="material-icons">star</span>
            <h3>Required Trait</h3>
          </div>
          <div class="quest-requirement__trait">
            <span class="trait-badge">${quest.requiredTrait}</span>
          </div>
          <p class="quest-requirement__subtitle">Only pets with this trait can take on this quest</p>
        </div>

        <!-- Pet Selector -->
        <div class="quest-modal__section quest-pet-selector">
          <div class="quest-section-header">
            <span class="material-icons">pets</span>
            <h3>Select a Pet</h3>
          </div>
          <div class="quest-pets-grid" id="quest-pets-grid">
            ${this.renderPetGrid(eligiblePets)}
          </div>
        </div>

        <!-- Rewards Calculator -->
        <div class="quest-modal__section quest-rewards" id="quest-rewards">
          ${this.renderRewards(quest, null)}
        </div>

        <!-- Confirm Button -->
        <div class="quest-modal__actions">
          <button class="btn btn--primary btn--large" id="quest-confirm-btn" disabled>
            <span class="material-icons">check_circle</span>
            Confirm & Start Quest
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(this.container);
    this.attachEventHandlers();
  }

  private getEligiblePets(requiredTrait: string): Pet[] {
    const player = this.gameState.getPlayer();
    const allPets = getAllPets();
    
    // Filter for owned pets with matching trait
    const eligiblePets = allPets.filter(pet => {
      const isOwned = player.pets.some(pp => pp.petId === pet.petId);
      const hasMatchingTrait = pet.specialTrait === requiredTrait;
      return isOwned && hasMatchingTrait;
    });

    // Sort by rarity (descending) then alphabetically
    return eligiblePets.sort((a, b) => {
      const rarityOrder = { '5-star': 3, '4-star': 2, '3-star': 1 };
      const rarityDiff = rarityOrder[b.rarity] - rarityOrder[a.rarity];
      if (rarityDiff !== 0) return rarityDiff;
      return a.name.localeCompare(b.name);
    });
  }

  private renderPetGrid(pets: Pet[]): string {
    if (pets.length === 0) {
      return `
        <div class="quest-no-pets">
          <span class="material-icons">pets</span>
          <p>No pets with the required trait</p>
          <p class="quest-no-pets__subtitle">Try collecting more pets from the gacha!</p>
        </div>
      `;
    }

    return pets.map(pet => {
      const transparentPortrait = pet.artRefs.transparentPortrait || pet.artRefs.portrait;
      return `
        <div class="quest-pet-card" data-pet-id="${pet.petId}">
          <div class="quest-pet-portrait">
            <img src="${transparentPortrait}" alt="${pet.name}" />
          </div>
          <div class="quest-pet-info">
            <p class="quest-pet-name">${pet.name}</p>
            <div class="quest-pet-rarity rarity-${pet.rarity}">${pet.rarity}</div>
          </div>
        </div>
      `;
    }).join('');
  }

  private renderRewards(quest: Quest, selectedPet: Pet | null): string {
    if (!selectedPet) {
      return `
        <div class="quest-section-header">
          <span class="material-icons">card_giftcard</span>
          <h3>Expected Rewards</h3>
        </div>
        <div class="quest-rewards-placeholder">
          <span class="material-icons">info</span>
          <p>Select a pet to see estimated rewards</p>
        </div>
      `;
    }

    const multiplier = quest.rarityMultipliers[selectedPet.rarity];
    const coins = Math.floor(quest.baseRewards.coins * multiplier);
    const bondXP = Math.floor(quest.baseRewards.npcBondXP * multiplier);
    const tickets = quest.baseRewards.freeGachaCurrency ? 
      Math.floor(quest.baseRewards.freeGachaCurrency * multiplier) : 0;
    
    const duration = quest.duration;
    const minutes = Math.floor(duration / 60000);
    const seconds = Math.floor((duration % 60000) / 1000);
    const timeDisplay = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;

    return `
      <div class="quest-section-header">
        <span class="material-icons">card_giftcard</span>
        <h3>Expected Rewards</h3>
      </div>
      <div class="quest-rewards-info">
        <div class="quest-time-display">
          <span class="material-icons">schedule</span>
          <span class="quest-time-value">${timeDisplay}</span>
        </div>
        <div class="quest-rewards-list">
          <div class="reward-item">
            <span class="material-icons reward-icon">monetization_on</span>
            <span class="reward-value">+${coins} coins</span>
          </div>
          <div class="reward-item">
            <span class="material-icons reward-icon">favorite</span>
            <span class="reward-value">+${bondXP} bond XP</span>
          </div>
          ${tickets > 0 ? `
            <div class="reward-item">
              <span class="material-icons reward-icon">confirmation_number</span>
              <span class="reward-value">+${tickets} ticket${tickets !== 1 ? 's' : ''}</span>
            </div>
          ` : ''}
        </div>
        <div class="quest-rarity-bonus">
          <span class="material-icons">trending_up</span>
          <span>${multiplier}x multiplier (${selectedPet.rarity})</span>
        </div>
      </div>
    `;
  }

  private attachEventHandlers(): void {
    if (!this.container) return;

    // Close button
    const closeBtn = this.container.querySelector('#quest-close');
    closeBtn?.addEventListener('click', () => this.hide());

    // Backdrop click
    const backdrop = this.container.querySelector('.modal__backdrop');
    backdrop?.addEventListener('click', () => this.hide());

    // Pet selection
    const petCards = this.container.querySelectorAll('.quest-pet-card');
    petCards.forEach(card => {
      card.addEventListener('click', () => {
        const petId = card.getAttribute('data-pet-id');
        if (petId) {
          this.selectPet(petId);
        }
      });
    });

    // Confirm button
    const confirmBtn = this.container.querySelector('#quest-confirm-btn');
    confirmBtn?.addEventListener('click', () => this.confirmSelection());
  }

  private selectPet(petId: string): void {
    this.selectedPetId = petId;
    
    // Update UI
    const allCards = this.container?.querySelectorAll('.quest-pet-card');
    allCards?.forEach(card => {
      if (card.getAttribute('data-pet-id') === petId) {
        card.classList.add('selected');
      } else {
        card.classList.remove('selected');
      }
    });

    // Update rewards section
    const pet = getPetById(petId);
    if (pet && this.currentQuest) {
      const rewardsSection = this.container?.querySelector('#quest-rewards');
      if (rewardsSection) {
        rewardsSection.innerHTML = this.renderRewards(this.currentQuest, pet);
      }
    }

    // Enable confirm button
    const confirmBtn = this.container?.querySelector('#quest-confirm-btn') as HTMLButtonElement;
    if (confirmBtn) {
      confirmBtn.disabled = false;
    }
  }

  private confirmSelection(): void {
    if (this.selectedPetId && this.onConfirmCallback) {
      this.onConfirmCallback(this.selectedPetId);
      this.hide();
    }
  }
}

