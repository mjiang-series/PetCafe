// Central exports for all game models
export * from './Pet';
export * from './NPC';
export * from './Player';
export * from './Memory';
export * from './Shift';
export * from './Blog';
export * from './Quest';

// Game state interface that combines all entities
import { Player } from './Player';
import { Shift } from './Shift';
import { Memory } from './Memory';
import { CafeSection } from './Shift';
import { BlogPost } from './Blog';

export interface GameState {
  player: Player;
  activeShifts: Shift[];
  cafeLayout: CafeSection[];
  unlockedContent: UnlockState;
  uiState: UIState;
  gameSession: GameSession;
  blogPosts?: BlogPost[];
}

export interface UnlockState {
  sections: Record<string, boolean>;
  npcs: Record<string, boolean>;
  features: Record<string, boolean>;
  scenes: Record<string, boolean>;
  milestones?: Record<string, boolean>;
}

export interface UIState {
  currentScreen: string;
  previousScreen?: string;
  overlays: string[];
  notifications: UINotification[];
  loading: boolean;
  error?: string;
}

export interface UINotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: number;
  duration?: number;
  actions?: NotificationAction[];
}

export interface NotificationAction {
  label: string;
  action: string;
  style?: 'primary' | 'secondary' | 'danger';
}

export interface GameSession {
  sessionId: string;
  startTime: number;
  lastSaveTime: number;
  playTime: number;
  isOnline: boolean;
  debugMode: boolean;
  version?: string;
}

