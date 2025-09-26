// Pet Collection Screen - View all pets and collection progress
import { UnifiedBaseScreen } from './UnifiedBaseScreen';
import { EventSystem } from '../systems/EventSystem';
import { GameStateManager } from '../systems/GameState';
import { GachaSystem } from '../systems/GachaSystem';
import { Pet, PetRarity } from '../models/Pet';
import { getAllPets } from '../utils/petData';
import { getAssetPath, AssetPaths } from '../utils/assetPaths';
import { ScreenHeaderConfig } from './components/ScreenHeader';
import { getNPCById } from '../utils/npcData';

export class PetCollectionScreen extends UnifiedBaseScreen {
  private gachaSystem: GachaSystem;
  private filterNpc: string | 'all' = 'all';

  constructor(id: string, eventSystem: EventSystem, gameState: GameStateManager, gachaSystem: GachaSystem) {
    super(id, eventSystem, gameState);
    this.gachaSystem = gachaSystem;
  }

  protected getScreenHeaderConfig(): ScreenHeaderConfig | null {
    // Main navigation screen - no header needed
    return null;
  }

  protected createContent(): string {
    return `
      <div class="collection-container">
        <div class="collection-header-section">
          <div>
            <h2>My Pets</h2>
            <p class="collection-subtitle">See how each pet strengthens your helper bonds.</p>
          </div>
        </div>

        <div class="collection-filters" id="collection-filters">
          <!-- NPC filters will be rendered here -->
        </div>
      
      <div class="collection-grid">
        <!-- Pets will be rendered here -->
      </div>
    `;
  }

  onShow(): void {
    this.renderNpcFilters();
    this.updateDisplay();
  }

  onHide(): void {
    // Cleanup if needed
  }

