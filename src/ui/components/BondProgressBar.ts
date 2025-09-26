// Bond Progress Bar Component - Shows NPC bond level and progress
import { EventSystem } from '../../systems/EventSystem';
import { GameStateManager } from '../../systems/GameState';

export class BondProgressBar {
  private element: HTMLElement | null = null;
  private eventSystem: EventSystem;
  private gameState: GameStateManager;
  private npcId: string;
  private bondProgressHandler: ((data: any) => void) | null = null;
  private bondLevelUpHandler: ((data: any) => void) | null = null;

  constructor(eventSystem: EventSystem, gameState: GameStateManager, npcId: string) {
    this.eventSystem = eventSystem;
    this.gameState = gameState;
    this.npcId = npcId;
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.bondProgressHandler = (data: any) => {
      if (data.npcId === this.npcId) {
        this.updateDisplay();
      }
    };

    this.bondLevelUpHandler = (data: any) => {
      if (data.npcId === this.npcId) {
        this.showLevelUpAnimation(data.newLevel);
      }
    };

    this.eventSystem.on('bond:progress', this.bondProgressHandler);
    this.eventSystem.on('npc:bond_level_up', this.bondLevelUpHandler);
    this.eventSystem.on('npc:bond_increased', this.renderHandler);
    this.eventSystem.on('npc:bond_level_up', this.levelUpHandler);
    this.eventSystem.on('pet:affinity_updated', this.renderHandler);
    this.eventSystem.on('gacha:bond_awarded', this.renderHandler);
  }

  createElement(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'bond-progress-container';

    const bond = this.getBondData();

    container.innerHTML = `
      <div class="bond-header">
        <span class="bond-label">Bond Level</span>
        <span class="bond-level">${bond.level}</span>
      </div>
      <div class="bond-progress-bar">
        <div class="bond-progress-fill" style="width: ${bond.percentage}%"></div>
        <div class="bond-progress-text">${bond.current}/${bond.max}</div>
      </div>
      <div class="bond-milestones">
        ${this.createMilestoneMarkers(bond.level)}
      </div>
    `;

    this.element = container;
    return container;
  }

  private getBondData(): { level: number; current: number; max: number; percentage: number } {
    const player = this.gameState.getPlayer();
    const bond = player.npcBonds.find(b => b.npcId === this.npcId);
    
    if (!bond) {
      return { level: 1, current: 0, max: 100, percentage: 0 };
    }

    return {
      level: bond.bondLevel,
      current: bond.bondPoints,
      max: bond.maxBondPoints,
      percentage: (bond.bondPoints / bond.maxBondPoints) * 100
    };
  }

  private createMilestoneMarkers(currentLevel: number): string {
    const milestones = [2, 3, 4, 5];
    return milestones.map(level => {
      const isReached = currentLevel >= level;
      const icon = this.getMilestoneIcon(level);
      return `
        <div class="bond-milestone ${isReached ? 'reached' : ''}" data-level="${level}">
          <span class="milestone-icon">${icon}</span>
          <span class="milestone-level">Lv${level}</span>
        </div>
      `;
    }).join('');
  }

  private getMilestoneIcon(level: number): string {
    const icons: Record<number, string> = {
      2: '💬', // Advanced conversations
      3: '📞', // Voice calls
      4: '💝', // Special content
      5: '💖'  // Max bond
    };
    return icons[level] || '⭐';
  }

  updateDisplay(): void {
    if (!this.element) return;

    const bond = this.getBondData();
    
    // Update level
    const levelElement = this.element.querySelector('.bond-level');
    if (levelElement) {
      levelElement.textContent = bond.level.toString();
    }

    // Update progress bar
    const fillElement = this.element.querySelector('.bond-progress-fill') as HTMLElement;
    if (fillElement) {
      fillElement.style.width = `${bond.percentage}%`;
    }

    // Update progress text
    const textElement = this.element.querySelector('.bond-progress-text');
    if (textElement) {
      textElement.textContent = `${bond.current}/${bond.max}`;
    }

    // Update milestones
    const milestoneContainer = this.element.querySelector('.bond-milestones');
    if (milestoneContainer) {
      milestoneContainer.innerHTML = this.createMilestoneMarkers(bond.level);
    }
  }

  private showLevelUpAnimation(newLevel: number): void {
    if (!this.element) return;

    // Add animation class
    this.element.classList.add('bond-level-up');

    // Create floating text
    const floatingText = document.createElement('div');
    floatingText.className = 'bond-level-up-text';
    floatingText.textContent = `Bond Level ${newLevel}!`;
    this.element.appendChild(floatingText);

    // Remove animation after it completes
    setTimeout(() => {
      this.element?.classList.remove('bond-level-up');
      floatingText.remove();
      this.updateDisplay();
    }, 2000);
  }

  destroy(): void {
    // Clean up event listeners
    if (this.bondProgressHandler) {
      this.eventSystem.off('bond:progress', this.bondProgressHandler);
      this.bondProgressHandler = null;
    }
    if (this.bondLevelUpHandler) {
      this.eventSystem.off('npc:bond_level_up', this.bondLevelUpHandler);
      this.bondLevelUpHandler = null;
    }
    
    // Remove element from DOM if it exists
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }
}
