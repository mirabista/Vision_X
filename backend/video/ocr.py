"""
VisionX V3
OCR Service

Extracts text from video frames using EasyOCR.
"""

from __future__ import annotations

import logging
from typing import List, Dict, Any

try:
    import easyocr
except ImportError:  # pragma: no cover - optional runtime dependency
    easyocr = None

from .models import FrameData, OCRResult

logger = logging.getLogger(__name__)


class OCRService:
    """
    OCR service using EasyOCR.
    """

    def __init__(self):
        self.reader = None
        if easyocr is None:
            logger.warning("EasyOCR is not installed; OCR will return empty results")
            return

        logger.info("Loading EasyOCR model...")

        # English only for now.
        # Later you can add:
        # ['en', 'ne', 'hi']
        try:
            self.reader = easyocr.Reader(
                ['en'],
                gpu=False
            )
        except Exception as exc:
            logger.warning("EasyOCR model unavailable: %s", exc)
            self.reader = None

    def analyze(
        self,
        frames: List[FrameData]
    ) -> Dict[str, Any]:
        """
        Extract text from every frame.
        """

        results: List[OCRResult] = []

        all_text = []

        total_words = 0

        for frame in frames:
            if self.reader is None:
                results.append(
                    OCRResult(
                        frame_number=frame.frame_number,
                        timestamp=frame.timestamp,
                        text="",
                        confidence=0.0,
                    )
                )
                continue

            detections = self.reader.readtext(
                frame.image_path,
                detail=1,
                paragraph=True,
            )

            extracted_text = ""

            confidence = 0.0

            if detections:

                texts = []
                confidences = []

                for detection in detections:

                    _, text, score = detection

                    texts.append(text)

                    confidences.append(float(score))

                extracted_text = "\n".join(texts)

                confidence = (
                    sum(confidences) / len(confidences)
                )

                total_words += len(
                    extracted_text.split()
                )

                all_text.append(extracted_text)

            results.append(
                OCRResult(
                    frame_number=frame.frame_number,
                    timestamp=frame.timestamp,
                    text=extracted_text,
                    confidence=confidence,
                )
            )

        combined_text = "\n".join(all_text)

        logger.info(
            "OCR completed. %d words extracted.",
            total_words,
        )

        return {
            "ocr_results": results,
            "combined_text": combined_text,
            "total_words": total_words,
            "frames_processed": len(frames),
        }


ocr_service = OCRService()
