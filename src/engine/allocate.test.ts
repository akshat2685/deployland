import { describe, expect, it } from 'vitest';
import { createAllocateState, allocateReducer } from './allocate';

describe('allocateReducer', () => {
  const initialState = () => createAllocateState([
    { id: 'blue', allocation: 0, maxCapacity: 100 },
    { id: 'green', allocation: 0, maxCapacity: 50 }
  ], 100, 100);

  it('succeeds on valid allocation', () => {
    let state = initialState();
    state = allocateReducer(state, { type: 'UPDATE_ALLOCATION', targetId: 'blue', amount: 50 });
    state = allocateReducer(state, { type: 'UPDATE_ALLOCATION', targetId: 'green', amount: 50 });
    state = allocateReducer(state, { type: 'EVALUATE' });
    expect(state.outcome).toBe('success');
  });

  it('fails on overload', () => {
    let state = initialState();
    state = allocateReducer(state, { type: 'UPDATE_ALLOCATION', targetId: 'green', amount: 60 });
    state = allocateReducer(state, { type: 'UPDATE_ALLOCATION', targetId: 'blue', amount: 40 });
    state = allocateReducer(state, { type: 'EVALUATE' });
    expect(state.outcome).toBe('failure');
    expect(state.incident).toContain('overloaded');
  });

  it('fails on total allocation budget exceeded', () => {
    let state = initialState();
    state = allocateReducer(state, { type: 'UPDATE_ALLOCATION', targetId: 'blue', amount: 100 });
    state = allocateReducer(state, { type: 'UPDATE_ALLOCATION', targetId: 'green', amount: 10 });
    state = allocateReducer(state, { type: 'EVALUATE' });
    expect(state.outcome).toBe('failure');
    expect(state.incident).toContain('Budget exceeded');
  });

  describe('Level 8: Emergency Rollback (Time Limit)', () => {
    const level8State = () => createAllocateState(
      [
        { id: 'blue', allocation: 0, maxCapacity: 10 },
        { id: 'green', allocation: 100, maxCapacity: 10 }
      ],
      100, 100, { blue: 100, green: 0 }, 15
    );

    it('time limit expiration causes failure', () => {
      let state = level8State();
      for (let i = 0; i < 15; i++) {
        state = allocateReducer(state, { type: 'TICK' });
      }
      expect(state.outcome).toBe('failure');
      expect(state.incident).toContain('collapsed');
    });

    it('resolving state before time limit succeeds', () => {
      let state = level8State();
      // Tick a few times
      state = allocateReducer(state, { type: 'TICK' });
      state = allocateReducer(state, { type: 'TICK' });
      
      // Fix state
      state = allocateReducer(state, { type: 'UPDATE_CAPACITY', targetId: 'blue', amount: 100 });
      state = allocateReducer(state, { type: 'UPDATE_ALLOCATION', targetId: 'blue', amount: 100 });
      state = allocateReducer(state, { type: 'UPDATE_ALLOCATION', targetId: 'green', amount: 0 });
      
      // Evaluate before tick 15
      state = allocateReducer(state, { type: 'EVALUATE' });
      expect(state.outcome).toBe('success');
    });
  });
});
