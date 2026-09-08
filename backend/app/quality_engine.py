"""
Quality Assessment Engine for Stone / Granite Defect Inspection.
Evaluates defect detections against industrial quality standards
to determine Grade (A, B, C) and PASS / REJECT status.
"""

from typing import List, Dict, Any

SEVERITY_LEVELS = {
    "crack": "CRITICAL",
    "edge_chip": "HIGH",
    "hole_pit": "MEDIUM",
    "scratch": "LOW",
    "stain": "LOW",
}

DEFECT_DISPLAY_NAMES = {
    "crack": "Structural Crack",
    "edge_chip": "Edge Chipping",
    "hole_pit": "Pitting / Surface Hole",
    "scratch": "Surface Scratch",
    "stain": "Color Stain / Impurity",
}

DEFECT_COLORS_RGB = {
    "crack": (239, 68, 68),      # Red
    "edge_chip": (249, 115, 22),  # Orange
    "hole_pit": (234, 179, 8),    # Yellow
    "scratch": (59, 130, 246),    # Blue
    "stain": (168, 85, 247),     # Purple
}


def evaluate_quality(
    defects: List[Dict[str, Any]],
    max_allowed_minor_defects: int = 2,
    strict_mode: bool = False
) -> Dict[str, Any]:
    """
    Evaluates detected defects and computes quality verdict, grade, and explanation.

    Defect schema:
    {
        "class_name": str,
        "confidence": float,
        "box": [x1, y1, x2, y2],
        ...
    }
    """
    total_defects = len(defects)

    # Count by category & severity
    defect_counts: Dict[str, int] = {}
    severity_counts = {"CRITICAL": 0, "HIGH": 0, "MEDIUM": 0, "LOW": 0}

    for d in defects:
        c_name = d.get("class_name", "defect").lower()
        defect_counts[c_name] = defect_counts.get(c_name, 0) + 1
        sev = SEVERITY_LEVELS.get(c_name, "MEDIUM")
        severity_counts[sev] = severity_counts.get(sev, 0) + 1
        d["severity"] = sev
        d["display_name"] = DEFECT_DISPLAY_NAMES.get(c_name, c_name.title())

    # Evaluation logic
    has_critical = severity_counts["CRITICAL"] > 0  # e.g., crack
    has_high = severity_counts["HIGH"] > 0          # e.g., edge chip
    total_medium = severity_counts["MEDIUM"]        # e.g., pit
    total_low = severity_counts["LOW"]              # e.g., scratch, stain

    reasons = []

    if total_defects == 0:
        verdict = "PASS"
        grade = "Grade A (Premium Quality)"
        status_code = "EXCELLENT"
        reasons.append("Zero surface defects detected. Stone meets premium grade standards.")
    elif strict_mode:
        verdict = "REJECT"
        grade = "Grade C (Substandard)"
        status_code = "REJECTED_STRICT"
        reasons.append(f"Strict inspection active: {total_defects} defect(s) detected.")
    elif has_critical:
        verdict = "REJECT"
        grade = "Grade C (Defective)"
        status_code = "REJECTED_CRITICAL"
        reasons.append(f"Detected {severity_counts['CRITICAL']} critical structural crack(s). Surface integrity compromised.")
    elif has_high and severity_counts["HIGH"] >= 1:
        verdict = "REJECT"
        grade = "Grade C (Defective)"
        status_code = "REJECTED_EDGE_CHIP"
        reasons.append(f"Edge chipping detected ({severity_counts['HIGH']}). Perimeter integrity compromised.")
    elif total_medium > 2 or total_defects > max_allowed_minor_defects:
        verdict = "REJECT"
        grade = "Grade C (Rejected)"
        status_code = "REJECTED_EXCESSIVE_DEFECTS"
        reasons.append(f"Defect density exceeds maximum allowable tolerance ({total_defects} > {max_allowed_minor_defects}).")
    else:
        # Minor defects within tolerance
        verdict = "PASS"
        grade = "Grade B (Standard Commercial)"
        status_code = "PASS_WITH_TOLERANCE"
        reasons.append(
            f"Tolerable minor defects found ({total_defects} minor issue(s)). Suitable for commercial use."
        )

    # Average confidence calculation
    avg_confidence = (
        round(sum(d.get("confidence", 0.0) for d in defects) / total_defects, 4)
        if total_defects > 0
        else 1.0
    )

    return {
        "verdict": verdict,                     # "PASS" | "REJECT"
        "grade": grade,                         # "Grade A" | "Grade B" | "Grade C"
        "status_code": status_code,
        "is_passed": verdict == "PASS",
        "total_defects": total_defects,
        "severity_breakdown": severity_counts,
        "defect_type_breakdown": defect_counts,
        "average_confidence": avg_confidence,
        "reasons": reasons,
    }
