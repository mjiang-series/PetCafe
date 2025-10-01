// Quest system for interactive map-based shifts
import { SectionType } from './Pet';

export interface Quest {
  questId: string;
  sectionType: SectionType;
  title: string;
  description: string;
  requiredTrait: string; // Special trait needed for this quest
  duration: number; // in milliseconds
  position: { x: number; y: number }; // Position on map (percentage)
  baseRewards: {
    coins: number;
    npcBondXP: number;
    freeGachaCurrency?: number; // Gacha tickets
  };
  rarityMultipliers: {
    '3-star': number;
    '4-star': number;
    '5-star': number;
  };
}

export interface ActiveQuest {
  questId: string;
  assignedPetId: string;
  startedAt: number;
  completesAt: number;
  status: 'active' | 'complete' | 'collected';
  rewards: {
    coins: number;
    npcBondXP: number;
    freeGachaCurrency?: number;
  };
}

