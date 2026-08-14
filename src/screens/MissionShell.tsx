import { ReactNode, useState, useEffect, useRef } from 'react';
import { CityCanvas } from '../components/CityCanvas';
import type { Level } from '../engine/types';
import { MissionFeedback } from '../components/MissionFeedback';
import { usePlayerStore } from '../store/player-store';
import { calculateProductionPercentage } from '../engine/progression';
import { getCourseLevels } from '../content/course-registry';
import { analytics } from '../lib/analytics';
import '../design/mission.css';

export interface ArchetypeBoardProps {
  level: Level;
  onOutcome: (outcome: 'idle' | 'success' | 'failure', incident?: string) => void;
}

interface Props {
  level: Level;
  children: (onOutcome: (outcome: 'idle' | 'success' | 'failure', incident?: string) => void) => ReactNode;
  onExit: () => void;
  nextLevelId?: string | null;
  onNextLevel?: () => void;
}

type MissionStatus = 'briefing' | 'play' | 'failure' | 'success' | 'engineer';

export default function MissionShell({ level, children, onExit, nextLevelId, onNextLevel }: Props) {
  const [status, setStatus] = useState<MissionStatus>('briefing');
  const [incidentMsg, setIncidentMsg] = useState<string | undefined>();
  const awardedRef = useRef(false);
  
  const completeLevel = usePlayerStore((player) => player.completeLevel);
  const completed = usePlayerStore((player) => player.completedLevels);
  const levels = getCourseLevels(level.courseId);
  const currentProd = calculateProductionPercentage(levels, completed);
  const nextProd = Math.min(100, currentProd + (level.world?.restoration || 0));

  useEffect(() => {
    setStatus('briefing');
    setIncidentMsg(undefined);
    awardedRef.current = false;
  }, [level.id]);

  useEffect(() => {
    if (status === 'success' && !awardedRef.current) {
      analytics.track('level_completed', { level_id: level.id, archetype: level.archetype });
      completeLevel(level.id, level.rewards);
      awardedRef.current = true;
    }
  }, [status, completeLevel, level]);

  const handleStartMission = () => {
    usePlayerStore.getState().recordAttempt(level.id);
    setStatus('play');
  };

  const handleEngineerOpen = () => {
    analytics.track('engineer_mode_opened', { level_id: level.id, archetype: level.archetype });
    setStatus('engineer');
  };

  const handleAbort = () => {
    analytics.track('level_abandoned', { level_id: level.id, archetype: level.archetype });
    onExit();
  };

  // Ensure board resets if we retry by giving it a dynamic key
  const [retryKey, setRetryKey] = useState(0);

  const handleOutcome = (newOutcome: 'idle' | 'success' | 'failure', incident?: string) => {
    if (newOutcome === 'failure') {
      const attempts = usePlayerStore.getState().attempts[level.id] || 1;
      analytics.track('level_failed', { level_id: level.id, archetype: level.archetype, attempt_number: attempts });
      setStatus('failure');
      setIncidentMsg(incident);
    } else if (newOutcome === 'success') {
      const attempts = usePlayerStore.getState().attempts[level.id] || 1;
      analytics.track('level_completed', { level_id: level.id, archetype: level.archetype, attempt_number: attempts });
      setStatus('success');
      setIncidentMsg(undefined);
    }
  };

  const triggerRetry = () => {
    usePlayerStore.getState().recordAttempt(level.id);
    setRetryKey(k => k + 1);
    setStatus('play');
    setIncidentMsg(undefined);
  };

  if (status === 'briefing') {
    return (
      <main className="mission-shell">
        <CityCanvas />
        <div className="briefing-overlay">
          <div className="pixel-panel briefing-panel" style={{ maxWidth: '700px' }}>
            <div className="briefing-kicker" style={{ color: 'var(--ui-info)', fontFamily: 'var(--font-header)', fontSize: '14px', marginBottom: '8px' }}>
              DISTRICT {String(level.index).padStart(2, '0')} // {level.id.split('-').slice(2).join(' ').toUpperCase()}
            </div>
            <h1 className="pixel-title" style={{ fontSize: '48px', color: 'var(--ui-paper)', marginBottom: '8px' }}>MISSION START</h1>
            <h2 style={{ color: 'var(--ui-highlight)', fontFamily: 'var(--font-header)', fontSize: '18px', marginBottom: '24px' }}>{level.narrative.intro[0]?.speaker}</h2>
            
            <div className="briefing-narrative" style={{ fontFamily: 'var(--font-body)', fontSize: '24px', color: 'var(--ui-paper)', marginBottom: '32px', fontStyle: 'italic' }}>
              "{level.narrative.intro[0]?.text}"
            </div>
            
            <div className="briefing-objective" style={{ background: 'var(--world-night)', padding: '16px', border: '4px solid var(--ui-border)', marginBottom: '32px' }}>
              <strong style={{ color: 'var(--ui-highlight)', fontFamily: 'var(--font-header)', fontSize: '14px' }}>OBJECTIVE</strong>
              <p style={{ margin: '8px 0 0 0', fontFamily: 'var(--font-body)', fontSize: '20px', color: 'var(--ui-paper)' }}>{level.rules.join(' ')}</p>
            </div>
            
            <div style={{ display: 'flex', gap: '16px' }}>
              <button className="pixel-button" onClick={handleStartMission}>
                START MISSION
              </button>
              <button className="pixel-button" style={{ background: 'var(--ui-danger)' }} onClick={handleAbort}>ABORT REPAIR</button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (status === 'engineer') {
    return (
      <main className="mission-shell success">
        <CityCanvas />
        <div className="briefing-overlay">
          <div className="pixel-panel engineer-panel" style={{ width: '800px', maxWidth: '90vw', maxHeight: '90vh', overflowY: 'auto' }}>
            <div className="briefing-kicker" style={{ color: 'var(--ui-highlight)', fontFamily: 'var(--font-header)', fontSize: '14px', marginBottom: '8px' }}>ENGINEER'S FIELD NOTEBOOK</div>
            <h1 className="pixel-title" style={{ fontSize: '32px', color: 'var(--ui-success)', marginBottom: '16px' }}>DISTRICT SECURED</h1>
            <p style={{ color: 'var(--ui-paper)', fontFamily: 'var(--font-header)', fontSize: '12px' }}><strong>CONCEPT:</strong> {level.engineerMode.concept || 'DevOps Pipeline'}</p>
            
            {level.engineerMode.whatYouDid && (
              <div className="engineer-section" style={{ marginTop: '24px' }}>
                <strong style={{ color: 'var(--ui-info)', fontFamily: 'var(--font-header)', fontSize: '14px' }}>WHAT YOU JUST DID</strong>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '18px', color: 'var(--ui-paper)', marginTop: '8px' }}>{level.engineerMode.whatYouDid}</p>
              </div>
            )}
            
            <div className="engineer-section" style={{ marginTop: '24px' }}>
              <strong style={{ color: 'var(--ui-info)', fontFamily: 'var(--font-header)', fontSize: '14px' }}>REAL WORLD ARTIFACT // {level.engineerMode.language.toUpperCase()}</strong>
              <pre className="engineer-artifact" style={{ background: 'var(--world-night)', padding: '16px', border: '4px solid var(--ui-border)', marginTop: '8px', color: 'var(--ui-paper)', fontFamily: 'monospace', overflowX: 'auto', fontSize: '14px', lineHeight: '1.5' }}>
                {level.engineerMode.artifact}
              </pre>
            </div>
            
            {level.engineerMode.annotation && (
              <div className="engineer-annotations" style={{ marginTop: '24px' }}>
                {level.engineerMode.annotation.map((note, i) => (
                  <p key={i} style={{ fontFamily: 'var(--font-body)', fontSize: '16px', color: 'var(--ui-paper)', marginBottom: '8px' }}>
                    <b style={{ color: 'var(--ui-highlight)' }}>LINE {note.line}</b> {note.text}
                  </p>
                ))}
              </div>
            )}

            {level.engineerMode.keyTakeaways && level.engineerMode.keyTakeaways.length > 0 && (
              <div className="engineer-section" style={{ marginTop: '24px' }}>
                <strong style={{ color: 'var(--ui-info)', fontFamily: 'var(--font-header)', fontSize: '14px' }}>KEY TAKEAWAYS</strong>
                <ul style={{ paddingLeft: '24px', marginTop: '12px', fontFamily: 'var(--font-body)', fontSize: '16px', color: 'var(--ui-paper)' }}>
                  {level.engineerMode.keyTakeaways.map((point, i) => (
                    <li key={i} style={{ marginBottom: '8px' }}>{point}</li>
                  ))}
                </ul>
              </div>
            )}
            
            <div style={{ marginTop: '32px', display: 'flex', gap: '16px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button className="pixel-button" style={{ background: 'var(--ui-border)' }} onClick={onExit}>
                RETURN TO MAP
              </button>
              {nextLevelId && onNextLevel && (
                <button className="pixel-button primary" onClick={onNextLevel}>
                  NEXT MISSION ══▶
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className={`mission-shell ${status === 'success' ? 'success' : ''}`}>
      <CityCanvas />
      
      <header className="pixel-panel mission-hud" style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 24px', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderRadius: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', gap: '32px' }}>
          <div>
            <span style={{ color: 'var(--ui-info)', fontSize: '12px', fontFamily: 'var(--font-header)' }}>DISTRICT {String(level.index).padStart(2, '0')}</span>
            <div style={{ color: 'var(--ui-paper)', fontFamily: 'var(--font-body)', fontSize: '20px' }}>{level.id.split('-').slice(2).join(' ').toUpperCase()}</div>
          </div>
          <div>
            <span style={{ color: 'var(--ui-warning)', fontSize: '12px', fontFamily: 'var(--font-header)' }}>THREAT LEVEL</span>
            <div style={{ color: 'var(--ui-paper)', fontFamily: 'var(--font-body)', fontSize: '20px' }}>{level.tier === 'paid' ? 'ELEVATED' : 'STANDARD'}</div>
          </div>
          <div>
            <span style={{ color: 'var(--ui-success)', fontSize: '12px', fontFamily: 'var(--font-header)' }}>PRODUCTION</span>
            <div style={{ color: status === 'success' ? 'var(--ui-success)' : 'var(--ui-paper)', fontFamily: 'var(--font-body)', fontSize: '20px' }}>
              {status === 'success' ? `${nextProd}%` : `${currentProd}%`}
            </div>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button className="pixel-button" style={{ background: 'var(--ui-danger)', padding: '8px 16px', fontSize: '12px' }} onClick={onExit}>
            ABORT
          </button>
        </div>
      </header>

      <div key={retryKey} style={{ display: 'flex', flexDirection: 'column', flex: 1, width: '100%' }}>
        {children(handleOutcome)}
      </div>
      
      {(status === 'failure' || status === 'success') && (
        <MissionFeedback 
          outcome={status} 
          level={level} 
          incidentMsg={incidentMsg}
          failureTitle="MISSION FAILED"
          failureAdvice="Review your actions and ensure you meet all requirements."
          nextLevelId={nextLevelId}
          onRetry={triggerRetry}
          onContinue={handleEngineerOpen}
          onNextLevel={onNextLevel}
          onExit={onExit} 
        />
      )}
    </main>
  );
}
