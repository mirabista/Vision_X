"""
OCRAgent - Performs OCR on images using Tesseract.
Extracts text with confidence scores and bounding box regions.
"""

from __future__ import annotations

from typing import Any, Dict, List

from backend.core.logging import get_logger
from backend.services.agents.base_agent import BaseAgent

logger = get_logger(__name__)

try:
    import pytesseract
    from pytesseract import Output
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False
    logger.warning("pytesseract not installed - OCRAgent will return fallback")

try:
    from PIL import Image
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False


class OCRAgent(BaseAgent):
    """Agent that extracts text from images via Tesseract OCR."""

    def __init__(self, timeout: int = 30):
        super().__init__(name="ocr_agent", timeout=timeout)

    async def _run(self, image_path: str, **kwargs) -> Dict[str, Any]:
        findings: List[str] = []
        evidence: List[Dict[str, Any]] = []
        text = ""
        text_regions: List[Dict[str, Any]] = []
        summary = "OCR not performed"

        if not TESSERACT_AVAILABLE or not PIL_AVAILABLE:
            findings.append("OCR unavailable: pytesseract or Pillow not installed")
            return {
                "findings": findings,
                "confidence": 0.0,
                "text": "",
                "text_regions": [],
                "evidence": evidence,
                "summary": "OCR agent unavailable - missing dependencies",
            }

        try:
            img = Image.open(image_path)
            ocr_data = pytesseract.image_to_data(img, output_type=Output.DICT)

            text = pytesseract.image_to_string(img).strip()
            word_count = len(text.split())

            if word_count > 0:
                findings.append(f"OCR extracted {word_count} words from image")
                summary = f"Extracted {word_count} words via OCR"

                # Build text regions from word-level data
                n_boxes = len(ocr_data["text"])
                for i in range(n_boxes):
                    if ocr_data["text"][i].strip():
                        region = {
                            "text": ocr_data["text"][i],
                            "confidence": ocr_data["conf"][i] / 100.0 if ocr_data["conf"][i] > 0 else 0.0,
                            "bounding_box": {
                                "x": ocr_data["left"][i],
                                "y": ocr_data["top"][i],
                                "w": ocr_data["width"][i],
                                "h": ocr_data["height"][i],
                            },
                        }
                        text_regions.append(region)

                confidence = min(0.95, word_count * 0.01 + 0.5)

                evidence.append({
                    "type": "ocr",
                    "key": "extracted_text",
                    "value": text[:500],
                    "confidence": confidence,
                })
                evidence.append({
                    "type": "ocr",
                    "key": "word_count",
                    "value": str(word_count),
                    "confidence": 1.0,
                })
            else:
                findings.append("No text detected in image")
                confidence = 0.0
                summary = "No text found in image"

        except Exception as e:
            findings.append(f"OCR failed: {str(e)}")
            confidence = 0.0
            summary = f"OCR error: {str(e)}"

        return {
            "findings": findings,
            "confidence": confidence,
            "text": text,
            "text_regions": text_regions,
            "evidence": evidence,
            "summary": summary,
        }