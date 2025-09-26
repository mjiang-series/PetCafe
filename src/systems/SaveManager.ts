// Enhanced Save System with versioning and migration support
import { GameState } from '../models';
import { EventSystem } from './EventSystem';

export interface SaveMetadata {
  version: string;
  timestamp: number;
  playTime: number;
  lastScreen?: string;
  checksum?: string;
}

export interface SaveData {
  metadata: SaveMetadata;
  gameState: GameState;
}

export interface SaveSlot {
  id: string;
  name: string;
  metadata: SaveMetadata;
  thumbnail?: string;
}

type MigrationFunction = (data: any) => any;

export class SaveManager {
  private static readonly CURRENT_VERSION = '1.1.0';
  private static readonly SAVE_KEY_PREFIX = 'petcafe_save_';
  private static readonly METADATA_KEY = 'petcafe_saves_metadata';
  private static readonly MAX_SLOTS = 3;
  
  private eventSystem: EventSystem;
  private migrations: Map<string, MigrationFunction>;
  private currentSlotId: string = 'slot1';
  private autoSaveInterval?: number;
  private lastSaveTime: number = 0;
  
  constructor(eventSystem: EventSystem) {
    this.eventSystem = eventSystem;
    this.migrations = new Map();
    this.registerMigrations();
    this.setupAutoSave();
  }
  
  // Register migration functions for different versions
  private registerMigrations(): void {
    // Example: Migrate from 1.0.0 to 1.1.0
    this.migrations.set('1.0.0', (data: any) => {
      // Add new fields that didn't exist in 1.0.0
      if (!data.player.statistics) {
        data.player.statistics = {
          totalShifts: 0,
          totalPets: data.player.pets?.length || 0,
          totalMemories: 0,
          totalCoinsEarned: 0
        };
      }
      return data;
    });
  }
  
  // Save game state to a specific slot
  async save(gameState: GameState, slotId: string = this.currentSlotId, slotName?: string): Promise<boolean> {
    try {
      const saveData: SaveData = {
        metadata: {
          version: SaveManager.CURRENT_VERSION,
          timestamp: Date.now(),
          playTime: this.calculatePlayTime(),
          lastScreen: this.getCurrentScreen(),
          checksum: this.generateChecksum(gameState)
        },
        gameState: this.compressState(gameState)
      };
      
      // Save to localStorage
      const key = SaveManager.SAVE_KEY_PREFIX + slotId;
      const serialized = JSON.stringify(saveData);
      localStorage.setItem(key, serialized);
      
      // Update metadata
      this.updateSaveMetadata(slotId, slotName || `Save ${slotId.slice(-1)}`, saveData.metadata);
      
      this.lastSaveTime = Date.now();
      this.eventSystem.emit('save:success', { slotId, timestamp: saveData.metadata.timestamp });
      
      console.log(`[SaveManager] Game saved to ${slotId}`);
      return true;
      
    } catch (error) {
      console.error('[SaveManager] Save failed:', error);
      this.eventSystem.emit('save:error', { slotId, error });
      return false;
    }
  }
  
  // Load game state from a specific slot
  async load(slotId: string = this.currentSlotId): Promise<GameState | null> {
    try {
      const key = SaveManager.SAVE_KEY_PREFIX + slotId;
      const serialized = localStorage.getItem(key);
      
      if (!serialized) {
        console.log(`[SaveManager] No save found in ${slotId}`);
        return null;
      }
      
      const saveData: SaveData = JSON.parse(serialized);
      
      // Validate save data
      if (!this.validateSave(saveData)) {
        throw new Error('Save data validation failed');
      }
      
      // Migrate if necessary
      let gameState = saveData.gameState;
      if (saveData.metadata.version !== SaveManager.CURRENT_VERSION) {
        gameState = this.migrate(gameState, saveData.metadata.version);
      }
      
      // Decompress state
      gameState = this.decompressState(gameState);
      
      this.currentSlotId = slotId;
      this.eventSystem.emit('save:loaded', { slotId, metadata: saveData.metadata });
      
      console.log(`[SaveManager] Game loaded from ${slotId}`);
      return gameState;
      
    } catch (error) {
      console.error('[SaveManager] Load failed:', error);
      this.eventSystem.emit('save:error', { slotId, error });
      
      // Attempt recovery from backup if available
      return this.attemptRecovery(slotId);
    }
  }
  
