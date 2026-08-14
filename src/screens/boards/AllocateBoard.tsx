import React, { useReducer, useEffect } from 'react';
import type { Level } from '../../engine/types';
import { allocateReducer, createAllocateState } from '../../engine/allocate';
import type { ArchetypeBoardProps } from '../MissionShell';
import '../../design/allocate.css';

export default function AllocateBoard({ level, onOutcome }: ArchetypeBoardProps) {
  const [state, dispatch] = useReducer(
    allocateReducer, 
    level.initialState as any,
    (init: any) => createAllocateState(init.targets, init.totalBudget, init.expectedTotalAllocation, init.requiredAllocations, init.timeLimit)
  );

  useEffect(() => {
    let finalIncident = state.incident;
    if (state.outcome === 'failure' && state.incident) {
      if (state.incident.includes('overloaded')) {
        const cluster = state.incident.includes('blue') ? 'BLUE' : 'GREEN';
        finalIncident = `WHAT HAPPENED\nYou overloaded the ${cluster} server cluster.\n\nWHY\nIncoming production traffic exceeded the total provisioned compute capacity of the active server nodes.\n\nDEVOPS CONCEPT\n${level.engineerMode.concept || 'Always ensure target environment capacity meets or exceeds incoming traffic demands before executing traffic migration.'}\n\nTRY AGAIN\nProvision additional server blades before routing traffic, or migrate traffic gradually.`;
      } else if (state.incident.includes('Budget')) {
        finalIncident = `WHAT HAPPENED\nYou exceeded the cluster infrastructure budget.\n\nWHY\nTotal provisioned nodes exceeded allowable resource limits for this deployment zone.\n\nDEVOPS CONCEPT\n${level.engineerMode.concept || 'Cost optimization and infrastructure budgeting are essential engineering constraints.'}\n\nTRY AGAIN\nDecommission idle legacy cluster blades before scaling up the new release cluster.`;
      } else {
        finalIncident = `WHAT HAPPENED\nDeployment rollout failed.\n\nWHY\n${state.incident}\n\nDEVOPS CONCEPT\n${level.engineerMode.concept || 'Zero-downtime deployments require coordinated traffic shifting.'}\n\nTRY AGAIN\nVerify traffic percentages and capacity allocations.`;
      }
    }
    onOutcome(state.outcome, finalIncident);
  }, [state.outcome, state.incident, level, onOutcome]);

  useEffect(() => {
    if (state.timeLimit && state.outcome === 'idle') {
      const timer = setInterval(() => {
        dispatch({ type: 'TICK' });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [state.timeLimit, state.outcome]);

  const handleSetTraffic = (delta: number) => {
    const currentBlue = state.targets['blue']?.allocation || 0;
    const newBlue = Math.max(0, Math.min(100, currentBlue + delta));
    dispatch({ type: 'UPDATE_ALLOCATION', targetId: 'blue', amount: newBlue });
    dispatch({ type: 'UPDATE_ALLOCATION', targetId: 'green', amount: 100 - newBlue });
  };

  const handleAdjustCapacity = (target: string, deltaNodes: number) => {
    const currentNodes = (state.targets[target]?.maxCapacity || 0) / 10;
    const newNodes = Math.max(1, Math.min(10, currentNodes + deltaNodes));
    dispatch({ type: 'UPDATE_CAPACITY', targetId: target, amount: newNodes * 10 });
  };

  const handleDeploy = () => {
    dispatch({ type: 'EVALUATE' });
  };

  const trafficBlue = state.targets['blue']?.allocation || 0;
  const trafficGreen = state.targets['green']?.allocation || 0;
  const nodesBlue = (state.targets['blue']?.maxCapacity || 0) / 10;
  const nodesGreen = (state.targets['green']?.maxCapacity || 0) / 10;

  const isBlueOverloaded = trafficBlue > nodesBlue * 10;
  const isGreenOverloaded = trafficGreen > nodesGreen * 10;

  const renderBlades = (count: number, activeLoad: number, isOverloaded: boolean) => {
    return Array.from({ length: 10 }).map((_, i) => {
      if (i >= count) {
        return (
          <div 
            key={i} 
            className="server-blade" 
            style={{ opacity: 0.15, borderStyle: 'dashed' }} 
          />
        );
      }
      const isHandlingLoad = (i * 10) < activeLoad;
      const bladeOverloaded = isOverloaded && isHandlingLoad;

      return (
        <div 
          key={i} 
          className={`server-blade ${bladeOverloaded ? 'overload' : isHandlingLoad ? 'active' : ''}`}
          title={`Blade #${i + 1}: ${bladeOverloaded ? 'OVERLOAD' : isHandlingLoad ? 'SERVING TRAFFIC' : 'STANDBY'}`}
        >
          <div className="blade-leds">
            <div className="blade-led" />
            <div className="blade-led" />
          </div>
          <div className="blade-fan" />
        </div>
      );
    });
  };

  return (
    <div className="allocate-game-container">
      {/* Left: Traffic Valve Routing Controls */}
      <div className="allocate-side-panel">
        <h3 className="allocate-panel-title">ROUTER CONTROL</h3>

        <div className="control-bay-card">
          <div className="bay-header">
            <span className="bay-label blue">BLUE CLUSTER</span>
            <span style={{ fontSize: '10px', color: 'var(--energy-active-cyan)' }}>V1 RELEASE</span>
          </div>
          <div className="bay-readout">{trafficBlue}%</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="pixel-button small" 
              onClick={() => handleSetTraffic(-10)} 
              disabled={state.outcome !== 'idle' || trafficBlue === 0}
              aria-label="Decrease Blue Traffic"
            >
              -10%
            </button>
            <button 
              className="pixel-button small" 
              onClick={() => handleSetTraffic(10)} 
              disabled={state.outcome !== 'idle' || trafficBlue === 100}
              aria-label="Increase Blue Traffic"
            >
              +10%
            </button>
          </div>
        </div>

        <div className="control-bay-card">
          <div className="bay-header">
            <span className="bay-label green">GREEN CLUSTER</span>
            <span style={{ fontSize: '10px', color: 'var(--energy-success-green)' }}>V2 RELEASE</span>
          </div>
          <div className="bay-readout">{trafficGreen}%</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="pixel-button small" 
              onClick={() => handleSetTraffic(10)} 
              disabled={state.outcome !== 'idle' || trafficGreen === 0}
              aria-label="Decrease Green Traffic"
            >
              -10%
            </button>
            <button 
              className="pixel-button small" 
              onClick={() => handleSetTraffic(-10)} 
              disabled={state.outcome !== 'idle' || trafficGreen === 100}
              aria-label="Increase Green Traffic"
            >
              +10%
            </button>
          </div>
        </div>
      </div>

      {/* Center: Infrastructure Floor Viewport */}
      <div className="server-floor-viewport">
        {/* Blue Environment Rack */}
        <div className={`cluster-zone blue ${isBlueOverloaded ? 'overloaded' : ''}`}>
          <div className="cluster-header">
            <div className="cluster-title">BLUE SERVER FARM (LEGACY)</div>
            <div className={`cluster-status-badge ${isBlueOverloaded ? 'overload' : 'stable'}`}>
              {isBlueOverloaded ? '⚠ OVERLOADED' : 'OPERATIONAL'}
            </div>
          </div>
          
          <div className="server-rack-row">
            {renderBlades(nodesBlue, trafficBlue, isBlueOverloaded)}
          </div>

          <div className="cluster-metrics">
            <span>TRAFFIC LOAD: {trafficBlue}%</span>
            <span>CAPACITY: {nodesBlue * 10} UNITS</span>
          </div>
        </div>

        {/* Green Environment Rack */}
        <div className={`cluster-zone green ${isGreenOverloaded ? 'overloaded' : ''}`}>
          <div className="cluster-header">
            <div className="cluster-title">GREEN SERVER FARM (TARGET)</div>
            <div className={`cluster-status-badge ${isGreenOverloaded ? 'overload' : 'stable'}`}>
              {isGreenOverloaded ? '⚠ OVERLOADED' : 'OPERATIONAL'}
            </div>
          </div>
          
          <div className="server-rack-row">
            {renderBlades(nodesGreen, trafficGreen, isGreenOverloaded)}
          </div>

          <div className="cluster-metrics">
            <span>TRAFFIC LOAD: {trafficGreen}%</span>
            <span>CAPACITY: {nodesGreen * 10} UNITS</span>
          </div>
        </div>
      </div>

      {/* Right: Blade Provisioning & Rollout Switch */}
      <div className="allocate-side-panel">
        <h3 className="allocate-panel-title">PROVISIONING</h3>

        <div className="control-bay-card">
          <div className="bay-header">
            <span className="bay-label blue">BLUE BLADES</span>
          </div>
          <div className="bay-readout">{nodesBlue * 10} CAP</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="pixel-button small" 
              onClick={() => handleAdjustCapacity('blue', -1)} 
              disabled={nodesBlue <= 1 || state.outcome !== 'idle'}
              aria-label="Decrease Blue Capacity"
            >
              - BLADE
            </button>
            <button 
              className="pixel-button small" 
              onClick={() => handleAdjustCapacity('blue', 1)} 
              disabled={nodesBlue >= 10 || state.outcome !== 'idle'}
              aria-label="Increase Blue Capacity"
            >
              + BLADE
            </button>
          </div>
        </div>

        <div className="control-bay-card">
          <div className="bay-header">
            <span className="bay-label green">GREEN BLADES</span>
          </div>
          <div className="bay-readout">{nodesGreen * 10} CAP</div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className="pixel-button small" 
              onClick={() => handleAdjustCapacity('green', -1)} 
              disabled={nodesGreen <= 1 || state.outcome !== 'idle'}
              aria-label="Decrease Green Capacity"
            >
              - BLADE
            </button>
            <button 
              className="pixel-button small" 
              onClick={() => handleAdjustCapacity('green', 1)} 
              disabled={nodesGreen >= 10 || state.outcome !== 'idle'}
              aria-label="Increase Green Capacity"
            >
              + BLADE
            </button>
          </div>
        </div>

        <div style={{ marginTop: 'auto' }}>
          {state.timeLimit && (
            <div style={{ color: 'var(--energy-danger-red)', fontFamily: 'var(--font-game-display)', fontSize: '13px', marginBottom: '12px', textAlign: 'center' }}>
              COUNTDOWN: {Math.max(0, state.timeLimit - state.tick)}s
            </div>
          )}

          <button
            className="pixel-button green"
            style={{ width: '100%', padding: '16px' }}
            onClick={handleDeploy}
            disabled={state.outcome !== 'idle'}
          >
            EXECUTE ROLLOUT
          </button>
        </div>
      </div>
    </div>
  );
}
