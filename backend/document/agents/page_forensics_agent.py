"""
Page Forensics Agent — runs image forensics on rasterized PDF pages.
Reuses the same OpenCV analysis logic as the image pipeline.
"""

from __future__ import annotations

import time
import logging
from pathlib import Path
from typing import Dict, List, Any

from backend.document.types import AgentResult

logger = logging.getLogger(__name__)


class PageForensicsAgent:
    """Analyze rasterized PDF pages for visual tampering signals."""

    def analyze_page(self, image_path: str, page_num: int) -> AgentResult:
        start = time.perf_counter()
        try:
            import cv2
            import numpy as np

            img = cv2.imread(image_path)
            if img is None:
                return AgentResult(
                    agent="page_image_analysis",
                    status="error",
                    error=f"Could not decode page {page_num}",
                    processing_time_ms=(time.perf_counter() - start) * 1000,
                )

            height, width = img.shape[:2]
            channels = img.shape[2] if len(img.shape) > 2 else 1
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY) if channels == 3 else img
            laplacian_var = float(cv2.Laplacian(gray, cv2.CV_64F).var())
            is_blurry = bool(laplacian_var < 100)
            noise_std = float(np.std(gray - cv2.GaussianBlur(gray, (5, 5), 0)))
            has_noise = bool(noise_std > 25)

            compression_quality = 100.0
            if channels == 3:
                _, buffer = cv2.imencode(".jpg", img, [cv2.IMWRITE_JPEG_QUALITY, 95])
                compressed = cv2.imdecode(buffer, cv2.IMREAD_COLOR)
                mse = float(np.mean((img.astype(float) - compressed.astype(float)) ** 2))
                compression_quality = max(0.0, min(100.0, 100.0 - mse / 10.0))

            anomalies: List[str] = []
            if is_blurry:
                anomalies.append("Page appears blurry (low sharpness)")
            if has_noise:
                anomalies.append("Unusual noise pattern detected")
            if compression_quality < 60:
                anomalies.append("High compression artifacts detected")

            evidence = {
                "page": page_num,
                "resolution": f"{width}x{height}",
                "blur_score": round(laplacian_var, 2),
                "is_blurry": is_blurry,
                "noise_std": round(noise_std, 2),
                "has_noise": has_noise,
                "compression_quality": round(compression_quality, 1),
                "anomalies": anomalies,
            }

            confidence = 0.8 if not anomalies else 0.5
            findings = [f"Page {page_num}: {width}x{height}"]
            if anomalies:
                findings.extend(anomalies)

            return AgentResult(
                agent="page_image_analysis",
                status="completed",
                confidence=confidence,
                findings=findings,
                evidence=evidence,
                processing_time_ms=(time.perf_counter() - start) * 1000,
            )

        except ImportError as e:
            return AgentResult(
                agent="page_image_analysis",
                status="completed",
                confidence=0.3,
                findings=[f"Page {page_num}: OpenCV not available"],
                evidence={"page": page_num, "note": str(e)},
                processing_time_ms=(time.perf_counter() - start) * 1000,
            )
        except Exception as e:
            logger.exception(f"Page forensics failed for page {page_num}: {e}")
            return AgentResult(
                agent="page_image_analysis",
                status="error",
                error=str(e),
                processing_time_ms=(time.perf_counter() - start) * 1000,
            )

    def analyze_all(self, page_paths: List[str]) -> AgentResult:
        """Run forensics on all pages and aggregate results."""
        start = time.perf_counter()
        page_results: List[Dict[str, Any]] = []
        all_anomalies: List[str] = []
        confidences: List[float] = []

        for i, path in enumerate(page_paths):
            result = self.analyze_page(path, i + 1)
            if result.status == "completed":
                page_results.append(result.evidence)
                confidences.append(result.confidence)
                all_anomalies.extend(result.evidence.get("anomalies", []))

        avg_conf = sum(confidences) / len(confidences) if confidences else 0.3
        findings = [f"Analyzed {len(page_paths)} page(s)"]
        if all_anomalies:
            findings.append(f"{len(all_anomalies)} visual anomaly(ies) detected across pages")

        return AgentResult(
            agent="page_image_analysis",
            status="completed",
            confidence=avg_conf,
            findings=findings,
            evidence={
                "page_count": len(page_paths),
                "pages": page_results,
                "total_anomalies": len(all_anomalies),
                "anomalies": all_anomalies,
            },
            processing_time_ms=(time.perf_counter() - start) * 1000,
        )
