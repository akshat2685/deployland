export type TargetId = string;
export type AllocateOutcome = 'idle' | 'success' | 'failure';

export interface Target {
  id: TargetId;
  allocation: number;
  maxCapacity: number;
  cpu: number;
  latency: number;
  errorRate: number;
  health: 'healthy' | 'degraded' | 'critical';
}

export interface AllocateState {
  targets: Record<TargetId, Target>;
  totalBudget: number;
  expectedTotalAllocation: number;
  requiredAllocations?: Record<TargetId, number>;
  timeLimit?: number;
  outcome: AllocateOutcome;
  incident?: string;
  tick: number;
}

export type AllocateAction =
  | { type: 'UPDATE_ALLOCATION'; targetId: TargetId; amount: number }
  | { type: 'UPDATE_CAPACITY'; targetId: TargetId; amount: number }
  | { type: 'EVALUATE' }
  | { type: 'TICK' }
  | { type: 'RESET' };

export const createAllocateState = (targets: Omit<Target, 'cpu'|'latency'|'errorRate'|'health'>[], totalBudget: number, expectedTotalAllocation: number, requiredAllocations?: Record<TargetId, number>, timeLimit?: number): AllocateState => ({
  targets: targets.reduce((acc, t) => ({ 
    ...acc, 
    [t.id]: { ...t, cpu: 0, latency: 15, errorRate: 0, health: 'healthy' as const } 
  }), {}),
  totalBudget,
  expectedTotalAllocation,
  requiredAllocations,
  timeLimit,
  outcome: 'idle',
  tick: 0,
});

export const allocateReducer = (state: AllocateState, action: AllocateAction): AllocateState => {
  switch (action.type) {
    case 'RESET':
      return createAllocateState(
        Object.values(state.targets).map(t => ({ id: t.id, allocation: t.id === 'blue' ? 100 : 0, maxCapacity: t.id === 'blue' ? 100 : 20 })), 
        state.totalBudget, 
        state.expectedTotalAllocation,
        state.requiredAllocations,
        state.timeLimit
      );
    case 'UPDATE_ALLOCATION': {
      if (state.outcome !== 'idle' || !state.targets[action.targetId]) return state;
      const newTargets = {
        ...state.targets,
        [action.targetId]: { ...state.targets[action.targetId], allocation: action.amount }
      };
      return { ...state, targets: newTargets };
    }
    case 'UPDATE_CAPACITY': {
      if (state.outcome !== 'idle' || !state.targets[action.targetId]) return state;
      const newTargets = {
        ...state.targets,
        [action.targetId]: { ...state.targets[action.targetId], maxCapacity: action.amount }
      };
      return { ...state, targets: newTargets };
    }
    case 'TICK': {
      if (state.outcome !== 'idle') return state;
      const newTargets = { ...state.targets };
      for (const t of Object.values(newTargets)) {
        const cpu = t.maxCapacity > 0 ? Math.round((t.allocation / t.maxCapacity) * 100) : 0;
        const latency = cpu > 80 ? 15 + (cpu - 80) * 10 : 15;
        const errorRate = cpu > 100 ? Math.min(100, (cpu - 100) * 5) : 0;
        const health = errorRate > 10 ? 'critical' : cpu > 85 ? 'degraded' : 'healthy';
        newTargets[t.id] = { ...t, cpu, latency, errorRate, health };
      }
      const nextTick = state.tick + 1;
      if (state.timeLimit && nextTick >= state.timeLimit) {
        return { ...state, targets: newTargets, tick: nextTick, outcome: 'failure', incident: 'System collapsed before stabilization.' };
      }
      return { ...state, targets: newTargets, tick: nextTick };
    }
    case 'EVALUATE': {
      if (state.outcome !== 'idle') return state;
      const targetsArray = Object.values(state.targets);
      const currentTotal = targetsArray.reduce((sum, t) => sum + t.allocation, 0);
      
      if (currentTotal > state.totalBudget) {
        return { ...state, outcome: 'failure', incident: 'Budget exceeded.' };
      }
      
      const overload = targetsArray.find(t => t.allocation > t.maxCapacity);
      if (overload) {
        return { ...state, outcome: 'failure', incident: `Target ${overload.id} overloaded (exceeded max capacity).` };
      }
      
      if (currentTotal < state.expectedTotalAllocation) {
        return { ...state, outcome: 'failure', incident: 'Insufficient total allocation.' };
      }
      
      if (state.requiredAllocations) {
        for (const [id, req] of Object.entries(state.requiredAllocations)) {
          if (state.targets[id]?.allocation !== req) {
            return { ...state, outcome: 'failure', incident: `Target ${id} allocation does not meet requirement.` };
          }
        }
      }
      
      return { ...state, outcome: 'success' };
    }
    default:
      return state;
  }
};
