import React from 'react';
import { AlertCircle, CheckCircle, Tag, Crosshair, HelpCircle } from 'lucide-react';

const SEVERITY_BADGES = {
  CRITICAL: 'badge-red',
  HIGH: 'badge-red',
  MEDIUM: 'badge-amber',
  LOW: 'badge-blue',
};

const DEFECT_COLORS = {
  crack: '#ef4444',
  edge_chip: '#f97316',
  hole_pit: '#eab308',
  scratch: '#3b82f6',
  stain: '#a855f7',
};

export default function DefectTable({ defects }) {
  if (!defects || defects.length === 0) {
    return (
      <div className="card" style={{ marginTop: '20px' }}>
        <div style={{
          padding: '28px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '10px'
        }}>
          <div style={{
            width: '48px',
            height: '48px',
            borderRadius: '50%',
            background: 'var(--pass-green-bg)',
            border: '1px solid var(--pass-green-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <CheckCircle size={24} color="#10b981" />
          </div>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: '#34d399' }}>
            No Defects Detected
          </h4>
          <p style={{ fontSize: '0.82rem', maxWidth: '360px' }}>
            The stone specimen exhibits clean polish, uniform mineral dispersion, and zero structural fissures.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card" style={{ marginTop: '20px' }}>
      
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
        paddingBottom: '12px',
        borderBottom: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Tag size={18} color="#3b82f6" />
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff' }}>
            Detected Defect Log ({defects.length})
          </h3>
        </div>
        <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
          Bounding boxes scaled to pixel coordinates
        </span>
      </div>

      {/* Defect Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', textAlign: 'left' }}>
              <th style={{ padding: '10px 12px', fontWeight: 600 }}>#</th>
              <th style={{ padding: '10px 12px', fontWeight: 600 }}>Defect Name</th>
              <th style={{ padding: '10px 12px', fontWeight: 600 }}>Severity</th>
              <th style={{ padding: '10px 12px', fontWeight: 600 }}>Confidence</th>
              <th style={{ padding: '10px 12px', fontWeight: 600 }}>Bounding Box (x1, y1, x2, y2)</th>
              <th style={{ padding: '10px 12px', fontWeight: 600 }}>Defect Area</th>
            </tr>
          </thead>
          <tbody>
            {defects.map((d, index) => {
              const cName = d.class_name?.toLowerCase() || 'defect';
              const dotColor = DEFECT_COLORS[cName] || '#9ca3af';
              const severityBadge = SEVERITY_BADGES[d.severity] || 'badge-blue';
              const confPct = Math.round((d.confidence || 0) * 100);
              const [x1, y1, x2, y2] = d.box || [0, 0, 0, 0];

              return (
                <tr
                  key={index}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.04)',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-card-hover)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                >
                  <td style={{ padding: '12px', fontWeight: 700, color: 'var(--text-muted)' }}>
                    #{index + 1}
                  </td>
                  
                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        width: '10px',
                        height: '10px',
                        borderRadius: '50%',
                        backgroundColor: dotColor,
                        display: 'inline-block',
                        boxShadow: `0 0 8px ${dotColor}`
                      }} />
                      <span style={{ fontWeight: 600, color: '#ffffff' }}>
                        {d.display_name || d.class_name}
                      </span>
                    </div>
                  </td>

                  <td style={{ padding: '12px' }}>
                    <span className={`badge ${severityBadge}`} style={{ fontSize: '0.7rem' }}>
                      {d.severity || 'MEDIUM'}
                    </span>
                  </td>

                  <td style={{ padding: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{
                        width: '60px',
                        height: '6px',
                        background: 'rgba(255, 255, 255, 0.1)',
                        borderRadius: '3px',
                        overflow: 'hidden'
                      }}>
                        <div style={{
                          width: `${confPct}%`,
                          height: '100%',
                          background: confPct > 80 ? '#10b981' : (confPct > 60 ? '#3b82f6' : '#f59e0b'),
                          borderRadius: '3px'
                        }} />
                      </div>
                      <span style={{ fontWeight: 600, color: '#e5e7eb' }}>
                        {confPct}%
                      </span>
                    </div>
                  </td>

                  <td style={{ padding: '12px', fontFamily: 'JetBrains Mono', color: 'var(--text-secondary)', fontSize: '0.78rem' }}>
                    [{x1}, {y1}, {x2}, {y2}]
                  </td>

                  <td style={{ padding: '12px', color: 'var(--text-muted)' }}>
                    {d.area_px ? `${d.area_px.toLocaleString()} px²` : `${(x2 - x1) * (y2 - y1)} px²`}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
}
