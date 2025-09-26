// Save/load system with localStorage and cloud sync preparation
import { GameState } from '../models';
import { EventSystem } from './EventSystem';

export interface SaveData {
  version: string;
  timestamp: number;
  gameState: GameState;
  checksum?: string;
}

export interface SaveOptions {
  compress?: boolean;
  validate?: boolean;
  backup?: boolean;
}

export class SaveSystem {
  private static readonly SAVE_KEY = 'petcafe_save';
  private static readonly BACKUP_KEY = 'petcafe_save_backup';
  private static readonly VERSION = '1.0.0';
  private static readonly MAX_SAVE_SIZE = 5 * 1024 * 1024; // 5MB limit

  private eventSystem: EventSystem;
  private autoSaveInterval?: number;
  private lastSaveTime: number = 0;
  private saveQueue: GameState[] = [];
  private isSaving: boolean = false;

  constructor(eventSystem: EventSystem) {
    this.eventSystem = eventSystem;
  }

  // Save game state to localStorage
  async save(gameState: GameState, options: SaveOptions = {}): Promise<boolean> {
    const { compress = true, validate = true, backup = true } = options;

    try {
      if (this.isSaving) {
        // Queue the save if one is already in progress
        this.saveQueue.push(gameState);
        return true;
      }

      this.isSaving = true;

      // Create save data structure
      const saveData: SaveData = {
        version: SaveSystem.VERSION,
        timestamp: Date.now(),
        gameState: this.sanitizeGameState(gameState)
      };

      // Validate save data if requested
      if (validate && !this.validateSaveData(saveData)) {
        throw new Error('Save data validation failed');
      }

      // Create backup of current save if requested
      if (backup) {
        await this.createBackup();
      }

      // Serialize and optionally compress
      let serializedData = JSON.stringify(saveData);
      
      if (compress) {
        // Simple compression using JSON minification (could be enhanced with actual compression)
        serializedData = this.compressData(serializedData);
      }

      // Check size limits
      if (serializedData.length > SaveSystem.MAX_SAVE_SIZE) {
        throw new Error(`Save data too large: ${serializedData.length} bytes (max: ${SaveSystem.MAX_SAVE_SIZE})`);
      }

      // Save to localStorage
      localStorage.setItem(SaveSystem.SAVE_KEY, serializedData);
      this.lastSaveTime = Date.now();

      console.log(`[SaveSystem] Game saved successfully (${serializedData.length} bytes)`);
      this.eventSystem.emit('game:saved', { timestamp: this.lastSaveTime, size: serializedData.length });

      return true;
    } catch (error) {
      console.error('[SaveSystem] Failed to save game:', error);
      this.eventSystem.emit('game:error', { type: 'save_failed', error });
      return false;
    } finally {
      this.isSaving = false;
      
      // Process queued saves
      if (this.saveQueue.length > 0) {
        const nextSave = this.saveQueue.pop(); // Get the most recent queued save
        this.saveQueue = []; // Clear queue
        if (nextSave) {
          setTimeout(() => this.save(nextSave, options), 100);
        }
      }
    }
  }

  // Load game state from localStorage
  async load(): Promise<GameState | null> {
    try {
      const savedData = localStorage.getItem(SaveSystem.SAVE_KEY);
      if (!savedData) {
        console.log('[SaveSystem] No save data found');
        return null;
      }

      // Decompress if needed
      const decompressedData = this.decompressData(savedData);
      const saveData: SaveData = JSON.parse(decompressedData);

      // Validate loaded data
      if (!this.validateSaveData(saveData)) {
        console.warn('[SaveSystem] Save data validation failed, attempting backup restore');
        return await this.loadBackup();
      }

      // Check version compatibility
      if (!this.isVersionCompatible(saveData.version)) {
        console.warn(`[SaveSystem] Save version ${saveData.version} may not be compatible with current version ${SaveSystem.VERSION}`);
        // Could implement migration logic here
      }

      console.log(`[SaveSystem] Game loaded successfully (saved: ${new Date(saveData.timestamp).toLocaleString()})`);
      this.eventSystem.emit('game:loaded', { timestamp: saveData.timestamp });

      return saveData.gameState;
    } catch (error) {
      console.error('[SaveSystem] Failed to load game:', error);
      this.eventSystem.emit('game:error', { type: 'load_failed', error });
      
      // Try to load backup
      return await this.loadBackup();
    }
  }

