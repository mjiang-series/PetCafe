import { EventSystem } from './EventSystem';
import { GameStateManager } from './GameState';

export interface OfflineReport {
  timeAway: number; // milliseconds
  coinsEarned: number;
  shiftsCompleted: number;
  memoriesGenerated: number;
  bonusRewards: {
    premiumCurrency?: number;
    dupeTokens?: number;
  };
}

export class OfflineProgressionSystem {
  private eventSystem: EventSystem;
  private gameState: GameStateManager;
  
  // Configuration
  private readonly OFFLINE_EFFICIENCY = 0.5; // 50% of active play
  private readonly MAX_OFFLINE_TIME = 8 * 60 * 60 * 1000; // 8 hours max
  private readonly COINS_PER_HOUR = 120; // Base coins per hour offline

  constructor(eventSystem: EventSystem, gameState: GameStateManager) {
    this.eventSystem = eventSystem;
    this.gameState = gameState;
  }

  calculateOfflineProgress(lastSaveTime: number): OfflineReport | null {
    const currentTime = Date.now();
    const timeAway = currentTime - lastSaveTime;
    
    // No offline progress if away for less than 1 minute
    if (timeAway < 60000) {
      return null;
    }

    // Cap offline time
    const effectiveTime = Math.min(timeAway, this.MAX_OFFLINE_TIME);
    
    // Calculate base rewards
    const hoursAway = effectiveTime / (60 * 60 * 1000);
    const baseCoins = Math.floor(this.COINS_PER_HOUR * hoursAway * this.OFFLINE_EFFICIENCY);
    
    // Calculate shifts that would have completed
    const avgShiftDuration = 3 * 60 * 1000; // 3 minutes average
    const shiftsCompleted = Math.floor(effectiveTime / avgShiftDuration * this.OFFLINE_EFFICIENCY);
    
    // Memory generation (1 memory per 5 shifts on average)
    const memoriesGenerated = Math.floor(shiftsCompleted / 5);
    
    // Bonus rewards chance
    const bonusRewards: OfflineReport['bonusRewards'] = {};
    if (Math.random() < 0.1 * hoursAway) { // 10% chance per hour
      bonusRewards.premiumCurrency = Math.floor(1 + Math.random() * 3);
    }
    if (Math.random() < 0.2 * hoursAway) { // 20% chance per hour
      bonusRewards.dupeTokens = Math.floor(10 + Math.random() * 20);
    }

    // Calculate pet bonus multiplier
    const petMultiplier = this.calculatePetMultiplier();
    const finalCoins = Math.floor(baseCoins * petMultiplier);

    return {
      timeAway: effectiveTime,
      coinsEarned: finalCoins,
      shiftsCompleted,
      memoriesGenerated,
      bonusRewards
    };
  }

  private calculatePetMultiplier(): number {
    const state = this.gameState.getState();
    const activePets = state.player.pets.length;
    
    // Each pet adds 5% to offline earnings, max 200%
    const multiplier = 1 + (activePets * 0.05);
    return Math.min(multiplier, 2.0);
  }

  applyOfflineProgress(report: OfflineReport): void {
    const state = this.gameState.getState();
    
    // Apply coin rewards
    state.player.currencies.coins += report.coinsEarned;
    
    // Apply bonus rewards
    if (report.bonusRewards.premiumCurrency) {
      state.player.currencies.premiumCurrency += report.bonusRewards.premiumCurrency;
    }
    if (report.bonusRewards.dupeTokens) {
      state.player.dupeTokens += report.bonusRewards.dupeTokens;
    }
    
    // Update statistics
    state.player.statistics.totalShiftsCompleted += report.shiftsCompleted;
    
    // Update last active time
    state.player.profile.lastActiveAt = Date.now();
    
    // Emit event
    this.eventSystem.emit('offline:progress_applied', { report });
  }

  showOfflineReport(report: OfflineReport): void {
    // Format time away
    const hours = Math.floor(report.timeAway / (60 * 60 * 1000));
    const minutes = Math.floor((report.timeAway % (60 * 60 * 1000)) / (60 * 1000));
    
    let timeString = '';
    if (hours > 0) {
      timeString += `${hours} hour${hours !== 1 ? 's' : ''}`;
    }
    if (minutes > 0) {
      if (timeString) timeString += ' ';
      timeString += `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }

    // Create report UI data
    const uiData = {
      title: 'Welcome Back!',
      subtitle: `You were away for ${timeString}`,
      rewards: [
        { icon: 'coin', label: 'Coins Earned', value: `+${report.coinsEarned}` },
        { icon: 'shift', label: 'Shifts Completed', value: `${report.shiftsCompleted}` }
      ]
    };

    if (report.memoriesGenerated > 0) {
      uiData.rewards.push({
        icon: 'memory',
        label: 'Memories Created',
        value: `${report.memoriesGenerated}`
      });
    }

    if (report.bonusRewards.premiumCurrency) {
      uiData.rewards.push({
        icon: 'gem',
        label: 'Gems Earned',
        value: `+${report.bonusRewards.premiumCurrency}`
      });
    }

    if (report.bonusRewards.dupeTokens) {
      uiData.rewards.push({
        icon: 'token',
        label: 'Tokens Earned',
        value: `+${report.bonusRewards.dupeTokens}`
      });
    }

    // Emit UI event
    this.eventSystem.emit('ui:show_offline_report', uiData);
  }
}
