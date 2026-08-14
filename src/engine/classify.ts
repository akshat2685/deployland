export type Classification = string;
export type Role = string;

export interface ClassifyItem {
  id: string;
  type: string;
  location: string;
  owner: string;
  description: string;
  metadata?: Record<string, string>;
  correctClassification: Classification;
  correctRoles: Role[];
}

export interface PlayerPolicy {
  classification: Classification | null;
  roles: Role[];
}

export interface ClassifyConfig {
  classifications?: string[];
  roles?: string[];
  labels?: {
    panel1?: string;
    panel2?: string;
    panel3?: string;
    classification?: string;
    roles?: string;
  };
  exactMatch?: boolean;
}

export interface ClassifyState {
  items: Record<string, ClassifyItem>;
  policies: Record<string, PlayerPolicy>;
  config?: ClassifyConfig;
  outcome: 'idle' | 'success' | 'failure';
  incident?: string;
}

export type ClassifyAction =
  | { type: 'SET_CLASSIFICATION'; itemId: string; classification: Classification }
  | { type: 'TOGGLE_ROLE'; itemId: string; role: Role }
  | { type: 'EVALUATE' }
  | { type: 'RESET' };

export const createClassifyState = (init: any): ClassifyState => {
  const items: ClassifyItem[] = Array.isArray(init) ? init : (init.items ? Object.values(init.items) : []);
  const config = !Array.isArray(init) && init.config ? init.config : undefined;

  const stateItems: Record<string, ClassifyItem> = {};
  const policies: Record<string, PlayerPolicy> = {};
  
  items.forEach(i => {
    stateItems[i.id] = i;
    policies[i.id] = { classification: null, roles: [] };
  });

  return {
    items: stateItems,
    policies,
    config,
    outcome: 'idle',
  };
};

export const classifyReducer = (state: ClassifyState, action: ClassifyAction): ClassifyState => {
  switch (action.type) {
    case 'RESET':
      return createClassifyState({ items: state.items, config: state.config });
      
    case 'SET_CLASSIFICATION': {
      if (state.outcome !== 'idle' || !state.items[action.itemId]) return state;
      const policy = state.policies[action.itemId];
      return {
        ...state,
        policies: {
          ...state.policies,
          [action.itemId]: { ...policy, classification: action.classification }
        }
      };
    }
    
    case 'TOGGLE_ROLE': {
      if (state.outcome !== 'idle' || !state.items[action.itemId]) return state;
      const policy = state.policies[action.itemId];
      const hasRole = policy.roles.includes(action.role);
      const newRoles = hasRole 
        ? policy.roles.filter(r => r !== action.role)
        : [...policy.roles, action.role];
        
      return {
        ...state,
        policies: {
          ...state.policies,
          [action.itemId]: { ...policy, roles: newRoles }
        }
      };
    }
    
    case 'EVALUATE': {
      if (state.outcome !== 'idle') return state;
      
      const itemKeys = Object.keys(state.items);
      
      for (const id of itemKeys) {
        const item = state.items[id];
        const policy = state.policies[id];
        
        if (!policy.classification) {
          return { ...state, outcome: 'failure', incident: `Item ${id} has no classification.` };
        }
        
        if (state.config?.exactMatch) {
          if (policy.classification !== item.correctClassification) {
            return { ...state, outcome: 'failure', incident: `POLICY VIOLATION: ${id} cannot be marked ${policy.classification}.` };
          }
        } else {
          // Check Classification Level
          const levels: Record<string, number> = { 'PUBLIC': 0, 'INTERNAL': 1, 'SENSITIVE': 2, 'SECRET': 3 };
          const correctLevel = levels[item.correctClassification] ?? 0;
          const chosenLevel = levels[policy.classification] ?? 0;
          
          if (chosenLevel < correctLevel) {
            return { ...state, outcome: 'failure', incident: `SECURITY POLICY VIOLATION: ${id} classified too broadly. Potential exposure increased.` };
          }
        }
        
        // Check Roles
        const missingRoles = item.correctRoles.filter(r => !policy.roles.includes(r));
        if (missingRoles.length > 0) {
          return { ...state, outcome: 'failure', incident: `OPERATIONAL FAILURE: ${id} requires ${missingRoles[0]} access to function properly.` };
        }
        
        const extraRoles = policy.roles.filter(r => !item.correctRoles.includes(r));
        if (extraRoles.length > 0) {
          return { ...state, outcome: 'failure', incident: `SECURITY POLICY VIOLATION: ${id} grants excessive access to ${extraRoles[0]}. Enforce least privilege.` };
        }
      }
      
      return { ...state, outcome: 'success' };
    }
    
    default:
      return state;
  }
};
