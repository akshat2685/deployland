import React from 'react';
import type { Level } from '../engine/types';

interface MissionFeedbackProps {
  outcome: 'idle' | 'running' | 'success' | 'failure';
  level: Level;
  incidentMsg?: string;
  failureTitle?: string;
  failureAdvice?: string;
  nextLevelId?: string | null;
  onRetry: () => void;
  onContinue?: () => void;
  onNextLevel?: () => void;
  onExit: () => void;
}

export function MissionFeedback({
  outcome,
  level,
  incidentMsg,
  failureTitle = 'MISSION FAILED',
  failureAdvice = 'Review your configuration and try again.',
  nextLevelId,
  onRetry,
  onContinue,
  onNextLevel,
  onExit
}: MissionFeedbackProps) {
  if (outcome === 'idle' || outcome === 'running') return null;

  if (outcome === 'failure') {
    let whatHappened = incidentMsg || 'An unknown system failure occurred.';
    let why = '';
    let conceptText = `In the context of ${level.engineerMode.concept || 'deployment'}, ${failureAdvice}`;
    let tryAgainText = 'Review the objective and adjust your configuration.';

    // Try to parse structured format
    if (incidentMsg && incidentMsg.includes('WHAT HAPPENED')) {
      const parts = incidentMsg.split(/\n?(WHAT HAPPENED|WHY|DEVOPS CONCEPT|TRY AGAIN)\n?/);
      let currentHeader = '';
      whatHappened = '';
      conceptText = '';
      
      for (let i = 0; i < parts.length; i++) {
        const p = parts[i].trim();
        if (p === 'WHAT HAPPENED' || p === 'WHY' || p === 'DEVOPS CONCEPT' || p === 'TRY AGAIN') {
          currentHeader = p;
        } else if (p.length > 0) {
          if (currentHeader === 'WHAT HAPPENED') whatHappened = p;
          else if (currentHeader === 'WHY') why = p;
          else if (currentHeader === 'DEVOPS CONCEPT') conceptText = p;
          else if (currentHeader === 'TRY AGAIN') tryAgainText = p;
          else whatHappened = p;
        }
      }
    }

    return (
      <div className="feedback-overlay">
        <div className="pixel-panel incident-panel" style={{ maxWidth: '600px', border: '4px solid var(--ui-danger)' }}>
          <div style={{ color: 'var(--ui-danger)', fontFamily: 'var(--font-header)', fontSize: '14px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="blink">⚠️</span> CRITICAL ALERT
          </div>
          <h2 className="pixel-title" style={{ color: 'var(--ui-paper)' }}>{failureTitle}</h2>
          
          <div style={{ background: 'var(--world-night)', padding: '24px', border: '4px solid var(--ui-border)', margin: '24px 0', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            
            {whatHappened && (
              <div>
                <strong style={{ color: 'var(--ui-highlight)', fontFamily: 'var(--font-header)', fontSize: '14px', display: 'block', borderBottom: '2px solid var(--ui-ink)', paddingBottom: '4px', marginBottom: '8px' }}>WHAT HAPPENED</strong>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '18px', color: 'var(--ui-danger)', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {whatHappened}
                </p>
              </div>
            )}
            
            {why && (
              <div>
                <strong style={{ color: 'var(--ui-warning)', fontFamily: 'var(--font-header)', fontSize: '14px', display: 'block', borderBottom: '2px solid var(--ui-ink)', paddingBottom: '4px', marginBottom: '8px' }}>WHY</strong>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '18px', color: 'var(--ui-paper)', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {why}
                </p>
              </div>
            )}

            {conceptText && (
              <div>
                <strong style={{ color: 'var(--ui-info)', fontFamily: 'var(--font-header)', fontSize: '14px', display: 'block', borderBottom: '2px solid var(--ui-ink)', paddingBottom: '4px', marginBottom: '8px' }}>DEVOPS CONCEPT</strong>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '18px', color: 'var(--ui-paper)', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {conceptText}
                </p>
              </div>
            )}

            {tryAgainText && (
              <div>
                <strong style={{ color: 'var(--ui-success)', fontFamily: 'var(--font-header)', fontSize: '14px', display: 'block', borderBottom: '2px solid var(--ui-ink)', paddingBottom: '4px', marginBottom: '8px' }}>TRY AGAIN</strong>
                <p style={{ fontFamily: 'var(--font-body)', fontSize: '18px', color: 'var(--ui-success)', margin: 0, whiteSpace: 'pre-wrap' }}>
                  {tryAgainText}
                </p>
              </div>
            )}

          </div>
          
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
            <button className="pixel-button" style={{ background: 'var(--ui-danger)' }} onClick={onExit}>ABORT</button>
            <button className="pixel-button" onClick={onRetry}>REBOOT SYSTEM</button>
          </div>
        </div>
      </div>
    );
  }

  // Success
  return (
    <div className="feedback-overlay">
      <div className="pixel-panel success-panel" style={{ maxWidth: '640px', border: '4px solid var(--ui-success)', textAlign: 'center' }}>
        <h2 className="pixel-title" style={{ color: 'var(--ui-success)', fontSize: '42px', marginBottom: '16px' }}>MISSION CLEARED</h2>
        <div style={{ fontFamily: 'var(--font-body)', fontSize: '22px', color: 'var(--ui-paper)', marginBottom: '24px' }}>
          "{level.narrative.success[0]?.text}"
        </div>
        
        <div style={{ background: 'var(--world-night)', border: '4px solid var(--ui-border)', padding: '12px 24px', display: 'inline-block', marginBottom: '28px' }}>
          <div style={{ fontFamily: 'var(--font-header)', color: 'var(--ui-highlight)', fontSize: '13px', marginBottom: '4px' }}>REWARD OBTAINED</div>
          <div style={{ fontFamily: 'var(--font-body)', color: 'var(--ui-paper)', fontSize: '28px' }}>+{level.rewards.xp} XP</div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          {nextLevelId && onNextLevel && (
            <button className="pixel-button primary" onClick={onNextLevel}>
              NEXT MISSION ══▶
            </button>
          )}
          {onContinue && (
            <button className="pixel-button" onClick={onContinue}>
              FIELD NOTEBOOK 📖
            </button>
          )}
          <button className="pixel-button" style={{ background: 'var(--ui-border)' }} onClick={onExit}>
            RETURN TO MAP
          </button>
        </div>
      </div>
    </div>
  );
}
