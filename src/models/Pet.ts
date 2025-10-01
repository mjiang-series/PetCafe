// Pet entity interface and related types
export type PetRarity = '3-star' | '4-star' | '5-star';
export type SectionType = 'bakery' | 'playground' | 'salon';

export interface Pet {
  petId: string;
  name: string;
  rarity: PetRarity;
  sectionAffinity: SectionType;
  npcAffinity: string;
  artRefs: {
    portrait: string;
    showcase: string;
    animations?: string[];
  };
  description?: string;
}

export interface PlayerPet {
  petId: string;
  skinId?: string;
  acquiredAt: number; // timestamp
  assignedSection?: SectionType;
  affinity?: string; // NPC affinity
  passiveBuffs?: Record<string, number>;
  viewedInCollection?: boolean; // Track if player has seen this pet in collection
}

export interface PetStats {
  efficiency: number;
  charm: number;
  energy: number;
}

