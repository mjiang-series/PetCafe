// Gacha System - Pet collection mechanics
import { EventSystem } from './EventSystem';
import { GameStateManager } from './GameState';
import { Pet, PetRarity, PlayerPet } from '../models/Pet';
import { SectionType } from '../models/Pet';
import petsData from '../data/pets.json';

export interface GachaPull {
  pullId: string;
  timestamp: number;
  cost: { currency: 'coins' | 'gems', amount: number };
  results: PetPullResult[];
  bonusTokens?: number;
}

export interface PetPullResult {
  pet: Pet;
  isNew: boolean;
  isDuplicate: boolean;
  tokensAwarded?: number;
  rarity: PetRarity;
}

export interface GachaRates {
  '3-star': number;
  '4-star': number;
  '5-star': number;
}

export class GachaSystem {
  private eventSystem: EventSystem;
  private gameStateManager: GameStateManager;
  private masterPetList: Pet[];
  private gachaRates: GachaRates;
  private pityCounter: number = 0;
  private readonly PITY_THRESHOLD = 10; // Guaranteed rare+ after 10 pulls

  constructor(eventSystem: EventSystem, gameStateManager: GameStateManager) {
    this.eventSystem = eventSystem;
    this.gameStateManager = gameStateManager;
    
    // Load pet data
    this.masterPetList = petsData.pets;
    this.gachaRates = petsData.gachaRates;
    
    // Load pity counter from save
    const state = gameStateManager.getState();
    this.pityCounter = state.player.statistics?.pityCounter || 0;
  }

  // Perform a single pull
  async pullSingle(): Promise<GachaPull | null> {
    const cost = { currency: 'coins' as const, amount: 100 };
    
    if (!this.canAffordPull(cost)) {
      this.eventSystem.emit('gacha:insufficient_funds', { required: cost.amount });
      return null;
    }

    // Deduct currency
    this.deductCurrency(cost);
    
    // Perform pull
    const result = this.performPull();
    
    // Create pull record
    const pull: GachaPull = {
      pullId: `pull_${Date.now()}`,
      timestamp: Date.now(),
      cost,
      results: [result]
    };

    // Update game state
    this.processPullResults(pull);
    
    // Emit events
    this.eventSystem.emit('gacha:pull_complete', pull);
    
    return pull;
  }

  // Perform a 10x pull with discount
  async pullTenTimes(): Promise<GachaPull | null> {
    const cost = { currency: 'coins' as const, amount: 900 }; // 10% discount
    
    if (!this.canAffordPull(cost)) {
      this.eventSystem.emit('gacha:insufficient_funds', { required: cost.amount });
      return null;
    }

    // Deduct currency
    this.deductCurrency(cost);
    
    // Perform 10 pulls
    const results: PetPullResult[] = [];
    for (let i = 0; i < 10; i++) {
      results.push(this.performPull());
    }

    // Create pull record
    const pull: GachaPull = {
      pullId: `pull_${Date.now()}`,
      timestamp: Date.now(),
      cost,
      results
    };

    // Update game state
    this.processPullResults(pull);
    
    // Emit events
    this.eventSystem.emit('gacha:pull_complete', pull);
    
    return pull;
  }

