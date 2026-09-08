import React, { useRef } from 'react';
import { UploadCloud, Image as ImageIcon, CheckCircle, Search, Trash2 } from 'lucide-react';

export default function ImageUploader({
  selectedFile,
  previewUrl,
  onFileSelect,
  onClearImage,
  onInspect,
  isInspecting
}) {
  const fileInputRef = useRef(null);

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        onFileSelect(file);
      }
    }
  };

  const handleFileInputChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  return (
    <div className="card" style={{ marginBottom: '18px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#ffffff', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UploadCloud size={16} color="#3b82f6" />
          Stone Specimen Upload
        </h3>
        {selectedFile && (
          <button
            onClick={onClearImage}
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
          >
            <Trash2 size={13} /> Clear
          </button>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileInputChange}
        accept="image/jpeg,image/png,image/webp"
        style={{ display: 'none' }}
      />

      {/* Upload Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !isInspecting && fileInputRef.current?.click()}
        style={{
          border: '2px dashed var(--border)',
          borderRadius: '10px',
          padding: '24px 16px',
          textAlign: 'center',
          cursor: isInspecting ? 'not-allowed' : 'pointer',
          background: previewUrl ? 'rgba(0,0,0,0.2)' : 'var(--bg-input)',
          transition: 'all 0.2s ease',
          position: 'relative'
        }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--border-focus)')}
        onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border)')}
      >
        {previewUrl ? (
          <div>
            <img
              src={previewUrl}
              alt="Stone Preview"
              style={{
                maxHeight: '140px',
                maxWidth: '100%',
                objectFit: 'contain',
                borderRadius: '6px',
                marginBottom: '10px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.4)'
              }}
            />
            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f3f4f6' }}>
              {selectedFile?.name || 'Selected Specimen'}
            </div>
            {selectedFile?.size && (
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                {(selectedFile.size / 1024).toFixed(1)} KB • Click to change
              </div>
            )}
          </div>
        ) : (
          <div>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              background: 'rgba(59, 130, 246, 0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 10px'
            }}>
              <UploadCloud size={22} color="#60a5fa" />
            </div>
            <p style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e5e7eb' }}>
              Drag & drop granite image here
            </p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              Supports JPG, PNG, WEBP (Max 15MB)
            </p>
          </div>
        )}
      </div>

      {/* Prominent Inspect Action Button */}
      <div style={{ marginTop: '14px' }}>
        <button
          onClick={onInspect}
          disabled={!previewUrl || isInspecting}
          className="btn-primary"
          style={{ width: '100%', padding: '13px', fontSize: '0.9rem' }}
        >
          {isInspecting ? (
            <>
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTopColor: '#ffffff',
                borderRadius: '50%'
              }} className="animate-spin-slow" />
              Inspecting Stone Specimen...
            </>
          ) : (
            <>
              <Search size={18} />
              Inspect Stone
            </>
          )}
        </button>
      </div>

    </div>
  );
}
