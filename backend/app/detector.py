"""
Stone Defect Detection Engine.
Integrates Ultralytics YOLO11 with an OpenCV-based heuristic defect analyzer fallback.
Distinguishes between natural granite speckles/grain and actual physical anomalies.
"""

import os
import time
import numpy as np
import cv2
from typing import List, Dict, Any, Tuple
from pathlib import Path

# Check if ultralytics is available
try:
    from ultralytics import YOLO
    ULTRALYTICS_AVAILABLE = True
except Exception:
    ULTRALYTICS_AVAILABLE = False


class StoneDefectDetector:
    def __init__(self, weights_dir: str = None):
        if weights_dir is None:
            base_dir = Path(__file__).resolve().parent.parent
            self.weights_dir = base_dir / "weights"
        else:
            self.weights_dir = Path(weights_dir)

        self.model = None
        self.model_name = "None"
        self.mode = "HYBRID_OPENCV_DEMO"
        self.classes = ["crack", "edge_chip", "hole_pit", "scratch", "stain"]

        self._initialize_model()

    def _initialize_model(self):
        """Scans for custom YOLO11 weights or initializes demo mode."""
        candidate_weights = [
            self.weights_dir / "best.pt",
            self.weights_dir / "yolo11n-stone.pt",
            self.weights_dir / "yolo11_stone.pt",
            self.weights_dir / "stone_defect_yolo11.pt",
        ]

        found_weights = None
        for p in candidate_weights:
            if p.exists() and p.is_file():
                found_weights = p
                break

        if found_weights and ULTRALYTICS_AVAILABLE:
            try:
                print(f"[StoneDefectDetector] Loading custom YOLO11 model: {found_weights}")
                self.model = YOLO(str(found_weights))
                self.model_name = found_weights.name
                self.mode = "YOLO11_CUSTOM_WEIGHTS"
                if hasattr(self.model, "names") and isinstance(self.model.names, dict):
                    self.classes = list(self.model.names.values())
                return
            except Exception as e:
                print(f"[StoneDefectDetector] Warning: Could not load {found_weights}: {e}")

        self.mode = "HYBRID_OPENCV_DEMO"
        self.model_name = "YOLO11-Compliant OpenCV Defect Analyzer (Demo Mode)"
        print(f"[StoneDefectDetector] Active mode: {self.model_name}")

    def get_status(self) -> Dict[str, Any]:
        """Returns the current detector configuration and status."""
        return {
            "mode": self.mode,
            "model_name": self.model_name,
            "is_custom_yolo": self.mode == "YOLO11_CUSTOM_WEIGHTS",
            "ultralytics_available": ULTRALYTICS_AVAILABLE,
            "weights_dir": str(self.weights_dir),
            "supported_classes": self.classes,
        }

    def detect(
        self,
        img_bgr: np.ndarray,
        conf_threshold: float = 0.40,
        iou_threshold: float = 0.40
    ) -> Tuple[List[Dict[str, Any]], float]:
        """
        Executes stone defect detection.
        Returns (defects_list, inference_time_ms).
        """
        start_time = time.perf_counter()

        if self.mode == "YOLO11_CUSTOM_WEIGHTS" and self.model is not None:
            defects = self._detect_yolo(img_bgr, conf_threshold, iou_threshold)
        else:
            defects = self._detect_opencv_heuristics(img_bgr, conf_threshold)

        elapsed_ms = round((time.perf_counter() - start_time) * 1000, 2)
        return defects, elapsed_ms

    def _detect_yolo(
        self,
        img_bgr: np.ndarray,
        conf_threshold: float,
        iou_threshold: float
    ) -> List[Dict[str, Any]]:
        """Inference with custom YOLO11 model."""
        results = self.model.predict(
            source=img_bgr,
            conf=conf_threshold,
            iou=iou_threshold,
            verbose=False
        )

        defects = []
        if not results or len(results) == 0:
            return defects

        result = results[0]
        boxes = result.boxes
        if boxes is None or len(boxes) == 0:
            return defects

        for box in boxes:
            xyxy = box.xyxy[0].cpu().numpy()
            conf = float(box.conf[0].cpu().numpy())
            cls_id = int(box.cls[0].cpu().numpy())
            class_name = self.classes[cls_id] if cls_id < len(self.classes) else f"defect_{cls_id}"

            x1, y1, x2, y2 = [int(v) for v in xyxy]
            defects.append({
                "class_id": cls_id,
                "class_name": class_name,
                "confidence": round(conf, 4),
                "box": [x1, y1, x2, y2],
                "area_px": int((x2 - x1) * (y2 - y1)),
            })

        return defects

    def _detect_opencv_heuristics(
        self,
        img_bgr: np.ndarray,
        conf_threshold: float = 0.40
    ) -> List[Dict[str, Any]]:
        """
        Robust OpenCV defect analyzer designed specifically for stone / granite inspection.
        Filters out natural granite grain speckles and accurately isolates:
        - Structural cracks & fractures (continuous high-contrast line features)
        - Edge chips (voids along the perimeter)
        - Pitting / cavities (distinct deep dark localized holes)
        - Chemical stains / color blotches (chrominance divergence)
        """
        h, w = img_bgr.shape[:2]
        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
        defects = []

        mean_val, std_val = cv2.meanStdDev(gray)
        mean_intensity = float(mean_val[0][0])
        std_intensity = float(std_val[0][0])

        # -------------------------------------------------------------
        # 1. Crack Detection (Continuous Line Features)
        # -------------------------------------------------------------
        # Heavy bilateral filter to smooth out high-frequency mineral speckles
        smooth_crack = cv2.bilateralFilter(gray, d=9, sigmaColor=75, sigmaSpace=75)
        
        # Black top-hat transform isolates dark thin fissures
        kernel_hat = cv2.getStructuringElement(cv2.MORPH_RECT, (11, 11))
        blackhat = cv2.morphologyEx(smooth_crack, cv2.MORPH_BLACKHAT, kernel_hat)

        # Threshold dark lines that stand out from local grain
        thresh_val = max(24, int(std_intensity * 1.5))
        _, crack_thresh = cv2.threshold(blackhat, thresh_val, 255, cv2.THRESH_BINARY)

        # Connect fragmented crack segments
        kernel_connect = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
        connected_cracks = cv2.morphologyEx(crack_thresh, cv2.MORPH_CLOSE, kernel_connect, iterations=2)

        contours, _ = cv2.findContours(connected_cracks, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

        for cnt in contours:
            area = cv2.contourArea(cnt)
            # Must be substantial enough to be a macroscopic crack, not grain
            if area < 180:
                continue

            x, y, bw, bh = cv2.boundingRect(cnt)
            span = max(bw, bh)
            aspect_ratio = float(bw) / bh if bh > 0 else 1.0

            # Crack line span must be at least 65px or have high aspect ratio
            if span >= 65 and (aspect_ratio > 2.0 or aspect_ratio < 0.5 or area > 350):
                conf = min(0.96, 0.84 + (span / max(w, h)) * 0.2)
                if conf >= conf_threshold:
                    pad = 12
                    defects.append({
                        "class_id": 0,
                        "class_name": "crack",
                        "confidence": round(conf, 4),
                        "box": [max(0, x - pad), max(0, y - pad), min(w - 1, x + bw + pad), min(h - 1, y + bh + pad)],
                        "area_px": bw * bh,
                    })

        # -------------------------------------------------------------
        # 2. Edge Chipping Detection
        # -------------------------------------------------------------
        # Edge chips appear as dark/irregular notches near image boundaries
        edge_zone_size = int(min(w, h) * 0.15)
        # Mask for stone perimeter
        border_mask = np.zeros((h, w), dtype=np.uint8)
        border_mask[0:edge_zone_size, :] = 255
        border_mask[h - edge_zone_size:h, :] = 255
        border_mask[:, 0:edge_zone_size] = 255
        border_mask[:, w - edge_zone_size:w] = 255

        # Check for deep dark regions or abrupt missing corners near edges
        _, dark_regions = cv2.threshold(smooth_crack, int(mean_intensity - std_intensity * 1.8), 255, cv2.THRESH_BINARY_INV)
        edge_anomalies = cv2.bitwise_and(dark_regions, border_mask)
        
        kernel_edge = cv2.getStructuringElement(cv2.MORPH_RECT, (7, 7))
        edge_anomalies = cv2.morphologyEx(edge_anomalies, cv2.MORPH_CLOSE, kernel_edge)

        e_contours, _ = cv2.findContours(edge_anomalies, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for ecnt in e_contours:
            e_area = cv2.contourArea(ecnt)
            if e_area > 450:  # Significant chip void
                ex, ey, ebw, ebh = cv2.boundingRect(ecnt)
                # Confirm it touches the image perimeter
                touches_edge = (ex <= 5 or ey <= 5 or (ex + ebw) >= w - 5 or (ey + ebh) >= h - 5)
                if touches_edge:
                    conf = min(0.95, 0.82 + (e_area / 3000.0) * 0.15)
                    if conf >= conf_threshold:
                        pad = 10
                        defects.append({
                            "class_id": 1,
                            "class_name": "edge_chip",
                            "confidence": round(conf, 4),
                            "box": [max(0, ex - pad), max(0, ey - pad), min(w - 1, ex + ebw + pad), min(h - 1, ey + ebh + pad)],
                            "area_px": ebw * ebh,
                        })

        # -------------------------------------------------------------
        # 3. Pores & Deep Surface Pitting (Holes)
        # -------------------------------------------------------------
        # Cavities are roundish, significantly darker than surrounding polished surface
        dark_cavities = (gray < (mean_intensity - std_intensity * 2.2)).astype(np.uint8) * 255
        # Exclude edge zones already covered by edge chips
        inner_cavities = cv2.bitwise_and(dark_cavities, cv2.bitwise_not(border_mask))

        p_contours, _ = cv2.findContours(inner_cavities, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for pcnt in p_contours:
            p_area = cv2.contourArea(pcnt)
            if 50 < p_area < 800:
                px, py, pbw, pbh = cv2.boundingRect(pcnt)
                perimeter = cv2.arcLength(pcnt, True)
                circularity = (4 * np.pi * p_area) / (perimeter * perimeter) if perimeter > 0 else 0
                if circularity > 0.45:
                    conf = min(0.94, 0.78 + (circularity * 0.15))
                    if conf >= conf_threshold:
                        pad = 8
                        defects.append({
                            "class_id": 2,
                            "class_name": "hole_pit",
                            "confidence": round(conf, 4),
                            "box": [max(0, px - pad), max(0, py - pad), min(w - 1, px + pbw + pad), min(h - 1, py + pbh + pad)],
                            "area_px": pbw * pbh,
                        })

        # -------------------------------------------------------------
        # 4. Color Stain / Chemical Discoloration
        # -------------------------------------------------------------
        lab = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2LAB)
        _, a_ch, b_ch = cv2.split(lab)

        # Heavy blur to eliminate local grain texture
        a_blur = cv2.GaussianBlur(a_ch, (35, 35), 0)
        b_blur = cv2.GaussianBlur(b_ch, (35, 35), 0)

        mean_a, std_a = cv2.meanStdDev(a_blur)
        mean_b, std_b = cv2.meanStdDev(b_blur)

        # Significant chromatic shift
        stain_thresh_a = int(mean_a[0][0] + max(16.0, std_a[0][0] * 3.0))
        stain_thresh_b = int(mean_b[0][0] + max(16.0, std_b[0][0] * 3.0))

        stain_a = (a_blur > stain_thresh_a).astype(np.uint8) * 255
        stain_b = (b_blur > stain_thresh_b).astype(np.uint8) * 255
        stain_mask = cv2.bitwise_or(stain_a, stain_b)

        s_contours, _ = cv2.findContours(stain_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        for scnt in s_contours:
            s_area = cv2.contourArea(scnt)
            if s_area > 1500:  # Large chromatic blotch
                sx, sy, sbw, sbh = cv2.boundingRect(scnt)
                conf = min(0.93, 0.79 + (s_area / (w * h * 0.1)) * 0.15)
                if conf >= conf_threshold:
                    pad = 10
                    defects.append({
                        "class_id": 4,
                        "class_name": "stain",
                        "confidence": round(conf, 4),
                        "box": [max(0, sx - pad), max(0, sy - pad), min(w - 1, sx + sbw + pad), min(h - 1, sy + sbh + pad)],
                        "area_px": sbw * sbh,
                    })

        # Apply NMS to eliminate overlapping boxes
        defects = self._apply_nms(defects, iou_thresh=0.35)
        return defects

    def _apply_nms(self, defects: List[Dict[str, Any]], iou_thresh: float = 0.35) -> List[Dict[str, Any]]:
        """Removes duplicate / overlapping bounding boxes."""
        if not defects:
            return []

        boxes = [d["box"] for d in defects]
        scores = [d["confidence"] for d in defects]

        indices = cv2.dnn.NMSBoxes(
            bboxes=[[b[0], b[1], b[2] - b[0], b[3] - b[1]] for b in boxes],
            scores=scores,
            score_threshold=0.0,
            nms_threshold=iou_thresh
        )

        filtered = []
        if len(indices) > 0:
            for idx in indices.flatten():
                filtered.append(defects[idx])
        return filtered
