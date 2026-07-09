"""
Image Forensics Agent - Detects manipulation artifacts using OpenCV and Pillow.
Implements ELA, noise analysis, edge consistency checks, and anomaly detection.
"""

from __future__ import annotations

import io
import numpy as np
from typing import Any, Dict, List
from backend.core.logging import get_logger
from backend.services.agents.base_agent import BaseAgent

logger = get_logger(__name__)

try:
    import cv2
    CV2_AVAILABLE = True
except ImportError:
    CV2_AVAILABLE = False
    logger.warning("opencv-python not installed - forensics restricted")

try:
    from PIL import Image, ImageChops
    PIL_AVAILABLE = True
except ImportError:
    PIL_AVAILABLE = False


class ImageForensicsAgent(BaseAgent):
    """Performs forensic analysis to detect image manipulation."""

    def __init__(self):
        super().__init__(name="image_forensics_agent")

    async def _run(self, image_path: str) -> Dict[str, Any]:
        findings: List[str] = []
        evidence: List[Dict[str, Any]] = []
        ela_score = 0.5
        noise_score = 0.5
        edge_score = 0.5
        confidence = 0.5

        if not CV2_AVAILABLE or not PIL_AVAILABLE:
            findings.append("Forensics unavailable: OpenCV or Pillow not installed")
            return {
                "findings": findings,
                "confidence": 0.3,
                "ela_score": 0.5,
                "noise_score": 0.5,
                "edge_score": 0.5,
                "evidence": [],
                "summary": "Image forensics unavailable - missing OpenCV",
            }

        try:
            pil_img = Image.open(image_path)

            cv_image = cv2.imread(image_path)
            if cv_image is None:
                cv_image = cv2.cvtColor(np.array(pil_img), cv2.COLOR_RGB2BGR)

            if cv_image is None:
                raise ValueError("Could not convert image to OpenCV format")

            h, w = cv_image.shape[:2]
            findings.append(f"Image dimensions: {w}x{h}")

            # Error Level Analysis (ELA)
            if pil_img.format == "JPEG" or pil_img.mode == "RGB":
                ela_result = self._perform_ela(pil_img, image_path)
                ela_score = ela_result["score"]
                findings.append(ela_result["finding"])
                evidence.append({
                    "type": "forensics",
                    "key": "ela_score",
                    "value": f"{ela_score:.2f}",
                    "confidence": 0.7,
                })

            # Noise analysis
            gray = cv2.cvtColor(cv_image, cv2.COLOR_BGR2GRAY)
            noise_result = self._analyze_noise(gray)
            noise_score = noise_result["score"]
            findings.append(noise_result["finding"])
            evidence.append({
                "type": "forensics",
                "key": "noise_score",
                "value": f"{noise_score:.2f}",
                "confidence": 0.6,
            })

            # Edge consistency
            edge_result = self._analyze_edges(gray)
            edge_score = edge_result["score"]
            findings.append(edge_result["finding"])
            evidence.append({
                "type": "forensics",
                "key": "edge_score",
                "value": f"{edge_score:.2f}",
                "confidence": 0.6,
            })

            # Resolution anomalies
            if pil_img.format:
                ext = pil_img.format.lower()
                expected_dpi = 72 if ext in ("png", "gif") else 300
                dpi = pil_img.info.get("dpi", (expected_dpi, expected_dpi))
                if isinstance(dpi, tuple):
                    dpi = dpi[0]
                findings.append(f"Image DPI: {dpi}")

            confidence = (ela_score * 0.4 + noise_score * 0.3 + edge_score * 0.3)
            confidence = max(0.0, min(1.0, confidence))

        except Exception as e:
            findings.append(f"Forensic analysis failed: {str(e)}")
            confidence = 0.0

        summary = f"Forensics: ELA={ela_score:.2f}, Noise={noise_score:.2f}, Edge={edge_score:.2f}"
        return {
            "findings": findings,
            "confidence": confidence,
            "ela_score": ela_score,
            "noise_score": noise_score,
            "edge_score": edge_score,
            "evidence": evidence,
            "summary": summary,
        }

    def _perform_ela(self, pil_img: Image.Image, image_path: str) -> Dict:
        try:
            buf = io.BytesIO()
            pil_img.save(buf, format="JPEG", quality=85)
            buf.seek(0)
            resaved = Image.open(buf)

            diff = ImageChops.difference(pil_img, resaved)
            extrema = diff.getextrema()
            max_diff = max([e[1] for e in extrema]) if extrema else 0
            ela_val = 1.0 - (max_diff / 255.0)

            if ela_val < 0.3:
                return {"score": ela_val, "finding": f"Suspicious ELA pattern (score={ela_val:.2f}) - possible manipulation"}
            elif ela_val < 0.6:
                return {"score": ela_val, "finding": f"Moderate ELA inconsistency (score={ela_val:.2f})"}
            else:
                return {"score": ela_val, "finding": f"Normal ELA pattern (score={ela_val:.2f}) - image appears consistent"}
        except Exception as e:
            return {"score": 0.5, "finding": f"ELA skipped: {str(e)}"}

    def _analyze_noise(self, gray: np.ndarray) -> Dict:
        try:
            variance = cv2.Laplacian(gray, cv2.CV_64F).var()
            if variance < 2.0:
                return {"score": 0.2, "finding": f"Very low noise (variance={variance:.1f}) - possible AI generation"}
            elif variance < 10.0:
                return {"score": 0.5, "finding": f"Normal noise level (variance={variance:.1f})"}
            elif variance < 50.0:
                return {"score": 0.7, "finding": f"Higher noise (variance={variance:.1f}) - typical of camera images"}
            else:
                return {"score": 0.3, "finding": f"Extremely high noise (variance={variance:.1f}) - possible tampering"}
        except Exception as e:
            return {"score": 0.5, "finding": f"Noise analysis skipped: {str(e)}"}

    def _analyze_edges(self, gray: np.ndarray) -> Dict:
        try:
            edges = cv2.Canny(gray, 50, 150)
            edge_density = np.count_nonzero(edges) / (gray.shape[0] * gray.shape[1])
            if edge_density < 0.01:
                return {"score": 0.3, "finding": f"Very few edges ({edge_density:.4f}) - possible blur"}
            elif edge_density < 0.1:
                return {"score": 0.8, "finding": f"Normal edge distribution ({edge_density:.4f})"}
            elif edge_density < 0.3:
                return {"score": 0.5, "finding": f"High edge density ({edge_density:.4f})"}
            else:
                return {"score": 0.2, "finding": f"Extreme edge density ({edge_density:.4f}) - possible artificial pattern"}
        except Exception as e:
            return {"score": 0.5, "finding": f"Edge analysis skipped: {str(e)}"}