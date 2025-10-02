/**
 * Alert Notification System
 * Displays character-based alerts with Muffin's portrait and tutorial messages
 */

import { EventSystem } from '../../systems/EventSystem';
import { GameStateManager } from '../../systems/GameState';
import { getAssetPath } from '../../utils/assetPaths';

export interface AlertConfig {
  title: string;
  message: string;
  characterPortrait?: string;
  duration?: number; // in milliseconds, default 3000ms (3 seconds)
  tutorialId?: string; // if set, only shows once
}

export class AlertNotificationSystem {
  private eventSystem: EventSystem;
  private gameState: GameStateManager;
  private container: HTMLElement | null = null;
  private currentAlert: HTMLElement | null = null;
  private alertQueue: AlertConfig[] = [];
  private isShowingAlert: boolean = false;

  constructor(eventSystem: EventSystem, gameState: GameStateManager) {
    this.eventSystem = eventSystem;
    this.gameState = gameState;
    this.initialize();
    this.setupEventListeners();
  }

  private initialize(): void {
    // Create container for alerts
    this.container = document.createElement('div');
    this.container.className = 'alert-notification-container';
    document.body.appendChild(this.container);
  }

  private setupEventListeners(): void {
    this.eventSystem.on('alert:show', (data: AlertConfig) => {
      this.showAlert(data);
    });

    this.eventSystem.on('tutorial:show', (data: { title: string; message: string; tutorialId: string }) => {
      this.showTutorialAlert(data.tutorialId, data.title, data.message);
    });
  }

  public showAlert(config: AlertConfig): void {
    // Check if this is a tutorial that's already been shown
    if (config.tutorialId) {
      const player = this.gameState.getPlayer();
      if (player.tutorialFlags?.[config.tutorialId]) {
        console.log(`[AlertNotificationSystem] Tutorial '${config.tutorialId}' already shown, skipping`);
        return;
      }
      
      // Mark tutorial as shown
      player.tutorialFlags = player.tutorialFlags || {};
      player.tutorialFlags[config.tutorialId] = true;
      this.gameState.updatePlayer(player);
    }

    // Add to queue
    this.alertQueue.push(config);

    // Process queue if not currently showing an alert
    if (!this.isShowingAlert) {
      this.processQueue();
    }
  }

  public showTutorialAlert(tutorialId: string, title: string, message: string): void {
    // Check if tutorial has already been shown
    const player = this.gameState.getPlayer();
    if (player.tutorialFlags?.[tutorialId]) {
      return; // Don't show again
    }

    this.showAlert({
      title,
      message,
      tutorialId,
      characterPortrait: getAssetPath('art/pets/muffin_portrait_transparent.png'),
      duration: 3000
    });
  }

  private async processQueue(): Promise<void> {
    if (this.alertQueue.length === 0) {
      this.isShowingAlert = false;
      return;
    }

    this.isShowingAlert = true;
    const config = this.alertQueue.shift()!;

    await this.displayAlert(config);
    
    // Process next alert in queue
    this.processQueue();
  }

  private displayAlert(config: AlertConfig): Promise<void> {
    return new Promise((resolve) => {
      if (!this.container) {
        resolve();
        return;
      }

      // Create alert element
      const alert = document.createElement('div');
      alert.className = 'alert-notification';
      
      const portraitSrc = config.characterPortrait || getAssetPath('art/pets/muffin_portrait_transparent.png');
      const duration = config.duration || 3000;

      alert.innerHTML = `
        <div class="alert-notification__portrait">
          <img src="${portraitSrc}" alt="Muffin" />
        </div>
        <div class="alert-notification__content">
          <h3 class="alert-notification__title">${config.title}</h3>
          <p class="alert-notification__message">${config.message}</p>
        </div>
      `;

      // Add to container
      this.currentAlert = alert;
      this.container.appendChild(alert);

      // Trigger animation
      requestAnimationFrame(() => {
        alert.classList.add('alert-notification--visible');
      });

      // Auto-dismiss after duration
      setTimeout(() => {
        this.dismissCurrentAlert();
        resolve();
      }, duration);
    });
  }

  private dismissCurrentAlert(): void {
    if (!this.currentAlert) return;

    this.currentAlert.classList.remove('alert-notification--visible');
    this.currentAlert.classList.add('alert-notification--hiding');

    setTimeout(() => {
      if (this.currentAlert) {
        this.currentAlert.remove();
        this.currentAlert = null;
      }
    }, 300); // Match CSS transition duration
  }

  // Tutorial helper methods
  public showTutorialIfNeeded(tutorialId: string, title: string, message: string): void {
    const player = this.gameState.getPlayer();
    if (!player.tutorialFlags?.[tutorialId]) {
      this.showTutorialAlert(tutorialId, title, message);
    }
  }

  // Predefined tutorial messages
  public static readonly TUTORIALS = {
    NEW_GAME: {
      id: 'tutorial_new_game',
      title: "We're so happy you're here!",
      message: "Take a look around, there's some pets here already."
    },
    FIRST_CAFE_SECTION: {
      id: 'tutorial_first_cafe_section',
      title: "Pets help bring visitors!",
      message: "Complete tasks with pets so you can grow your cafe."
    },
    FIRST_MESSAGES: {
      id: 'tutorial_first_messages',
      title: "Aria, Kai and Elias are here to help",
      message: "You don't have to do this by yourself, you know."
    },
    FIRST_REWARDS: {
      id: 'tutorial_first_rewards',
      title: "You're building memories with us!",
      message: "Check out the Journal if you haven't already."
    },
    FIRST_ADOPT: {
      id: 'tutorial_first_adopt',
      title: "Moar friends!",
      message: "Bring home more pets so you can complete all the tasks."
    }
  };
}

