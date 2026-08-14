import { describe, it, expect } from 'vitest';
import { canPlay } from './access-policy';
import { Course } from '../content/course-registry';
import { Level } from './types';

const mockCourse: Course = {
  id: 'cicd',
  name: 'CI VALLEY',
  description: 'Test course',
  price: { inr: 499, usd: 19 },
  freeLevelIds: ['l1', 'l2']
};

const freeLevel: Level = { id: 'l1', tier: 'free' } as any;
const paidLevelInFreeList: Level = { id: 'l2', tier: 'paid' } as any;
const paidLevel: Level = { id: 'l3', tier: 'paid' } as any;

describe('Access Policy', () => {
  it('allows access to free levels regardless of auth or entitlement', () => {
    expect(canPlay(true, [], mockCourse, freeLevel).allowed).toBe(true);
    expect(canPlay(false, [], mockCourse, freeLevel).allowed).toBe(true);
  });

  it('allows access to paid levels that are listed in course freeLevelIds', () => {
    expect(canPlay(true, [], mockCourse, paidLevelInFreeList).allowed).toBe(true);
    expect(canPlay(false, [], mockCourse, paidLevelInFreeList).allowed).toBe(true);
  });

  it('denies access to paid levels for guests with auth_required', () => {
    const result = canPlay(true, [], mockCourse, paidLevel);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('auth_required');
  });

  it('denies access to paid levels for authenticated users without entitlement', () => {
    const result = canPlay(false, [], mockCourse, paidLevel);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('payment_required');
  });

  it('allows access to paid levels for users with course entitlement', () => {
    const result = canPlay(false, ['cicd'], mockCourse, paidLevel);
    expect(result.allowed).toBe(true);
  });

  it('denies access if entitlement is for a different course', () => {
    const result = canPlay(false, ['kubernetes_full'], mockCourse, paidLevel);
    expect(result.allowed).toBe(false);
    expect(result.reason).toBe('payment_required');
  });

  it('automatically grants full campaign clearance to VIP email i.jain.akshat@gmail.com', () => {
    const result = canPlay(false, [], mockCourse, paidLevel, 'i.jain.akshat@gmail.com');
    expect(result.allowed).toBe(true);
  });
});
