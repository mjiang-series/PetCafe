// Player state and progression interfaces
import { PlayerPet, PetRarity } from './Pet';
import { NPCBond } from './NPC';
import { Memory } from './Memory';

export interface Player {
  playerId: string;
  profile: PlayerProfile;
  currencies: PlayerCurrencies;
  pets: PlayerPet[];
  npcBonds: NPCBond[];
  consumables: Record<string, number>;
  dupeTokens: number;
  dupesConverted: Record<string, number>; // petId -> count
  petAffinity: Record<string, PetAffinityStats>; // npcId -> affinity stats
  recentPetAcquisitions?: PetAcquisitionRecord[];
  memories?: Memory[]; // All generated memories (published and unpublished)
  blogPosts: string[]; // blog post IDs in chronological order
  subscribers: number;
  pendingActions: PendingAction[];
  settings: PlayerSettings;
  statistics: PlayerStatistics;
  conversations?: ConversationData; // DM conversation history
  unlockedAchievements?: string[]; // Achievement IDs
  unlockedTitles?: string[]; // Earned titles
}

export interface PlayerProfile {
  displayName?: string;
  joinedAt: number;
  lastActiveAt: number;
  cafeLevel: number;
  totalPlayTime: number;
}

export interface PlayerCurrencies {
  coins: number;
  premiumCurrency: number; // diamonds/wishes
  freeGachaCurrency: number;
}

export interface PendingAction {
  localId: string;
  type: 'gacha_pull' | 'shift_complete' | 'blog_publish' | 'npc_interaction';
  payload: any;
  timestamp: number;
  status: 'pending' | 'processing' | 'complete' | 'failed';
}

export interface PlayerSettings {
  audio: {
    masterVolume: number;
    musicVolume: number;
    sfxVolume: number;
    voiceVolume: number;
  };
  notifications: {
    shiftComplete: boolean;
    newMessages: boolean;
    voiceCalls: boolean;
  };
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    textScale: number;
  };
}

export interface PlayerStatistics {
  totalShiftsCompleted: number;
  totalGachaPulls: number;
  totalBlogPosts: number;
  totalDMsReceived: number;
  totalCallsAnswered: number;
  favoritePet?: string;
  favoriteNPC?: string;
  // Gacha-specific stats
  pityCounter?: number;
  totalPetsCollected?: number;
  pullHistory?: {
    pullId: string;
    timestamp: number;
    resultCount: number;
    rarities: string[];
  }[];
}

export interface PetAffinityStats {
  totalOwned: number;
  byRarity: Record<PetRarity, number>;
  lastAcquiredAt?: number;
}

export interface PetAcquisitionRecord {
  petId: string;
  npcId: string;
  rarity: PetRarity;
  acquiredAt: number;
}

// Conversation data structures
export interface ConversationData {
  [npcId: string]: Conversation;
}

export interface Conversation {
  npcId: string;
  messages: ConversationMessage[];
  lastMessageTime: number;
  unreadCount: number;
  totalMessages: number;
}

export interface ConversationMessage {
  id: string;
  sender: 'player' | 'npc';
  content: string;
  timestamp: number;
  isRead: boolean;
}

