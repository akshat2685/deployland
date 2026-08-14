import { describe, expect, it } from 'vitest';
import { createGraphBuildState, graphBuildReducer } from './graph-build';

describe('graphBuildReducer', () => {
  const nodes = [
    { id: 'SOURCE', type: 'REPO', description: '' },
    { id: 'BUILD', type: 'COMPUTE', description: '' },
    { id: 'TEST', type: 'VERIFICATION', description: '' }
  ];
  const required = [
    { from: 'SOURCE', to: 'BUILD' },
    { from: 'BUILD', to: 'TEST' }
  ];
  const forbidden = [
    { from: 'SOURCE', to: 'TEST' }
  ];

  const initialState = () => createGraphBuildState(nodes, required, forbidden);

  it('succeeds when all required paths are present and no forbidden', () => {
    let state = initialState();
    state = graphBuildReducer(state, { type: 'ADD_EDGE', from: 'SOURCE', to: 'BUILD' });
    state = graphBuildReducer(state, { type: 'ADD_EDGE', from: 'BUILD', to: 'TEST' });
    state = graphBuildReducer(state, { type: 'EVALUATE' });
    expect(state.outcome).toBe('success');
  });

  it('fails if required path is missing', () => {
    let state = initialState();
    state = graphBuildReducer(state, { type: 'ADD_EDGE', from: 'SOURCE', to: 'BUILD' });
    state = graphBuildReducer(state, { type: 'EVALUATE' });
    expect(state.outcome).toBe('failure');
    expect(state.incident).toContain('MISSING DEPENDENCY');
  });

  it('fails if forbidden path is present', () => {
    let state = initialState();
    state = graphBuildReducer(state, { type: 'ADD_EDGE', from: 'SOURCE', to: 'BUILD' });
    state = graphBuildReducer(state, { type: 'ADD_EDGE', from: 'BUILD', to: 'TEST' });
    state = graphBuildReducer(state, { type: 'ADD_EDGE', from: 'SOURCE', to: 'TEST' });
    state = graphBuildReducer(state, { type: 'EVALUATE' });
    expect(state.outcome).toBe('failure');
    expect(state.incident).toContain('INVALID DEPENDENCY');
  });

  describe('Level 10: Production Incident (Required Nodes)', () => {
    const level10State = () => createGraphBuildState(
      nodes,
      [], // requiredPaths
      [], // forbiddenPaths
      ['BUILD', 'TEST'] // requiredNodes
    );

    it('missing required node fails evaluation', () => {
      let state = level10State();
      state = graphBuildReducer(state, { type: 'PLACE_NODE', nodeId: 'BUILD' });
      // MISSING 'TEST'
      state = graphBuildReducer(state, { type: 'EVALUATE' });
      expect(state.outcome).toBe('failure');
      expect(state.incident).toContain('Required component missing');
    });

    it('required node included succeeds', () => {
      let state = level10State();
      state = graphBuildReducer(state, { type: 'PLACE_NODE', nodeId: 'BUILD' });
      state = graphBuildReducer(state, { type: 'PLACE_NODE', nodeId: 'TEST' });
      state = graphBuildReducer(state, { type: 'EVALUATE' });
      expect(state.outcome).toBe('success');
    });
  });
});
