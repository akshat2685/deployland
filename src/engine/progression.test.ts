import { describe, expect, it } from 'vitest';
import { getLevel, levels } from '../content/level-loader';
import { getUnlockedLevelIds, calculateProductionPercentage, rankForXp } from './progression';

describe('progression', () => {
  it('uses the planned rank thresholds', () => {
    expect(rankForXp(0).name).toBe('JUNIOR OPERATOR');
    expect(rankForXp(500).name).toBe('PIPELINE TECHNICIAN');
    expect(rankForXp(8000).name).toBe('PLATFORM ENGINEER');
  });

  it('opens the next campaign mission after its predecessor is completed', () => {
    const level01 = levels[0];
    const level02 = levels[1];
    
    // Level 1 should always be unlocked
    const initialUnlocked = getUnlockedLevelIds(levels, []);
    expect(initialUnlocked.has(level01.id)).toBe(true);
    expect(initialUnlocked.has(level02.id)).toBe(false);
    
    // Level 2 should unlock when Level 1 is completed
    const progressUnlocked = getUnlockedLevelIds(levels, [level01.id]);
    expect(progressUnlocked.has(level02.id)).toBe(true);
    expect(progressUnlocked.has(level01.id)).toBe(true); // completed levels stay unlocked
  });

  it('calculates production percentage from campaign progress', () => {
    expect(calculateProductionPercentage(levels, [])).toBe(0);
    
    const level01 = levels[0];
    const level02 = levels[1];
    
    // 10% per level according to JSON config
    expect(calculateProductionPercentage(levels, [level01.id])).toBe(10);
    expect(calculateProductionPercentage(levels, [level01.id, level02.id])).toBe(20);
    
    // Maxes out at 100
    const allIds = levels.map(l => l.id);
    expect(calculateProductionPercentage(levels, allIds)).toBe(100);
  });
});
