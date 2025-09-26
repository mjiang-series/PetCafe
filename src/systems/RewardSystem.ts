import { EventSystem } from './EventSystem';
import { GameStateManager } from './GameState';
import { Shift, ShiftRewards, SectionType } from '../models/Shift';
import { Pet } from '../models/Pet';

export interface RewardCalculationResult {
  baseRewards: ShiftRewards;
  petBonuses: {
    efficiencyMultiplier: number;
    affinityBonus: number;
  };
  consumableBonuses: {
    rewardMultiplier: number;
  };
  finalRewards: ShiftRewards;
}

// Pet affinity bonuses - which pets work best in which sections
const PET_AFFINITY_MAP: Record<string, Partial<Record<SectionType, number>>> = {
  // Bakery affinity pets
  'muffin': { 'bakery': 1.5 },
  'peanut': { 'bakery': 1.5 },
  'chip': { 'bakery': 1.5 },
  'luna': { 'bakery': 1.5 },
  'harmony': { 'bakery': 1.5 },
  
  // Playground affinity pets
  'buddy': { 'playground': 1.5 },
  'turbo': { 'playground': 1.5 },
  'sunny': { 'playground': 1.5 },
  'blaze': { 'playground': 1.5 },
  
  // Styling affinity pets
  'prince': { 'salon': 1.5 },
  'patches': { 'salon': 1.5 },
  'whiskers': { 'salon': 1.5 },
  'storm': { 'salon': 1.5 },
  'rue': { 'salon': 1.5 },
  'iris': { 'salon': 1.5 }
};

// Section multipliers removed - all sections give same base rewards

export class RewardSystem {
  private eventSystem: EventSystem;
  private gameState: GameStateManager;

  constructor(eventSystem: EventSystem, gameState: GameStateManager) {
    this.eventSystem = eventSystem;
    this.gameState = gameState;
  }

  calculateShiftRewards(shift: Shift, assignedPets: Pet[]): RewardCalculationResult {
    // Base rewards from shift template
    const baseRewards: ShiftRewards = {
      coins: this.getBaseCoins(shift.sectionType),
      helperXP: this.getBaseXP(shift.sectionType),
      npcBondXP: this.getBaseNPCBondXP(shift.sectionType),
      memoryCandidateId: undefined,
      bonusRewards: {}
    };

    // Calculate pet bonuses
    const petBonuses = this.calculatePetBonuses(shift.sectionType, assignedPets);
    
    // Calculate consumable bonuses
    const consumableBonuses = this.calculateConsumableBonuses(shift.consumablesUsed);

    // Apply all multipliers
    const totalMultiplier = petBonuses.efficiencyMultiplier * consumableBonuses.rewardMultiplier;
    
    // Check if this is a 5th shift for gacha ticket bonus
    const shiftCount = this.gameState.getPlayer().statistics?.totalShiftsCompleted || 0;
    const bonusRewards = this.calculateBonusRewards(shift, totalMultiplier);
    if ((shiftCount + 1) % 5 === 0) {
      bonusRewards.freeGachaCurrency = (bonusRewards.freeGachaCurrency || 0) + 1;
    }
    
    const finalRewards: ShiftRewards = {
      coins: Math.floor(baseRewards.coins * totalMultiplier) + petBonuses.affinityBonus,
      helperXP: Math.floor(baseRewards.helperXP * totalMultiplier),
      npcBondXP: baseRewards.npcBondXP, // Pet bonuses don't apply to relationship XP
      memoryCandidateId: this.shouldGenerateMemory(shift) ? this.generateMemoryId() : undefined,
      bonusRewards
    };

    return {
      baseRewards,
      petBonuses,
      consumableBonuses,
      finalRewards
    };
  }

  private getBaseCoins(sectionType: SectionType): number {
    // 10 coins per second * 180 seconds = 1800 base coins
    const baseAmount = 1800;
    return baseAmount;
  }

  private getBaseXP(sectionType: SectionType): number {
    // Helper XP no longer used
    return 0;
  }

  private getBaseNPCBondXP(sectionType: SectionType): number {
    // 1 bond XP per second * 180 seconds = 180 base bond XP
    const baseAmount = 180;
    return baseAmount;
  }

