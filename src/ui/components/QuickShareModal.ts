import { Memory } from '../../models';
import { GameState } from '../../systems/GameState';
import { EventSystem } from '../../systems/EventSystem';
import { BlogPublisher } from '../../systems/BlogPublisher';
import { getNPCById } from '../../utils/NPCData';
import { getAssetPath } from '../../utils/AssetPaths';

export class QuickShareModal {
  private element: HTMLElement | null = null;
  private memory: Memory | null = null;
  private selectedCaption: string = '';
  private npcSuggestions: string[] = [];

  constructor(
    private gameState: GameState,
    private eventSystem: EventSystem,
    private blogPublisher: BlogPublisher
  ) {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    this.eventSystem.on('ui:show_screen', (data) => {
      if (data.screenId === 'quick-share') {
        // Handle both data structures for compatibility
        const memoryId = data.data?.memoryId || data.memoryId;
        if (memoryId) {
          this.show(memoryId);
        }
      }
    });
  }

  show(memoryId: string): void {
    const player = this.gameState.getPlayer();
    const memory = player.memories?.find(m => 
      m.id === memoryId || m.memoryId === memoryId
    );

    if (!memory) {
      console.warn('[QuickShareModal] Memory not found:', memoryId);
      return;
    }

    this.memory = memory;
    this.generateNPCSuggestions();
    this.create();
  }

  private generateNPCSuggestions(): void {
    if (!this.memory) return;

    this.npcSuggestions = [];

    // Get the primary NPC involved
    const npcId = this.memory.taggedNPCs?.[0] || this.memory.taggedNpcs?.[0];
    if (!npcId) {
      // Generic suggestions if no NPC
      this.npcSuggestions = [
        "What a wonderful moment at the cafe! ✨",
        "Another beautiful memory made today 💕",
        "The magic of our little cafe continues..."
      ];
      return;
    }

    const npc = getNPCById(npcId);
    if (!npc) return;

    // Generate NPC-specific suggestions based on mood and personality
    const mood = this.memory.mood;
    
    if (npc.name === 'Aria') {
      if (mood === 'happy' || mood === 'excited') {
        this.npcSuggestions = [
          "The sweetest moments happen in our cozy bakery! 🍰✨",
          "Aria helped make this memory extra special today! 💕",
          "Nothing beats the warmth of fresh pastries and good company!"
        ];
      } else if (mood === 'peaceful') {
        this.npcSuggestions = [
          "Finding peace in the simple moments with Aria 🌸",
          "The quiet beauty of our bakery captured perfectly",
          "Aria reminds us to slow down and savor life's sweetness"
        ];
      } else {
        this.npcSuggestions = [
          "Every moment with Aria adds sweetness to our cafe 🍪",
          "Grateful for these precious memories in our bakery",
          "Aria's gentle spirit makes every day special"
        ];
      }
    } else if (npc.name === 'Kai') {
      if (mood === 'happy' || mood === 'excited' || mood === 'energetic') {
        this.npcSuggestions = [
          "EPIC moments at the playground with Kai! 🎉🐾",
          "The energy is UNREAL when Kai's around! 💥",
          "Best. Day. EVER! Thanks Kai! 🌟"
        ];
      } else {
        this.npcSuggestions = [
          "Even quiet moments with Kai are an adventure 🎮",
          "Kai shows us that fun comes in all forms!",
          "Never a dull moment at our pet playground!"
        ];
      }
    } else if (npc.name === 'Elias') {
      if (mood === 'peaceful' || mood === 'thoughtful') {
        this.npcSuggestions = [
          "Elias captures the sublime beauty in everyday moments ✨",
          "A moment of elegant tranquility at the salon",
          "The artistry of care, perfectly embodied by Elias"
        ];
      } else {
        this.npcSuggestions = [
          "Elias reminds us that every detail matters 🎨",
          "Witnessing the magic of transformation with Elias",
          "Where grooming becomes an art form"
        ];
      }
    }
  }

