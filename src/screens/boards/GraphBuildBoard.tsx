import React, { useReducer, useEffect, useState, useRef, useLayoutEffect } from 'react';
import type { Level } from '../../engine/types';
import { graphBuildReducer, createGraphBuildState } from '../../engine/graph-build';
import type { ArchetypeBoardProps } from '../MissionShell';
import '../../design/graph-build.css';

// Custom 16-Bit Pixel Machinery Sprites (SVG Vector Sprites)
const MachineSprite = ({ type, isRunning }: { type: string; isRunning: boolean }) => {
  const t = type.toUpperCase();

  if (t.includes('BRANCH') || t.includes('FEATURE') || t.includes('TRUNK')) {
    return (
      <svg width="64" height="48" viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Developer Workstation */}
        <rect x="8" y="14" width="48" height="28" fill="#2c3c54" stroke="#0c1219" strokeWidth="2" />
        <rect x="16" y="6" width="32" height="18" fill="#0d1a14" stroke="#0c1219" strokeWidth="2" />
        {/* Terminal Screen */}
        <text x="20" y="18" fill="#38f858" fontSize="8" fontFamily="monospace">&gt; git_</text>
        {/* Branch Lines */}
        <line x1="14" y1="36" x2="50" y2="36" stroke="#f8d820" strokeWidth="2" strokeDasharray="3 3" />
        <circle cx="20" cy="36" r="3" fill="#38e8f8" />
        <circle cx="44" cy="36" r="3" fill="#38f858" />
      </svg>
    );
  }

  if (t.includes('MERGE') || t.includes('JUNCTION') || t.includes('GATE')) {
    return (
      <svg width="64" height="48" viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Railway Merge Turntable */}
        <rect x="10" y="10" width="44" height="32" fill="#4e627a" stroke="#0c1219" strokeWidth="2" />
        {/* Converging Tracks */}
        <line x1="14" y1="16" x2="32" y2="26" stroke="#f8d820" strokeWidth="3" />
        <line x1="14" y1="36" x2="32" y2="26" stroke="#38e8f8" strokeWidth="3" />
        <line x1="32" y1="26" x2="50" y2="26" stroke="#38f858" strokeWidth="3" />
        <circle cx="32" cy="26" r="5" fill="#141b24" stroke="#0c1219" strokeWidth="2" />
        {/* Active Signal Lamp */}
        <circle cx="46" cy="16" r="3" fill={isRunning ? "#38f858" : "#f8a858"} stroke="#0c1219" strokeWidth="1" />
      </svg>
    );
  }

  if (t.includes('SOURCE') || t.includes('INTAKE')) {
    return (
      <svg width="64" height="48" viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }}>
        {/* Factory Intake Hopper */}
        <rect x="12" y="6" width="40" height="14" fill="#3b68d8" stroke="#0c1219" strokeWidth="2" />
        <rect x="18" y="2" width="28" height="6" fill="#7ca8fc" stroke="#0c1219" strokeWidth="2" />
        {/* Conveyor Bay */}
        <rect x="8" y="20" width="48" height="22" fill="#2c3c54" stroke="#0c1219" strokeWidth="2" />
        {/* Rollers */}
        <circle cx="16" cy="31" r="5" fill="#e2eaf4" stroke="#0c1219" strokeWidth="2" />
        <circle cx="32" cy="31" r="5" fill="#e2eaf4" stroke="#0c1219" strokeWidth="2" />
        <circle cx="48" cy="31" r="5" fill="#e2eaf4" stroke="#0c1219" strokeWidth="2" />
        {/* Indicator Lamp */}
        <rect x="28" y="10" width="8" height="6" fill={isRunning ? "#38f858" : "#f8d820"} stroke="#0c1219" strokeWidth="1" />
      </svg>
    );
  }

  if (t.includes('BUILD') || t.includes('COMPILE')) {
    return (
      <svg width="64" height="48" viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Main Furnace / Compiler Body */}
        <rect x="10" y="12" width="44" height="30" fill="#647d9a" stroke="#0c1219" strokeWidth="2" />
        {/* Exhaust Smokestack */}
        <rect x="16" y="4" width="10" height="10" fill="#37475a" stroke="#0c1219" strokeWidth="2" />
        {/* Gear Wheels */}
        <circle cx="36" cy="26" r="8" fill="#f8a858" stroke="#0c1219" strokeWidth="2" />
        <circle cx="36" cy="26" r="3" fill="#1b242e" />
        <rect x="34" y="16" width="4" height="20" fill="#f8a858" />
        <rect x="26" y="24" width="20" height="4" fill="#f8a858" />
        {/* Spark Glow */}
        {isRunning && (
          <polygon points="46,16 52,18 48,22 56,26 48,28" fill="#ffee38" />
        )}
      </svg>
    );
  }

  if (t.includes('TEST') || t.includes('LINT') || t.includes('SCAN') || t.includes('VERIF')) {
    return (
      <svg width="64" height="48" viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Laboratory Station Casing */}
        <rect x="8" y="10" width="48" height="32" fill="#2c3c54" stroke="#0c1219" strokeWidth="2" />
        {/* Oscilloscope Screen */}
        <rect x="14" y="16" width="24" height="20" fill="#0d1a14" stroke="#0c1219" strokeWidth="2" />
        {/* Waveform Line */}
        <polyline points="16,26 20,26 22,20 26,30 28,26 36,26" fill="none" stroke="#50ff90" strokeWidth="2" />
        {/* Status Sensors */}
        <circle cx="44" cy="20" r="3" fill="#38f858" stroke="#0c1219" strokeWidth="1" />
        <circle cx="44" cy="28" r="3" fill="#f8d820" stroke="#0c1219" strokeWidth="1" />
        <circle cx="44" cy="36" r="3" fill="#ff3030" stroke="#0c1219" strokeWidth="1" />
      </svg>
    );
  }

  if (t.includes('PACKAGE') || t.includes('ARTIFACT') || t.includes('CONTAINER')) {
    return (
      <svg width="64" height="48" viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Cargo Crate */}
        <rect x="12" y="12" width="40" height="30" fill="#8c5224" stroke="#0c1219" strokeWidth="2" />
        {/* Metal Reinforcement Straps */}
        <rect x="12" y="24" width="40" height="6" fill="#adc2d6" stroke="#0c1219" strokeWidth="1" />
        <rect x="28" y="12" width="8" height="30" fill="#adc2d6" stroke="#0c1219" strokeWidth="1" />
        {/* Corner Bolts */}
        <rect x="14" y="14" width="3" height="3" fill="#ffffff" />
        <rect x="47" y="14" width="3" height="3" fill="#ffffff" />
        <rect x="14" y="37" width="3" height="3" fill="#ffffff" />
        <rect x="47" y="37" width="3" height="3" fill="#ffffff" />
      </svg>
    );
  }

  if (t.includes('DATA') || t.includes('CACHE') || t.includes('SQL')) {
    return (
      <svg width="64" height="48" viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Database Cylinder Stack */}
        <ellipse cx="32" cy="14" rx="20" ry="6" fill="#7ca8fc" stroke="#0c1219" strokeWidth="2" />
        <rect x="12" y="14" width="40" height="12" fill="#3b68d8" stroke="#0c1219" strokeWidth="2" />
        <ellipse cx="32" cy="26" rx="20" ry="6" fill="#3b68d8" stroke="#0c1219" strokeWidth="2" />
        <rect x="12" y="26" width="40" height="12" fill="#244498" stroke="#0c1219" strokeWidth="2" />
        <ellipse cx="32" cy="38" rx="20" ry="6" fill="#244498" stroke="#0c1219" strokeWidth="2" />
      </svg>
    );
  }

  // Default: DEPLOY / PRODUCTION LAUNCH TOWER
  return (
    <svg width="64" height="48" viewBox="0 0 64 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Launch Tower Gantry */}
      <rect x="18" y="14" width="28" height="28" fill="#37475a" stroke="#0c1219" strokeWidth="2" />
      {/* Antenna Mast */}
      <rect x="30" y="2" width="4" height="14" fill="#adc2d6" stroke="#0c1219" strokeWidth="1" />
      <circle cx="32" cy="4" r="3" fill="#ff3030" />
      {/* Radio Broadcast Rings */}
      <path d="M24 6 C28 2, 36 2, 40 6" fill="none" stroke="#38e8f8" strokeWidth="2" strokeDasharray="3 3" />
      {/* Server Rack Matrix */}
      <rect x="22" y="22" width="20" height="14" fill="#0c1219" />
      <circle cx="26" cy="26" r="1.5" fill="#38f858" />
      <circle cx="32" cy="26" r="1.5" fill="#38e8f8" />
      <circle cx="38" cy="26" r="1.5" fill="#38f858" />
      <circle cx="26" cy="32" r="1.5" fill="#f8d820" />
      <circle cx="32" cy="32" r="1.5" fill="#38f858" />
      <circle cx="38" cy="32" r="1.5" fill="#38e8f8" />
    </svg>
  );
};

