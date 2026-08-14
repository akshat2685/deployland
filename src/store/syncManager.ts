import { IProgressRepository, ISyncManager, SyncStatus, CourseProgress, MissionProgress } from './repository';
import { LocalRepository } from './localRepository';
import { SupabaseCloudRepository } from './cloudRepository';
import { usePlayerStore } from './player-store';

export class SyncManager implements ISyncManager {
  private localRepo: IProgressRepository;
  private cloudRepo: IProgressRepository;
  private status: SyncStatus = 'SYNCED';
  private listeners: ((status: SyncStatus) => void)[] = [];
  
  private currentUserId: string = 'guest';

  constructor() {
    this.localRepo = new LocalRepository();
    this.cloudRepo = new SupabaseCloudRepository();
  }

  public async migrateV1toV2() {
    try {
      const legacyDataStr = localStorage.getItem('deployland-player');
      if (!legacyDataStr) return; // No legacy data or already migrated
      
      const legacyData = JSON.parse(legacyDataStr);
      const state = legacyData?.state;
      if (!state) return;
      
      // We assume legacy data belongs to the guest and the 'cicd' course
      const now = Date.now();
      
      let course = await this.localRepo.getCourseProgress('guest', 'cicd');
      if (!course) {
        course = {
          userId: 'guest',
          courseId: 'cicd',
          totalXp: state.xp || 0,
          completedLevels: state.completedLevels || [],
          unlockedLevels: state.unlocks || [],
          badges: state.badges || [],
          restoration: 0,
          lastPlayedAt: now
        };
        await this.localRepo.saveCourseProgress(course);
        
        // Save dummy mission progress for each completed level so the math works
        for (const levelId of course.completedLevels) {
          await this.localRepo.saveMissionProgress({
            userId: 'guest',
            courseId: 'cicd',
            levelId,
            completed: true,
            xpAwarded: 0, // Prevent double counting
            firstCompletedAt: now,
            lastCompletedAt: now,
            attemptCount: 1,
            unlockedLevels: []
          });
        }
      }
      
      // Mark as migrated so we don't do it again
      localStorage.removeItem('deployland-player');
    } catch (e) {
      console.warn('Migration failed', e);
    }
  }

  public setUserId(userId: string) {
    this.currentUserId = userId;
  }
  
  public getUserId(): string {
    return this.currentUserId;
  }

  public getStatus(): SyncStatus {
    return this.status;
  }

