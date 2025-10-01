import { UnifiedBaseScreen } from './UnifiedBaseScreen';
import { EventSystem } from '../systems/EventSystem';
import { GameStateManager } from '../systems/GameState';
import { GachaSystem } from '../systems/GachaSystem';
import { Pet } from '../models/Pet';
import { ScreenHeaderConfig } from './components/ScreenHeader';
import { getNPCById } from '../utils/npcData';
import { getAssetPath } from '../utils/assetPaths';

export class PetProfileScreen extends UnifiedBaseScreen {
  private pet: Pet | null = null;
  private gachaSystem: GachaSystem;
  private isGachaReveal: boolean = false;
  private gachaResultIndex: number = 0;
  private gachaTotalResults: number = 0;

  constructor(id: string, eventSystem: EventSystem, gameState: GameStateManager, gachaSystem: GachaSystem) {
    super(id, eventSystem, gameState);
    this.gachaSystem = gachaSystem;
  }
  
  show(data?: any): void {
    // Check if this is a gacha reveal before calling super.show()
    if (data?.isGachaReveal) {
      this.isGachaReveal = true;
    }
    super.show(data);
    
    // Hide header after show if this is a gacha reveal
    if (this.isGachaReveal) {
      const header = this.element.querySelector('.screen-header');
      if (header instanceof HTMLElement) {
        header.style.display = 'none';
      }
    }
    
    // Scroll to top when showing the screen (with a small delay to ensure content is rendered)
    requestAnimationFrame(() => {
      console.log('[PetProfileScreen] Attempting to scroll to top');
      console.log('Window scrollY before:', window.scrollY);
      console.log('Document scrollTop before:', document.documentElement.scrollTop);
      
      // Try multiple scroll targets
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Also try to scroll any scrollable containers
      const scrollableContainers = ['.main-content', '.content-wrapper', '.pet-profile-container', '#app', '.screen-container'];
      scrollableContainers.forEach(selector => {
        const element = document.querySelector(selector);
        if (element instanceof HTMLElement) {
          console.log(`Found ${selector}, scrollTop:`, element.scrollTop);
          element.scrollTop = 0;
        }
      });
      
      // Double check after a moment
      setTimeout(() => {
        console.log('Window scrollY after:', window.scrollY);
        console.log('Document scrollTop after:', document.documentElement.scrollTop);
        
        // Check what element is actually scrollable
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
          if (el.scrollHeight > el.clientHeight && el.scrollTop > 0) {
            console.log('[PetProfileScreen] Found scrolled element:', el.className || el.tagName, 'scrollTop:', el.scrollTop);
          }
        });
      }, 100);
    });
  }

  protected getScreenHeaderConfig(): ScreenHeaderConfig | null {
    // Always return config, we'll control visibility separately
    return {
      title: this.pet?.name || 'Pet Profile',
      showBackButton: true,
      backTarget: 'pet-collection'
    };
  }

  protected showBottomNav(): boolean {
    return false; // Sub-screen, no bottom nav
  }

  protected createContent(): string {
    return `
      <div class="pet-profile-screen">
        <div class="pet-profile-container">
          <!-- Main profile content will be dynamically generated -->
        </div>
      </div>
    `;
  }

  onShow(data?: { petId?: string; isGachaReveal?: boolean; resultIndex?: number; totalResults?: number }): void {
    // Store gacha reveal state BEFORE loading profile
    if (data?.isGachaReveal) {
      this.isGachaReveal = true;
      this.gachaResultIndex = data.resultIndex || 0;
      this.gachaTotalResults = data.totalResults || 0;
    } else {
      this.isGachaReveal = false;
    }
    
    if (data?.petId) {
      this.loadPetProfile(data.petId);
    } else {
      console.error('[PetProfileScreen] No pet ID provided');
      this.eventSystem.emit('ui:show_screen', { screenId: 'pet-collection' });
    }
  }

  onHide(): void {
    // Cleanup when screen is hidden
    this.pet = null;
    this.isGachaReveal = false;
    this.gachaResultIndex = 0;
    this.gachaTotalResults = 0;
    
    // Reset header visibility
    const header = this.element.querySelector('.screen-header');
    if (header instanceof HTMLElement) {
      header.style.display = '';
    }
  }

  private loadPetProfile(petId: string): void {
    // Get pet data
    const allPets = this.getAllPets();
    this.pet = allPets.find(p => p.petId === petId) || null;

    if (!this.pet) {
      console.error('[PetProfileScreen] Pet not found:', petId);
      this.eventSystem.emit('ui:show_screen', { screenId: 'pet-collection' });
      return;
    }


    // Update header with pet name
    this.updateHeader();

    // Render the profile
    this.renderProfile();
    
    // Force scroll to top after rendering
    setTimeout(() => {
      this.forceScrollToTop();
    }, 50);
    
    // Debug log
    console.log('[PetProfileScreen] Gacha reveal state:', {
      isGachaReveal: this.isGachaReveal,
      resultIndex: this.gachaResultIndex,
      totalResults: this.gachaTotalResults
    });
  }

  private renderProfile(): void {
    if (!this.pet) return;

    const container = this.element.querySelector('.pet-profile-container');
    if (!container) return;

    const owned = this.gachaSystem.playerOwnsPet(this.pet.petId);
    const dupeCount = this.gachaSystem.getDuplicateCount(this.pet.petId);
    const npc = getNPCById(this.pet.npcAffinity);

    // Split description into two sentences
    const descriptionSentences = this.pet.description.match(/[^.!?]+[.!?]+/g) || [this.pet.description];
    const bondStory = descriptionSentences[0] || '';
    const personalityDetail = descriptionSentences[1] || '';

    // Check if this is a new pet (not a duplicate) for gacha reveals
    const isNewPet = this.isGachaReveal && this.checkIfNewPet();
    
    container.innerHTML = `
      ${this.isGachaReveal && isNewPet ? `
        <div class="gacha-reveal-header new-pet">
          <h2>New Adoption!</h2>
          <p>${this.gachaResultIndex + 1} of ${this.gachaTotalResults}</p>
        </div>
      ` : ''}
      
      <div class="profile-hero ${!owned ? 'unowned' : ''}">
        ${owned ? 
          (this.pet.rarity === '5-star' ? 
            `<video 
              src="${getAssetPath('art/pets/pet_profile_hero_placeholder_cinematic.mp4')}" 
              class="profile-video" 
              autoplay 
              loop 
              muted
              playsinline
            ></video>` :
            `<img src="${getAssetPath(this.pet.artRefs?.portrait || 'art/pets/pet_profile_placeholder.png')}" alt="${this.pet.name}" class="profile-image" />`
          ) :
          `<div class="profile-silhouette">
            <span class="material-icons">pets</span>
            <p>Not Yet Discovered</p>
          </div>`
        }
        ${this.pet.rarity === '5-star' ? '<div class="ultra-rare-glow"></div>' : ''}
      </div>
      
      <div class="profile-header">
        <h1 class="pet-name ${!owned ? 'unknown' : ''}">${owned ? this.pet.name : '???'}</h1>
        <div class="pet-badges">
          <span class="rarity-badge rarity--${this.pet.rarity.toLowerCase()}">${this.pet.rarity}</span>
          ${owned && dupeCount > 0 ? `<span class="dupe-badge">×${dupeCount + 1} Owned</span>` : ''}
        </div>
        <div class="npc-affiliation">
          <img src="${getAssetPath(npc?.artRefs?.portrait || '')}" alt="${npc?.name}" class="npc-mini-portrait" />
          <span>${npc?.name}'s Companion</span>
          <span class="bond-points">+${this.getBondValue(this.pet.rarity)} Bond</span>
        </div>
        ${owned && this.pet.rarity === '5-star' ? `
          <button class="btn-watch-memory" data-action="watch-memory">
            <span class="material-icons">play_circle</span>
            Watch Memory
          </button>
        ` : ''}
      </div>

      <div class="profile-story">
        <div class="story-section bond-story">
          <h2>How They Met</h2>
          <p>${owned ? bondStory : 'Discover this pet to learn their story...'}</p>
        </div>
        
        <div class="story-section personality">
          <h2>Personality</h2>
          <p>${owned ? personalityDetail : 'Each pet has a unique personality waiting to be discovered...'}</p>
        </div>
      </div>

      <div class="profile-details">
        <div class="detail-card">
          <span class="material-icons">location_on</span>
          <div>
            <h4>Favorite Spot</h4>
            <p>${owned ? this.getSectionDisplay(this.pet.sectionAffinity) : '???'}</p>
          </div>
        </div>
        
        <div class="detail-card">
          <span class="material-icons">auto_awesome</span>
          <div>
            <h4>Special Trait</h4>
            <p>${owned ? this.getSpecialTrait() : '???'}</p>
          </div>
        </div>
      </div>

      ${this.isGachaReveal ? `
        <div class="profile-actions gacha-reveal-actions">
          <button class="btn btn-secondary" data-action="skip-all">
            <span class="material-icons">skip_next</span>
            Skip All
          </button>
          ${this.gachaResultIndex < this.gachaTotalResults - 1 ? `
            <button class="btn btn-primary" data-action="next-pet">
              <span class="material-icons">arrow_forward</span>
              Next (${this.gachaResultIndex + 1}/${this.gachaTotalResults})
            </button>
          ` : `
            <button class="btn btn-primary" data-action="finish-reveal">
              <span class="material-icons">check</span>
              Done
            </button>
          `}
        </div>
      ` : owned ? `
        <div class="profile-actions">
          <button class="btn btn-secondary" data-action="share">
            <span class="material-icons">share</span>
            Share
          </button>
        </div>
      ` : `
        <div class="profile-actions">
          <button class="btn btn-primary" data-action="go-gacha">
            <span class="material-icons">catching_pokemon</span>
            Try to Adopt
          </button>
        </div>
      `}
    `;

    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Gacha reveal buttons
    if (this.isGachaReveal) {
      // Skip all button
      const skipAllBtn = this.element.querySelector('[data-action="skip-all"]');
      if (skipAllBtn) {
        skipAllBtn.addEventListener('click', () => {
          this.handleSkipAll();
        });
      }

      // Next pet button
      const nextBtn = this.element.querySelector('[data-action="next-pet"]');
      if (nextBtn) {
        nextBtn.addEventListener('click', () => {
          this.handleNextPet();
        });
      }

      // Finish reveal button
      const finishBtn = this.element.querySelector('[data-action="finish-reveal"]');
      if (finishBtn) {
        finishBtn.addEventListener('click', () => {
          this.handleFinishReveal();
        });
      }
    } else {
      // Go to gacha button
      const goGachaBtn = this.element.querySelector('[data-action="go-gacha"]');
      if (goGachaBtn) {
        goGachaBtn.addEventListener('click', () => {
          this.eventSystem.emit('ui:show_screen', { screenId: 'gacha' });
        });
      }

      // Share button (placeholder)
      const shareBtn = this.element.querySelector('[data-action="share"]');
      if (shareBtn) {
        shareBtn.addEventListener('click', () => {
          this.eventSystem.emit('ui:notification_added', {
            type: 'success',
            title: 'Coming Soon',
            message: 'Share feature will be available in a future update!'
          });
        });
      }
      
      // Watch Memory button
      const watchMemoryBtn = this.element.querySelector('[data-action="watch-memory"]');
      if (watchMemoryBtn) {
        watchMemoryBtn.addEventListener('click', () => {
          this.playMemoryVideo();
        });
      }
    }
  }
  
  private playMemoryVideo(): void {
    if (!this.pet || this.pet.rarity !== '5-star') return;
    
    // Use the profile cinematic placeholder for now
    const cinematicPath = 'art/pets/pet_profile_placeholder_cinematic.mp4';
    
    // Create video overlay
    const videoOverlay = document.createElement('div');
    videoOverlay.className = 'memory-video-overlay';
    videoOverlay.innerHTML = `
      <div class="memory-video-container">
        <video 
          class="memory-video" 
          src="${getAssetPath(cinematicPath)}"
          autoplay
          controls
        ></video>
        <button class="btn-close-memory" aria-label="Close">
          <span class="material-icons">close</span>
        </button>
      </div>
    `;
    
    document.body.appendChild(videoOverlay);
    
    // Close handlers
    const closeBtn = videoOverlay.querySelector('.btn-close-memory');
    const video = videoOverlay.querySelector('video') as HTMLVideoElement;
    
    const closeVideo = () => {
      video.pause();
      videoOverlay.remove();
    };
    
    closeBtn?.addEventListener('click', closeVideo);
    
    // Also close on backdrop click
    videoOverlay.addEventListener('click', (e) => {
      if (e.target === videoOverlay) {
        closeVideo();
      }
    });
    
    // Close on video end
    video.addEventListener('ended', closeVideo);
  }

  private forceScrollToTop(): void {
    // Try all possible scroll methods
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    
    // Find and scroll all possible containers
    const possibleScrollContainers = document.querySelectorAll('*');
    possibleScrollContainers.forEach(el => {
      if (el.scrollHeight > el.clientHeight) {
        el.scrollTop = 0;
      }
    });
  }

  private getSpeciesDisplay(species: string): string {
    // Make species more friendly
    const speciesMap: Record<string, string> = {
      'Corgi': 'Corgi Companion',
      'Pomeranian': 'Pomeranian Friend',
      'Golden Retriever': 'Golden Retriever',
      'Persian Cat': 'Persian Cat',
      'Calico Cat': 'Calico Cat',
      'Hamster': 'Hamster Helper',
      'Rabbit': 'Bunny Artist',
      'Tortoise': 'Racing Tortoise',
      'Parakeet': 'Musical Parakeet',
      'Ferret': 'Fashion Ferret',
      'Chinchilla': 'Soft Chinchilla',
      'Betta Fish': 'Betta Fish',
      'Cockatiel': 'Singing Cockatiel',
      'Fox Kit': 'Playful Fox Kit',
      'Peacock': 'Majestic Peacock'
    };
    return speciesMap[species] || species;
  }

  private getSectionDisplay(section: string): string {
    const sectionMap: Record<string, string> = {
      'bakery': 'Aria\'s Bakery',
      'playground': 'Kai\'s Playground',
      'salon': 'Elias\'s Salon'
    };
    return sectionMap[section] || section;
  }

  private getBondValue(rarity: string): number {
    switch (rarity) {
      case '5-star': return 20;
      case '4-star': return 10;
      default: return 5;
    }
  }

  private getSpecialTrait(): string {
    if (!this.pet) return 'Unknown';

    // Extract key traits from descriptions
    const traitMap: Record<string, string> = {
      'muffin': 'Expert Taste Tester',
      'peanut': 'Temperature Detective',
      'buddy': 'Welcome Committee',
      'prince': 'Royal Judge',
      'patches': 'Glitter Enthusiast',
      'chip': 'Organization Expert',
      'luna': 'Cookie Artist',
      'turbo': 'Determination Master',
      'sunny': 'Melody Composer',
      'whiskers': 'Fashion Assistant',
      'storm': 'Dust Bath Artist',
      'rue': 'Mood Reader',
      'harmony': 'Memory Keeper',
      'blaze': 'Game Inventor',
      'iris': 'Beauty Teacher'
    };

    return traitMap[this.pet.petId] || 'Loyal Companion';
  }

  private getAllPets(): Pet[] {
    // Get pets from gacha system (this would normally come from a master list)
    const threeStars = this.gachaSystem.getPetsByRarity('3-star');
    const fourStars = this.gachaSystem.getPetsByRarity('4-star');
    const fiveStars = this.gachaSystem.getPetsByRarity('5-star');
    
    return [...threeStars, ...fourStars, ...fiveStars];
  }

  private updateHeader(): void {
    // Force header update with new pet name
    const header = this.element.querySelector('.screen-header h2');
    if (header && this.pet) {
      header.textContent = this.pet.name;
    }
  }

  private handleSkipAll(): void {
    // Navigate back to gacha screen and show summary
    const pullState = sessionStorage.getItem('gachaPullState');
    if (pullState) {
      const state = JSON.parse(pullState);
      // Set flag to skip to summary
      state.skipToSummary = true;
      sessionStorage.setItem('gachaPullState', JSON.stringify(state));
    }
    this.eventSystem.emit('ui:show_screen', { screenId: 'gacha' });
  }

  private handleNextPet(): void {
    // Get the next pet from the pull
    const pullState = sessionStorage.getItem('gachaPullState');
    if (pullState) {
      const state = JSON.parse(pullState);
      const nextIndex = this.gachaResultIndex + 1;
      
      if (nextIndex < state.currentPull.results.length) {
        const nextResult = state.currentPull.results[nextIndex];
        this.eventSystem.emit('ui:show_screen', {
          screenId: 'pet-profile',
          data: {
            petId: nextResult.pet.petId,
            isGachaReveal: true,
            resultIndex: nextIndex,
            totalResults: state.currentPull.results.length
          }
        });
        
        // Scroll will be handled by the show() method
      }
    }
  }

  private handleFinishReveal(): void {
    // Set flag to show summary when returning to gacha
    const pullState = sessionStorage.getItem('gachaPullState');
    if (pullState) {
      const state = JSON.parse(pullState);
      state.skipToSummary = true;
      sessionStorage.setItem('gachaPullState', JSON.stringify(state));
    }
    this.eventSystem.emit('ui:show_screen', { screenId: 'gacha' });
  }
  
  private checkIfNewPet(): boolean {
    // Check the pull state to see if this pet is new
    const pullState = sessionStorage.getItem('gachaPullState');
    if (!pullState || !this.pet) return false;
    
    const state = JSON.parse(pullState);
    const currentResult = state.currentPull?.results?.[this.gachaResultIndex];
    
    return currentResult?.isNew === true;
  }
}
