// Shift Rewards Modal - Modern rewards display with bond progress
import { EventSystem } from '../../systems/EventSystem';
import { GameStateManager } from '../../systems/GameState';
import { ShiftRewards } from '../../models/Shift';
import { getNPCById } from '../../utils/npcData';

export interface ShiftRewardsData {
  shift: any;
  rewards: ShiftRewards;
  npcId: string;
  bondPointsEarned?: number;
  newBondLevel?: number;
}

export class ShiftRewardsModal {
  private element: HTMLElement | null = null;
  private eventSystem: EventSystem;
  private gameState: GameStateManager;
  private onClose?: () => void;
  private isClosing: boolean = false;

  constructor(eventSystem: EventSystem, gameState: GameStateManager) {
    this.eventSystem = eventSystem;
    this.gameState = gameState;
  }

  show(data: ShiftRewardsData, onClose?: () => void): void {
    this.onClose = onClose;
    this.isClosing = false; // Reset the closing flag
    this.createElement(data);
    document.body.appendChild(this.element!);

    // Add show animation
    requestAnimationFrame(() => {
      this.element?.classList.add('show');
    });

    // Setup close handlers
    this.setupEventListeners();
  }

  private createElement(data: ShiftRewardsData): void {
    const npc = getNPCById(data.npcId);
    const npcName = npc?.name || 'Helper';
    
    const container = document.createElement('div');
    container.className = 'shift-rewards-modal';
    
    container.innerHTML = `
      <div class="modal-backdrop"></div>
      <div class="modal-content">
        <div class="rewards-header">
          <h2>Shift Complete!</h2>
          <div class="npc-reaction">
            <img src="${this.getNPCPortraitPath(npc)}" alt="${npcName}" class="npc-portrait">
            <div class="speech-bubble">
              ${this.getNPCReaction(data.npcId, data.rewards)}
            </div>
          </div>
        </div>
        
        <div class="rewards-body">
          ${this.createRewardsSection(data.rewards)}
          ${this.createBondSection(data)}
          ${this.createMemorySection(data.rewards)}
        </div>
        
        <div class="rewards-footer">
          <button class="btn-primary collect-btn">
            <span class="btn-text">Collect Rewards</span>
            <span class="btn-icon material-icons">auto_awesome</span>
          </button>
        </div>
      </div>
    `;
    
    this.element = container;
  }

  private createRewardsSection(rewards: ShiftRewards): string {
    let html = '<div class="rewards-section">';
    html += '<h3>Rewards Earned</h3>';
    html += '<div class="reward-items">';
    
    // Base rewards
    html += `
      <div class="reward-item">
        <span class="reward-icon material-icons icon-gold">paid</span>
        <span class="reward-text">
          <span class="reward-amount">${rewards.coins}</span>
          <span class="reward-label">Coins</span>
        </span>
      </div>
    `;
    
    if (rewards.helperXP > 0) {
      html += `
        <div class="reward-item">
          <span class="reward-icon material-icons">favorite</span>
          <span class="reward-text">
            <span class="reward-amount">${rewards.helperXP}</span>
            <span class="reward-label">Helper XP</span>
          </span>
        </div>
      `;
    }
    
    // Bonus rewards
    if (rewards.bonusRewards) {
      if (rewards.bonusRewards.premiumCurrency) {
        html += `
          <div class="reward-item bonus">
            <span class="reward-icon material-icons icon-gem">diamond</span>
            <span class="reward-text">
              <span class="reward-amount">+${rewards.bonusRewards.premiumCurrency}</span>
              <span class="reward-label">Gems</span>
            </span>
          </div>
        `;
      }
      
      if (rewards.bonusRewards.dupeTokens) {
        html += `
          <div class="reward-item bonus">
            <span class="reward-icon material-icons">local_activity</span>
            <span class="reward-text">
              <span class="reward-amount">+${rewards.bonusRewards.dupeTokens}</span>
              <span class="reward-label">Tokens</span>
            </span>
          </div>
        `;
      }
    }
    
    html += '</div></div>';
    return html;
  }

