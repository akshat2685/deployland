import React, { useState, useEffect } from 'react';
import { CityCanvas } from './components/CityCanvas';
import { getCourseLevels } from './content/course-registry';
import { rankForXp, getUnlockedLevelIds } from './engine/progression';
import { usePlayerStore } from './store/player-store';
import PipelineLevel from './screens/PipelineLevel';
import IntegrationLevel from './screens/IntegrationLevel';
import LevelScreen from './screens/LevelScreen';
import { useAuth } from './store/auth';
import { syncManager } from './store/syncManager';
import { AccountMenu } from './components/AccountMenu';
import Paywall from './screens/Paywall';
import LandingScreen from './screens/LandingScreen';
import LoginScreen from './screens/LoginScreen';
import LegalScreen from './screens/LegalScreen';
import { PlaytestOverlay } from './components/PlaytestOverlay';
import { canPlay, isLifetimeVip } from './engine/access-policy';
import { courses } from './content/course-registry';
import { analytics } from './lib/analytics';
import { monitoring } from './lib/monitoring';
import './design/shell.css';

type Screen = 'landing' | 'legal' | 'boot' | 'map' | 'level' | 'integration' | 'level-generic';

// Custom 16-Bit District Landmark SVG Graphics
const DistrictLandmarkGraphic = ({ index, isRestored, isLocked }: { index: number; isRestored: boolean; isLocked: boolean }) => {
  const wallColor = isRestored ? '#647d9a' : isLocked ? '#222c38' : '#37475a';
  const roofColor = isRestored ? '#8c5224' : isLocked ? '#141820' : '#4e627a';
  const windowColor = isRestored ? '#f8d820' : isLocked ? '#0c1219' : '#38e8f8';
  const doorColor = isRestored ? '#38f858' : isLocked ? '#0c1219' : '#f8d820';

  if (index === 0) {
    // Level 1: THE BROKEN FACTORY
    return (
      <svg width="120" height="150" viewBox="0 0 120 150" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Foundation */}
        <rect x="10" y="50" width="100" height="100" fill={wallColor} stroke="#0c1219" strokeWidth="4" />
        {/* Sawtooth Industrial Roof */}
        <polygon points="10,50 35,20 35,50 60,20 60,50 85,20 85,50 110,20 110,50" fill={roofColor} stroke="#0c1219" strokeWidth="4" />
        {/* Smokestack */}
        <rect x="80" y="4" width="18" height="28" fill="#37475a" stroke="#0c1219" strokeWidth="3" />
        {isRestored && <circle cx="89" cy="-6" r="6" fill="#ffffff" opacity="0.6" />}
        {/* Windows */}
        <rect x="24" y="65" width="16" height="20" fill={windowColor} stroke="#0c1219" strokeWidth="2" />
        <rect x="52" y="65" width="16" height="20" fill={windowColor} stroke="#0c1219" strokeWidth="2" />
        <rect x="80" y="65" width="16" height="20" fill={windowColor} stroke="#0c1219" strokeWidth="2" />
        {/* Reinforced Entrance Gate */}
        <rect x="42" y="105" width="36" height="45" fill={doorColor} stroke="#0c1219" strokeWidth="3" />
        {/* Chained X if locked */}
        {isLocked && (
          <text x="60" y="90" fill="#ff3030" fontSize="32" fontFamily="monospace" fontWeight="bold" textAnchor="middle">✕</text>
        )}
      </svg>
    );
  }

  if (index === 1) {
    // Level 2: INTEGRATION RAILWAY HUB
    return (
      <svg width="120" height="150" viewBox="0 0 120 150" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="15" y="40" width="90" height="110" fill={wallColor} stroke="#0c1219" strokeWidth="4" />
        {/* Curved Vault Roof */}
        <path d="M15 40 Q60 10 105 40 Z" fill={roofColor} stroke="#0c1219" strokeWidth="4" />
        {/* Clock / Pressure Gauge */}
        <circle cx="60" cy="55" r="12" fill="#fff" stroke="#0c1219" strokeWidth="2" />
        <line x1="60" y1="55" x2="65" y2="50" stroke="#0c1219" strokeWidth="2" />
        {/* Windows */}
        <rect x="25" y="75" width="20" height="24" fill={windowColor} stroke="#0c1219" strokeWidth="2" />
        <rect x="75" y="75" width="20" height="24" fill={windowColor} stroke="#0c1219" strokeWidth="2" />
        {/* Train Archway */}
        <path d="M40 150 L40 110 Q60 95 80 110 L80 150 Z" fill={doorColor} stroke="#0c1219" strokeWidth="3" />
      </svg>
    );
  }

  if (index === 2) {
    // Level 3: TESTING LABORATORY
    return (
      <svg width="120" height="150" viewBox="0 0 120 150" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="45" width="80" height="105" fill={wallColor} stroke="#0c1219" strokeWidth="4" />
        {/* Lab Dome Observatory */}
        <path d="M35 45 A25 25 0 0 1 85 45 Z" fill="#38e8f8" stroke="#0c1219" strokeWidth="3" />
        {/* Antenna */}
        <line x1="60" y1="20" x2="60" y2="4" stroke="#adc2d6" strokeWidth="3" />
        <circle cx="60" cy="4" r="3" fill="#ff3030" />
        {/* Oscilloscope Grid Windows */}
        <rect x="30" y="60" width="60" height="30" fill="#0d1a14" stroke="#0c1219" strokeWidth="2" />
        <path d="M34 75 Q45 65 60 75 T86 75" fill="none" stroke={isRestored ? "#50ff90" : "#224422"} strokeWidth="2" />
        {/* High-Tech Sliding Door */}
        <rect x="44" y="105" width="32" height="45" fill={doorColor} stroke="#0c1219" strokeWidth="3" />
      </svg>
    );
  }

  // Generic 16-Bit District Castle / Tower
  return (
    <svg width="120" height="150" viewBox="0 0 120 150" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="15" y="35" width="90" height="115" fill={wallColor} stroke="#0c1219" strokeWidth="4" />
      {/* Crenellations / Battlement */}
      <rect x="15" y="20" width="20" height="20" fill={roofColor} stroke="#0c1219" strokeWidth="3" />
      <rect x="50" y="20" width="20" height="20" fill={roofColor} stroke="#0c1219" strokeWidth="3" />
      <rect x="85" y="20" width="20" height="20" fill={roofColor} stroke="#0c1219" strokeWidth="3" />
      {/* Windows */}
      <rect x="30" y="55" width="18" height="26" fill={windowColor} stroke="#0c1219" strokeWidth="2" />
      <rect x="72" y="55" width="18" height="26" fill={windowColor} stroke="#0c1219" strokeWidth="2" />
      {/* Door */}
      <rect x="42" y="105" width="36" height="45" fill={doorColor} stroke="#0c1219" strokeWidth="3" />
    </svg>
  );
};

