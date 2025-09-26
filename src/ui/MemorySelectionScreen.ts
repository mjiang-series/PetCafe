import { BaseScreen } from './BaseScreen';
import { EventSystem } from '../systems/EventSystem';
import { GameStateManager } from '../systems/GameState';
import { BlogPublisher } from '../systems/BlogPublisher';
import { Memory } from '../models/Memory';

export class MemorySelectionScreen extends BaseScreen {
  private blogPublisher: BlogPublisher;
  private selectedMemory: Memory | null = null;

  constructor(
    id: string,
    eventSystem: EventSystem,
    gameState: GameStateManager,
    blogPublisher: BlogPublisher
  ) {
    super(id, eventSystem, gameState);
    this.blogPublisher = blogPublisher;
  }

  createElement(): HTMLElement {
    const element = document.createElement('div');
    element.id = 'memory-selection-screen';
    element.className = 'screen memory-selection-screen';
    
    element.innerHTML = `
      <div class="screen-header">
        <button class="btn-icon" data-action="back">
          <span class="material-icons">arrow_back</span>
        </button>
        <h2>Select a Memory to Publish</h2>
      </div>

      <div class="memory-selection-relationship" id="memory-relationship">
        <!-- Bond summary will appear here -->
      </div>

      <div class="memory-selection-content">
        <div class="memories-grid" id="memories-grid">
          <!-- Memory cards will be generated here -->
        </div>
        
        <div class="memory-preview" id="memory-preview" style="display: none;">
          <h3>Preview</h3>
          <div class="preview-content">
            <div class="preview-image">
              <img id="preview-image" src="" alt="Memory preview" />
            </div>
            <div class="preview-details">
              <p class="preview-text" id="preview-text"></p>
              <div class="preview-meta">
                <span class="mood-tag" id="preview-mood"></span>
                <span class="location-tag" id="preview-location"></span>
              </div>
              <div class="preview-pets" id="preview-pets"></div>
            </div>
          </div>
          <button class="btn btn--primary btn--large" id="publish-btn" disabled>
            <span class="icon-emoji">📝</span> Write Caption & Publish
          </button>
        </div>
      </div>

      <!-- Caption Editor Modal -->
      <div class="modal" id="caption-modal" style="display: none;">
        <div class="modal__backdrop" data-action="close-modal"></div>
        <div class="modal__content caption-editor">
          <h3>Publish Memory</h3>
          
          <div class="editor-preview">
            <img id="editor-image" src="" alt="Memory" />
          </div>
          
          <div class="editor-form">
            <label for="caption-input">Caption</label>
            <textarea 
              id="caption-input" 
              class="caption-textarea"
              placeholder="Write something about this moment..."
              maxlength="280"
            ></textarea>
            <div class="char-count">
              <span id="char-count">0</span>/280
            </div>
            
            <label>Tag NPCs</label>
            <div class="npc-tags" id="npc-tags">
              <label class="npc-tag-option">
                <input type="checkbox" value="aria" />
                <span>🌸 Aria</span>
              </label>
              <label class="npc-tag-option">
                <input type="checkbox" value="kai" />
                <span>🔥 Kai</span>
              </label>
              <label class="npc-tag-option">
                <input type="checkbox" value="elias" />
                <span>✨ Elias</span>
              </label>
            </div>
            
            <div class="editor-actions">
              <button class="btn btn--secondary" data-action="cancel-publish">Cancel</button>
              <button class="btn btn--primary" id="confirm-publish-btn">
                <span class="icon-emoji">📤</span> Publish
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    return element;
  }

  onShow(data?: any): void {
    this.selectedMemory = null;
    this.updateRelationshipSummary();
    this.updateMemoryGrid();
    this.updatePublishButton();
  }

  onHide(): void {
    this.selectedMemory = null;
  }

  setupEventListeners(): void {
    super.setupEventListeners();

    // Back button
    this.addClickHandler('[data-action="back"]', () => {
      this.eventSystem.emit('ui:show_screen', { screenId: 'cafe-overview' });
    });

    // Publish button
    this.addClickHandler('#publish-btn', () => {
      if (this.selectedMemory) {
        this.showCaptionEditor();
      }
    });

    // Caption modal
    this.addClickHandler('[data-action="close-modal"]', () => {
      this.hideCaptionEditor();
    });

    this.addClickHandler('[data-action="cancel-publish"]', () => {
      this.hideCaptionEditor();
    });

    // Caption input
    const captionInput = this.element.querySelector('#caption-input') as HTMLTextAreaElement;
    if (captionInput) {
      captionInput.addEventListener('input', () => {
        const charCount = this.element.querySelector('#char-count');
        if (charCount) {
          charCount.textContent = captionInput.value.length.toString();
        }
      });
    }

    // Confirm publish
    this.addClickHandler('#confirm-publish-btn', () => {
      this.publishMemory();
    });
  }

  private updateMemoryGrid(): void {
    const grid = this.element.querySelector('#memories-grid');
    if (!grid) return;

    const memories = this.blogPublisher.getUnpublishedMemories();
    
    if (memories.length === 0) {
      grid.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">📸</span>
          <p>No memories to publish yet!</p>
          <p class="empty-hint">Complete shifts to generate memories</p>
        </div>
      `;
      return;
    }

