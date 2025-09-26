import { EventSystem } from './EventSystem';
import { GameState } from './GameState';
import { Memory } from '../models';

interface MemoryAchievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: (memories: Memory[], player: any) => boolean;
  progress?: (memories: Memory[], player: any) => { current: number; total: number };
  reward?: {
    type: 'coins' | 'tickets' | 'diamonds' | 'title';
    amount?: number;
    value?: string;
  };
}

export class MemoryAchievementSystem {
  private achievements: MemoryAchievement[] = [
    // Memory Collection Achievements
    {
      id: 'first_memory',
      name: 'Memory Keeper',
      description: 'Create your first memory',
      icon: 'photo_camera',
      requirement: (memories) => memories.length >= 1,
      reward: { type: 'coins', amount: 100 }
    },
    {
      id: 'memory_week',
      name: 'First Week',
      description: 'Create memories on 7 consecutive days',
      icon: 'calendar_today',
      requirement: (memories) => this.hasConsecutiveDays(memories, 7),
      progress: (memories) => ({ 
        current: this.getMaxConsecutiveDays(memories), 
        total: 7 
      }),
      reward: { type: 'tickets', amount: 3 }
    },
    {
      id: 'mood_master',
      name: 'Mood Master',
      description: 'Collect memories of all mood types',
      icon: 'emoji_emotions',
      requirement: (memories) => {
        const moods = new Set(memories.map(m => m.mood));
        return moods.size >= 7; // All mood types
      },
      progress: (memories) => {
        const moods = new Set(memories.map(m => m.mood));
        return { current: moods.size, total: 7 };
      },
      reward: { type: 'title', value: 'Mood Master' }
    },
    {
      id: 'storyteller',
      name: 'Storyteller',
      description: 'Create 50 memories',
      icon: 'auto_stories',
      requirement: (memories) => memories.length >= 50,
      progress: (memories) => ({ current: memories.length, total: 50 }),
      reward: { type: 'diamonds', amount: 50 }
    },
    {
      id: 'bond_chronicles',
      name: 'Bond Chronicles',
      description: 'Create 10+ memories with each NPC',
      icon: 'group',
      requirement: (memories) => {
        const npcCounts: Record<string, number> = {};
        memories.forEach(m => {
          const npcs = m.taggedNPCs || m.taggedNpcs || [];
          npcs.forEach(npc => {
            npcCounts[npc] = (npcCounts[npc] || 0) + 1;
          });
        });
        return Object.values(npcCounts).filter(count => count >= 10).length >= 3;
      },
      progress: (memories) => {
        const npcCounts: Record<string, number> = {};
        memories.forEach(m => {
          const npcs = m.taggedNPCs || m.taggedNpcs || [];
          npcs.forEach(npc => {
            npcCounts[npc] = (npcCounts[npc] || 0) + 1;
          });
        });
        const qualified = Object.values(npcCounts).filter(count => count >= 10).length;
        return { current: qualified, total: 3 };
      },
      reward: { type: 'title', value: 'Friend of All' }
    },
    
    // Sharing Achievements
    {
      id: 'first_share',
      name: 'Social Butterfly',
      description: 'Share your first moment',
      icon: 'share',
      requirement: (memories) => memories.some(m => m.isPublished),
      reward: { type: 'coins', amount: 200 }
    },
    {
      id: 'influencer',
      name: 'Influencer',
      description: 'Reach 1000 followers',
      icon: 'trending_up',
      requirement: (_, player) => player.blogStats?.subscribers >= 1000,
      progress: (_, player) => ({ 
        current: player.blogStats?.subscribers || 0, 
        total: 1000 
      }),
      reward: { type: 'title', value: 'Influencer' }
    },
    {
      id: 'viral_moment',
      name: 'Viral Moment',
      description: 'Get 100+ likes on a single post',
      icon: 'whatshot',
      requirement: (memories) => memories.some(m => m.likes >= 100),
      reward: { type: 'diamonds', amount: 25 }
    },
    {
      id: 'daily_poster',
      name: 'Daily Poster',
      description: 'Share moments 7 days in a row',
      icon: 'schedule',
      requirement: (memories) => this.hasConsecutiveShares(memories, 7),
      progress: (memories) => ({ 
        current: this.getMaxConsecutiveShares(memories), 
        total: 7 
      }),
      reward: { type: 'tickets', amount: 5 }
    },
    
    // Special Achievements
    {
      id: 'memory_collector',
      name: 'Memory Collector',
      description: 'Create 100 memories',
      icon: 'collections',
      requirement: (memories) => memories.length >= 100,
      progress: (memories) => ({ current: memories.length, total: 100 }),
      reward: { type: 'diamonds', amount: 100 }
    },
    {
      id: 'perfect_week',
      name: 'Perfect Week',
      description: 'Create and share a memory every day for a week',
      icon: 'star',
      requirement: (memories) => {
        const last7Days = this.getLast7Days();
        return last7Days.every(date => 
          memories.some(m => 
            this.isSameDay(new Date(m.timestamp), date) && m.isPublished
          )
        );
      },
      reward: { type: 'title', value: 'Dedicated' }
    }
  ];