  // Get all save slots with metadata
  getSaveSlots(): SaveSlot[] {
    const metadataStr = localStorage.getItem(SaveManager.METADATA_KEY);
    const metadata = metadataStr ? JSON.parse(metadataStr) : {};
    
    const slots: SaveSlot[] = [];
    for (let i = 1; i <= SaveManager.MAX_SLOTS; i++) {
      const slotId = `slot${i}`;
      const slotMeta = metadata[slotId];
      
      if (slotMeta) {
        slots.push({
          id: slotId,
          name: slotMeta.name || `Save ${i}`,
          metadata: slotMeta,
          thumbnail: slotMeta.thumbnail
        });
      } else {
        // Empty slot
        slots.push({
          id: slotId,
          name: `Empty Slot ${i}`,
          metadata: {
            version: SaveManager.CURRENT_VERSION,
            timestamp: 0,
            playTime: 0
          }
        });
      }
    }
    
    return slots;
  }
  
  // Delete a save slot
  deleteSave(slotId: string): boolean {
    try {
      const key = SaveManager.SAVE_KEY_PREFIX + slotId;
      localStorage.removeItem(key);
      
      // Update metadata
      const metadataStr = localStorage.getItem(SaveManager.METADATA_KEY);
      const metadata = metadataStr ? JSON.parse(metadataStr) : {};
      delete metadata[slotId];
      localStorage.setItem(SaveManager.METADATA_KEY, JSON.stringify(metadata));
      
      this.eventSystem.emit('save:deleted', { slotId });
      console.log(`[SaveManager] Save deleted from ${slotId}`);
      return true;
      
    } catch (error) {
      console.error('[SaveManager] Delete failed:', error);
      return false;
    }
  }
  
  // Migrate save data from old version to current
  private migrate(gameState: any, fromVersion: string): GameState {
    console.log(`[SaveManager] Migrating from ${fromVersion} to ${SaveManager.CURRENT_VERSION}`);
    
    let currentVersion = fromVersion;
    let migratedState = gameState;
    
    // Apply migrations in sequence
    const versions = Array.from(this.migrations.keys()).sort();
    for (const version of versions) {
      if (version >= currentVersion && version < SaveManager.CURRENT_VERSION) {
        const migrationFn = this.migrations.get(version);
        if (migrationFn) {
          migratedState = migrationFn(migratedState);
          console.log(`[SaveManager] Applied migration for ${version}`);
        }
      }
    }
    
    return migratedState;
  }
  
  // Validate save data integrity
  private validateSave(saveData: SaveData): boolean {
    // Check required fields
    if (!saveData.metadata || !saveData.gameState) {
      return false;
    }
    
    // Verify checksum if present
    if (saveData.metadata.checksum) {
      const calculatedChecksum = this.generateChecksum(saveData.gameState);
      if (calculatedChecksum !== saveData.metadata.checksum) {
        console.warn('[SaveManager] Checksum mismatch - save may be corrupted');
        // For now, just warn but don't fail
      }
    }
    
    // Check version compatibility
    const majorVersion = saveData.metadata.version.split('.')[0];
    const currentMajor = SaveManager.CURRENT_VERSION.split('.')[0];
    if (majorVersion > currentMajor) {
      console.error('[SaveManager] Save is from a newer version');
      return false;
    }
    
    return true;
  }
  
