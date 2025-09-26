// NPC Response Service - Manages NPC conversation responses
import { EventSystem } from '../systems/EventSystem';
import { GameStateManager } from '../systems/GameState';
import npcData from '../data/npcs.json';
import { scenes } from '../utils/sceneData';

export interface ResponseContext {
  messageType: 'greeting' | 'general' | 'memory' | 'bond' | 'shift' | 'pet';
  playerMessage?: string;
  recentActivity?: {
    lastShift?: string;
    lastMemory?: string;
    newPets?: string[];
  };
  bondLevel?: number;
  timeOfDay?: 'morning' | 'afternoon' | 'evening' | 'night';
  sceneId?: string; // Added for scene triggering
}

export class NPCResponseService {
  private eventSystem: EventSystem;
  private gameState: GameStateManager;

  constructor(eventSystem: EventSystem, gameState: GameStateManager) {
    this.eventSystem = eventSystem;
    this.gameState = gameState;
  }

  generateResponse(npcId: string, context: ResponseContext): string {
    if (context.sceneId) {
      const sceneConfig = scenes.find(scene => scene.sceneId === context.sceneId);
      if (sceneConfig) {
        this.eventSystem.emit('scene:play', { sceneId: context.sceneId, config: sceneConfig });
      }
    }
    const templates = npcData.dmTemplates[npcId as keyof typeof npcData.dmTemplates];
    if (!templates) {
      return this.getFallbackResponse(npcId);
    }

    // Determine response based on context
    if (context.messageType === 'greeting') {
      return this.getGreetingResponse(npcId, templates, context);
    } else if (context.messageType === 'memory' && context.recentActivity?.lastMemory) {
      return this.getMemoryResponse(npcId, templates, context);
    } else if (context.messageType === 'pet' && context.recentActivity?.newPets?.length) {
      return this.getNewPetResponse(npcId, context.recentActivity.newPets);
    } else if (context.messageType === 'bond') {
      return this.getBondResponse(npcId, templates, context);
    } else {
      return this.getGeneralResponse(npcId, context);
    }
  }

  private getGreetingResponse(
    npcId: string, 
    templates: any, 
    context: ResponseContext
  ): string {
    const greetings = templates.greeting || [];
    const timeGreetings = this.getTimeBasedGreetings(npcId, context.timeOfDay);
    
    // Combine time-based and regular greetings
    const allGreetings = [...greetings, ...timeGreetings];
    
    return allGreetings[Math.floor(Math.random() * allGreetings.length)] || 
           this.getFallbackResponse(npcId);
  }

  private getMemoryResponse(
    npcId: string, 
    templates: any, 
    context: ResponseContext
  ): string {
    const memoryResponses = templates.memory_response || [];
    const base = memoryResponses[Math.floor(Math.random() * memoryResponses.length)] || 
                 "That was a wonderful moment!";

    const recentPet = context.recentActivity?.newPets?.[0];
    if (recentPet) {
      return `${base} I'm still thinking about ${recentPet}.`;
    }

    if (context.recentActivity?.lastMemory?.includes('play')) {
      return base + " The pets had so much fun!";
    } else if (context.recentActivity?.lastMemory?.includes('treat')) {
      return base + " They really enjoyed those treats!";
    }
    
    return base;
  }

  private getNewPetResponse(npcId: string, pets: string[]): string {
    const petName = pets[0];
    const responses: Record<string, string[]> = {
      aria: [
        `${petName} has already made themselves at home in the bakery! 🥐`,
        `I can't wait to bake something special for ${petName}.`,
        `${petName} reminds me of a childhood memory... thank you for adopting them.`
      ],
      kai: [
        `${petName} has so much energy! They fit right into the playground!`,
        `I bet ${petName} will love racing with me.`,
        `Let's welcome ${petName} with a big playground party!`
      ],
      elias: [
        `${petName} carries such grace... I'd love to sketch them.`,
        `I see a beautiful future for ${petName} in the salon.`,
        `Thank you for trusting me with ${petName}. They inspire me.`
      ]
    };

    const npcResponses = responses[npcId] || [
      `${petName} is perfect for the café!`,
      `I can't wait to make memories with ${petName}.`
    ];

    return npcResponses[Math.floor(Math.random() * npcResponses.length)];
  }

  private getBondResponse(
    npcId: string, 
    templates: any, 
    context: ResponseContext
  ): string {
    const bondResponses = templates.bond_increase || [];
    const bondLevel = context.bondLevel || 1;
    
    // Select response based on bond level
    if (bondLevel >= 3 && bondResponses.length > 2) {
      return bondResponses[2]; // Higher bond response
    } else if (bondLevel >= 2 && bondResponses.length > 1) {
      return bondResponses[1]; // Medium bond response
    }
    
    return bondResponses[0] || "I enjoy spending time with you!";
  }

