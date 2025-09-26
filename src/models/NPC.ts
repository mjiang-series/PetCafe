// NPC entity interface and related types
import { SectionType } from './Pet';

export interface NPC {
  npcId: string;
  name: string;
  sectionType: SectionType;
  personality?: {
    traits?: string[];
    voiceStyle?: string;
  };
  artRefs?: {
    portrait?: string;
    expressions?: Record<string, string>;
    cafeScene?: string;
  };
  bondLevel: number;
  unlockedScenes: BondMilestone[];
  unlockConditions?: NPCUnlockCondition[];
}

export interface NPCUnlockCondition {
  milestoneId: string;
  requiredBondLevel: number;
  requiredBondPoints?: number;
  requiredPets?: number;
  requiredSubscribers?: number;
  unlocks?: {
    conversationTopics?: string[];
    scenes?: string[];
    features?: string[];
  };
}

export interface UnlockedScene {
  sceneId: string;
  viewedAt?: number;
  voicePlayed?: boolean;
  choices?: Record<string, any>;
}

export interface NPCBond {
  npcId: string;
  bondLevel: number;
  bondPoints: number;
  maxBondPoints: number;
  milestones: BondMilestone[];
}

export interface BondMilestone {
  level: number;
  unlocks: {
    scenes?: string[];
    features?: string[];
    content?: string[];
  };
  isUnlocked: boolean;
}

export interface DMMessage {
  messageId: string;
  npcId: string;
  content: string;
  timestamp: number;
  isRead: boolean;
  triggerContext?: {
    memoryId?: string;
    eventType?: string;
  };
}

export interface VoiceCall {
  callId: string;
  npcId: string;
  duration: number;
  timestamp: number;
  content: {
    script?: string;
    audioAsset?: string;
  };
  isAnswered: boolean;
}

