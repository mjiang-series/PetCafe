/**
 * Asset path utilities for consistent asset loading
 * All paths are relative to the public directory (assets/)
 */

// Get the base URL from the current page location
// This ensures assets work correctly even when deployed to subdirectories
function getBaseUrl(): string {
  // In production, use the base tag if it exists, otherwise use current location
  const baseTag = document.querySelector('base');
  if (baseTag && baseTag.href) {
    return baseTag.href;
  }
  
  // Get the path to the current HTML file
  const currentPath = window.location.pathname;
  const basePath = currentPath.substring(0, currentPath.lastIndexOf('/') + 1);
  return window.location.origin + basePath;
}

/**
 * Get the full path for an asset
 * @param relativePath Path relative to the assets directory
 * @returns Full path that works in both dev and production
 */
export function getAssetPath(relativePath: string): string {
  // Remove leading slash if present
  const cleanPath = relativePath.startsWith('/') ? relativePath.slice(1) : relativePath;
  
  // In development with Vite dev server, paths are served from root
  if (import.meta.env.DEV) {
    return `/${cleanPath}`;
  }
  
  // In production, paths should be relative to maintain portability
  // This works correctly whether served from root or subdirectory
  return cleanPath;
}

// Specific asset path helpers
export const AssetPaths = {
  // Pet portraits
  petPortrait: (petId: string) => getAssetPath(`art/pets/${petId}_portrait.png`),
  petPlaceholder: () => getAssetPath('art/pets/placeholder_pet.svg'),
  
  // Scene backgrounds
  sceneBackground: (sceneName: string) => getAssetPath(`art/scenes/${sceneName}.png`),
  scenePlaceholder: (sectionType: 'bakery' | 'playground' | 'salon') => {
    const mapping = {
      'bakery': 'bakery_placeholder',
      'playground': 'playground_placeholder',
      'salon': 'salon_placeholder'
    };
    return getAssetPath(`art/scenes/${mapping[sectionType]}.png`);
  },
  
  // NPC assets
  npcPortrait: (npcId: string, expression?: string) => {
    const filename = expression ? `${npcId}_${expression}` : `${npcId}_portrait`;
    return getAssetPath(`art/npc/${npcId}/${filename}.webp`);
  },
  npcPlaceholder: (npcId: string) => getAssetPath(`art/npc/${npcId}/placeholder_portrait.svg`),
  
  // UI assets
  logo: () => getAssetPath('art/love_pets_logo_transparent.png'),
  gachaBanner: () => getAssetPath('art/ui/gacha_banner.svg'),
  uiIcon: (iconName: string) => getAssetPath(`art/ui/${iconName}.svg`),
  
  // Default/fallback assets
  defaultScene: () => getAssetPath('art/scenes/default.svg'),
  defaultMemoryImage: () => getAssetPath('memories/default.jpg')
};

// Re-export for convenience
export default AssetPaths;