  private createBondSection(data: ShiftRewardsData): string {
    if (!data.bondPointsEarned || data.bondPointsEarned === 0) return '';
    
    const bond = this.gameState.getPlayer().npcBonds.find(b => b.npcId === data.npcId);
    if (!bond) return '';
    
    let html = '<div class="bond-progress-section">';
    html += '<h3>Bond Progress</h3>';
    
    // Bond points earned
    html += `
      <div class="bond-points-earned">
        <span class="bond-icon material-icons icon-love">favorite</span>
        <span class="bond-text">+${data.bondPointsEarned} Bond Points</span>
      </div>
    `;
    
    // Progress bar
    const percentage = (bond.bondPoints / bond.maxBondPoints) * 100;
    html += `
      <div class="bond-progress-display">
        <div class="bond-level-info">
          <span>Level ${bond.bondLevel}</span>
          <span>${bond.bondPoints}/${bond.maxBondPoints}</span>
        </div>
        <div class="bond-progress-bar">
          <div class="bond-progress-fill" style="width: ${percentage}%"></div>
        </div>
      </div>
    `;
    
    // Level up notification
    if (data.newBondLevel) {
      html += `
        <div class="bond-level-up">
          <span class="level-up-icon material-icons">celebration</span>
          <span class="level-up-text">Bond Level ${data.newBondLevel}!</span>
        </div>
      `;
    }
    
    html += '</div>';
    return html;
  }

  private createMemorySection(rewards: ShiftRewards): string {
    if (!rewards.memoryCandidateId) return '';
    
    return `
      <div class="memory-section">
        <div class="memory-created">
          <span class="memory-icon material-icons">photo_camera</span>
          <span class="memory-text">New Memory Created!</span>
        </div>
        <p class="memory-hint">Check your memories to publish it to your blog!</p>
      </div>
    `;
  }

  private getNPCReaction(npcId: string, rewards: ShiftRewards): string {
    const reactions: Record<string, { good: string; great: string; perfect: string }> = {
      aria: {
        good: "Great job! The pets loved helping in the bakery!",
        great: "Wonderful work! The smell of fresh treats filled the air!",
        perfect: "Amazing! This was one of our best shifts ever! 🍰"
      },
      kai: {
        good: "Nice work! The pets had a blast!",
        great: "Awesome job! Everyone's energy was through the roof!",
        perfect: "INCREDIBLE! That was the most fun shift EVER! 🎉"
      },
      elias: {
        good: "Well done... The pets look lovely.",
        great: "Beautiful work... Their coats are shining.",
        perfect: "Perfection... This was truly a work of art. ✨"
      }
    };
    
    const npcReactions = reactions[npcId] || reactions.aria;
    
    // Determine quality based on rewards amount
    // Perfect: Generated memory or high coin rewards
    if (rewards.memoryCandidateId || rewards.coins >= 100) {
      return npcReactions.perfect;
    } 
    // Great: Good rewards
    else if (rewards.coins >= 50) {
      return npcReactions.great;
    }
    // Good: Base rewards
    return npcReactions.good;
  }

  private setupEventListeners(): void {
    // Close on backdrop click
    const backdrop = this.element?.querySelector('.modal-backdrop');
    backdrop?.addEventListener('click', () => this.close());
    
    // Collect button
    const collectBtn = this.element?.querySelector('.collect-btn');
    collectBtn?.addEventListener('click', () => this.close());
    
    // ESC key
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.close();
        document.removeEventListener('keydown', handleEsc);
      }
    };
    document.addEventListener('keydown', handleEsc);
  }

  private close(): void {
    // Prevent double-closing
    if (this.isClosing) return;
    this.isClosing = true;
    
    this.element?.classList.add('hide');
    
    setTimeout(() => {
      this.element?.remove();
      this.element = null;
      this.onClose?.();
    }, 300);
  }

  private getNPCPortraitPath(npc: any): string {
    if (!npc) return 'art/ui/placeholder_icon.svg';
    
    // Try the defined portrait first
    const portrait = npc.artRefs?.portrait;
    if (portrait) {
      // Remove any leading slashes for relative paths
      return portrait.startsWith('/') ? portrait.substring(1) : portrait;
    }
    
    // Fallback to placeholder
    const npcId = npc.npcId || 'aria';
    return `art/npc/${npcId}/placeholder_portrait.svg`;
  }
}