  public subscribe(listener: (status: SyncStatus) => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private setStatus(status: SyncStatus) {
    this.status = status;
    this.listeners.forEach(l => l(status));
  }

  // Load progress into memory store
  public async loadCourseProgress(courseId: string): Promise<void> {
    // 1. Always load local first for immediate UI
    let localCourse = await this.localRepo.getCourseProgress(this.currentUserId, courseId);
    if (!localCourse) {
      localCourse = {
        userId: this.currentUserId,
        courseId,
        totalXp: 0,
        completedLevels: [],
        unlockedLevels: [],
        badges: [],
        restoration: 0,
        lastPlayedAt: Date.now()
      };
    }
    
    // 2. Fetch entitlements if logged in
    let activeCourseEntitlements: string[] = [];
    if (this.currentUserId !== 'guest') {
      try {
        const entitlements = await this.cloudRepo.getEntitlements(this.currentUserId);
        activeCourseEntitlements = entitlements.map(e => e.courseId);
      } catch (err) {
        console.warn('Failed to fetch entitlements');
      }
    }

    // Update Zustand
    usePlayerStore.getState().loadProgress(
      localCourse.totalXp, 
      localCourse.completedLevels, 
      localCourse.badges, 
      localCourse.unlockedLevels,
      activeCourseEntitlements
    );

    // 3. If logged in, trigger a background sync
    if (this.currentUserId !== 'guest') {
      this.syncCourse(courseId).catch(() => this.setStatus('SYNC_ERROR'));
    }
  }

  public async recordCompletion(courseId: string, levelId: string, reward: { xp: number; badge?: string; unlocks: string[] }) {
    // 1. Optimistic memory update
    usePlayerStore.getState().completeLevelMemory(levelId, reward);

    // 2. Save locally
    const now = Date.now();
    let mission = await this.localRepo.getMissionProgress(this.currentUserId, courseId, levelId);
    
    let isFirstCompletion = false;
    if (!mission) {
      isFirstCompletion = true;
      mission = {
        userId: this.currentUserId,
        courseId,
        levelId,
        completed: true,
        xpAwarded: reward.xp,
        firstCompletedAt: now,
        lastCompletedAt: now,
        attemptCount: 1,
        unlockedLevels: reward.unlocks
      };
    } else {
      mission.lastCompletedAt = now;
      mission.attemptCount += 1;
    }
    await this.localRepo.saveMissionProgress(mission);

    // Update local course summary
    let course = await this.localRepo.getCourseProgress(this.currentUserId, courseId);
    if (!course) {
      course = {
        userId: this.currentUserId,
        courseId,
        totalXp: 0,
        completedLevels: [],
        unlockedLevels: [],
        badges: [],
        restoration: 0,
        lastPlayedAt: now
      };
    }
    
    if (isFirstCompletion) {
      course.totalXp += reward.xp;
      course.completedLevels.push(levelId);
      if (reward.badge && !course.badges.includes(reward.badge)) {
        course.badges.push(reward.badge);
      }
      for (const unlock of reward.unlocks) {
        if (!course.unlockedLevels.includes(unlock)) {
          course.unlockedLevels.push(unlock);
        }
      }
    }
    course.lastPlayedAt = now;
    await this.localRepo.saveCourseProgress(course);

    // 3. Sync to cloud if not guest
    if (this.currentUserId !== 'guest') {
      this.setStatus('SYNCING');
      try {
        await this.cloudRepo.saveMissionProgress(mission);
        await this.cloudRepo.saveCourseProgress(course);
        this.setStatus('SYNCED');
      } catch (err) {
        this.setStatus('SYNC_ERROR'); // Offline or failure
      }
    }
  }

  public async sync(): Promise<void> {
    if (this.currentUserId === 'guest') return;
    this.setStatus('SYNCING');
    // Implement full global sync if needed
    this.setStatus('SYNCED');
  }

  public async syncCourse(courseId: string): Promise<void> {
    if (this.currentUserId === 'guest') return;
    this.setStatus('SYNCING');
    try {
      const localCourse = await this.localRepo.getCourseProgress(this.currentUserId, courseId);
      const cloudCourse = await this.cloudRepo.getCourseProgress(this.currentUserId, courseId);
      const localMissions = await this.localRepo.getAllCourseProgress(this.currentUserId, courseId);
      const cloudMissions = await this.cloudRepo.getAllCourseProgress(this.currentUserId, courseId);

      // Merge logic: deterministically combine completions
      const mergedMissionsMap = new Map<string, MissionProgress>();
      for (const m of cloudMissions) mergedMissionsMap.set(m.levelId, m);
      
      for (const m of localMissions) {
        const existing = mergedMissionsMap.get(m.levelId);
        if (!existing) {
          mergedMissionsMap.set(m.levelId, m);
        } else {
          // Keep the earliest completion, longest attempt count
          mergedMissionsMap.set(m.levelId, {
            ...existing,
            firstCompletedAt: Math.min(existing.firstCompletedAt, m.firstCompletedAt),
            lastCompletedAt: Math.max(existing.lastCompletedAt, m.lastCompletedAt),
            attemptCount: Math.max(existing.attemptCount, m.attemptCount)
          });
        }
      }

      const mergedMissions = Array.from(mergedMissionsMap.values());
      
      // Recompute course progress to avoid duplicate XP
      let totalXp = 0;
      const completedLevels = new Set<string>();
      const unlockedLevels = new Set<string>();
      
      for (const m of mergedMissions) {
        if (m.completed) {
          totalXp += m.xpAwarded;
          completedLevels.add(m.levelId);
          m.unlockedLevels.forEach(u => unlockedLevels.add(u));
        }
      }

      const mergedCourse: CourseProgress = {
        userId: this.currentUserId,
        courseId,
        totalXp,
        completedLevels: Array.from(completedLevels),
        unlockedLevels: Array.from(unlockedLevels),
        badges: localCourse?.badges || cloudCourse?.badges || [], // Merge appropriately if needed
        restoration: Math.max(localCourse?.restoration || 0, cloudCourse?.restoration || 0),
        lastPlayedAt: Math.max(localCourse?.lastPlayedAt || 0, cloudCourse?.lastPlayedAt || 0)
      };

      // Save merged results to both
      await this.localRepo.saveAllCourseProgress(mergedMissions);
      await this.localRepo.saveCourseProgress(mergedCourse);
      
      await this.cloudRepo.saveAllCourseProgress(mergedMissions);
      await this.cloudRepo.saveCourseProgress(mergedCourse);

      // Note: entitlements are re-fetched via cloudRepo during syncCourse just to be fresh
      const entitlements = await this.cloudRepo.getEntitlements(this.currentUserId);
      const activeCourseEntitlements = entitlements.map(e => e.courseId);

      // Update memory
      usePlayerStore.getState().loadProgress(
        mergedCourse.totalXp, 
        mergedCourse.completedLevels, 
        mergedCourse.badges, 
        mergedCourse.unlockedLevels,
        activeCourseEntitlements
      );

      this.setStatus('SYNCED');
    } catch (err) {
      this.setStatus('SYNC_ERROR');
    }
  }

  // Called when account is created: merges guest progress into real account
  public async migrateGuestToUser(newUserId: string): Promise<void> {
    const oldUserId = 'guest';
    
    // For every course guest played, we migrate
    const guestCourse = await this.localRepo.getCourseProgress(oldUserId, 'cicd');
    if (guestCourse) {
      const guestMissions = await this.localRepo.getAllCourseProgress(oldUserId, 'cicd');
      
      // Update IDs to the new user ID
      guestCourse.userId = newUserId;
      guestMissions.forEach(m => m.userId = newUserId);

      // Save under new user ID locally
      await this.localRepo.saveCourseProgress(guestCourse);
      await this.localRepo.saveAllCourseProgress(guestMissions);
      
      // Optional: Clear guest data? (Maybe keep it for safety, or clear it to free up space)
    }

    this.currentUserId = newUserId;
    // Perform sync to push local progress to cloud (and merge with any existing cloud progress)
    await this.syncCourse('cicd'); 
  }
}

export const syncManager = new SyncManager();
