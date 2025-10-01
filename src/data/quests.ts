// Quest data for each cafe section
import { Quest } from '../models/Quest';

export const BAKERY_QUESTS: Quest[] = [
  {
    questId: 'bakery_taste_test',
    sectionType: 'bakery',
    title: 'Morning Taste Test',
    description: 'Aria needs a reliable taste tester for her new honey glazed pastries. Help sample the morning batch!',
    requiredTrait: 'Expert Taste Tester',
    duration: 3 * 60 * 1000, // 3 minutes
    position: { x: 25, y: 55 }, // Left side, lower area
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
  {
    questId: 'bakery_temperature_check',
    sectionType: 'bakery',
    title: 'Oven Watch Duty',
    description: 'The ovens need constant monitoring to ensure perfect baking temperatures. Can you help keep an eye on things?',
    requiredTrait: 'Temperature Detective',
    duration: 3 * 60 * 1000, // 3 minutes
    position: { x: 70, y: 60 }, // Right side, mid-lower area
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
  {
    questId: 'bakery_cookie_art',
    sectionType: 'bakery',
    title: 'Cookie Decorating',
    description: 'Time to decorate today\'s special cookies! Aria needs an artistic paw to make them extra special.',
    requiredTrait: 'Cookie Artist',
    duration: 3 * 60 * 1000, // 3 minutes
    position: { x: 50, y: 35 }, // Center, upper-mid area
    baseRewards: {
      coins: 60,
      npcBondXP: 12,
      freeGachaCurrency: 1
    },
    rarityMultipliers: {
      '3-star': 1.0,
      '4-star': 1.5,
      '5-star': 2.0
    }
  }
];

export const PLAYGROUND_QUESTS: Quest[] = [
  {
    questId: 'playground_welcome',
    sectionType: 'playground',
    title: 'Greeter Duty',
    description: 'Kai needs someone to welcome new visitors and make them feel at home. Show them the playground spirit!',
    requiredTrait: 'Welcome Committee',
    duration: 3 * 60 * 1000,
    position: { x: 30, y: 50 },
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
  {
    questId: 'playground_game_invention',
    sectionType: 'playground',
    title: 'New Game Creation',
    description: 'Help Kai come up with exciting new games to keep everyone entertained!',
    requiredTrait: 'Game Inventor',
    duration: 3 * 60 * 1000,
    position: { x: 65, y: 55 },
    baseRewards: {
      coins: 60,
      npcBondXP: 12,
      freeGachaCurrency: 1
    },
    rarityMultipliers: {
      '3-star': 1.0,
      '4-star': 1.5,
      '5-star': 2.0
    }
  },
  {
    questId: 'playground_determination',
    sectionType: 'playground',
    title: 'Obstacle Course',
    description: 'The playground obstacle course needs a determined leader to show others how it\'s done!',
    requiredTrait: 'Determination Master',
    duration: 3 * 60 * 1000,
    position: { x: 48, y: 30 },
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
  }
];

export const SALON_QUESTS: Quest[] = [
  {
    questId: 'salon_fashion_assist',
    sectionType: 'salon',
    title: 'Fashion Consultation',
    description: 'Elias needs a style-savvy assistant to help clients choose the perfect look.',
    requiredTrait: 'Fashion Assistant',
    duration: 3 * 60 * 1000,
    position: { x: 35, y: 50 },
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
  {
    questId: 'salon_royal_judge',
    sectionType: 'salon',
    title: 'Quality Inspection',
    description: 'Only the most discerning eye can judge if each styling is truly salon-worthy.',
    requiredTrait: 'Royal Judge',
    duration: 3 * 60 * 1000,
    position: { x: 68, y: 48 },
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
  {
    questId: 'salon_beauty_teaching',
    sectionType: 'salon',
    title: 'Beauty Workshop',
    description: 'Teach other pets the art of maintaining their beautiful appearance with Elias\'s techniques.',
    requiredTrait: 'Beauty Teacher',
    duration: 3 * 60 * 1000,
    position: { x: 52, y: 33 },
    baseRewards: {
      coins: 60,
      npcBondXP: 12,
      freeGachaCurrency: 1
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