  private create(): void {
    if (!this.memory) return;

    // Create modal backdrop
    const backdrop = document.createElement('div');
    backdrop.className = 'modal-backdrop quick-share-backdrop';
    backdrop.innerHTML = `
      <div class="quick-share-modal">
        <div class="modal-header">
          <h3>Share This Moment</h3>
          <button class="modal-close" id="close-share">
            <span class="material-icons">close</span>
          </button>
        </div>

        <div class="memory-preview">
          <img src="${getAssetPath(this.memory.imageUrl || 'art/memories_image_placeholder.png')}" alt="Memory" />
          <span class="memory-mood-badge mood--${this.memory.mood}">${this.memory.mood}</span>
        </div>

        <div class="caption-section">
          <h4>Add Your Caption</h4>
          <textarea 
            class="caption-input" 
            id="caption-input" 
            placeholder="Write something special about this moment..."
            rows="3"
          >${this.memory.caption || ''}</textarea>

          ${this.npcSuggestions.length > 0 ? `
            <div class="suggestions-section">
              <p class="suggestions-label">Suggestions:</p>
              <div class="caption-suggestions">
                ${this.npcSuggestions.map((suggestion, index) => `
                  <button class="suggestion-chip" data-suggestion="${index}">
                    ${suggestion}
                  </button>
                `).join('')}
              </div>
            </div>
          ` : ''}
        </div>

        <div class="share-preview">
          <h4>Preview</h4>
          <div class="preview-card">
            <div class="preview-header">
              <img src="${getAssetPath('art/player_portrait.png')}" alt="You" class="author-portrait" />
              <div class="author-info">
                <span class="author-name">Your Cafe</span>
                <span class="post-time">Just now</span>
              </div>
            </div>
            <p class="preview-caption" id="preview-caption">${this.memory.caption || 'Your caption will appear here...'}</p>
          </div>
        </div>

        <div class="modal-actions">
          <button class="btn btn--secondary" id="cancel-share">Cancel</button>
          <button class="btn btn--primary" id="confirm-share">
            <span class="material-icons">share</span>
            Share Moment
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);
    this.element = backdrop;

    // Setup event handlers
    this.setupModalEventListeners();

    // Focus on caption input
    const captionInput = this.element.querySelector('#caption-input') as HTMLTextAreaElement;
    if (captionInput) {
      captionInput.focus();
    }
  }

  private setupModalEventListeners(): void {
    if (!this.element) return;

    // Close button
    this.element.querySelector('#close-share')?.addEventListener('click', () => {
      this.close();
    });

    // Cancel button
    this.element.querySelector('#cancel-share')?.addEventListener('click', () => {
      this.close();
    });

    // Backdrop click
    this.element.addEventListener('click', (e) => {
      if (e.target === this.element) {
        this.close();
      }
    });

    // Caption input
    const captionInput = this.element.querySelector('#caption-input') as HTMLTextAreaElement;
    if (captionInput) {
      captionInput.addEventListener('input', () => {
        this.selectedCaption = captionInput.value;
        this.updatePreview();
      });
    }

    // Suggestion chips
    this.element.querySelectorAll('.suggestion-chip').forEach(chip => {
      chip.addEventListener('click', (e) => {
        const index = parseInt((e.currentTarget as HTMLElement).dataset.suggestion || '0');
        const suggestion = this.npcSuggestions[index];
        if (suggestion && captionInput) {
          captionInput.value = suggestion;
          this.selectedCaption = suggestion;
          this.updatePreview();
        }
      });
    });

    // Confirm share
    this.element.querySelector('#confirm-share')?.addEventListener('click', () => {
      this.shareMemory();
    });
  }

  private updatePreview(): void {
    const previewCaption = this.element?.querySelector('#preview-caption');
    if (previewCaption) {
      previewCaption.textContent = this.selectedCaption || 'Your caption will appear here...';
    }
  }

  private async shareMemory(): Promise<void> {
    if (!this.memory || !this.selectedCaption) {
      alert('Please add a caption before sharing!');
      return;
    }

    try {
      // Get NPCs from the memory
      const taggedNpcs = this.memory.taggedNPCs || this.memory.taggedNpcs || [];
      
      // Publish the memory
      const post = await this.blogPublisher.publishMemory(
        this.memory.id || this.memory.memoryId,
        this.selectedCaption,
        taggedNpcs
      );

      if (post) {
        // Mark memory as published
        this.memory.isPublished = true;
        this.memory.caption = this.selectedCaption;
        this.memory.publishedAt = Date.now();

        // Update game state
        const player = this.gameState.getPlayer();
        this.gameState.updatePlayer({
          memories: player.memories
        });

        // Award relationship points if NPC is featured
        const npcId = this.memory.taggedNPCs?.[0] || this.memory.taggedNpcs?.[0];
        if (npcId) {
          this.eventSystem.emit('npc:bond_increased', {
            npcId,
            amount: 20,
            source: 'memory_shared'
          });
        }

        // Emit success event
        this.eventSystem.emit('memory:shared', {
          memoryId: this.memory.id || this.memory.memoryId,
          postId: post.postId
        });

        // Show success message
        this.showSuccess();
      }
    } catch (error) {
      console.error('[QuickShareModal] Error sharing memory:', error);
      alert('Failed to share moment. Please try again.');
    }
  }

  private showSuccess(): void {
    if (!this.element) return;

    const modal = this.element.querySelector('.quick-share-modal');
    if (modal) {
      modal.innerHTML = `
        <div class="share-success">
          <span class="success-icon material-icons">check_circle</span>
          <h3>Moment Shared!</h3>
          <p>Your special moment has been shared with the community.</p>
          ${this.memory?.taggedNPCs?.[0] || this.memory?.taggedNpcs?.[0] ? 
            '<p class="bonus-message">+20 relationship points!</p>' : 
            ''
          }
          <button class="btn btn--primary" id="success-close">
            View in Cafe Moments
          </button>
        </div>
      `;

      this.element.querySelector('#success-close')?.addEventListener('click', () => {
        this.close();
        this.eventSystem.emit('ui:show_screen', { screenId: 'blog' });
      });
    }
  }

  private close(): void {
    if (this.element) {
      this.element.remove();
      this.element = null;
    }
    this.memory = null;
    this.selectedCaption = '';
    this.npcSuggestions = [];
  }
}
