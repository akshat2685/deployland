import level01Config from './cicd-level-01.json';
import level02Config from './cicd-level-02.json';
import { validateLevel } from '../engine/level-validation';
import type { Level } from '../engine/types';

const configs: unknown[] = [level01Config, level02Config];

export const levels: Level[] = configs.map((config) => {
  const result = validateLevel(config);
  if (!result.valid) throw new Error(`Invalid level content: ${result.errors.join(' ')}`);
  return result.level;
});

export const getLevel = (id: string): Level => {
  const level = levels.find((item) => item.id === id);
  if (!level) throw new Error(`Unknown level: ${id}`);
  return level;
};
