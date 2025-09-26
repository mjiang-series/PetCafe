export function formatUnlockTooltip(missing: string[]): string {
  if (!missing.length) return '';
  return `Unlock requirement: ${missing.join(', ')}`;
}
