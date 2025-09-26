// Event system for decoupled communication between game systems
export type EventCallback = (data?: any) => void;

export class EventSystem {
  private listeners: Map<string, EventCallback[]> = new Map();
  private debugMode: boolean = false;

  constructor(debugMode: boolean = false) {
    this.debugMode = debugMode;
  }

  // Subscribe to an event
  on(event: string, callback: EventCallback): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    
    const callbacks = this.listeners.get(event)!;
    callbacks.push(callback);

    if (this.debugMode) {
      console.log(`[EventSystem] Listener added for event: ${event} (${callbacks.length} total)`);
    }
  }

  // Unsubscribe from an event
  off(event: string, callback: EventCallback): void {
    const callbacks = this.listeners.get(event);
    if (!callbacks) return;

    const index = callbacks.indexOf(callback);
    if (index > -1) {
      callbacks.splice(index, 1);
      
      if (this.debugMode) {
        console.log(`[EventSystem] Listener removed for event: ${event} (${callbacks.length} remaining)`);
      }
    }
  }

  // Subscribe to an event once (auto-unsubscribe after first call)
  once(event: string, callback: EventCallback): void {
    const onceCallback: EventCallback = (data) => {
      callback(data);
      this.off(event, onceCallback);
    };
    
    this.on(event, onceCallback);
  }

  // Emit an event to all subscribers
  emit(event: string, data?: any): void {
    const callbacks = this.listeners.get(event);
    if (!callbacks || callbacks.length === 0) {
      if (this.debugMode) {
        console.log(`[EventSystem] No listeners for event: ${event}`);
      }
      return;
    }

    if (this.debugMode) {
      console.log(`[EventSystem] Emitting event: ${event} to ${callbacks.length} listeners`, data);
    }

    // Call all callbacks, catching errors to prevent one bad listener from breaking others
    callbacks.forEach((callback, index) => {
      try {
        callback(data);
      } catch (error) {
        console.error(`[EventSystem] Error in listener ${index} for event ${event}:`, error);
      }
    });
  }

  // Remove all listeners for an event
  removeAllListeners(event?: string): void {
    if (event) {
      this.listeners.delete(event);
      if (this.debugMode) {
        console.log(`[EventSystem] All listeners removed for event: ${event}`);
      }
    } else {
      this.listeners.clear();
      if (this.debugMode) {
        console.log(`[EventSystem] All listeners removed for all events`);
      }
    }
  }

  // Get list of events that have listeners
  getEvents(): string[] {
    return Array.from(this.listeners.keys());
  }

  // Get listener count for an event
  getListenerCount(event: string): number {
    return this.listeners.get(event)?.length || 0;
  }

  // Enable/disable debug logging
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  // Utility method to create namespaced event names
  static createEvent(namespace: string, action: string): string {
    return `${namespace}:${action}`;
  }
}

// Predefined event constants for type safety
export const GameEvents = {
  // Player events
  PLAYER_UPDATED: 'player:updated',
  PLAYER_LEVEL_UP: 'player:level_up',
  CURRENCY_CHANGED: 'player:currency_changed',
  
  // Pet events
  PET_ACQUIRED: 'pet:acquired',
  PET_ASSIGNED: 'pet:assigned',
  PET_UNASSIGNED: 'pet:unassigned',
  
  // Shift events
  SHIFT_STARTED: 'shift:started',
  SHIFT_COMPLETED: 'shift:completed',
  SHIFT_UPDATED: 'shift:updated',
  SHIFT_REMOVED: 'shift:removed',
  
  // Memory and blog events
  MEMORY_CREATED: 'memory:created',
  MEMORY_PUBLISHED: 'memory:published',
  BLOG_UPDATED: 'blog:updated',
  
  // NPC events
  NPC_BOND_INCREASED: 'npc:bond_increased',
  NPC_MESSAGE_RECEIVED: 'npc:message_received',
  NPC_CALL_INCOMING: 'npc:call_incoming',
  NPC_SCENE_UNLOCKED: 'npc:scene_unlocked',
  
  // UI events
  UI_SCREEN_CHANGED: 'ui:screen_changed',
  UI_NOTIFICATION_ADDED: 'ui:notification_added',
  UI_LOADING_CHANGED: 'ui:loading_changed',
  
  // Content unlock events
  CONTENT_UNLOCKED: 'content:unlocked',
  SECTION_UNLOCKED: 'section:unlocked',
  FEATURE_UNLOCKED: 'feature:unlocked',
  
  // System events
  GAME_SAVED: 'game:saved',
  GAME_LOADED: 'game:loaded',
  GAME_ERROR: 'game:error'
} as const;

// Type for event data payloads
export interface EventPayloads {
  'player:updated': { old: any; new: any; changes: any };
  'pet:acquired': { pet: any; source: string };
  'shift:completed': { shift: any; rewards: any };
  'memory:published': { memory: any; blogPost: any };
  'npc:bond_increased': { npcId: string; oldLevel: number; newLevel: number };
  'content:unlocked': { category: string; key: string };
  // Add more as needed
}

