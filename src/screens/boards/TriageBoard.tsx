import React, { useReducer, useState, useEffect } from 'react';
import type { Level } from '../../engine/types';
import { triageReducer } from '../../engine/triage';
import type { TriageState, ClueId, RootCauseId } from '../../engine/triage';
import type { ArchetypeBoardProps } from '../MissionShell';
import '../../design/triage.css';

// 16-Bit Evidence Cartridge SVG Icons
const CartridgeIcon = ({ title }: { title: string }) => {
  const t = title.toLowerCase();

  if (t.includes('build') || t.includes('ci') || t.includes('output')) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="3" y="3" width="18" height="18" fill="#37475a" stroke="#0c1219" strokeWidth="2" />
        <rect x="6" y="3" width="12" height="7" fill="#adc2d6" />
        <rect x="7" y="14" width="10" height="6" fill="#f8d820" />
      </svg>
    );
  }

  if (t.includes('log') || t.includes('trace') || t.includes('report')) {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <rect x="4" y="3" width="16" height="18" fill="#f6f0dd" stroke="#0c1219" strokeWidth="2" />
        <line x1="7" y1="7" x2="17" y2="7" stroke="#0c1219" strokeWidth="1.5" />
        <line x1="7" y1="11" x2="17" y2="11" stroke="#0c1219" strokeWidth="1.5" />
        <line x1="7" y1="15" x2="13" y2="15" stroke="#0c1219" strokeWidth="1.5" />
      </svg>
    );
  }

  // Metric Disk / Tape
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="9" fill="#2050e0" stroke="#0c1219" strokeWidth="2" />
      <circle cx="12" cy="12" r="3" fill="#fff" stroke="#0c1219" strokeWidth="1.5" />
      <line x1="12" y1="3" x2="12" y2="7" stroke="#38e8f8" strokeWidth="2" />
    </svg>
  );
};

export default function TriageBoard({ level, onOutcome }: ArchetypeBoardProps) {
  const [state, dispatch] = useReducer(triageReducer, level.initialState as TriageState);
  const [activeClue, setActiveClue] = useState<ClueId | null>(null);
  const [localSelection, setLocalSelection] = useState<RootCauseId | null>(null);

  useEffect(() => {
    let finalMistake = state.mistake;
    if (state.outcome === 'failure' && state.mistake && localSelection) {
      const causeName = state.possibleCauses.find(c => c.id === localSelection)?.title || localSelection;
      finalMistake = `WHAT HAPPENED\nYou submitted an incorrect hypothesis: [ ${causeName} ].\n\nWHY\nThe telemetry logs and error signatures do not substantiate this as the primary fault.\n\nDEVOPS CONCEPT\nRoot cause analysis requires isolating verifiable telemetry signals rather than guessing from symptoms.\n\nTRY AGAIN\nRe-inspect the log traces and metric cartridges to pinpoint the genuine source of failure.`;
    }
    onOutcome(state.outcome, finalMistake);
  }, [state.outcome, state.mistake, localSelection, onOutcome, state.possibleCauses]);

  const handleClueClick = (clueId: string) => {
    dispatch({ type: 'INVESTIGATE_CLUE', clueId });
    setActiveClue(clueId);
  };

  const handleDiagnose = () => {
    if (!localSelection) return;
    dispatch({ type: 'SELECT_ROOT_CAUSE', rootCauseId: localSelection });
  };

  const activeContent = state.clues.find((c) => c.id === activeClue)?.content ?? 
    'MAINFRAME TERMINAL // READY\n\n> INSERT AN EVIDENCE CARTRIDGE TO COMMENCE TELEMETRY ANALYSIS';

  const confidencePct = Math.min(100, Math.round((state.discoveredClues.length / state.clues.length) * 100));
  
  const formattedContent = activeContent.split('\n').map((line, i) => {
    const isErr = line.includes('ERROR') || line.includes('FATAL') || line.includes('FAIL');
    const isWarn = line.includes('WARN');
    return (
      <div key={i} className={`terminal-log-row ${isErr ? 'err' : isWarn ? 'warn' : ''}`}>
        {line}
      </div>
    );
  });

  return (
    <div className="triage-game-container">
      {/* Left: Evidence Cartridge Bay */}
      <div className="triage-side-panel">
        <h3 className="triage-panel-title">TELEMETRY CARTRIDGES</h3>
        
        <div className="evidence-rack">
          {state.clues.map((clue) => {
            const isDiscovered = state.discoveredClues.includes(clue.id);
            const isActive = activeClue === clue.id;
            return (
              <button 
                key={clue.id} 
                className={`evidence-cartridge-btn ${isActive ? 'active' : ''}`}
                onClick={() => handleClueClick(clue.id)}
                aria-label={`Examine ${clue.title}`}
              >
                <CartridgeIcon title={clue.title} />
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-game-display)', fontSize: '11px', color: 'var(--ui-paper)' }}>
                    {clue.title}
                  </div>
                </div>
                {isDiscovered && <span className="cartridge-stamp">SCANNED</span>}
              </button>
            );
          })}
        </div>
        
        <div style={{ fontFamily: 'var(--font-game-display)', fontSize: '10px', color: 'var(--machine-metal-light)', textAlign: 'center', borderTop: '2px solid var(--ui-ink)', paddingTop: '8px' }}>
          RECOVERED: {state.discoveredClues.length} / {state.clues.length}
        </div>
      </div>

      {/* Center: Mainframe Terminal CRT Monitor */}
      <div className="terminal-monitor-viewport">
        <div className="terminal-top-bezel">
          <span>SYS_TELEMETRY // {level.id.toUpperCase()}</span>
          <span style={{ color: 'var(--energy-success-green)' }}>● LIVE REEL</span>
        </div>

        <div className="terminal-screen-log">
          {formattedContent}
        </div>
      </div>

      {/* Right: Detective Corkboard & Hypotheses */}
      <div className="detective-corkboard-panel">
        <h3 className="triage-panel-title" style={{ color: '#fff', borderBottomColor: 'var(--casing-wood-dark)' }}>
          CASE HYPOTHESES
        </h3>
        
        <div className="hypothesis-card-list">
          {state.possibleCauses.map((cause) => {
            const isSelected = localSelection === cause.id;
            return (
              <button 
                key={cause.id}
                className={`detective-note-card ${isSelected ? 'selected' : ''}`}
                onClick={() => setLocalSelection(cause.id)}
                disabled={state.outcome !== 'idle'}
                aria-label={`Select hypothesis ${cause.title}`}
              >
                <div className="cork-pin" />
                <div className="detective-note-text">{cause.title}</div>
              </button>
            );
          })}
        </div>

        <div style={{ background: '#121a24', border: '3px solid var(--ui-ink)', padding: '10px' }}>
          <div style={{ fontFamily: 'var(--font-game-display)', fontSize: '9px', color: 'var(--hazard-yellow)', marginBottom: '4px' }}>
            SIGNAL CONFIDENCE: {confidencePct}%
          </div>
          <div style={{ height: '8px', background: '#0c1219', border: '1px solid var(--ui-ink)' }}>
            <div style={{ height: '100%', width: `${confidencePct}%`, background: 'var(--energy-success-green)' }} />
          </div>
        </div>

        <button 
          className="pixel-button gold" 
          onClick={handleDiagnose}
          disabled={!localSelection || state.outcome !== 'idle'}
          style={{ width: '100%', padding: '14px' }}
        >
          SUBMIT DIAGNOSIS
        </button>
      </div>
    </div>
  );
}
