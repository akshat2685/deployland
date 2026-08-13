import { useEffect, useReducer, useRef } from 'react';
import { CityCanvas } from '../components/CityCanvas';
import { getLevel } from '../content/level-loader';
import { CHANGE_IDS, emptyIntegrationState, integrationReducer } from '../engine/integration';
import { usePlayerStore } from '../store/player-store';
import '../design/integration.css';

const level = getLevel('cicd-02-continuous-integration');

export default function IntegrationLevel() {
  const [state, dispatch] = useReducer(integrationReducer, undefined, emptyIntegrationState);
  const completeLevel = usePlayerStore((player) => player.completeLevel);
  const rewarded = useRef(false);
  useEffect(() => {
    if (state.outcome !== 'running') return;
    const timer = window.setTimeout(() => dispatch({ type: 'TICK' }), 560);
    return () => window.clearTimeout(timer);
  }, [state.outcome, state.tick]);
  useEffect(() => { if (state.outcome === 'success' && !rewarded.current) { completeLevel(level.id, level.rewards); rewarded.current = true; } }, [completeLevel, state.outcome]);
  const message = state.outcome === 'success' ? level.narrative.success[0].text : state.outcome === 'failure' ? state.incident : level.narrative.intro[0].text;
  return <main className="game-shell integration-level"><CityCanvas /><div className="world-glow" aria-hidden="true" />
    <section className="mission panel"><div className="mission-kicker">CI VALLEY // FREE MISSION 02</div><h1>CONTINUOUS INTEGRATION</h1><p>Route every incoming branch into the shared verification line. Integration happens continuously, before release day.</p><div className={`radio ${state.outcome}`}><b>RADIO // {level.narrative.intro[0].speaker}</b><span>{message}</span></div></section>
    <section className="integration-grid"><aside className="change-bay panel"><div className="panel-title">INCOMING CHANGES</div>{CHANGE_IDS.map((change, index) => <button key={change} className={`change-node ${state.routed.includes(change) ? 'routed' : ''}`} onClick={() => dispatch({ type: 'ROUTE_CHANGE', change })}><i>BR-{index + 1}</i><b>{change}</b><span>{state.routed.includes(change) ? 'ROUTED' : 'ROUTE TO CI'}</span></button>)}</aside><div className="shared-line panel"><div className="panel-title">SHARED VERIFICATION LINE</div><div className="rail"><span className={state.routed.length > 0 ? 'lit' : ''}>MERGE</span><span className={state.routed.length > 1 ? 'lit' : ''}>TEST</span><span className={state.routed.length > 2 ? 'lit' : ''}>BUILD</span><span className={state.outcome === 'success' ? 'lit' : ''}>RELEASE</span></div><p>{state.routed.length}/3 branch signals linked</p></div></section>
    <footer className="control-deck panel"><div className="objective"><span>BREAK THIS BELIEF</span><strong>â€œ{level.targetMisconception}â€</strong></div><button className="lever" disabled={state.outcome === 'running'} onClick={() => dispatch({ type: 'RUN' })}><b>RUN</b><span>INTEGRATION</span></button><button className="terminal-button" onClick={() => { rewarded.current = false; dispatch({ type: 'RESET' }); }}>RESET SIGNALS</button></footer>
  </main>;
}
