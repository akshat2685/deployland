import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import App from '../App';
import { usePlayerStore } from '../store/player-store';
import { levels } from '../content/level-loader';
import { syncManager } from '../store/syncManager';
import { courses } from '../content/course-registry';

// Mock dependencies
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
    async getEntitlements() { return []; }
  }
}));

describe('End-to-End Simulation', () => {
  beforeEach(() => {
    localStorage.clear();
    usePlayerStore.setState({ xp: 0, completedLevels: [], badges: [], unlocks: [], entitlements: [] });
    syncManager.setUserId('guest');
  });

  it('Guest can play L1 and L2 but L3 is locked', async () => {
    render(<App />);

    // Skip Landing Page
    await waitFor(() => {
      expect(screen.getByText('PLAY FREE')).toBeDefined();
    });
    fireEvent.click(screen.getByText('PLAY FREE'));

    // Skip Boot screen
    await waitFor(() => {
      expect(screen.getByText('ENTER CI VALLEY')).toBeDefined();
    });
    fireEvent.click(screen.getByText('ENTER CI VALLEY'));

    // Map Screen
    await waitFor(() => {
      const repairBtns = screen.getAllByText('AVAILABLE');
      expect(repairBtns.length).toBeGreaterThan(0);
    });

    // Complete L1 to unlock L2
    usePlayerStore.getState().completeLevel(levels[0].id, levels[0].rewards);
    
    // Complete L2 to unlock L3
    usePlayerStore.getState().completeLevel(levels[1].id, levels[1].rewards);

    await waitFor(() => {
      // L3 should require uplink
      const buttons = screen.getAllByText('UPLINK REQUIRED');
      expect(buttons.length).toBeGreaterThan(0);
    });

    // Clicking Acquire Uplink should show paywall
    fireEvent.click(screen.getAllByText('UPLINK REQUIRED')[0]);
    await waitFor(() => {
      expect(screen.getByText('LOCKED DISTRICT')).toBeDefined();
    });
  });
});