  // Special first-time pull with guaranteed pets
  async performTutorialPull(): Promise<GachaPull> {
    const starterData = petsData.starterPull;
    const results: PetPullResult[] = [];

    // Add guaranteed starter pets (Muffin, Buddy, Prince)
    starterData.guaranteed.forEach(starter => {
      const pet = this.masterPetList.find(p => p.petId === starter.petId);
      if (pet) {
        results.push({
          pet,
          isNew: true,
          isDuplicate: false,
          rarity: pet.rarity
        });
      }
    });

    // Fill remaining slots
    const commonPets = this.masterPetList.filter(p => 
      p.rarity === '3-star' && !results.some(r => r.pet.petId === p.petId)
    );
    const rarePets = this.masterPetList.filter(p => p.rarity === '4-star');

    // Add guaranteed rare
    if (starterData.guaranteedRare > 0 && rarePets.length > 0) {
      const rarePet = rarePets[Math.floor(Math.random() * rarePets.length)];
      results.push({
        pet: rarePet,
        isNew: true,
        isDuplicate: false,
        rarity: rarePet.rarity
      });
    }

    // Fill remaining with commons
    while (results.length < 10 && commonPets.length > 0) {
      const index = Math.floor(Math.random() * commonPets.length);
      const pet = commonPets[index];
      results.push({
        pet,
        isNew: true,
        isDuplicate: false,
        rarity: pet.rarity
      });
      commonPets.splice(index, 1); // Remove to avoid duplicates in tutorial
    }

    const pull: GachaPull = {
      pullId: `tutorial_pull_${Date.now()}`,
      timestamp: Date.now(),
      cost: { currency: 'coins', amount: 0 }, // Free tutorial pull
      results
    };

    this.processPullResults(pull);
    return pull;
  }

  // Core pull logic
  private performPull(): PetPullResult {
    const rarity = this.determineRarity();
    const petsOfRarity = this.masterPetList.filter(p => p.rarity === rarity);
    
    if (petsOfRarity.length === 0) {
      throw new Error(`No pets found for rarity: ${rarity}`);
    }

    // Select random pet of determined rarity
    const pet = petsOfRarity[Math.floor(Math.random() * petsOfRarity.length)];
    
    // Check if player already owns this pet
    const player = this.gameStateManager.getPlayer();
    const ownedPet = player.pets.find(p => p.petId === pet.petId);
    
    const result: PetPullResult = {
      pet,
      isNew: !ownedPet,
      isDuplicate: !!ownedPet,
      rarity: pet.rarity
    };

    // Award tokens for duplicates
    if (result.isDuplicate) {
      result.tokensAwarded = this.getTokensForDuplicate(pet.rarity);
    }

    return result;
  }

  // Determine rarity based on rates and pity system
  private determineRarity(): PetRarity {
    this.pityCounter++;
    console.log('[GachaSystem] Pity counter:', this.pityCounter, '/', this.PITY_THRESHOLD);
    
    // TESTING: Force 5-star every 10 pulls
    if (this.pityCounter >= this.PITY_THRESHOLD) {
      this.pityCounter = 0;
      console.log('[GachaSystem] PITY HIT - Forcing 5-star drop for testing');
      return '5-star';
    }

    // Normal rates
    const roll = Math.random();
    
    if (roll < this.gachaRates['5-star']) {
      this.pityCounter = 0; // Reset pity only on 5-star
      return '5-star';
    } else if (roll < this.gachaRates['5-star'] + this.gachaRates['4-star']) {
      // Don't reset pity on 4-star for testing
      return '4-star';
    } else {
      return '3-star';
    }
  }

  // Get coin value for duplicate pets
  private getTokensForDuplicate(rarity: PetRarity): number {
    switch (rarity) {
      case '3-star': return 1000;
      case '4-star': return 2500;
      case '5-star': return 5000;
      default: return 1000;
    }
  }

  // Check if player can afford pull
  private canAffordPull(cost: { currency: 'coins' | 'gems', amount: number }): boolean {
    const player = this.gameStateManager.getPlayer();
    
    if (cost.currency === 'coins') {
      return player.currencies.coins >= cost.amount;
    } else if (cost.currency === 'gems') {
      return player.currencies.premiumCurrency >= cost.amount;
    }
    
    return false;
  }

  // Deduct currency from player
  private deductCurrency(cost: { currency: 'coins' | 'gems', amount: number }): void {
    const player = this.gameStateManager.getPlayer();
    
    if (cost.currency === 'coins') {
      this.gameStateManager.updatePlayer({
        currencies: {
          ...player.currencies,
          coins: player.currencies.coins - cost.amount
        }
      });
    } else if (cost.currency === 'gems') {
      this.gameStateManager.updatePlayer({
        currencies: {
          ...player.currencies,
          premiumCurrency: player.currencies.premiumCurrency - cost.amount
        }
      });
    }

    this.eventSystem.emit('player:currency_changed', {
      currency: cost.currency,
      amount: -cost.amount
    });
  }