  private unlockedAchievements: Set<string> = new Set();

  constructor(
    private eventSystem: EventSystem,
    private gameState: GameState
  ) {
    this.loadUnlockedAchievements();
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    // Check achievements when memories are created or shared
    this.eventSystem.on('memory:created', () => this.checkAchievements());
    this.eventSystem.on('memory:shared', () => this.checkAchievements());
    this.eventSystem.on('blog:subscriber_gained', () => this.checkAchievements());
  }

  private loadUnlockedAchievements(): void {
    const player = this.gameState.getPlayer();
    this.unlockedAchievements = new Set(player.unlockedAchievements || []);
  }

  checkAchievements(): void {
    const player = this.gameState.getPlayer();
    const memories = player.memories || [];
    
    this.achievements.forEach(achievement => {
      if (!this.unlockedAchievements.has(achievement.id)) {
        if (achievement.requirement(memories, player)) {
          this.unlockAchievement(achievement);
        }
      }
    });
  }

  private unlockAchievement(achievement: MemoryAchievement): void {
    this.unlockedAchievements.add(achievement.id);
    
    // Update player data
    const player = this.gameState.getPlayer();
    this.gameState.updatePlayer({
      unlockedAchievements: Array.from(this.unlockedAchievements)
    });
    
    // Apply reward
    if (achievement.reward) {
      this.applyReward(achievement.reward);
    }
    
    // Emit achievement unlocked event
    this.eventSystem.emit('achievement:unlocked', {
      achievement,
      timestamp: Date.now()
    });
    
    // Show notification
    this.eventSystem.emit('ui:notification_added', {
      id: `achievement_${achievement.id}_${Date.now()}`,
      type: 'achievement',
      title: 'Achievement Unlocked!',
      message: achievement.name,
      icon: achievement.icon,
      timestamp: Date.now()
    });
  }

  private applyReward(reward: MemoryAchievement['reward']): void {
    if (!reward) return;
    
    const player = this.gameState.getPlayer();
    
    switch (reward.type) {
      case 'coins':
        this.gameState.updatePlayer({
          coins: player.coins + (reward.amount || 0)
        });
        break;
      case 'tickets':
        this.gameState.updatePlayer({
          gachaTickets: player.gachaTickets + (reward.amount || 0)
        });
        break;
      case 'diamonds':
        this.gameState.updatePlayer({
          premiumCurrency: player.premiumCurrency + (reward.amount || 0)
        });
        break;
      case 'title':
        const titles = player.unlockedTitles || [];
        if (reward.value && !titles.includes(reward.value)) {
          titles.push(reward.value);
          this.gameState.updatePlayer({ unlockedTitles: titles });
        }
        break;
    }
  }

  getAchievements(): Array<{
    achievement: MemoryAchievement;
    unlocked: boolean;
    progress?: { current: number; total: number };
  }> {
    const player = this.gameState.getPlayer();
    const memories = player.memories || [];
    
    return this.achievements.map(achievement => ({
      achievement,
      unlocked: this.unlockedAchievements.has(achievement.id),
      progress: achievement.progress?.(memories, player)
    }));
  }

  // Helper methods
  private hasConsecutiveDays(memories: Memory[], days: number): boolean {
    return this.getMaxConsecutiveDays(memories) >= days;
  }

  private getMaxConsecutiveDays(memories: Memory[]): number {
    if (memories.length === 0) return 0;
    
    const dates = memories.map(m => new Date(m.timestamp));
    dates.sort((a, b) => a.getTime() - b.getTime());
    
    let maxConsecutive = 1;
    let currentConsecutive = 1;
    
    for (let i = 1; i < dates.length; i++) {
      const dayDiff = this.getDayDifference(dates[i-1], dates[i]);
      
      if (dayDiff === 0) {
        // Same day, continue
        continue;
      } else if (dayDiff === 1) {
        // Consecutive day
        currentConsecutive++;
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      } else {
        // Gap in days
        currentConsecutive = 1;
      }
    }
    
    return maxConsecutive;
  }

  private hasConsecutiveShares(memories: Memory[], days: number): boolean {
    return this.getMaxConsecutiveShares(memories) >= days;
  }

  private getMaxConsecutiveShares(memories: Memory[]): number {
    const shared = memories.filter(m => m.isPublished && m.publishedAt);
    if (shared.length === 0) return 0;
    
    const dates = shared.map(m => new Date(m.publishedAt!));
    dates.sort((a, b) => a.getTime() - b.getTime());
    
    let maxConsecutive = 1;
    let currentConsecutive = 1;
    
    for (let i = 1; i < dates.length; i++) {
      const dayDiff = this.getDayDifference(dates[i-1], dates[i]);
      
      if (dayDiff === 0) {
        continue;
      } else if (dayDiff === 1) {
        currentConsecutive++;
        maxConsecutive = Math.max(maxConsecutive, currentConsecutive);
      } else {
        currentConsecutive = 1;
      }
    }
    
    return maxConsecutive;
  }

  private getDayDifference(date1: Date, date2: Date): number {
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  private getLast7Days(): Date[] {
    const days = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      days.push(date);
    }
    
    return days;
  }
}
