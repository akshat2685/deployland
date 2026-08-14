export const STAGES = [
  'SOURCE', 'BUILD', 'TEST', 'ARTIFACT', 'PACKAGE', 'DEPLOY', 
  'DEPS', 'COMPILE', 'STAGING', 'PROD', 'DATABASE', 'CACHE',
  'MAIN_BRANCH', 'FEATURE_BRANCH', 'MERGE_GATE', 'TEST_SUITE'
] as const;

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
  initialState: any; // Updated to support SimState, TriageState, AllocateState, ClassifyState, etc.
  palette: StageId[];
  rules: string[];
  win: string[];
  fail: string[];
  scoring: { reliability: number; speed: number; cost: number; security: number };
  rewards: { xp: number; unlocks: string[]; badge?: string };
  engineerMode: { 
    concept?: string;
    whatYouDid?: string;
    realWorld?: string;
    artifact: string; 
    language: string;
    annotation?: Array<{ line: number; text: string }>;
    keyTakeaways?: string[];
  };
  world?: {
    district: string;
    restoration: number;
  };
  unlocksNext?: string[];
}
