export type SequenceOutcome = 'idle' | 'success' | 'failure';

export type SequenceState<T extends string> = {
  expected: readonly T[];
  placed: T[];
  outcome: SequenceOutcome;
  mistake?: { expected: T; received: T; position: number };
};

export type SequenceAction<T extends string> =
  | { type: 'PLACE_ITEM'; item: T }
  | { type: 'REMOVE_LAST' }
  | { type: 'RESET' };

export const createSequenceState = <T extends string>(expected: readonly T[]): SequenceState<T> => ({
  expected,
  placed: [],
  outcome: 'idle',
});

export const sequenceReducer = <T extends string>(state: SequenceState<T>, action: SequenceAction<T>): SequenceState<T> => {
  switch (action.type) {
    case 'RESET': return createSequenceState(state.expected);
    case 'REMOVE_LAST':
      if (state.outcome !== 'idle') return state;
      return { ...state, placed: state.placed.slice(0, -1) };
    case 'PLACE_ITEM': {
      if (state.outcome !== 'idle' || state.placed.includes(action.item)) return state;
      const position = state.placed.length;
      const expected = state.expected[position];
      const placed = [...state.placed, action.item];
      if (expected !== action.item) return { ...state, placed, outcome: 'failure', mistake: { expected, received: action.item, position } };
      return placed.length === state.expected.length ? { ...state, placed, outcome: 'success' } : { ...state, placed };
    }
  }
};
