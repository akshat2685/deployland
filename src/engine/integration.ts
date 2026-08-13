export const CHANGE_IDS = ['NOVA', 'KAI', 'MIRA'] as const;
export type ChangeId = (typeof CHANGE_IDS)[number];
export type IntegrationState = { routed: ChangeId[]; outcome: 'idle' | 'running' | 'success' | 'failure'; tick: number; incident?: string };
export type IntegrationAction = { type: 'ROUTE_CHANGE'; change: ChangeId } | { type: 'RUN' } | { type: 'TICK' } | { type: 'RESET' };

export const emptyIntegrationState = (): IntegrationState => ({ routed: [], outcome: 'idle', tick: 0 });

export const integrationReducer = (state: IntegrationState, action: IntegrationAction): IntegrationState => {
  switch (action.type) {
    case 'RESET': return emptyIntegrationState();
    case 'ROUTE_CHANGE': return state.outcome === 'idle' && !state.routed.includes(action.change) ? { ...state, routed: [...state.routed, action.change] } : state;
    case 'RUN': return state.routed.length === CHANGE_IDS.length ? { ...state, outcome: 'running', tick: 0, incident: undefined } : { ...state, outcome: 'failure', incident: 'MERGE CONFLICT: every incoming change must join the shared verification line.' };
    case 'TICK': return state.outcome !== 'running' ? state : state.tick >= CHANGE_IDS.length - 1 ? { ...state, tick: state.tick + 1, outcome: 'success' } : { ...state, tick: state.tick + 1 };
  }
};
