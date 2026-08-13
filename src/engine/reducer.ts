import { STAGES, type BoardNode, type SimAction, type SimState, type StageId } from './types';

const status = (value: SimState['status'][StageId] = 'idle') =>
  Object.fromEntries(STAGES.map((stage) => [stage, value])) as SimState['status'];

export const emptyState = (): SimState => ({ nodes: [], edges: [], status: status(), runIndex: 0, outcome: 'idle' });

const uniqueNodes = (nodes: BoardNode[], node: BoardNode) =>
  nodes.some(({ id }) => id === node.id) ? nodes : [...nodes, node];

export const orderedPipeline = (state: SimState): StageId[] | undefined => {
  if (state.nodes.length !== STAGES.length || state.edges.length !== STAGES.length - 1) return undefined;
  const incoming = new Map<StageId, number>(STAGES.map((stage) => [stage, 0]));
  const outgoing = new Map<StageId, StageId>();
  for (const [from, to] of state.edges) {
    if (from === to || outgoing.has(from) || !incoming.has(to)) return undefined;
    outgoing.set(from, to);
    incoming.set(to, (incoming.get(to) ?? 0) + 1);
  }
  const roots = STAGES.filter((stage) => incoming.get(stage) === 0);
  if (roots.length !== 1) return undefined;
  const path: StageId[] = [];
  let current: StageId | undefined = roots[0];
  while (current) {
    if (path.includes(current)) return undefined;
    path.push(current);
    current = outgoing.get(current);
  }
  return path.length === STAGES.length ? path : undefined;
};

const fail = (state: SimState, incident: string): SimState => ({
  ...state,
  outcome: 'failure',
  incident,
  status: { ...state.status, [STAGES[Math.min(state.runIndex, STAGES.length - 1)]]: 'failed' },
});

export const simulationReducer = (state: SimState, action: SimAction): SimState => {
  switch (action.type) {
    case 'PLACE_NODE':
      return { ...state, nodes: uniqueNodes(state.nodes, action.node) };
    case 'MOVE_NODE':
      return { ...state, nodes: state.nodes.map((node) => node.id === action.id ? { ...node, x: action.x, y: action.y } : node) };
    case 'REMOVE_NODE':
      return { ...state, nodes: state.nodes.filter((node) => node.id !== action.id), edges: state.edges.filter(([a, b]) => a !== action.id && b !== action.id) };
    case 'CONNECT':
      if (action.from === action.to || !state.nodes.some((node) => node.id === action.from) || !state.nodes.some((node) => node.id === action.to)) return state;
      if (state.edges.some(([from, to]) => from === action.from && to === action.to)) return state;
      return { ...state, edges: [...state.edges, [action.from, action.to]] };
    case 'RUN_PIPELINE': {
      const ordered = orderedPipeline(state);
      if (!ordered) return fail({ ...state, runIndex: 0, status: status() }, 'WIRE FAULT: the factory cannot trace one complete release line.');
      if (ordered.join() !== STAGES.join()) return fail({ ...state, runIndex: 0, status: status() }, `PIPELINE JAM: ${ordered[0]} cannot safely start this release.`);
      return { ...state, outcome: 'running', incident: undefined, runIndex: 0, status: { ...status(), SOURCE: 'active' } };
    }
    case 'TICK': {
      if (state.outcome !== 'running') return state;
      const completed = STAGES[state.runIndex];
      const nextIndex = state.runIndex + 1;
      if (nextIndex === STAGES.length) return { ...state, runIndex: nextIndex, outcome: 'success', status: { ...state.status, [completed]: 'passed' } };
      return { ...state, runIndex: nextIndex, status: { ...state.status, [completed]: 'passed', [STAGES[nextIndex]]: 'active' } };
    }
    case 'RESET_RUN':
      return { ...state, outcome: 'idle', incident: undefined, runIndex: 0, status: status() };
  }
};