  private getGeneralResponse(npcId: string, context: ResponseContext): string {
    // Analyze player message for keywords and respond accordingly
    const message = context.playerMessage?.toLowerCase() || '';
    const recentPet = context.recentActivity?.newPets?.[0];

    if (recentPet && message.includes('thank')) {
      return `Thank you for bringing ${recentPet} home. They already feel like family.`;
    }
    
    // Pet-related responses
    if (message.includes('pet') || message.includes('cat') || message.includes('dog')) {
      return this.getPetResponse(npcId);
    }
    
    // Activity responses
    if (message.includes('shift') || message.includes('work')) {
      return this.getShiftResponse(npcId);
    }
    
    // Emotion responses
    if (message.includes('love') || message.includes('like')) {
      return this.getAffectionResponse(npcId);
    }
    
    if (message.includes('thank')) {
      return this.getThankYouResponse(npcId);
    }
    
    // Question responses
    if (message.includes('?')) {
      return this.getQuestionResponse(npcId, message);
    }
    
    // Default contextual response
    return this.getDefaultResponse(npcId);
  }

  private getTimeBasedGreetings(npcId: string, timeOfDay?: string): string[] {
    const timeGreetings: Record<string, Record<string, string[]>> = {
      aria: {
        morning: ["Good morning! I just finished baking fresh pastries 🥐"],
        afternoon: ["Hope you're having a sweet afternoon! ☀️"],
        evening: ["Evening! The café smells amazing right now 🌙"],
        night: ["Still up? I'm preparing tomorrow's treats 🌟"]
      },
      kai: {
        morning: ["Morning! Ready to start the day with energy? 🌅"],
        afternoon: ["Hey! Perfect time for some playground fun! 🎯"],
        evening: ["Evening games are the best! Join us? 🌆"],
        night: ["Can't sleep? Let's plan tomorrow's activities! ⭐"]
      },
      elias: {
        morning: ["Good morning... The light is perfect for styling today ✨"],
        afternoon: ["Hello... The afternoon calm is inspiring 🎨"],
        evening: ["Evening brings such beautiful colors... 🌇"],
        night: ["The quiet night sparks creativity... 🌙"]
      }
    };
    
    return timeGreetings[npcId]?.[timeOfDay || 'afternoon'] || [];
  }

  private getPetResponse(npcId: string): string {
    const responses: Record<string, string[]> = {
      aria: [
        "The pets always brighten up the bakery! 🐾",
        "They love the smell of fresh bread as much as we do!",
        "I saved some pet-safe treats for them 💕"
      ],
      kai: [
        "The pets are having a blast on the playground!",
        "They've got so much energy today! 🎾",
        "Let's teach them a new game!"
      ],
      elias: [
        "Each pet has such unique beauty...",
        "I love bringing out their natural charm ✨",
        "They're all little works of art"
      ]
    };
    
    const npcResponses = responses[npcId] || ["The pets are wonderful!"];
    return npcResponses[Math.floor(Math.random() * npcResponses.length)];
  }

  private getShiftResponse(npcId: string): string {
    const responses: Record<string, string[]> = {
      aria: [
        "Ready to create some delicious memories? 🥖",
        "The bakery is all set for a wonderful shift!",
        "Let's make something special together!"
      ],
      kai: [
        "Time for an awesome shift! High five! ✋",
        "The playground is calling our names!",
        "This is gonna be epic!"
      ],
      elias: [
        "The salon awaits... shall we begin? 💫",
        "I've prepared everything for a peaceful shift",
        "Let's create beauty together"
      ]
    };
    
    const npcResponses = responses[npcId] || ["Looking forward to our shift!"];
    return npcResponses[Math.floor(Math.random() * npcResponses.length)];
  }

  private getAffectionResponse(npcId: string): string {
    const responses: Record<string, string[]> = {
      aria: [
        "Aww, you're so sweet! 💗",
        "That warms my heart like a fresh oven!",
        "You always know what to say... ☺️"
      ],
      kai: [
        "Right back at you, buddy! 🤗",
        "You're the best! *fist bump*",
        "Aw man, you're making me smile!"
      ],
      elias: [
        "Your words are like poetry... 🌹",
        "You have such a beautiful soul",
        "I... thank you. That means a lot."
      ]
    };
    
    const npcResponses = responses[npcId] || ["That's very kind of you! 💕"];
    return npcResponses[Math.floor(Math.random() * npcResponses.length)];
  }

  private getThankYouResponse(npcId: string): string {
    const responses: Record<string, string[]> = {
      aria: [
        "You're always welcome here! 🤗",
        "It's my pleasure, truly!",
        "Anything for you and the pets!"
      ],
      kai: [
        "No problem at all! 👍",
        "Hey, that's what friends are for!",
        "Anytime! You know that!"
      ],
      elias: [
        "The pleasure is mine...",
        "I'm glad I could help",
        "Your happiness is thanks enough"
      ]
    };
    
    const npcResponses = responses[npcId] || ["You're very welcome! 😊"];
    return npcResponses[Math.floor(Math.random() * npcResponses.length)];
  }