const DEFAULT_MACHINE_SPECS: Record<string, { type: string; description: string }> = {
  SOURCE: { type: 'SOURCE HOPPER', description: 'Fetches code commits and release tags from source repository.' },
  MAIN_BRANCH: { type: 'MAIN TRUNK', description: 'Primary production repository branch.' },
  FEATURE_BRANCH: { type: 'DEV BRANCH', description: 'Active developer feature branch awaiting integration.' },
  MERGE_GATE: { type: 'MERGE JUNCTION', description: 'Integrates branch code and resolves commit conflicts.' },
  TEST_SUITE: { type: 'CI TEST LAB', description: 'Runs automated integration tests against merged code.' },
  BUILD: { type: 'COMPILER FOUNDRY', description: 'Compiles raw source code into deployable binary artifacts.' },
  TEST: { type: 'TESTING LAB', description: 'Runs unit tests, static lints, and integration verification.' },
  PACKAGE: { type: 'ARTIFACT CRATE', description: 'Bundles validated assets into an immutable container image.' },
  DEPLOY: { type: 'LAUNCH TOWER', description: 'Dispatches release bundles to live production environments.' },
  DATABASE: { type: 'SQL DATABASE', description: 'Persistent state storage system (Decoy Component).' },
  CACHE: { type: 'REDIS CACHE', description: 'In-memory fast lookup cache (Decoy Component).' }
};

