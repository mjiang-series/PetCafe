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
          ${this.createBondSection(data)}
          ${this.createRewardsSection(data.rewards)}
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
    
    // Add staffing bonus message if coins are above base
    if (rewards.coins > 1800) {
      const bonusCoinAmount = rewards.coins - 1800;
      html += `<p class="staffing-bonus">+${bonusCoinAmount} bonus coins</p>`;
    }
    
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
      // Skip helper XP display - deprecated
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
      
      if (rewards.bonusRewards.freeGachaCurrency) {
        html += `
          <div class="reward-item bonus">
            <span class="reward-icon material-icons">confirmation_number</span>
            <span class="reward-text">
              <span class="reward-amount">+${rewards.bonusRewards.freeGachaCurrency}</span>
              <span class="reward-label">Gacha Ticket</span>
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
    html += '<h3>Relationship Progress</h3>';
    
    // Bond points earned
    html += `
      <div class="bond-points-earned">
        <span class="bond-icon material-icons icon-love">favorite</span>
        <span class="bond-text">+${data.bondPointsEarned} Relationship Points</span>
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
          <span class="level-up-text">Relationship Level ${data.newBondLevel}!</span>
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
    // Get the NPC data
    const npc = getNPCById(npcId);
    if (!npc) return "That was a good shift!";
    
    // Build context for the reaction
    const hasMemory = !!rewards.memoryCandidateId;
    const bonusCoins = rewards.coins - 1800;
    const hasPetBonus = bonusCoins > 0;
    
    // Create contextual reactions based on NPC personality
    if (npcId === 'aria') {
      if (hasMemory) {
        return "Oh my! Something special happened today - I can feel it! The cafe was filled with such warmth and joy! 🍰";
      } else if (hasPetBonus && bonusCoins >= 500) {
        return "The pets were absolutely wonderful today! They helped make everything run so smoothly!";
      } else if (hasPetBonus) {
        return "Thank you for the help! The pets really made a difference in the bakery today.";
      } else {
        return "Another lovely shift! Even without extra helpers, we managed to get everything done.";
      }
    } else if (npcId === 'kai') {
      if (hasMemory) {
        return "WHOA! That was EPIC! Something super cool happened - I gotta remember this one! 🎉";
      } else if (hasPetBonus && bonusCoins >= 500) {
        return "DUDE! The pets were ON FIRE today! Best. Team. EVER!";
      } else if (hasPetBonus) {
        return "Nice! The pets brought some extra energy to the playground!";
      } else {
        return "That was fun! Next time bring some pets - they make everything more exciting!";
      }
    } else if (npcId === 'elias') {
      if (hasMemory) {
        return "How... remarkable. Today's session revealed something quite special. I must document this... ✨";
      } else if (hasPetBonus && bonusCoins >= 500) {
        return "Exquisite work... The pets demonstrated exceptional grace today.";
      } else if (hasPetBonus) {
        return "Adequate... The pets contributed nicely to today's aesthetic.";
      } else {
        return "The shift is complete. Consider bringing assistants next time for enhanced results.";
      }
    }
    
    return "That was a good shift!";
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
