import { useEffect, useState } from 'react';
import { usePlayerStore } from '../store/player-store';
import { syncManager } from '../store/syncManager';

export function PlaytestOverlay() {
  const [open, setOpen] = useState(false);
  const player = usePlayerStore();
  const userId = syncManager.getUserId();
  
  // Only render in development
  if (import.meta.env.PROD) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '16px',
      right: '16px',
      zIndex: 9999,
      fontFamily: 'monospace',
      fontSize: '10px'
    }}>
      <button 
        onClick={() => setOpen(!open)}
        style={{
          background: 'var(--mint)',
          color: 'var(--void)',
          border: 'none',
          padding: '4px 8px',
          cursor: 'pointer'
        }}
      >
        [+] PLAYTEST
      </button>

      {open && (
        <div style={{
          marginTop: '8px',
          background: 'rgba(0,0,0,0.9)',
          border: '1px solid var(--mint)',
          padding: '16px',
          width: '250px',
          color: 'var(--cream)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <div><strong>SESSION ID:</strong> {userId}</div>
          <div><strong>XP:</strong> {player.xp}</div>
          <div>
            <strong>COMPLETED LEVELS:</strong>
            <ul style={{ margin: '4px 0 0 16px', padding: 0 }}>
              {player.completedLevels.map(l => (
                <li key={l}>{l} (Attempts: {player.attempts[l] || 1})</li>
              ))}
            </ul>
          </div>
          
          <button 
            onClick={() => {
              const allIds = [
                'cicd-01-broken-factory',
                'cicd-02-continuous-integration',
                'cicd-03-test-flakiness',
                'cicd-04-parallel-builds',
                'cicd-05-artifact-registry',
                'cicd-06-secret-leak',
                'cicd-07-blue-green',
                'cicd-08-least-privilege',
                'cicd-09-canary-rollout',
                'cicd-10-production-recovery'
              ];
              usePlayerStore.getState().loadProgress(1000, allIds, ['MASTER_DEPLOYER'], allIds, ['cicd']);
            }}
            style={{
              background: 'var(--ui-success)',
              color: '#000',
              border: '2px solid #000',
              padding: '6px',
              cursor: 'pointer',
              fontWeight: 'bold',
              marginTop: '8px'
            }}
          >
            UNLOCK ALL CAMPAIGN
          </button>

          <button 
            onClick={() => {
              if (window.confirm('RESET ALL PROGRESS?')) {
                usePlayerStore.getState().resetProgress();
              }
            }}
            style={{
              background: 'transparent',
              border: '1px solid var(--alert)',
              color: 'var(--alert)',
              padding: '4px',
              cursor: 'pointer',
              marginTop: '8px'
            }}
          >
            RESET PROGRESS
          </button>
        </div>
      )}
    </div>
  );
}
