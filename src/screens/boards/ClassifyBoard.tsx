import React, { useReducer, useEffect, useState } from 'react';
import type { Level } from '../../engine/types';
import { classifyReducer, createClassifyState } from '../../engine/classify';
import type { Classification, Role } from '../../engine/classify';
import type { ArchetypeBoardProps } from '../MissionShell';
import '../../design/classify.css';

// 16-Bit Pixel Crate SVG Graphics
const CrateGraphic = ({ type, size = 32 }: { type: string; size?: number }) => {
  const t = type.toLowerCase();
  
  if (t.includes('secret') || t.includes('vault') || t.includes('key')) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <rect x="4" y="8" width="24" height="20" fill="#37475a" stroke="#0c1219" strokeWidth="2" />
        <rect x="10" y="4" width="12" height="6" fill="#f8d820" stroke="#0c1219" strokeWidth="1.5" />
        <circle cx="16" cy="18" r="4" fill="#f8d820" stroke="#0c1219" strokeWidth="1" />
        <rect x="15" y="20" width="2" height="4" fill="#0c1219" />
      </svg>
    );
  }

  if (t.includes('binary') || t.includes('artifact') || t.includes('bundle')) {
    return (
      <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
        <polygon points="16,2 30,10 30,24 16,30 2,24 2,10" fill="#2050e0" stroke="#0c1219" strokeWidth="2" />
        <polygon points="16,2 30,10 16,18 2,10" fill="#5c94fc" stroke="#0c1219" strokeWidth="1" />
        <line x1="16" y1="18" x2="16" y2="30" stroke="#0c1219" strokeWidth="2" />
      </svg>
    );
  }

  // Standard Container / Wooden Package Crate
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <rect x="4" y="6" width="24" height="22" fill="#8c5224" stroke="#0c1219" strokeWidth="2" />
      <line x1="4" y1="6" x2="28" y2="28" stroke="#5a3010" strokeWidth="2" />
      <line x1="28" y1="6" x2="4" y2="28" stroke="#5a3010" strokeWidth="2" />
      <rect x="4" y="6" width="24" height="22" fill="none" stroke="#adc2d6" strokeWidth="1" strokeDasharray="3 3" />
    </svg>
  );
};

