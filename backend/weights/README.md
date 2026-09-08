# YOLO11 Weights Directory

Place your custom trained YOLO11 stone defect detection model weights file here.

### Accepted Filenames:
- `best.pt` (Recommended)
- `yolo11n-stone.pt`
- `yolo11_stone.pt`

### Fallback Behavior:
If no `.pt` weights file is placed in this directory, the backend automatically operates in **OpenCV-Powered Hybrid YOLO11 Inspection Mode**. This mode detects surface cracks, pits, chipping, and discolored stains using OpenCV computer vision algorithms and outputs the exact same detection structure (bounding boxes, class labels, confidence scores, defect count) as YOLO11.
