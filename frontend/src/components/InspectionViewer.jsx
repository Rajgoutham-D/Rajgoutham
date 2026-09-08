import React, { useState } from 'react';
import { Eye, EyeOff, Columns, Maximize2, Download, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

export default function InspectionViewer({ originalImage, annotatedImage, defects, isInspecting }) {
  const [viewMode, setViewMode] = useState('annotated'); // 'annotated' | 'original' | 'side-by-side'
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!originalImage && !annotatedImage) {
    return (
      <div className="card" style={{
        height: '460px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        borderStyle: 'dashed',
        borderColor: 'var(--border)',
        color: 'var(--text-muted)'
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: 'rgba(255, 255, 255, 0.03)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '14px'
        }}>
          <Eye size={30} color="var(--text-muted)" />
        </div>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          No Stone Image Loaded
        </h3>
        <p style={{ fontSize: '0.85rem', marginTop: '6px', maxWidth: '320px', textAlign: 'center' }}>
          Upload a granite slab image or click one of the quick test samples on the left to begin inspection.
        </p>
      </div>
    );
  }

  const handleDownload = () => {
    const link = document.createElement('a');
    link.download = `stone-inspection-${Date.now()}.jpg`;
    link.href = annotatedImage || originalImage;
    link.click();
  };

  const currentDisplayImage = viewMode === 'original' ? originalImage : (annotatedImage || originalImage);

  return (
    <div className="card" style={{ padding: '16px', position: 'relative' }}>
      
      {/* Viewer Header Toolbar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '14px',
        paddingBottom: '12px',
        borderBottom: '1px solid var(--border)'
      }}>
        
        {/* View Mode Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--bg-input)', padding: '4px', borderRadius: '8px' }}>
          <button
            onClick={() => setViewMode('annotated')}
            disabled={!annotatedImage}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              border: 'none',
              cursor: annotatedImage ? 'pointer' : 'not-allowed',
              background: viewMode === 'annotated' ? 'var(--accent-blue)' : 'transparent',
              color: viewMode === 'annotated' ? '#ffffff' : (annotatedImage ? 'var(--text-secondary)' : 'var(--text-muted)'),
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <Eye size={14} />
            AI Annotated
          </button>

          <button
            onClick={() => setViewMode('original')}
            style={{
              padding: '6px 12px',
              borderRadius: '6px',
              fontSize: '0.78rem',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              background: viewMode === 'original' ? 'var(--accent-blue)' : 'transparent',
              color: viewMode === 'original' ? '#ffffff' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s'
            }}
          >
            <EyeOff size={14} />
            Original Image
          </button>

          {annotatedImage && (
            <button
              onClick={() => setViewMode('side-by-side')}
              style={{
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '0.78rem',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
                background: viewMode === 'side-by-side' ? 'var(--accent-blue)' : 'transparent',
                color: viewMode === 'side-by-side' ? '#ffffff' : 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.2s'
              }}
            >
              <Columns size={14} />
              Side-by-Side
            </button>
          )}
        </div>

        {/* Zoom & Download Tools */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {viewMode !== 'side-by-side' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'var(--bg-input)', padding: '2px 6px', borderRadius: '6px' }}>
              <button
                onClick={() => setZoomLevel(prev => Math.max(0.6, prev - 0.2))}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                title="Zoom Out"
              >
                <ZoomOut size={15} />
              </button>
              <span style={{ fontSize: '0.75rem', minWidth: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel(prev => Math.min(2.5, prev + 0.2))}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                title="Zoom In"
              >
                <ZoomIn size={15} />
              </button>
              <button
                onClick={() => setZoomLevel(1)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}
                title="Reset Zoom"
              >
                <RotateCcw size={13} />
              </button>
            </div>
          )}

          <button
            onClick={handleDownload}
            className="btn-secondary"
            style={{ fontSize: '0.78rem', padding: '6px 12px' }}
            title="Download Image"
          >
            <Download size={14} />
            Save Image
          </button>
        </div>

      </div>

      {/* Main Image Stage */}
      <div style={{
        background: '#070a12',
        borderRadius: '10px',
        overflow: 'hidden',
        minHeight: '440px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        border: '1px solid rgba(255, 255, 255, 0.05)'
      }}>

        {isInspecting && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(11, 15, 25, 0.85)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 20,
            backdropFilter: 'blur(4px)'
          }}>
            <div style={{
              width: '50px',
              height: '50px',
              border: '3px solid rgba(59, 130, 246, 0.2)',
              borderTopColor: '#3b82f6',
              borderRadius: '50%',
              marginBottom: '16px'
            }} className="animate-spin-slow" />
            <p style={{ fontSize: '1rem', fontWeight: 600, color: '#ffffff' }}>
              Running YOLO11 Vision Inspection...
            </p>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Scanning surface anomalies, cracks, pitting, and edge fractures
            </p>
          </div>
        )}

        {viewMode === 'side-by-side' ? (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', width: '100%', height: '100%', padding: '10px' }}>
            <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', background: '#000' }}>
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                background: 'rgba(0,0,0,0.7)',
                color: '#fff',
                fontSize: '0.72rem',
                padding: '3px 8px',
                borderRadius: '4px',
                zIndex: 10
              }}>
                Raw Stone Surface
              </div>
              <img
                src={originalImage}
                alt="Raw Stone"
                style={{ width: '100%', height: '420px', objectFit: 'contain' }}
              />
            </div>
            <div style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', background: '#000' }}>
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                background: 'rgba(37, 99, 235, 0.85)',
                color: '#fff',
                fontSize: '0.72rem',
                padding: '3px 8px',
                borderRadius: '4px',
                zIndex: 10
              }}>
                YOLO11 Defects Annotated
              </div>
              <img
                src={annotatedImage}
                alt="Annotated Defects"
                style={{ width: '100%', height: '420px', objectFit: 'contain' }}
              />
            </div>
          </div>
        ) : (
          <div style={{
            overflow: 'auto',
            width: '100%',
            height: '460px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '12px'
          }}>
            <img
              src={currentDisplayImage}
              alt="Stone Specimen"
              style={{
                maxWidth: '100%',
                maxHeight: '430px',
                objectFit: 'contain',
                borderRadius: '6px',
                transform: `scale(${zoomLevel})`,
                transition: 'transform 0.15s ease-out'
              }}
            />
          </div>
        )}

        {/* Quick defect tag overlay */}
        {viewMode === 'annotated' && defects && defects.length > 0 && (
          <div style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            background: 'rgba(15, 23, 42, 0.88)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            backdropFilter: 'blur(8px)',
            borderRadius: '6px',
            padding: '6px 12px',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)'
          }}>
            <span style={{ color: '#ffffff', fontWeight: 600, marginRight: '6px' }}>
              {defects.length} Defect(s) Isolated
            </span>
            <span>(Bounding boxes highlighted)</span>
          </div>
        )}

      </div>
    </div>
  );
}
