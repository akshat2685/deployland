import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type PlayerState = {
  xp: number;
  completedLevels: string[];
  badges: string[];
  unlocks: string[];
  completeLevel: (id: string, reward: { xp: number; badge?: string; unlocks: string[] }) => void;
};

export const usePlayerStore = create<PlayerState>()(persist((set) => ({
  xp: 0,
  completedLevels: [],
  badges: [],
  unlocks: [],
  completeLevel: (id, reward) => set((player) => {
    if (player.completedLevels.includes(id)) return player;
    return {
      xp: player.xp + reward.xp,
      completedLevels: [...player.completedLevels, id],
      badges: reward.badge ? [...player.badges, reward.badge] : player.badges,
      unlocks: [...new Set([...player.unlocks, ...reward.unlocks])],
    };
  }),
}), { name: 'deployland-player' }));
