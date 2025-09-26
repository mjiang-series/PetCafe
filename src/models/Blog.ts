// Blog and social media interfaces

export interface BlogPost {
  postId: string;
  memoryId: string; // Reference to the source memory
  authorId: string; // Player ID
  content: BlogPostContent;
  engagement: BlogEngagement;
  publishedAt: number;
  taggedNpcs: string[]; // NPC IDs tagged in post
  reactions: NPCReaction[];
  viral: boolean;
}

export interface BlogPostContent {
  imageUrl: string; // Memory image
  caption: string; // Player-written caption
  location: string; // Cafe section
  mood: string; // Memory mood
  petIds: string[]; // Featured pets
}

export interface BlogEngagement {
  likes: number;
  views: number;
  subscribersGained: number;
  bondPointsEarned: Record<string, number>; // npcId -> points
}

export interface NPCReaction {
  npcId: string;
  reactionType: 'like' | 'love' | 'laugh' | 'surprised';
  comment?: string;
  timestamp: number;
}

export interface SubscriberMilestone {
  threshold: number;
  name: string;
  description: string;
  rewards: MilestoneReward;
  claimed: boolean;
}

export interface MilestoneReward {
  coins?: number;
  premiumCurrency?: number;
  items?: Record<string, number>;
  unlockedContent?: string[];
}

export interface BlogStats {
  totalPosts: number;
  totalLikes: number;
  totalViews: number;
  currentSubscribers: number;
  subscriberMilestones: SubscriberMilestone[];
  trendingMood?: string;
  lastPostTime?: number;
}
