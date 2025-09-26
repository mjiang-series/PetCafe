import { EventSystem } from '../../systems/EventSystem';

interface SceneDialogue {
  speaker: string;
  text: string;
  emotion?: string;
  portrait?: string;
}

interface SceneConfig {
  sceneId: string;
  title: string;
  background?: string;
  dialogues: SceneDialogue[];
  rewards?: {
    bond?: { npcId: string; points: number };
  };
}

export class ScenePlayer {
  private eventSystem: EventSystem;
  private container: HTMLElement | null = null;
  private overlay: HTMLElement | null = null;
  private scene: SceneConfig | null = null;
  private currentIndex = 0;

  constructor(eventSystem: EventSystem) {
    this.eventSystem = eventSystem;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.eventSystem.on('scene:play', (data: { sceneId: string; config?: SceneConfig }) => {
      if (data.config) {
        this.playScene(data.config);
      }
    });
  }

  private playScene(scene: SceneConfig): void {
    this.scene = scene;
    this.currentIndex = 0;

    if (!this.overlay) {
      this.overlay = document.createElement('div');
      this.overlay.className = 'scene-overlay';
      document.body.appendChild(this.overlay);
    }

    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'scene-player';
      this.overlay.appendChild(this.container);
    }

    document.body.classList.add('scene-active');
    this.render();
  }

  private render(): void {
    if (!this.scene || !this.container) return;

    const dialogue = this.scene.dialogues[this.currentIndex];
    if (!dialogue) {
      this.finishScene();
      return;
    }

    this.container.innerHTML = `
      <div class="scene-background" style="background-image: url('${this.scene.background || ''}')"></div>
      <div class="scene-content">
        <h2 class="scene-title">${this.scene.title}</h2>
        <div class="scene-dialogue">
          <div class="scene-speaker">${dialogue.speaker}</div>
          <div class="scene-text">${dialogue.text}</div>
        </div>
        <div class="scene-controls">
          <button class="scene-next" data-action="next">Continue</button>
        </div>
      </div>
    `;

    const nextButton = this.container.querySelector('[data-action="next"]');
    if (nextButton) {
      nextButton.addEventListener('click', () => this.advance());
    }
  }

  private advance(): void {
    this.currentIndex++;
    if (this.scene && this.currentIndex >= this.scene.dialogues.length) {
      this.finishScene();
    } else {
      this.render();
    }
  }

  private finishScene(): void {
    if (!this.scene) return;

    if (this.scene.rewards?.bond) {
      this.eventSystem.emit('npc:bond_points_awarded', this.scene.rewards.bond);
    }

    this.eventSystem.emit('scene:completed', { sceneId: this.scene.sceneId });
    this.cleanup();
  }

  private cleanup(): void {
    if (this.container) {
      this.container.remove();
      this.container = null;
    }
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    document.body.classList.remove('scene-active');
    this.scene = null;
    this.currentIndex = 0;
  }
}
