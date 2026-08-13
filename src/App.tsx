import { useState } from 'react';
import { CityCanvas } from './components/CityCanvas';
import { getCourseLevels } from './content/course-registry';
import { rankForXp } from './engine/progression';
import { usePlayerStore } from './store/player-store';
import PipelineLevel from './screens/PipelineLevel';
import IntegrationLevel from './screens/IntegrationLevel';
import './design/shell.css';

type Screen = 'boot' | 'map' | 'level' | 'integration';

export default function App() {
  const [screen, setScreen] = useState<Screen>('boot');
  const xp = usePlayerStore((player) => player.xp);
  const completed = usePlayerStore((player) => player.completedLevels);
  const levels = getCourseLevels('cicd');
  const level01Complete = completed.includes(levels[0].id);
  const rank = rankForXp(xp);

  if (screen === 'level') return <PipelineLevel />;
  if (screen === 'integration') return <IntegrationLevel />;

  return <main className={`shell ${screen}`}>
    <CityCanvas />
    <div className="world-glow" aria-hidden="true" />
    {screen === 'boot' ? <section className="boot-screen panel">
      <div className="boot-copy"><span>DEPLOYLAND OPERATIONS NETWORK</span><p>SYSTEM UPLINK ESTABLISHED</p></div>
      <h1><i>DEPLOY</i>LAND</h1>
      <p className="boot-story">YEAR 2147. The cityâ€™s deployment system has collapsed. Operate the release line. Keep the lights on.</p>
      <button className="start-control" onClick={() => setScreen('map')}>ENTER CI VALLEY</button>
      <small>ONE SAFE RELEASE AT A TIME</small>
    </section> : <section className="map-screen">
      <header className="map-hud panel"><div><span>ENGINEER ID</span><b>{rank.name}</b></div><div><span>XP</span><b>{String(xp).padStart(6, '0')}</b></div><button onClick={() => setScreen('boot')}>SIGNAL MENU</button></header>
      <div className="map-title"><span>COURSE REGION</span><h1>CI VALLEY</h1><p>Restoring automated delivery to the city.</p></div>
      <div className="district-grid">
        <article className="district panel active"><span>01 // BUILD FACTORY</span><h2>THE BROKEN FACTORY</h2><p>{level01Complete ? 'RESTORED // REPLAY AVAILABLE' : 'RELEASE LINE OFFLINE'}</p><button onClick={() => setScreen('level')}>{level01Complete ? 'REPLAY MISSION' : 'START REPAIR'}</button></article>
        <article className={`district panel ${level01Complete ? 'active' : 'offline'}`}><span>02 // INTEGRATION RAIL</span><h2>CONTINUOUS INTEGRATION</h2><p>{level01Complete ? 'SIGNAL DETECTED ACROSS THE WATER' : 'COMPLETE FACTORY REPAIR TO UPLINK'}</p><button disabled={!level01Complete} onClick={() => setScreen('integration')}>{level01Complete ? 'START INTEGRATION' : 'MISSION INCOMING'}</button></article>
        <article className="district panel restricted"><span>03â€”10 // PRODUCTION DISTRICT</span><h2>RESTRICTED REGION</h2><p>â€œTHE CITY NEEDS A DEPLOYMENT ENGINEER.â€</p><button disabled>LOCKED EXPANSION</button></article>
      </div>
    </section>}
  </main>;
}
