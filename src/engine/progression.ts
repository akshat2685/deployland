import type { Level } from './types';

export const ranks = [
  { requiredXp: 0, name: 'JUNIOR OPERATOR' },
  { requiredXp: 500, name: 'PIPELINE TECHNICIAN' },
  { requiredXp: 1500, name: 'BUILD ENGINEER' },
  { requiredXp: 3000, name: 'RELEASE ENGINEER' },
  { requiredXp: 5000, name: 'DEVOPS ENGINEER' },
  { requiredXp: 8000, name: 'PLATFORM ENGINEER' },
] as const;

export const rankForXp = (xp: number) => [...ranks].reverse().find((rank) => xp >= rank.requiredXp) ?? ranks[0];

export const getUnlockedLevelIds = (levels: Level[], completedLevelIds: readonly string[]): Set<string> => {
  const unlocked = new Set<string>();
  if (levels.length > 0) {
    unlocked.add(levels[0].id);
  }
  
  for (const completedId of completedLevelIds) {
    unlocked.add(completedId); // completed missions remain unlocked
    const level = levels.find(l => l.id === completedId);
    if (level && level.unlocksNext) {
      for (const next of level.unlocksNext) {
        unlocked.add(next);
      }
    }
  }
  
  return unlocked;
};

export const calculateProductionPercentage = (levels: Level[], completedLevelIds: readonly string[]): number => {
  const percentage = completedLevelIds.reduce((total, id) => {
    const level = levels.find(l => l.id === id);
    return total + (level?.world?.restoration || 0);
  }, 0);
  return Math.min(100, percentage);
};
