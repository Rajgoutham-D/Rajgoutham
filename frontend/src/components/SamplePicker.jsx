import React from 'react';
import { Sparkles, Check, ChevronRight } from 'lucide-react';

export default function SamplePicker({ samples, selectedSampleId, onSelectSample, isInspecting }) {
  if (!samples || samples.length === 0) return null;

  return (
    <div className="card" style={{ marginBottom: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color="#f59e0b" />
          <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff' }}>
            Quick Demo Samples (1-Click Test)
          </h3>
        </div>
        <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
          Click to load & inspect
        </span>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {samples.map((sample) => {
          const isSelected = selectedSampleId === sample.id;
          const isPassExpected = sample.expected_verdict === 'PASS';

          return (
            <div
              key={sample.id}
              onClick={() => !isInspecting && onSelectSample(sample)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '8px 10px',
                borderRadius: '8px',
                background: isSelected ? 'rgba(37, 99, 235, 0.16)' : 'var(--bg-input)',
                border: `1px solid ${isSelected ? 'var(--border-focus)' : 'rgba(255, 255, 255, 0.05)'}`,
                cursor: isInspecting ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => {
                if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.2)';
              }}
              onMouseLeave={(e) => {
                if (!isSelected) e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.05)';
              }}
            >
              {/* Thumbnail + Details */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {sample.preview_base64 && (
                  <img
                    src={sample.preview_base64}
                    alt={sample.name}
                    style={{
                      width: '44px',
                      height: '34px',
                      objectFit: 'cover',
                      borderRadius: '4px',
                      border: '1px solid rgba(255,255,255,0.1)'
                    }}
                  />
                )}
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f3f4f6' }}>
                    {sample.name}
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                    {sample.description?.slice(0, 36)}...
                  </div>
                </div>
              </div>

              {/* Expected Verdict Tag */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  className={`badge ${isPassExpected ? 'badge-green' : 'badge-red'}`}
                  style={{ fontSize: '0.68rem', padding: '2px 8px' }}
                >
                  {sample.expected_verdict}
                </span>
                <ChevronRight size={14} color="var(--text-muted)" />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
