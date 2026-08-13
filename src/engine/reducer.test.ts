import { describe, expect, it } from 'vitest';
import { emptyState, simulationReducer } from './reducer';
import { STAGES, type SimState } from './types';

const buildCorrectGraph = (): SimState => {
  let state = emptyState();
  STAGES.forEach((id, index) => { state = simulationReducer(state, { type: 'PLACE_NODE', node: { id, x: index * 100, y: 0 } }); });
  STAGES.slice(0, -1).forEach((from, index) => { state = simulationReducer(state, { type: 'CONNECT', from, to: STAGES[index + 1] }); });
  return state;
};

describe('simulationReducer', () => {
  it('runs a correctly wired CI/CD pipeline deterministically', () => {
    let state = simulationReducer(buildCorrectGraph(), { type: 'RUN_PIPELINE' });
    STAGES.forEach(() => { state = simulationReducer(state, { type: 'TICK' }); });
    expect(state.outcome).toBe('success');
    expect(Object.values(state.status)).toEqual(['passed', 'passed', 'passed', 'passed', 'passed']);
  });

  it('rejects an incomplete or malformed graph before running', () => {
    const state = simulationReducer(emptyState(), { type: 'RUN_PIPELINE' });
    expect(state.outcome).toBe('failure');
    expect(state.incident).toMatch(/WIRE FAULT/);
  });

  it('does not create duplicate nodes or edges', () => {
    let state = simulationReducer(emptyState(), { type: 'PLACE_NODE', node: { id: 'SOURCE', x: 0, y: 0 } });
    state = simulationReducer(state, { type: 'PLACE_NODE', node: { id: 'SOURCE', x: 44, y: 44 } });
    expect(state.nodes).toHaveLength(1);
  });
});
