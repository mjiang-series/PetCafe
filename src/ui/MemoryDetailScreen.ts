import { UnifiedBaseScreen } from './UnifiedBaseScreen';
import { ScreenHeaderConfig } from './components/ScreenHeader';
import { Memory } from '../models';
import { GameState } from '../systems/GameState';
import { EventSystem } from '../systems/EventSystem';
import { getAssetPath } from '../utils/AssetPaths';
import { getNPCById } from '../utils/NPCData';
import { getPetById } from '../utils/petData';

export class MemoryDetailScreen extends UnifiedBaseScreen {
  private memory: Memory | null = null;
  private memories: Memory[] = [];
  private currentIndex: number = 0;

  constructor(id: string, eventSystem: EventSystem, gameState: GameState) {
    super(id, eventSystem, gameState);
  }

  protected getScreenHeaderConfig(): ScreenHeaderConfig | null {
    return {
      title: 'Memory',
      showBackButton: true,
      backTarget: 'journal'
    };
  }

  protected showBottomNav(): boolean {
    return false; // Sub-screen, no bottom nav
  }

  protected createContent(): string {
    return `
      <div class="memory-detail-screen">
        <div class="memory-detail-container">
          <!-- Content will be dynamically generated -->
        </div>
      </div>
    `;
  }

  onShow(data?: any): void {
    if (data?.memoryId) {
      this.loadMemory(data.memoryId);
    }
  }

  onHide(): void {
    // Remove keyboard listener
    document.removeEventListener('keydown', this.handleKeyDown);
  }

  private loadMemory(memoryId: string): void {
    const player = this.gameState.getPlayer();
    this.memories = player.memories || [];
    
    // Find the memory and its index
    const index = this.memories.findIndex(m => m.id === memoryId || m.memoryId === memoryId);
    if (index === -1) {
      this.memory = null;
      this.renderMemory();
      return;
    }
    
    this.currentIndex = index;
    this.memory = this.memories[index];
    
    // Mark as viewed if not already
    if (!this.memory.viewed) {
      this.memory.viewed = true;
      this.gameState.updatePlayer({
        memories: this.memories
      });
      this.eventSystem.emit('memory:viewed', { memoryId });
    }
    
    // Update header
    this.updateHeader();
    
    // Render the memory
    this.renderMemory();
    
    // Setup keyboard navigation
    document.addEventListener('keydown', this.handleKeyDown);
  }

