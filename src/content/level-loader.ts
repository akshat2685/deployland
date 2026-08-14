import level01Config from './cicd-level-01.json';
import level02Config from './cicd-level-02.json';
import level03Config from './cicd-level-03.json';
import level04Config from './cicd-level-04.json';
import level05Config from './cicd-level-05.json';
import level06Config from './cicd-level-06.json';
import level07Config from './cicd-level-07.json';
import level08Config from './cicd-level-08.json';
import level09Config from './cicd-level-09.json';
import level10Config from './cicd-level-10.json';
import { validateLevel } from '../engine/level-validation';
import type { Level } from '../engine/types';

const configs: unknown[] = [level01Config, level02Config, level03Config, level04Config, level05Config, level06Config, level07Config, level08Config, level09Config, level10Config];

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
