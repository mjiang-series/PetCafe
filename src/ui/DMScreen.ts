// DM Screen - Individual conversation with an NPC
import { UnifiedBaseScreen } from './UnifiedBaseScreen';
import { EventSystem } from '../systems/EventSystem';
import { GameStateManager } from '../systems/GameState';
import { ScreenHeaderConfig } from './components/ScreenHeader';
import { BondProgressBar } from './components/BondProgressBar';
import { getNPCById } from '../utils/npcData';
import { getNPCPortraitPath } from '../utils/npcData';
import { NPCResponseService, ResponseContext } from '../services/NPCResponseService';
import scenesData from '../data/scenes.json';
import { formatUnlockTooltip } from '../utils/uiHelpers';

interface Message {
  id: string;
  sender: 'player' | 'npc';
  content: string;
  timestamp: number;
}

export class DMScreen extends UnifiedBaseScreen {
  private npcId: string = '';
  private messages: Message[] = [];
  private responseService: NPCResponseService;
  private bondProgressBar: BondProgressBar | null = null;
  private isTyping: boolean = false;
  private sceneResultContainer: HTMLElement | null = null;
  private sceneData = scenesData;

  constructor(id: string, eventSystem: EventSystem, gameState: GameStateManager) {
    super(id, eventSystem, gameState);
    this.responseService = new NPCResponseService(eventSystem, gameState);
    
    // Extract npcId from screen ID (format: dm-{npcId})
    if (id.startsWith('dm-')) {
      this.npcId = id.substring(3);
    }
  }

  protected getScreenHeaderConfig(): ScreenHeaderConfig {
    return {
      title: this.getNPCName(),
      showBackButton: true,
      backTarget: 'dm-list',
      actions: [
        {
          id: 'call',
          icon: 'call',
          label: 'Call'
        },
        {
          id: 'options',
          icon: 'more_vert',
          label: 'Options'
        }
      ]
    };
  }

  protected override showBottomNav(): boolean {
    // Hide bottom nav on conversation screen
    return false;
  }

  protected createContent(): string {
    return `
      <div class="dm-conversation">
        <div class="bond-progress-wrapper" id="bond-progress-wrapper">
          <!-- Bond progress bar will be inserted here -->
        </div>
        <div class="scene-result" id="scene-result" style="display: none;"></div>
        
        <div class="messages-container" id="messages-container">
          <!-- Messages will be rendered here -->
        </div>
        
        <div class="message-input-container">
          <div class="typing-indicator" id="typing-indicator" style="display: none;">
            <span class="typing-dots">
              <span></span><span></span><span></span>
            </span>
            <span class="typing-text">${this.getNPCName()} is typing...</span>
          </div>
          
          <div class="message-input">
            <input type="text" 
                   id="message-input" 
                   placeholder="Type a message..." 
                   autocomplete="off" />
            <button class="send-button" id="send-button">
              <span class="material-icons">send</span>
            </button>
          </div>
          
          <div class="quick-replies" id="quick-replies">
            <!-- Quick reply options will appear here -->
          </div>
        </div>
      </div>
    `;
  }

  onShow(params?: { npcId: string }): void {
    // npcId is already set from the screen ID in constructor
    // params can be used for additional data if needed
    
    // Initialize bond progress bar (always create fresh to ensure proper event binding)
    const wrapper = document.getElementById('bond-progress-wrapper');
    if (wrapper && this.npcId) {
      // Clear any existing content
      wrapper.innerHTML = '';
      
      // Create new bond progress bar
      this.bondProgressBar = new BondProgressBar(this.eventSystem, this.gameState, this.npcId);
      wrapper.appendChild(this.bondProgressBar.createElement());
    }
    
    this.loadMessages();
    this.updateDisplay();
    
    // Mark messages as read when viewing
    if (this.messages.length > 0) {
      this.gameState.markConversationAsRead(this.npcId);
      this.scrollToBottom();
    }

    this.sceneResultContainer = this.element.querySelector('#scene-result');
    this.eventSystem.on('scene:completed', this.handleSceneCompleted);
  }

  protected override onHide(): void {
    // Mark messages as read in GameState
    this.gameState.markConversationAsRead(this.npcId);
    
    // Clean up bond progress bar
    if (this.bondProgressBar) {
      this.bondProgressBar.destroy();
      this.bondProgressBar = null;
    }

    this.sceneResultContainer = null;
    this.eventSystem.off('scene:completed', this.handleSceneCompleted);
  }

