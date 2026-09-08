import React from 'react';
import { Sliders, RotateCcw } from 'lucide-react';

export default function InspectionSettings({
  confThreshold,
  setConfThreshold,
  maxAllowedDefects,
  setMaxAllowedDefects,
  strictMode,
  setStrictMode,
  onReset
}) {
  return (
    <div className="card" style={{ marginBottom: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={16} color="#38bdf8" />
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
            Inspection Criteria & Sensitivity
          </h3>
        </div>
        <button
          onClick={onReset}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--text-muted)',
            cursor: 'pointer',
            fontSize: '0.72rem',
            display: 'flex',
            alignItems: 'center',
            gap: '4px'
          }}
          title="Reset to defaults"
        >
          <RotateCcw size={12} />
          Reset
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        
        {/* Confidence Threshold */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>AI Confidence Threshold</span>
            <span style={{ fontWeight: 700, color: '#60a5fa' }}>{Math.round(confThreshold * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.20"
            max="0.90"
            step="0.05"
            value={confThreshold}
            onChange={(e) => setConfThreshold(parseFloat(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--accent-blue)', cursor: 'pointer' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            <span>Sensitive (20%)</span>
            <span>Strict (90%)</span>
          </div>
        </div>

        {/* Max Tolerated Minor Defects */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '6px' }}>
            <span style={{ color: 'var(--text-secondary)' }}>Max Allowable Minor Defects</span>
            <span style={{ fontWeight: 700, color: '#f59e0b' }}>{maxAllowedDefects} defects</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px' }}>
            {[1, 2, 3, 5].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => setMaxAllowedDefects(val)}
                style={{
                  padding: '6px',
                  borderRadius: '6px',
                  border: `1px solid ${maxAllowedDefects === val ? 'var(--border-focus)' : 'rgba(255, 255, 255, 0.08)'}`,
                  background: maxAllowedDefects === val ? 'rgba(59, 130, 246, 0.2)' : 'var(--bg-input)',
                  color: maxAllowedDefects === val ? '#93c5fd' : 'var(--text-secondary)',
                  fontWeight: 600,
                  fontSize: '0.75rem',
                  cursor: 'pointer'
                }}
              >
                {val}
              </button>
            ))}
          </div>
        </div>

        {/* Strict Zero-Defect Mode */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '8px 10px',
          background: 'rgba(0,0,0,0.2)',
          borderRadius: '8px',
          border: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <div>
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f3f4f6' }}>
              Zero Tolerance (Strict)
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              Reject on any single minor defect
            </div>
          </div>
          <input
            type="checkbox"
            checked={strictMode}
            onChange={(e) => setStrictMode(e.target.checked)}
            style={{ width: '16px', height: '16px', accentColor: 'var(--reject-red)', cursor: 'pointer' }}
          />
        </div>

      </div>
    </div>
  );
}