  private renderMemory(): void {
    const container = this.element.querySelector('.memory-detail-container');
    if (!container) {
      console.error('[MemoryDetailScreen] Container not found');
      return;
    }
    console.log('[MemoryDetailScreen] Rendering memory:', this.memory);

    if (!this.memory) {
      container.innerHTML = `
        <div class="memory-not-found">
          <span class="material-icons">error_outline</span>
          <p>Memory not found</p>
          <button class="btn-primary" data-action="back-to-journal">Back to Journal</button>
        </div>
      `;
      return;
    }

    const npcId = this.memory.taggedNPCs?.[0] || this.memory.taggedNpcs?.[0];
    const npc = npcId ? getNPCById(npcId) : null;
    const date = new Date(this.memory.timestamp);
    const dateStr = date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });

    // Get pets
    const petIds = this.memory.taggedPets || this.memory.petIds || [];
    const pets = petIds.map(petId => getPetById(petId)).filter(p => p !== null);

    container.innerHTML = `
      <div class="profile-hero">
        <img src="${getAssetPath(this.memory.imageUrl || 'art/memories_image_placeholder.png')}" alt="Memory" class="profile-image" />
        <span class="memory-mood-badge mood--${this.memory.mood}">${this.memory.mood}</span>
      </div>
      
      <div class="profile-header">
        <div class="memory-datetime">
          <span class="material-icons">event</span>
          <span>${dateStr}</span>
          <span class="time-separator">•</span>
          <span>${timeStr}</span>
        </div>
      </div>

      <div class="profile-story">
        ${this.memory.content ? `
          <div class="story-section memory-moment">
            <h2>The Moment</h2>
            <p class="moment-text">${this.memory.content}</p>
          </div>
        ` : ''}
        
        ${this.memory.extendedStory ? `
          <div class="story-section memory-story">
            <h2>The Story</h2>
            <p>${this.memory.extendedStory}</p>
          </div>
        ` : ''}
      </div>

      <div class="profile-details">
        <div class="detail-card">
          <span class="material-icons">location_on</span>
          <div>
            <h4>Location</h4>
            <p>${this.formatLocation(this.memory.location)}</p>
          </div>
        </div>
        
        <div class="detail-card participants-card">
          <span class="material-icons">group</span>
          <div>
            <h4>With</h4>
            <div class="participants-list">
              ${npc ? `
                <div class="participant">
                  <img src="${getAssetPath(npc.artRefs?.portrait || '')}" alt="${npc.name}" class="participant-portrait" />
                  <span>${npc.name}</span>
                </div>
              ` : ''}
              ${pets.map(pet => `
                <div class="participant">
                  <img src="${getAssetPath(pet.artRefs.portrait || '')}" alt="${pet.name}" class="participant-portrait pet" />
                  <span>${pet.name}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

      <div class="profile-actions">
        <button class="btn ${this.memory.favorited ? 'btn-active' : 'btn-secondary'}" data-action="toggle-favorite">
          <span class="material-icons">${this.memory.favorited ? 'favorite' : 'favorite_border'}</span>
          <span>${this.memory.favorited ? 'Favorited' : 'Favorite'}</span>
        </button>
        
        <button class="btn ${this.memory.isPublished ? 'btn-success' : 'btn-primary'}" data-action="share" ${this.memory.isPublished ? 'disabled' : ''}>
          <span class="material-icons">${this.memory.isPublished ? 'check_circle' : 'share'}</span>
          <span>${this.memory.isPublished ? 'Shared' : 'Share Moment'}</span>
        </button>
      </div>

      <div class="memory-navigation">
        <div class="nav-controls">
          <button class="nav-arrow ${this.currentIndex === 0 ? 'disabled' : ''}" data-action="prev-memory" ${this.currentIndex === 0 ? 'disabled' : ''}>
            <span class="material-icons">chevron_left</span>
          </button>
          <span class="nav-counter">${this.currentIndex + 1} of ${this.memories.length}</span>
          <button class="nav-arrow ${this.currentIndex === this.memories.length - 1 ? 'disabled' : ''}" data-action="next-memory" ${this.currentIndex === this.memories.length - 1 ? 'disabled' : ''}>
            <span class="material-icons">chevron_right</span>
          </button>
        </div>
      </div>
    `;
  }

  protected setupEventListeners(): void {
    super.setupEventListeners();

    // Action buttons
    this.addClickHandler('[data-action="toggle-favorite"]', () => {
      console.log('[MemoryDetailScreen] Favorite button clicked');
      this.toggleFavorite();
    });
    this.addClickHandler('[data-action="share"]', () => {
      console.log('[MemoryDetailScreen] Share button clicked');
      this.shareMemory();
    });
    this.addClickHandler('[data-action="back-to-journal"]', () => {
      this.eventSystem.emit('ui:show_screen', { screenId: 'journal' });
    });

    // Navigation
    this.addClickHandler('[data-action="prev-memory"]', () => this.navigateMemory(-1));
    this.addClickHandler('[data-action="next-memory"]', () => this.navigateMemory(1));
  }

  private updateHeader(): void {
    // Update screen header if needed
    if (this.screenHeader) {
      // Header already shows "Memory" title
    }
  }

  private formatLocation(location: string): string {
    const locationMap: Record<string, string> = {
      'bakery': 'Cozy Bakery',
      'playground': 'Pet Playground', 
      'salon': 'Grooming Salon'
    };
    
    return locationMap[location] || location;
  }

  private toggleFavorite(): void {
    if (!this.memory) return;
    
    console.log('[MemoryDetailScreen] Toggling favorite:', this.memory.favorited, '->', !this.memory.favorited);
    
    this.memory.favorited = !this.memory.favorited;
    this.gameState.updatePlayer({
      memories: this.memories
    });
    
    // Update UI - just update the button instead of re-rendering everything
    this.updateFavoriteButton();
  }
  
  private updateFavoriteButton(): void {
    const btn = this.element.querySelector('[data-action="toggle-favorite"]');
    if (!btn) return;
    
    const icon = btn.querySelector('.material-icons');
    const text = btn.querySelector('span:not(.material-icons)');
    
    if (this.memory?.favorited) {
      btn.className = 'btn btn-active';
      if (icon) icon.textContent = 'favorite';
      if (text) text.textContent = 'Favorited';
    } else {
      btn.className = 'btn btn-secondary';
      if (icon) icon.textContent = 'favorite_border';
      if (text) text.textContent = 'Favorite';
    }
  }

  private shareMemory(): void {
    if (!this.memory || this.memory.isPublished) return;
    
    // Show quick share modal
    this.eventSystem.emit('ui:show_screen', {
      screenId: 'quick-share',
      data: { memoryId: this.memory.id || this.memory.memoryId }
    });
  }

  private navigateMemory(direction: number): void {
    const newIndex = this.currentIndex + direction;
    if (newIndex < 0 || newIndex >= this.memories.length) return;
    
    this.currentIndex = newIndex;
    this.memory = this.memories[newIndex];
    
    // Mark as viewed if not already
    if (!this.memory.viewed) {
      this.memory.viewed = true;
      this.gameState.updatePlayer({
        memories: this.memories
      });
      this.eventSystem.emit('memory:viewed', { memoryId: this.memory.id || this.memory.memoryId });
    }
    
    this.renderMemory();
  }

  private handleKeyDown = (e: KeyboardEvent): void => {
    if (e.key === 'ArrowLeft') {
      this.navigateMemory(-1);
    } else if (e.key === 'ArrowRight') {
      this.navigateMemory(1);
    }
  };
}