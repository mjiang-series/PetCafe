import { UnifiedBaseScreen } from './UnifiedBaseScreen';
import { EventSystem } from '../systems/EventSystem';
import { GameStateManager } from '../systems/GameState';
import { BlogPublisher } from '../systems/BlogPublisher';
import { BlogPost } from '../models/Blog';
import { ScreenHeaderConfig } from './components/ScreenHeader';
import { getNPCById } from '../utils/npcData';
import { Memory } from '../models/Memory';
import { GachaSystem } from '../systems/GachaSystem';
import { getAssetPath } from '../utils/AssetPaths';

export class BlogScreen extends UnifiedBaseScreen {
  private blogPublisher: BlogPublisher;
  private gachaSystem: GachaSystem;

  constructor(
    id: string,
    eventSystem: EventSystem,
    gameState: GameStateManager,
    blogPublisher: BlogPublisher,
    gachaSystem: GachaSystem
  ) {
    super(id, eventSystem, gameState);
    this.blogPublisher = blogPublisher;
    this.gachaSystem = gachaSystem;
  }

  protected getScreenHeaderConfig(): ScreenHeaderConfig | null {
    return {
      title: 'Cafe Moments',
      showBackButton: true,
      backTarget: 'cafe-overview'
    };
  }

  protected showBottomNav(): boolean {
    return false; // Sub-screen, hide bottom nav like other cafe sections
  }

  protected createContent(): string {
    const player = this.gameState.getPlayer();
    const unpublishedMemories = this.getUnpublishedMemories();
    
    return `
      <div class="section-profile-container">
        <!-- Hero Section -->
        <div class="section-hero cafe-moments">
          <img class="section-hero-portrait" src="${getAssetPath('art/ui/blog_placeholder.png')}" alt="Cafe Moments" />
        </div>

        <!-- Header Section -->
        <div class="section-header">
          <h1 class="section-name">Cafe Moments</h1>
        </div>

        <!-- Stats Section -->
        <div class="section-content-block">
          <h2 class="section-title">
            <span class="material-icons">analytics</span>
            Your Impact
          </h2>
          <div class="blog-stats">
            <div class="stat-item">
              <span class="stat-value" id="total-posts">0</span>
              <span class="stat-label">Moments Shared</span>
            </div>
            <div class="stat-item">
              <span class="stat-value" id="total-likes">0</span>
              <span class="stat-label">Total Likes</span>
            </div>
            <div class="stat-item">
              <span class="stat-value" id="total-views">0</span>
              <span class="stat-label">Total Views</span>
            </div>
          </div>
          <div class="trending-mood" id="trending-mood">
            <span class="trending-label">Trending Mood:</span>
            <span class="mood-tag" id="trending-mood-tag">cozy</span>
          </div>
        </div>

        <!-- Ready to Share Section -->
        ${unpublishedMemories.length > 0 ? `
          <div class="section-content-block">
            <h2 class="section-title">
              <span class="material-icons">photo_library</span>
              Ready to Share
            </h2>
            <div class="memory-grid">
              ${unpublishedMemories.map(memory => this.createMemoryPreviewCard(memory)).join('')}
            </div>
          </div>
        ` : ''}

        <!-- Published Moments Section -->
        <div class="section-content-block">
          <h2 class="section-title">
            <span class="material-icons">public</span>
            Published Moments
          </h2>
          <div class="blog-feed" id="blog-feed">
            <!-- Blog posts will be rendered here -->
          </div>
          
          <div class="empty-blog" id="empty-blog" style="display: none;">
            <div class="empty-state">
              <span class="material-icons empty-icon">article</span>
              <h3>No moments shared yet!</h3>
              <p>You'll generate memories by completing shifts. Head back to the cafe and pick an area to start!</p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="section-actions">
          <button class="btn btn--secondary" data-action="view-journal">
            <span class="material-icons">menu_book</span>
            View Journal
          </button>
        </div>
      </div>
    `;
  }

  onShow(data?: any): void {
    this.updateStats();
    this.updateRelationshipBanner();
    this.updateFeed();
  }

  onHide(): void {
    // Nothing to clean up
  }

