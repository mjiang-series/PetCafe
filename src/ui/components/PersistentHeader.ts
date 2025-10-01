// Persistent header component - Always visible at top of screen
import { EventSystem } from '../../systems/EventSystem';
import { GameStateManager } from '../../systems/GameState';
import { getAssetPath } from '../../utils/assetPaths';

export class PersistentHeader {
  private element: HTMLElement;
  private eventSystem: EventSystem;
  private gameState: GameStateManager;
  private currentVariant: string = 'default';
  private parentScreen: string | null = null;

  constructor(eventSystem: EventSystem, gameState: GameStateManager) {
    this.eventSystem = eventSystem;
    this.gameState = gameState;
    this.element = this.createElement();
    this.setupEventListeners();
    this.updateDisplay();
  }

  private createElement(): HTMLElement {
    const header = document.createElement('header');
    header.className = 'persistent-header';
    header.innerHTML = `
      <div class="header-player">
        <button class="player-portrait-btn" data-action="profile" aria-label="Player Profile">
          <img src="${getAssetPath('art/player_portrait.png')}" alt="Player" class="player-portrait" />
          <span class="player-level">12</span>
        </button>
      </div>
      
      <div class="header-currencies">
        <div class="currency-item currency-soft">
          <span class="material-icons icon-sm">paid</span>
          <span class="currency-value" id="header-coins">0</span>
        </div>
        <div class="currency-item currency-gacha">
          <span class="material-icons icon-sm">confirmation_number</span>
          <span class="currency-value" id="header-tickets">0</span>
        </div>
        <div class="currency-item currency-social" title="Cafe Visitors">
          <span class="material-icons icon-sm">group</span>
          <span class="currency-value" id="header-subscribers">0</span>
        </div>
      </div>
      
      <div class="header-right">
        <div class="currency-item currency-premium">
          <span class="material-icons icon-sm">diamond</span>
          <span class="currency-value" id="header-diamonds">0</span>
          <button class="btn-add-currency" data-action="shop-diamonds" aria-label="Buy Diamonds">
            <span class="material-icons">add</span>
          </button>
        </div>
        <button class="btn-icon" data-action="notifications" aria-label="Notifications">
          <span class="material-icons">notifications</span>
          <span class="notification-badge" id="header-notification-count" style="display: none;">0</span>
        </button>
      </div>
    `;
    return header;
  }

  private setupEventListeners(): void {
    // Player profile button
    this.element.querySelector('[data-action="profile"]')?.addEventListener('click', () => {
      this.eventSystem.emit('ui:show_screen', { screenId: 'player-profile' });
    });

    // Shop button for diamonds
    this.element.querySelector('[data-action="shop-diamonds"]')?.addEventListener('click', () => {
      this.eventSystem.emit('ui:show_screen', { screenId: 'shop', data: { tab: 'diamonds' } });
    });

    // Notifications button
    this.element.querySelector('[data-action="notifications"]')?.addEventListener('click', () => {
      this.eventSystem.emit('ui:show_overlay', { overlayId: 'notifications' });
    });

    // Listen for state updates
    this.eventSystem.on('player:currencies_updated', () => this.updateDisplay());
    this.eventSystem.on('blog:subscriber_gained', () => this.updateDisplay());
    this.eventSystem.on('ui:notification_added', () => this.updateNotificationCount());
    
    // Listen for conversation updates
    this.eventSystem.on('conversation:message_added', () => this.updateNotificationCount());
    this.eventSystem.on('conversation:marked_read', () => this.updateNotificationCount());
    this.eventSystem.on('shift:status_changed', () => this.updateNotificationCount());
    
    // Listen for screen changes to update header variant
    this.eventSystem.on('ui:screen_shown', (data: { screenId: string, parentScreen?: string }) => {
      // Track parent screen for nested navigation
      if (data.parentScreen) {
        this.parentScreen = data.parentScreen;
      } else if (!this.isNestedScreen(data.screenId)) {
        // Reset parent screen for top-level screens
        this.parentScreen = null;
      }
      
      this.updateHeaderVariant(data.screenId);
    });
    
    // Listen for explicit variant changes
    this.eventSystem.on('header:set_variant', (data: { variant: string }) => {
      this.setVariant(data.variant);
    });
  }

