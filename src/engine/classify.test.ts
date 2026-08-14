import { describe, expect, it } from 'vitest';
import { createClassifyState, classifyReducer } from './classify';

describe('classifyReducer', () => {
  const initialState = () => createClassifyState([
    { 
      id: 'DB_PASS', 
      type: 'CRED', location: 'ENV', owner: 'OPS', description: 'desc', 
      correctClassification: 'SECRET', 
      correctRoles: ['OPS'] 
    }
  ]);

  it('succeeds when classification and roles are correct', () => {
    let state = initialState();
    state = classifyReducer(state, { type: 'SET_CLASSIFICATION', itemId: 'DB_PASS', classification: 'SECRET' });
    state = classifyReducer(state, { type: 'TOGGLE_ROLE', itemId: 'DB_PASS', role: 'OPS' });
    state = classifyReducer(state, { type: 'EVALUATE' });
    expect(state.outcome).toBe('success');
  });

  it('fails when classification is too broad', () => {
    let state = initialState();
    state = classifyReducer(state, { type: 'SET_CLASSIFICATION', itemId: 'DB_PASS', classification: 'PUBLIC' });
    state = classifyReducer(state, { type: 'TOGGLE_ROLE', itemId: 'DB_PASS', role: 'OPS' });
    state = classifyReducer(state, { type: 'EVALUATE' });
    expect(state.outcome).toBe('failure');
  });

  it('fails when roles are too broad', () => {
    let state = initialState();
    state = classifyReducer(state, { type: 'SET_CLASSIFICATION', itemId: 'DB_PASS', classification: 'SECRET' });
    state = classifyReducer(state, { type: 'TOGGLE_ROLE', itemId: 'DB_PASS', role: 'OPS' });
    state = classifyReducer(state, { type: 'TOGGLE_ROLE', itemId: 'DB_PASS', role: 'DEV' }); // Extra role
    state = classifyReducer(state, { type: 'EVALUATE' });
    expect(state.outcome).toBe('failure');
  });

  it('fails when roles are missing', () => {
    let state = initialState();
    state = classifyReducer(state, { type: 'SET_CLASSIFICATION', itemId: 'DB_PASS', classification: 'SECRET' });
    // MISSING OPS ROLE
    state = classifyReducer(state, { type: 'EVALUATE' });
    expect(state.outcome).toBe('failure');
  });

  describe('Artifact Classification (Exact Match)', () => {
    const artifactState = () => createClassifyState({
      config: { exactMatch: true },
      items: {
        'unsafe': { 
          id: 'unsafe', type: 'Container', location: 'reg', owner: 'CI', description: 'desc',
          metadata: { TAG: 'latest', SIGNATURE: 'NONE' },
          correctClassification: 'DEV_ONLY', correctRoles: []
        },
        'safe': {
          id: 'safe', type: 'Container', location: 'reg', owner: 'CI', description: 'desc',
          metadata: { TAG: 'v1.0', SIGNATURE: 'VERIFIED' },
          correctClassification: 'PROD_READY', correctRoles: ['PROD']
        }
      }
    });

    it('rejects unsafe artifact routed to prod', () => {
      let state = artifactState();
      state = classifyReducer(state, { type: 'SET_CLASSIFICATION', itemId: 'unsafe', classification: 'PROD_READY' });
      state = classifyReducer(state, { type: 'SET_CLASSIFICATION', itemId: 'safe', classification: 'PROD_READY' });
      state = classifyReducer(state, { type: 'TOGGLE_ROLE', itemId: 'safe', role: 'PROD' });
      state = classifyReducer(state, { type: 'EVALUATE' });
      expect(state.outcome).toBe('failure');
      expect(state.incident).toContain('cannot be marked PROD_READY');
    });

    it('accepts safe artifact and correct quarantine', () => {
      let state = artifactState();
      state = classifyReducer(state, { type: 'SET_CLASSIFICATION', itemId: 'unsafe', classification: 'DEV_ONLY' });
      state = classifyReducer(state, { type: 'SET_CLASSIFICATION', itemId: 'safe', classification: 'PROD_READY' });
      state = classifyReducer(state, { type: 'TOGGLE_ROLE', itemId: 'safe', role: 'PROD' });
      state = classifyReducer(state, { type: 'EVALUATE' });
      expect(state.outcome).toBe('success');
    });
  });
});