  protected override setupEventListeners(): void {
    super.setupEventListeners();

    this.addClickHandler('[data-action="new-post"]', () => {
      // Show memory selection for sharing
      this.eventSystem.emit('ui:show_screen', { 
        screenId: 'memory-selection'
      });
    });

    this.addClickHandler('[data-action="view-journal"]', () => {
      this.eventSystem.emit('ui:show_screen', { screenId: 'journal' });
    });

    // Memory card clicks
    this.addClickHandler('.memory-preview-card', (e) => {
      const card = (e.target as HTMLElement).closest('.memory-preview-card');
      const memoryId = card?.getAttribute('data-memory-id');
      if (memoryId) {
        this.shareMemory(memoryId);
      }
    });

    // Listen for new posts
    this.eventSystem.on('blog:post_published', () => {
      this.updateStats();
      this.updateFeed();
    });

    // Listen for reactions
    this.eventSystem.on('blog:npc_reaction', () => {
      this.updateFeed();
    });
  }

  private updateStats(): void {
    const state = this.gameState.getState();
    const feed = this.blogPublisher.getBlogFeed();
    
    // Update subscriber count
    const subCount = this.element.querySelector('#subscriber-count');
    if (subCount) {
      subCount.textContent = (state.player.subscribers || 0).toLocaleString();
    }
    
    // Calculate total stats
    let totalLikes = 0;
    let totalViews = 0;
    
    feed.forEach(post => {
      totalLikes += post.engagement.likes;
      totalViews += post.engagement.views;
    });
    
    // Update stat displays
    const totalPosts = this.element.querySelector('#total-posts');
    const totalLikesEl = this.element.querySelector('#total-likes');
    const totalViewsEl = this.element.querySelector('#total-views');
    
    if (totalPosts) totalPosts.textContent = feed.length.toString();
    if (totalLikesEl) totalLikesEl.textContent = totalLikes.toLocaleString();
    if (totalViewsEl) totalViewsEl.textContent = totalViews.toLocaleString();
    
    // Update trending mood
    this.updateTrendingMood();
  }

  private updateRelationshipBanner(): void {
    const container = this.element.querySelector('#blog-relationship');
    if (!container) return;

    const state = this.gameState.getState();
    const player = state.player;
    const bonds = player.npcBonds || [];

    const sorted = [...bonds].sort((a, b) => (b.bondPoints || 0) - (a.bondPoints || 0));
    const topThree = sorted.slice(0, 3);

    if (!topThree.length) {
      container.innerHTML = `
        <div class="relationship-banner">
          <p>Share memories to build closer bonds with your helpers.</p>
          <button class="btn btn--secondary" data-action="view-messages">Open Messages</button>
        </div>
      `;
    } else {
      container.innerHTML = `
        <div class="relationship-banner">
          <div class="banner-content">
            <h3>Helpers Loved These Moments</h3>
            <p>Publish memories to unlock new scenes and deepen your relationships.</p>
          </div>
          <div class="banner-helpers">
            ${topThree.map(entry => {
              const npc = this.gameState.getNpcConfig?.(entry.npcId);
              return `
                <button class="banner-helper" data-npc="${entry.npcId}">
                  <img src="${npc?.artRefs?.portrait ? (npc.artRefs.portrait.startsWith('/') ? npc.artRefs.portrait.substring(1) : npc.artRefs.portrait) : 'art/ui/placeholder_icon.svg'}" alt="${npc?.name || entry.npcId}" />
                  <span>${npc?.name || entry.npcId} · Lv ${entry.bondLevel}</span>
                </button>
              `;
            }).join('')}
          </div>
          <button class="btn btn--primary" data-action="view-messages">
            <span class="material-icons icon-sm">forum</span> Continue the Conversation
          </button>
        </div>
      `;
    }

    container.querySelectorAll('[data-action="view-messages"]').forEach(btn => {
      btn.addEventListener('click', () => {
        this.eventSystem.emit('ui:show_screen', { screenId: 'dm-list' });
      });
    });

    container.querySelectorAll('.banner-helper').forEach(btn => {
      btn.addEventListener('click', () => {
        const npcId = btn.getAttribute('data-npc');
        if (npcId) {
          this.eventSystem.emit('ui:show_screen', { screenId: `dm-${npcId}`, params: { npcId } });
        }
      });
    });
  }