  private updateDisplay(): void {
    const player = this.gameState.getPlayer();
    
    // Update player level
    const levelEl = this.element.querySelector('.player-level');
    if (levelEl) {
      levelEl.textContent = (player.profile?.cafeLevel || 1).toString();
    }
    
    // Update diamonds (premium currency)
    const diamondsEl = this.element.querySelector('#header-diamonds');
    if (diamondsEl) {
      diamondsEl.textContent = this.formatCurrency(player.currencies?.premiumCurrency || 0);
    }
    
    // Update coins (soft currency)
    const coinsEl = this.element.querySelector('#header-coins');
    if (coinsEl) {
      coinsEl.textContent = this.formatCurrency(player.currencies?.coins || 0);
    }
    
    // Update gacha tickets
    const ticketsEl = this.element.querySelector('#header-tickets');
    if (ticketsEl) {
      ticketsEl.textContent = (player.currencies?.freeGachaCurrency || 0).toString();
    }
    
    // Update subscriber count
    const subscribersEl = this.element.querySelector('#header-subscribers');
    if (subscribersEl) {
      subscribersEl.textContent = this.formatCurrency(player.subscribers || 0);
    }
  }

  private formatCurrency(value: number): string {
    if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
    if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
    if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
    return value.toString();
  }

  private updateNotificationCount(): void {
    // Get notification count from various sources
    const unreadMessages = this.gameState.getTotalUnreadMessages();
    const completedShifts = this.gameState.getActiveShifts()
      .filter(shift => shift.status === 'complete').length;
    
    const totalNotifications = unreadMessages + completedShifts;
    
    const badge = this.element.querySelector('#header-notification-count') as HTMLElement;
    
    if (badge) {
      badge.textContent = totalNotifications.toString();
      badge.style.display = totalNotifications > 0 ? 'inline-block' : 'none';
    }
  }


  public getElement(): HTMLElement {
    return this.element;
  }

  public show(): void {
    this.element.style.display = 'flex';
    this.updateDisplay();
  }

  public hide(): void {
    this.element.style.display = 'none';
  }

  public cleanup(): void {
    // Remove event listeners
    this.eventSystem.off('player:currencies_updated', () => this.updateDisplay());
    this.eventSystem.off('blog:subscriber_gained', () => this.updateDisplay());
    this.eventSystem.off('ui:notification_added', () => this.updateNotificationCount());
  }
  
  public setVariant(variant: string): void {
    // Allow manual setting of header variant
    this.element.classList.remove(`header-variant-${this.currentVariant}`);
    this.currentVariant = variant;
    this.element.classList.add(`header-variant-${this.currentVariant}`);
  }
  
  private isNestedScreen(screenId: string): boolean {
    // Screens that are typically nested within other screens
    const nestedScreens = ['pet-profile', 'dm', 'blog-post', 'section-aria', 'section-kai', 'section-elias'];
    return nestedScreens.some(nested => screenId.includes(nested));
  }
  
  private updateHeaderVariant(screenId: string): void {
    // Remove previous variant class
    this.element.classList.remove(`header-variant-${this.currentVariant}`);
    
    // Determine new variant based on screen or parent context
    let variant = 'default';
    
    // First check if we have a parent screen context for nested screens
    if (this.parentScreen && this.isNestedScreen(screenId)) {
      // Use parent screen's variant
      if (this.parentScreen.includes('cafe')) {
        variant = 'cafe';
      } else if (this.parentScreen === 'gacha') {
        variant = 'gacha';
      } else if (this.parentScreen.includes('message') || this.parentScreen === 'dm-list') {
        variant = 'messages';
      } else if (this.parentScreen === 'pet-collection') {
        variant = 'collection';
      } else if (this.parentScreen === 'blog') {
        variant = 'blog';
      } else if (this.parentScreen === 'journal') {
        variant = 'journal';
      }
    } else {
      // Check for specific screens and their children
      if (screenId.startsWith('cafe-') || screenId.startsWith('section-')) {
        // Cafe overview and all section screens
        variant = 'cafe';
      } else if (screenId === 'gacha' || screenId.includes('gacha')) {
        // Gacha and related screens
        variant = 'gacha';
      } else if (screenId.startsWith('dm') || screenId === 'messages' || screenId.includes('chat')) {
        // Messages, DM list, individual DMs, and chat screens
        variant = 'messages';
      } else if (screenId === 'pet-collection' || screenId === 'pet-profile' || screenId.includes('pet')) {
        // Pet collection and pet profiles
        variant = 'collection';
      } else if (screenId === 'blog' || screenId.includes('post') || screenId.includes('blog')) {
        // Blog and individual posts
        variant = 'blog';
      } else if (screenId === 'journal' || screenId.includes('memory-detail') || screenId.includes('memory')) {
        // Journal and memory screens
        variant = 'journal';
      }
    }
    
    this.currentVariant = variant;
    
    // Add new variant class
    this.element.classList.add(`header-variant-${this.currentVariant}`);
  }
}
