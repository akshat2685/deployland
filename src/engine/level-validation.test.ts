import { describe, expect, it } from 'vitest';
import level01 from '../content/cicd-level-01.json';
import { validateLevel } from './level-validation';

describe('validateLevel', () => {
  it('accepts the authored Broken Factory configuration', () => {
    expect(validateLevel(level01).valid).toBe(true);
  });

  it('rejects malformed configuration before it reaches React', () => {
    const malformed = { ...level01, archetype: 'MINI_GAME', palette: ['SOURCE', 'LASER'] };
    const result = validateLevel(malformed);
    expect(result.valid).toBe(false);
    if (!result.valid) expect(result.errors).toEqual(expect.arrayContaining(['Level archetype is invalid.', 'Palette contains an unknown machine.']));
  });
});
