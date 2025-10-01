/**
 * Notifications Overlay
 * Shows a history of Muffin's tutorial messages and alerts
 */

import { EventSystem } from '../../systems/EventSystem';
import { GameStateManager } from '../../systems/GameState';
import { getAssetPath } from '../../utils/assetPaths';

interface NotificationHistoryItem {
  title: string;
  message: string;
  timestamp: number;
  tutorialId?: string;
}

export class NotificationsOverlay {
  private eventSystem: EventSystem;
  private gameState: GameStateManager;
  private element: HTMLElement | null = null;
  private notificationHistory: NotificationHistoryItem[] = [];

  constructor(eventSystem: EventSystem, gameState: GameStateManager) {
    this.eventSystem = eventSystem;
    this.gameState = gameState;
    this.setupEventListeners();
    this.loadNotificationHistory();
  }

  private setupEventListeners(): void {
    // Listen for when tutorial alerts are shown to add them to history
    this.eventSystem.on('tutorial:show', (data: { title: string; message: string; tutorialId: string }) => {
      this.addToHistory(data.title, data.message, data.tutorialId);
    });

    // Listen for overlay show request
    this.eventSystem.on('ui:show_overlay', (data: { overlayId: string }) => {
      if (data.overlayId === 'notifications') {
        this.show();
      }
    });
  }

  private loadNotificationHistory(): void {
    const saved = localStorage.getItem('notificationHistory');
    if (saved) {
      try {
        this.notificationHistory = JSON.parse(saved);
      } catch (error) {
        console.error('[NotificationsOverlay] Failed to load history:', error);
        this.notificationHistory = [];
      }
    }
  }

  private saveNotificationHistory(): void {
    try {
      localStorage.setItem('notificationHistory', JSON.stringify(this.notificationHistory));
    } catch (error) {
      console.error('[NotificationsOverlay] Failed to save history:', error);
    }
  }

  private addToHistory(title: string, message: string, tutorialId?: string): void {
    // Check if player has seen this tutorial
    const player = this.gameState.getPlayer();
    if (tutorialId && player.tutorialFlags?.[tutorialId]) {
      // Add to history if not already there
      const exists = this.notificationHistory.some(n => n.tutorialId === tutorialId);
      if (!exists) {
        this.notificationHistory.unshift({
          title,
          message,
          timestamp: Date.now(),
          tutorialId
        });
        
        // Keep only last 20 notifications
        if (this.notificationHistory.length > 20) {
          this.notificationHistory = this.notificationHistory.slice(0, 20);
        }
        
        this.saveNotificationHistory();
      }
    }
  }

  public show(): void {
    if (this.element) {
      this.element.remove();
    }

    this.createElement();
    document.body.appendChild(this.element!);

    // Add show animation
    requestAnimationFrame(() => {
      this.element?.classList.add('notifications-overlay--visible');
    });
  }

  public hide(): void {
    if (!this.element) return;

    this.element.classList.remove('notifications-overlay--visible');
    
    setTimeout(() => {
      if (this.element) {
        this.element.remove();
        this.element = null;
      }
    }, 300);
  }

  private createElement(): void {
    this.element = document.createElement('div');
    this.element.className = 'notifications-overlay';

    const muffinPortrait = getAssetPath('art/pets/muffin_portrait_transparent.png');

    this.element.innerHTML = `
      <div class="notifications-overlay__backdrop"></div>
      <div class="notifications-overlay__content">
        <div class="notifications-overlay__header">
          <div class="notifications-overlay__character">
            <img src="${muffinPortrait}" alt="Muffin" class="notifications-overlay__portrait" />
            <h2 class="notifications-overlay__title">Muffin's Messages</h2>
          </div>
          <button class="notifications-overlay__close" aria-label="Close">
            <span class="material-icons">close</span>
          </button>
        </div>
        
        <div class="notifications-overlay__body">
          ${this.renderNotifications()}
        </div>
      </div>
    `;

    this.attachEventListeners();
  }

  private renderNotifications(): string {
    if (this.notificationHistory.length === 0) {
      return `
        <div class="notifications-overlay__empty">
          <span class="material-icons">notifications_none</span>
          <p>No messages yet!</p>
          <p class="notifications-overlay__empty-hint">Muffin will send you helpful tips as you play.</p>
        </div>
      `;
    }

    return `
      <div class="notifications-list">
        ${this.notificationHistory.map(notification => this.renderNotificationItem(notification)).join('')}
      </div>
    `;
  }

  private renderNotificationItem(notification: NotificationHistoryItem): string {
    const timeAgo = this.formatTimeAgo(notification.timestamp);
    
    return `
      <div class="notification-item">
        <div class="notification-item__title">${notification.title}</div>
        <div class="notification-item__message">${notification.message}</div>
        <div class="notification-item__time">${timeAgo}</div>
      </div>
    `;
  }

  private formatTimeAgo(timestamp: number): string {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return new Date(timestamp).toLocaleDateString();
  }

  private attachEventListeners(): void {
    if (!this.element) return;

    // Close button
    const closeBtn = this.element.querySelector('.notifications-overlay__close');
    closeBtn?.addEventListener('click', () => this.hide());

    // Backdrop click to close
    const backdrop = this.element.querySelector('.notifications-overlay__backdrop');
    backdrop?.addEventListener('click', () => this.hide());

    // Escape key to close
    const escapeHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.hide();
        document.removeEventListener('keydown', escapeHandler);
      }
    };
    document.addEventListener('keydown', escapeHandler);
  }
}

