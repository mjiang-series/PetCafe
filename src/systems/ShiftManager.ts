// Shift management system for café operations
import { EventSystem, GameEvents } from './EventSystem';
import { GameStateManager } from './GameState';
import { RewardSystem } from './RewardSystem';
import { MemoryGenerator } from './MemoryGenerator';
import { Shift, ShiftStatus, ShiftRewards, CafeSection, SectionType } from '../models';

export class ShiftManager {
  private eventSystem: EventSystem;
  private gameState: GameStateManager;
  private rewardSystem: RewardSystem;
  private memoryGenerator: MemoryGenerator;
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private updateInterval?: NodeJS.Timeout;
  private completingShifts: Set<string> = new Set();

  // Configuration
  private readonly BASE_SHIFT_DURATION = 3 * 60 * 1000; // 3 minutes in milliseconds
  private readonly UPDATE_FREQUENCY = 1000; // Update every second

  constructor(eventSystem: EventSystem, gameState: GameStateManager) {
    this.eventSystem = eventSystem;
    this.gameState = gameState;
    this.rewardSystem = new RewardSystem(eventSystem, gameState);
    this.memoryGenerator = new MemoryGenerator(eventSystem, gameState);
    this.setupEventListeners();
    this.startUpdateLoop();
  }

  // Start a new shift
  startShift(sectionType: SectionType, petIds: string[], consumables?: Record<string, number>): string | null {
    const section = this.getSection(sectionType);
    if (!section) {
      console.error(`[ShiftManager] Section ${sectionType} not found`);
      return null;
    }

    // Validate section is unlocked
    if (!section.isUnlocked) {
      this.eventSystem.emit('game:error', { 
        message: `${sectionType} section is not unlocked yet` 
      });
      return null;
    }

    // Check if section already has active shift
    if (section.currentShift && section.currentShift.status === 'running') {
      this.eventSystem.emit('game:error', { 
        message: `${sectionType} already has an active shift` 
      });
      return null;
    }

    // Validate pets - allow 0 pets but enforce max
    if (petIds.length > section.capacity.petSlots) {
      this.eventSystem.emit('game:error', { 
        message: `Too many pets. Max: ${section.capacity.petSlots}` 
      });
      return null;
    }

    // Validate pet ownership
    const player = this.gameState.getPlayer();
    const ownedPetIds = player.pets.map(p => p.petId);
    const invalidPets = petIds.filter(id => !ownedPetIds.includes(id));
    
    if (invalidPets.length > 0) {
      this.eventSystem.emit('game:error', { 
        message: 'You don\'t own some of these pets' 
      });
      return null;
    }

    // Create new shift
    const shiftId = `shift_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const shift: Shift = {
      shiftId,
      sectionType,
      assignedPets: petIds,
      helperNpcId: section.helper.npcId,
      duration: this.calculateDuration(petIds, consumables),
      startedAt: Date.now(),
      status: 'running',
      rewards: this.calculatePotentialRewards(sectionType, petIds),
      consumablesUsed: consumables || {},
      efficiency: this.calculateEfficiency(petIds, section)
    };

    // Update game state
    this.gameState.addShift(shift);
    
    // Update section with current shift
    const sections = this.gameState.getCafeSections();
    const sectionIndex = sections.findIndex(s => s.sectionType === sectionType);
    if (sectionIndex >= -1) {
      sections[sectionIndex].currentShift = shift;
      // Note: In a real implementation, we'd update the game state properly
    }

    // Start timer for auto-completion
    this.startShiftTimer(shiftId);

    // Emit event
    this.eventSystem.emit(GameEvents.SHIFT_STARTED, { shift });

    console.log(`[ShiftManager] Started shift ${shiftId} in ${sectionType}`);
    return shiftId;
  }

  // Complete a shift (either naturally or with consumable)
  completeShift(shiftId: string, forced: boolean = false): ShiftRewards | null {
    // Prevent multiple completions
    if (this.completingShifts.has(shiftId)) {
      return null;
    }
    
    this.completingShifts.add(shiftId);
    
    const shifts = this.gameState.getActiveShifts();
    const shift = shifts.find(s => s.shiftId === shiftId);

    if (!shift) {
      console.error(`[ShiftManager] Shift ${shiftId} not found`);
      this.completingShifts.delete(shiftId);
      return null;
    }

    if (shift.status !== 'running') {
      console.error(`[ShiftManager] Shift ${shiftId} is not running`);
      this.completingShifts.delete(shiftId);
      return null;
    }

    // Check if shift is ready to complete
    const now = Date.now();
    const elapsed = now - (shift.startedAt || now);
    const isReady = elapsed >= shift.duration;

    if (!isReady && !forced) {
      this.eventSystem.emit('game:error', { 
        message: 'Shift is not complete yet' 
      });
      this.completingShifts.delete(shiftId);
      return null;
    }

    // If forced completion, check for consumable
    if (forced && !isReady) {
      const player = this.gameState.getPlayer();
      if (!player.consumables['finish_shift'] || player.consumables['finish_shift'] < 1) {
        this.eventSystem.emit('game:error', { 
          message: 'No instant finish consumables available' 
        });
        this.completingShifts.delete(shiftId);
        return null;
      }

      // Consume the item
      this.gameState.updatePlayer({
        consumables: {
          ...player.consumables,
          finish_shift: player.consumables['finish_shift'] - 1
        }
      });
    }

    // Get assigned pets - need to get full Pet data from data files
    // For now, create minimal Pet objects from PlayerPets
    const playerPets = this.gameState.getPlayer().pets.filter(p => 
      shift.assignedPets.includes(p.petId)
    );
    
    // Convert PlayerPet to Pet format for reward calculation
    const assignedPets = playerPets.map(pp => ({
      petId: pp.petId,
      name: pp.name,
      rarity: pp.rarity,
      sectionAffinity: 'cozy-corner' as SectionType, // Default affinity
      artRefs: {
        portrait: '',
        showcase: '',
        animations: []
      },
      description: ''
    }));

    // Calculate final rewards using RewardSystem
    const rewardResult = this.rewardSystem.calculateShiftRewards(shift, assignedPets);
    const rewards = rewardResult.finalRewards;

    // Update shift status
    this.gameState.updateShift(shiftId, {
      status: 'complete',
      completedAt: now,
      rewards
    });

    // Apply rewards to player using RewardSystem
    this.rewardSystem.applyRewards(rewards, shift);

    // Generate memory if one was created
    if (rewards.memoryCandidateId) {
      // Re-map to get the same Pet format
      const petsForMemory = playerPets.map(pp => ({
        petId: pp.petId,
        name: pp.name,
        rarity: pp.rarity,
        sectionAffinity: 'cozy-corner' as SectionType,
        artRefs: {
          portrait: '',
          showcase: '',
          animations: []
        },
        description: ''
      }));
      const memory = this.memoryGenerator.generateMemory(shift, petsForMemory);
      this.eventSystem.emit(GameEvents.MEMORY_CREATED, { memory, shiftId });
    }

    // Clear timer
    this.clearShiftTimer(shiftId);

    // Remove from active shifts
    this.gameState.removeShift(shiftId);

    // Clear from section
    const section = this.getSection(shift.sectionType);
    if (section && section.currentShift?.shiftId === shiftId) {
      section.currentShift = undefined;
    }

    // Emit completion event
    this.eventSystem.emit(GameEvents.SHIFT_COMPLETED, { shift, rewards });

    console.log(`[ShiftManager] Completed shift ${shiftId}`, rewards);
    
    // Clean up the completing flag
    this.completingShifts.delete(shiftId);
    
    return rewards;
  }

  // Get remaining time for a shift
  getRemainingTime(shiftId: string): number {
    const shifts = this.gameState.getActiveShifts();
    const shift = shifts.find(s => s.shiftId === shiftId);

    if (!shift || shift.status !== 'running' || !shift.startedAt) {
      return 0;
    }

    const elapsed = Date.now() - shift.startedAt;
    return Math.max(0, shift.duration - elapsed);
  }

  // Check if pets can be assigned (not already in use)
  canAssignPets(petIds: string[]): boolean {
    const activeShifts = this.gameState.getActiveShifts();
    const assignedPets = new Set(
      activeShifts.flatMap(shift => shift.assignedPets)
    );

    return petIds.every(petId => !assignedPets.has(petId));
  }

  // Private helper methods
  private getSection(sectionType: SectionType): CafeSection | undefined {
    return this.gameState.getCafeSections().find(s => s.sectionType === sectionType);
  }

  private calculateDuration(petIds: string[], consumables?: Record<string, number>): number {
    let duration = this.BASE_SHIFT_DURATION;

    // Apply consumable effects
    if (consumables?.['speed_boost']) {
      duration *= 0.5; // 50% faster
    }

    // Could apply pet-based modifiers here
    // For now, return base duration
    return duration;
  }

  private calculateEfficiency(petIds: string[], section: CafeSection): number {
    // Base efficiency
    let efficiency = 1.0;

    // Pet affinity bonus (pets that match the section type)
    const player = this.gameState.getPlayer();
    const matchingPets = petIds.filter(petId => {
      const pet = player.pets.find(p => p.petId === petId);
      return pet?.affinity === section.helper.npcId;
    });

    efficiency += matchingPets.length * 0.1; // 10% per matching pet

    // Helper level bonus
    efficiency += section.helper.level * 0.05; // 5% per helper level

    return Math.min(efficiency, 2.0); // Cap at 200%
  }

  private calculatePotentialRewards(sectionType: SectionType, petIds: string[]): ShiftRewards {
    const baseRewards = {
      coins: 30,
      helperXP: 10,
      memoryCandidateId: `memory_${Date.now()}`
    };

    // Adjust based on section type
    const sectionMultipliers: Record<SectionType, number> = {
      'Bakery': 1.0,
      'Playground': 1.1,
      'Styling': 1.2
    };

    const multiplier = sectionMultipliers[sectionType] || 1.0;

    return {
      coins: Math.floor(baseRewards.coins * multiplier * petIds.length),
      helperXP: Math.floor(baseRewards.helperXP * multiplier),
      memoryCandidateId: baseRewards.memoryCandidateId
    };
  }


  private startShiftTimer(shiftId: string): void {
    // Timer is no longer needed since update loop handles completion
    // Keeping method for compatibility but it's now a no-op
  }

  private clearShiftTimer(shiftId: string): void {
    const timer = this.timers.get(shiftId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(shiftId);
    }
  }

  private startUpdateLoop(): void {
    this.updateInterval = setInterval(() => {
      // Check all active shifts
      const activeShifts = this.gameState.getActiveShifts();
      
      activeShifts.forEach(shift => {
        if (shift.status === 'running') {
          const remainingTime = this.getRemainingTime(shift.shiftId);
          
          // Emit update event for UI
          this.eventSystem.emit('shift:timer_update', {
            shiftId: shift.shiftId,
            sectionType: shift.sectionType,
            remainingTime,
            progress: 1 - (remainingTime / shift.duration)
          });

          // Auto-complete if time is up
          if (remainingTime <= 0 && !this.timers.has(shift.shiftId)) {
            this.completeShift(shift.shiftId);
          }
        }
      });
    }, this.UPDATE_FREQUENCY);
  }

  private setupEventListeners(): void {
    // Listen for game state restoration (page reload)
    this.eventSystem.on('game:loaded', () => {
      // Restore timers for active shifts
      const activeShifts = this.gameState.getActiveShifts();
      activeShifts.forEach(shift => {
        if (shift.status === 'running') {
          this.startShiftTimer(shift.shiftId);
        }
      });
    });
  }

  // Cleanup
  destroy(): void {
    // Clear all timers
    this.timers.forEach(timer => clearTimeout(timer));
    this.timers.clear();

    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }

  // Debug methods
  debugCompleteShift(sectionType: SectionType): void {
    const section = this.getSection(sectionType);
    if (section?.currentShift) {
      this.completeShift(section.currentShift.shiftId, true);
    }
  }

  debugSetShiftDuration(seconds: number): void {
    (this as any).BASE_SHIFT_DURATION = seconds * 1000;
    console.log(`[ShiftManager] Debug: Shift duration set to ${seconds} seconds`);
  }
}