export default function App() {
  const { user, loading } = useAuth();
  const [screen, setScreen] = useState<Screen>('landing');
  const [activeLevelId, setActiveLevelId] = useState<string>('');
  const [showAccountMenu, setShowAccountMenu] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    analytics.init();
    monitoring.init();
    
    // Safety fallback: guaranteed initialization within 300ms
    const safetyTimer = setTimeout(() => {
      setIsInitialized(true);
    }, 300);
    return () => clearTimeout(safetyTimer);
  }, []);

  useEffect(() => {
    async function init() {
      try {
        await syncManager.migrateV1toV2();
        if (user) {
          analytics.identify(user.id);
          if (syncManager.getUserId() === 'guest') {
            await syncManager.migrateGuestToUser(user.id);
            analytics.track('account_created');
          } else {
            syncManager.setUserId(user.id);
          }
        } else {
          syncManager.setUserId('guest');
          analytics.identify('guest');
        }
        await syncManager.loadCourseProgress('cicd');
      } catch (e) {
        monitoring.captureException(e, { context: 'App Init' });
      } finally {
        setIsInitialized(true);
      }
    }
    
    if (!loading) {
      init();
    }
  }, [user, loading]);

  const xp = usePlayerStore((player) => player.xp);
  const completed = usePlayerStore((player) => player.completedLevels);
  const levels = getCourseLevels('cicd');
  const course = courses.find(c => c.id === 'cicd')!;
  const unlockedLevels = getUnlockedLevelIds(levels, completed);
  const entitlements = usePlayerStore(s => s.entitlements);
  const rank = rankForXp(xp);

  if (!isInitialized) {
    return (
      <main className="shell boot">
        <section className="boot-screen">
          <div className="boot-copy">
            <span>DEPLOYLAND OPERATIONS NETWORK</span>
            <p>ESTABLISHING TELEMETRY UPLINK...</p>
          </div>
          <button 
            className="start-control" 
            onClick={() => setIsInitialized(true)}
            style={{ marginTop: '20px' }}
          >
            INITIALIZE OPERATIONS ══▶
          </button>
        </section>
      </main>
    );
  }

  if (screen === 'landing') {
    if (window.location.hash.match(/privacy|terms|legal|support/)) return <LegalScreen />;
    return (
      <main className="shell landing">
        <PlaytestOverlay />
        {showLogin && (
          <LoginScreen 
            onBack={() => setShowLogin(false)} 
            onSuccess={() => setShowLogin(false)} 
          />
        )}
        {showPaywall && <Paywall course={course} onCancel={() => setShowPaywall(false)} />}
        <LandingScreen 
          onPlay={() => {
            analytics.track('game_started');
            setScreen('boot');
          }} 
          onBuy={() => {
            analytics.track('paywall_viewed', { course_id: course.id, source: 'landing_page' });
            setShowPaywall(true);
          }}
          onLogin={() => {
            setShowLogin(true);
          }}
        />
      </main>
    );
  }

  if (screen === 'legal') return <LegalScreen />;
  if (screen === 'level') return <><PlaytestOverlay /><PipelineLevel /></>;
  if (screen === 'integration') return <><PlaytestOverlay /><IntegrationLevel /></>;
  if (screen === 'level-generic') return (
    <>
      <PlaytestOverlay />
      {showLogin && (
        <LoginScreen 
          onBack={() => setShowLogin(false)} 
          onSuccess={() => setShowLogin(false)} 
        />
      )}
      {showPaywall && <Paywall course={course} onCancel={() => setShowPaywall(false)} />}
      <LevelScreen 
        levelId={activeLevelId} 
        onExit={() => setScreen('map')} 
        onSelectLevel={(nextId) => {
          const nextLvl = levels.find(l => l.id === nextId);
          if (nextLvl) {
            const access = canPlay(!user, entitlements, course, nextLvl, user?.email);
            if (!access.allowed) {
              analytics.track('paywall_viewed', { course_id: course.id, level_id: nextId });
              setShowPaywall(true);
              return;
            }
          }
          analytics.track('level_started', { course_id: course.id, level_id: nextId });
          setActiveLevelId(nextId);
        }}
      />
    </>
  );

  const isVip = isLifetimeVip(user?.email);

  return (
    <main className={`shell ${screen}`}>
      <PlaytestOverlay />
      {showLogin && (
        <LoginScreen 
          onBack={() => setShowLogin(false)} 
          onSuccess={() => setShowLogin(false)} 
        />
      )}
      {showAccountMenu && <AccountMenu onClose={() => setShowAccountMenu(false)} />}
      {showPaywall && <Paywall course={course} onCancel={() => setShowPaywall(false)} />}
      <CityCanvas />
      
      {screen === 'boot' ? (
        <section className="boot-screen">
          <div className="boot-copy">
            <span>DEPLOYLAND OPERATIONS NETWORK</span>
            <p>SYSTEM UPLINK ESTABLISHED</p>
          </div>
          <h1><i>DEPLOY</i>LAND</h1>
          <p className="boot-story">
            YEAR 2147. The city’s deployment machinery has collapsed. Operate the physical release line. Restore power to every district.
          </p>
          <button className="start-control" onClick={() => setScreen('map')}>
            ENTER CI VALLEY
          </button>
        </section>
      ) : (
        <section className="map-screen">
          <header className="map-hud">
            <div 
              className="map-hud-stat" 
              style={{ cursor: 'pointer' }} 
              onClick={() => setShowAccountMenu(true)}
              title="Open Operator Badge"
            >
              <span>ENGINEER ID</span>
              <b>{isVip ? '👑 CHIEF ARCHITECT (LIFETIME VIP)' : `${rank.name} ${user ? '☁' : ''}`}</b>
            </div>
            
            <div className="map-hud-stat">
              <span>EXPERIENCE XP</span>
              <b>{String(xp).padStart(6, '0')}</b>
            </div>

            <button className="pixel-button small" onClick={() => setShowLogin(true)}>
              {user ? (isVip ? '👑 VIP ACTIVE' : '👤 ACCOUNT') : '🔐 LOGIN'}
            </button>

            <button className="pixel-button small" onClick={() => setScreen('boot')}>
              SYSTEM MENU
            </button>
          </header>
          
          <div className="overworld-container">
            <div className="overworld-scroll-wrapper">
              <div className="overworld-ground">
                <div className="overworld-road" />
              </div>

              <div className="overworld-track">
                {levels.map((lvl, index) => {
                const isComplete = completed.includes(lvl.id);
                const isLocked = !unlockedLevels.has(lvl.id);
                const access = canPlay(!user, entitlements, course, lvl, user?.email);
                const isRestricted = !access.allowed;
                const isCurrentActive = !isLocked && !isComplete;
                
                let statusBadge = isComplete ? 'RESTORED' : isRestricted && !isLocked ? 'UPLINK REQUIRED' : isLocked ? 'LOCKED' : 'AVAILABLE';
                let statusClass = isComplete ? 'restored' : isRestricted && !isLocked ? 'restricted' : isLocked ? 'locked' : 'available';
                const levelName = lvl.id.split('-').slice(2).join(' ').toUpperCase();

                return (
                  <button 
                    key={lvl.id} 
                    className="district-landmark-node"
                    disabled={isLocked}
                    aria-label={`District ${index + 1}: ${levelName}`}
                    onClick={() => {
                      if (isRestricted) {
                        analytics.track('paywall_viewed', { course_id: course.id, level_id: lvl.id });
                        setShowPaywall(true);
                        return;
                      }
                      
                      analytics.track('level_started', { course_id: course.id, level_id: lvl.id, archetype: lvl.archetype });
                      setActiveLevelId(lvl.id);
                      setScreen('level-generic');
                    }}
                  >
                    {/* Animated Player Avatar standing at current active mission */}
                    {isCurrentActive && (
                      <div className="overworld-engineer-avatar">
                        <div className="avatar-visor" />
                        <div className="avatar-wrench" />
                      </div>
                    )}

                    <div className="district-signpost">
                      <div className="signpost-district">DISTRICT {String(index + 1).padStart(2, '0')}</div>
                      <div className="signpost-title">{levelName}</div>
                      <div className={`signpost-status ${statusClass}`}>{statusBadge}</div>
                    </div>
                    
                    <div className="landmark-structure">
                      <DistrictLandmarkGraphic index={index} isRestored={isComplete} isLocked={isLocked} />
                    </div>
                  </button>
                );
              })}
              </div>
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
