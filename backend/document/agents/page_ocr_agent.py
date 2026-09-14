"""
Page OCR Agent — extracts text from rasterized PDF pages.
"""

from __future__ import annotations

import sys
import time
import logging
from typing import Dict, List, Any

from backend.document.types import AgentResult

logger = logging.getLogger(__name__)

# EasyOCR's model-download progress bar prints Unicode block characters.
# On Windows, stdout defaults to a non-UTF-8 codepage (e.g. cp1252), which
# crashes the download mid-transfer on a fresh machine with no cached models.
if sys.platform == "win32":
    for _stream in (sys.stdout, sys.stderr):
        if hasattr(_stream, "reconfigure"):
            try:
                _stream.reconfigure(encoding="utf-8", errors="replace")
            except Exception:
                pass


class PageOCRAgent:
    """Extract text from rasterized PDF pages using EasyOCR."""

    def extract_page(self, image_path: str, page_num: int) -> AgentResult:
        start = time.perf_counter()
        try:
            import easyocr

            reader = easyocr.Reader(["en"], gpu=False)
            results = reader.readtext(image_path)

            text_parts: List[str] = []
            regions: List[Dict] = []
            for bbox, text, conf in results:
                text_parts.append(text)
                regions.append({
                    "text": text,
                    "confidence": round(float(conf), 3),
                    "bbox": [float(coord) for point in bbox for coord in point],
                })

            extracted_text = " ".join(text_parts)
            avg_confidence = round(
                sum(r["confidence"] for r in regions) / len(regions), 3
            ) if regions else 0

            evidence = {
                "page": page_num,
                "text_found": bool(regions),
                "text_length": len(extracted_text),
                "word_count": len(text_parts),
                "text": extracted_text,
                "regions": regions[:20],
                "avg_confidence": avg_confidence,
            }

            findings = [f"Page {page_num}: {len(text_parts)} text region(s)"]
            if extracted_text:
                preview = extracted_text[:100] + "..." if len(extracted_text) > 100 else extracted_text
                findings.append(f"Preview: {preview}")

            return AgentResult(
                agent="page_ocr",
                status="completed",
                confidence=float(avg_confidence if regions else 0.3),
                findings=findings,
                evidence=evidence,
                processing_time_ms=(time.perf_counter() - start) * 1000,
            )

        except ImportError as e:
            return AgentResult(
                agent="page_ocr",
                status="completed",
                confidence=0.3,
                findings=[f"Page {page_num}: EasyOCR not available"],
                evidence={"page": page_num, "note": str(e)},
                processing_time_ms=(time.perf_counter() - start) * 1000,
            )
        except Exception as e:
            logger.exception(f"OCR failed for page {page_num}: {e}")
            return AgentResult(
                agent="page_ocr",
                status="error",
                error=str(e),
                processing_time_ms=(time.perf_counter() - start) * 1000,
            )

    def extract_all(self, page_paths: List[str]) -> AgentResult:
        """OCR all pages and aggregate extracted text."""
        start = time.perf_counter()
        page_results: List[Dict[str, Any]] = []
        all_text: List[str] = []
        confidences: List[float] = []

        for i, path in enumerate(page_paths):
            result = self.extract_page(path, i + 1)
            if result.status == "completed":
                page_results.append(result.evidence)
                text = result.evidence.get("text", "")
                if text:
                    all_text.append(text)
                if result.confidence > 0:
                    confidences.append(result.confidence)

        combined_text = "\n\n".join(all_text)
        avg_conf = sum(confidences) / len(confidences) if confidences else 0.3

        return AgentResult(
            agent="page_ocr",
            status="completed",
            confidence=avg_conf,
            findings=[
                f"Extracted text from {len(page_paths)} page(s)",
                f"Total characters: {len(combined_text)}",
            ],
            evidence={
                "page_count": len(page_paths),
                "pages": page_results,
                "combined_text": combined_text,
                "text_length": len(combined_text),
                "word_count": len(combined_text.split()) if combined_text else 0,
            },
            processing_time_ms=(time.perf_counter() - start) * 1000,
        )
