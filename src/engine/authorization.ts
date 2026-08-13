import { simulationReducer } from './reducer';
import type { Level, SimAction, SimState } from './types';

export type Entitlement = { courseId: string; grantedAt: string; source: 'purchase' | 'admin' | 'founder' };

export const canAccess = (level: Pick<Level, 'tier' | 'courseId'>, entitlements: readonly Entitlement[]): boolean =>
  level.tier === 'free' || entitlements.some((entitlement) => entitlement.courseId === level.courseId);

export type CompletionVerification = { accepted: true; finalState: SimState } | { accepted: false; reason: string; finalState: SimState };

export const verifyCompletion = (level: Level, actions: readonly SimAction[]): CompletionVerification => {
  const finalState = actions.reduce(simulationReducer, level.initialState);
  if (finalState.outcome !== 'success') return { accepted: false, reason: 'Simulation did not reach a valid completion state.', finalState };
  return { accepted: true, finalState };
};
