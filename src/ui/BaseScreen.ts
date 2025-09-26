// Base screen class for all game screens
import { UIScreen } from './UIManager';
import { EventSystem } from '../systems/EventSystem';
import { GameStateManager } from '../systems/GameState';

export abstract class BaseScreen implements UIScreen {
  public readonly id: string;
  public element!: HTMLElement;
  protected eventSystem: EventSystem;
  protected gameState: GameStateManager;
  protected isVisible: boolean = false;

  constructor(id: string, eventSystem: EventSystem, gameState: GameStateManager) {
    this.id = id;
    this.eventSystem = eventSystem;
    this.gameState = gameState;
    // Element creation moved to initialize()
  }

  abstract createElement(): HTMLElement;
  abstract onShow(data?: any): void;
  abstract onHide(): void;

  initialize(): void {
    // Create element now that subclass constructor has run
    this.element = this.createElement();
    this.setupEventListeners();
    this.element.style.display = 'none';
    document.body.appendChild(this.element);
  }

  show(data?: any): void {
    if (this.isVisible) return;
    
    // Hide unified navigation for non-unified screens (like title screen)
    if (!this.element.classList.contains('with-unified-nav')) {
      const header = document.querySelector('.persistent-header') as HTMLElement;
      const nav = document.querySelector('.bottom-navigation') as HTMLElement;
      
      if (header) header.style.display = 'none';
      if (nav) nav.style.display = 'none';
    }
    
    this.element.style.display = 'block';
    this.isVisible = true;
    this.onShow(data);
    
    // Trigger entrance animation
    requestAnimationFrame(() => {
      this.element.classList.add('screen--visible');
    });
  }

  hide(): void {
    if (!this.isVisible) return;
    
    this.element.classList.remove('screen--visible');
    this.isVisible = false;
    this.onHide();
    
    // Hide after animation completes
    setTimeout(() => {
      if (!this.isVisible) { // Double check in case show() was called during animation
        this.element.style.display = 'none';
      }
    }, 300); // Match CSS transition duration
  }

  cleanup(): void {
    // Subclasses can override for additional cleanup
    if (this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }

  protected setupEventListeners(): void {
    // Subclasses should override to add their event listeners
  }

  protected addClickHandler(selector: string, handler: (event: Event) => void): void {
    const elements = this.element.querySelectorAll(selector);
    console.log(`[BaseScreen] Adding click handler for ${selector}, found ${elements.length} elements`);
    elements.forEach(element => {
      // Track if touch was used to prevent double firing
      let touchUsed = false;
      
      element.addEventListener('touchstart', () => {
        touchUsed = true;
      });
      
      element.addEventListener('click', (e) => {
        if (!touchUsed) {
          handler(e);
        }
        touchUsed = false;
      });
      
      // Add touch support for mobile
      element.addEventListener('touchend', (e) => {
        e.preventDefault(); // Prevent double-tap zoom and mouse events
        handler(e);
        touchUsed = true;
      });
    });
  }
}
