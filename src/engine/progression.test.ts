import { describe, expect, it } from 'vitest';
import { getLevel } from '../content/level-loader';
import { isUnlocked, rankForXp } from './progression';

describe('progression', () => {
  it('uses the planned rank thresholds', () => {
    expect(rankForXp(0).name).toBe('JUNIOR OPERATOR');
    expect(rankForXp(500).name).toBe('PIPELINE TECHNICIAN');
    expect(rankForXp(8000).name).toBe('PLATFORM ENGINEER');
  });

  it('opens the next campaign mission after its predecessor is completed', () => {
    const level01 = getLevel('cicd-01-broken-factory');
    const level02 = getLevel('cicd-02-continuous-integration');
    expect(isUnlocked(level01, [])).toBe(true);
    expect(isUnlocked(level02, [])).toBe(false);
    expect(isUnlocked(level02, [level01.id])).toBe(true);
  });
});
