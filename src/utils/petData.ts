import { Pet } from '../models/Pet';
import petsData from '../data/pets.json';
import { getAssetPath } from './assetPaths';

// Cache for quick lookups
const petCache = new Map<string, Pet>();

// Initialize cache with transformed paths
petsData.pets.forEach(pet => {
  // Transform asset paths to ensure they work in subdirectories
  const transformedPet = {
    ...pet,
    artRefs: {
      ...pet.artRefs,
      portrait: pet.artRefs.portrait,  // Keep as-is, will be transformed on use
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
        showcase: getAssetPath(pet.artRefs.showcase)
      }
    };
  }
  return pet;
}

export function getAllPets(): Pet[] {
  // Return all pets with transformed paths
  return petsData.pets.map(pet => ({
    ...pet,
    artRefs: {
      ...pet.artRefs,
      portrait: getAssetPath(pet.artRefs.portrait),
      showcase: getAssetPath(pet.artRefs.showcase)
    }
  }));
}

export function getPetsByRarity(rarity: string): Pet[] {
  return petsData.pets
    .filter(pet => pet.rarity === rarity)
    .map(pet => ({
      ...pet,
      artRefs: {
        ...pet.artRefs,
        portrait: getAssetPath(pet.artRefs.portrait),
        showcase: getAssetPath(pet.artRefs.showcase)
      }
    }));
}