export default function GraphBuildBoard({ level, onOutcome }: ArchetypeBoardProps) {
  const [state, dispatch] = useReducer(
    graphBuildReducer, 
    level.initialState as any,
    (init: any) => {
      const paletteList = level.palette || ['SOURCE', 'BUILD', 'TEST', 'PACKAGE', 'DEPLOY'];
      const rawNodes = (init.nodes && init.nodes.length > 0) 
        ? init.nodes 
        : paletteList.map(id => ({
            id,
            type: DEFAULT_MACHINE_SPECS[id]?.type || id,
            description: DEFAULT_MACHINE_SPECS[id]?.description || `Automated ${id} pipeline processing machine.`
          }));

      let requiredPaths = init.requiredPaths;
      if (!requiredPaths || requiredPaths.length === 0) {
        requiredPaths = [
          { from: 'SOURCE', to: 'BUILD' },
          { from: 'BUILD', to: 'TEST' },
          { from: 'TEST', to: 'PACKAGE' },
          { from: 'PACKAGE', to: 'DEPLOY' }
        ];
      }

      const forbiddenPaths = init.forbiddenPaths || [
        { from: 'SOURCE', to: 'DEPLOY' },
        { from: 'SOURCE', to: 'PACKAGE' }
      ];

      const requiredNodes = init.requiredNodes;
      const placedNodes = init.placedNodes || ['SOURCE'];

      return createGraphBuildState(rawNodes, requiredPaths, forbiddenPaths, requiredNodes, placedNodes);
    }
  );

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  const [activeStageStep, setActiveStageStep] = useState<number>(-1);

  const floorRef = useRef<HTMLDivElement>(null);
  const [nodePositions, setNodePositions] = useState<Record<string, { x: number; y: number }>>({});

  // Intercept outcome to generate structured failure explanation
  useEffect(() => {
    let finalIncident = state.incident;
    if (state.outcome === 'failure' && state.incident) {
      const initPaths = (level.initialState as any).requiredPaths;
      const correctSteps = initPaths 
        ? initPaths.map((p: any) => `[ ${p.from} ] ══▶ [ ${p.to} ]`).join('\n') 
        : 'Review the required factory dependencies and reconnect the machines.';
      const tryAgainMsg = initPaths ? `The correct sequence is:\n${correctSteps}` : correctSteps;

      if (state.invalidEdge) {
        finalIncident = `WHAT HAPPENED\nYou connected:\n[ ${state.invalidEdge.from} ] ══▶ [ ${state.invalidEdge.to} ]\n\nWHY\n${state.invalidEdge.to} cannot receive release artifacts directly from ${state.invalidEdge.from}.\n\nDEVOPS CONCEPT\n${level.engineerMode.concept || 'Pipeline dependencies must be ordered correctly to prevent unverified changes from reaching production.'}\n\nTRY AGAIN\n${tryAgainMsg}`;
      } else if (state.missingEdge) {
        finalIncident = `WHAT HAPPENED\nYou missed a critical delivery conduit.\n\nWHY\nThe factory floor is missing a connected pathway between ${state.missingEdge.from} and ${state.missingEdge.to}.\n\nDEVOPS CONCEPT\n${level.engineerMode.concept || 'Pipelines must be fully connected from source to delivery.'}\n\nTRY AGAIN\n${tryAgainMsg}`;
      } else if (state.incident.includes('missing')) {
        finalIncident = `WHAT HAPPENED\nA required machine is missing from the factory floor.\n\nWHY\n${state.incident.replace('PIPELINE BLOCKED: ', '')}\n\nDEVOPS CONCEPT\n${level.engineerMode.concept || 'Every required stage in a CI/CD pipeline must be present for a complete deployment.'}\n\nTRY AGAIN\nPlace all required machines onto the factory floor.\n${tryAgainMsg}`;
      }
    }
    onOutcome(state.outcome, finalIncident);
  }, [state.outcome, state.incident, state.invalidEdge, state.missingEdge, level, onOutcome]);

  // Calculate physical node center positions for SVG Pipe rendering
  useLayoutEffect(() => {
    if (!floorRef.current) return;
    const elements = floorRef.current.querySelectorAll('.factory-machine-node');
    const positions: Record<string, { x: number; y: number }> = {};
    const floorRect = floorRef.current.getBoundingClientRect();
    
    elements.forEach(el => {
      const id = el.getAttribute('data-id');
      if (id) {
        const rect = el.getBoundingClientRect();
        positions[id] = {
          x: rect.left - floorRect.left + rect.width / 2,
          y: rect.top - floorRect.top + rect.height / 2
        };
      }
    });
    setNodePositions(positions);
  }, [state.placedNodes, state.edges]);

  const handlePlaceNode = (nodeId: string) => {
    dispatch({ type: 'PLACE_NODE', nodeId });
    setSelectedNodeId(nodeId);
    setConnectingFrom(null);
  };

  const handleStartConnect = (nodeId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (connectingFrom === nodeId) {
      setConnectingFrom(null);
    } else {
      setConnectingFrom(nodeId);
      setSelectedNodeId(nodeId);
    }
  };

  const handleNodeClick = (nodeId: string) => {
    if (connectingFrom) {
      if (connectingFrom !== nodeId) {
        dispatch({ type: 'ADD_EDGE', from: connectingFrom, to: nodeId });
      }
      setConnectingFrom(null);
      setSelectedNodeId(nodeId);
    } else {
      setSelectedNodeId(nodeId);
    }
  };

  const handleRemoveNode = (nodeId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    dispatch({ type: 'REMOVE_NODE', nodeId });
    if (selectedNodeId === nodeId) setSelectedNodeId(null);
    if (connectingFrom === nodeId) setConnectingFrom(null);
  };

  // 1-Click Auto Route Helper
  const handleAutoRoute = () => {
    // Place all available machines
    Object.keys(state.nodes).forEach(id => {
      if (!state.placedNodes.includes(id)) {
        dispatch({ type: 'PLACE_NODE', nodeId: id });
      }
    });
    // Add required paths
    const requiredPaths = (level.initialState as any).requiredPaths || [
      { from: 'SOURCE', to: 'BUILD' },
      { from: 'BUILD', to: 'TEST' },
      { from: 'TEST', to: 'PACKAGE' },
      { from: 'PACKAGE', to: 'DEPLOY' }
    ];
    requiredPaths.forEach((path: any) => {
      dispatch({ type: 'ADD_EDGE', from: path.from, to: path.to });
    });
    setConnectingFrom(null);
  };

  // Reset all conduits
  const handleResetConduits = () => {
    state.edges.forEach(edge => {
      dispatch({ type: 'REMOVE_EDGE', from: edge.from, to: edge.to });
    });
    setConnectingFrom(null);
  };

  const triggerActivatePipeline = () => {
    setIsRunning(true);
    setExecutionLog(['[00] INITIATING RELEASE COMMIT // SHA: #a8f1-master...']);
    setActiveStageStep(0);

    const steps = [
      '[01] SOURCE: Fetching code commit from repository... [OK]',
      '[02] BUILD: Compiling source dependencies and binaries... [OK]',
      '[03] TEST: Running automated test suites... [OK]',
      '[04] PACKAGE: Packaging verified container image... [OK]',
      '[05] DEPLOY: Releasing container into live production... [VERIFIED]'
    ];

    steps.forEach((stepText, idx) => {
      setTimeout(() => {
        setExecutionLog(prev => [...prev, stepText]);
        setActiveStageStep(idx + 1);
      }, (idx + 1) * 350);
    });

    setTimeout(() => {
      dispatch({ type: 'EVALUATE' });
      setIsRunning(false);
      setActiveStageStep(-1);
    }, (steps.length + 1) * 350);
  };

  const unplacedNodes = Object.values(state.nodes).filter(n => !state.placedNodes.includes(n.id));
  const activeSelectedNode = selectedNodeId ? state.nodes[selectedNodeId] : null;

  return (
    <div className="graph-build-game-container">
      {/* Top Interactive Mission Directive & Explanation Banner */}
      <div className="mission-directive-banner">
        <div className="directive-header">
          <div className="directive-title">
            <span className="directive-icon">🎯</span>
            <strong>DIRECTIVE:</strong> {level.win[0] || 'Build an automated continuous delivery release pipeline.'}
          </div>
          <div className="directive-tools">
            <button className="pixel-button small gold" onClick={handleAutoRoute} title="Auto-place and connect recommended stages">
              ⚡ AUTO-WIRE ALL
            </button>
            {state.edges.length > 0 && (
              <button className="pixel-button small red" onClick={handleResetConduits} title="Clear all pipes">
                ↺ CLEAR PIPES
              </button>
            )}
          </div>
        </div>

        <div className="directive-steps-row">
          <div className={`directive-step-badge ${state.placedNodes.length > 1 ? 'done' : 'active'}`}>
            <span className="step-num">1</span>
            <span>PLACE MACHINES</span>
          </div>
          <div className="step-arrow">➔</div>
          <div className={`directive-step-badge ${state.edges.length >= 3 ? 'done' : state.placedNodes.length > 1 ? 'active' : ''}`}>
            <span className="step-num">2</span>
            <span>CONNECT CONDUITS</span>
          </div>
          <div className="step-arrow">➔</div>
          <div className={`directive-step-badge ${state.edges.length >= 3 ? 'active' : ''}`}>
            <span className="step-num">3</span>
            <span>RUN PIPELINE</span>
          </div>
        </div>

        {connectingFrom && (
          <div className="active-wiring-prompt">
            <span>⚡ WIRING IN PROGRESS: <strong>[ {connectingFrom} ]</strong> ══▶ Click any target machine to weld conduit!</span>
            <button className="pixel-button small" onClick={() => setConnectingFrom(null)}>CANCEL</button>
          </div>
        )}
      </div>

      {/* Upper Factory Floor (Machines + Animated Pipe SVG) */}
      <div className="factory-floor-viewport" ref={floorRef}>
        <div className="factory-girders" />
        <div className="factory-pipes-bg" />

        {/* SVG Conduits Layer */}
        <svg className="factory-conduits-svg">
          {state.edges.map((edge) => {
            const fromPos = nodePositions[edge.from];
            const toPos = nodePositions[edge.to];
            if (!fromPos || !toPos) return null;

            const midY = fromPos.y + (toPos.y - fromPos.y) / 2;
            const path = `M ${fromPos.x} ${fromPos.y + 36} L ${fromPos.x} ${midY} L ${toPos.x} ${midY} L ${toPos.x} ${toPos.y - 36}`;
            
            const isInvalid = state.invalidEdge?.from === edge.from && state.invalidEdge?.to === edge.to;
            const conduitClass = isInvalid 
              ? 'conduit-invalid' 
              : isRunning 
                ? 'conduit-active' 
                : '';

            return (
              <g key={`${edge.from}-${edge.to}`} className={conduitClass}>
                <path className="conduit-shadow" d={path} />
                <path className="conduit-pipe" d={path} />
                <path className="conduit-core" d={path} />
              </g>
            );
          })}
        </svg>

        {/* Assembly Line Placed Machines */}
        <div className="factory-assembly-line">
          {state.placedNodes.map((nodeId, idx) => {
            const node = state.nodes[nodeId];
            const isSelected = selectedNodeId === nodeId;
            const isConnecting = connectingFrom === nodeId;
            const isTargetHint = connectingFrom !== null && connectingFrom !== nodeId;
            const hasOutgoingEdge = state.edges.some(e => e.from === nodeId);
            const isStepActive = isRunning && activeStageStep === idx + 1;

            return (
              <div
                key={nodeId}
                data-id={nodeId}
                className={`factory-machine-node ${isSelected ? 'selected' : ''} ${isConnecting ? 'connecting-source' : ''} ${isTargetHint ? 'connecting-target-hint' : ''} ${isStepActive ? 'node-running' : ''}`}
                onClick={() => handleNodeClick(nodeId)}
                aria-label={`Select ${nodeId}`}
              >
                {/* Port Connectors */}
                <div className="machine-port top" />
                <div className="machine-port bottom" />

                {/* Status Indicator Lamp */}
                <div className={`machine-status-lamp ${isStepActive ? 'green' : hasOutgoingEdge ? 'green' : isConnecting ? 'yellow' : 'yellow'}`} />

                {/* Remove Node Button */}
                {nodeId !== 'SOURCE' && nodeId !== 'MAIN_BRANCH' && (
                  <button
                    className="machine-remove-btn"
                    onClick={(e) => handleRemoveNode(nodeId, e)}
                    aria-label={`Remove ${nodeId} from factory floor`}
                    title="Remove Machine"
                  >
                    ×
                  </button>
                )}

                {/* Illustrated Pixel-Art Sprite */}
                <div className="machine-sprite-container">
                  <MachineSprite type={node?.type || nodeId} isRunning={isRunning} />
                </div>

                {/* Metal Nameplate */}
                <div className="machine-nameplate">{nodeId}</div>

                {/* Direct 1-Click Connect Button on Node */}
                <div className="machine-quick-action">
                  {isConnecting ? (
                    <button 
                      className="node-connect-btn cancel"
                      onClick={(e) => { e.stopPropagation(); setConnectingFrom(null); }}
                    >
                      CANCEL
                    </button>
                  ) : isTargetHint ? (
                    <button 
                      className="node-connect-btn target"
                      onClick={(e) => { e.stopPropagation(); handleNodeClick(nodeId); }}
                    >
                      ◀ WIRE HERE
                    </button>
                  ) : (
                    <button 
                      className="node-connect-btn"
                      aria-label={`Connect ${nodeId} to another machine`}
                      onClick={(e) => handleStartConnect(nodeId, e)}
                    >
                      {hasOutgoingEdge ? '══▶ RE-WIRE' : '══▶ CONNECT'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Execution Console Overlay when Activated */}
        {isRunning && (
          <div className="factory-execution-terminal">
            <div className="terminal-log-header">
              <span className="pixel-lamp green" />
              <span>LIVE PIPELINE EXECUTION TERMINAL</span>
            </div>
            <div className="terminal-log-content">
              {executionLog.map((log, i) => (
                <div key={i} className="log-line">{log}</div>
              ))}
            </div>
          </div>
        )}

        {/* In-World Machine Inspector Toast */}
        {activeSelectedNode && !isRunning && (
          <div className="factory-inspector-toast">
            <div className="inspector-title">
              MACHINE: {activeSelectedNode.id}
            </div>
            <div className="inspector-type">[{activeSelectedNode.type}]</div>
            <div className="inspector-text">{activeSelectedNode.description}</div>
          </div>
        )}
      </div>

      {/* Lower Control Deck (Machine Depot + Run Pipeline Button) */}
      <div className="factory-control-deck">
        <div className="machine-depot">
          <div className="depot-label">
            <span>MACHINE DEPOT</span>
            <span style={{ fontSize: '10px', color: 'var(--ui-paper-warm)' }}>CLICK TO PLACE ON FLOOR</span>
          </div>

          <div className="depot-slots">
            {unplacedNodes.length === 0 ? (
              <div style={{ fontStyle: 'italic', fontSize: '13px', color: 'var(--energy-success-green)', fontFamily: 'var(--font-game-clean)' }}>
                ✓ All available stages deployed to factory floor.
              </div>
            ) : (
              unplacedNodes.map(node => (
                <button
                  key={node.id}
                  className="depot-card"
                  onClick={() => handlePlaceNode(node.id)}
                  aria-label={`Place ${node.id}`}
                >
                  <MachineSprite type={node.type || node.id} isRunning={false} />
                  <span className="depot-card-name">+ {node.id}</span>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Large Physical Pipeline Run Switch */}
        <button
          className={`activate-pipeline-button ${isRunning ? 'running' : ''}`}
          onClick={triggerActivatePipeline}
          disabled={state.outcome !== 'idle' || isRunning}
        >
          <span>⚡</span>
          {isRunning ? 'EXECUTING PIPELINE...' : 'ACTIVATE PIPELINE'}
        </button>
      </div>
    </div>
  );
}
