import { EventSystem } from './EventSystem';
import { GameStateManager } from './GameState';
import { Memory } from '../models/Memory';
import { BlogPost, BlogPostContent, BlogEngagement, NPCReaction } from '../models/Blog';

export class BlogPublisher {
  private eventSystem: EventSystem;
  private gameState: GameStateManager;

  constructor(eventSystem: EventSystem, gameState: GameStateManager) {
    this.eventSystem = eventSystem;
    this.gameState = gameState;
  }

  publishMemory(memoryId: string, caption: string, taggedNpcIds: string[]): BlogPost | null {
    const state = this.gameState.getState();
    const memory = state.player.memories?.find(m => m.memoryId === memoryId);
    
    if (!memory || memory.isPublished) {
      console.error('[BlogPublisher] Memory not found or already published:', memoryId);
      return null;
    }

    // Create blog post
    const blogPost: BlogPost = {
      postId: `post_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      memoryId: memory.memoryId,
      authorId: state.player.playerId,
      content: {
        imageUrl: memory.imageUrl || '/assets/memories/default.jpg',
        caption: caption || memory.content,
        location: memory.location,
        mood: memory.mood,
        petIds: memory.petIds
      },
      engagement: {
        likes: 0,
        views: 0,
        subscribersGained: 0,
        bondPointsEarned: {}
      },
      publishedAt: Date.now(),
      taggedNpcs: taggedNpcIds,
      reactions: [],
      viral: false
    };

    // Mark memory as published
    memory.isPublished = true;
    memory.publishedAt = blogPost.publishedAt;
    memory.caption = caption;

    // Add to player's blog posts
    if (!state.player.blogPosts) {
      state.player.blogPosts = [];
    }
    state.player.blogPosts.push(blogPost.postId);

    // Store the blog post (in a real app, this would go to a database)
    this.storeBlogPost(blogPost);

    // Calculate initial engagement
    this.calculateInitialEngagement(blogPost);

    // Generate NPC reactions
    this.generateNPCReactions(blogPost);

    // Update statistics
    state.player.statistics.totalBlogPosts++;

    // Emit event
    this.eventSystem.emit('blog:post_published', { blogPost });

    return blogPost;
  }

  private calculateInitialEngagement(post: BlogPost): void {
    const state = this.gameState.getState();
    
    // Base subscribers gained
    let subscribersGained = Math.floor(5 + Math.random() * 10); // 5-15 base
    
    // Mood bonus (if trending)
    const trendingMood = this.getTrendingMood();
    if (post.content.mood === trendingMood) {
      subscribersGained = Math.floor(subscribersGained * 1.1); // +10%
    }
    
    // NPC bonus
    const taggedNpcs = post.taggedNpcs || [];
    subscribersGained += taggedNpcs.length * 3; // +3 per tagged NPC
    
    // Pet rarity bonus
    const petIds = post.content.petIds || [];
    const pets = state.player.pets.filter(p => petIds.includes(p.petId));
    const hasRare = pets.some(p => p.rarity === 'Rare');
    const hasUltraRare = pets.some(p => p.rarity === 'UltraRare');
    
    if (hasUltraRare) {
      subscribersGained = Math.floor(subscribersGained * 1.1); // +10%
    } else if (hasRare) {
      subscribersGained = Math.floor(subscribersGained * 1.05); // +5%
    }
    
    // Viral chance
    if (Math.random() < 0.05) { // 5% chance
      post.viral = true;
      subscribersGained *= 10;
      this.eventSystem.emit('blog:post_viral', { post });
    }
    
    // Initial likes and views
    const initialLikes = Math.floor(subscribersGained * (0.3 + Math.random() * 0.4)); // 30-70% like rate
    const initialViews = subscribersGained * 3; // 3x views to subscribers
    
    // Update post engagement
    post.engagement.likes = initialLikes;
    post.engagement.views = initialViews;
    post.engagement.subscribersGained = subscribersGained;
    
    // Update player subscribers
    state.player.subscribers += subscribersGained;
    
    // Check milestones
    this.checkSubscriberMilestones();
  }

  private generateNPCReactions(post: BlogPost): void {
    const state = this.gameState.getState();
    
    const taggedNpcs = post.taggedNpcs || [];
    taggedNpcs.forEach(npcId => {
      const npcBond = state.player.npcBonds.find(b => b.npcId === npcId);
      if (!npcBond) return;
      
      // Determine reaction type based on mood and bond level
      const reactionType = this.determineNPCReaction(npcId, post.content.mood, npcBond.bondLevel);
      
      // Generate comment based on NPC personality
      const comment = this.generateNPCComment(npcId, post.content.mood, reactionType);
      
      const reaction: NPCReaction = {
        npcId,
        reactionType,
        comment,
        timestamp: Date.now() + Math.random() * 60000 // React within 1 minute
      };
      
      post.reactions.push(reaction);
      
      // Award bond points
      const bondPoints = this.calculateBondPoints(post, npcBond);
      npcBond.bondPoints += bondPoints;
      npcBond.bondLevel = Math.floor(npcBond.bondPoints / 100);
      post.engagement.bondPointsEarned[npcId] = bondPoints;
      
      // Emit reaction event
      this.eventSystem.emit('blog:npc_reaction', { post, reaction, bondPoints });
    });
  }

  private determineNPCReaction(npcId: string, mood: string, bondLevel: number): 'like' | 'love' | 'laugh' | 'surprised' {
    // Simple personality-based reactions
    const npcMoodPreferences: Record<string, Record<string, number>> = {
      'aria': { 'cozy': 2, 'peaceful': 2, 'heartwarming': 1 },
      'kai': { 'energetic': 2, 'chaotic': 2, 'hilarious': 1 },
      'elias': { 'adorable': 2, 'mischievous': 1, 'surprising': 2 }
    };
    
    const preference = npcMoodPreferences[npcId]?.[mood] || 0;
    
    if (preference >= 2 || bondLevel >= 5) return 'love';
    if (mood === 'hilarious' || mood === 'chaotic') return 'laugh';
    if (mood === 'surprising') return 'surprised';
    return 'like';
  }

  private generateNPCComment(npcId: string, mood: string, reactionType: string): string {
    const comments: Record<string, Record<string, string[]>> = {
      'aria': {
        'love': ["This is so precious! 💕", "My heart can't handle this cuteness!", "Perfect moment captured~"],
        'like': ["Aww, how sweet!", "Love seeing this!", "So cozy 🥰"],
        'laugh': ["Haha, they're having so much fun!", "This made my day!", "Too funny! 😄"],
        'surprised': ["Oh my! Didn't expect that!", "Wait, what?! 😲", "How did that happen?"]
      },
      'kai': {
        'love': ["YESSS this is amazing!!", "This is why I love this place!", "Pure chaos and I'm here for it! 🔥"],
        'like': ["Nice one!", "That's what I'm talking about!", "Cool shot! 📸"],
        'laugh': ["LMAOOO I can't!! 😂", "Bro I'm dying 💀", "This is comedy gold!"],
        'surprised': ["YO WHAT?!", "Did NOT see that coming!", "Plot twist of the century!"]
      },
      'elias': {
        'love': ["Absolutely divine~ ✨", "This speaks to my soul", "Perfection in a single frame 🎨"],
        'like': ["Quite charming indeed", "A lovely moment", "Beautifully captured"],
        'laugh': ["How delightfully chaotic!", "I'm amused~ 😏", "The pets have outdone themselves!"],
        'surprised': ["Oh my stars!", "How intriguing...", "I'm genuinely shocked! 😳"]
      }
    };
    
    const npcComments = comments[npcId]?.[reactionType] || ["Nice post!"];
    return npcComments[Math.floor(Math.random() * npcComments.length)];
  }

  private calculateBondPoints(post: BlogPost, npcBond: any): number {
    let points = 10; // Base points for being tagged
    
    // Caption quality bonus (simple length check for now)
    if (post.content.caption.length > 50) {
      points += 5;
    }
    
    // Mood match bonus
    const npcMoodPreferences: Record<string, string[]> = {
      'aria': ['cozy', 'peaceful', 'heartwarming'],
      'kai': ['energetic', 'chaotic', 'hilarious'],
      'elias': ['adorable', 'mischievous', 'surprising']
    };
    
    if (npcMoodPreferences[npcBond.npcId]?.includes(post.content.mood)) {
      points += 5;
    }
    
    // Frequency penalty (if posting too often)
    const recentPosts = this.getRecentPostsWithNPC(npcBond.npcId, 3600000); // Last hour
    if (recentPosts > 3) {
      points = Math.floor(points * 0.5); // -50% if spamming
    }
    
    return points;
  }

  private getTrendingMood(): string {
    // Simple rotation of trending moods
    const moods = ['cozy', 'chaotic', 'heartwarming', 'hilarious', 'adorable'];
    const dayOfWeek = new Date().getDay();
    return moods[dayOfWeek % moods.length];
  }

  private checkSubscriberMilestones(): void {
    const state = this.gameState.getState();
    const currentSubs = state.player.subscribers;
    
    // Define milestones
    const milestones = [
      { threshold: 100, name: "Rising Star", reward: { coins: 500 } },
      { threshold: 500, name: "Popular Blogger", reward: { premiumCurrency: 10 } },
      { threshold: 1000, name: "Influencer", reward: { coins: 2000, premiumCurrency: 20 } },
      { threshold: 5000, name: "Celebrity", reward: { premiumCurrency: 50 } }
    ];
    
    milestones.forEach(milestone => {
      if (currentSubs >= milestone.threshold && !this.isMilestoneClaimed(milestone.threshold)) {
        this.eventSystem.emit('blog:milestone_reached', { milestone });
      }
    });
  }

  private isMilestoneClaimed(threshold: number): boolean {
    // In a real implementation, track claimed milestones
    return false;
  }

  private getRecentPostsWithNPC(npcId: string, timeWindow: number): number {
    // In a real implementation, query recent posts
    return 0;
  }

  private storeBlogPost(post: BlogPost): void {
    // In a real implementation, this would persist to a database
    // For now, we'll store in a global blog feed
    if (!window.PetCafeBlogFeed) {
      window.PetCafeBlogFeed = [];
    }
    window.PetCafeBlogFeed.unshift(post); // Add to beginning
  }

  getBlogFeed(): BlogPost[] {
    return window.PetCafeBlogFeed || [];
  }

  getUnpublishedMemories(): Memory[] {
    const state = this.gameState.getState();
    return (state.player.memories || []).filter(m => !m.isPublished);
  }
}

// Extend window for blog feed storage
declare global {
  interface Window {
    PetCafeBlogFeed: BlogPost[];
  }
}
