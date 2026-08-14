import { supabase } from './supabase';
import { CourseProgress, IProgressRepository, MissionProgress, UserProfile, Entitlement } from './repository';

const isRealCloud = Boolean(
  import.meta.env.VITE_SUPABASE_URL && 
  !import.meta.env.VITE_SUPABASE_URL.includes('mock.supabase.co')
);

export class SupabaseCloudRepository implements IProgressRepository {
  async getMissionProgress(userId: string, courseId: string, levelId: string): Promise<MissionProgress | null> {
    if (!isRealCloud) return null;
    try {
      const { data, error } = await supabase
        .from('mission_progress')
        .select('*')
        .eq('userId', userId)
        .eq('courseId', courseId)
        .eq('levelId', levelId)
        .single();
      
      if (error || !data) return null;
      return data as MissionProgress;
    } catch {
      return null;
    }
  }

  async saveMissionProgress(progress: MissionProgress): Promise<void> {
    if (!isRealCloud) return;
    try {
      await supabase.from('mission_progress').upsert(progress);
    } catch (e) {
      console.warn('Cloud save failed', e);
    }
  }

  async getCourseProgress(userId: string, courseId: string): Promise<CourseProgress | null> {
    if (!isRealCloud) return null;
    try {
      const { data, error } = await supabase
        .from('course_progress')
        .select('*')
        .eq('userId', userId)
        .eq('courseId', courseId)
        .single();
        
      if (error || !data) return null;
      return data as CourseProgress;
    } catch {
      return null;
    }
  }

  async saveCourseProgress(progress: CourseProgress): Promise<void> {
    if (!isRealCloud) return;
    try {
      await supabase.from('course_progress').upsert(progress);
    } catch (e) {
      console.warn('Cloud save failed', e);
    }
  }

  async getAllCourseProgress(userId: string, courseId: string): Promise<MissionProgress[]> {
    if (!isRealCloud) return [];
    try {
      const { data, error } = await supabase
        .from('mission_progress')
        .select('*')
        .eq('userId', userId)
        .eq('courseId', courseId);
        
      if (error || !data) return [];
      return data as MissionProgress[];
    } catch {
      return [];
    }
  }

  async saveAllCourseProgress(progresses: MissionProgress[]): Promise<void> {
    if (!isRealCloud || progresses.length === 0) return;
    try {
      await supabase.from('mission_progress').upsert(progresses);
    } catch (e) {
      console.warn('Cloud save failed', e);
    }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    if (!isRealCloud) return null;
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('userId', userId)
        .single();
        
      if (error || !data) return null;
      return data as UserProfile;
    } catch {
      return null;
    }
  }

  public async saveUserProfile(profile: UserProfile): Promise<void> {
    if (!isRealCloud) return;
    try {
      await supabase.from('user_profiles').upsert(profile);
    } catch (e) {
      console.warn('Cloud save failed', e);
    }
  }

  public async getEntitlements(userId: string): Promise<Entitlement[]> {
    if (!isRealCloud) return [];
    try {
      const { data } = await supabase
        .from('entitlements')
        .select('*')
        .eq('userId', userId)
        .eq('status', 'active');
      return (data || []) as Entitlement[];
    } catch {
      return [];
    }
  }
}
