import { EventSystem } from './EventSystem';
import { GameStateManager } from './GameState';
import { Consumable } from '../models/Shift';

// Define consumable items
export const CONSUMABLES: Record<string, Consumable> = {
  'treat_basic': {
    consumableId: 'treat_basic',
    name: 'Pet Treat',
    description: 'A tasty treat that boosts pet efficiency by 25% for one shift',
    effects: {
      efficiencyBonus: 0.25
    },
    cost: {
      coins: 50
    },
    rarity: 'common',
    stackLimit: 99
  },
  'treat_premium': {
    consumableId: 'treat_premium',
    name: 'Gourmet Treat',
    description: 'A delicious gourmet treat that boosts efficiency by 50% for one shift',
    effects: {
      efficiencyBonus: 0.5
    },
    cost: {
      coins: 150,
      premiumCurrency: 1
    },
    rarity: 'rare',
    stackLimit: 99
  },
  'toy_basic': {
    consumableId: 'toy_basic',
    name: 'Cat Toy',
    description: 'An entertaining toy that reduces shift duration by 15%',
    effects: {
      durationReduction: 0.15
    },
    cost: {
      coins: 75
    },
    rarity: 'common',
    stackLimit: 99
  },
  'toy_premium': {
    consumableId: 'toy_premium',
    name: 'Interactive Toy',
    description: 'A high-tech toy that reduces shift duration by 30%',
    effects: {
      durationReduction: 0.3
    },
    cost: {
      coins: 200
    },
    rarity: 'rare',
    stackLimit: 99
  },
  'boost_double': {
    consumableId: 'boost_double',
    name: 'Double Rewards',
    description: 'Doubles all rewards from the next shift',
    effects: {
      rewardMultiplier: 2.0
    },
    cost: {
      premiumCurrency: 5
    },
    rarity: 'epic',
    stackLimit: 10
  },
  'finish_shift': {
    consumableId: 'finish_shift',
    name: 'Instant Complete',
    description: 'Instantly completes any active shift',
    effects: {
      finishShiftImmediately: true
    },
    cost: {
      premiumCurrency: 3
    },
    rarity: 'rare',
    stackLimit: 20
  }
};

export class ConsumableManager {
  private eventSystem: EventSystem;
  private gameState: GameStateManager;

  constructor(eventSystem: EventSystem, gameState: GameStateManager) {
    this.eventSystem = eventSystem;
    this.gameState = gameState;
  }

  getConsumable(consumableId: string): Consumable | null {
    return CONSUMABLES[consumableId] || null;
  }

  getAllConsumables(): Consumable[] {
    return Object.values(CONSUMABLES);
  }

  getPlayerInventory(): Record<string, number> {
    return this.gameState.getPlayer().consumables || {};
  }

  hasConsumable(consumableId: string, quantity: number = 1): boolean {
    const inventory = this.getPlayerInventory();
    return (inventory[consumableId] || 0) >= quantity;
  }

  useConsumable(consumableId: string, quantity: number = 1): boolean {
    if (!this.hasConsumable(consumableId, quantity)) {
      this.eventSystem.emit('game:error', { 
        message: `Not enough ${consumableId}. Need ${quantity}` 
      });
      return false;
    }

    const consumable = this.getConsumable(consumableId);
    if (!consumable) {
      this.eventSystem.emit('game:error', { 
        message: `Unknown consumable: ${consumableId}` 
      });
      return false;
    }

    // Deduct from inventory
    const player = this.gameState.getPlayer();
    const newInventory = { ...player.consumables };
    newInventory[consumableId] = (newInventory[consumableId] || 0) - quantity;
    
    if (newInventory[consumableId] <= 0) {
      delete newInventory[consumableId];
    }

    this.gameState.updatePlayer({ consumables: newInventory });

    // Emit usage event
    this.eventSystem.emit('consumable:used', { 
      consumableId, 
      quantity,
      consumable 
    });

    return true;
  }

