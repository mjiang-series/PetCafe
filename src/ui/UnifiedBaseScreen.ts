// Base class for screens using unified navigation
import { BaseScreen } from './BaseScreen';
import { EventSystem } from '../systems/EventSystem';
import { GameStateManager } from '../systems/GameState';
import { ScreenHeader, ScreenHeaderConfig } from './components/ScreenHeader';
import { PersistentHeader } from './components/PersistentHeader';
import { BottomNavigation } from './components/BottomNavigation';

export abstract class UnifiedBaseScreen extends BaseScreen {
  protected screenHeader?: ScreenHeader;
  private static persistentHeader?: PersistentHeader;
  private static bottomNavigation?: BottomNavigation;

  constructor(id: string, eventSystem: EventSystem, gameState: GameStateManager) {
    super(id, eventSystem, gameState);
  }

  /**
   * Override createElement to wrap content with navigation
   */
  createElement(): HTMLElement {
    const element = document.createElement('div');
    element.id = this.id;
    element.className = `screen ${this.id} with-unified-nav`;
    
    // Create screen header if needed
    const headerConfig = this.getScreenHeaderConfig();
    if (headerConfig) {
      this.screenHeader = new ScreenHeader(this.eventSystem, headerConfig);
      element.appendChild(this.screenHeader.getElement());
    }
    
    // Create content wrapper
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'screen-content';
    contentWrapper.innerHTML = this.createContent();
    element.appendChild(contentWrapper);
    
    return element;
  }

  /**
   * Abstract method for screens to provide their content
   */
  protected abstract createContent(): string;

  /**
   * Abstract method for screens to provide header configuration
   * Return null for screens that don't need a header
   */
  protected abstract getScreenHeaderConfig(): ScreenHeaderConfig | null;

  /**
   * Override to determine if bottom navigation should be shown
   * Main screens should return true, sub-screens should return false
   */
  protected showBottomNav(): boolean {
    return true;
  }

  /**
   * Override show to manage navigation visibility
   */
  override show(data?: any): void {
    super.show(data);
    
    // Ensure navigation components exist
    this.ensureNavigationComponents();
    
    // Show/hide navigation based on screen type
    if (this.showBottomNav()) {
      UnifiedBaseScreen.bottomNavigation?.show();
    } else {
      UnifiedBaseScreen.bottomNavigation?.hide();
    }
    
    // Always show persistent header for unified screens
    UnifiedBaseScreen.persistentHeader?.show();
    
    // Update active navigation state
    UnifiedBaseScreen.bottomNavigation?.setActiveScreen(this.id);
    
    // Emit screen shown event
    this.eventSystem.emit('ui:screen_shown', { screenId: this.id });
  }

  /**
   * Ensure navigation components are created
   */
  private ensureNavigationComponents(): void {
    const app = document.getElementById('app');
    if (!app) return;

    // Create persistent header if it doesn't exist
    if (!UnifiedBaseScreen.persistentHeader) {
      UnifiedBaseScreen.persistentHeader = new PersistentHeader(this.eventSystem, this.gameState);
      const headerElement = UnifiedBaseScreen.persistentHeader.getElement();
      
      // Insert at the beginning of app
      if (!document.querySelector('.persistent-header')) {
        app.insertBefore(headerElement, app.firstChild);
      }
    }

    // Create bottom navigation if it doesn't exist
    if (!UnifiedBaseScreen.bottomNavigation) {
      UnifiedBaseScreen.bottomNavigation = new BottomNavigation(this.eventSystem, this.gameState);
      const navElement = UnifiedBaseScreen.bottomNavigation.getElement();
      
      // Append to app
      if (!document.querySelector('.bottom-navigation')) {
        app.appendChild(navElement);
      }
    }
  }

  /**
   * Helper to update screen header badge
   */
  protected updateScreenBadge(actionId: string, count: number): void {
    this.screenHeader?.updateBadge(actionId, count);
  }

  /**
   * Cleanup navigation components
   */
  override cleanup(): void {
    super.cleanup();
    
    if (this.screenHeader) {
      this.screenHeader.cleanup();
      this.screenHeader = undefined;
    }
  }

  /**
   * Static method to cleanup all navigation components
   */
  static cleanupNavigation(): void {
    if (UnifiedBaseScreen.persistentHeader) {
      UnifiedBaseScreen.persistentHeader.cleanup();
      UnifiedBaseScreen.persistentHeader = undefined;
    }
    
    if (UnifiedBaseScreen.bottomNavigation) {
      UnifiedBaseScreen.bottomNavigation.cleanup();
      UnifiedBaseScreen.bottomNavigation = undefined;
    }
  }
}
