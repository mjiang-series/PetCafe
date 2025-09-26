// DM List Screen - Shows all NPC conversations
import { UnifiedBaseScreen } from './UnifiedBaseScreen';
import { EventSystem } from '../systems/EventSystem';
import { GameStateManager } from '../systems/GameState';
import { ScreenHeaderConfig } from './components/ScreenHeader';
import { getNPCById } from '../utils/npcData';

interface ConversationPreview {
  npcId: string;
  lastMessage: string;
  timestamp: number;
  unreadCount: number;
  locked: boolean;
}

export class DMListScreen extends UnifiedBaseScreen {
  private conversations: ConversationPreview[] = [];

  protected getScreenHeaderConfig(): ScreenHeaderConfig | null {
    // Main navigation screen - no header needed
    return null;
  }

  protected createContent(): string {
    return `
      <div class="dm-list-container">
        <div class="dm-list-header">
          <h2>Messages</h2>
          <p class="subtitle">Chat with your café friends</p>
        </div>
        
        <div class="conversations-list" id="conversations-list">
          <!-- Conversations will be rendered here -->
        </div>
      </div>
    `;
  }

  onShow(): void {
    this.loadConversations();
    this.updateDisplay();
  }

  onHide(): void {
    // Cleanup if needed
  }

  protected override setupEventListeners(): void {
    super.setupEventListeners();

    // Listen for conversation updates from GameState
    this.eventSystem.on('conversation:message_added', () => {
      this.loadConversations();
      this.updateDisplay();
    });

    this.eventSystem.on('conversation:marked_read', () => {
      this.loadConversations();
      this.updateDisplay();
    });

  }

  private loadConversations(): void {
    const npcs = ['aria', 'kai', 'elias'];
    
    this.conversations = npcs.map(npcId => {
      const conversation = this.gameState.getConversation(npcId);
      
      if (conversation && conversation.messages.length > 0) {
        const lastMessage = conversation.messages[conversation.messages.length - 1];
        return {
          npcId,
          lastMessage: lastMessage.sender === 'player' 
            ? `You: ${lastMessage.content}`
            : lastMessage.content,
          timestamp: conversation.lastMessageTime,
          unreadCount: conversation.unreadCount,
          locked: false
        };
      } else {
        return {
          npcId,
          lastMessage: this.getDefaultMessage(npcId),
          timestamp: Date.now() - Math.random() * 86400000,
          unreadCount: 0,
          locked: false
        };
      }
    });

    // Sort by most recent
    this.conversations.sort((a, b) => b.timestamp - a.timestamp);
  }

  private getDefaultMessage(npcId: string): string {
    // Placeholder messages for each NPC
    const messages: Record<string, string[]> = {
      aria: [
        "The bakery smells amazing today! 🥐",
        "Your pets did such a great job!",
        "Can't wait to see you again ☺️"
      ],
      kai: [
        "That was so much fun! 🎾",
        "The puppies are all tuckered out 😴",
        "Ready for another adventure?"
      ],
      elias: [
        "Today's styling session was perfect ✨",
        "Your pets have such beautiful fur!",
        "I have some new ideas to try..."
      ]
    };

    const npcMessages = messages[npcId] || ["..."];
    return npcMessages[Math.floor(Math.random() * npcMessages.length)];
  }

  private updateDisplay(): void {
    const listContainer = this.element.querySelector('#conversations-list');
    if (!listContainer) return;

    if (this.conversations.length === 0) {
      listContainer.innerHTML = `
        <div class="empty-state">
          <span class="empty-icon">💬</span>
          <p>No conversations yet</p>
          <p class="hint">Complete shifts to unlock messages!</p>
        </div>
      `;
      return;
    }

    listContainer.innerHTML = this.conversations.map(conv => {
      const npc = getNPCById(conv.npcId);
      if (!npc) return '';

      return `
        <div class="conversation-item ${conv.locked ? 'locked' : ''}" data-npc="${conv.npcId}">
          <div class="avatar">
            <img src="${this.getNPCPortraitPath(npc)}" alt="${npc.name}" class="avatar-portrait" />
          </div>
          
          <div class="conversation-content">
            <div class="conversation-header">
              <h3 class="npc-name">${npc.name}</h3>
              <span class="timestamp">${this.formatTimestamp(conv.timestamp)}</span>
            </div>
            <p class="last-message">${conv.locked ? 'Unlock new topics by collecting pets and growing your café!' : conv.lastMessage}</p>
          </div>
          
          ${conv.unreadCount > 0 ? `
            <div class="unread-badge">${conv.unreadCount}</div>
          ` : ''}
        </div>
      `;
    }).join('');

    // Add click handlers
    listContainer.querySelectorAll('.conversation-item').forEach(item => {
      item.addEventListener('click', () => {
        const npcId = item.getAttribute('data-npc');
        const locked = item.classList.contains('locked');
        if (npcId && !locked) {
          this.openConversation(npcId);
        }
      });
    });
  }


  private formatTimestamp(timestamp: number): string {
    const now = Date.now();
    const diff = now - timestamp;
    
    if (diff < 3600000) { // Less than 1 hour
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m`;
    } else if (diff < 86400000) { // Less than 24 hours
      const hours = Math.floor(diff / 3600000);
      return `${hours}h`;
    } else {
      const days = Math.floor(diff / 86400000);
      return `${days}d`;
    }
  }

  private openConversation(npcId: string): void {
    this.eventSystem.emit('ui:show_screen', { 
      screenId: 'dm', 
      params: { npcId } 
    });
  }

  private getNPCPortraitPath(npc: any): string {
    if (!npc) return 'art/ui/placeholder_icon.svg';
    
    const portrait = npc.artRefs?.portrait;
    if (portrait) {
      // Remove any leading slashes for relative paths
      return portrait.startsWith('/') ? portrait.substring(1) : portrait;
    }
    
    // Fallback to placeholder
    const npcId = npc.npcId || 'aria';
    return `art/npc/${npcId}/placeholder_portrait.svg`;
  }
}