  private updateTrendingMood(): void {
    const moods = ['cozy', 'chaotic', 'heartwarming', 'hilarious', 'adorable'];
    const dayOfWeek = new Date().getDay();
    const trendingMood = moods[dayOfWeek % moods.length];
    
    const trendingTag = this.element.querySelector('#trending-mood-tag');
    if (trendingTag) {
      trendingTag.textContent = trendingMood;
      trendingTag.className = `mood-tag mood--${trendingMood}`;
    }
  }

  private updateFeed(): void {
    const feedContainer = this.element.querySelector('#blog-feed');
    const emptyState = this.element.querySelector('#empty-blog') as HTMLElement;
    
    if (!feedContainer) return;
    
    const feed = this.blogPublisher.getBlogFeed();
    
    if (feed.length === 0) {
      feedContainer.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }
    
    if (emptyState) emptyState.style.display = 'none';
    
    feedContainer.innerHTML = feed.map(post => this.renderBlogPost(post)).join('');
    
    // Add like button handlers
    feedContainer.querySelectorAll('[data-action="like"]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const postId = btn.getAttribute('data-post-id');
        if (postId) this.likePost(postId);
      });
    });
  }

  private renderBlogPost(post: BlogPost): string {
    const state = this.gameState.getState();
    const memory = state.player.memories?.find(m => 
      m.id === post.memoryId || m.memoryId === post.memoryId
    );
    
    // Get memory image URL
    const imageUrl = memory?.imageUrl || post.content.imageUrl || 'art/memories_image_placeholder.png';
    
    // Get tagged NPCs and pets for auto-generated tags
    const taggedNpcs = post.taggedNpcs || [];
    const taggedPets = post.content.petIds || [];
    
    return `
      <article class="blog-post ${post.viral ? 'blog-post--viral' : ''}">
        ${post.viral ? '<div class="viral-badge">🔥 VIRAL!</div>' : ''}
        
        <div class="post-header">
          <div class="post-author">
            <span class="author-avatar">☕</span>
            <span class="author-name">Pet Café</span>
          </div>
          <span class="post-time">${this.getTimeAgo(post.publishedAt)}</span>
        </div>
        
        <div class="post-image">
          <img src="${getAssetPath(imageUrl)}" alt="Memory" />
          <div class="post-mood-badge mood--${post.content.mood}">${post.content.mood}</div>
        </div>
        
        <div class="post-actions">
          <button class="like-btn ${post.engagement.likes > 0 ? 'liked' : ''}" 
                  data-action="like" 
                  data-post-id="${post.postId}">
            <span class="material-icons icon-sm icon-love">favorite</span>
            <span class="like-count">${post.engagement.likes}</span>
          </button>
          <div class="view-count">
            <span class="material-icons icon-sm">visibility</span>
            <span>${post.engagement.views}</span>
          </div>
        </div>
        
        <div class="post-content">
          <p class="post-caption">${post.content.caption}</p>
          
          <!-- Auto-generated tags -->
          <div class="post-tags">
            ${taggedNpcs.map(npcId => {
              const npc = getNPCById(npcId);
              return `<span class="post-tag npc-tag">#${npc?.name || npcId}</span>`;
            }).join('')}
            ${taggedPets.map(petId => {
              const pet = this.getPetData(petId);
              return `<span class="post-tag pet-tag">#${pet?.name || petId}</span>`;
            }).join('')}
            <span class="post-tag location-tag">#${post.content.location}</span>
          </div>
          
          <!-- NPC Comments -->
          ${this.renderNPCComments(post)}
        </div>
      </article>
    `;
  }

  private renderBondGain(post: Memory): string {
    if (!post.taggedNpcs || post.taggedNpcs.length === 0) {
      return '';
    }

    return post.taggedNpcs.map(npcId => {
      const npc = getNPCById(npcId);
      return `
        <span class="meta-item bond-gain">
          <span class="material-icons icon-sm">favorite_border</span>
          ${npc?.name || npcId} feels closer
        </span>
      `;
    }).join('');
  }

  private getPetName(petId: string): string {
    const pet = this.gachaSystem.getPetData?.()?.getPetById?.(petId);
    return pet?.name || petId;
  }

  private likePost(postId: string): void {
    const feed = this.blogPublisher.getBlogFeed();
    const post = feed.find(p => p.postId === postId);
    
    if (post) {
      post.engagement.likes++;
      this.updateFeed();
      
      // Animate the like
      const likeBtn = this.element.querySelector(`[data-post-id="${postId}"]`);
      if (likeBtn) {
        likeBtn.classList.add('liked', 'like-animation');
        setTimeout(() => likeBtn.classList.remove('like-animation'), 300);
      }
    }
  }

  private getNPCName(npcId: string): string {
    const names: Record<string, string> = {
      'aria': 'Aria',
      'kai': 'Kai',
      'elias': 'Elias'
    };
    return names[npcId] || npcId;
  }

  private getReactionEmoji(reactionType: string): string {
    const emojis: Record<string, string> = {
      'like': '👍',
      'love': '❤️',
      'laugh': '😂',
      'surprised': '😮'
    };
    return emojis[reactionType] || '👍';
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

  private getUnpublishedMemories(): Memory[] {
    const player = this.gameState.getPlayer();
    const memories = player.memories || [];
    return memories.filter(m => !m.isPublished);
  }

  private createMemoryPreviewCard(memory: Memory): string {
    const date = new Date(memory.timestamp);
    const timeStr = date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit' 
    });
    
    // Get NPC info
    const npcs = memory.taggedNPCs || memory.taggedNpcs || [];
    const npcName = npcs.length > 0 ? getNPCById(npcs[0])?.name || '' : '';
    
    return `
      <div class="memory-preview-card" data-memory-id="${memory.id || memory.memoryId}">
        <div class="memory-preview-image">
          <img src="${getAssetPath(memory.imageUrl || 'art/memories_image_placeholder.png')}" alt="Memory" />
          <span class="memory-mood-badge mood--${memory.mood}">${memory.mood}</span>
        </div>
        <div class="memory-preview-content">
          <div class="memory-meta">
            ${npcName ? `<span class="memory-npc">${npcName}</span>` : ''}
            <span class="memory-timestamp">${timeStr}</span>
          </div>
          <p class="memory-snippet">${memory.content.substring(0, 60)}...</p>
          <button class="btn btn--primary btn--small">
            <span class="material-icons">share</span>
            Share
          </button>
        </div>
      </div>
    `;
  }

  private shareMemory(memoryId: string): void {
    // Show quick share modal
    this.eventSystem.emit('ui:show_screen', {
      screenId: 'quick-share',
      data: { memoryId }
    });
  }

  private getPetData(petId: string): any {
    // Try to get pet data from gacha system
    const petData = this.gachaSystem.getPetData?.()?.getPetById?.(petId);
    if (petData) return petData;
    
    // Fallback to basic data
    return { name: petId };
  }

  private renderNPCComments(post: BlogPost): string {
    const reactions = post.reactions || [];
    if (reactions.length === 0) return '';
    
    return `
      <div class="post-comments">
        ${reactions.map(reaction => {
          const npc = getNPCById(reaction.npcId);
          const npcName = npc?.name || reaction.npcId;
          const portrait = npc?.artRefs?.portrait || 'art/ui/placeholder_icon.svg';
          
          return `
            <div class="npc-comment">
              <img src="${getAssetPath(portrait)}" alt="${npcName}" class="comment-avatar" />
              <div class="comment-content">
                <span class="comment-author">${npcName}</span>
                <span class="comment-text">${this.getReactionText(reaction)}</span>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  private getReactionText(reaction: any): string {
    // Generate contextual comment based on reaction type
    const templates = {
      love: ['❤️ Love this!', '😍 So adorable!', '💕 My heart!'],
      laugh: ['😂 This made my day!', '🤣 Too funny!', '😄 Can\'t stop laughing!'],
      surprised: ['😮 Wow!', '😲 Didn\'t expect that!', '🤯 Amazing!'],
      like: ['👍 Nice!', '✨ Great moment!', '🌟 Love it!']
    };
    
    const options = templates[reaction.reactionType] || templates.like;
    return options[Math.floor(Math.random() * options.length)];
  }
}
