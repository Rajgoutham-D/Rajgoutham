"""
FastAPI Application for AI-Based Stone Quality Inspection and Defect Detection.
Provides image inspection endpoints, quality rule engine, and model status.
"""

import os
from pathlib import Path
from typing import Optional

import cv2
from fastapi import FastAPI, File, UploadFile, Query, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.detector import StoneDefectDetector
from app.quality_engine import evaluate_quality
from app.utils import bytes_to_cv2, cv2_to_base64, annotate_stone_image
from app.samples_catalog import ensure_samples_exist, SAMPLES_DIR

app = FastAPI(
    title="AI Stone Quality Inspection API",
    description="YOLO11 & OpenCV-based automated stone/granite defect detection and grading system.",
    version="1.0.0",
)

# Enable CORS for React frontend (default Vite port: 5173, or any origin during development)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize detector and ensure samples exist
detector = StoneDefectDetector()
ensure_samples_exist()


@app.get("/")
def read_root():
    return {
        "project": "AI-Based Stone Quality Inspection and Defect Detection",
        "prototype_version": "0.35",
        "status": "online",
        "detector": detector.get_status(),
    }


@app.get("/api/health")
def get_health():
    """Healthcheck endpoint returning system state and active detector."""
    return {
        "status": "healthy",
        "detector": detector.get_status(),
    }


@app.get("/api/samples")
def get_samples():
    """Returns available stone sample test images with base64 previews."""
    samples = ensure_samples_exist()
    enriched = []
    for s in samples:
        filepath = Path(s["file_path"])
        if filepath.exists():
            img_bgr = cv2.imread(str(filepath))
            if img_bgr is not None:
                # Generate thumbnail base64 for fast rendering
                thumb = cv2.resize(img_bgr, (240, 180))
                enriched.append({
                    **s,
                    "preview_base64": cv2_to_base64(thumb, "JPEG", quality=75),
                })
    return enriched


@app.post("/api/inspect")
async def inspect_stone(
    file: UploadFile = File(...),
    conf_threshold: float = Form(0.40),
    max_allowed_defects: int = Form(2),
    strict_mode: bool = Form(False),
):
    """
    Analyzes an uploaded granite/stone image:
    1. Detects defects via YOLO11 / OpenCV engine.
    2. Generates annotated image with bounding boxes & tags.
    3. Evaluates quality against PASS / REJECT standards.
    """
    # Validate content type
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be a valid image (JPEG, PNG, WEBP).")

    contents = await file.read()
    try:
        img_bgr = bytes_to_cv2(contents)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Image decoding failed: {str(e)}")

    h, w = img_bgr.shape[:2]

    # Perform Defect Detection
    defects, inference_ms = detector.detect(img_bgr, conf_threshold=conf_threshold)

    # Evaluate Quality (PASS / REJECT & Grading)
    quality_result = evaluate_quality(
        defects,
        max_allowed_minor_defects=max_allowed_defects,
        strict_mode=strict_mode,
    )

    # Render annotated image with OpenCV
    annotated_bgr = annotate_stone_image(img_bgr, defects)
    annotated_base64 = cv2_to_base64(annotated_bgr, "JPEG", quality=90)
    original_base64 = cv2_to_base64(img_bgr, "JPEG", quality=90)

    return {
        "filename": file.filename,
        "image_width": w,
        "image_height": h,
        "inference_time_ms": inference_ms,
        "detector_mode": detector.mode,
        "model_name": detector.model_name,
        "total_defects": len(defects),
        "defects": defects,
        "quality": quality_result,
        "original_image": original_base64,
        "annotated_image": annotated_base64,
    }


@app.post("/api/inspect-sample/{sample_id}")
def inspect_sample(
    sample_id: str,
    conf_threshold: float = Query(0.40),
    max_allowed_defects: int = Query(2),
    strict_mode: bool = Query(False),
):
    """Inspects a preset sample image by sample ID."""
    samples = ensure_samples_exist()
    target = next((s for s in samples if s["id"] == sample_id), None)
    if not target:
        raise HTTPException(status_code=404, detail=f"Sample '{sample_id}' not found.")

    filepath = Path(target["file_path"])
    img_bgr = cv2.imread(str(filepath))
    if img_bgr is None:
        raise HTTPException(status_code=500, detail="Could not read sample file from disk.")

    h, w = img_bgr.shape[:2]

    defects, inference_ms = detector.detect(img_bgr, conf_threshold=conf_threshold)
    quality_result = evaluate_quality(
        defects,
        max_allowed_minor_defects=max_allowed_defects,
        strict_mode=strict_mode,
    )

    annotated_bgr = annotate_stone_image(img_bgr, defects)
    annotated_base64 = cv2_to_base64(annotated_bgr, "JPEG", quality=90)
    original_base64 = cv2_to_base64(img_bgr, "JPEG", quality=90)

    return {
        "filename": target["filename"],
        "sample_name": target["name"],
        "image_width": w,
        "image_height": h,
        "inference_time_ms": inference_ms,
        "detector_mode": detector.mode,
        "model_name": detector.model_name,
        "total_defects": len(defects),
        "defects": defects,
        "quality": quality_result,
        "original_image": original_base64,
        "annotated_image": annotated_base64,
    }
