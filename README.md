# AI-Based Stone Quality Inspection and Defect Detection
**35% Project Review Prototype**

An automated, intelligent industrial vision application for stone and granite quality control, leveraging **React (Frontend)**, **FastAPI (Backend)**, and **YOLO11 + OpenCV (Computer Vision & Deep Learning)**.

---

## 🎯 1st Review Key Deliverables Achieved (35% Milestone)

1. **Stone Image Upload & Live Preview**:
   - Drag-and-drop file upload zone (supports JPG, PNG, WEBP).
   - Instant file preview and metadata display (dimensions, file size).
   - Preloaded **1-Click Test Granite Samples** (Pristine, Fracture, Edge Chipping, Pores/Pitting, Discoloration Stain) for seamless viva/demo presentations.

2. **YOLO11-Ready AI Inspection Pipeline**:
   - Pluggable Ultralytics YOLO11 model loader looking for `backend/weights/best.pt`.
   - **Labelled Demo/Mock AI Inspection Engine**: An intelligent OpenCV feature analyzer (adaptive thresholding, morphology, blackhat transform, Lab chrominance separation) that detects physical anomalies, filters out normal granite mineral grain, and formats results identically to YOLO11 detection tensors (`[x1, y1, x2, y2]`, `confidence`, `class_name`, `class_id`).
   - Clear UI indicator displaying the active detection engine.

3. **Defect Detection & Bounding Box Overlays**:
   - Annotates stone images with color-coded bounding boxes, corner accents, and confidence badges.
   - Interactive viewer supporting:
     - **AI Annotated View** (with bounding boxes)
     - **Original View** (raw stone)
     - **Side-by-Side Comparison**
     - Zoom In / Zoom Out / Reset controls

4. **Defect Metrics & Breakdown**:
   - Real-time defect log table detailing:
     - Defect Name & Category
     - Severity Level (`CRITICAL`, `HIGH`, `MEDIUM`, `LOW`)
     - Confidence score (%)
     - Pixel bounding box coordinates `[x1, y1, x2, y2]`
     - Defect surface area (`px²`)

5. **PASS / REJECT Quality Verdict & Grading Engine**:
   - **PASS (Grade A - Premium Quality)**: Zero defects detected.
   - **PASS (Grade B - Standard Commercial)**: Minor superficial blemishes within tolerable thresholds.
   - **REJECT (Grade C - Defective / Substandard)**: Structural cracks, edge chips, or defect density exceeding tolerance.
   - Configurable sensitivity controls (Confidence Threshold slider, Max Tolerated Defects, Zero Tolerance strict mode).
   - One-click **JSON Inspection Report Export** and **Annotated Image Download**.

---

## 📁 System Architecture & Directory Structure

```
Rajgoutham/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI application & REST endpoints
│   │   ├── detector.py          # YOLO11 & OpenCV defect detection engine
│   │   ├── quality_engine.py    # PASS/REJECT rule engine & grading
│   │   ├── utils.py             # Image conversions & OpenCV bounding box renderer
│   │   └── samples_catalog.py   # Granite test sample generator & manager
│   ├── samples/                 # Generated granite test images
│   ├── weights/
│   │   └── README.md            # Guide for dropping in custom trained best.pt
│   ├── requirements.txt         # Backend Python dependencies
│   └── run_backend.py           # Backend startup runner (Port 8000)
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx             # System & model status navbar
│   │   │   ├── ImageUploader.jsx      # Drag-and-drop & Inspect Stone button
│   │   │   ├── SamplePicker.jsx       # 1-click test granite samples
│   │   │   ├── QualityBanner.jsx      # Large PASS/REJECT badge & metrics
│   │   │   ├── InspectionViewer.jsx   # Interactive bounding box viewer & zoom
│   │   │   ├── DefectTable.jsx        # Detailed defect log table
│   │   │   └── InspectionSettings.jsx # Confidence & tolerance sliders
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css                  # Modern industrial dark theme
│   ├── package.json
│   └── vite.config.js
├── run_project.bat              # 1-click Windows launcher for both servers
└── README.md                    # Project documentation
```

---

## 🚀 How to Run the Application

### Option A: Double-Click Launcher (Easiest for Windows)
Simply double-click:
```
run_project.bat
```
This automatically starts both the FastAPI backend and Vite frontend, and launches `http://localhost:5173` in your browser.

---

### Option B: Manual Terminal Execution

#### 1. Start the FastAPI Backend:
Open a terminal in the project directory:
```bash
cd backend
python run_backend.py
```
- API URL: `http://localhost:8000`
- Interactive Swagger API Docs: `http://localhost:8000/docs`

#### 2. Start the React Frontend:
Open a second terminal:
```bash
cd frontend
npm.cmd run dev
```
- Web Application URL: `http://localhost:5173`

---

## 🧠 How to Plug In Your Trained YOLO11 Model (`best.pt`)

When your custom trained YOLO11 weights are ready:
1. Copy your trained `.pt` file (e.g., `best.pt`) into the directory:
   ```
   backend/weights/best.pt
   ```
2. Restart the backend (or let Uvicorn auto-reload).
3. The detector will automatically detect `best.pt` and switch from **Hybrid Demo Mode** to **YOLO11 Custom Weights** mode without any code changes!

---

## 🎓 College Review & Viva Guide

### Frequently Asked Questions & Answers:

- **Q: Why use YOLO11 for stone defect detection?**
  - **A:** YOLO11 is state-of-the-art in single-stage object detection, offering ultra-low latency (~20-40ms on CPU) and high precision for localized defect isolation on manufacturing conveyor belts.

- **Q: How does the PASS / REJECT decision work?**
  - **A:** It uses an industrial rule engine (`quality_engine.py`) that evaluates both defect **frequency** and **severity**. Any structural crack or edge chip instantly triggers **REJECT** because it affects physical integrity, whereas minor cosmetic scratches or minor stains are evaluated against tolerance thresholds to assign **Grade A**, **Grade B**, or **Grade C (REJECT)**.

- **Q: How does the system handle different stone textures?**
  - **A:** The system applies bilateral filtering to preserve macroscopic fissure edges while smoothing out natural mineral grain noise (quartz/mica speckles), preventing false positives on natural granite textures.
