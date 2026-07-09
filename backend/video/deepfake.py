"""
VisionX V3
DeepFake Detection Service

This module currently contains a placeholder detector.

The interface is intentionally designed so that it can later
be replaced by a real DeepFakeBench implementation without
changing the rest of the application.
"""

from __future__ import annotations

import logging
import random
import time
from typing import List

from .models import FrameData, FaceDetection, DeepfakeResult

logger = logging.getLogger(__name__)


class DeepFakeDetector:
    """
    Placeholder DeepFake detector.

    Future replacement:
        - DeepFakeBench
        - EfficientNet
        - XCLIP
        - VideoMAE
    """

    MODEL_NAME = "Prototype Detector"

    def analyze(
        self,
        frames: List[FrameData],
        faces: List[FaceDetection],
    ) -> DeepfakeResult:
        """
        Analyze extracted frames.

        Returns a DeepfakeResult.
        """

        start = time.perf_counter()

        total_faces = sum(
            face.faces_detected
            for face in faces
        )

        #
        # Prototype heuristic
        #

        if total_faces == 0:
            probability_fake = 0.20

        elif total_faces < 5:
            probability_fake = random.uniform(0.20, 0.45)

        elif total_faces < 20:
            probability_fake = random.uniform(0.40, 0.70)

        else:
            probability_fake = random.uniform(0.60, 0.95)

        confidence = 0.80

        label = (
            "FAKE"
            if probability_fake >= 0.50
            else "REAL"
        )

        inference_time = (
            time.perf_counter() - start
        ) * 1000

        logger.info(
            "DeepFake probability: %.2f",
            probability_fake,
        )

        return DeepfakeResult(
            probability_fake=probability_fake,
            confidence=confidence,
            predicted_label=label,
            model_name=self.MODEL_NAME,
            inference_time_ms=inference_time,
        )


deepfake_detector = DeepFakeDetector()