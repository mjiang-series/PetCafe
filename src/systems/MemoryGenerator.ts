import { EventSystem } from './EventSystem';
import { GameStateManager } from './GameState';
import { Memory } from '../models/Memory';
import { Shift, SectionType } from '../models/Shift';
import { Pet } from '../models/Pet';
import { AssetPaths } from '../utils/assetPaths';
import { scenes as sceneConfigs } from '../utils/sceneData';
import { getNPCById } from '../utils/npcData';

// Memory templates for different section types
const MEMORY_TEMPLATES: Record<SectionType, string[]> = {
  'bakery': [
    '{pet1} helped taste-test the new cookie recipe. {npc} pretended not to notice.',
    'A customer asked if the pawprint cookies were real. {pet1} demonstrated by stepping in flour.',
    '{pet1} and {pet2} napped in the warm spot near the ovens while {npc} worked.',
    'Someone ordered a "puppuccino" for {pet1}. The whipped cream mustache was adorable.',
    'The morning rush was made sweeter by {pet1}\'s gentle presence near the counter.',
    '{pet1} watched {npc} frost cupcakes with intense concentration.',
    'A child shared their muffin crumbs with {pet1}. {npc} smiled at the sweet moment.',
    '{pet1} discovered that sitting near the display case gets the most attention.',
    'The bakery filled with laughter when {pet1} got a bit of icing on their nose.',
    '{npc} taught {pet1} to "help" by carrying napkins to customers.'
  ],
  'playground': [
    '{pet1} led an impromptu parade around the playground with {npc} cheering.',
    'A game of fetch turned into a comedy show when {pet1} brought back everything BUT the ball.',
    '{pet1} and {pet2} invented a new game that seemed to involve a lot of running in circles.',
    'The agility course proved no match for {pet1}\'s enthusiasm (if not their coordination).',
    '{npc} organized relay races. {pet1} won "Most Enthusiastic Participant".',
    '{pet1} made friends with every child at the playground today. Tail wags all around!',
    'Someone brought bubbles. {pet1} spent an hour trying to catch them all.',
    '{pet1} appointed themselves as playground supervisor, greeting every new arrival.',
    'The sandbox became {pet1}\'s kingdom for the afternoon. {npc} helped build castles.',
    'A spontaneous dance party broke out when {pet1} started spinning in circles.'
  ],
  'salon': [
    '{pet1} sat perfectly still for their grooming session. {npc} was impressed!',
    'A customer asked if {pet1}\'s fur was naturally that soft. {npc} revealed the secret: love.',
    '{pet1} and {pet2} had a spa day complete with gentle brushing and ear massages.',
    'The salon filled with peaceful energy as {pet1} demonstrated perfect relaxation.',
    '{npc} styled {pet1}\'s fur into the most adorable little mohawk.',
    '{pet1} discovered they actually enjoy nail trims when {npc} does them.',
    'Someone complimented {pet1}\'s shiny coat. {npc} beamed with pride.',
    '{pet1} posed for photos after their grooming session like a tiny supermodel.',
    'The blow dryer became {pet1}\'s new favorite thing. Who knew?',
    '{npc} taught {pet1} that grooming time means treat time. Cooperation increased 100%.'
  ]
};

// Mood/emotion variations
const MEMORY_MOODS = [
  'chaotic', 'peaceful', 'hilarious', 'heartwarming', 'surprising',
  'adorable', 'mischievous', 'cozy', 'energetic', 'sleepy'
];

export class MemoryGenerator {
  private eventSystem: EventSystem;
  private gameState: GameStateManager;

  constructor(eventSystem: EventSystem, gameState: GameStateManager) {
    this.eventSystem = eventSystem;
    this.gameState = gameState;
  }

