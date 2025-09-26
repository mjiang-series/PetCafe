// Save Slots Screen - Manage multiple save files
import { BaseScreen } from './BaseScreen';
import { EventSystem } from '../systems/EventSystem';
import { GameStateManager } from '../systems/GameState';
import { SaveSystem } from '../systems/SaveSystem';

interface SaveSlotData {
  slotId: string;
  isEmpty: boolean;
  lastSaved?: number;
  playTime?: number;
  coins?: number;
  pets?: number;
  cafeLevel?: number;
}

export class SaveSlotsScreen extends BaseScreen {
  private saveSystem: SaveSystem;
  private slots: SaveSlotData[] = [];
  private selectedSlot?: string;
  
  constructor(id: string, eventSystem: EventSystem, gameState: GameStateManager, saveSystem: SaveSystem) {
    super(id, eventSystem, gameState);
    this.saveSystem = saveSystem;
  }

  createElement(): HTMLElement {
    const element = document.createElement('div');
    element.id = 'save-slots-screen';
    element.className = 'screen save-slots-screen';
    
    element.innerHTML = `
      <div class="save-slots__header">
        <button class="btn btn--back" data-action="back">
          <span class="icon-emoji">←</span> Back
        </button>
        <h2>Save Slots</h2>
      </div>
      
      <div class="save-slots__container">
        <div class="save-slots__grid">
          <!-- Save slots will be rendered here -->
        </div>
        
        <div class="save-slots__actions">
          <button class="btn btn--primary" data-action="load" disabled>
            <span class="icon-emoji">📂</span> Load Game
          </button>
          <button class="btn btn--secondary" data-action="save" disabled>
            <span class="icon-emoji">💾</span> Save Game
          </button>
          <button class="btn btn--danger" data-action="delete" disabled>
            <span class="icon-emoji">🗑️</span> Delete Save
          </button>
        </div>
      </div>
      
      <div class="save-slots__modal" id="confirm-modal" style="display: none;">
        <div class="modal__backdrop"></div>
        <div class="modal__content">
          <h3 id="modal-title">Confirm Action</h3>
          <p id="modal-message">Are you sure?</p>
          <div class="modal__actions">
            <button class="btn btn--secondary" data-modal-action="cancel">Cancel</button>
            <button class="btn btn--primary" data-modal-action="confirm">Confirm</button>
          </div>
        </div>
      </div>
    `;
    
    return element;
  }

  onShow(): void {
    this.loadSaveSlots();
    this.updateUI();
  }

  onHide(): void {
    this.selectedSlot = undefined;
  }

  protected setupEventListeners(): void {
    // Back button
    this.addClickHandler('[data-action="back"]', () => {
      this.eventSystem.emit('ui:show_screen', { screenId: 'title' });
    });

    // Action buttons
    this.addClickHandler('[data-action="load"]', () => this.handleLoad());
    this.addClickHandler('[data-action="save"]', () => this.handleSave());
    this.addClickHandler('[data-action="delete"]', () => this.handleDelete());

    // Modal buttons
    this.addClickHandler('[data-modal-action="cancel"]', () => this.hideModal());
    this.addClickHandler('[data-modal-action="confirm"]', () => this.confirmModalAction());

    // Save slot selection
    this.element.addEventListener('click', (e) => {
      const slotElement = (e.target as HTMLElement).closest('.save-slot');
      if (slotElement) {
        const slotId = slotElement.getAttribute('data-slot-id');
        if (slotId) {
          this.selectSlot(slotId);
        }
      }
    });
  }

