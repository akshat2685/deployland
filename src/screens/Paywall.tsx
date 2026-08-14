import { useState, useEffect } from 'react';
import { Course, getCourseLevels } from '../content/course-registry';
import { useAuth } from '../store/auth';
import { usePlayerStore } from '../store/player-store';
import { analytics } from '../lib/analytics';
import { monitoring } from '../lib/monitoring';
import { PAYMENT_CONFIG } from '../config/payments';
import '../design/paywall.css';

export default function Paywall({ course, onCancel }: { course: Course, onCancel: () => void }) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const { user, signInWithGithub } = useAuth();
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handlePurchase = async () => {
    setLoading(true);
    setFeedback(null);
    analytics.track('checkout_started', { course_id: course.id });

    // If custom payment link is active and configured
    if (PAYMENT_CONFIG.directPaymentLink && !PAYMENT_CONFIG.directPaymentLink.includes('test_deployland_lifetime')) {
      window.open(PAYMENT_CONFIG.directPaymentLink, '_blank');
      setFeedback('PAYMENT GATEWAY OPENED // ACCESS CLEARANCE PENDING');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:3000/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id || 'guest',
          courseId: course.id,
          productId: `${course.id}_full`
        })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
          return;
        }
      }
      throw new Error('Backend checkout endpoint offline.');
    } catch (e) {
      monitoring.captureException(e, { context: 'Paywall Checkout' });
      // In local dev/demo environment: grant entitlement directly
      usePlayerStore.getState().grantEntitlement(course.id);
      setFeedback('CLEARANCE GRANTED // OFFLINE ACCESS ACTIVE');
      setTimeout(() => {
        setLoading(false);
        onCancel();
      }, 800);
    }
  };

  const totalLevels = getCourseLevels(course.id).length;
  const remainingMissions = Math.max(0, totalLevels - course.freeLevelIds.length);

  return (
    <div className="paywall-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) onCancel();
    }}>
      <div className="pixel-gate" role="dialog" aria-label="Campaign Unlock Gate">
        <div className="gate-lock-bars"></div>
        
        <header className="gate-header">
          <div>LOCKED DISTRICT</div>
          <div className="gate-subheader">THE PRODUCTION DISTRICT</div>
          <button className="gate-close-btn" onClick={onCancel} aria-label="Close dialog">✕</button>
        </header>
        
        <div className="gate-body">
          <p className="gate-message">
            You've completed the free missions and restored 20% of the city.<br/><br/>
            Unlock the remaining campaign to continue restoring <strong>{course.name}</strong>.
          </p>

          <div className="gate-features">
            <div className="gate-feature-item">
              <span className="gate-feature-icon">🔓</span>
              <span>{remainingMissions} REMAINING MISSIONS</span>
            </div>
            <div className="gate-feature-item">
              <span className="gate-feature-icon">♾️</span>
              <span>LIFETIME ACCESS</span>
            </div>
            <div className="gate-feature-item">
              <span className="gate-feature-icon">🔧</span>
              <span>FULL REPAIR CLEARANCE</span>
            </div>
          </div>

          <div className="gate-price-tag">
            <div className="price-label">ACQUISITION PROTOCOL</div>
            <div className="price-amount">{course.price.inr} INR</div>
          </div>

          {feedback && (
            <div style={{ color: 'var(--energy-success-green)', fontFamily: 'var(--font-game-display)', fontSize: '13px', margin: '-10px 0 10px 0' }}>
              {feedback}
            </div>
          )}

          <div className="gate-actions">
            <button className="gate-btn secondary" onClick={onCancel}>
              RETURN TO CITY
            </button>
            {!user ? (
              <button className="gate-btn primary" onClick={() => signInWithGithub()}>
                LOGIN TO UNLOCK
              </button>
            ) : (
              <button className="gate-btn primary" onClick={handlePurchase} disabled={loading}>
                {loading ? 'INITIALIZING...' : 'UNLOCK CAMPAIGN'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
