// Gacha Screen - Pet collection and pulling interface
import { UnifiedBaseScreen } from './UnifiedBaseScreen';
import { EventSystem } from '../systems/EventSystem';
import { GameStateManager } from '../systems/GameState';
import { GachaSystem, GachaPull, PetPullResult } from '../systems/GachaSystem';
import { AssetPaths, getAssetPath } from '../utils/assetPaths';
import { ScreenHeaderConfig } from './components/ScreenHeader';

export class GachaScreen extends UnifiedBaseScreen {
  private gachaSystem: GachaSystem;
  private isPulling: boolean = false;
  private currentPull: GachaPull | undefined;
  private animationTimeout?: number;

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
      <div class="gacha-screen__content">
        <!-- Banner Display -->
        <div class="gacha-banner">
          <div class="banner-image">
            <img src="${AssetPaths.gachaBanner()}" alt="Pet Adoption Center" />
          </div>
          <div class="banner-info">
            <h3>Adopt Pets, Grow Bonds</h3>
            <p>Every new friend brightens a helper’s day. Watch for bond boosts!</p>
          </div>
        </div>
        
        <!-- Currency Display -->
        <div class="gacha-currency">
          <div class="currency-item">
            <span class="material-icons icon-sm icon-gold">paid</span>
            <span class="currency-amount" id="coins-display">0</span>
          </div>
          <div class="currency-item">
            <span class="material-icons icon-sm icon-gem">diamond</span>
            <span class="currency-amount" id="gems-display">0</span>
          </div>
        </div>
        
        <!-- Pull Buttons -->
        <div class="gacha-actions">
          <button class="btn btn--primary btn--large gacha-pull-btn" data-action="pull-single">
            <span class="pull-cost">
              <span class="material-icons icon-sm icon-gold">paid</span> 100
            </span>
            <span class="pull-label">Single Pull</span>
          </button>
          
          <button class="btn btn--primary btn--large gacha-pull-btn" data-action="pull-ten">
            <span class="pull-cost">
              <span class="material-icons icon-sm icon-gold">paid</span> 900
            </span>
            <span class="pull-label">10x Pull</span>
            <span class="pull-bonus">Save 100!</span>
          </button>
        </div>
        
