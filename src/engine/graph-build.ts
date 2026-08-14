export type NodeId = string;
export type GraphOutcome = 'idle' | 'success' | 'failure';

export interface GraphNode {
  id: NodeId;
  type: string;
  description: string;
}

export interface Edge {
  from: NodeId;
  to: NodeId;
}

export interface GraphBuildState {
  nodes: Record<NodeId, GraphNode>;
  edges: Edge[];
  placedNodes: NodeId[];
  requiredNodes?: NodeId[];
  requiredPaths: Edge[];
  forbiddenPaths: Edge[];
  outcome: GraphOutcome;
  incident?: string;
  invalidEdge?: Edge;
  missingEdge?: Edge;
}

export type GraphAction =
  | { type: 'PLACE_NODE'; nodeId: NodeId }
  | { type: 'REMOVE_NODE'; nodeId: NodeId }
  | { type: 'ADD_EDGE'; from: NodeId; to: NodeId }
  | { type: 'REMOVE_EDGE'; from: NodeId; to: NodeId }
  | { type: 'EVALUATE' }
  | { type: 'RESET' };

export const createGraphBuildState = (nodes: GraphNode[], requiredPaths: Edge[], forbiddenPaths: Edge[], requiredNodes?: NodeId[], placedNodes: NodeId[] = ['SOURCE']): GraphBuildState => {
  const nodeRecord = nodes.reduce((acc, n) => ({ ...acc, [n.id]: n }), {} as Record<NodeId, GraphNode>);
  return {
    nodes: nodeRecord,
    edges: [],
    placedNodes,
    requiredNodes,
    requiredPaths,
    forbiddenPaths,
    outcome: 'idle',
  };
};

export const graphBuildReducer = (state: GraphBuildState, action: GraphAction): GraphBuildState => {
  switch (action.type) {
    case 'RESET':
      return createGraphBuildState(Object.values(state.nodes), state.requiredPaths, state.forbiddenPaths, state.requiredNodes, state.placedNodes.includes('SOURCE') ? ['SOURCE'] : []);

    case 'PLACE_NODE':
      if (state.outcome !== 'idle' || state.placedNodes.includes(action.nodeId)) return state;
      return { ...state, placedNodes: [...state.placedNodes, action.nodeId] };

    case 'REMOVE_NODE':
      if (state.outcome !== 'idle') return state;
      return { 
        ...state, 
        placedNodes: state.placedNodes.filter(id => id !== action.nodeId),
        edges: state.edges.filter(e => e.from !== action.nodeId && e.to !== action.nodeId)
      };
      
    case 'ADD_EDGE': {
      if (state.outcome !== 'idle') return state;
      // Prevent self-loops
      if (action.from === action.to) return state;
      // Must exist in nodes
      if (!state.nodes[action.from] || !state.nodes[action.to]) return state;
      
      const exists = state.edges.some(e => e.from === action.from && e.to === action.to);
      if (exists) return state;
      
      // Enforce tree/DAG basic rules if needed, but for now just add edge
      return { ...state, edges: [...state.edges, { from: action.from, to: action.to }] };
    }
    
    case 'REMOVE_EDGE': {
      if (state.outcome !== 'idle') return state;
      return { ...state, edges: state.edges.filter(e => !(e.from === action.from && e.to === action.to)) };
    }
    
    case 'EVALUATE': {
      if (state.outcome !== 'idle') return state;
      
      if (state.requiredNodes) {
        const missingNode = state.requiredNodes.find(n => !state.placedNodes.includes(n));
        if (missingNode) {
          return { ...state, outcome: 'failure', incident: `PIPELINE BLOCKED: Required component missing on floor (${missingNode}).` };
        }
      }

      const forbidden = state.forbiddenPaths.find(fp => 
        state.edges.some(e => e.from === fp.from && e.to === fp.to)
      );
      if (forbidden) {
        return { 
          ...state, 
          outcome: 'failure', 
          incident: `PIPELINE BLOCKED\n\nINVALID DEPENDENCY\n\n${forbidden.to} cannot receive traffic directly from ${forbidden.from}.`,
          invalidEdge: forbidden
        };
      }
      
      const missing = state.requiredPaths.find(rp => 
        !state.edges.some(e => e.from === rp.from && e.to === rp.to)
      );
      if (missing) {
        return { 
          ...state, 
          outcome: 'failure', 
          incident: `PIPELINE BLOCKED\n\nMISSING DEPENDENCY\n\nRequired path:\n${missing.from} → ${missing.to}`,
          missingEdge: missing
        };
      }
      
      return { ...state, outcome: 'success' };
    }
    
    default:
      return state;
  }
};
