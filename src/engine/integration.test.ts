import { describe, expect, it } from 'vitest';
import { CHANGE_IDS, emptyIntegrationState, integrationReducer } from './integration';

describe('integrationReducer', () => {
  it('requires all incoming changes to use the shared verification line', () => {
    const result = integrationReducer(emptyIntegrationState(), { type: 'RUN' });
    expect(result.outcome).toBe('failure');
  });

  it('integrates all routed changes deterministically', () => {
    let state = emptyIntegrationState();
    CHANGE_IDS.forEach((change) => { state = integrationReducer(state, { type: 'ROUTE_CHANGE', change }); });
    state = integrationReducer(state, { type: 'RUN' });
    CHANGE_IDS.forEach(() => { state = integrationReducer(state, { type: 'TICK' }); });
    expect(state.outcome).toBe('success');
  });
});
