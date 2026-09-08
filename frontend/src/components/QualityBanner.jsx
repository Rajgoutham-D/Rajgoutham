import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle, Clock, Target, Layers, FileDown } from 'lucide-react';

export default function QualityBanner({ result, onExportReport }) {
  if (!result || !result.quality) return null;

  const { verdict, grade, is_passed, total_defects, average_confidence, reasons, severity_breakdown } = result.quality;
  const inferenceMs = result.inference_time_ms;

  const isPass = is_passed;

  return (
    <div
      className={`card ${isPass ? 'glow-green' : 'glow-red'}`}
      style={{
        background: isPass ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.08) 0%, rgba(17, 24, 39, 0.95) 100%)' : 'linear-gradient(180deg, rgba(239, 68, 68, 0.08) 0%, rgba(17, 24, 39, 0.95) 100%)',
        borderColor: isPass ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)',
        padding: '24px',
        marginBottom: '20px'
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Main Verdict & Grade */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: isPass ? 'rgba(16, 185, 129, 0.18)' : 'rgba(239, 68, 68, 0.18)',
            border: `2px solid ${isPass ? 'rgba(16, 185, 129, 0.6)' : 'rgba(239, 68, 68, 0.6)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {isPass ? (
              <CheckCircle2 size={38} color="#10b981" />
            ) : (
              <XCircle size={38} color="#ef4444" />
            )}
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <h2 style={{
                fontSize: '2rem',
                fontWeight: 800,
                letterSpacing: '-0.03em',
                color: isPass ? '#34d399' : '#f87171'
              }}>
                QUALITY {verdict}
              </h2>
              <span className={`badge ${isPass ? 'badge-green' : 'badge-red'}`} style={{ fontSize: '0.85rem', padding: '4px 12px' }}>
                {grade}
              </span>
            </div>

            <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {reasons && reasons.length > 0 ? reasons[0] : (isPass ? 'Stone passed standard tolerance check.' : 'Defects exceed tolerance.')}
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div>
          <button
            onClick={onExportReport}
            className="btn-secondary"
            style={{ fontSize: '0.82rem', padding: '8px 14px' }}
          >
            <FileDown size={16} />
            Export JSON Report
          </button>
        </div>

      </div>

      {/* Metric Tiles Bar */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '12px',
        marginTop: '20px',
        paddingTop: '18px',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        
        {/* Total Defects */}
        <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Layers size={14} /> Total Defects
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '4px', color: total_defects === 0 ? '#34d399' : '#fca5a5' }}>
            {total_defects}
          </div>
        </div>

        {/* Inference Latency */}
        <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Clock size={14} /> AI Latency
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '4px', color: '#60a5fa' }}>
            {inferenceMs} <span style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-muted)' }}>ms</span>
          </div>
        </div>

        {/* Average Confidence */}
        <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <Target size={14} /> Avg Confidence
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '4px', color: '#a78bfa' }}>
            {Math.round(average_confidence * 100)}%
          </div>
        </div>

        {/* Critical Issues */}
        <div style={{ background: 'rgba(0, 0, 0, 0.25)', padding: '10px 14px', borderRadius: '10px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            <AlertTriangle size={14} /> Critical Severity
          </div>
          <div style={{ fontSize: '1.4rem', fontWeight: 700, marginTop: '4px', color: (severity_breakdown?.CRITICAL || 0) > 0 ? '#ef4444' : '#9ca3af' }}>
            {severity_breakdown?.CRITICAL || 0}
          </div>
        </div>

      </div>
    </div>
  );
}