  addConsumable(consumableId: string, quantity: number = 1): boolean {
    const consumable = this.getConsumable(consumableId);
    if (!consumable) {
      console.error(`[ConsumableManager] Unknown consumable: ${consumableId}`);
      return false;
    }

    const player = this.gameState.getPlayer();
    const currentAmount = player.consumables[consumableId] || 0;
    const newAmount = Math.min(currentAmount + quantity, consumable.stackLimit);
    const actualAdded = newAmount - currentAmount;

    if (actualAdded > 0) {
      const newInventory = { ...player.consumables };
      newInventory[consumableId] = newAmount;
      this.gameState.updatePlayer({ consumables: newInventory });

      // Emit acquisition event
      this.eventSystem.emit('consumable:acquired', { 
        consumableId, 
        quantity: actualAdded,
        consumable 
      });

      if (actualAdded < quantity) {
        this.eventSystem.emit('game:warning', { 
          message: `Stack limit reached. Only added ${actualAdded} ${consumable.name}` 
        });
      }
    }

    return actualAdded > 0;
  }

  purchaseConsumable(consumableId: string, quantity: number = 1): boolean {
    const consumable = this.getConsumable(consumableId);
    if (!consumable) {
      this.eventSystem.emit('game:error', { 
        message: `Unknown consumable: ${consumableId}` 
      });
      return false;
    }

    const totalCost = {
      coins: (consumable.cost.coins || 0) * quantity,
      premiumCurrency: (consumable.cost.premiumCurrency || 0) * quantity
    };

    const player = this.gameState.getPlayer();
    
    // Check if player can afford
    if (totalCost.coins > player.currencies.coins) {
      this.eventSystem.emit('game:error', { 
        message: `Not enough coins. Need ${totalCost.coins}` 
      });
      return false;
    }

    if (totalCost.premiumCurrency > player.currencies.premiumCurrency) {
      this.eventSystem.emit('game:error', { 
        message: `Not enough gems. Need ${totalCost.premiumCurrency}` 
      });
      return false;
    }

    // Deduct currency
    this.gameState.updatePlayer({
      currencies: {
        ...player.currencies,
        coins: player.currencies.coins - totalCost.coins,
        premiumCurrency: player.currencies.premiumCurrency - totalCost.premiumCurrency
      }
    });

    // Add consumable
    const added = this.addConsumable(consumableId, quantity);

    if (added) {
      this.eventSystem.emit('consumable:purchased', { 
        consumableId, 
        quantity,
        totalCost,
        consumable 
      });
    }

    return added;
  }

  // Calculate effects for a shift based on consumables used
  calculateConsumableEffects(consumablesUsed: Record<string, number>): {
    efficiencyBonus: number;
    durationReduction: number;
    rewardMultiplier: number;
  } {
    let efficiencyBonus = 0;
    let durationReduction = 0;
    let rewardMultiplier = 1;

    Object.entries(consumablesUsed).forEach(([consumableId, quantity]) => {
      const consumable = this.getConsumable(consumableId);
      if (!consumable) return;

      // Apply effects
      if (consumable.effects.efficiencyBonus) {
        efficiencyBonus += consumable.effects.efficiencyBonus * quantity;
      }
      if (consumable.effects.durationReduction) {
        // Duration reductions don't stack linearly, use diminishing returns
        const reduction = consumable.effects.durationReduction * quantity;
        durationReduction = 1 - ((1 - durationReduction) * (1 - reduction));
      }
      if (consumable.effects.rewardMultiplier) {
        // Multipliers multiply together
        rewardMultiplier *= Math.pow(consumable.effects.rewardMultiplier, quantity);
      }
    });

    // Cap values
    efficiencyBonus = Math.min(efficiencyBonus, 2.0); // Max +200%
    durationReduction = Math.min(durationReduction, 0.75); // Max 75% reduction
    rewardMultiplier = Math.min(rewardMultiplier, 5.0); // Max 5x rewards

    return {
      efficiencyBonus,
      durationReduction,
      rewardMultiplier
    };
  }
}
