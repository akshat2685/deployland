import { describe, expect, it } from 'vitest';
import { canAccess, verifyCompletion } from './authorization';
import { level01 } from '../content/level-01';
import { STAGES, type SimAction } from './types';

const completionActions = (): SimAction[] => [
  ...STAGES.map((id, index) => ({ type: 'PLACE_NODE' as const, node: { id, x: index * 100, y: 0 } })),
  ...STAGES.slice(0, -1).map((from, index) => ({ type: 'CONNECT' as const, from, to: STAGES[index + 1] })),
  { type: 'RUN_PIPELINE' as const },
  ...STAGES.map(() => ({ type: 'TICK' as const })),
];

describe('access and completion verification', () => {
  it('keeps free levels accessible and gates paid course content by entitlement', () => {
    expect(canAccess(level01, [])).toBe(true);
    const paidLevel = { ...level01, tier: 'paid' as const };
    expect(canAccess(paidLevel, [])).toBe(false);
    expect(canAccess(paidLevel, [{ courseId: 'cicd', grantedAt: '2026-08-13T00:00:00.000Z', source: 'purchase' }])).toBe(true);
  });

  it('replays the action log rather than trusting a client success claim', () => {
    expect(verifyCompletion(level01, completionActions()).accepted).toBe(true);
    expect(verifyCompletion(level01, [{ type: 'RUN_PIPELINE' }]).accepted).toBe(false);
  });
});
