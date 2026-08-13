export const STAGES = ['SOURCE', 'BUILD', 'TEST', 'PACKAGE', 'DEPLOY'] as const;

export type StageId = (typeof STAGES)[number];
export type Archetype = 'GRAPH_BUILD' | 'SEQUENCE' | 'TRIAGE' | 'ALLOCATE' | 'CLASSIFY' | 'LIVE_TICK';
export type NodeStatus = 'idle' | 'active' | 'passed' | 'failed';

export interface BoardNode {
  id: StageId;
  x: number;
  y: number;
}

export interface SimState {
  nodes: BoardNode[];
  edges: Array<[StageId, StageId]>;
  status: Record<StageId, NodeStatus>;
  runIndex: number;
  outcome: 'idle' | 'running' | 'success' | 'failure';
  incident?: string;
}

export type SimAction =
  | { type: 'PLACE_NODE'; node: BoardNode }
  | { type: 'MOVE_NODE'; id: StageId; x: number; y: number }
  | { type: 'CONNECT'; from: StageId; to: StageId }
  | { type: 'REMOVE_NODE'; id: StageId }
  | { type: 'RUN_PIPELINE' }
  | { type: 'TICK' }
  | { type: 'RESET_RUN' };

export interface DialogueBeat {
  speaker: string;
  text: string;
}

export interface Level {
  id: string;
  courseId: string;
  index: number;
  tier: 'free' | 'paid';
  archetype: Archetype;
  narrative: { intro: DialogueBeat[]; success: DialogueBeat[]; failure: DialogueBeat[] };
  targetMisconception: string;
  initialState: SimState;
  palette: StageId[];
  rules: string[];
  win: string[];
  fail: string[];
  scoring: { reliability: number; speed: number; cost: number; security: number };
  rewards: { xp: number; unlocks: string[]; badge?: string };
  engineerMode: { artifact: string; language: 'yaml' | 'hcl' | 'bash'; annotation: Array<{ line: number; text: string }> };
}
