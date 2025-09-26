// Screen management system for handling game screens and navigation
import { UIScreen } from './UIManager';
import { BaseScreen } from './BaseScreen';
import { EventSystem } from '../systems/EventSystem';
import { GameStateManager } from '../systems/GameState';
import { AssetPaths } from '../utils/assetPaths';
import { UnifiedCafeScreen } from './UnifiedCafeScreen';
import { SaveSlotsScreen } from './SaveSlotsScreen';

// Re-export BaseScreen for backward compatibility
export { BaseScreen };

// Title Screen
export class TitleScreen extends BaseScreen {
  createElement(): HTMLElement {
    const element = document.createElement('div');
    element.id = 'title-screen';
    element.className = 'screen title-screen';
    
    element.innerHTML = `
      <div class="title-screen__content">
        <div class="title-screen__logo">
          <img src="${AssetPaths.logo()}" alt="Love & Pets Café" class="title-logo-img" />
        </div>
        
        <div class="title-screen__menu">
          <button class="btn btn--primary btn--large" data-action="start">
            New Game
          </button>
          <button class="btn btn--secondary btn--large" data-action="continue" style="display: none;">
            Continue
          </button>
          <button class="btn btn--secondary btn--large" data-action="load">
            <span class="icon-emoji">📂</span> Load Game
          </button>
          <button class="btn btn--secondary" data-action="settings">
            <span class="icon-emoji">⚙️</span> Settings
          </button>
        </div>
        
        <div class="title-screen__version">
          <span>Version 1.0.0</span>
        </div>
      </div>
    `;

    return element;
  }

  onShow(data?: any): void {
    // Check if save data exists to show/hide continue button
    const continueBtn = this.element.querySelector('[data-action="continue"]') as HTMLElement;
    if (this.gameState.getState().player.profile.totalPlayTime > 0) {
      continueBtn.style.display = 'block';
    }
  }

  onHide(): void {
    // No specific cleanup needed
  }

  protected setupEventListeners(): void {
    console.log('[TitleScreen] Setting up event listeners');
    this.addClickHandler('[data-action="start"]', (e) => {
      console.log('[TitleScreen] Start button clicked!');
      this.eventSystem.emit('game:start_new');
    });

    this.addClickHandler('[data-action="continue"]', (e) => {
      this.eventSystem.emit('game:continue');
    });

    this.addClickHandler('[data-action="load"]', (e) => {
      this.eventSystem.emit('ui:show_screen', { screenId: 'save-slots' });
    });

    this.addClickHandler('[data-action="settings"]', (e) => {
      this.eventSystem.emit('ui:show_overlay', { overlayId: 'settings' });
    });
  }
}

// Café Overview Screen (Main Hub)
export class CafeOverviewScreen extends BaseScreen {
  createElement(): HTMLElement {
    const element = document.createElement('div');
    element.id = 'cafe-overview-screen';
    element.className = 'screen cafe-overview-screen';
    
    element.innerHTML = `
      <div class="cafe-overview__header">
        <div class="player-info">
          <div class="currency-display">
            <span class="coins"><span class="icon-emoji">🪙</span><span class="amount">0</span></span>
            <span class="premium"><span class="icon-emoji">💎</span><span class="amount">0</span></span>
          </div>
          <div class="cafe-level">
            <span>Café Level <span class="level">1</span></span>
          </div>
        </div>
        
        <div class="header-actions">
          <button class="btn btn--icon" data-action="settings">
            <span class="icon-emoji">⚙️</span>
          </button>
          <button class="btn btn--icon" data-action="notifications">
            <span class="icon-emoji">🔔</span>
            <span class="notification-badge" style="display: none;">0</span>
          </button>
        </div>
      </div>
      
      <div class="cafe-overview__sections">
        <div class="section-tile" data-section="bakery">
          <div class="section-tile__image">
            <img src="${AssetPaths.scenePlaceholder('bakery')}" alt="Bakery" />
          </div>
          <div class="section-tile__info">
            <h3>Bakery</h3>
            <p>Aria's cozy corner</p>
            <div class="section-status">
              <span class="status-indicator status--idle">Ready</span>
            </div>
          </div>
        </div>
        
        <div class="section-tile" data-section="playground">
          <div class="section-tile__image">
            <img src="${AssetPaths.scenePlaceholder('playground')}" alt="Playground" />
          </div>
          <div class="section-tile__info">
            <h3>Playground</h3>
            <p>Kai's active zone</p>
            <div class="section-status">
              <span class="status-indicator status--locked">Locked</span>
            </div>
          </div>
        </div>
        
        <div class="section-tile" data-section="styling">
          <div class="section-tile__image">
              <img src="${AssetPaths.scenePlaceholder('salon')}" alt="Styling Salon" />
          </div>
          <div class="section-tile__info">
            <h3>Styling</h3>
            <p>Elias's creative space</p>
            <div class="section-status">
              <span class="status-indicator status--locked">Locked</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="cafe-overview__actions">
        <button class="btn btn--primary" data-action="blog">
          <span class="icon-emoji">📝</span>
          Blog
        </button>
        <button class="btn btn--primary" data-action="gacha">
          <span class="icon-emoji">🎰</span>
          Adopt Pets
        </button>
        <button class="btn btn--secondary" data-action="shop">
          <span class="icon-emoji">🛍️</span>
          Shop
        </button>
        <button class="btn btn--secondary" data-action="pets">
          <span class="icon-emoji">🐾</span>
          My Pets
        </button>
      </div>
    `;

    return element;
  }

