"""
Image manipulation and annotation utilities using OpenCV and Pillow.
"""

import base64
import io
import cv2
import numpy as np
from PIL import Image
from typing import List, Dict, Any, Tuple

# Defect class styling colors (BGR for OpenCV)
CLASS_COLORS_BGR = {
    "crack": (68, 68, 239),       # Red
    "edge_chip": (22, 115, 249),  # Orange
    "hole_pit": (8, 179, 234),    # Yellow
    "scratch": (246, 130, 59),    # Blue
    "stain": (247, 85, 168),      # Purple
}
DEFAULT_COLOR_BGR = (180, 180, 180)


def bytes_to_cv2(image_bytes: bytes) -> np.ndarray:
    """Decodes raw image bytes into an OpenCV BGR numpy array."""
    np_arr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
    if img is None:
        raise ValueError("Failed to decode image with OpenCV")
    return img


def cv2_to_base64(img_bgr: np.ndarray, format: str = "JPEG", quality: int = 92) -> str:
    """Encodes an OpenCV BGR image to a base64 data URI string."""
    encode_param = [int(cv2.IMWRITE_JPEG_QUALITY), quality] if format.upper() == "JPEG" else []
    success, buffer = cv2.imencode(f".{format.lower()}", img_bgr, encode_param)
    if not success:
        raise ValueError("Failed to encode image to base64")
    b64_str = base64.b64encode(buffer).decode("utf-8")
    return f"data:image/{format.lower()};base64,{b64_str}"


def annotate_stone_image(
    img_bgr: np.ndarray,
    defects: List[Dict[str, Any]],
    show_labels: bool = True,
    show_confidence: bool = True
) -> np.ndarray:
    """
    Renders professional bounding boxes and defect labels on the image.
    Uses clean alpha-blended label backdrops for maximum readability.
    """
    canvas = img_bgr.copy()
    h, w = canvas.shape[:2]

    # Overlay for translucent backdrops
    overlay = canvas.copy()

    # Dynamic sizing based on image dimensions
    scale = max(0.45, min(w, h) / 1000.0)
    thickness = max(2, int(scale * 3.5))
    font = cv2.FONT_HERSHEY_SIMPLEX

    for idx, defect in enumerate(defects, 1):
        box = defect.get("box", [0, 0, 0, 0])
        x1, y1, x2, y2 = [int(v) for v in box]

        # Clip to image boundary
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(w - 1, x2), min(h - 1, y2)

        c_name = defect.get("class_name", "defect").lower()
        conf = defect.get("confidence", 0.0)
        disp_name = defect.get("display_name", c_name.title())

        color = CLASS_COLORS_BGR.get(c_name, DEFAULT_COLOR_BGR)

        # Draw bounding rectangle
        cv2.rectangle(canvas, (x1, y1), (x2, y2), color, thickness)

        # Corner accents for sleek modern look
        corner_len = min(20, int((x2 - x1) * 0.25), int((y2 - y1) * 0.25))
        if corner_len > 4:
            accent_thickness = thickness + 2
            # Top-left
            cv2.line(canvas, (x1, y1), (x1 + corner_len, y1), color, accent_thickness)
            cv2.line(canvas, (x1, y1), (x1, y1 + corner_len), color, accent_thickness)
            # Top-right
            cv2.line(canvas, (x2, y1), (x2 - corner_len, y1), color, accent_thickness)
            cv2.line(canvas, (x2, y1), (x2, y1 + corner_len), color, accent_thickness)
            # Bottom-left
            cv2.line(canvas, (x1, y2), (x1 + corner_len, y2), color, accent_thickness)
            cv2.line(canvas, (x1, y2), (x1, y2 - corner_len), color, accent_thickness)
            # Bottom-right
            cv2.line(canvas, (x2, y2), (x2 - corner_len, y2), color, accent_thickness)
            cv2.line(canvas, (x2, y2), (x2, y2 - corner_len), color, accent_thickness)

        # Prepare label text
        if show_labels and show_confidence:
            text = f"#{idx} {disp_name} {int(conf * 100)}%"
        elif show_labels:
            text = f"#{idx} {disp_name}"
        elif show_confidence:
            text = f"#{idx} {int(conf * 100)}%"
        else:
            text = f"#{idx}"

        # Text size calculation
        (tw, th), baseline = cv2.getTextSize(text, font, scale * 0.8, max(1, int(thickness * 0.6)))

        # Position label above or inside box
        label_y1 = max(0, y1 - th - 10)
        label_y2 = y1 if y1 - th - 10 >= 0 else y1 + th + 10
        label_x2 = min(w - 1, x1 + tw + 10)

        # Draw semi-transparent label badge background
        cv2.rectangle(overlay, (x1, label_y1), (label_x2, label_y2), color, -1)
        cv2.addWeighted(overlay, 0.85, canvas, 0.15, 0, canvas)

        # Draw text in white or dark depending on color
        text_y = label_y2 - 5 if label_y1 == y1 - th - 10 else y1 + th + 5
        cv2.putText(
            canvas,
            text,
            (x1 + 5, text_y),
            font,
            scale * 0.8,
            (255, 255, 255),
            max(1, int(thickness * 0.6)),
            cv2.LINE_AA,
        )

    return canvas
