// Persistent header component - Always visible at top of screen
import { EventSystem } from '../../systems/EventSystem';
import { GameStateManager } from '../../systems/GameState';
import { getAssetPath } from '../../utils/assetPaths';

export class PersistentHeader {
  private element: HTMLElement;
  private eventSystem: EventSystem;
  private gameState: GameStateManager;
  private currentVariant: string = 'default';

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
        <div class="currency-item currency-social">
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
    this.eventSystem.on('ui:screen_shown', (data: { screenId: string }) => {
      this.updateHeaderVariant(data.screenId);
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
  
  private updateHeaderVariant(screenId: string): void {
    // Remove previous variant class
    this.element.classList.remove(`header-variant-${this.currentVariant}`);
    
    // Determine new variant based on screen
    switch (screenId) {
      case 'cafe-overview':
      case 'section-aria':
      case 'section-kai':
      case 'section-elias':
        this.currentVariant = 'cafe';
        break;
      case 'gacha':
        this.currentVariant = 'gacha';
        break;
      case 'dm':
      case 'dm-list':
        this.currentVariant = 'messages';
        break;
      case 'pet-collection':
        this.currentVariant = 'collection';
        break;
      case 'blog':
        this.currentVariant = 'blog';
        break;
      default:
        this.currentVariant = 'default';
    }
    
    // Add new variant class
    this.element.classList.add(`header-variant-${this.currentVariant}`);
  }
}
