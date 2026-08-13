import { describe, expect, it } from 'vitest';
import { createSequenceState, sequenceReducer } from './sequence';

const order = ['SOURCE', 'BUILD', 'TEST'] as const;

describe('sequenceReducer', () => {
  it('completes only after the configured order is placed', () => {
    let state = createSequenceState(order);
    order.forEach((item) => { state = sequenceReducer(state, { type: 'PLACE_ITEM', item }); });
    expect(state.outcome).toBe('success');
    expect(state.placed).toEqual(order);
  });

  it('records the precise misconception-revealing mistake', () => {
    let state = createSequenceState(order);
    state = sequenceReducer(state, { type: 'PLACE_ITEM', item: 'SOURCE' });
    state = sequenceReducer(state, { type: 'PLACE_ITEM', item: 'TEST' });
    expect(state.outcome).toBe('failure');
    expect(state.mistake).toEqual({ expected: 'BUILD', received: 'TEST', position: 1 });
  });

  it('resets deterministically and rejects duplicate placements', () => {
    let state = createSequenceState(order);
    state = sequenceReducer(state, { type: 'PLACE_ITEM', item: 'SOURCE' });
    expect(sequenceReducer(state, { type: 'PLACE_ITEM', item: 'SOURCE' })).toEqual(state);
    state = sequenceReducer(state, { type: 'RESET' });
    expect(state).toEqual(createSequenceState(order));
  });
});
