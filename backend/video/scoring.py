"""
VisionX V3
Video Scoring Service

Combines all analysis results into a final VideoScore.
"""

from __future__ import annotations

import logging
from typing import Dict, Any, List

from .models import VideoScore

logger = logging.getLogger(__name__)


class VideoScoringService:

    # Weight configuration
    DEEPFAKE_WEIGHT = 0.50
    METADATA_WEIGHT = 0.20
    OCR_WEIGHT = 0.15
    AUDIO_WEIGHT = 0.15

    def calculate(
        self,
        metadata_result: Dict[str, Any],
        deepfake_result,
        ocr_result: Dict[str, Any],
        whisper_result: Dict[str, Any],
    ) -> VideoScore:

        reasoning: List[str] = []

        ############################################################
        # Metadata
        ############################################################

        metadata_score = metadata_result["metadata_score"]

        if metadata_score < 80:
            reasoning.append(
                "Metadata contains suspicious properties."
            )

        ############################################################
        # DeepFake
        ############################################################

        deepfake_score = (
            100
            * (1.0 - deepfake_result.probability_fake)
        )

        if deepfake_result.predicted_label == "FAKE":
            reasoning.append(
                f"DeepFake detector predicts FAKE "
                f"({deepfake_result.probability_fake:.2f})."
            )
        else:
            reasoning.append(
                "DeepFake detector predicts REAL."
            )

        ############################################################
        # OCR
        ############################################################

        word_count = ocr_result["total_words"]

        if word_count == 0:

            ocr_score = 50

            reasoning.append(
                "No visible text detected."
            )

        else:

            ocr_score = 100

            reasoning.append(
                f"{word_count} words detected."
            )

        ############################################################
        # Audio
        ############################################################

        whisper = whisper_result["whisper_result"]

        audio_score = whisper.confidence * 100

        if whisper.transcript:

            reasoning.append(
                "Speech successfully transcribed."
            )

        else:

            reasoning.append(
                "No speech detected."
            )

        ############################################################
        # Weighted score
        ############################################################

        overall = (
            deepfake_score * self.DEEPFAKE_WEIGHT
            + metadata_score * self.METADATA_WEIGHT
            + ocr_score * self.OCR_WEIGHT
            + audio_score * self.AUDIO_WEIGHT
        )

        ############################################################
        # Confidence
        ############################################################

        confidence = (
            deepfake_result.confidence
            + whisper.confidence
        ) / 2

        logger.info(
            "Final video score: %.2f",
            overall,
        )

        return VideoScore(
            overall_score=round(overall, 2),
            deepfake_score=round(deepfake_score, 2),
            metadata_score=round(metadata_score, 2),
            ocr_score=round(ocr_score, 2),
            audio_score=round(audio_score, 2),
            confidence=round(confidence, 3),
            reasoning=reasoning,
        )


video_scoring_service = VideoScoringService()