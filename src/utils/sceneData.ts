import rawScenes from '../data/scenes.json';

export interface SceneDialogue {
  speaker: string;
  text: string;
  emotion?: string;
  portrait?: string;
}

export interface SceneConfig {
  sceneId: string;
  title: string;
  background?: string;
  npcId?: string;
  dialogues: SceneDialogue[];
  rewards?: {
    bond?: { npcId: string; points: number };
  };
}

const scenes: SceneConfig[] = rawScenes.scenes as SceneConfig[];

export { scenes };