  private getQuestionResponse(npcId: string, question: string): string {
    // Simple keyword-based question handling
    if (question.includes('how are you')) {
      return this.getHowAreYouResponse(npcId);
    } else if (question.includes('favorite')) {
      return this.getFavoriteResponse(npcId);
    }
    
    // Default question responses
    const responses: Record<string, string[]> = {
      aria: [
        "That's a good question! Let me think... 🤔",
        "Hmm, I'd say it depends on the day!",
        "What do you think? I'd love to hear your thoughts!"
      ],
      kai: [
        "Oh! That's easy - the answer is always more fun! 😄",
        "Great question! I think we should try it and see!",
        "Hmm... wanna figure it out together?"
      ],
      elias: [
        "An intriguing question... 🤔",
        "I believe the answer lies within...",
        "That's something to ponder, isn't it?"
      ]
    };
    
    const npcResponses = responses[npcId] || ["That's interesting! Tell me more?"];
    return npcResponses[Math.floor(Math.random() * npcResponses.length)];
  }

  private getHowAreYouResponse(npcId: string): string {
    const responses: Record<string, string> = {
      aria: "I'm wonderful! The bakery is filled with happy pets today 😊",
      kai: "I'm pumped! Just had the best playground session ever! 💪",
      elias: "I'm... content. The salon has been peaceful today 🌸"
    };
    
    return responses[npcId] || "I'm doing well, thank you for asking!";
  }

  private getFavoriteResponse(npcId: string): string {
    const responses: Record<string, string> = {
      aria: "My favorite? Definitely seeing pets enjoy fresh treats! 🍪",
      kai: "Favorite game? ALL OF THEM! But fetch is pretty awesome 🎾",
      elias: "I'm partial to the quiet moments of grooming... so calming ✨"
    };
    
    return responses[npcId] || "That's a tough choice! So many favorites!";
  }

  private getDefaultResponse(npcId: string): string {
    const responses: Record<string, string[]> = {
      aria: [
        "The café is always better with you here! ☕",
        "I've been experimenting with new recipes!",
        "The pets seem extra happy today!"
      ],
      kai: [
        "This is awesome! 🎉",
        "You always bring such great energy!",
        "Let's make today amazing!"
      ],
      elias: [
        "Your presence brings peace to this space...",
        "I've been inspired by the pets' natural beauty",
        "There's something special about today..."
      ]
    };
    
    const npcResponses = responses[npcId] || ["It's always nice talking with you!"];
    return npcResponses[Math.floor(Math.random() * npcResponses.length)];
  }

  private getFallbackResponse(npcId: string): string {
    const fallbacks: Record<string, string> = {
      aria: "It's lovely to hear from you! 💕",
      kai: "Hey there! What's up? 😄",
      elias: "Hello... it's good to see you 🌟"
    };
    
    return fallbacks[npcId] || "Hi there! How can I help you today?";
  }

  getTimeOfDay(): 'morning' | 'afternoon' | 'evening' | 'night' {
    const hour = new Date().getHours();
    if (hour < 6) return 'night';
    if (hour < 12) return 'morning';
    if (hour < 18) return 'afternoon';
    if (hour < 22) return 'evening';
    return 'night';
  }

  private getAffectionatePrefix(npcId: string): string {
    const prefixes: Record<string, string[]> = {
      aria: ["My dear...", "Sweetie...", "Darling..."],
      kai: ["Hey bestie!", "My awesome friend!", "Yo, partner!"],
      elias: ["Beloved...", "Dear one...", "My muse..."]
    };
    
    const npcPrefixes = prefixes[npcId] || [""];
    return npcPrefixes[Math.floor(Math.random() * npcPrefixes.length)];
  }

  // Enhanced method that considers bond level
  generateBondAwareResponse(npcId: string, context: ResponseContext): string {
    const bond = this.gameState.getPlayer().npcBonds.find(b => b.npcId === npcId);
    const bondLevel = bond?.bondLevel || 1;
    
    // Enrich context with actual bond level
    const enrichedContext = { ...context, bondLevel };
    
    // Get base response
    let response = this.generateResponse(npcId, enrichedContext);
    
    // Add bond-specific modifications
    if (bondLevel >= 4 && Math.random() < 0.3) {
      // 30% chance to add affectionate suffix at high bond levels
      const suffix = this.getBondSuffix(npcId, bondLevel);
      response = `${response} ${suffix}`;
    }
    
    return response;
  }

  private getBondSuffix(npcId: string, bondLevel: number): string {
    if (bondLevel < 4) return "";
    
    const suffixes: Record<string, string[]> = {
      aria: ["💕", "Can't wait to see you again!", "You mean so much to me..."],
      kai: ["🤝", "You're the best!", "Let's hang out more!"],
      elias: ["🌟", "Your presence brightens my day", "Until we meet again..."]
    };
    
    const npcSuffixes = suffixes[npcId] || [""];
    return npcSuffixes[Math.floor(Math.random() * npcSuffixes.length)];
  }
}
