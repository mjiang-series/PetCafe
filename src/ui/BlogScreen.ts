import { UnifiedBaseScreen } from './UnifiedBaseScreen';
import { EventSystem } from '../systems/EventSystem';
import { GameStateManager } from '../systems/GameState';
import { BlogPublisher } from '../systems/BlogPublisher';
import { BlogPost } from '../models/Blog';
import { ScreenHeaderConfig } from './components/ScreenHeader';
import { getNPCById } from '../utils/npcData';
import { Memory } from '../models/Memory';
import { GachaSystem } from '../systems/GachaSystem';

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
      showBack: true,
      parentScreen: 'cafe-overview'
    };
  }

  protected createContent(): string {
    return `
      <div class="blog-container">
        <div class="blog-header-section">
          <h2 class="blog-title">Cafe Moments</h2>
          <button class="btn btn--primary" data-action="new-post">
            <span class="icon-emoji">➕</span> Share a Moment
          </button>
        </div>
 
        <section class="blog-relationship" id="blog-relationship">
          <!-- Relationship banner renders here -->
        </section>

        <div class="blog-stats">
        <div class="stat-item">
          <span class="stat-value" id="total-posts">0</span>
          <span class="stat-label">Moments</span>
        </div>
        <div class="stat-item">
          <span class="stat-value" id="total-likes">0</span>
          <span class="stat-label">Likes</span>
        </div>
        <div class="stat-item">
          <span class="stat-value" id="total-views">0</span>
          <span class="stat-label">Views</span>
        </div>
      </div>

      <div class="trending-mood" id="trending-mood">
        <span class="trending-label">Trending:</span>
        <span class="mood-tag" id="trending-mood-tag">cozy</span>
      </div>

      <div class="blog-feed" id="blog-feed">
        <!-- Blog posts will be rendered here -->
      </div>

      <div class="empty-blog" id="empty-blog" style="display: none;">
        <span class="empty-icon">📝</span>
        <h3>No posts yet!</h3>
        <p>Share your café memories with the world</p>
        <button class="btn btn--primary" data-action="new-post">
          Create Your First Post
        </button>
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
    const memory = state.player.memories?.find(m => m.memoryId === post.memoryId);
    
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
          <div class="post-image-placeholder">
            <span class="image-icon">📸</span>
            <div class="image-location">${post.content.location}</div>
          </div>
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
          <p class="post-caption">${post.caption || post.content}</p>
          ${post.petIds && post.petIds.length ? `<div class="post-pets">Featuring: ${post.petIds.map(id => `<span class="post-pet">${this.getPetName(id)}</span>`).join(', ')}</div>` : ''}
          <div class="post-meta">
            <span class="meta-item">
              <span class="material-icons icon-sm">favorite</span> ${post.likes}
            </span>
            <span class="meta-item">
              <span class="material-icons icon-sm">visibility</span> ${post.views}
            </span>
            ${this.renderBondGain(post)}
          </div>
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
}
