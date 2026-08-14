import { useEffect, useReducer, useRef, useState } from 'react';
import { CityCanvas } from '../components/CityCanvas';
import { level01 } from '../content/level-01';
import { simulationReducer } from '../engine/reducer';
import { usePlayerStore } from '../store/player-store';
import type { StageId } from '../engine/types';

const stageGlyph: Record<string, string> = { SOURCE: '01', BUILD: '02', TEST: '03', PACKAGE: '04', DEPLOY: '05', DEPS: '06', COMPILE: '07', STAGING: '08', PROD: '09', ARTIFACT: '10', DATABASE: '11', CACHE: '12', MAIN_BRANCH: '13', FEATURE_BRANCH: '14', MERGE_GATE: '15', TEST_SUITE: '16' };
const nodeColors: Record<string, string> = {
  SOURCE: 'var(--mint)',
  BUILD: 'var(--cyan)',
  TEST: 'var(--amber)',
  PACKAGE: 'var(--cream)',
  DEPLOY: 'var(--alert)',
  DEPS: 'var(--mint)',
  COMPILE: 'var(--amber)',
  STAGING: 'var(--cyan)',
  PROD: 'var(--mint)',
  ARTIFACT: 'var(--cream)',
  DATABASE: 'var(--alert)',
  CACHE: 'var(--amber)',
  MAIN_BRANCH: 'var(--mint)',
  FEATURE_BRANCH: 'var(--cyan)',
  MERGE_GATE: 'var(--amber)',
  TEST_SUITE: 'var(--cream)'
};
const stages: StageId[] = ['SOURCE', 'BUILD', 'TEST', 'PACKAGE', 'DEPLOY'];

