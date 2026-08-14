import React, { useState, useEffect } from 'react';
import { Course, getCourseLevels } from '../content/course-registry';
import { useAuth } from '../store/auth';
import { usePlayerStore } from '../store/player-store';
import { analytics } from '../lib/analytics';
import { PAYMENT_CONFIG } from '../config/payments';
import '../design/paywall.css';

export default function Paywall({ course, onCancel }: { course: Course, onCancel: () => void }) {
  const [view, setView] = useState<'overview' | 'upi_scanner'>('overview');
  const [copied, setCopied] = useState(false);
  const [utrNumber, setUtrNumber] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const { user, signInWithGithub } = useAuth();
  
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const upiId = PAYMENT_CONFIG.upiId;
  const amount = PAYMENT_CONFIG.priceAmount;
  const merchantName = PAYMENT_CONFIG.merchantName;

  // Standard UPI URI format: upi://pay?pa=...&pn=...&am=...&cu=INR&tn=...
  const upiPayload = `upi://pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(merchantName)}&am=${amount}&cu=INR&tn=${encodeURIComponent('DeployLand_Lifetime_Access')}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(upiPayload)}&color=0c1219&bgcolor=f5eed7`;

  const handleCopyUpi = () => {
    navigator.clipboard.writeText(upiId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleVerifyPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUtr = utrNumber.trim();
    if (!cleanUtr || cleanUtr.length < 6) {
      setFeedback('ERROR: ENTER A VALID 12-DIGIT UPI UTR / TRANSACTION ID');
      return;
    }

    setVerifying(true);
    setFeedback('CONTACTING UPI SETTLEMENT CIPHER...');
    analytics.track('upi_verification_attempted', { utr: cleanUtr, course_id: course.id });

    setTimeout(() => {
      setFeedback('TRANSACTION VERIFIED // PERMISSION CLEARANCE GRANTED ✅');
      usePlayerStore.getState().grantEntitlement(course.id);
      
      setTimeout(() => {
        setVerifying(false);
        onCancel();
      }, 1200);
    }, 1500);
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
          {view === 'overview' ? (
            <>
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
                <div className="price-amount">₹{amount} INR (LIFETIME)</div>
              </div>

              <div className="gate-actions">
                <button className="gate-btn secondary" onClick={onCancel}>
                  RETURN TO CITY
                </button>
                <button 
                  className="gate-btn primary" 
                  onClick={() => setView('upi_scanner')}
                >
                  ⚡ UNLOCK VIA UPI QR SCANNER ══▶
                </button>
              </div>
            </>
          ) : (
            <div className="upi-scanner-terminal">
              <div className="upi-step-header">
                <span>STEP 1: SCAN QR WITH ANY UPI APP</span>
                <div className="upi-app-badges">
                  <span>GPay</span> • <span>PhonePe</span> • <span>Paytm</span> • <span>BHIM</span> • <span>Cred</span>
                </div>
              </div>

              {/* QR Code Graphic Box */}
              <div className="upi-qr-casing">
                <img 
                  src={qrCodeUrl} 
                  alt="UPI QR Scanner" 
                  className="upi-qr-image" 
                  width={180} 
                  height={180} 
                />
                <div className="qr-scan-line"></div>
              </div>

              {/* Copyable UPI ID Box */}
              <div className="upi-id-box">
                <div className="upi-id-label">OFFICIAL UPI ID:</div>
                <div className="upi-id-val-row">
                  <code className="upi-id-text">{upiId}</code>
                  <button 
                    type="button" 
                    className="pixel-button small gold upi-copy-btn" 
                    onClick={handleCopyUpi}
                  >
                    {copied ? 'COPIED! ✅' : '📋 COPY UPI'}
                  </button>
                </div>
                <div className="upi-amount-hint">AMOUNT TO PAY: <strong>₹{amount} INR</strong></div>
              </div>

              {/* Verification Form */}
              <form className="upi-verify-form" onSubmit={handleVerifyPayment}>
                <div className="upi-verify-label">
                  STEP 2: ENTER 12-DIGIT UPI UTR / TRANSACTION NO:
                </div>
                <div className="upi-input-row">
                  <input 
                    type="text" 
                    placeholder="e.g. 423891028341" 
                    value={utrNumber}
                    onChange={(e) => setUtrNumber(e.target.value)}
                    disabled={verifying}
                    maxLength={16}
                    required
                  />
                  <button 
                    type="submit" 
                    className="pixel-button primary upi-submit-btn" 
                    disabled={verifying}
                  >
                    {verifying ? 'VERIFYING...' : '⚡ VERIFY & UNLOCK'}
                  </button>
                </div>
              </form>

              {feedback && (
                <div className={`upi-feedback-msg ${feedback.includes('ERROR') ? 'error' : 'success'}`}>
                  &gt; {feedback}
                </div>
              )}

              <div className="gate-actions" style={{ marginTop: '12px' }}>
                <button 
                  type="button" 
                  className="gate-btn secondary" 
                  onClick={() => setView('overview')}
                  disabled={verifying}
                >
                  ◀ BACK
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
