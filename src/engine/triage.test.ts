import { describe, expect, it } from 'vitest';
import { createTriageState, triageReducer } from './triage';

describe('triageReducer', () => {
  it('allows investigating clues', () => {
    let state = createTriageState('db-conn');
    state = triageReducer(state, { type: 'INVESTIGATE_CLUE', clueId: 'log-1' });
    expect(state.discoveredClues).toContain('log-1');
  });

  it('succeeds on correct root cause selection', () => {
    let state = createTriageState('db-conn');
    state = triageReducer(state, { type: 'SELECT_ROOT_CAUSE', rootCauseId: 'db-conn' });
    expect(state.outcome).toBe('success');
  });

  it('fails on incorrect root cause selection', () => {
    let state = createTriageState('db-conn');
    state = triageReducer(state, { type: 'SELECT_ROOT_CAUSE', rootCauseId: 'dns-error' });
    expect(state.outcome).toBe('failure');
  });

  describe('Level 6: Staging Gate (Environment Drift)', () => {
    const level6State = () => createTriageState('env_drift_db', 
      [
        { id: 'dev-env', title: 'DEV', content: 'DB_VERSION: 14.1' },
        { id: 'prod-env', title: 'PROD', content: 'DB_VERSION: 12.4' }
      ],
      [
        { id: 'code_regression', title: 'Code Regression' },
        { id: 'env_drift_db', title: 'DB Drift' }
      ]
    );

    it('correct environment drift diagnosis succeeds', () => {
      let state = level6State();
      // Evidence discovery is deterministic
      state = triageReducer(state, { type: 'INVESTIGATE_CLUE', clueId: 'dev-env' });
      state = triageReducer(state, { type: 'INVESTIGATE_CLUE', clueId: 'prod-env' });
      expect(state.discoveredClues).toEqual(['dev-env', 'prod-env']);
      
      // Select correct cause
      state = triageReducer(state, { type: 'SELECT_ROOT_CAUSE', rootCauseId: 'env_drift_db' });
      expect(state.outcome).toBe('success');
    });

    it('incorrect diagnosis fails', () => {
      let state = level6State();
      state = triageReducer(state, { type: 'SELECT_ROOT_CAUSE', rootCauseId: 'code_regression' });
      expect(state.outcome).toBe('failure');
    });
  });
});
