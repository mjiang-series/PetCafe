import { Pet } from '../models/Pet';
import petsData from '../data/pets.json';
import { getAssetPath } from './assetPaths';

// Cache for quick lookups
const petCache = new Map<string, Pet>();

// Special traits mapping
const SPECIAL_TRAITS: Record<string, string> = {
  // Bakery traits
  'muffin': 'Expert Taste Tester',
  'peanut': 'Temperature Detective',
  'luna': 'Cookie Artist',
  'chip': 'Dough Whisperer',
  'harmony': 'Pastry Perfectionist',
  
  // Playground traits
  'buddy': 'Welcome Committee',
  'patches': 'Safety Scout',
  'turbo': 'Game Master',
  'blaze': 'Adventure Guide',
  'sunny': 'Championship Coordinator',
  
  // Salon traits
  'prince': 'Brushing Pro',
  'whiskers': 'Precision Clipper',
  'iris': 'Spa Specialist',
  'storm': 'Style Icon',
  'rue': 'Makeover Maestro'
};

// Initialize cache with transformed paths
petsData.pets.forEach(pet => {
  // Add transparent portrait path - correct pattern is {petId}_portrait_transparent.png
  const transparentPortrait = pet.artRefs.portrait.replace('_portrait.png', '_portrait_transparent.png');
  
  // Transform asset paths to ensure they work in subdirectories
  const transformedPet = {
    ...pet,
    specialTrait: SPECIAL_TRAITS[pet.petId] || 'Loyal Companion',
    artRefs: {
      ...pet.artRefs,
      portrait: pet.artRefs.portrait,  // Keep as-is, will be transformed on use
      transparentPortrait: transparentPortrait, // Use transparent portrait for map display
      showcase: pet.artRefs.showcase   // Keep as-is, will be transformed on use
    }
  };
  petCache.set(pet.petId, transformedPet);
});

export function getPetById(petId: string): Pet | undefined {
  const pet = petCache.get(petId);
  if (pet && pet.artRefs) {
    // Return pet with properly resolved asset paths
    return {
      ...pet,
      artRefs: {
        ...pet.artRefs,
        portrait: getAssetPath(pet.artRefs.portrait),
        transparentPortrait: pet.artRefs.transparentPortrait ? getAssetPath(pet.artRefs.transparentPortrait) : undefined,
        showcase: getAssetPath(pet.artRefs.showcase)
      }
    };
  }
  return pet;
}

export function getAllPets(): Pet[] {
  // Return all pets with transformed paths
  return Array.from(petCache.values()).map(pet => ({
    ...pet,
    artRefs: {
      ...pet.artRefs,
      portrait: getAssetPath(pet.artRefs.portrait),
      transparentPortrait: pet.artRefs.transparentPortrait ? getAssetPath(pet.artRefs.transparentPortrait) : undefined,
      showcase: getAssetPath(pet.artRefs.showcase)
    }
  }));
}

export function getPetsByRarity(rarity: string): Pet[] {
  return Array.from(petCache.values())
    .filter(pet => pet.rarity === rarity)
    .map(pet => ({
      ...pet,
      artRefs: {
        ...pet.artRefs,
        portrait: getAssetPath(pet.artRefs.portrait),
        transparentPortrait: pet.artRefs.transparentPortrait ? getAssetPath(pet.artRefs.transparentPortrait) : undefined,
        showcase: getAssetPath(pet.artRefs.showcase)
      }
    }));
}
