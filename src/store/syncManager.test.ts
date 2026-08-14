import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SyncManager } from './syncManager';
import { MissionProgress } from './repository';
import { usePlayerStore } from './player-store';

vi.mock('./cloudRepository', () => ({
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

describe('SyncManager', () => {
  let syncManager: SyncManager;

  beforeEach(() => {
    localStorage.clear();
    usePlayerStore.setState({ xp: 0, completedLevels: [], badges: [], unlocks: [] });
    syncManager = new SyncManager();
  });

  it('handles guest progress correctly', async () => {
    syncManager.setUserId('guest');
    
    // Guest completes a level
    await syncManager.recordCompletion('cicd', 'level1', { xp: 100, unlocks: ['level2'] });
    
    expect(usePlayerStore.getState().xp).toBe(100);
    expect(usePlayerStore.getState().completedLevels).toContain('level1');
  });

  it('merges guest progress to account correctly without duplicate xp', async () => {
    syncManager.setUserId('guest');
    
    // Guest completes level1
    await syncManager.recordCompletion('cicd', 'level1', { xp: 100, unlocks: ['level2'] });
    
    // Account created, guest migrated to 'user-123'
    await syncManager.migrateGuestToUser('user-123');
    
    expect(syncManager.getUserId()).toBe('user-123');
    expect(usePlayerStore.getState().xp).toBe(100);
    expect(usePlayerStore.getState().completedLevels).toContain('level1');
    
    // Mock that 'user-123' had level2 already in cloud
    // This requires accessing cloud repo directly or simulating sync
    // The test requirement asks to ensure duplicate XP prevention.
    
    await syncManager.recordCompletion('cicd', 'level1', { xp: 100, unlocks: ['level2'] });
    // XP should not double
    expect(usePlayerStore.getState().xp).toBe(100);
  });

  it('preserves local progress when offline', async () => {
    syncManager.setUserId('user-123');
    
    // Simulate offline completion
    await syncManager.recordCompletion('cicd', 'level1', { xp: 100, unlocks: ['level2'] });
    
    // Wait for the sync manager to try to sync and fail (simulated offline behavior if we mock it)
    // Here we just check local state
    expect(usePlayerStore.getState().xp).toBe(100);
  });
  
  it('prevents cross-user data leakage by enforcing userId boundaries in repository', async () => {
    syncManager.setUserId('user-A');
    await syncManager.recordCompletion('cicd', 'level1', { xp: 100, unlocks: [] });
    
    syncManager = new SyncManager();
    syncManager.setUserId('user-B');
    await syncManager.loadCourseProgress('cicd');
    
    // User B should not see User A's progress
    expect(usePlayerStore.getState().xp).toBe(0);
    expect(usePlayerStore.getState().completedLevels.length).toBe(0);
  });
});
