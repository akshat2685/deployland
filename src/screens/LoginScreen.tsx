import React, { useState } from 'react';
import { useAuth } from '../store/auth';
import { CityCanvas } from '../components/CityCanvas';
import { isLifetimeVip } from '../engine/access-policy';
import '../design/login.css';

interface LoginScreenProps {
  onBack: () => void;
  onSuccess?: () => void;
}

export default function LoginScreen({ onBack, onSuccess }: LoginScreenProps) {
  const { user, signInWithGithub, signInWithEmail, signUpWithEmail, signInGuest, signOut } = useAuth();
  
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [callsignName, setCallsignName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatusMsg('ERROR: ENTER A VALID OPERATOR EMAIL');
      return;
    }
    if (!password || password.length < 4) {
      setStatusMsg('ERROR: SECURITY PASSCODE MUST BE AT LEAST 4 CHARACTERS');
      return;
    }

    setLoading(true);
    setStatusMsg(authMode === 'login' ? 'VERIFYING CREDENTIALS IN SECURE DATABASE...' : 'REGISTERING NEW OPERATOR IN DATABASE...');

    try {
      if (authMode === 'register') {
        await signUpWithEmail(email, password, callsignName || undefined);
        const isVip = isLifetimeVip(email);
        setStatusMsg(isVip ? '👑 VIP PASSCODE REGISTERED // LIFETIME ACCESS ACTIVATED' : 'OPERATOR REGISTERED // UPLINK ESTABLISHED');
      } else {
        await signInWithEmail(email, password);
        const isVip = isLifetimeVip(email);
        setStatusMsg(isVip ? '👑 VIP ACCESS VERIFIED // WELCOME CHIEF ARCHITECT' : 'AUTHENTICATION SUCCESSFUL // ACCESS GRANTED');
      }

      setTimeout(() => {
        setLoading(false);
        if (onSuccess) onSuccess();
        else onBack();
      }, 700);
    } catch (err: any) {
      const errorText = err?.message || 'ERROR: INVALID OPERATOR CREDENTIALS';
      setStatusMsg(errorText.includes('INVALID') ? '⛔ ACCESS DENIED: INVALID SECURITY PASSCODE' : errorText);
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setLoading(true);
    setStatusMsg('AUTHENTICATING VIA GITHUB OAUTH NETWORK...');
    try {
      await signInWithGithub();
      setStatusMsg('GITHUB DEVELOPER UPLINK ESTABLISHED');
      setTimeout(() => {
        setLoading(false);
        if (onSuccess) onSuccess();
        else onBack();
      }, 600);
    } catch {
      setStatusMsg('ERROR: GITHUB OAUTH FAILED');
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    setLoading(true);
    setStatusMsg('GENERATING LOCAL GUEST CREDENTIALS...');
    try {
      await signInGuest();
      if (onSuccess) onSuccess();
      else onBack();
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="login-screen-container">
      <CityCanvas />
      
      <div className="login-terminal-casing">
        {/* Terminal Header */}
        <header className="terminal-header">
          <div className="terminal-lamps">
            <span className="lamp red" />
            <span className="lamp yellow" />
            <span className="lamp green" />
          </div>
          <div className="terminal-title">DEPLOYLAND SECURE GATEWAY // v2.5</div>
          <button className="terminal-close-btn" onClick={onBack} aria-label="Close terminal">✕</button>
        </header>

        {/* Database Telemetry Badge */}
        <div style={{
          background: '#090e15',
          borderBottom: '2px solid var(--ui-ink)',
          padding: '8px 16px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '11px',
          color: 'var(--energy-active-cyan)',
          fontFamily: 'var(--font-game-display)'
        }}>
          <span>🗄 DATABASE: SUPABASE POSTGRESQL + LOCAL MULTI-USER DB</span>
          <span style={{ color: 'var(--energy-success-green)' }}>● SECURE RLS ACTIVE</span>
        </div>

        {/* Terminal Screen Body */}
        <div className="terminal-screen-body">
          <div className="terminal-crt-overlay">
            <h1 className="terminal-headline">OPERATOR AUTHENTICATION</h1>
            <p className="terminal-subline">
              Enter your verified email callsign and secure passcode to decrypt your campaign state and restore DeployLand.
            </p>

            {user ? (
              <div className="authenticated-card">
                <div className="auth-status-tag">
                  {isLifetimeVip(user.email) ? '👑 LIFETIME VIP OPERATOR CLEARANCE ACTIVE' : 'ACTIVE UPLINK IDENTIFIED'}
                </div>
                <div className="auth-email-display">{user.email || 'AUTHENTICATED ENGINEER'}</div>
                {isLifetimeVip(user.email) && (
                  <div style={{ color: 'var(--hazard-yellow)', fontSize: '13px', fontFamily: 'var(--font-game-clean)' }}>
                    ✨ ALL CAMPAIGN DISTRICTS UNLOCKED WITH LIFETIME PASS
                  </div>
                )}
                <div className="auth-actions">
                  <button className="pixel-button green" onClick={onSuccess || onBack}>
                    RESUME CAMPAIGN ══▶
                  </button>
                  <button className="pixel-button red" onClick={() => signOut()}>
                    SEVER LINK (LOGOUT)
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Auth Mode Switcher */}
                <div style={{ display: 'flex', gap: '8px', marginBottom: '14px' }}>
                  <button 
                    className={`pixel-button ${authMode === 'login' ? 'gold' : ''}`}
                    onClick={() => { setAuthMode('login'); setStatusMsg(null); }}
                    style={{ flex: 1 }}
                  >
                    🔐 OPERATOR LOGIN
                  </button>
                  <button 
                    className={`pixel-button ${authMode === 'register' ? 'gold' : ''}`}
                    onClick={() => { setAuthMode('register'); setStatusMsg(null); }}
                    style={{ flex: 1 }}
                  >
                    📝 REGISTER NEW CALLSIGN
                  </button>
                </div>

                {/* GitHub Direct Link */}
                <button 
                  className="pixel-button github-auth-btn"
                  onClick={handleGithubLogin}
                  disabled={loading}
                >
                  <span className="git-icon">🐙</span>
                  <span>AUTHENTICATE WITH GITHUB</span>
                </button>

                <div className="auth-divider">
                  <span>OR {authMode === 'login' ? 'ENTER CALLSIGN & PASSCODE' : 'CREATE OPERATOR PASSCODE'}</span>
                </div>

                {/* Email + Password Form */}
                <form className="email-auth-form" onSubmit={handleSubmit}>
                  {authMode === 'register' && (
                    <div className="input-group">
                      <label htmlFor="operator-name">CALLSIGN / CODENAME (OPTIONAL):</label>
                      <input 
                        id="operator-name"
                        type="text" 
                        placeholder="e.g. ARCHITECT_AKSHAT" 
                        value={callsignName}
                        onChange={(e) => setCallsignName(e.target.value)}
                        disabled={loading}
                      />
                    </div>
                  )}

                  <div className="input-group">
                    <label htmlFor="operator-email">OPERATOR EMAIL:</label>
                    <input 
                      id="operator-email"
                      type="email" 
                      placeholder="engineer@deployland.game" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={loading}
                      autoComplete="email"
                      required
                    />
                  </div>

                  <div className="input-group">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <label htmlFor="operator-password">SECURITY PASSCODE (PASSWORD):</label>
                      <button 
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ background: 'none', border: 'none', color: 'var(--energy-active-cyan)', fontSize: '11px', cursor: 'pointer' }}
                      >
                        {showPassword ? 'HIDE' : 'SHOW'}
                      </button>
                    </div>
                    <input 
                      id="operator-password"
                      type={showPassword ? 'text' : 'password'} 
                      placeholder="Enter secret passcode..." 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      disabled={loading}
                      autoComplete={authMode === 'login' ? 'current-password' : 'new-password'}
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="pixel-button primary email-submit-btn"
                    disabled={loading}
                  >
                    {loading 
                      ? 'PROCESSING CIPHER...' 
                      : authMode === 'login' 
                        ? 'AUTHENTICATE & ENTER ══▶' 
                        : 'REGISTER & ACTIVATE CALLSIGN ══▶'}
                  </button>
                </form>

                {statusMsg && (
                  <div className={`terminal-status-msg ${statusMsg.includes('ERROR') || statusMsg.includes('DENIED') ? 'error' : 'success'}`}>
                    &gt; {statusMsg}
                  </div>
                )}

                {/* Guest Quick Play */}
                <div className="guest-fallback-section">
                  <button 
                    className="guest-link-btn"
                    onClick={handleGuestLogin}
                    disabled={loading}
                  >
                    CONTINUE AS LOCAL GUEST OPERATOR
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Terminal Bottom Controls */}
        <footer className="terminal-footer">
          <button className="pixel-button secondary" onClick={onBack}>
            RETURN TO PREVIOUS SCREEN
          </button>
        </footer>
      </div>
    </div>
  );
}