export default function ClassifyBoard({ level, onOutcome }: ArchetypeBoardProps) {
  const [state, dispatch] = useReducer(
    classifyReducer, 
    level.initialState, 
    createClassifyState
  );
  
  const [activeItemId, setActiveItemId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    let finalIncident = state.incident;
    if (state.outcome === 'failure' && state.incident) {
      if (state.incident.includes('grants excessive access to')) {
        const match = state.incident.match(/SECURITY POLICY VIOLATION: (.*?) grants excessive access to (.*?). Enforce least privilege/);
        if (match) {
          const id = match[1];
          const role = match[2];
          const item = state.items[id];
          finalIncident = `WHAT HAPPENED\nYou granted ${role} access to ${id}.\n\nWHY\n${item?.description || 'This asset should not be exposed to unnecessary roles.'}\nThat grants ${role} excessive access permissions.\n\nDEVOPS CONCEPT\nLeast privilege dictates granting entities only the minimum permissions necessary to perform their required tasks.\n\nTRY AGAIN\nRemove ${role} access from ${id} and enforce tight least-privilege policies.`;
        }
      } else if (state.incident.includes('classified too broadly')) {
        const match = state.incident.match(/SECURITY POLICY VIOLATION: (.*?) classified too broadly/);
        if (match) {
          const id = match[1];
          const policy = state.policies[id];
          finalIncident = `WHAT HAPPENED\nYou assigned ${id} to ${policy?.classification || 'PUBLIC'}.\n\nWHY\nThis sensitive artifact contains confidential tokens/configurations that must not be exposed to broad environments.\n\nDEVOPS CONCEPT\nEnvironment and data isolation prevent credential leakage and unauthorized access across tiers.\n\nTRY AGAIN\nChange the classification for ${id} to a restricted tier (e.g. SECRET or SENSITIVE).`;
        }
      } else if (state.incident.includes('requires')) {
        const match = state.incident.match(/OPERATIONAL FAILURE: (.*?) requires (.*?) access to function properly/);
        if (match) {
          const id = match[1];
          const role = match[2];
          finalIncident = `WHAT HAPPENED\nYou blocked ${role} access for ${id}.\n\nWHY\nThe ${role} system requires read/execute permissions on this artifact to run pipeline jobs.\n\nDEVOPS CONCEPT\nAvailability is a cornerstone of pipeline security. Over-restricting necessary automation breaks CI/CD continuity.\n\nTRY AGAIN\nGrant ${role} access permissions for ${id}.`;
        }
      } else {
        finalIncident = `WHAT HAPPENED\nSecurity manifest verification failed.\n\nWHY\n${state.incident}\n\nDEVOPS CONCEPT\n${level.engineerMode.concept || 'Enforce proper security boundaries across all pipeline assets.'}\n\nTRY AGAIN\nReview asset classifications and role assignments.`;
      }
    }
    onOutcome(state.outcome, finalIncident);
  }, [state.outcome, state.incident, onOutcome, state.items, state.policies, level]);

  const handleItemClick = (itemId: string) => {
    setActiveItemId(itemId);
    setIsScanning(true);
    setTimeout(() => {
      setIsScanning(false);
    }, 600);
  };

  const handleSetClassification = (classification: Classification) => {
    if (!activeItemId) return;
    dispatch({ type: 'SET_CLASSIFICATION', itemId: activeItemId, classification });
  };

  const handleToggleRole = (role: Role) => {
    if (!activeItemId) return;
    dispatch({ type: 'TOGGLE_ROLE', itemId: activeItemId, role });
  };

  const handleApplyPolicy = () => {
    dispatch({ type: 'EVALUATE' });
  };

  const activeItem = activeItemId ? state.items[activeItemId] : null;
  const activePolicy = activeItemId ? state.policies[activeItemId] : null;

  const itemsArray = Object.values(state.items);
  const totalClassified = itemsArray.filter(i => state.policies[i.id]?.classification).length;
  const allClassified = totalClassified === itemsArray.length;

  const CLASSIFICATIONS = state.config?.classifications || ['PUBLIC', 'INTERNAL', 'SENSITIVE', 'SECRET'];
  const ROLES = state.config?.roles || ['DEV', 'CI', 'OPS', 'ADMIN'];

  return (
    <div className="classify-game-container">
      {/* Left: Warehouse Conveyor Bay */}
      <div className="classify-side-panel">
        <h3 className="classify-panel-title">INCOMING CRATES</h3>

        <div className="warehouse-conveyor-bay">
          {itemsArray.map(item => {
            const hasPolicy = !!state.policies[item.id]?.classification;
            const isSelected = activeItemId === item.id;

            return (
              <button
                key={item.id}
                className={`asset-crate-card ${isSelected ? 'active' : ''} ${hasPolicy ? 'routed' : ''}`}
                onClick={() => handleItemClick(item.id)}
                aria-label={`Inspect ${item.id}`}
              >
                <CrateGraphic type={item.type} size={28} />
                <div style={{ textAlign: 'left', flex: 1 }}>
                  <div style={{ fontFamily: 'var(--font-game-display)', fontSize: '11px', color: 'var(--ui-paper)' }}>
                    {item.id}
                  </div>
                  <div style={{ fontFamily: 'var(--font-game-clean)', fontSize: '11px', color: 'var(--machine-metal-light)' }}>
                    {item.type}
                  </div>
                </div>
                {hasPolicy && <span className="crate-status-stamp">ROUTED</span>}
              </button>
            );
          })}
        </div>

        <div style={{ fontFamily: 'var(--font-game-display)', fontSize: '10px', color: 'var(--machine-metal-light)', textAlign: 'center', borderTop: '2px solid var(--ui-ink)', paddingTop: '8px' }}>
          PROCESSED: {totalClassified} / {itemsArray.length}
        </div>
      </div>

      {/* Center: Laser Inspection Scanner Chamber */}
      <div className="scanner-viewport">
        {activeItem ? (
          <>
            <div className={`scanner-chamber ${isScanning ? 'scanning' : ''}`}>
              <CrateGraphic type={activeItem.type} size={64} />
            </div>

            <div className="scanner-crt-readout">
              <div className="scanner-crt-header">
                ARTIFACT ID // {activeItem.id}
              </div>
              
              {!isScanning ? (
                <>
                  <div className="crt-meta-row"><span>TYPE:</span> <strong>{activeItem.type}</strong></div>
                  <div className="crt-meta-row"><span>LOCATION:</span> <strong>{activeItem.location}</strong></div>
                  <div className="crt-meta-row"><span>OWNER:</span> <strong>{activeItem.owner}</strong></div>
                  {activeItem.metadata && Object.entries(activeItem.metadata).map(([k, v]) => (
                    <div className="crt-meta-row" key={k}><span>{k.toUpperCase()}:</span> <strong>{String(v)}</strong></div>
                  ))}
                  <div className="crt-desc">
                    {activeItem.description}
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--energy-active-cyan)', fontFamily: 'var(--font-game-display)', fontSize: '12px' }}>
                  SCANNING ARTIFACT SIGNATURE...
                </div>
              )}
            </div>
          </>
        ) : (
          <div style={{ color: 'var(--machine-metal-light)', fontFamily: 'var(--font-game-display)', fontSize: '13px', textAlign: 'center' }}>
            AWAITING CRATE SELECTION FOR SCANNING
          </div>
        )}
      </div>

      {/* Right: Security Classification & Access Clearance Switches */}
      <div className="classify-side-panel">
        <h3 className="classify-panel-title">ROUTING CONSOLE</h3>

        <div className="routing-group-box">
          <div className="routing-group-title">DESTINATION TIER</div>
          <div className="routing-switch-grid">
            {CLASSIFICATIONS.map(c => (
              <button
                key={c}
                className={`tactile-machine-switch ${activePolicy?.classification === c ? 'engaged' : ''}`}
                onClick={() => handleSetClassification(c)}
                disabled={!activeItem || state.outcome !== 'idle' || isScanning}
                aria-label={`Set classification ${c}`}
              >
                <span>{c}</span>
                <span className="switch-indicator-led" />
              </button>
            ))}
          </div>
        </div>

        <div className="routing-group-box">
          <div className="routing-group-title">ACCESS ROLES</div>
          <div className="routing-switch-grid">
            {ROLES.map(r => {
              const isSelected = activePolicy?.roles.includes(r);
              return (
                <button
                  key={r}
                  className={`tactile-machine-switch ${isSelected ? 'engaged' : ''}`}
                  onClick={() => handleToggleRole(r)}
                  disabled={!activeItem || state.outcome !== 'idle' || isScanning}
                  aria-label={`Toggle role ${r}`}
                >
                  <span>{r}</span>
                  <span className="switch-indicator-led" />
                </button>
              );
            })}
          </div>
        </div>

        <button
          className="pixel-button green"
          style={{ width: '100%', marginTop: 'auto', padding: '16px' }}
          disabled={!allClassified || state.outcome !== 'idle'}
          onClick={handleApplyPolicy}
        >
          EXECUTE MANIFEST
        </button>
      </div>
    </div>
  );
}
