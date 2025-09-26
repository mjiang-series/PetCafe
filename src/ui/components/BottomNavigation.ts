// Bottom navigation component - Main navigation for mobile
import { EventSystem } from '../../systems/EventSystem';
import { GameStateManager } from '../../systems/GameState';

interface NavItem {
  id: string;
  icon: string;
  label: string;
  screenId: string;
  badge?: number;
}

export class BottomNavigation {
  private element: HTMLElement;
  private eventSystem: EventSystem;
  private gameState: GameStateManager;
  private currentScreen: string = 'cafe';
  
  private navItems: NavItem[] = [
    { id: 'cafe', icon: 'local_cafe', label: 'Café', screenId: 'cafe-overview' },
    { id: 'pets', icon: 'pets', label: 'Pets', screenId: 'pet-collection' },
    { id: 'gacha', icon: 'volunteer_activism', label: 'Adopt', screenId: 'gacha' },
    { id: 'messages', icon: 'chat_bubble', label: 'Messages', screenId: 'dm-list' },
    { id: 'blog', icon: 'article', label: 'Blog', screenId: 'blog' }
  ];

  constructor(eventSystem: EventSystem, gameState: GameStateManager) {
    this.eventSystem = eventSystem;
    this.gameState = gameState;
    this.element = this.createElement();
    this.setupEventListeners();
    this.updateBadges();
  }

  private createElement(): HTMLElement {
    const nav = document.createElement('nav');
    nav.className = 'bottom-navigation';
    
    const navHTML = this.navItems.map(item => `
      <button class="nav-item ${item.id === this.currentScreen ? 'active' : ''}" 
              data-nav="${item.id}" 
              data-screen="${item.screenId}"
              aria-label="${item.label}">
        <span class="nav-icon material-icons">${item.icon}</span>
        <span class="nav-label">${item.label}</span>
        <span class="nav-badge" data-badge="${item.id}" style="display: none;">0</span>
      </button>
    `).join('');
    
    nav.innerHTML = navHTML;
    return nav;
  }

  private setupEventListeners(): void {
    // Navigation clicks
    this.element.querySelectorAll('.nav-item').forEach(button => {
      button.addEventListener('click', (e) => {
        const target = e.currentTarget as HTMLElement;
        const screenId = target.getAttribute('data-screen');
        const navId = target.getAttribute('data-nav');
        
        if (screenId && navId) {
          this.handleNavigation(navId, screenId);
        }
      });
    });

    // Listen for badge updates
    this.eventSystem.on('pets:collection_updated', () => {
      this.updatePetsBadge();
    });

    // Listen for conversation updates
    this.eventSystem.on('conversation:message_added', () => {
      this.updateBadges();
    });

    this.eventSystem.on('conversation:marked_read', () => {
      this.updateBadges();
    });

    // Listen for screen changes to update active state
    this.eventSystem.on('ui:screen_shown', (data: { screenId: string }) => {
      this.updateActiveState(data.screenId);
    });
  }

  private handleNavigation(navId: string, screenId: string): void {
    if (this.currentScreen === navId) return;
    
    this.currentScreen = navId;
    this.updateActiveState(screenId);
    this.eventSystem.emit('ui:show_screen', { screenId });
  }

  private updateActiveState(screenId: string): void {
    // Handle sub-screens
    let targetScreenId = screenId;
    if (screenId.startsWith('dm-') && screenId !== 'dm-list') {
      targetScreenId = 'dm-list'; // Map individual DM screens to messages tab
    }
    
    // Find the nav item that matches this screen
    const navItem = this.navItems.find(item => item.screenId === targetScreenId);
    if (navItem) {
      this.currentScreen = navItem.id;
      
      // Update visual state
      this.element.querySelectorAll('.nav-item').forEach(button => {
        const navId = button.getAttribute('data-nav');
        button.classList.toggle('active', navId === navItem.id);
      });
    }
  }

  private updateBadges(): void {
    // Update pet collection badge
    this.updatePetsBadge();
    
    // Update messages badge
    const unreadCount = this.gameState.getTotalUnreadMessages();
    console.log('[BottomNavigation] Unread messages:', unreadCount);
    this.updateBadge('messages', unreadCount);
  }

  private updatePetsBadge(): void {
    const player = this.gameState.getPlayer();
    const collectedCount = player.pets?.length || 0;
    const totalCount = 15; // Total pets available
    
    if (collectedCount > 0 && collectedCount < totalCount) {
      this.updateBadge('pets', collectedCount);
    } else {
      this.updateBadge('pets', 0);
    }
  }

  private updateBadge(navId: string, count: number): void {
    const badge = this.element.querySelector(`[data-badge="${navId}"]`) as HTMLElement;
    if (badge) {
      badge.textContent = count > 99 ? '99+' : count.toString();
      badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
  }

  public getElement(): HTMLElement {
    return this.element;
  }

  public show(): void {
    this.element.style.display = 'flex';
    this.updateBadges();
  }

  public hide(): void {
    this.element.style.display = 'none';
  }

  public setActiveScreen(screenId: string): void {
    this.updateActiveState(screenId);
  }

  public cleanup(): void {
    // Remove event listeners
    this.eventSystem.off('dm:unread_count_changed', (data: { count: number }) => {
      this.updateBadge('messages', data.count);
    });
    this.eventSystem.off('pets:collection_updated', () => {
      this.updatePetsBadge();
    });
    this.eventSystem.off('ui:screen_shown', (data: { screenId: string }) => {
      this.updateActiveState(data.screenId);
    });
  }
}