  private loadSaveSlots(): void {
    this.slots = [];
    
    // Check 3 save slots
    for (let i = 1; i <= 3; i++) {
      const slotId = `slot${i}`;
      const saveKey = `petcafe_save_${slotId}`;
      const saveData = localStorage.getItem(saveKey);
      
      if (saveData) {
        try {
          const parsed = JSON.parse(saveData);
          const gameState = parsed.gameState || parsed;
          
          this.slots.push({
            slotId,
            isEmpty: false,
            lastSaved: parsed.timestamp || Date.now(),
            playTime: this.calculatePlayTime(gameState),
            coins: gameState.player?.currencies?.coins || 0,
            pets: gameState.player?.pets?.length || 0,
            cafeLevel: gameState.player?.profile?.cafeLevel || 1
          });
        } catch (e) {
          // Corrupted save
          this.slots.push({ slotId, isEmpty: true });
        }
      } else {
        // Empty slot
        this.slots.push({ slotId, isEmpty: true });
      }
    }
  }

  private updateUI(): void {
    const grid = this.element.querySelector('.save-slots__grid');
    if (!grid) return;

    grid.innerHTML = this.slots.map(slot => `
      <div class="save-slot ${slot.isEmpty ? 'save-slot--empty' : ''} ${this.selectedSlot === slot.slotId ? 'save-slot--selected' : ''}" 
           data-slot-id="${slot.slotId}">
        ${slot.isEmpty ? this.renderEmptySlot(slot) : this.renderSaveSlot(slot)}
      </div>
    `).join('');

    // Update action buttons
    this.updateActionButtons();
  }

  private renderEmptySlot(slot: SaveSlotData): string {
    return `
      <div class="save-slot__empty">
        <span class="icon-emoji save-slot__icon">📁</span>
        <h3>Empty Slot</h3>
        <p>No save data</p>
      </div>
    `;
  }

  private renderSaveSlot(slot: SaveSlotData): string {
    const lastSaved = slot.lastSaved ? new Date(slot.lastSaved).toLocaleString() : 'Unknown';
    const playTime = this.formatPlayTime(slot.playTime || 0);
    
    return `
      <div class="save-slot__content">
        <div class="save-slot__preview">
          <span class="icon-emoji save-slot__icon">☕</span>
        </div>
        <div class="save-slot__info">
          <h3>Save ${slot.slotId.slice(-1)}</h3>
          <div class="save-slot__stats">
            <span><span class="icon-emoji">🪙</span> ${slot.coins?.toLocaleString() || 0}</span>
            <span><span class="icon-emoji">🐾</span> ${slot.pets || 0} pets</span>
            <span><span class="icon-emoji">⭐</span> Level ${slot.cafeLevel || 1}</span>
          </div>
          <div class="save-slot__meta">
            <span>Play time: ${playTime}</span>
            <span>Last saved: ${lastSaved}</span>
          </div>
        </div>
      </div>
    `;
  }

  private selectSlot(slotId: string): void {
    this.selectedSlot = slotId;
    
    // Update visual selection
    this.element.querySelectorAll('.save-slot').forEach(slot => {
      slot.classList.toggle('save-slot--selected', slot.getAttribute('data-slot-id') === slotId);
    });
    
    this.updateActionButtons();
  }

  private updateActionButtons(): void {
    const loadBtn = this.element.querySelector('[data-action="load"]') as HTMLButtonElement;
    const saveBtn = this.element.querySelector('[data-action="save"]') as HTMLButtonElement;
    const deleteBtn = this.element.querySelector('[data-action="delete"]') as HTMLButtonElement;
    
    if (!this.selectedSlot) {
      loadBtn.disabled = true;
      saveBtn.disabled = true;
      deleteBtn.disabled = true;
      return;
    }
    
    const slot = this.slots.find(s => s.slotId === this.selectedSlot);
    if (!slot) return;
    
    loadBtn.disabled = slot.isEmpty;
    saveBtn.disabled = false; // Can always save to a slot
    deleteBtn.disabled = slot.isEmpty;
  }

  private handleLoad(): void {
    if (!this.selectedSlot) return;
    
    const slot = this.slots.find(s => s.slotId === this.selectedSlot);
    if (!slot || slot.isEmpty) return;
    
    this.showModal(
      'Load Game',
      'Are you sure you want to load this save? Any unsaved progress will be lost.',
      () => {
        this.loadSaveSlot(this.selectedSlot!);
      }
    );
  }

