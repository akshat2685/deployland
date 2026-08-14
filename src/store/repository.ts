export type SyncStatus = 'SYNCED' | 'SYNCING' | 'OFFLINE' | 'SYNC_ERROR';

export interface UserProfile {
  userId: string;
  displayName: string;
  engineerId: string;
  createdAt: number;
  updatedAt: number;
}

export interface MissionProgress {
  userId: string;
  courseId: string;
  levelId: string;
  completed: boolean;
  xpAwarded: number;
  firstCompletedAt: number;
  lastCompletedAt: number;
  attemptCount: number;
  unlockedLevels: string[];
}

export interface CourseProgress {
  userId: string;
  courseId: string;
  totalXp: number;
  completedLevels: string[];
  unlockedLevels: string[];
  badges: string[];
  restoration: number;
  lastPlayedAt: number;
}

export interface Entitlement {
  id: string;
  userId: string;
  courseId: string;
  productId: string;
  type: 'lifetime';
  status: 'active' | 'revoked';
  grantedAt: number;
}

export interface Purchase {
  id: string;
  userId: string;
  productId: string;
  provider: 'stripe';
  providerOrderId: string;
  providerPaymentId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'successful' | 'failed' | 'refunded';
  createdAt: number;
  completedAt?: number;
}

export interface IProgressRepository {
  getMissionProgress(userId: string, courseId: string, levelId: string): Promise<MissionProgress | null>;
  saveMissionProgress(progress: MissionProgress): Promise<void>;
  
  getCourseProgress(userId: string, courseId: string): Promise<CourseProgress | null>;
  saveCourseProgress(progress: CourseProgress): Promise<void>;
  
  getAllCourseProgress(userId: string, courseId: string): Promise<MissionProgress[]>;
  saveAllCourseProgress(progress: MissionProgress[]): Promise<void>;

  getUserProfile(userId: string): Promise<UserProfile | null>;
  saveUserProfile(profile: UserProfile): Promise<void>;
  
  getEntitlements(userId: string): Promise<Entitlement[]>;
}

export interface ISyncManager {
  sync(): Promise<void>;
  getStatus(): SyncStatus;
  subscribe(listener: (status: SyncStatus) => void): () => void;
}
