import React from 'react';
import { ShieldCheck, Cpu, Activity, Sparkles, RefreshCw } from 'lucide-react';

export default function Header({ backendHealth, onRefreshHealth, isCheckingHealth }) {
  const isHealthy = backendHealth?.status === 'healthy';
  const detector = backendHealth?.detector;
  const isCustomYolo = detector?.is_custom_yolo;

  return (
    <header className="glass-panel" style={{ position: 'sticky', top: 0, zIndex: 50, borderBottom: '1px solid var(--border)' }}>
      <div style={{ maxWidth: '1440px', margin: '0 auto', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        
        {/* Brand & Project Identity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #2563eb, #7c3aed)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)'
          }}>
            <ShieldCheck size={26} color="#ffffff" />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', color: '#ffffff' }}>
                StoneGuard AI
              </h1>
              <span className="badge badge-blue" style={{ fontSize: '0.68rem', padding: '2px 8px' }}>
                35% Review Prototype
              </span>
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
              AI-Based Stone Quality Inspection & Defect Detection System
            </p>
          </div>
        </div>

        {/* System & Model Status Badges */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          
          {/* Active AI Model Indicator */}
          <div style={{
            background: 'var(--bg-input)',
            border: '1px solid var(--border)',
            borderRadius: '8px',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.78rem'
          }}>
            <Cpu size={16} color={isCustomYolo ? '#10b981' : '#38bdf8'} />
            <div>
              <span style={{ color: 'var(--text-muted)', marginRight: '6px' }}>Engine:</span>
              <span style={{ color: isCustomYolo ? '#34d399' : '#e0f2fe', fontWeight: 600 }}>
                {isCustomYolo ? 'YOLO11 Custom Weights' : 'YOLO11 / OpenCV Hybrid (Demo Mode)'}
              </span>
            </div>
          </div>

          {/* Backend Connection Status */}
          <div style={{
            background: isHealthy ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            border: `1px solid ${isHealthy ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
            borderRadius: '8px',
            padding: '6px 12px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '0.78rem'
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isHealthy ? '#10b981' : '#ef4444',
            }} className="pulse-glow" />
            <span style={{ color: isHealthy ? '#34d399' : '#f87171', fontWeight: 600 }}>
              {isHealthy ? 'FastAPI Backend Online' : 'Backend Disconnected'}
            </span>
            <button
              onClick={onRefreshHealth}
              disabled={isCheckingHealth}
              title="Refresh connection status"
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'inline-flex',
                padding: '2px',
                marginLeft: '4px'
              }}
            >
              <RefreshCw size={13} className={isCheckingHealth ? 'animate-spin-slow' : ''} />
            </button>
          </div>

        </div>

      </div>
    </header>
  );
}
