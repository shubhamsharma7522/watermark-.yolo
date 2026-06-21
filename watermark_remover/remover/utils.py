"""Watermark detection and removal using fine-tuned YOLO + OpenCV inpainting."""
import logging
import os
import threading
from pathlib import Path

import cv2
import numpy as np
from django.conf import settings
from ultralytics import YOLO

logger = logging.getLogger(__name__)

_model = None
_model_lock = threading.Lock()


def get_model():
    global _model
    if _model is not None:
        return _model
    with _model_lock:
        if _model is not None:
            return _model
        model_path = Path(settings.YOLO_MODEL_LOCAL_DIR) / settings.YOLO_MODEL_FILENAME
        if not model_path.exists():
            raise FileNotFoundError(f"Model not found at {model_path}. Place best.pt in models/ folder.")
        _model = YOLO(str(model_path))
        logger.info("Fine-tuned YOLO model loaded from %s", model_path)
        return _model


def process_image(image_path: str) -> dict:
    img = cv2.imread(image_path)
    if img is None:
        raise ValueError("Could not read image. File may be corrupted.")

    model = get_model()
    results = model(image_path, conf=0.15)

    mask = np.zeros(img.shape[:2], dtype=np.uint8)
    boxes = results[0].boxes.xyxy if results[0].boxes is not None else []

    for box in boxes:
        x1, y1, x2, y2 = map(int, box)
        pad = 15
        cv2.rectangle(
            mask,
            (max(0, x1 - pad), max(0, y1 - pad)),
            (min(img.shape[1], x2 + pad), min(img.shape[0], y2 + pad)),
            255, -1,
        )

    if len(boxes) > 0:
        cleaned = cv2.inpaint(img, mask, inpaintRadius=5, flags=cv2.INPAINT_TELEA)
    else:
        cleaned = img.copy()

    basename = os.path.splitext(os.path.basename(image_path))[0]
    cleaned_filename = f"{basename}_cleaned.jpg"
    cleaned_path = os.path.join(settings.OUTPUT_DIR, cleaned_filename)
    cv2.imwrite(cleaned_path, cleaned)

    return {
        "original": os.path.relpath(image_path, settings.MEDIA_ROOT).replace("\\", "/"),
        "cleaned": os.path.relpath(cleaned_path, settings.MEDIA_ROOT).replace("\\", "/"),
        "watermarks_found": len(boxes),
    }
