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

// Base reward multipliers by section
const SECTION_REWARD_MULTIPLIERS: Record<SectionType, number> = {
  'bakery': 1.0,
  'playground': 1.1,
  'salon': 1.2
};

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
      memoryCandidateId: undefined,
      bonusRewards: {}
    };

    // Calculate pet bonuses
    const petBonuses = this.calculatePetBonuses(shift.sectionType, assignedPets);
    
    // Calculate consumable bonuses
    const consumableBonuses = this.calculateConsumableBonuses(shift.consumablesUsed);

    // Apply all multipliers
    const totalMultiplier = petBonuses.efficiencyMultiplier * consumableBonuses.rewardMultiplier;
    
    const finalRewards: ShiftRewards = {
      coins: Math.floor(baseRewards.coins * totalMultiplier),
      helperXP: Math.floor(baseRewards.helperXP * totalMultiplier),
      memoryCandidateId: this.shouldGenerateMemory(shift) ? this.generateMemoryId() : undefined,
      bonusRewards: this.calculateBonusRewards(shift, totalMultiplier)
    };

    return {
      baseRewards,
      petBonuses,
      consumableBonuses,
      finalRewards
    };
  }

  private getBaseCoins(sectionType: SectionType): number {
    const baseAmount = 20; // Base coins per shift
    const multiplier = SECTION_REWARD_MULTIPLIERS[sectionType] || 1.0;
    return Math.floor(baseAmount * multiplier);
  }

  private getBaseXP(sectionType: SectionType): number {
    const baseAmount = 10; // Base XP per shift
    const multiplier = SECTION_REWARD_MULTIPLIERS[sectionType] || 1.0;
    return Math.floor(baseAmount * multiplier);
  }

  private calculatePetBonuses(sectionType: SectionType, pets: Pet[]): { efficiencyMultiplier: number; affinityBonus: number } {
    if (pets.length === 0) {
      return { efficiencyMultiplier: 0.5, affinityBonus: 0 }; // Penalty for no pets
    }

    let totalAffinity = 0;
    let petCount = 0;

    pets.forEach(pet => {
      const affinityMap = PET_AFFINITY_MAP[pet.petId] || {};
      const affinity = affinityMap[sectionType] || 1.0;
      totalAffinity += affinity;
      petCount++;
    });

    // Average affinity across all assigned pets
    const averageAffinity = totalAffinity / petCount;
    
    // Bonus for having multiple pets (teamwork bonus)
    const teamworkBonus = 1 + (petCount - 1) * 0.1; // +10% per additional pet
    
    return {
      efficiencyMultiplier: averageAffinity * teamworkBonus,
      affinityBonus: averageAffinity - 1.0
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
    const state = this.gameState.getState();
    
    // Apply coin rewards
    state.player.currencies.coins += rewards.coins;
    
    // Apply bonus rewards
    if (rewards.bonusRewards) {
      if (rewards.bonusRewards.premiumCurrency) {
        state.player.currencies.premiumCurrency += rewards.bonusRewards.premiumCurrency;
      }
      if (rewards.bonusRewards.dupeTokens) {
        state.player.dupeTokens += rewards.bonusRewards.dupeTokens;
      }
      if (rewards.bonusRewards.specialItems) {
        // Add items to inventory
        Object.entries(rewards.bonusRewards.specialItems).forEach(([itemId, quantity]) => {
          state.player.consumables[itemId] = (state.player.consumables[itemId] || 0) + quantity;
        });
      }
    }
    
    // Apply helper XP as bond points to the NPC
    if (shift && rewards.helperXP > 0) {
      this.gameState.addBondPoints(shift.helperNpcId, rewards.helperXP);
      this.eventSystem.emit('npc:bond_increased', { 
        npcId: shift.helperNpcId, 
        points: rewards.helperXP, 
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
    state.player.statistics.totalShiftsCompleted++;
    
    // Emit reward event
    this.eventSystem.emit('rewards:applied', { rewards });
  }
}