  // Compress game state to reduce storage size
  private compressState(gameState: GameState): any {
    // Simple compression: remove default values and empty arrays
    const compressed = JSON.parse(JSON.stringify(gameState));
    
    // Remove empty arrays
    this.removeEmptyValues(compressed);
    
    return compressed;
  }
  
  // Decompress game state
  private decompressState(compressed: any): GameState {
    // Restore default values if missing
    const decompressed = { ...compressed };
    
    // Ensure all required fields exist
    if (!decompressed.player.currencies) {
      decompressed.player.currencies = { coins: 0, premiumCurrency: 0 };
    }
    
    if (!decompressed.player.pets) {
      decompressed.player.pets = [];
    }
    
    return decompressed as GameState;
  }
  
  // Generate checksum for save validation
  private generateChecksum(gameState: GameState): string {
    const str = JSON.stringify(gameState);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(16);
  }
  
  // Update save metadata
  private updateSaveMetadata(slotId: string, name: string, metadata: SaveMetadata): void {
    const metadataStr = localStorage.getItem(SaveManager.METADATA_KEY);
    const allMetadata = metadataStr ? JSON.parse(metadataStr) : {};
    
    allMetadata[slotId] = {
      name,
      ...metadata,
      thumbnail: this.generateThumbnail()
    };
    
    localStorage.setItem(SaveManager.METADATA_KEY, JSON.stringify(allMetadata));
  }
  
  // Setup auto-save functionality
  private setupAutoSave(): void {
    // Auto-save every 60 seconds
    this.autoSaveInterval = window.setInterval(() => {
      this.eventSystem.emit('save:auto');
    }, 60000);
    
    // Save on important events
    this.eventSystem.on('shift:completed', () => this.triggerAutoSave());
    this.eventSystem.on('gacha:pulled', () => this.triggerAutoSave());
    this.eventSystem.on('memory:published', () => this.triggerAutoSave());
    
    // Save before unload
    window.addEventListener('beforeunload', () => {
      this.eventSystem.emit('save:beforeunload');
    });
  }
  
  // Trigger auto-save with debouncing
  private triggerAutoSave(): void {
    const now = Date.now();
    if (now - this.lastSaveTime > 5000) { // Min 5 seconds between saves
      this.eventSystem.emit('save:auto');
    }
  }
  
  // Attempt to recover from corrupted save
  private attemptRecovery(slotId: string): GameState | null {
    const backupKey = `${SaveManager.SAVE_KEY_PREFIX}${slotId}_backup`;
    const backupData = localStorage.getItem(backupKey);
    
    if (backupData) {
      console.log('[SaveManager] Attempting recovery from backup');
      try {
        const saveData: SaveData = JSON.parse(backupData);
        return this.decompressState(saveData.gameState);
      } catch (error) {
        console.error('[SaveManager] Backup recovery failed:', error);
      }
    }
    
    return null;
  }
  
  // Helper to remove empty values from object
  private removeEmptyValues(obj: any): void {
    Object.keys(obj).forEach(key => {
      if (obj[key] && typeof obj[key] === 'object') {
        if (Array.isArray(obj[key]) && obj[key].length === 0) {
          delete obj[key];
        } else {
          this.removeEmptyValues(obj[key]);
        }
      }
    });
  }
  
  // Calculate total play time
  private calculatePlayTime(): number {
    // This would track actual play time in a real implementation
    return Math.floor((Date.now() - (window as any).gameStartTime || Date.now()) / 1000);
  }
  
  // Get current screen for metadata
  private getCurrentScreen(): string {
    const visibleScreen = document.querySelector('.screen--visible');
    return visibleScreen?.id || 'unknown';
  }
  
  // Generate thumbnail for save slot
  private generateThumbnail(): string {
    // In a real implementation, this would capture a screenshot
    // For now, return a placeholder
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCI+PC9zdmc+';
  }
  
  // Cleanup
  destroy(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }
  }
}
