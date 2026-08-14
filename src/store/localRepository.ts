import { IProgressRepository, MissionProgress, CourseProgress, UserProfile, Entitlement } from './repository';

export class LocalRepository implements IProgressRepository {
  private getPrefix(userId: string, courseId?: string) {
    return courseId ? `deployland_v2_${userId}_${courseId}` : `deployland_v2_${userId}`;
  }

  async getMissionProgress(userId: string, courseId: string, levelId: string): Promise<MissionProgress | null> {
    const key = `${this.getPrefix(userId, courseId)}_mission_${levelId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  async saveMissionProgress(progress: MissionProgress): Promise<void> {
    const key = `${this.getPrefix(progress.userId, progress.courseId)}_mission_${progress.levelId}`;
    localStorage.setItem(key, JSON.stringify(progress));
  }

  async getCourseProgress(userId: string, courseId: string): Promise<CourseProgress | null> {
    const key = `${this.getPrefix(userId, courseId)}_course`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  async saveCourseProgress(progress: CourseProgress): Promise<void> {
    const key = `${this.getPrefix(progress.userId, progress.courseId)}_course`;
    localStorage.setItem(key, JSON.stringify(progress));
  }

  async getAllCourseProgress(userId: string, courseId: string): Promise<MissionProgress[]> {
    const prefix = `${this.getPrefix(userId, courseId)}_mission_`;
    const results: MissionProgress[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const data = localStorage.getItem(key);
        if (data) results.push(JSON.parse(data));
      }
    }
    return results;
  }

  async saveAllCourseProgress(progresses: MissionProgress[]): Promise<void> {
    for (const progress of progresses) {
      await this.saveMissionProgress(progress);
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const key = `deployland_v2_profile_${userId}`;
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  }

  public async saveUserProfile(profile: UserProfile): Promise<void> {
    // In a real local repo we might save this, but for now we'll rely on cloud sync
  }

  public async getEntitlements(userId: string): Promise<Entitlement[]> {
    return []; // Guests have no entitlements by default
  }
}
