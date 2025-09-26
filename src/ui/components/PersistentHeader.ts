// Persistent header component - Always visible at top of screen
import { EventSystem } from '../../systems/EventSystem';
import { GameStateManager } from '../../systems/GameState';

export class PersistentHeader {
  private element: HTMLElement;
  private eventSystem: EventSystem;
  private gameState: GameStateManager;

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
      <div class="header-brand">
        <img src="./art/love_pets_logo_transparent.png" alt="Love & Pets" class="brand-logo" />
      </div>
      
      <div class="header-stats">
        <div class="stat-item">
          <span class="material-icons icon-sm icon-gold">paid</span>
          <span class="stat-value" id="header-coins">0</span>
        </div>
        <div class="stat-item">
          <span class="material-icons icon-sm">group</span>
          <span class="stat-value" id="header-subscribers">0</span>
        </div>
      </div>

      
      <div class="header-actions">
        <button class="btn-icon" data-action="settings" aria-label="Settings">
          <span class="material-icons">settings</span>
        </button>
        <button class="btn-icon" data-action="notifications" aria-label="Notifications">
          <span class="material-icons">notifications</span>
          <span class="notification-badge" id="header-notification-count" style="display: none;">0</span>
        </button>
      </div>
    `;
    return header;
  }

  private setupEventListeners(): void {
    // Action buttons
    this.element.querySelector('[data-action="settings"]')?.addEventListener('click', () => {
      this.eventSystem.emit('ui:show_overlay', { overlayId: 'settings' });
    });

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

  }

  private updateDisplay(): void {
    const player = this.gameState.getPlayer();
    
    // Update coins
    const coinsElement = this.element.querySelector('#header-coins');
    if (coinsElement) {
      coinsElement.textContent = player.currencies.coins.toLocaleString();
    }

    // Update subscribers
    const subscribersElement = this.element.querySelector('#header-subscribers');
    if (subscribersElement) {
      subscribersElement.textContent = player.subscribers.toLocaleString();
    }

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
}