  protected override setupEventListeners(): void {
    super.setupEventListeners();
    
    // Filter buttons will be set up dynamically in renderNpcFilters
    
    // Add click handler for pet cards
    this.element.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const petCard = target.closest('.pet-card');
      
      if (petCard) {
        const petId = petCard.getAttribute('data-pet-id');
        if (petId) {
          this.eventSystem.emit('ui:show_screen', {
            screenId: 'pet-profile',
            data: { petId }
          });
        }
      }
    });
  }

  private setFilter(filter: string | 'all'): void {
    this.filterNpc = filter;
    
    // Update button states
    this.element.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-filter') === filter);
    });
    
    this.updateDisplay();
  }

  private renderNpcFilters(): void {
    const filtersContainer = this.element.querySelector('#collection-filters');
    if (!filtersContainer) return;

    // Calculate collection progress for each NPC
    const allPets = this.getAllPets();
    const npcStats: Record<string, { total: number; owned: number }> = {
      aria: { total: 0, owned: 0 },
      kai: { total: 0, owned: 0 },
      elias: { total: 0, owned: 0 }
    };

    allPets.forEach(pet => {
      const npcId = pet.npcAffinity;
      if (npcStats[npcId]) {
        npcStats[npcId].total++;
        if (this.gachaSystem.playerOwnsPet(pet.petId)) {
          npcStats[npcId].owned++;
        }
      }
    });

    const totalOwned = Object.values(npcStats).reduce((sum, stats) => sum + stats.owned, 0);
    const totalPets = Object.values(npcStats).reduce((sum, stats) => sum + stats.total, 0);

    filtersContainer.innerHTML = `
      <button class="filter-btn npc-filter active" data-filter="all">
        <div class="filter-content">
          <span class="filter-label">All</span>
          <span class="filter-progress">${totalOwned}/${totalPets}</span>
        </div>
      </button>
      ${['aria', 'kai', 'elias'].map(npcId => {
        const npc = getNPCById(npcId);
        const stats = npcStats[npcId];
        return `
          <button class="filter-btn npc-filter" data-filter="${npcId}">
            <div class="filter-content">
              <img src="${npc?.artRefs?.portrait ? (npc.artRefs.portrait.startsWith('/') ? npc.artRefs.portrait.substring(1) : npc.artRefs.portrait) : 'art/ui/placeholder_icon.svg'}" alt="${npc?.name}" class="filter-portrait" />
              <span class="filter-label">${npc?.name || npcId}</span>
              <span class="filter-progress">${stats.owned}/${stats.total}</span>
            </div>
          </button>
        `;
      }).join('')}
    `;

    // Add click handlers
    filtersContainer.querySelectorAll('[data-filter]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const filter = (e.currentTarget as HTMLElement).getAttribute('data-filter');
        this.setFilter(filter as string | 'all');
      });
    });
  }

  private updateDisplay(): void {
    const progress = this.gachaSystem.getCollectionProgress();
    const progressText = this.element.querySelector('.progress-text');
    if (progressText) {
      progressText.textContent = `${progress.owned}/${progress.total}`;
    }

    const grid = this.element.querySelector('.collection-grid');
    if (!grid) return;

    // Get all pets
    const allPets = this.getAllPets();
    const filteredPets = this.filterNpc === 'all' 
      ? allPets 
      : allPets.filter(p => p.npcAffinity === this.filterNpc);

    // Sort pets: 1) Collected first, 2) By rarity (descending)
    const sortedPets = filteredPets.sort((a, b) => {
      const aOwned = this.gachaSystem.playerOwnsPet(a.petId);
      const bOwned = this.gachaSystem.playerOwnsPet(b.petId);
      
      // First sort by ownership (owned first)
      if (aOwned !== bOwned) {
        return aOwned ? -1 : 1;
      }
      
      // Then sort by rarity (higher rarity first)
      const rarityOrder = { '5-star': 3, '4-star': 2, '3-star': 1 };
      return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
    });

    // Render pet grid
    grid.innerHTML = sortedPets.map(pet => {
      const owned = this.gachaSystem.playerOwnsPet(pet.petId);
      const dupeCount = this.gachaSystem.getDuplicateCount(pet.petId);
      const npc = getNPCById(pet.npcAffinity);
      
      return `
        <div class="pet-card ${owned ? 'pet-owned' : 'pet-unowned'}" data-pet-id="${pet.petId}">
          <div class="pet-affinity-tag">
            <span class="material-icons icon-sm">favorite</span>
            <span>${npc?.name || 'Helper'} +${this.getAffinityPoints(pet.rarity)}</span>
          </div>
          <div class="pet-portrait">
            ${owned ? 
              `<img src="${pet.artRefs?.portrait ? getAssetPath(pet.artRefs.portrait) : AssetPaths.petPlaceholder()}" alt="${pet.name}" />` :
              `<div class="pet-silhouette">?</div>`
            }
          </div>
          <div class="pet-info">
            <h4 class="pet-name">${owned ? pet.name : '???'}</h4>
            <div class="pet-rarity rarity--${pet.rarity.toLowerCase()}">${pet.rarity}</div>
            ${dupeCount > 0 ? `<div class="dupe-count">×${dupeCount + 1}</div>` : ''}
          </div>
        </div>
      `;
    }).join('');
  }



  private getAffinityPoints(rarity: PetRarity): number {
    switch (rarity) {
      case 'UltraRare':
        return 20;
      case 'Rare':
        return 10;
      default:
        return 5;
    }
  }

  private getCollectionProgress() {
    const allPets = this.getAllPets();
    const ownedPets = this.gameState.getPlayer().pets || [];
    
    return {
      owned: ownedPets.length,
      total: allPets.length
    };
  }

  private getAllPets(): Pet[] {
    // Get pets from gacha system (this would normally come from a master list)
    const threeStars = this.gachaSystem.getPetsByRarity('3-star');
    const fourStars = this.gachaSystem.getPetsByRarity('4-star');
    const fiveStars = this.gachaSystem.getPetsByRarity('5-star');
    
    return [...threeStars, ...fourStars, ...fiveStars];
  }
}
