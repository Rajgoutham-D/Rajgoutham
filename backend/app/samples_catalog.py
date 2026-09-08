"""
Sample Granite / Stone Image Catalog Generator.
Generates realistic granite surface textures with specific defects
(pristine, crack, edge chip, pitting, stain) so the demo can be tested instantly.
"""

import os
import cv2
import numpy as np
from pathlib import Path
from typing import List, Dict, Any

SAMPLES_DIR = Path(__file__).resolve().parent.parent / "samples"


def generate_granite_texture(w: int = 640, h: int = 480, base_color=(190, 185, 180)) -> np.ndarray:
    """Generates realistic speckled granite stone texture."""
    np.random.seed(42)
    # Base background
    canvas = np.full((h, w, 3), base_color, dtype=np.uint8)

    # Add low-frequency clouding/veining
    noise_low = np.random.normal(0, 15, (h // 4, w // 4)).astype(np.float32)
    noise_low = cv2.resize(noise_low, (w, h), interpolation=cv2.INTER_CUBIC)

    # Add high-frequency speckles (quartz, feldspar, mica grains)
    speckles_dark = (np.random.rand(h, w) > 0.94).astype(np.uint8) * 60
    speckles_light = (np.random.rand(h, w) > 0.96).astype(np.uint8) * 50

    for c in range(3):
        ch = canvas[:, :, c].astype(np.float32)
        ch += noise_low
        ch -= speckles_dark
        ch += speckles_light
        canvas[:, :, c] = np.clip(ch, 20, 240).astype(np.uint8)

    # Light blur to simulate natural polished stone
    canvas = cv2.GaussianBlur(canvas, (3, 3), 0)
    return canvas


def create_pristine_stone(w=640, h=480) -> np.ndarray:
    """Grade A pristine polished granite slab."""
    return generate_granite_texture(w, h, base_color=(185, 180, 175))


def create_cracked_stone(w=640, h=480) -> np.ndarray:
    """Granite slab with a sharp fracture/crack."""
    img = generate_granite_texture(w, h, base_color=(175, 170, 165))
    # Draw jagged crack line across stone
    pts = [
        (160, 110), (195, 155), (225, 190), (250, 240),
        (280, 275), (320, 310), (355, 365), (390, 420)
    ]
    # Add random jitter to simulate brittle fracture
    np.random.seed(101)
    jittered_pts = []
    for (x, y) in pts:
        jittered_pts.append((x + np.random.randint(-6, 7), y + np.random.randint(-6, 7)))

    pts_arr = np.array(jittered_pts, np.int32).reshape((-1, 1, 2))
    # Dark fissure line
    cv2.polylines(img, [pts_arr], False, (35, 30, 25), 3, lineType=cv2.LINE_AA)
    # Secondary micro-fissure branch
    branch = np.array([(250, 240), (295, 255), (330, 260)], np.int32).reshape((-1, 1, 2))
    cv2.polylines(img, [branch], False, (40, 35, 30), 2, lineType=cv2.LINE_AA)
    return img


def create_chipped_stone(w=640, h=480) -> np.ndarray:
    """Granite slab with corner/edge chipping defect."""
    img = generate_granite_texture(w, h, base_color=(180, 175, 170))
    # Create ragged edge chip on the top right
    chip_pts = np.array([
        (w - 75, 0), (w - 60, 45), (w - 30, 65), (w, 55), (w, 0)
    ], np.int32)
    # Fill chipped void with rough dark shadow / broken surface
    cv2.fillPoly(img, [chip_pts], (60, 55, 50))
    # Add rough texture inside chip
    for _ in range(120):
        rx = np.random.randint(w - 70, w)
        ry = np.random.randint(0, 60)
        cv2.circle(img, (rx, ry), 2, (30, 25, 20), -1)
    return img


def create_pitted_stone(w=640, h=480) -> np.ndarray:
    """Granite slab with surface pits / pores."""
    img = generate_granite_texture(w, h, base_color=(182, 178, 172))
    pits = [(190, 140, 14), (380, 220, 16), (280, 350, 12), (480, 160, 10)]
    for (px, py, r) in pits:
        # Dark pit center
        cv2.circle(img, (px, py), r, (45, 40, 35), -1)
        # Deep cavity shade
        cv2.circle(img, (px, py), max(2, r - 3), (25, 20, 15), -1)
        # Highlight rim
        cv2.ellipse(img, (px + 2, py + 2), (r, r), 0, 0, 180, (220, 215, 210), 1)
    return img


def create_stained_stone(w=640, h=480) -> np.ndarray:
    """Granite slab with chemical / rust discoloration stain."""
    img = generate_granite_texture(w, h, base_color=(188, 184, 180))
    # Create elliptical rust/oil stain in center
    stain_overlay = img.copy()
    cv2.ellipse(stain_overlay, (320, 240), (90, 60), 25, 0, 360, (70, 110, 190), -1) # BGR rust/brownish
    # Blend with high feathering
    cv2.addWeighted(stain_overlay, 0.45, img, 0.55, 0, img)
    img = cv2.GaussianBlur(img, (3, 3), 0)
    return img


def ensure_samples_exist() -> List[Dict[str, Any]]:
    """Generates preset sample stone images if not already saved on disk."""
    SAMPLES_DIR.mkdir(parents=True, exist_ok=True)

    catalog = [
        {
            "id": "sample_pristine",
            "name": "Pristine Polished Granite",
            "filename": "pristine_granite.jpg",
            "expected_verdict": "PASS",
            "expected_grade": "Grade A",
            "generator": create_pristine_stone,
            "description": "Zero surface flaws. Uniform grain density and specular polish.",
        },
        {
            "id": "sample_crack",
            "name": "Structural Surface Fracture",
            "filename": "cracked_granite.jpg",
            "expected_verdict": "REJECT",
            "expected_grade": "Grade C",
            "generator": create_cracked_stone,
            "description": "Deep brittle fissure line running through stone center.",
        },
        {
            "id": "sample_chipped",
            "name": "Edge Chipping & Breakage",
            "filename": "chipped_granite.jpg",
            "expected_verdict": "REJECT",
            "expected_grade": "Grade C",
            "generator": create_chipped_stone,
            "description": "Perimeter failure with broken corner chip.",
        },
        {
            "id": "sample_pitted",
            "name": "Surface Porosity & Pitting",
            "filename": "pitted_granite.jpg",
            "expected_verdict": "REJECT",
            "expected_grade": "Grade C",
            "generator": create_pitted_stone,
            "description": "Cluster of deep unpolished cavities / pores on surface.",
        },
        {
            "id": "sample_stained",
            "name": "Discoloration & Chemical Stain",
            "filename": "stained_granite.jpg",
            "expected_verdict": "PASS",
            "expected_grade": "Grade B",
            "generator": create_stained_stone,
            "description": "Superficial oil or rust oxidation stain on slab.",
        },
    ]

    results = []
    for item in catalog:
        filepath = SAMPLES_DIR / item["filename"]
        if not filepath.exists():
            img = item["generator"]()
            cv2.imwrite(str(filepath), img, [cv2.IMWRITE_JPEG_QUALITY, 92])

        results.append({
            "id": item["id"],
            "name": item["name"],
            "filename": item["filename"],
            "expected_verdict": item["expected_verdict"],
            "expected_grade": item["expected_grade"],
            "description": item["description"],
            "file_path": str(filepath),
        })

    return results