  // Process pull results and update game state
  private processPullResults(pull: GachaPull): void {
    const player = this.gameStateManager.getPlayer();
    const newPets: PlayerPet[] = [...player.pets];
    let totalTokens = 0;
    const bondAwards: Record<string, number> = {};

    pull.results.forEach(result => {
      if (result.isNew) {
        const newPet: PlayerPet = {
          ...result.pet,
          acquiredAt: Date.now()
        };
        newPets.push(newPet);

        const npcId = this.getNpcIdFromPet(result.pet.sectionAffinity);
        if (npcId) {
          const bonus = this.getBondBonus(result.rarity);
          bondAwards[npcId] = (bondAwards[npcId] || 0) + bonus;
          this.gameStateManager.addBondPoints(npcId, bonus);
        }

        this.eventSystem.emit('pet:acquired', { pet: newPet });
      } else if (result.isDuplicate && result.tokensAwarded) {
        totalTokens += result.tokensAwarded;
      }
    });

    this.gameStateManager.updatePlayer({
      pets: newPets,
      currencies: {
        ...player.currencies,
        coins: player.currencies.coins + totalTokens // Duplicates now give coins
      },
      statistics: {
        ...player.statistics,
        pityCounter: this.pityCounter,
        totalPulls: (player.statistics?.totalPulls || 0) + pull.results.length,
        totalPetsCollected: newPets.length
      }
    });

    // Save pull history
    this.savePullHistory(pull);

    // Emit summary event
    const newPetCount = pull.results.filter(r => r.isNew).length;
    const dupeCount = pull.results.filter(r => r.isDuplicate).length;
    
    this.eventSystem.emit('gacha:summary', {
      pullId: pull.pullId,
      newPets: newPetCount,
      duplicates: dupeCount,
      tokensEarned: totalTokens
    });

    if (Object.keys(bondAwards).length > 0) {
      this.eventSystem.emit('gacha:bond_awarded', {
        pullId: pull.pullId,
        awards: bondAwards
      });
    }
  }

  // Save pull history for statistics
  private savePullHistory(pull: GachaPull): void {
    const state = this.gameStateManager.getState();
    const history = state.player.pullHistory || [];
    
    // Keep last 100 pulls
    history.push({
      pullId: pull.pullId,
      timestamp: pull.timestamp,
      resultCount: pull.results.length,
      rarities: pull.results.map(r => r.rarity)
    });

    if (history.length > 100) {
      history.shift();
    }

    this.gameStateManager.updatePlayer({
      pullHistory: history
    });
  }

  // Get current collection progress
  getCollectionProgress(): { owned: number, total: number, percentage: number } {
    const player = this.gameStateManager.getPlayer();
    const owned = player.pets.length;
    const total = this.masterPetList.length;
    const percentage = Math.floor((owned / total) * 100);

    return { owned, total, percentage };
  }

  // Get pets by rarity for display
  getPetsByRarity(rarity: PetRarity): Pet[] {
    return this.masterPetList.filter(p => p.rarity === rarity);
  }

  // Check if player owns a specific pet
  playerOwnsPet(petId: string): boolean {
    const player = this.gameStateManager.getPlayer();
    return player.pets.some(p => p.petId === petId);
  }

  // Get duplicate count for a pet
  getDuplicateCount(petId: string): number {
    const player = this.gameStateManager.getPlayer();
    return player.dupesConverted[petId] || 0;
  }

  getPetById(petId: string): Pet | undefined {
    return this.masterPetList.find(pet => pet.petId === petId);
  }

  private getNpcIdFromPet(sectionAffinity: SectionType): string | null {
    const mapping: Record<SectionType, string> = {
      bakery: 'aria',
      playground: 'kai',
      salon: 'elias'
    };
    return mapping[sectionAffinity] || null;
  }

  private getBondBonus(rarity: PetRarity): number {
    switch (rarity) {
      case '5-star':
        return 20;
      case '4-star':
        return 10;
      default:
        return 5;
    }
  }
}
