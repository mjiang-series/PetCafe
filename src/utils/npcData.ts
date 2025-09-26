// NPC Data Utilities
import npcData from '../data/npcs.json';
import { NPC } from '../models/NPC';

/**
 * Get NPC data by ID
 */
export function getNPCById(npcId: string): NPC | undefined {
  return npcData.npcs.find(npc => npc.npcId === npcId) as NPC | undefined;
}

/**
 * Get all NPCs
 */
export function getAllNPCs(): NPC[] {
  return npcData.npcs as NPC[];
}

/**
 * Get NPCs by section type
 */
export function getNPCsBySectionType(sectionType: string): NPC[] {
  return npcData.npcs.filter(npc => npc.sectionType === sectionType) as NPC[];
}

/**
 * Get NPC name by ID
 */
export function getNPCNameById(npcId: string): string {
  const npc = getNPCById(npcId);
  return npc?.name || 'Unknown';
}

/**
 * Get NPC portrait by ID
 */
export function getNPCPortraitById(npcId: string): string {
  const npc = getNPCById(npcId);
  return npc?.artRefs.portrait || '';
}