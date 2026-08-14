import { useEffect, useState } from 'react';
import { useAuth } from '../store/auth';
import { syncManager } from '../store/syncManager';
import { SyncStatus } from '../store/repository';

export function AccountMenu({ onClose, onOpenTerminal }: { onClose: () => void; onOpenTerminal?: () => void }) {
  const { user, signInWithGithub, signInWithEmail, signOut } = useAuth();
  const [syncStatus, setSyncStatus] = useState<SyncStatus>(syncManager.getStatus());
  const [emailInput, setEmailInput] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = syncManager.subscribe((status) => {
      setSyncStatus(status);
    });
    return unsubscribe;
  }, []);

  const handleLinkAccount = async () => {
    await signInWithGithub();
  };

  const handleEmailLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput || !emailInput.includes('@')) return;
    setLoading(true);
    try {
      await signInWithEmail(emailInput);
      setLoading(false);
    } catch {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    onClose();
  };

  const isConnected = syncStatus !== 'SYNC_ERROR' && syncStatus !== 'OFFLINE';

  return (
    <div className="briefing-overlay" style={{ zIndex: 500 }} onClick={(e) => {
      if (e.target === e.currentTarget) onClose();
    }}>
      <div className="pixel-panel machine-casing" style={{ width: '460px', maxWidth: '95vw', padding: '24px' }}>
        <header style={{ borderBottom: '4px solid var(--ui-ink)', paddingBottom: '12px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="pixel-title" style={{ margin: 0, fontSize: '18px', color: 'var(--hazard-yellow)' }}>
            OPERATOR BADGE
          </h2>
          <button 
            className="pixel-button red small" 
            onClick={onClose}
            aria-label="Close Badge"
          >
            ✕
          </button>
        </header>

        <div style={{ background: '#121924', border: '3px solid var(--ui-ink)', padding: '16px', marginBottom: '16px' }}>
          <div style={{ fontSize: '11px', color: 'var(--machine-metal-light)', fontFamily: 'var(--font-game-display)', marginBottom: '4px' }}>
            OPERATOR CALLSIGN:
          </div>
          <div style={{ fontSize: '18px', color: 'var(--ui-paper-warm)', fontFamily: 'var(--font-game-clean)', fontWeight: 'bold' }}>
            {user ? (user.email || 'AUTHENTICATED ENGINEER') : 'GUEST OPERATOR (LOCAL)'}
          </div>
        </div>

        <div style={{ background: '#121924', border: '3px solid var(--ui-ink)', padding: '16px', marginBottom: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <div style={{ fontSize: '11px', color: 'var(--machine-metal-light)', fontFamily: 'var(--font-game-display)', marginBottom: '4px' }}>
              CLOUD SAVE LINK:
            </div>
            <div style={{ fontSize: '14px', color: isConnected ? 'var(--energy-success-green)' : 'var(--energy-danger-red)', fontFamily: 'var(--font-game-display)' }}>
              {syncStatus}
            </div>
          </div>
          <span className={`pixel-lamp ${isConnected ? 'green' : 'red'}`} />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {!user ? (
            <>
              <button 
                className="pixel-button green" 
                onClick={handleLinkAccount}
                style={{ width: '100%', padding: '14px' }}
              >
                🐙 LINK VIA GITHUB
              </button>

              <form onSubmit={handleEmailLink} style={{ display: 'flex', gap: '8px' }}>
                <input 
                  type="email" 
                  placeholder="engineer@email.com"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  style={{ flex: 1, padding: '10px', background: '#141b24', border: '3px solid var(--ui-ink)', color: '#fff', fontSize: '14px' }}
                />
                <button type="submit" className="pixel-button primary" disabled={loading}>
                  {loading ? '...' : 'LINK ══▶'}
                </button>
              </form>

              <p style={{ fontSize: '12px', color: 'var(--machine-metal-light)', textAlign: 'center', margin: 0, fontFamily: 'var(--font-game-clean)' }}>
                Syncs campaign progress securely to cloud database.
              </p>
            </>
          ) : (
            <button 
              className="pixel-button red" 
              onClick={handleSignOut}
              style={{ width: '100%', padding: '12px' }}
            >
              SEVER CLOUD LINK (SIGN OUT)
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
