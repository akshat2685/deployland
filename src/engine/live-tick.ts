export type LiveTickOutcome = 'running' | 'success' | 'failure';

export interface LiveTickState {
  tick: number;
  targetTick: number;
  outcome: LiveTickOutcome;
}

export type LiveTickAction = { type: 'TICK' } | { type: 'RESET' };

export const createLiveTickState = (targetTick: number): LiveTickState => ({
  tick: 0,
  targetTick,
  outcome: 'running',
});

export const liveTickReducer = (state: LiveTickState, action: LiveTickAction): LiveTickState => {
  switch (action.type) {
    case 'RESET':
      return createLiveTickState(state.targetTick);
    case 'TICK': {
      if (state.outcome !== 'running') return state;
      const nextTick = state.tick + 1;
      if (nextTick >= state.targetTick) {
        return { ...state, tick: nextTick, outcome: 'success' };
      }
      return { ...state, tick: nextTick };
    }
    default:
      return state;
  }
};
