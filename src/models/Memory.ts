// Memory and blog post interfaces
export interface Memory {
  memoryId: string;
  shiftId: string; // shift that generated this memory
  content: string; // the actual memory text
  imageUrl?: string | undefined; // placeholder image URL
  taggedNpcs: string[]; // NPCs mentioned in the memory
  mood: string; // emotional tone of the memory
  likes: number;
  views: number;
  isPublished: boolean;
  createdAt: number;
  publishedAt?: number | undefined;
  location: string; // section name
  petIds: string[]; // pets involved
  caption?: string | undefined; // player-added caption when publishing
}

export interface MemoryContent {
  title: string;
  caption: string; // player-written or AI-suggested
  description: string; // system-generated description
  imageRef?: string; // reference to generated/captured image
  tags: string[];
}

export interface MemoryAnalytics {
  likes: number;
  subscriberBoost: number; // how many subscribers this memory gained
  bondPointsGenerated: number;
  viewCount: number;
}

export interface MemoryMetadata {
  generatedBy: 'shift' | 'event' | 'special';
  rarity: 'common' | 'rare' | 'ultra_rare';
  triggerContext: {
    shiftId?: string;
    petCombination?: string[];
    specialEvent?: string;
  };
  aiGenerated?: {
    captionSuggestion?: string;
    originalPrompt?: string;
  };
}

export interface BlogPost {
  postId: string;
  memoryId: string;
  publishedAt: number;
  authorId: string; // player ID
  content: {
    caption: string;
    imageRef?: string;
    tags: string[];
  };
  engagement: {
    likes: number;
    comments?: BlogComment[];
    shares: number;
  };
  visibility: 'public' | 'friends' | 'private';
}

export interface BlogComment {
  commentId: string;
  authorId: string; // could be NPC or other players in future
  content: string;
  timestamp: number;
  reactions: Record<string, number>;
}

export interface BlogFeed {
  posts: BlogPost[];
  totalSubscribers: number;
  feedMetrics: {
    totalLikes: number;
    totalPosts: number;
    averageEngagement: number;
  };
}

