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

export const isUnlocked = (level: Level, completedLevelIds: readonly string[]) =>
  level.index === 1 || completedLevelIds.some((id) => id === level.id) || completedLevelIds.length >= level.index - 1;
