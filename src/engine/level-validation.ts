import { STAGES, type Level, type StageId } from './types';

const stageSet = new Set<string>(STAGES);

export type LevelValidation = { valid: true; level: Level } | { valid: false; errors: string[] };

export function validateLevel(candidate: unknown): LevelValidation {
  const errors: string[] = [];
  if (!candidate || typeof candidate !== 'object') return { valid: false, errors: ['Level must be an object.'] };
  const level = candidate as Partial<Level>;
  if (!level.id || !level.courseId || typeof level.index !== 'number') errors.push('Level identity is incomplete.');
  if (!['free', 'paid'].includes(level.tier ?? '')) errors.push('Level tier must be free or paid.');
  if (!['GRAPH_BUILD', 'SEQUENCE', 'TRIAGE', 'ALLOCATE', 'CLASSIFY', 'LIVE_TICK'].includes(level.archetype ?? '')) errors.push('Level archetype is invalid.');
  if (!Array.isArray(level.palette) || level.palette.some((stage) => !stageSet.has(stage))) errors.push('Palette contains an unknown machine.');
  if (!level.initialState || typeof level.initialState !== 'object') errors.push('Initial simulation state is malformed.');
  if (!level.narrative?.intro?.length || !level.narrative.success?.length || !level.narrative.failure?.length) errors.push('Narrative must provide intro, success, and failure beats.');
  if (!level.engineerMode?.artifact || !level.engineerMode?.language) errors.push('Engineer Mode artifact is malformed.');
  return errors.length ? { valid: false, errors } : { valid: true, level: level as Level };
}

export function hasStage(value: string): value is StageId {
  return stageSet.has(value);
}
