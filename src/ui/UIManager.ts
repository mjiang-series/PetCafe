// UI management system for handling screens, overlays, and interactions
import { EventSystem } from '../systems/EventSystem';
import { UIState, UINotification } from '../models';
import { OfflineReportModal } from './OfflineReportModal';

export interface UIScreen {
  id: string;
  element: HTMLElement;
  initialize(): void;
  show(): void;
  hide(): void;
  cleanup(): void;
}

export interface UIOverlay {
  id: string;
  element: HTMLElement;
  show(): void;
  hide(): void;
  cleanup(): void;
}

export class UIManager {
  private eventSystem: EventSystem;
  private screens: Map<string, UIScreen> = new Map();
  private overlays: Map<string, UIOverlay> = new Map();
  private currentScreen?: UIScreen;
  private activeOverlays: Set<string> = new Set();
  private notificationContainer?: HTMLElement;
  private offlineReportModal: OfflineReportModal;

  constructor(eventSystem: EventSystem) {
    this.eventSystem = eventSystem;
    this.offlineReportModal = new OfflineReportModal(eventSystem);
    this.setupEventListeners();
    this.initializeDOM();
  }

  // Screen management
  registerScreen(screen: UIScreen): void {
    this.screens.set(screen.id, screen);
    screen.initialize();
    console.log(`[UIManager] Screen registered: ${screen.id}`);
  }

  getScreen(screenId: string): UIScreen | undefined {
    return this.screens.get(screenId);
  }

  getCurrentScreen(): UIScreen | undefined {
    return this.currentScreen;
  }

  showScreen(screenId: string, data?: any): void {
    const screen = this.screens.get(screenId);
    if (!screen) {
      console.error(`[UIManager] Screen not found: ${screenId}`);
      return;
    }

    // Hide current screen
    if (this.currentScreen) {
      this.currentScreen.hide();
    }

    // Show new screen
    this.currentScreen = screen;
    screen.show(data);

    this.eventSystem.emit('ui:screen_changed', { 
      screenId, 
      previousScreen: this.currentScreen?.id,
      data 
    });

    console.log(`[UIManager] Screen shown: ${screenId}`);
  }

  // Overlay management
  registerOverlay(overlay: UIOverlay): void {
    this.overlays.set(overlay.id, overlay);
    console.log(`[UIManager] Overlay registered: ${overlay.id}`);
  }

  showOverlay(overlayId: string, data?: any): void {
    const overlay = this.overlays.get(overlayId);
    if (!overlay) {
      // Some overlays (like notifications) handle themselves via events
      // Only log as warning, not error
      if (overlayId !== 'notifications') {
        console.error(`[UIManager] Overlay not found: ${overlayId}`);
      }
      return;
    }

    if (!this.activeOverlays.has(overlayId)) {
      this.activeOverlays.add(overlayId);
      overlay.show();
      
      this.eventSystem.emit('ui:overlay_shown', { overlayId, data });
      console.log(`[UIManager] Overlay shown: ${overlayId}`);
    }
  }

  hideOverlay(overlayId: string): void {
    const overlay = this.overlays.get(overlayId);
    if (!overlay) {
      console.error(`[UIManager] Overlay not found: ${overlayId}`);
      return;
    }

    if (this.activeOverlays.has(overlayId)) {
      this.activeOverlays.delete(overlayId);
      overlay.hide();
      
      this.eventSystem.emit('ui:overlay_hidden', { overlayId });
      console.log(`[UIManager] Overlay hidden: ${overlayId}`);
    }
  }

  hideAllOverlays(): void {
    Array.from(this.activeOverlays).forEach(overlayId => {
      this.hideOverlay(overlayId);
    });
  }

