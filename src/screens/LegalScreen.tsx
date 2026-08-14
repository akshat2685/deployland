import React, { useEffect, useState } from 'react';

export default function LegalScreen() {
  const [page, setPage] = useState<'privacy' | 'terms' | 'support' | 'legal'>('legal');

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash.replace('#', '');
      if (['privacy', 'terms', 'support', 'legal'].includes(hash)) {
        setPage(hash as any);
      }
    };
    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  return (
    <div style={{ padding: '32px 16px', maxWidth: '800px', margin: '0 auto', minHeight: '100vh', boxSizing: 'border-box' }}>
      <button 
        className="pixel-button small" 
        onClick={() => window.history.back()} 
        style={{ marginBottom: '24px' }}
      >
        ← RETURN TO DEPLOYLAND
      </button>

      <div className="pixel-panel machine-casing" style={{ padding: '32px', background: 'var(--casing-parchment)', color: 'var(--ui-ink)' }}>
        {page === 'privacy' && (
          <article style={{ fontFamily: 'var(--font-game-clean)' }}>
            <h1 className="pixel-title" style={{ color: 'var(--world-dirt-dark)', fontSize: '24px', marginBottom: '16px' }}>
              PRIVACY ARCHIVE
            </h1>
            <p style={{ fontWeight: 'bold' }}>Effective Date: January 1, 2147</p>
            <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
              We collect minimal data necessary for game progression and authentication (email, ID). Payment processing is handled securely by Stripe; we do not store credit card information. Analytics are collected anonymously to improve the learning experience.
            </p>
          </article>
        )}

        {page === 'terms' && (
          <article style={{ fontFamily: 'var(--font-game-clean)' }}>
            <h1 className="pixel-title" style={{ color: 'var(--world-dirt-dark)', fontSize: '24px', marginBottom: '16px' }}>
              TERMS OF DISPATCH
            </h1>
            <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
              DeployLand provides an educational CI/CD simulation. Access to Levels 1 and 2 is free. Access to the full CI Valley course requires a one-time lifetime purchase. We reserve the right to revoke access if payment is reversed or fraudulent activity is detected.
            </p>
          </article>
        )}

        {page === 'legal' && (
          <article style={{ fontFamily: 'var(--font-game-clean)' }}>
            <h1 className="pixel-title" style={{ color: 'var(--world-dirt-dark)', fontSize: '24px', marginBottom: '16px' }}>
              LEGAL & PURCHASE PROTOCOL
            </h1>
            <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
              DeployLand is a one-time purchase educational product. <strong>No subscriptions. No recurring fees.</strong>
            </p>
            <h3 style={{ fontFamily: 'var(--font-game-display)', fontSize: '14px', marginTop: '20px', color: 'var(--world-dirt-base)' }}>
              REFUND POLICY
            </h3>
            <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
              If you are not satisfied with the learning experience, contact support within 14 days of purchase for a full refund. Entitlements will be revoked upon refund.
            </p>
          </article>
        )}

        {page === 'support' && (
          <article style={{ fontFamily: 'var(--font-game-clean)' }}>
            <h1 className="pixel-title" style={{ color: 'var(--world-dirt-dark)', fontSize: '24px', marginBottom: '16px' }}>
              OPERATOR SUPPORT DESK
            </h1>
            <p style={{ fontSize: '14px', lineHeight: '1.6' }}>
              For billing issues, bug reports, or account assistance, please contact:
            </p>
            <div style={{ background: '#0c1219', color: 'var(--hazard-yellow)', padding: '12px', fontFamily: 'monospace', fontSize: '14px', border: '2px solid #000' }}>
              support@deployland.example.com
            </div>
          </article>
        )}
      </div>
    </div>
  );
}
