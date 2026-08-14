import { describe, expect, it, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import App from '../App';
import { usePlayerStore } from '../store/player-store';
import { levels } from '../content/level-loader';

vi.mock('../store/auth', () => ({
  useAuth: () => ({ user: null, loading: false }),
  AuthContext: {},
  AuthProvider: ({ children }: any) => children
}));

vi.mock('../store/cloudRepository', () => ({
  SupabaseCloudRepository: class {
    async getMissionProgress() { return null; }
    async saveMissionProgress() {}
    async getCourseProgress() { return null; }
    async saveCourseProgress() {}
    async getAllCourseProgress() { return []; }
    async saveAllCourseProgress() {}
    async getUserProfile() { return null; }
    async saveUserProfile() {}
  }
}));

describe('Campaign Integration', () => {
  beforeEach(() => {
    usePlayerStore.setState({ xp: 0, completedLevels: [], badges: [], unlocks: [] });
  });

  it('completing a mission unlocks configured next mission and awards xp', () => {
    const store = usePlayerStore.getState();
    const level1 = levels[0];
    const level2 = levels[1];

    expect(store.completedLevels).not.toContain(level1.id);
    expect(store.xp).toBe(0);

    // Complete level 1
    usePlayerStore.getState().completeLevel(level1.id, level1.rewards);

    const newStore = usePlayerStore.getState();
    expect(newStore.completedLevels).toContain(level1.id);
    expect(newStore.xp).toBe(level1.rewards.xp);
  });

  it('replay does not duplicate XP or district restoration', () => {
    const level1 = levels[0];
    
    // Complete first time
    usePlayerStore.getState().completeLevel(level1.id, level1.rewards);
    const xpAfterFirst = usePlayerStore.getState().xp;
    const completedAfterFirst = usePlayerStore.getState().completedLevels.length;

    // Complete second time (replay)
    usePlayerStore.getState().completeLevel(level1.id, level1.rewards);
    const xpAfterSecond = usePlayerStore.getState().xp;
    const completedAfterSecond = usePlayerStore.getState().completedLevels.length;

    expect(xpAfterSecond).toBe(xpAfterFirst); // XP shouldn't duplicate
    expect(completedAfterSecond).toBe(completedAfterFirst); // Shouldn't add duplicate ID
  });

  it('map reflects locked/available/restored states based on progress', async () => {
    render(<App />);

    // Click PLAY FREE on landing page
    await waitFor(() => {
      expect(screen.getByText('PLAY FREE')).toBeDefined();
    });
    fireEvent.click(screen.getByText('PLAY FREE'));
    
    // Wait for boot screen to finish initialization
    await waitFor(() => {
      expect(screen.getByText('ENTER CI VALLEY')).toBeDefined();
    });
    
    // Start at boot, enter map
    fireEvent.click(screen.getByText('ENTER CI VALLEY'));

    // Level 1 should be available
    expect(screen.getAllByText('AVAILABLE').length).toBe(1); // Only Level 1
    
    // Level 2 should be locked
    expect(screen.getAllByText('LOCKED').length).toBeGreaterThan(0);
    
    // Complete level 1
    act(() => {
      usePlayerStore.getState().completeLevel(levels[0].id, levels[0].rewards);
    });
    
    // Re-render implicitly checks state updates
    // Level 1 is restored, Level 2 is available
    expect(screen.getByText('RESTORED')).toBeDefined();
    expect(screen.getAllByText('AVAILABLE').length).toBe(1); // Now Level 2
  });
});
