// Quest data for each cafe section
import { Quest } from '../models/Quest';

// Quest slot durations (in milliseconds)
// Slots 1-2: 3 min (unlocked by default)
// Slot 3: 5 min (costs 1000 coins to unlock)
// Slot 4: 8 min (costs 1000 coins to unlock)
// Slot 5: 12 min (costs 1000 coins to unlock)

export const BAKERY_QUESTS: Quest[] = [
  // Slot 1 (unlocked by default) - Left side
  {
    questId: 'bakery_taste_test',
    sectionType: 'bakery',
    title: 'Morning Taste Test',
    description: 'Aria needs a reliable taste tester for her new honey glazed pastries. Help sample the morning batch!',
    requiredTrait: 'Expert Taste Tester',
    duration: 3 * 60 * 1000, // 3 minutes
    position: { x: 15, y: 45 },
    baseRewards: {
      coins: 50,
      npcBondXP: 10,
      freeGachaCurrency: 0
    },
    rarityMultipliers: {
      '3-star': 1.0,
      '4-star': 1.5,
      '5-star': 2.0
    }
  },
  // Slot 2 (unlocked by default) - Right side
  {
    questId: 'bakery_temperature_check',
    sectionType: 'bakery',
    title: 'Oven Watch Duty',
    description: 'The ovens need constant monitoring to ensure perfect baking temperatures. Can you help keep an eye on things?',
    requiredTrait: 'Temperature Detective',
    duration: 3 * 60 * 1000, // 3 minutes
    position: { x: 75, y: 55 },
    baseRewards: {
      coins: 45,
      npcBondXP: 10,
      freeGachaCurrency: 0
    },
    rarityMultipliers: {
      '3-star': 1.0,
      '4-star': 1.5,
      '5-star': 2.0
    }
  },
  // Slot 3 (locked, 5 min) - Top center
  {
    questId: 'bakery_cookie_art',
    sectionType: 'bakery',
    title: 'Cookie Decorating',
    description: 'Time to decorate today\'s special cookies! Aria needs an artistic paw to make them extra special.',
    requiredTrait: 'Cookie Artist',
    duration: 5 * 60 * 1000, // 5 minutes
    position: { x: 45, y: 25 },
    baseRewards: {
      coins: 70,
      npcBondXP: 12,
      freeGachaCurrency: 1
    },
    rarityMultipliers: {
      '3-star': 1.0,
      '4-star': 1.5,
      '5-star': 2.0
    }
  },
  // Slot 4 (locked, 8 min) - Bottom left
  {
    questId: 'bakery_bread_making',
    sectionType: 'bakery',
    title: 'Fresh Bread Baking',
    description: 'Help Aria prepare today\'s special sourdough loaves. The perfect rise needs careful attention!',
    requiredTrait: 'Dough Whisperer',
    duration: 8 * 60 * 1000, // 8 minutes
    position: { x: 30, y: 70 },
    baseRewards: {
      coins: 100,
      npcBondXP: 15,
      freeGachaCurrency: 1
    },
    rarityMultipliers: {
      '3-star': 1.0,
      '4-star': 1.5,
      '5-star': 2.0
    }
  },
  // Slot 5 (locked, 12 min) - Middle right
  {
    questId: 'bakery_special_order',
    sectionType: 'bakery',
    title: 'Custom Cake Creation',
    description: 'A special order for an elaborate celebration cake has arrived. Help Aria create something truly memorable!',
    requiredTrait: 'Pastry Perfectionist',
    duration: 12 * 60 * 1000, // 12 minutes
    position: { x: 65, y: 35 },
    baseRewards: {
      coins: 150,
      npcBondXP: 20,
      freeGachaCurrency: 2
    },
    rarityMultipliers: {
      '3-star': 1.0,
      '4-star': 1.5,
      '5-star': 2.0
    }
  }
];