        <!-- Rates Info -->
        <div class="gacha-rates">
          <button class="rates-toggle" data-action="show-rates">
            <span class="material-icons icon-sm">info</span> Drop Rates
          </button>
        </div>
      </div>
      
      
      <!-- Rates Modal -->
      <div class="gacha-rates-modal" id="rates-modal" style="display: none;">
        <div class="modal__backdrop" data-action="close-rates"></div>
        <div class="modal__content">
          <h3>Drop Rates</h3>
          <div class="rates-list">
            <div class="rate-item">
              <span class="rarity rarity--3-star">⭐⭐⭐</span>
              <span class="rate-value">70%</span>
            </div>
            <div class="rate-item">
              <span class="rarity rarity--4-star">⭐⭐⭐⭐</span>
              <span class="rate-value">27%</span>
            </div>
            <div class="rate-item">
              <span class="rarity rarity--5-star">⭐⭐⭐⭐⭐</span>
              <span class="rate-value">3%</span>
            </div>
          </div>
          <p class="rates-note">
            <span class="icon-emoji">⭐</span> Guaranteed Rare or better every 10 pulls!
          </p>
          <button class="btn btn--primary" data-action="close-rates">Close</button>
        </div>
      </div>
    `;
  }

  onShow(): void {
    // Check if we're returning from a pull reveal
    const pullState = sessionStorage.getItem('gachaPullState');
    if (pullState) {
      const state = JSON.parse(pullState);
      this.currentPull = state.currentPull;
      this.isPulling = state.isPulling;
      
      // Clear the state first
      sessionStorage.removeItem('gachaPullState');
      
      if (state.skipToSummary) {
        // User clicked "Skip All", show summary
        // Use setTimeout to ensure the screen transition completes first
        setTimeout(() => {
          this.showPullSummary();
        }, 100);
      }
    }
    
    this.updateUI();
    this.eventSystem.on('player:currency_changed', this.updateUI.bind(this));
    this.eventSystem.on('gacha:pull_complete', this.handlePullComplete.bind(this));
  }

  onHide(): void {
    this.eventSystem.off('player:currency_changed', this.updateUI.bind(this));
    this.eventSystem.off('gacha:pull_complete', this.handlePullComplete.bind(this));
    
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
    }
  }

  protected override setupEventListeners(): void {
    super.setupEventListeners();

    // Pull actions
    this.addClickHandler('[data-action="pull-single"]', () => {
      if (!this.isPulling) {
        this.performPull('single');
      }
    });

    this.addClickHandler('[data-action="pull-ten"]', () => {
      if (!this.isPulling) {
        this.performPull('ten');
      }
    });


    // Rates modal
    this.addClickHandler('[data-action="show-rates"]', () => {
      this.showRatesModal();
    });

    this.addClickHandler('[data-action="close-rates"]', () => {
      this.closeRatesModal();
    });
  }

  private updateUI(): void {
    const state = this.gameState.getState();
    const player = state.player;

    // Update currency
    const coinsDisplay = this.element.querySelector('#coins-display');
    const gemsDisplay = this.element.querySelector('#gems-display');
    
    if (coinsDisplay) coinsDisplay.textContent = player.currencies.coins.toLocaleString();
    if (gemsDisplay) gemsDisplay.textContent = player.currencies.premiumCurrency.toLocaleString();

    // Update collection count
    const progress = this.gachaSystem.getCollectionProgress();
    const countDisplay = this.element.querySelector('.collection-count');
    if (countDisplay) {
      countDisplay.textContent = `${progress.owned}/${progress.total}`;
    }

    // Update button states
    const singleBtn = this.element.querySelector('[data-action="pull-single"]') as HTMLButtonElement;
    const tenBtn = this.element.querySelector('[data-action="pull-ten"]') as HTMLButtonElement;
    
    if (singleBtn) {
      singleBtn.disabled = this.isPulling || player.currencies.coins < 100;
    }
    if (tenBtn) {
      tenBtn.disabled = this.isPulling || player.currencies.coins < 900;
    }
  }

  private async performPull(type: 'single' | 'ten'): Promise<void> {
    if (this.isPulling) return;

    this.isPulling = true;
    this.updateUI();

    try {
      let pull: GachaPull | null = null;

      if (type === 'single') {
        pull = await this.gachaSystem.pullSingle();
      } else {
        pull = await this.gachaSystem.pullTenTimes();
      }

      if (!pull) {
        // Insufficient funds - handled by gacha system events
        this.isPulling = false;
        this.updateUI();
        return;
      }

      // Store pull data
      this.currentPull = pull;

      // Show result modal
      this.showResultModal();

    } catch (error) {
      console.error('[GachaScreen] Pull failed:', error);
      this.eventSystem.emit('ui:show_notification', {
        message: 'Pull failed. Please try again.',
        type: 'error'
      });
      this.isPulling = false;
      this.updateUI();
    }
  }

  private showResultModal(): void {
    if (!this.currentPull || this.currentPull.results.length === 0) return;
    
    // Sort results to show 5-star pets first
    this.currentPull.results.sort((a, b) => {
      const rarityOrder = { '5-star': 3, '4-star': 2, '3-star': 1 };
      return (rarityOrder[b.rarity] || 0) - (rarityOrder[a.rarity] || 0);
    });
    
    // Debug: Log all results after sorting
    console.log('[GachaScreen] All pull results (sorted by rarity):');
    this.currentPull.results.forEach((result, index) => {
      console.log(`  ${index}: ${result.pet.name} (${result.rarity})`);
    });
    
    // Show first result by navigating to pet profile
    this.showResult(0);
  }

  private showResult(index: number): void {
    if (!this.currentPull || index >= this.currentPull.results.length) {
      this.showPullSummary();
      return;
    }

    const result = this.currentPull.results[index];
    if (!result) return;
    
    console.log('[GachaScreen] Showing result:', result.pet.name, 'Rarity:', result.rarity, 'Pet rarity:', result.pet.rarity);
    
    // Check if this is a 5-star pet - check both result.rarity and result.pet.rarity
    if (result.rarity === '5-star' || result.pet.rarity === '5-star') {
      console.log('[GachaScreen] Playing cinematic for 5-star pet');
      this.playGachaCinematic(result, index);
    } else {
      // Regular reveal - go straight to profile
      this.navigateToPetProfile(result, index);
    }
  }
  
  private playGachaCinematic(result: PetPullResult, index: number): void {
    // Get NPC-specific gacha cinematic path
    const npcId = result.pet.npcAffinity;
    const cinematicPath = `art/npc/${npcId}/${npcId}_gacha_cinematic.mp4`;
    const fullPath = getAssetPath(cinematicPath);
    
    console.log('[GachaScreen] Playing cinematic for NPC:', npcId);
    console.log('[GachaScreen] Cinematic path:', fullPath);
    
    // Create video overlay with fade layer
    const videoOverlay = document.createElement('div');
    videoOverlay.className = 'gacha-cinematic-overlay';
    videoOverlay.innerHTML = `
      <video 
        class="gacha-cinematic-video" 
        src="${fullPath}"
        autoplay
        muted
      ></video>
      <div class="gacha-fade-overlay"></div>
    `;
    
    document.body.appendChild(videoOverlay);
    
    const video = videoOverlay.querySelector('video') as HTMLVideoElement;
    
    // Add error handling
    video.addEventListener('error', (e) => {
      console.error('[GachaScreen] Video failed to load:', e);
      console.error('[GachaScreen] Video src:', video.src);
      videoOverlay.remove();
      this.navigateToPetProfile(result, index);
    });
    
    // When video ends, fade to white then navigate to pet profile
    video.addEventListener('ended', () => {
      const fadeOverlay = videoOverlay.querySelector('.gacha-fade-overlay') as HTMLElement;
      if (fadeOverlay) {
        fadeOverlay.classList.add('fade-active');
        
        // Wait for fade animation to complete
        setTimeout(() => {
          videoOverlay.remove();
          this.navigateToPetProfile(result, index);
        }, 500); // Match the 0.5s duration
      } else {
        videoOverlay.remove();
        this.navigateToPetProfile(result, index);
      }
    });
    
    // Allow skip on click (with fade)
    videoOverlay.addEventListener('click', () => {
      video.pause();
      const fadeOverlay = videoOverlay.querySelector('.gacha-fade-overlay') as HTMLElement;
      if (fadeOverlay) {
        fadeOverlay.classList.add('fade-active');
        setTimeout(() => {
          videoOverlay.remove();
          this.navigateToPetProfile(result, index);
        }, 500);
      } else {
        videoOverlay.remove();
        this.navigateToPetProfile(result, index);
      }
    });
  }
  
  private navigateToPetProfile(result: PetPullResult, index: number): void {
    // Store the current pull state in session storage so we can restore it
    sessionStorage.setItem('gachaPullState', JSON.stringify({
      currentPull: this.currentPull,
      resultIndex: index,
      isPulling: true
    }));
    
    // Navigate to pet profile for the reveal
    this.eventSystem.emit('ui:show_screen', {
      screenId: 'pet-profile',
      data: { 
        petId: result.pet.petId,
        isGachaReveal: true,
        resultIndex: index,
        totalResults: this.currentPull!.results.length
      }
    });
  }



  private showPullSummary(): void {
    if (!this.currentPull) return;

    // Create a modal to show the summary
    const modal = document.createElement('div');
    modal.className = 'gacha-summary-modal';
    modal.innerHTML = `
      <div class="modal__backdrop"></div>
      <div class="modal__content gacha-summary">
        <h2>Adoption Complete!</h2>
        
