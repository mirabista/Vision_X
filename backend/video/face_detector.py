"""
VisionX V3
Face Detection Service

Uses MediaPipe Face Detection to detect faces
from extracted video frames.
"""

from __future__ import annotations

import logging
from typing import List, Dict, Any

import cv2

try:
    import mediapipe as mp
except ImportError:  # pragma: no cover - fallback for missing dependency
    mp = None

from .models import FrameData, FaceDetection

logger = logging.getLogger(__name__)


class FaceDetector:

    def __init__(self):
        self.detector = None
        if mp is not None:
            try:
                self.detector = mp.solutions.face_detection.FaceDetection(
                    model_selection=1,
                    min_detection_confidence=0.5,
                )
            except Exception as exc:  # pragma: no cover - fallback for older/newer MediaPipe builds
                logger.warning("MediaPipe face detector unavailable: %s", exc)
                self.detector = None

    def detect_faces(
        self,
        frames: List[FrameData],
    ) -> Dict[str, Any]:
        """
        Detect faces in all extracted frames.
        """

        detections: List[FaceDetection] = []

        total_faces = 0
        frames_with_faces = 0

        for frame in frames:

            image = cv2.imread(frame.image_path)

            if image is None:
                logger.warning(
                    "Unable to load frame: %s",
                    frame.image_path,
                )
                continue

            if self.detector is None:
                detections.append(
                    FaceDetection(
                        frame_number=frame.frame_number,
                        timestamp=frame.timestamp,
                        faces_detected=0,
                        confidence=0.0,
                        bounding_boxes=[],
                    )
                )
                continue

            rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

            result = self.detector.process(rgb)

            boxes = []
            confidence = 0.0

            if result.detections:

                frames_with_faces += 1

                for detection in result.detections:

                    score = float(detection.score[0])

                    confidence = max(confidence, score)

                    bbox = detection.location_data.relative_bounding_box

                    boxes.append(
                        {
                            "xmin": bbox.xmin,
                            "ymin": bbox.ymin,
                            "width": bbox.width,
                            "height": bbox.height,
                            "confidence": score,
                        }
                    )

                total_faces += len(boxes)

            detections.append(
                FaceDetection(
                    frame_number=frame.frame_number,
                    timestamp=frame.timestamp,
                    faces_detected=len(boxes),
                    confidence=confidence,
                    bounding_boxes=boxes,
                )
            )

        summary = {
            "frames_processed": len(frames),
            "frames_with_faces": frames_with_faces,
            "frames_without_faces": len(frames) - frames_with_faces,
            "total_faces": total_faces,
            "average_faces_per_frame": (
                total_faces / len(frames)
                if frames
                else 0
            ),
        }

        logger.info(
            "Processed %d frames, detected %d faces",
            len(frames),
            total_faces,
        )

        return {
            "detections": detections,
            "summary": summary,
        }


face_detector = FaceDetector()