  private handleSave(): void {
    if (!this.selectedSlot) return;
    
    const slot = this.slots.find(s => s.slotId === this.selectedSlot);
    if (!slot) return;
    
    const message = slot.isEmpty 
      ? 'Save current game to this slot?'
      : 'Overwrite existing save in this slot?';
    
    this.showModal(
      'Save Game',
      message,
      () => {
        this.saveSaveSlot(this.selectedSlot!);
      }
    );
  }

  private handleDelete(): void {
    if (!this.selectedSlot) return;
    
    const slot = this.slots.find(s => s.slotId === this.selectedSlot);
    if (!slot || slot.isEmpty) return;
    
    this.showModal(
      'Delete Save',
      'Are you sure you want to delete this save? This action cannot be undone.',
      () => {
        this.deleteSaveSlot(this.selectedSlot!);
      }
    );
  }

  private loadSaveSlot(slotId: string): void {
    const saveKey = `petcafe_save_${slotId}`;
    const saveData = localStorage.getItem(saveKey);
    
    if (saveData) {
      try {
        // Store current slot for future saves
        localStorage.setItem('petcafe_current_slot', slotId);
        
        // Load the save data
        localStorage.setItem('petcafe_save', saveData);
        
        // Reload the game
        this.eventSystem.emit('game:reload');
        
        // Show success message
        this.eventSystem.emit('ui:show_notification', {
          message: 'Game loaded successfully!',
          type: 'success'
        });
        
        // Navigate to game
        setTimeout(() => {
          this.eventSystem.emit('ui:show_screen', { screenId: 'cafe-overview' });
        }, 500);
        
      } catch (error) {
        this.eventSystem.emit('ui:show_notification', {
          message: 'Failed to load save',
          type: 'error'
        });
      }
    }
  }

  private saveSaveSlot(slotId: string): void {
    const currentSave = localStorage.getItem('petcafe_save');
    
    if (currentSave) {
      const saveKey = `petcafe_save_${slotId}`;
      localStorage.setItem(saveKey, currentSave);
      localStorage.setItem('petcafe_current_slot', slotId);
      
      this.eventSystem.emit('ui:show_notification', {
        message: 'Game saved successfully!',
        type: 'success'
      });
      
      // Refresh slot display
      this.loadSaveSlots();
      this.updateUI();
    }
  }

  private deleteSaveSlot(slotId: string): void {
    const saveKey = `petcafe_save_${slotId}`;
    localStorage.removeItem(saveKey);
    
    // If this was the current slot, clear it
    if (localStorage.getItem('petcafe_current_slot') === slotId) {
      localStorage.removeItem('petcafe_current_slot');
    }
    
    this.eventSystem.emit('ui:show_notification', {
      message: 'Save deleted',
      type: 'success'
    });
    
    // Refresh display
    this.selectedSlot = undefined;
    this.loadSaveSlots();
    this.updateUI();
  }

  private showModal(title: string, message: string, onConfirm: () => void): void {
    const modal = this.element.querySelector('#confirm-modal') as HTMLElement;
    const titleEl = this.element.querySelector('#modal-title') as HTMLElement;
    const messageEl = this.element.querySelector('#modal-message') as HTMLElement;
    
    titleEl.textContent = title;
    messageEl.textContent = message;
    modal.style.display = 'flex';
    
    // Store callback
    (modal as any).confirmCallback = onConfirm;
  }

  private hideModal(): void {
    const modal = this.element.querySelector('#confirm-modal') as HTMLElement;
    modal.style.display = 'none';
    delete (modal as any).confirmCallback;
  }

  private confirmModalAction(): void {
    const modal = this.element.querySelector('#confirm-modal') as HTMLElement;
    const callback = (modal as any).confirmCallback;
    
    if (callback) {
      callback();
    }
    
    this.hideModal();
  }

  private calculatePlayTime(gameState: any): number {
    // Simple calculation - would be more sophisticated in real implementation
    return gameState.player?.statistics?.totalPlayTime || 0;
  }

  private formatPlayTime(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }
}