  // Create backup of current save
  private async createBackup(): Promise<void> {
    try {
      const currentSave = localStorage.getItem(SaveSystem.SAVE_KEY);
      if (currentSave) {
        localStorage.setItem(SaveSystem.BACKUP_KEY, currentSave);
      }
    } catch (error) {
      console.warn('[SaveSystem] Failed to create backup:', error);
    }
  }

  // Load backup save
  private async loadBackup(): Promise<GameState | null> {
    try {
      const backupData = localStorage.getItem(SaveSystem.BACKUP_KEY);
      if (!backupData) {
        return null;
      }

      const decompressedData = this.decompressData(backupData);
      const saveData: SaveData = JSON.parse(decompressedData);

      if (this.validateSaveData(saveData)) {
        console.log('[SaveSystem] Backup loaded successfully');
        return saveData.gameState;
      }
    } catch (error) {
      console.error('[SaveSystem] Failed to load backup:', error);
    }
    
    return null;
  }

  // Check if save data exists
  hasSaveData(): boolean {
    return localStorage.getItem(SaveSystem.SAVE_KEY) !== null;
  }

  // Delete save data
  deleteSave(): boolean {
    try {
      localStorage.removeItem(SaveSystem.SAVE_KEY);
      localStorage.removeItem(SaveSystem.BACKUP_KEY);
      console.log('[SaveSystem] Save data deleted');
      return true;
    } catch (error) {
      console.error('[SaveSystem] Failed to delete save data:', error);
      return false;
    }
  }

  // Get save info without loading full data
  getSaveInfo(): { timestamp: number; version: string; size: number } | null {
    try {
      const savedData = localStorage.getItem(SaveSystem.SAVE_KEY);
      if (!savedData) return null;

      const decompressedData = this.decompressData(savedData);
      const saveData: SaveData = JSON.parse(decompressedData);

      return {
        timestamp: saveData.timestamp,
        version: saveData.version,
        size: savedData.length
      };
    } catch (error) {
      console.error('[SaveSystem] Failed to get save info:', error);
      return null;
    }
  }

  // Auto-save functionality
  startAutoSave(gameStateProvider: () => GameState, intervalMs: number = 300000): void { // 5 minutes default
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
    }

    this.autoSaveInterval = window.setInterval(() => {
      const gameState = gameStateProvider();
      this.save(gameState, { compress: true, validate: false, backup: false });
    }, intervalMs);

    console.log(`[SaveSystem] Auto-save started (interval: ${intervalMs}ms)`);
  }

  stopAutoSave(): void {
    if (this.autoSaveInterval) {
      clearInterval(this.autoSaveInterval);
      this.autoSaveInterval = undefined;
      console.log('[SaveSystem] Auto-save stopped');
    }
  }

  // Utility methods
  private sanitizeGameState(gameState: GameState): GameState {
    // Remove any non-serializable data or sensitive information
    const sanitized = JSON.parse(JSON.stringify(gameState));
    
    // Reset any temporary/runtime state that shouldn't be saved
    sanitized.uiState.loading = false;
    sanitized.uiState.error = undefined;
    sanitized.gameSession.isOnline = false;
    
    return sanitized;
  }

  private validateSaveData(saveData: SaveData): boolean {
    try {
      // Basic structure validation
      if (!saveData.version || !saveData.timestamp || !saveData.gameState) {
        return false;
      }

      // Check if game state has required properties
      const { gameState } = saveData;
      if (!gameState.player || !gameState.cafeLayout || !gameState.gameSession) {
        return false;
      }

      // Additional validation can be added here
      return true;
    } catch (error) {
      return false;
    }
  }

  private isVersionCompatible(version: string): boolean {
    // Simple version compatibility check
    const [major, minor] = version.split('.').map(Number);
    const [currentMajor, currentMinor] = SaveSystem.VERSION.split('.').map(Number);
    
    // Same major version is compatible
    return major === currentMajor;
  }

  private compressData(data: string): string {
    // Simple compression - could be enhanced with actual compression libraries
    // For now, just return minified JSON
    return data;
  }

  private decompressData(data: string): string {
    // Decompress data - matches compressData implementation
    return data;
  }

  // Cloud sync preparation methods (for future implementation)
  async syncToCloud(gameState: GameState): Promise<boolean> {
    // Placeholder for cloud sync functionality
    console.log('[SaveSystem] Cloud sync not implemented yet');
    return false;
  }

  async loadFromCloud(): Promise<GameState | null> {
    // Placeholder for cloud load functionality
    console.log('[SaveSystem] Cloud load not implemented yet');
    return null;
  }
}