  generateMemory(shift: Shift, assignedPets: Pet[]): Memory {
    const template = this.selectTemplate(shift.sectionType, assignedPets);
    const content = this.fillTemplate(template, assignedPets, shift.helperNpcId);
    const mood = this.selectMood();
    
    const memory: Memory = {
      memoryId: `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      shiftId: shift.shiftId,
      content: content,
      imageUrl: this.generateImageUrl(shift, assignedPets),
      taggedNpcs: [shift.helperNpcId],
      mood: mood,
      likes: 0,
      views: 0,
      isPublished: false,
      createdAt: Date.now(),
      location: this.getSectionName(shift.sectionType),
      petIds: assignedPets.map(p => p.petId)
    };

    this.gameState.addMemory(memory);
    return memory;
  }

  private selectTemplate(sectionType: SectionType, pets: Pet[]): string {
    const templates = MEMORY_TEMPLATES[sectionType] || MEMORY_TEMPLATES['bakery'];
    const ultraRare = pets.find(pet => pet.rarity === 'UltraRare');
    if (ultraRare) {
      return `{pet1} unlocked a rare memory with {npc}. ${templates[Math.floor(Math.random() * templates.length)]}`;
    }
    return templates[Math.floor(Math.random() * templates.length)];
  }

  private fillTemplate(template: string, pets: Pet[], npcId: string): string {
    let filled = template;

    if (pets.length > 0) {
      filled = filled.replace('{pet1}', pets[0].name);
    }
    if (pets.length > 1) {
      filled = filled.replace('{pet2}', pets[1].name);
    } else {
      filled = filled.replace('{pet2}', pets[0]?.name || 'the pet');
    }

    filled = filled.replace('{npc}', this.getNpcName(npcId));
    filled = filled.replace(/{pet\d+}/g, 'another pet');

    const recentPet = this.getRecentPetForNpc(npcId);
    if (recentPet) {
      filled += ` Recently, ${recentPet.petId} joined the team, adding a spark to ${this.getNpcName(npcId)}'s day.`;
    }

    return filled;
  }

  private selectMood(): string {
    return MEMORY_MOODS[Math.floor(Math.random() * MEMORY_MOODS.length)];
  }

  private generateImageUrl(shift: Shift, pets: Pet[]): string {
    const scene = this.findSceneForNpc(shift.helperNpcId);
    if (scene?.background) {
      return scene.background;
    }
    return AssetPaths.scenePlaceholder(shift.sectionType);
  }

  private findSceneForNpc(npcId: string) {
    const state = this.gameState.getState();
    const unlockedScenes = state.unlockedContent.scenes || {};
    const matchingSceneId = Object.keys(unlockedScenes).find(sceneId => sceneId.includes(npcId) && unlockedScenes[sceneId]);
    if (matchingSceneId) {
      const sceneConfig = sceneConfigs.find(scene => scene.sceneId === matchingSceneId);
      if (sceneConfig) {
        return sceneConfig;
      }
    }
    return null;
  }

  private getRecentPetForNpc(npcId: string) {
    const player = this.gameState.getState().player;
    return player.recentPetAcquisitions?.find(record => record.npcId === npcId);
  }

  private getNpcName(npcId: string): string {
    const npc = getNPCById(npcId);
    return npc?.name || npcId;
  }

  private getSectionName(sectionType: SectionType): string {
    const names: Record<SectionType, string> = {
      'bakery': 'Bakery',
      'playground': 'Playground',
      'salon': 'Styling Salon'
    };
    return names[sectionType] || sectionType;
  }

  // Get recent memories that haven't been published yet
  getUnpublishedMemories(): Memory[] {
    const state = this.gameState.getState();
    return (state.player.memories || []).filter(m => !m.isPublished);
  }

  // Mark a memory as published
  publishMemory(memoryId: string, caption?: string): void {
    const state = this.gameState.getState();
    const memory = state.player.memories?.find(m => m.memoryId === memoryId);
    
    if (memory) {
      memory.isPublished = true;
      memory.publishedAt = Date.now();
      if (caption) {
        memory.caption = caption;
      }
      
      // Add to blog posts
      if (!state.player.blogPosts) {
        state.player.blogPosts = [];
      }
      state.player.blogPosts.push(memory);
      
      // Update statistics
      state.player.statistics.totalBlogPosts++;
      
      // Calculate NPC bond points based on tags
      memory.taggedNpcs.forEach(npcId => {
        const bond = state.player.npcBonds[npcId];
        if (bond) {
          bond.bondPoints += 10; // Base points for being tagged
          bond.bondLevel = Math.floor(bond.bondPoints / 100); // Level up every 100 points
        }
      });
      
      this.eventSystem.emit('memory:published', { memory });
    }
  }
}