export default function App() {
  const [state, dispatch] = useReducer(simulationReducer, level01.initialState);
  const [selected, setSelected] = useState<StageId | null>(null);
  const [connectFrom, setConnectFrom] = useState<StageId | null>(null);
  const [engineerMode, setEngineerMode] = useState(false);
  const boardRef = useRef<HTMLDivElement>(null);
  const awardedRef = useRef(false);
  const xp = usePlayerStore((player) => player.xp);
  const completeLevel = usePlayerStore((player) => player.completeLevel);

  useEffect(() => {
    if (state.outcome !== 'running') return;
    const timer = window.setTimeout(() => dispatch({ type: 'TICK' }), 620);
    return () => window.clearTimeout(timer);
  }, [state.outcome, state.runIndex]);

  useEffect(() => {
    if (state.outcome === 'success' && !awardedRef.current) {
      completeLevel(level01.id, level01.rewards);
      awardedRef.current = true;
    }
    if (state.outcome === 'idle') awardedRef.current = false;
  }, [completeLevel, state.outcome]);

  const placeNode = (stage: StageId, clientX: number, clientY: number) => {
    const bounds = boardRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const x = Math.max(8, Math.min(bounds.width - 116, Math.round((clientX - bounds.left - 52) / 4) * 4));
    const y = Math.max(16, Math.min(bounds.height - 64, Math.round((clientY - bounds.top - 24) / 4) * 4));
    dispatch({ type: 'PLACE_NODE', node: { id: stage, x, y } });
    dispatch({ type: 'MOVE_NODE', id: stage, x, y });
    setSelected(null);
  };

  const nodeClick = (stage: StageId) => {
    if (!connectFrom) { setConnectFrom(stage); return; }
    if (connectFrom !== stage) dispatch({ type: 'CONNECT', from: connectFrom, to: stage });
    setConnectFrom(null);
  };

  const clearBoard = () => {
    stages.forEach((id) => dispatch({ type: 'REMOVE_NODE', id }));
    dispatch({ type: 'RESET_RUN' });
    setConnectFrom(null);
    setSelected(null);
  };

  const message = state.outcome === 'success'
    ? level01.narrative.success[0].text
    : state.outcome === 'failure'
      ? state.incident
      : level01.narrative.intro[0].text;
  const rank = xp >= 500 ? 'PIPELINE TECHNICIAN' : 'JUNIOR OPERATOR';

  return <main className="game-shell">
    <CityCanvas />
    <div className="world-glow" aria-hidden="true" />
    <section className="mission panel">
      <div className="mission-kicker">CI VALLEY // FREE MISSION 01</div>
      <h1>THE BROKEN FACTORY</h1>
      <p>Wire a safe release line. Drag each machine to the board, then click its output in sequence to link the flow.</p>
      <div className={`radio ${state.outcome}`}><b>RADIO // {level01.narrative.intro[0].speaker}</b><span>{message}</span></div>
    </section>

    <section className="workbench">
      <aside className="palette panel">
        <div className="panel-title">MACHINE BAY</div>
        <p>DRAG TO PLACE</p>
        {level01.palette.map((stage) => <button key={stage} draggable className={`machine palette-machine ${selected === stage ? 'selected' : ''}`} onDragStart={(event) => { event.dataTransfer.setData('stage', stage); setSelected(stage); }} onClick={() => setSelected(stage)}>
          <i>{stageGlyph[stage]}</i>{stage}
        </button>)}
        <button className="clear-button" onClick={clearBoard}>CLEAR BOARD</button>
      </aside>

      <div className="board panel" ref={boardRef} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const stage = event.dataTransfer.getData('stage') as StageId; if (stage) placeNode(stage, event.clientX, event.clientY); }} onClick={(event) => { if (event.target === event.currentTarget && selected) placeNode(selected, event.clientX, event.clientY); }}>
        <div className="panel-title">RELEASE WIRING BOARD</div>
        <div className="board-instruction">{connectFrom ? `LINKING FROM ${connectFrom} // SELECT TARGET` : 'CLICK A PLACED MACHINE TO START A LINK'}</div>
        <svg className="wires" aria-hidden="true"><defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L7,3 z" fill="#2de0d0" /></marker></defs>{state.edges.map(([from, to]) => {
          const a = state.nodes.find((node) => node.id === from); const b = state.nodes.find((node) => node.id === to); if (!a || !b) return null;
          return <line key={`${from}-${to}`} x1={a.x + 104} y1={a.y + 28} x2={b.x} y2={b.y + 28} markerEnd="url(#arrow)" />;
        })}</svg>
        {state.nodes.map((node) => <button key={node.id} className={`machine placed ${state.status[node.id]} ${connectFrom === node.id ? 'link-origin' : ''}`} style={{ left: node.x, top: node.y }} onClick={(event) => { event.stopPropagation(); nodeClick(node.id); }}>
          <i>{stageGlyph[node.id]}</i><span>{node.id}</span><em>{state.status[node.id].toUpperCase()}</em>
        </button>)}
        {!state.nodes.length && <div className="empty-board">PLACE MACHINES HERE<br />THEN WIRE A SINGLE RELEASE PATH</div>}
      </div>
    </section>

    <header className="hud panel">
      <div className="brand"><span>DEPLOY</span>LAND <small>YEAR 2147</small></div>
      <div className="hud-readout"><span>RANK</span><strong>{rank}</strong></div>
      <div className="hud-readout"><span>XP</span><strong>{String(xp).padStart(6, '0')}</strong></div>
      <div className="hud-readout uptime"><span>FACTORY</span><strong>{state.outcome === 'success' ? 'ONLINE' : 'REPAIR MODE'}</strong></div>
    </header>

    <footer className="control-deck panel">
      <div className="objective"><span>BREAK THIS BELIEF</span><strong>“{level01.targetMisconception}”</strong></div>
      <button className="lever" disabled={state.outcome === 'running'} onClick={() => { dispatch({ type: 'RESET_RUN' }); window.setTimeout(() => dispatch({ type: 'RUN_PIPELINE' }), 0); }}><b>RUN</b><span>PIPELINE</span></button>
      <button className="terminal-button" onClick={() => setEngineerMode((value) => !value)}>ENGINEER MODE</button>
    </footer>
    {engineerMode && <section className="engineer panel"><button onClick={() => setEngineerMode(false)}>× CLOSE</button><div><span>READ-ONLY ARTIFACT // {level01.engineerMode.language.toUpperCase()}</span><h2>WHAT YOU JUST WIRED</h2><pre>{level01.engineerMode.artifact}</pre></div><aside>{(level01.engineerMode?.annotation || []).map((note) => <p key={note.line}><b>LINE {note.line}</b>{note.text}</p>)}</aside></section>}
  </main>;
}
