import { describe, expect, it } from 'vitest';
import { createLiveTickState, liveTickReducer } from './live-tick';

describe('liveTickReducer', () => {
  it('progresses ticks and completes at target', () => {
    let state = createLiveTickState(2);
    expect(state.outcome).toBe('running');
    state = liveTickReducer(state, { type: 'TICK' });
    expect(state.outcome).toBe('running');
    state = liveTickReducer(state, { type: 'TICK' });
    expect(state.outcome).toBe('success');
  });
});