  onShow(data?: any): void {
    this.updateDisplay();
    
    // Set up periodic updates for shift timers
    this.startPeriodicUpdates();
  }

  onHide(): void {
    this.stopPeriodicUpdates();
  }

  private updateInterval?: number;

  private startPeriodicUpdates(): void {
    this.updateInterval = window.setInterval(() => {
      this.updateDisplay();
    }, 1000); // Update every second
  }

  private stopPeriodicUpdates(): void {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = undefined;
    }
  }

  private updateDisplay(): void {
    const state = this.gameState.getState();
    
    // Update currency display
    const coinsElement = this.element.querySelector('.coins .amount');
    const premiumElement = this.element.querySelector('.premium .amount');
    
    if (coinsElement) coinsElement.textContent = state.player.currencies.coins.toString();
    if (premiumElement) premiumElement.textContent = state.player.currencies.premiumCurrency.toString();
    
    // Update café level
    const levelElement = this.element.querySelector('.cafe-level .level');
    if (levelElement) levelElement.textContent = state.player.profile.cafeLevel.toString();
    
    // Update section statuses
    state.cafeLayout.forEach(section => {
      const sectionTile = this.element.querySelector(`[data-section="${section.sectionType.toLowerCase()}"]`);
      if (!sectionTile) return;
      
      const statusIndicator = sectionTile.querySelector('.status-indicator');
      if (!statusIndicator) return;
      
      if (!section.isUnlocked) {
        statusIndicator.className = 'status-indicator status--locked';
        statusIndicator.textContent = 'Locked';
      } else if (section.currentShift) {
        const timeRemaining = this.calculateTimeRemaining(section.currentShift);
        statusIndicator.className = 'status-indicator status--running';
        statusIndicator.textContent = this.formatTime(timeRemaining);
      } else {
        statusIndicator.className = 'status-indicator status--idle';
        statusIndicator.textContent = 'Ready';
      }
    });
  }

  private calculateTimeRemaining(shift: any): number {
    if (!shift.startedAt) return 0;
    const elapsed = Date.now() - shift.startedAt;
    return Math.max(0, shift.duration - elapsed);
  }

  private formatTime(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes % 60}m`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    } else {
      return `${seconds}s`;
    }
  }

  protected setupEventListeners(): void {
    // Section navigation
    this.addClickHandler('.section-tile', (event) => {
      const sectionElement = (event.currentTarget as HTMLElement).closest('[data-section]') as HTMLElement;
      const sectionType = sectionElement?.getAttribute('data-section');
      
      if (sectionType) {
        this.eventSystem.emit('ui:navigate_to_section', { sectionType });
      }
    });

    // Action buttons
    this.addClickHandler('[data-action="blog"]', () => {
      this.eventSystem.emit('ui:show_screen', { screenId: 'blog' });
    });

    this.addClickHandler('[data-action="gacha"]', () => {
      this.eventSystem.emit('ui:show_screen', { screenId: 'gacha' });
    });

    this.addClickHandler('[data-action="shop"]', () => {
      this.eventSystem.emit('ui:show_screen', { screenId: 'shop' });
    });

    this.addClickHandler('[data-action="pets"]', () => {
      this.eventSystem.emit('ui:show_screen', { screenId: 'pets' });
    });

    this.addClickHandler('[data-action="settings"]', () => {
      this.eventSystem.emit('ui:show_overlay', { overlayId: 'settings' });
    });

    this.addClickHandler('[data-action="notifications"]', () => {
      this.eventSystem.emit('ui:show_overlay', { overlayId: 'notifications' });
    });
  }
}

// Screen factory for creating screen instances
export class ScreenFactory {
  static isMobile(): boolean {
    return window.innerWidth < 768 || 
           ('ontouchstart' in window) || 
           (navigator.maxTouchPoints > 0);
  }

  static createScreen(
    screenId: string, 
    eventSystem: EventSystem, 
    gameState: GameStateManager,
    shiftManager?: any
  ): UIScreen | null {
    const isMobile = this.isMobile();
    console.log(`[ScreenFactory] Creating ${screenId}, isMobile: ${isMobile}, width: ${window.innerWidth}`);
    
    switch (screenId) {
      case 'title':
        return new TitleScreen(screenId, eventSystem, gameState);
      case 'cafe-overview':
        // Use unified screen for all devices
        console.log(`[ScreenFactory] Creating unified cafe screen`);
        return new UnifiedCafeScreen(screenId, eventSystem, gameState);
      case 'save-slots':
        // Note: SaveSystem needs to be passed from main.ts
        console.log(`[ScreenFactory] Creating save slots screen`);
        return null; // Will be created dynamically with SaveSystem
      // Section screens would be created with additional parameters
      // For now, we'll handle them separately
      default:
        console.warn(`[ScreenFactory] Unknown screen: ${screenId}`);
        return null;
    }
  }
}