        ${this.renderNewPets()}
        ${this.renderDuplicateSummary()}
        
        <div class="summary-actions">
          <button class="btn btn-primary" data-action="close-summary">
            <span class="material-icons">check</span>
            Done
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Add event listener for close
    modal.querySelector('[data-action="close-summary"]')?.addEventListener('click', () => {
      modal.remove();
      this.isPulling = false;
      this.currentPull = undefined;
      this.updateUI();
    });
    
    // Also close on backdrop click
    modal.querySelector('.modal__backdrop')?.addEventListener('click', () => {
      modal.remove();
      this.isPulling = false;
      this.currentPull = undefined;
      this.updateUI();
    });
  }


  private renderNewPets(): string {
    if (!this.currentPull) return '';
    
    const newPets = this.currentPull.results.filter(r => r.isNew);
    if (newPets.length === 0) return '';
    
    return `
      <div class="summary-section">
        <h3>New Companions!</h3>
        <div class="new-pets-grid">
          ${newPets.map(result => `
            <div class="pet-card pet-owned">
              <div class="pet-portrait">
                <img src="${result.pet.artRefs?.portrait || AssetPaths.petPlaceholder()}" alt="${result.pet.name}" />
              </div>
              <div class="pet-info">
                <h4 class="pet-name">${result.pet.name}</h4>
                <div class="pet-rarity rarity--${result.rarity.toLowerCase()}">${result.rarity}</div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
  
  private renderDuplicateSummary(): string {
    if (!this.currentPull) return '';
    
    const dupes = this.currentPull.results.filter(r => r.isDuplicate);
    if (dupes.length === 0) return '';
    
    const totalTokens = dupes.reduce((sum, r) => sum + (r.tokensAwarded || 0), 0);
    
    return `
      <div class="summary-section">
        <h3>Duplicate Rewards</h3>
        <div class="duplicate-summary">
          <div class="token-reward">
            <span class="material-icons icon-gold">paid</span>
            <span class="token-amount">${totalTokens.toLocaleString()}</span>
            <span class="token-label">Coins</span>
          </div>
          <p class="duplicate-count">${dupes.length} duplicate${dupes.length > 1 ? 's' : ''} converted to coins</p>
        </div>
      </div>
    `;
  }

  private showRatesModal(): void {
    const modal = this.element.querySelector('#rates-modal') as HTMLElement;
    if (modal) {
      modal.style.display = 'flex';
    }
  }

  private closeRatesModal(): void {
    const modal = this.element.querySelector('#rates-modal') as HTMLElement;
    if (modal) {
      modal.style.display = 'none';
    }
  }

  private handlePullComplete(_pull: GachaPull): void {
    // Update UI after pull completes
    this.updateUI();
  }

}
