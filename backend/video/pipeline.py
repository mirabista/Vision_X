"""
VisionX V3
Video Analysis Pipeline

Coordinates every video analysis component.

This pipeline is completely independent from the
main AI pipeline.
"""

from __future__ import annotations

import logging
from typing import Dict, Any

from .ffmpeg_service import ffmpeg_service
from .frame_extractor import frame_extractor
from .metadata import metadata_analyzer
from .face_detector import face_detector
from .deepfake import deepfake_detector
from .ocr import ocr_service
from .whisper_service import whisper_service
from .scoring import video_scoring_service
from .report import video_report_generator
from .models import WhisperResult

logger = logging.getLogger(__name__)


class VideoPipeline:

    async def analyze(
        self,
        video_path: str,
        analysis_id: str,
    ) -> Dict[str, Any]:
        """
        Complete video pipeline.
        """

        logger.info(
            "Starting video analysis: %s",
            video_path,
        )

        try:
            ###########################################################
            # Working directory
            ###########################################################

            working_dir = ffmpeg_service.create_working_directory(
                base_dir="uploads/video",
                analysis_id=analysis_id,
            )

            frames_dir = working_dir / "frames"

            audio_dir = working_dir / "audio"

            ###########################################################
            # Metadata
            ###########################################################

            metadata_result = metadata_analyzer.analyze(
                video_path
            )

            # Extract metadata for frame extraction FPS calculation
            metadata = metadata_result.get("metadata", {})
            video_duration = metadata.get("duration", 60)

            ###########################################################
            # Extract Frames
            ###########################################################

            frames = frame_extractor.extract(
                video_path=video_path,
                output_dir=str(frames_dir),
                fps=min(1.0, 300 / max(video_duration, 1)),  # Cap at 300 frames
            )

            ###########################################################
            # Face Detection
            ###########################################################

            face_result = face_detector.detect_faces(
                frames
            )

            ###########################################################
            # DeepFake
            ###########################################################

            deepfake_result = deepfake_detector.analyze(
                frames,
                face_result["detections"],
            )

            ###########################################################
            # OCR
            ###########################################################

            ocr_result = ocr_service.analyze(
                frames
            )

            ###########################################################
            # Audio
            ###########################################################

            audio_file = audio_dir / "audio.wav"

            if metadata.get("has_audio"):

                ffmpeg_service.extract_audio(
                    video_path,
                    str(audio_file),
                )

                whisper_result = whisper_service.transcribe(
                    str(audio_file)
                )

            else:

                whisper_result = {
                    "whisper_result": WhisperResult(
                        language="unknown",
                        transcript="",
                        confidence=0.0,
                    ),
                    "segments": [],
                    "language": None,
                    "duration": 0,
                }

            ###########################################################
            # Score Fusion
            ###########################################################

            video_score = video_scoring_service.calculate(
                metadata_result,
                deepfake_result,
                ocr_result,
                whisper_result,
            )

            ###########################################################
            # Final Report
            ###########################################################

            report = video_report_generator.generate(
                metadata_result,
                face_result,
                deepfake_result,
                ocr_result,
                whisper_result,
                video_score,
            )

            logger.info(
                "Video analysis completed: %s",
                analysis_id,
            )

            return {
                "metadata": metadata_result,
                "frames": frames,
                "faces": face_result,
                "deepfake": deepfake_result,
                "ocr": ocr_result,
                "whisper": whisper_result,
                "score": video_score,
                "report": report,
            }

        except Exception as e:
            logger.exception(
                "Video pipeline failed for %s: %s",
                analysis_id,
                str(e),
            )
            raise


video_pipeline = VideoPipeline()