import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SamplePicker from './components/SamplePicker';
import ImageUploader from './components/ImageUploader';
import InspectionSettings from './components/InspectionSettings';
import QualityBanner from './components/QualityBanner';
import InspectionViewer from './components/InspectionViewer';
import DefectTable from './components/DefectTable';
import { AlertCircle, FileText, CheckCircle2 } from 'lucide-react';

const API_BASE_URL = 'http://localhost:8000';

export default function App() {
  const [backendHealth, setBackendHealth] = useState(null);
  const [isCheckingHealth, setIsCheckingHealth] = useState(false);
  const [samples, setSamples] = useState([]);

  // Active specimen state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [selectedSampleId, setSelectedSampleId] = useState(null);

  // Inspection outcome
  const [inspectionResult, setInspectionResult] = useState(null);
  const [isInspecting, setIsInspecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Inspection settings
  const [confThreshold, setConfThreshold] = useState(0.40);
  const [maxAllowedDefects, setMaxAllowedDefects] = useState(2);
  const [strictMode, setStrictMode] = useState(false);

  // Check health and fetch samples on mount
  useEffect(() => {
    checkHealth();
    fetchSamples();
  }, []);

  const checkHealth = async () => {
    setIsCheckingHealth(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/health`);
      if (res.ok) {
        const data = await res.json();
        setBackendHealth(data);
      } else {
        setBackendHealth({ status: 'unhealthy' });
      }
    } catch (err) {
      console.warn('Backend connection failed:', err);
      setBackendHealth({ status: 'offline' });
    } finally {
      setIsCheckingHealth(false);
    }
  };

  const fetchSamples = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/samples`);
      if (res.ok) {
        const data = await res.json();
        setSamples(data);
      }
    } catch (err) {
      console.warn('Could not load samples:', err);
    }
  };

  const handleFileSelect = (file) => {
    setSelectedFile(file);
    setSelectedSampleId(null);
    setErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleSelectSample = async (sample) => {
    setSelectedSampleId(sample.id);
    setSelectedFile(null);
    setErrorMessage(null);
    setPreviewUrl(sample.preview_base64 || null);

    // Auto-inspect the sample immediately for a smooth 1-click presentation demo
    await runSampleInspection(sample.id);
  };

  const handleClearImage = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setSelectedSampleId(null);
    setInspectionResult(null);
    setErrorMessage(null);
  };

  const handleResetSettings = () => {
    setConfThreshold(0.40);
    setMaxAllowedDefects(2);
    setStrictMode(false);
  };

  const handleInspect = async () => {
    if (!previewUrl) return;

    if (selectedSampleId) {
      await runSampleInspection(selectedSampleId);
      return;
    }

    if (selectedFile) {
      await runFileUploadInspection(selectedFile);
    }
  };

  const runSampleInspection = async (sampleId) => {
    setIsInspecting(true);
    setErrorMessage(null);
    try {
      const queryParams = new URLSearchParams({
        conf_threshold: confThreshold,
        max_allowed_defects: maxAllowedDefects,
        strict_mode: strictMode,
      });

      const res = await fetch(`${API_BASE_URL}/api/inspect-sample/${sampleId}?${queryParams.toString()}`, {
        method: 'POST',
      });

      if (!res.ok) {
        throw new Error(`Server returned error: ${res.statusText}`);
      }

      const data = await res.json();
      setInspectionResult(data);
      if (data.original_image) {
        setPreviewUrl(data.original_image);
      }
    } catch (err) {
      console.error(err);
      setErrorMessage(`Inspection failed: ${err.message}. Ensure backend is running.`);
    } finally {
      setIsInspecting(false);
    }
  };

  const runFileUploadInspection = async (file) => {
    setIsInspecting(true);
    setErrorMessage(null);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('conf_threshold', confThreshold);
      formData.append('max_allowed_defects', maxAllowedDefects);
      formData.append('strict_mode', strictMode);

      const res = await fetch(`${API_BASE_URL}/api/inspect`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error(`Server returned error: ${res.statusText}`);
      }

      const data = await res.json();
      setInspectionResult(data);
    } catch (err) {
      console.error(err);
      setErrorMessage(`Inspection failed: ${err.message}. Ensure backend is running.`);
    } finally {
      setIsInspecting(false);
    }
  };

  const handleExportReport = () => {
    if (!inspectionResult) return;
    const reportData = {
      project: "AI-Based Stone Quality Inspection and Defect Detection",
      timestamp: new Date().toISOString(),
      specimen: inspectionResult.filename || inspectionResult.sample_name || "Custom Upload",
      verdict: inspectionResult.quality.verdict,
      grade: inspectionResult.quality.grade,
      reasons: inspectionResult.quality.reasons,
      total_defects: inspectionResult.total_defects,
      inference_time_ms: inspectionResult.inference_time_ms,
      detector_engine: inspectionResult.model_name,
      defects: inspectionResult.defects,
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stone-quality-report-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Navbar */}
      <Header
        backendHealth={backendHealth}
        onRefreshHealth={checkHealth}
        isCheckingHealth={isCheckingHealth}
      />

      {/* Main Container */}
      <main style={{ maxWidth: '1440px', margin: '0 auto', padding: '24px', width: '100%', flex: 1 }}>
        
        {/* Error Notification */}
        {errorMessage && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.4)',
            color: '#fca5a5',
            padding: '12px 18px',
            borderRadius: '10px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            fontSize: '0.85rem'
          }}>
            <AlertCircle size={18} color="#ef4444" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 370px) 1fr', gap: '24px', alignItems: 'start' }}>
          
          {/* Left Column: Controls & Upload */}
          <div>
            
            {/* 1-Click Quick Samples */}
            <SamplePicker
              samples={samples}
              selectedSampleId={selectedSampleId}
              onSelectSample={handleSelectSample}
              isInspecting={isInspecting}
            />

            {/* Image Uploader & Inspect Button */}
            <ImageUploader
              selectedFile={selectedFile}
              previewUrl={previewUrl}
              onFileSelect={handleFileSelect}
              onClearImage={handleClearImage}
              onInspect={handleInspect}
              isInspecting={isInspecting}
            />

            {/* Inspection Settings */}
            <InspectionSettings
              confThreshold={confThreshold}
              setConfThreshold={setConfThreshold}
              maxAllowedDefects={maxAllowedDefects}
              setMaxAllowedDefects={setMaxAllowedDefects}
              strictMode={strictMode}
              setStrictMode={setStrictMode}
              onReset={handleResetSettings}
            />

          </div>

          {/* Right Column: Visualizer & Defect Data */}
          <div>
            
            {/* PASS / REJECT Quality Verdict Banner */}
            {inspectionResult && (
              <QualityBanner
                result={inspectionResult}
                onExportReport={handleExportReport}
              />
            )}

            {/* Stone Image & Bounding Box Inspection Viewer */}
            <InspectionViewer
              originalImage={inspectionResult?.original_image || previewUrl}
              annotatedImage={inspectionResult?.annotated_image}
              defects={inspectionResult?.defects}
              isInspecting={isInspecting}
            />

            {/* Detailed Defect Log Table */}
            {inspectionResult && (
              <DefectTable defects={inspectionResult?.defects} />
            )}

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '16px 24px',
        textAlign: 'center',
        fontSize: '0.78rem',
        color: 'var(--text-muted)',
        background: '#080c14'
      }}>
        College Project: AI-Based Stone Quality Inspection and Defect Detection • Powered by React, FastAPI, YOLO11 & OpenCV
      </footer>

    </div>
  );
}
