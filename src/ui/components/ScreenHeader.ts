// Screen header component - Contextual header for sub-screens
import { EventSystem } from '../../systems/EventSystem';

export interface ScreenHeaderConfig {
  title: string;
  showBackButton?: boolean;
  backTarget?: string;
  actions?: Array<{
    id: string;
    icon: string;
    label: string;
    badge?: number;
  }>;
}

export class ScreenHeader {
  private element: HTMLElement;
  private eventSystem: EventSystem;
  private config: ScreenHeaderConfig;

  constructor(eventSystem: EventSystem, config: ScreenHeaderConfig) {
    this.eventSystem = eventSystem;
    this.config = config;
    this.element = this.createElement();
    this.setupEventListeners();
  }

  private createElement(): HTMLElement {
    const header = document.createElement('div');
    header.className = 'screen-header floating-header';
    
    // Only create the header if there's a back button or actions
    if (!this.config.showBackButton && (!this.config.actions || this.config.actions.length === 0)) {
      header.style.display = 'none';
      return header;
    }
    
    const backButton = this.config.showBackButton ? `
      <button class="btn-floating-back" data-action="back" aria-label="Go back">
        <span class="material-icons">arrow_back</span>
      </button>
    ` : '';
    
    const actions = this.config.actions ? this.config.actions.map(action => {
      // Check if icon is a Material Icon name (no emoji characters)
      const isMaterialIcon = /^[a-z_]+$/.test(action.icon);
      const iconHTML = isMaterialIcon 
        ? `<span class="material-icons">${action.icon}</span>`
        : `<span class="icon">${action.icon}</span>`;
      
      return `
        <button class="btn-floating-action" data-action="${action.id}" aria-label="${action.label}">
          ${iconHTML}
          ${action.badge ? `<span class="action-badge" data-badge="${action.id}">${action.badge}</span>` : ''}
        </button>
      `;
    }).join('') : '';
    
    header.innerHTML = `
      ${backButton}
      ${actions ? `<div class="floating-actions">${actions}</div>` : ''}
    `;
    
    return header;
  }

  private setupEventListeners(): void {
    // Back button
    if (this.config.showBackButton) {
      this.element.querySelector('[data-action="back"]')?.addEventListener('click', () => {
        if (this.config.backTarget) {
          this.eventSystem.emit('ui:show_screen', { screenId: this.config.backTarget });
        } else {
          this.eventSystem.emit('ui:navigate_back');
        }
      });
    }

    // Action buttons
    if (this.config.actions) {
      this.config.actions.forEach(action => {
        this.element.querySelector(`[data-action="${action.id}"]`)?.addEventListener('click', () => {
          this.eventSystem.emit('ui:header_action', { actionId: action.id });
        });
      });
    }
  }

  public updateTitle(title: string): void {
    const titleElement = this.element.querySelector('.header-title');
    if (titleElement) {
      titleElement.textContent = title;
    }
  }

  public updateBadge(actionId: string, count: number): void {
    const badge = this.element.querySelector(`[data-badge="${actionId}"]`) as HTMLElement;
    if (badge) {
      badge.textContent = count.toString();
      badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public cleanup(): void {
    // Remove all event listeners
    const buttons = this.element.querySelectorAll('button');
    buttons.forEach(button => {
      button.replaceWith(button.cloneNode(true));
    });
  }
}
