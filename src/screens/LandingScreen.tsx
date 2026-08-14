import { CityCanvas } from '../components/CityCanvas';
import { getCourseLevels, courses } from '../content/course-registry';
import '../design/landing.css';

interface LandingProps {
  onPlay: () => void;
  onBuy?: () => void;
  onLogin?: () => void;
  isPremium?: boolean;
}

export default function LandingScreen({ onPlay, onBuy, onLogin, isPremium }: LandingProps) {
  const levels = getCourseLevels('cicd');
  const course = courses.find(c => c.id === 'cicd')!;

  return (
    <div className="landing-screen">
      <div className="landing-hero">
        <CityCanvas />
        <div className="hero-content">
          <header className="landing-header">
            <h1 className="pixel-logo">DEPLOYLAND</h1>
            <nav className="landing-nav">
              <a href="#how">HOW IT WORKS</a>
              <a href="#map">CAMPAIGN MAP</a>
              <a href="#pricing">CLEARANCE</a>
              {onLogin && (
                <button className="pixel-button small" onClick={onLogin}>
                  LOGIN 🔐
                </button>
              )}
              {isPremium ? (
                <span 
                  className="pixel-button small gold" 
                  style={{ cursor: 'default', pointerEvents: 'none', border: '2px solid var(--hazard-yellow)' }}
                >
                  👑 LIFETIME VIP PASS
                </span>
              ) : (
                onBuy && (
                  <button className="pixel-button small gold" onClick={onBuy}>
                    BUY PASS 👑
                  </button>
                )
              )}
            </nav>
          </header>

          <main className="hero-main">
            <h2 className="hero-headline">LEARN DEVOPS<br/>BY PLAYING.</h2>
            <p className="hero-subline">
              Learn CI/CD concepts by solving missions inside a living DevOps city.<br/>
              No coding required.
            </p>
            
            <div className="hero-actions">
              <button className="pixel-button primary-cta" onClick={onPlay}>
                {isPremium ? 'ENTER CAMPAIGN ══▶' : 'PLAY FREE'}
              </button>
              {!isPremium && onBuy && (
                <button className="pixel-button gold-cta" onClick={onBuy}>
                  UNLOCK FULL CAMPAIGN 👑
                </button>
              )}
              {isPremium && (
                <div 
                  className="pixel-button small gold"
                  style={{ cursor: 'default', pointerEvents: 'none', padding: '14px 20px', fontSize: '13px' }}
                >
                  👑 FULL ACCESS ACTIVE
                </div>
              )}
              <a href="#how" className="pixel-button secondary-cta">
                SEE HOW IT WORKS
              </a>
            </div>
          </main>
        </div>
      </div>

      <section id="how" className="landing-section features-section">
        <h3 className="section-title">THE GAMEPLAY LOOP</h3>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🏗️</div>
            <div className="feature-step">1. BUILD</div>
            <div className="feature-desc">Construct your pipeline on the factory floor with physical machines.</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔥</div>
            <div className="feature-step">2. BREAK</div>
            <div className="feature-desc">Witness system failure consequences in real time.</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <div className="feature-step">3. UNDERSTAND</div>
            <div className="feature-desc">Learn the underlying DevOps principles with structured debriefs.</div>
          </div>
          <div className="feature-card">
            <div className="feature-icon">✨</div>
            <div className="feature-step">4. RESTORE</div>
            <div className="feature-desc">Power up districts and restore the living city.</div>
          </div>
        </div>
      </section>

      <section id="map" className="landing-section map-section">
        <h3 className="section-title">CAMPAIGN DISTRICTS</h3>
        <div className="course-map">
          {levels.map((level, index) => {
            const isFree = index < 2 || isPremium;
            return (
              <div 
                key={level.id} 
                className={`map-node ${isFree ? 'free' : 'locked'}`}
                onClick={() => {
                  if (isFree) onPlay();
                  else if (onBuy) onBuy();
                }}
                style={{ cursor: 'pointer' }}
                title={isFree ? 'Click to Enter District' : 'Click to Unlock Full Campaign'}
              >
                <div className="node-marker">{index + 1}</div>
                <div className="node-info">
                  <div className="node-title">{level.id.split('-').slice(2).join(' ').toUpperCase()}</div>
                  <div className="node-archetype">{level.archetype}</div>
                </div>
                <div className="node-status">
                  {isPremium ? 'AUTHORIZED 🚀' : isFree ? 'FREE PLAY' : 'LOCKED 🔒'}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section id="pricing" className="landing-section pricing-section">
        <h3 className="section-title">ACQUISITION PROTOCOL</h3>
        <div className="pricing-card">
          <div className="pricing-badge">
            {isPremium ? '✓ LIFETIME VIP CLEARANCE GRANTED' : 'LIFETIME ACCESS CLEARANCE'}
          </div>
          <div className="pricing-course-title">{course.name.toUpperCase()}</div>
          <div className="pricing-price">{isPremium ? 'ACCESS ACTIVE' : `${course.price.inr} INR`}</div>
          <div className="pricing-tagline">
            {isPremium ? 'All 10 districts unlocked permanently for this account.' : 'One-time payment • Lifetime access • All future updates'}
          </div>

          <div className="pricing-perks">
            <div className="perk-item">
              <span className="perk-icon">✓</span>
              <span>All 10 Campaign Missions & Districts</span>
            </div>
            <div className="perk-item">
              <span className="perk-icon">✓</span>
              <span>Interactive Machinery: Graph Build, Classify, Triage, Allocate</span>
            </div>
            <div className="perk-item">
              <span className="perk-icon">✓</span>
              <span>Engineer Field Notebooks with production YAML specs</span>
            </div>
            <div className="perk-item">
              <span className="perk-icon">✓</span>
              <span>Cloud Save & Operator Profile Badge</span>
            </div>
          </div>

          {isPremium ? (
            <button 
              className="pixel-button primary-cta gold-full"
              onClick={onPlay}
            >
              ENTER PRODUCTION DISTRICT 🚀
            </button>
          ) : (
            <button 
              className="pixel-button primary-cta gold-full"
              onClick={onBuy || onPlay}
            >
              UNLOCK FULL CAMPAIGN NOW 👑
            </button>
          )}
        </div>
      </section>

      <footer className="landing-footer">
        <div>© 2147 DEPLOYLAND — CI VALLEY REPAIR DIVISION</div>
        <div className="footer-links">
          <a href="#privacy">PRIVACY</a>
          <a href="#terms">TERMS</a>
        </div>
      </footer>
    </div>
  );
}