  private calculatePetBonuses(sectionType: SectionType, pets: Pet[]): { efficiencyMultiplier: number; affinityBonus: number } {
    // Base efficiency multiplier based on pet count
    let baseMultiplier = 1.0;
    if (pets.length === 1) {
      baseMultiplier = 1.05; // 5% bonus for 1 pet
    } else if (pets.length === 2) {
      baseMultiplier = 1.1; // 10% bonus for 2 pets
    } else if (pets.length >= 3) {
      baseMultiplier = 1.25; // 25% bonus for 3 pets
    }

    // Star bonuses - multiplicative with base
    let starMultiplier = 1.0;
    pets.forEach(pet => {
      if (pet.rarity === '5-star') {
        starMultiplier *= 1.25; // 25% per 5-star
      } else if (pet.rarity === '4-star') {
        starMultiplier *= 1.1; // 10% per 4-star
      }
    });

    // Affinity bonus - flat coin bonus based on matching pets in correct section
    let affinityBonus = 0;
    if (pets.length > 0) {
      let matchingPets = 0;
      pets.forEach(pet => {
        const affinityMap = PET_AFFINITY_MAP[pet.petId] || {};
        const affinity = affinityMap[sectionType] || 1.0;
        if (affinity > 1.0) matchingPets++;
      });
      
      // Flat coin bonuses based on matching pets
      if (matchingPets === 0) {
        affinityBonus = 0;
      } else if (matchingPets === 1) {
        affinityBonus = 100;
      } else if (matchingPets === 2) {
        affinityBonus = 250;
      } else if (matchingPets >= 3) {
        affinityBonus = 500;
      }
    }
    
    return {
      efficiencyMultiplier: baseMultiplier * starMultiplier,
      affinityBonus: affinityBonus
    };
  }

  private calculateConsumableBonuses(consumablesUsed: Record<string, number>): { rewardMultiplier: number } {
    let multiplier = 1.0;
    
    // TODO: Look up actual consumable effects from data
    // For now, simple implementation
    Object.entries(consumablesUsed).forEach(([itemId, quantity]) => {
      if (itemId.includes('treat')) {
        multiplier += 0.25 * quantity; // +25% per treat
      } else if (itemId.includes('toy')) {
        multiplier += 0.15 * quantity; // +15% per toy
      }
    });

    return { rewardMultiplier: multiplier };
  }

  private shouldGenerateMemory(shift: Shift): boolean {
    // Always generate a memory for now (100% chance)
    return true;
  }

  private generateMemoryId(): string {
    return `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private calculateBonusRewards(shift: Shift, multiplier: number): ShiftRewards['bonusRewards'] {
    const bonusRewards: ShiftRewards['bonusRewards'] = {};
    
    // Chance for premium currency
    if (Math.random() < 0.05 * multiplier) { // 5% base chance
      bonusRewards.premiumCurrency = Math.floor(1 + Math.random() * 3); // 1-3 gems
    }
    
    // Chance for dupe tokens
    if (Math.random() < 0.1 * multiplier) { // 10% base chance
      bonusRewards.dupeTokens = Math.floor(5 + Math.random() * 10); // 5-15 tokens
    }
    
    // Chance for special items (consumables)
    if (Math.random() < 0.15 * multiplier) { // 15% base chance
      bonusRewards.specialItems = {
        'treat_basic': Math.floor(1 + Math.random() * 2) // 1-2 treats
      };
    }
    
    return Object.keys(bonusRewards).length > 0 ? bonusRewards : undefined;
  }

  applyRewards(rewards: ShiftRewards, shift?: Shift): void {
    const player = this.gameState.getPlayer();
    
    // Prepare currency updates
    const currencyUpdates = {
      coins: player.currencies.coins + rewards.coins,
      premiumCurrency: player.currencies.premiumCurrency,
      freeGachaCurrency: player.currencies.freeGachaCurrency
    };
    
    // Apply bonus rewards
    if (rewards.bonusRewards) {
      if (rewards.bonusRewards.premiumCurrency) {
        currencyUpdates.premiumCurrency += rewards.bonusRewards.premiumCurrency;
      }
      if (rewards.bonusRewards.freeGachaCurrency) {
        currencyUpdates.freeGachaCurrency += rewards.bonusRewards.freeGachaCurrency;
      }
    }
    
    // Update player with new currencies
    this.gameState.updatePlayer({
      currencies: currencyUpdates
    });
    
    // Apply NPC bond XP (relationship points)
    const bondXP = rewards.npcBondXP || rewards.helperXP || 0; // Fallback to helperXP for compatibility
    if (shift && bondXP > 0) {
      this.gameState.addBondPoints(shift.helperNpcId, bondXP);
      this.eventSystem.emit('npc:bond_increased', { 
        npcId: shift.helperNpcId, 
        points: bondXP, 
        reason: 'shift_completion' 
      });
    }
    
    // Generate memory if applicable
    if (rewards.memoryCandidateId) {
      this.eventSystem.emit('memory:generated', { 
        memoryId: rewards.memoryCandidateId,
        shiftId: rewards.memoryCandidateId 
      });
    }
    
    // Update statistics
    this.gameState.updatePlayer({
      statistics: {
        ...player.statistics,
        totalShiftsCompleted: player.statistics.totalShiftsCompleted + 1,
        totalCoinsEarned: player.statistics.totalCoinsEarned + rewards.coins
      }
    });
    
    // Emit reward event
    this.eventSystem.emit('rewards:applied', { rewards });
  }
}
