export type ClueId = string;
export type RootCauseId = string;
export type TriageOutcome = 'idle' | 'success' | 'failure';

export interface TriageState {
  clues: Array<{ id: ClueId; title: string; content: string }>;
  possibleCauses: Array<{ id: RootCauseId; title: string }>;
  discoveredClues: ClueId[];
  selectedRootCause: RootCauseId | null;
  correctRootCause: RootCauseId;
  outcome: TriageOutcome;
  mistake?: string;
}

export type TriageAction =
  | { type: 'INVESTIGATE_CLUE'; clueId: ClueId }
  | { type: 'SELECT_ROOT_CAUSE'; rootCauseId: RootCauseId }
  | { type: 'RESET' };

export const createTriageState = (correctRootCause: RootCauseId, clues: TriageState['clues'] = [], possibleCauses: TriageState['possibleCauses'] = []): TriageState => ({
  clues,
  possibleCauses,
  discoveredClues: [],
  selectedRootCause: null,
  correctRootCause,
  outcome: 'idle',
});

export const triageReducer = (state: TriageState, action: TriageAction): TriageState => {
  switch (action.type) {
    case 'RESET':
      return createTriageState(state.correctRootCause, state.clues, state.possibleCauses);
    case 'INVESTIGATE_CLUE':
      if (state.outcome !== 'idle' || state.discoveredClues.includes(action.clueId)) return state;
      return { ...state, discoveredClues: [...state.discoveredClues, action.clueId] };
    case 'SELECT_ROOT_CAUSE': {
      if (state.outcome !== 'idle') return state;
      if (action.rootCauseId === state.correctRootCause) {
        return { ...state, selectedRootCause: action.rootCauseId, outcome: 'success' };
      }
      return { 
        ...state, 
        selectedRootCause: action.rootCauseId, 
        outcome: 'failure',
        mistake: `Incorrect diagnosis. The root cause was not ${action.rootCauseId}.`
      };
    }
    default:
      return state;
  }
};
