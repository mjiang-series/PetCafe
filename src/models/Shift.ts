// Shift management and cafe operations interfaces
import { SectionType } from './Pet';

export { SectionType };
export type ShiftStatus = 'idle' | 'running' | 'complete' | 'cancelled';

export interface Shift {
  shiftId: string;
  sectionType: SectionType;
  assignedPets: string[]; // pet IDs
  helperNpcId: string;
  duration: number; // in milliseconds
  startedAt?: number; // timestamp when shift started
  completedAt?: number; // timestamp when shift completed
  status: ShiftStatus;
  rewards: ShiftRewards;
  consumablesUsed: Record<string, number>;
  efficiency: number; // calculated based on pets and bonuses
}

export interface ShiftRewards {
  coins: number;
  helperXP: number; // Deprecated - kept for compatibility
  npcBondXP?: number; // NPC relationship XP
  memoryCandidateId?: string | undefined; // potential memory to be published
  bonusRewards?: {
    premiumCurrency?: number | undefined;
    dupeTokens?: number | undefined;
    freeGachaCurrency?: number | undefined; // Gacha tickets
    specialItems?: Record<string, number> | undefined;
  } | undefined;
}

export interface ShiftTemplate {
  sectionType: SectionType;
  baseDuration: number;
  baseRewards: {
    coins: number;
    helperXP: number;
  };
  petSlots: number;
  consumableSlots: number;
  unlockRequirements: {
    cafeLevel: number;
    npcBondLevel?: number;
  };
}

export interface CafeSection {
  sectionId: string;
  sectionType: SectionType;
  level: number;
  isUnlocked: boolean;
  currentShift?: Shift;
  helper: {
    npcId: string;
    level: number;
    experience: number;
  };
  upgrades: SectionUpgrade[];
  capacity: {
    petSlots: number;
    consumableSlots: number;
  };
}

export interface SectionUpgrade {
  upgradeId: string;
  name: string;
  description: string;
  cost: {
    coins?: number;
    premiumCurrency?: number;
    materials?: Record<string, number>;
  };
  effects: {
    efficiencyBonus?: number;
    durationReduction?: number;
    rewardMultiplier?: number;
    newFeatures?: string[];
  };
  isUnlocked: boolean;
  isPurchased: boolean;
}

export interface Consumable {
  consumableId: string;
  name: string;
  description: string;
  effects: {
    finishShiftImmediately?: boolean;
    efficiencyBonus?: number;
    rewardMultiplier?: number;
    durationReduction?: number;
  };
  cost: {
    coins?: number;
    premiumCurrency?: number;
  };
  rarity: 'common' | 'rare' | 'epic';
  stackLimit: number;
}