    grid.innerHTML = memories.map(memory => `
      <div class="memory-card" data-memory-id="${memory.memoryId}">
        <div class="memory-card__image">
          <span class="memory-icon">📷</span>
        </div>
        <div class="memory-card__content">
          <p class="memory-snippet">${this.truncateText(memory.content, 50)}</p>
          <div class="memory-meta">
            <span class="mood-badge mood--${memory.mood}">${memory.mood}</span>
            <span class="time-ago">${this.getTimeAgo(memory.createdAt)}</span>
          </div>
          <div class="memory-bond-tags">
            ${(memory.taggedNpcs || []).map(npcId => {
              const npc = this.gameState.getNpcConfig?.(npcId);
              return `<span class="memory-bond-tag" data-npc="${npcId}">${npc?.name || npcId}</span>`;
            }).join('')}
          </div>
        </div>
      </div>
    `).join('');

    // Add click handlers to memory cards
    grid.querySelectorAll('.memory-card').forEach(card => {
      card.addEventListener('click', () => {
        const memoryId = card.getAttribute('data-memory-id');
        if (memoryId) {
          this.selectMemory(memoryId);
        }
      });
    });
  }

  private updateRelationshipSummary(): void {
    const banner = this.element.querySelector('#memory-relationship');
    if (!banner) return;

    const unpublished = this.blogPublisher.getUnpublishedMemories();
    if (!unpublished.length) {
      banner.innerHTML = '';
      return;
    }

    // Aggregate bond gains by NPC
    const npcTotals: Record<string, number> = {};
    unpublished.forEach(memory => {
      (memory.taggedNpcs || []).forEach(npcId => {
        npcTotals[npcId] = (npcTotals[npcId] || 0) + (memory.bondPointsAwarded || 10);
      });
    });

    banner.innerHTML = `
      <div class="memory-relationship-banner">
        <h3>Pending Memories</h3>
        <p>Publishing will grant bond boosts. Tag your helpers to unlock new scenes.</p>
        <div class="memory-relationship-grid">
          ${Object.entries(npcTotals).map(([npcId, total]) => {
            const npc = this.gameState.getNpcConfig?.(npcId);
            return `
              <div class="memory-relationship-card" data-npc="${npcId}">
                <img src="${npc?.artRefs?.portrait ? (npc.artRefs.portrait.startsWith('/') ? npc.artRefs.portrait.substring(1) : npc.artRefs.portrait) : 'art/ui/placeholder_icon.svg'}" alt="${npc?.name || npcId}" />
                <div class="memory-relationship-info">
                  <h4>${npc?.name || npcId}</h4>
                  <p>+${total} bond pending</p>
                  <button class="btn-link" data-action="message" data-npc="${npcId}">Message ${npc?.name || npcId}</button>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    banner.querySelectorAll('[data-action="message"]').forEach(btn => {
      btn.addEventListener('click', () => {
        const npcId = btn.getAttribute('data-npc');
        if (npcId) {
          this.eventSystem.emit('ui:show_screen', { screenId: `dm-${npcId}`, params: { npcId } });
        }
      });
    });
  }

  private selectMemory(memoryId: string): void {
    const memories = this.blogPublisher.getUnpublishedMemories();
    const memory = memories.find(m => m.memoryId === memoryId);
    
    if (!memory) return;
    
    this.selectedMemory = memory;
    
    // Update selection state
    this.element.querySelectorAll('.memory-card').forEach(card => {
      card.classList.toggle('selected', card.getAttribute('data-memory-id') === memoryId);
    });
    
    // Show preview
    this.showMemoryPreview(memory);
    this.updatePublishButton();
  }

  private showMemoryPreview(memory: Memory): void {
    const preview = this.element.querySelector('#memory-preview') as HTMLElement;
    if (!preview) return;
    
    preview.style.display = 'block';
    
    // Update preview content
    const previewImage = preview.querySelector('#preview-image') as HTMLImageElement;
    const previewText = preview.querySelector('#preview-text');
    const previewMood = preview.querySelector('#preview-mood');
    const previewLocation = preview.querySelector('#preview-location');
    const previewPets = preview.querySelector('#preview-pets');
    
    if (previewImage) {
      // Check if the image URL is valid
      if (memory.imageUrl && memory.imageUrl.includes('.svg')) {
        previewImage.src = memory.imageUrl;
        previewImage.style.display = 'block';
        previewImage.onerror = () => {
          // If image fails to load, show placeholder
          previewImage.style.display = 'none';
          const placeholder = document.createElement('div');
          placeholder.className = 'image-placeholder';
          placeholder.innerHTML = `<span class="image-icon">📸</span><div>${memory.location}</div>`;
          previewImage.parentElement?.appendChild(placeholder);
        };
      } else {
        // Show placeholder instead of broken image
        previewImage.style.display = 'none';
        const existingPlaceholder = previewImage.parentElement?.querySelector('.image-placeholder');
        if (!existingPlaceholder) {
          const placeholder = document.createElement('div');
          placeholder.className = 'image-placeholder';
          placeholder.innerHTML = `<span class="image-icon">📸</span><div>${memory.location}</div>`;
          previewImage.parentElement?.appendChild(placeholder);
        }
      }
    }
    
    if (previewText) {
      previewText.textContent = memory.content;
    }
    
    if (previewMood) {
      previewMood.textContent = memory.mood;
      previewMood.className = `mood-tag mood--${memory.mood}`;
    }
    
    if (previewLocation) {
      previewLocation.textContent = memory.location;
    }
    
    if (previewPets) {
      const state = this.gameState.getState();
      const pets = state.player.pets.filter(p => memory.petIds.includes(p.petId));
      previewPets.innerHTML = pets.map(pet => 
        `<span class="pet-tag">${pet.name}</span>`
      ).join('');
    }
  }

  private updatePublishButton(): void {
    const publishBtn = this.element.querySelector('#publish-btn') as HTMLButtonElement;
    if (publishBtn) {
      publishBtn.disabled = !this.selectedMemory;
    }
  }

  private showCaptionEditor(): void {
    const modal = this.element.querySelector('#caption-modal') as HTMLElement;
    if (!modal || !this.selectedMemory) return;
    
    modal.style.display = 'block';
    
    // Update editor image
    const editorImage = modal.querySelector('#editor-image') as HTMLImageElement;
    if (editorImage) {
      editorImage.src = this.selectedMemory.imageUrl || '/assets/memories/default.jpg';
    }
    
    // Pre-fill caption with memory content
    const captionInput = modal.querySelector('#caption-input') as HTMLTextAreaElement;
    if (captionInput) {
      captionInput.value = this.selectedMemory.caption || '';
      captionInput.focus();
      
      // Update char count
      const charCount = modal.querySelector('#char-count');
      if (charCount) {
        charCount.textContent = captionInput.value.length.toString();
      }
    }
    
    // Reset NPC tags
    modal.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
      (checkbox as HTMLInputElement).checked = false;
    });
  }

  private hideCaptionEditor(): void {
    const modal = this.element.querySelector('#caption-modal') as HTMLElement;
    if (modal) {
      modal.style.display = 'none';
    }
  }

  private publishMemory(): void {
    if (!this.selectedMemory) return;
    
    const captionInput = this.element.querySelector('#caption-input') as HTMLTextAreaElement;
    const caption = captionInput?.value || this.selectedMemory.content;
    
    // Get tagged NPCs
    const taggedNpcs: string[] = [];
    this.element.querySelectorAll('#npc-tags input:checked').forEach(checkbox => {
      taggedNpcs.push((checkbox as HTMLInputElement).value);
    });
    
    // Publish the memory
    const blogPost = this.blogPublisher.publishMemory(
      this.selectedMemory.memoryId,
      caption,
      taggedNpcs
    );
    
    if (blogPost) {
      // Show success notification
      this.eventSystem.emit('ui:show_notification', {
        type: 'success',
        title: 'Published!',
        message: `Gained ${blogPost.engagement.subscribersGained} new subscribers!`
      });
      
      // Navigate to blog screen
      this.eventSystem.emit('ui:show_screen', { screenId: 'blog' });
    }
  }

  private truncateText(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  }

  private getTimeAgo(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  }
}
