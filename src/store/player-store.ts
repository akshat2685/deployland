import { create } from 'zustand';
import { syncManager } from './syncManager';

export type PlayerState = {
  xp: number;
  completedLevels: string[];
  badges: string[];
  unlocks: string[];
  entitlements: string[]; // Active course IDs
  attempts: Record<string, number>; // levelId -> attempt count
  completeLevel: (id: string, reward: { xp: number; badge?: string; unlocks: string[] }) => void;
  grantEntitlement: (courseId: string) => void;
  loadProgress: (xp: number, completedLevels: string[], badges: string[], unlocks: string[], entitlements: string[], attempts?: Record<string, number>) => void;
  completeLevelMemory: (id: string, reward: { xp: number; badge?: string; unlocks: string[] }) => void;
  recordAttempt: (id: string) => void;
  resetProgress: () => void;
};

export const usePlayerStore = create<PlayerState>()((set) => ({
  xp: 0,
  completedLevels: [],
  badges: [],
  unlocks: [],
  entitlements: [],
  attempts: {},
  grantEntitlement: (courseId) => set((player) => ({
    entitlements: [...new Set([...player.entitlements, courseId])]
  })),
  loadProgress: (xp, completedLevels, badges, unlocks, entitlements, attempts = {}) => set({
    xp, completedLevels, badges, unlocks, entitlements, attempts
  }),
  completeLevelMemory: (id, reward) => set((player) => {
    if (player.completedLevels.includes(id)) return player;
    return {
      xp: player.xp + reward.xp,
      completedLevels: [...player.completedLevels, id],
      badges: reward.badge && !player.badges.includes(reward.badge) ? [...player.badges, reward.badge] : player.badges,
      unlocks: [...new Set([...player.unlocks, ...reward.unlocks])]
    };
  }),
  recordAttempt: (id) => set((player) => ({
    attempts: { ...player.attempts, [id]: (player.attempts[id] || 0) + 1 }
  })),
  resetProgress: () => set({ xp: 0, completedLevels: [], badges: [], unlocks: [], attempts: {} }),
  completeLevel: (id, reward) => {
    // Rely on syncManager to handle the persistence and state update
    syncManager.recordCompletion('cicd', id, reward);
  }
}));
