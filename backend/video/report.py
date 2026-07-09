"""
VisionX V3
Video Report Generator

Creates a structured report from all video
analysis components.

This report is later consumed by ManagerAgent
and ReportAgent.
"""

from __future__ import annotations

import logging
from typing import Dict, Any, List

from .models import VideoScore

logger = logging.getLogger(__name__)


class VideoReportGenerator:

    def generate(
        self,
        metadata_result: Dict[str, Any],
        face_result: Dict[str, Any],
        deepfake_result,
        ocr_result: Dict[str, Any],
        whisper_result: Dict[str, Any],
        video_score: VideoScore,
    ) -> Dict[str, Any]:

        summary: List[str] = []

        #########################################################
        # Metadata
        #########################################################

        metadata = metadata_result["metadata"]

        summary.append(
            f"Duration: {metadata['duration']:.2f} seconds"
        )

        summary.append(
            f"Resolution: {metadata['width']}x{metadata['height']}"
        )

        summary.append(
            f"FPS: {metadata['fps']:.2f}"
        )

        #########################################################
        # Face Detection
        #########################################################

        faces = face_result["summary"]

        summary.append(
            f"Frames processed: {faces['frames_processed']}"
        )

        summary.append(
            f"Total faces detected: {faces['total_faces']}"
        )

        #########################################################
        # OCR
        #########################################################

        summary.append(
            f"OCR extracted {ocr_result['total_words']} words."
        )

        #########################################################
        # Whisper
        #########################################################

        transcript = whisper_result[
            "whisper_result"
        ].transcript

        if transcript:

            preview = transcript[:250]

            summary.append(
                f"Transcript Preview: {preview}"
            )

        else:

            summary.append(
                "No speech detected."
            )

        #########################################################
        # DeepFake
        #########################################################

        summary.append(
            f"DeepFake Probability: "
            f"{deepfake_result.probability_fake:.2%}"
        )

        #########################################################
        # Risk Level
        #########################################################

        score = video_score.overall_score

        if score >= 85:

            risk = "LOW"

        elif score >= 60:

            risk = "MEDIUM"

        else:

            risk = "HIGH"

        logger.info(
            "Video report generated."
        )

        return {

            "overall_score": video_score.overall_score,

            "risk_level": risk,

            "confidence": video_score.confidence,

            "reasoning": video_score.reasoning,

            "summary": summary,

            "metadata": metadata_result,

            "faces": face_result,

            "deepfake": {
                "label": deepfake_result.predicted_label,
                "probability": deepfake_result.probability_fake,
                "confidence": deepfake_result.confidence,
            },

            "ocr": ocr_result,

            "whisper": whisper_result,
        }


video_report_generator = VideoReportGenerator()