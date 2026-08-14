import { Course } from '../content/course-registry';
import { Level } from './types';

export type AccessCheckResult = {
  allowed: boolean;
  reason?: 'auth_required' | 'payment_required';
};

export const LIFETIME_VIP_EMAILS = [
  'i.jain.akshat@gmail.com',
  'akshat@deployland.game',
  'admin@deployland.game'
];

export const isLifetimeVip = (email?: string | null): boolean => {
  if (!email) return false;
  return LIFETIME_VIP_EMAILS.some(vip => vip.toLowerCase() === email.trim().toLowerCase());
};

export const canPlay = (
  isGuest: boolean,
  entitlements: string[],
  course: Course,
  level: Level,
  userEmail?: string | null
): AccessCheckResult => {
  if (level.tier === 'free') return { allowed: true };
  if (course.freeLevelIds.includes(level.id)) return { allowed: true };
  
  if (isLifetimeVip(userEmail)) return { allowed: true };
  if (entitlements.includes(course.id)) return { allowed: true };
  
  if (isGuest) return { allowed: false, reason: 'auth_required' };
  return { allowed: false, reason: 'payment_required' };
};