  // Notification system
  showNotification(notification: Omit<UINotification, 'id' | 'timestamp'>): string {
    const id = `notification_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const fullNotification: UINotification = {
      id,
      timestamp: Date.now(),
      ...notification
    };

    this.createNotificationElement(fullNotification);
    this.eventSystem.emit('ui:notification_added', fullNotification);

    // Auto-remove notification after duration
    if (notification.duration && notification.duration > 0) {
      setTimeout(() => {
        this.hideNotification(id);
      }, notification.duration);
    }

    return id;
  }

  hideNotification(notificationId: string): void {
    const element = document.getElementById(`notification-${notificationId}`);
    if (element) {
      element.classList.add('notification--hiding');
      setTimeout(() => {
        element.remove();
      }, 300); // Match CSS transition duration
    }
  }

  // Loading state management
  showLoading(message?: string): void {
    const loadingOverlay = this.overlays.get('loading');
    if (loadingOverlay) {
      this.showOverlay('loading', { message });
    } else {
      this.createLoadingOverlay(message);
    }
    
    this.eventSystem.emit('ui:loading_changed', { loading: true, message });
  }

  hideLoading(): void {
    this.hideOverlay('loading');
    this.eventSystem.emit('ui:loading_changed', { loading: false });
  }

  // Error handling
  showError(message: string, title: string = 'Error'): void {
    this.showNotification({
      type: 'error',
      title,
      message,
      duration: 5000,
      actions: [
        {
          label: 'Dismiss',
          action: 'dismiss',
          style: 'secondary'
        }
      ]
    });
  }

  // Success feedback
  showSuccess(message: string, title: string = 'Success'): void {
    this.showNotification({
      type: 'success',
      title,
      message,
      duration: 3000
    });
  }

  // Interactive elements management
  addClickHandler(selector: string, handler: (event: Event) => void): void {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      element.addEventListener('click', handler);
      element.addEventListener('touchend', handler); // Mobile support
    });
  }

  addDragDropHandlers(
    dragSelector: string,
    dropSelector: string,
    handlers: {
      onDragStart?: (event: DragEvent) => void;
      onDragOver?: (event: DragEvent) => void;
      onDrop?: (event: DragEvent) => void;
    }
  ): void {
    // Drag elements
    const dragElements = document.querySelectorAll(dragSelector);
    dragElements.forEach(element => {
      element.setAttribute('draggable', 'true');
      
      element.addEventListener('dragstart', (event) => {
        element.classList.add('dragging');
        handlers.onDragStart?.(event as DragEvent);
      });
      
      element.addEventListener('dragend', () => {
        element.classList.remove('dragging');
      });
    });

    // Drop zones
    const dropElements = document.querySelectorAll(dropSelector);
    dropElements.forEach(element => {
      element.addEventListener('dragover', (event) => {
        event.preventDefault();
        element.classList.add('drag-over');
        handlers.onDragOver?.(event as DragEvent);
      });
      
      element.addEventListener('dragleave', () => {
        element.classList.remove('drag-over');
      });
      
      element.addEventListener('drop', (event) => {
        event.preventDefault();
        element.classList.remove('drag-over');
        handlers.onDrop?.(event as DragEvent);
      });
    });
  }

  // Responsive design helpers
  updateViewport(): void {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    this.eventSystem.emit('ui:viewport_changed', {
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  // Accessibility helpers
  announceToScreenReader(message: string): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    setTimeout(() => announcement.remove(), 1000);
  }

  // Private methods
  private initializeDOM(): void {
    // Create notification container
    this.notificationContainer = document.createElement('div');
    this.notificationContainer.id = 'notification-container';
    this.notificationContainer.className = 'notification-container';
    document.body.appendChild(this.notificationContainer);

    // Set up viewport handling
    this.updateViewport();
    window.addEventListener('resize', () => this.updateViewport());

    // Set up global error handling
    window.addEventListener('error', (event) => {
      console.error('[UIManager] Global error:', event.error);
      this.showError('An unexpected error occurred. Please try again.');
    });
  }

  private setupEventListeners(): void {
    // Listen for escape key to close overlays
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (this.activeOverlays.size > 0) {
          // Close the most recently opened overlay
          const lastOverlay = Array.from(this.activeOverlays).pop();
          if (lastOverlay) {
            this.hideOverlay(lastOverlay);
          }
        }
      }
    });
  }

  private createNotificationElement(notification: UINotification): void {
    if (!this.notificationContainer) return;

    const element = document.createElement('div');
    element.id = `notification-${notification.id}`;
    element.className = `notification notification--${notification.type}`;
    
    element.innerHTML = `
      <div class="notification__content">
        <h4 class="notification__title">${notification.title}</h4>
        <p class="notification__message">${notification.message}</p>
      </div>
      ${notification.actions ? `
        <div class="notification__actions">
          ${notification.actions.map(action => `
            <button class="btn btn--${action.style || 'primary'}" data-action="${action.action}">
              ${action.label}
            </button>
          `).join('')}
        </div>
      ` : ''}
      <button class="notification__close" aria-label="Close notification">&times;</button>
    `;

    // Add event listeners
    const closeBtn = element.querySelector('.notification__close');
    closeBtn?.addEventListener('click', () => this.hideNotification(notification.id));

    const actionBtns = element.querySelectorAll('[data-action]');
    actionBtns.forEach(btn => {
      btn.addEventListener('click', (event) => {
        const action = (event.target as HTMLElement).getAttribute('data-action');
        this.eventSystem.emit('ui:notification_action', { 
          notificationId: notification.id, 
          action 
        });
        
        if (action === 'dismiss') {
          this.hideNotification(notification.id);
        }
      });
    });

    this.notificationContainer.appendChild(element);
    
    // Trigger entrance animation
    setTimeout(() => element.classList.add('notification--visible'), 10);
  }

  private createLoadingOverlay(message?: string): void {
    const overlay = document.createElement('div');
    overlay.id = 'loading-overlay';
    overlay.className = 'loading-overlay';
    
    overlay.innerHTML = `
      <div class="loading-spinner">
        <div class="pawprint-spinner"></div>
        ${message ? `<p class="loading-message">${message}</p>` : ''}
      </div>
    `;

    document.body.appendChild(overlay);

    // Register as overlay
    this.registerOverlay({
      id: 'loading',
      element: overlay,
      show: () => overlay.classList.add('visible'),
      hide: () => overlay.classList.remove('visible'),
      cleanup: () => overlay.remove()
    });
  }
}