  private handleSceneCompleted = (data: { sceneId: string }) => {
    if (!this.sceneResultContainer) return;
    const scene = this.sceneData?.scenes?.find((scene: any) => scene.sceneId === data.sceneId);
    if (!scene) return;

    this.sceneResultContainer.innerHTML = `
      <div class="scene-result-card">
        <h4>${scene.title}</h4>
        <p>${this.getSceneResultText(scene)}</p>
      </div>
    `;
    this.sceneResultContainer.style.display = 'block';
    this.sceneResultContainer.classList.add('visible');
  };

  private getSceneResultText(scene: any): string {
    const npc = getNPCById(scene.npcId || this.npcId);
    return `${npc?.name || 'They'} feel closer after sharing this moment. Bond +${scene.rewards?.bond?.points || 0}`;
  }

  protected override setupEventListeners(): void {
    super.setupEventListeners();

    // Header actions
    this.eventSystem.on('ui:header_action', (data: { actionId: string }) => {
      if (data.actionId === 'call') {
        this.startVoiceCall();
      } else if (data.actionId === 'options') {
        this.showOptions();
      }
    });

    // Quick replies
    this.element.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      if (target.classList.contains('quick-reply-btn')) {
        const reply = target.getAttribute('data-reply');
        if (reply) {
          this.sendQuickReply(reply);
        }
      }
    });

    // Message input
    const input = this.element.querySelector('#message-input') as HTMLInputElement;
    const sendBtn = this.element.querySelector('#send-button') as HTMLButtonElement;

    if (input && sendBtn) {
      // Send on Enter
      input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && input.value.trim()) {
          this.sendMessage(input.value.trim());
          input.value = '';
        }
      });

      // Send on button click
      sendBtn.addEventListener('click', () => {
        if (input.value.trim()) {
          this.sendMessage(input.value.trim());
          input.value = '';
        }
      });

      // Update button state based on input
      input.addEventListener('input', () => {
        sendBtn.disabled = !input.value.trim();
      });
    }
  }

  private getNPCName(): string {
    const npc = getNPCById(this.npcId);
    if (!npc) {
      console.warn('[DMScreen] NPC not found for ID:', this.npcId);
    }
    return npc?.name || 'Unknown';
  }

  private loadMessages(): void {
    // Load messages from GameState
    const conversation = this.gameState.getConversation(this.npcId);
    
    if (conversation && conversation.messages.length > 0) {
      // Map conversation messages to local format
      this.messages = conversation.messages.map(msg => ({
        id: msg.id,
        sender: msg.sender,
        content: msg.content,
        timestamp: msg.timestamp
      }));
    } else {
      // First time conversation - show greeting
      this.messages = [];
      this.showWelcomeMessage();
    }
  }

  private getGreeting(): string {
    const context: ResponseContext = {
      messageType: 'greeting',
      timeOfDay: this.responseService.getTimeOfDay()
    };
    
    return this.responseService.generateResponse(this.npcId, context) || "I'm not sure what to say...";
  }

  private showWelcomeMessage(): void {
    setTimeout(() => {
      this.addNPCMessage(this.getGreeting());
      this.showQuickReplies();
    }, 500);
  }

  private updateDisplay(): void {
    const container = this.element.querySelector('#messages-container');
    if (!container) return;

    container.innerHTML = this.messages.map(msg => `
      <div class="message ${msg.sender === 'player' ? 'message--player' : 'message--npc'}">
        ${msg.sender === 'npc' ? `
          <div class="message-avatar">
            <img src="${this.getNPCPortraitPath()}" alt="${this.getNPCName()}" class="avatar-portrait" />
          </div>
        ` : ''}
        <div class="message-content">
          <div class="message-bubble">
            <p>${msg.content}</p>
          </div>
          <span class="message-time">${this.formatMessageTime(msg.timestamp)}</span>
        </div>
      </div>
    `).join('');
  }


  private formatMessageTime(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  private showQuickReplies(): void {
    const quickRepliesContainer = this.element.querySelector('#quick-replies');
    if (!quickRepliesContainer) return;

    const unlockedTopics = this.gameState.getAvailableConversationTopics(this.npcId);
    const hasUnlockedTopics = unlockedTopics && unlockedTopics.length > 0;
    const gatingInfo = hasUnlockedTopics ? [] : this.gameState.getUnlockCheckResult(this.npcId, `${this.npcId}_topic_01`).missing;

    const replies = hasUnlockedTopics ? unlockedTopics : this.getQuickReplies();
    quickRepliesContainer.innerHTML = replies.map(reply => `
      <button class="quick-reply-btn" data-reply="${reply}">
        ${reply}
      </button>
    `).join('');

    if (!hasUnlockedTopics) {
      quickRepliesContainer.classList.add('locked');
      quickRepliesContainer.setAttribute('data-tooltip', formatUnlockTooltip(gatingInfo));
    } else {
      quickRepliesContainer.classList.remove('locked');
      quickRepliesContainer.removeAttribute('data-tooltip');
    }
  }

  private getQuickReplies(): string[] {
    const timeOfDay = this.responseService.getTimeOfDay();
    // Spunky, headstrong, friendly and warm personality
    const baseReplies: Record<string, string[]> = {
      aria: [
        "Pets are crushing it today! 💪",
        "Just wrapped up - we killed it!",
        "Ooh, teach me your secrets!",
        "Hit me with the deets! What's cookin'?"
      ],
      kai: [
        "Let's DO this! Race you! 🎾",
        "They're pumped and ready to go!",
        "Bring on the fun - what's the plan?",
        "Time to shake things up!"
      ],
      elias: [
        "They're gonna LOVE that! 💕",
        "Perfect! Let's make it happen",
        "Show me what you got!",
        "Your creativity is awesome!"
      ]
    };

    // Add time-based quick replies with personality
    const timeReplies: Record<string, string> = {
      morning: "Morning! Let's make today epic! ☀️",
      afternoon: "Hey! How's it going?",
      evening: "Evening! What a day, huh? 🌙",
      night: "You're up late! Me too 🌟"
    };

    const npcReplies = baseReplies[this.npcId] || ["Hello!", "How are you?", "👋"];
    
    // Mix in time-based reply sometimes
    if (Math.random() > 0.5) {
      npcReplies[0] = timeReplies[timeOfDay];
    }

    // Return 3 random replies
    return npcReplies.sort(() => Math.random() - 0.5).slice(0, 3);
  }

  private sendQuickReply(reply: string): void {
    // Add player message
    this.addPlayerMessage(reply);
    
    // Hide quick replies
    const container = this.element.querySelector('#quick-replies');
    if (container) {
      container.innerHTML = '';
    }

    // Simulate NPC typing and response
    this.showTypingIndicator();
    setTimeout(() => {
      this.hideTypingIndicator();
      this.addNPCMessage(this.generateResponse(reply));
      
      // Sometimes show more quick replies
      if (Math.random() > 0.5) {
        this.showQuickReplies();
      }
    }, 1500 + Math.random() * 1000);
  }

  private generateResponse(playerMessage: string): string {
    // Get recent message history for context
    const recentMessages = this.messages.slice(-5); // Last 5 messages
    const previousPlayerMessage = recentMessages
      .filter(m => m.sender === 'player')
      .slice(-2, -1)[0]; // Second to last player message
    
    const context: ResponseContext = {
      messageType: 'general',
      playerMessage: playerMessage,
      previousMessage: previousPlayerMessage?.content,
      conversationHistory: recentMessages.map(m => ({
        sender: m.sender,
        content: m.content
      })),
      timeOfDay: this.responseService.getTimeOfDay(),
      recentActivity: {
        newPets: this.gameState.getState().player.recentPetAcquisitions
          ?.filter(record => record.npcId === this.npcId)
          ?.map(record => record.petId) || []
      }
    };

    // Determine context for response
    const msgLower = playerMessage.toLowerCase();
    const greetingKeywords = ['hi', 'hello', 'hey', 'morning', 'evening', 'good', 'sup'];
    
    if (greetingKeywords.some(word => msgLower.includes(word)) && 
        playerMessage.length < 30) {
      context.messageType = 'greeting';
    } else if (msgLower.includes('memory') || msgLower.includes('remember') || msgLower.includes('moment')) {
      context.messageType = 'memory';
      const recentMemories = this.gameState.getState().player.memories || [];
      if (recentMemories.length > 0) {
        const lastMemory = recentMemories[0];
        context.recentActivity = {
          lastMemory: lastMemory.snippet || lastMemory.title
        };
      }
    } else if (msgLower.includes('friend') || msgLower.includes('bond') || msgLower.includes('close') || msgLower.includes('love')) {
      context.messageType = 'bond';
      const bond = this.gameState.getState().player.npcBonds.find(b => b.npcId === this.npcId);
      context.bondLevel = bond?.bondLevel || 1;
    } else if (msgLower.includes('pet') || msgLower.includes('animal') || msgLower.includes('cute')) {
      context.messageType = 'pets';
    } else if (msgLower.includes('quest') || msgLower.includes('task') || msgLower.includes('help')) {
      context.messageType = 'quest';
    }

    return this.responseService.generateResponse(this.npcId, context) || "I appreciate you reaching out! Let's chat more soon.";
  }

  private sendMessage(content: string): void {
    this.addPlayerMessage(content);
    
    // Hide quick replies when sending a message
    const quickRepliesContainer = this.element.querySelector('#quick-replies');
    if (quickRepliesContainer) {
      const availableTopics = this.gameState.getAvailableConversationTopics(this.npcId);
      const replies = availableTopics.length > 0 ? availableTopics : this.getQuickReplies();

      quickRepliesContainer.innerHTML = replies.map(reply => `
        <button class="quick-reply-btn" data-reply="${reply}">
          ${reply}
        </button>
      `).join('');
    }

    // Simulate NPC response after a delay
    this.showTypingIndicator();
    const delay = 1000 + Math.random() * 2000; // 1-3 seconds
    
    setTimeout(() => {
      this.hideTypingIndicator();
      const response = this.generateResponse(content);
      this.addNPCMessage(response);
      
      // Sometimes show quick replies after NPC response
      if (Math.random() > 0.3) {
        setTimeout(() => this.showQuickReplies(), 500);
      }
    }, delay);
  }

  private addPlayerMessage(content: string): void {
    const message = {
      id: Date.now().toString(),
      sender: 'player' as const,
      content,
      timestamp: Date.now(),
      isRead: true
    };

    // Add to local messages
    this.messages.push({
      id: message.id,
      sender: message.sender,
      content: message.content,
      timestamp: message.timestamp
    });

    // Persist to GameState
    this.gameState.addMessage(this.npcId, message);

    this.updateDisplay();
    this.scrollToBottom();
  }

  private addNPCMessage(content: string): void {
    const message = {
      id: Date.now().toString(),
      sender: 'npc' as const,
      content,
      timestamp: Date.now(),
      isRead: false
    };

    // Add to local messages
    this.messages.push({
      id: message.id,
      sender: message.sender,
      content: message.content,
      timestamp: message.timestamp
    });

    // Persist to GameState
    this.gameState.addMessage(this.npcId, message);

    this.updateDisplay();
    this.scrollToBottom();
  }

  private showTypingIndicator(): void {
    const indicator = this.element.querySelector('#typing-indicator') as HTMLElement;
    if (indicator) {
      indicator.style.display = 'flex';
      this.isTyping = true;
    }
  }

  private hideTypingIndicator(): void {
    const indicator = this.element.querySelector('#typing-indicator') as HTMLElement;
    if (indicator) {
      indicator.style.display = 'none';
      this.isTyping = false;
    }
  }

  private scrollToBottom(): void {
    const container = this.element.querySelector('#messages-container') as HTMLElement;
    if (container) {
      // Use requestAnimationFrame for smooth scrolling after DOM updates
      requestAnimationFrame(() => {
        container.scrollTo({
          top: container.scrollHeight,
          behavior: 'smooth'
        });
      });
    }
  }

  private startVoiceCall(): void {
    // TODO: Implement voice call UI
    this.eventSystem.emit('ui:show_overlay', {
      overlayId: 'voice-call',
      params: { npcId: this.npcId }
    });
  }

  private showOptions(): void {
    // TODO: Implement options menu
    console.log('Options for', this.npcId);
  }

  private getNPCPortraitPath(): string {
    const npc = getNPCById(this.npcId);
    if (!npc) return 'art/ui/placeholder_icon.svg';
    
    const portrait = npc.artRefs?.portrait;
    if (portrait) {
      // Remove any leading slashes for relative paths
      return portrait.startsWith('/') ? portrait.substring(1) : portrait;
    }
    
    // Fallback to placeholder
    return `art/npc/${this.npcId}/placeholder_portrait.svg`;
  }
}