export const PLAYGROUND_QUESTS: Quest[] = [
  // Slot 1 (unlocked by default) - Center top
  {
    questId: 'playground_welcome',
    sectionType: 'playground',
    title: 'Greeter Duty',
    description: 'Kai needs someone to welcome new visitors and make them feel at home. Show them the playground spirit!',
    requiredTrait: 'Welcome Committee',
    duration: 3 * 60 * 1000, // 3 minutes
    position: { x: 50, y: 30 },
    baseRewards: {
      coins: 50,
      npcBondXP: 10,
      freeGachaCurrency: 0
    },
    rarityMultipliers: {
      '3-star': 1.0,
      '4-star': 1.5,
      '5-star': 2.0
    }
  },
  // Slot 2 (unlocked by default) - Bottom center
  {
    questId: 'playground_toy_check',
    sectionType: 'playground',
    title: 'Toy Quality Inspector',
    description: 'Check all the playground toys to make sure they\'re safe and fun for everyone!',
    requiredTrait: 'Safety Scout',
    duration: 3 * 60 * 1000, // 3 minutes
    position: { x: 45, y: 65 },
    baseRewards: {
      coins: 45,
      npcBondXP: 10,
      freeGachaCurrency: 0
    },
    rarityMultipliers: {
      '3-star': 1.0,
      '4-star': 1.5,
      '5-star': 2.0
    }
  },
  // Slot 3 (locked, 5 min) - Left middle
  {
    questId: 'playground_activities',
    sectionType: 'playground',
    title: 'Activity Coordinator',
    description: 'Kai is organizing group games! Help coordinate activities and keep everyone entertained.',
    requiredTrait: 'Game Master',
    duration: 5 * 60 * 1000, // 5 minutes
    position: { x: 20, y: 50 },
    baseRewards: {
      coins: 70,
      npcBondXP: 12,
      freeGachaCurrency: 1
    },
    rarityMultipliers: {
      '3-star': 1.0,
      '4-star': 1.5,
      '5-star': 2.0
    }
  },
  // Slot 4 (locked, 8 min) - Right middle
  {
    questId: 'playground_treasure_hunt',
    sectionType: 'playground',
    title: 'Treasure Hunt Leader',
    description: 'Lead an exciting treasure hunt adventure around the playground! Hide clues and guide the hunters.',
    requiredTrait: 'Adventure Guide',
    duration: 8 * 60 * 1000, // 8 minutes
    position: { x: 75, y: 45 },
    baseRewards: {
      coins: 100,
      npcBondXP: 15,
      freeGachaCurrency: 1
    },
    rarityMultipliers: {
      '3-star': 1.0,
      '4-star': 1.5,
      '5-star': 2.0
    }
  },
  // Slot 5 (locked, 12 min) - Top right
  {
    questId: 'playground_tournament',
    sectionType: 'playground',
    title: 'Tournament Organizer',
    description: 'Help Kai run a full playground tournament with multiple rounds and prizes for everyone!',
    requiredTrait: 'Championship Coordinator',
    duration: 12 * 60 * 1000, // 12 minutes
    position: { x: 70, y: 25 },
    baseRewards: {
      coins: 150,
      npcBondXP: 20,
      freeGachaCurrency: 2
    },
    rarityMultipliers: {
      '3-star': 1.0,
      '4-star': 1.5,
      '5-star': 2.0
    }
  }
];

export const SALON_QUESTS: Quest[] = [
  // Slot 1 (unlocked by default) - Top left
  {
    questId: 'salon_brush_duty',
    sectionType: 'salon',
    title: 'Brush & Fluff',
    description: 'Elias needs help with the brushing station. Make sure everyone leaves feeling soft and fluffy!',
    requiredTrait: 'Brushing Pro',
    duration: 3 * 60 * 1000, // 3 minutes
    position: { x: 25, y: 35 },
    baseRewards: {
      coins: 50,
      npcBondXP: 10,
      freeGachaCurrency: 0
    },
    rarityMultipliers: {
      '3-star': 1.0,
      '4-star': 1.5,
      '5-star': 2.0
    }
  },
  // Slot 2 (unlocked by default) - Middle left
  {
    questId: 'salon_nail_trim',
    sectionType: 'salon',
    title: 'Gentle Nail Care',
    description: 'Time for careful nail trimming! Help Elias make sure everyone is comfortable and well-groomed.',
    requiredTrait: 'Precision Clipper',
    duration: 3 * 60 * 1000, // 3 minutes
    position: { x: 35, y: 60 },
    baseRewards: {
      coins: 45,
      npcBondXP: 10,
      freeGachaCurrency: 0
    },
    rarityMultipliers: {
      '3-star': 1.0,
      '4-star': 1.5,
      '5-star': 2.0
    }
  },
  // Slot 3 (locked, 5 min) - Center
  {
    questId: 'salon_bath_time',
    sectionType: 'salon',
    title: 'Spa Bath Service',
    description: 'Prepare the perfect spa bath experience with aromatherapy and gentle massage!',
    requiredTrait: 'Spa Specialist',
    duration: 5 * 60 * 1000, // 5 minutes
    position: { x: 55, y: 50 },
    baseRewards: {
      coins: 70,
      npcBondXP: 12,
      freeGachaCurrency: 1
    },
    rarityMultipliers: {
      '3-star': 1.0,
      '4-star': 1.5,
      '5-star': 2.0
    }
  },
  // Slot 4 (locked, 8 min) - Top right
  {
    questId: 'salon_styling',
    sectionType: 'salon',
    title: 'Fashion Styling',
    description: 'Help create the perfect look with bows, bandanas, and accessories! Elias needs a fashion consultant.',
    requiredTrait: 'Style Icon',
    duration: 8 * 60 * 1000, // 8 minutes
    position: { x: 75, y: 30 },
    baseRewards: {
      coins: 100,
      npcBondXP: 15,
      freeGachaCurrency: 1
    },
    rarityMultipliers: {
      '3-star': 1.0,
      '4-star': 1.5,
      '5-star': 2.0
    }
  },
  // Slot 5 (locked, 12 min) - Bottom right
  {
    questId: 'salon_makeover',
    sectionType: 'salon',
    title: 'Complete Makeover',
    description: 'VIP treatment! Full spa service, styling, and photo shoot for today\'s special guests.',
    requiredTrait: 'Makeover Maestro',
    duration: 12 * 60 * 1000, // 12 minutes
    position: { x: 70, y: 65 },
    baseRewards: {
      coins: 150,
      npcBondXP: 20,
      freeGachaCurrency: 2
    },
    rarityMultipliers: {
      '3-star': 1.0,
      '4-star': 1.5,
      '5-star': 2.0
    }
  }
];

export function getQuestsBySectionType(sectionType: string): Quest[] {
  switch (sectionType.toLowerCase()) {
    case 'bakery':
      return BAKERY_QUESTS;
    case 'playground':
      return PLAYGROUND_QUESTS;
    case 'salon':
      return SALON_QUESTS;
    default:
      return [];
  }
}
