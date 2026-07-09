"""
VisionX V3
Video Metadata Analyzer

Analyzes metadata extracted from FFmpeg and produces
metadata evidence for scoring.
"""

from __future__ import annotations

import logging
from typing import Dict, List, Any

from .ffmpeg_service import ffmpeg_service
from .models import VideoMetadata

logger = logging.getLogger(__name__)


class VideoMetadataAnalyzer:
    """
    Analyze video metadata and detect suspicious properties.
    """

    # Common video codecs
    KNOWN_CODECS = {
        "h264",
        "hevc",
        "vp9",
        "av1",
        "mpeg4",
        "h265",
    }

    def analyze(self, video_path: str) -> Dict[str, Any]:
        """
        Analyze metadata extracted by FFmpeg.
        """

        metadata: VideoMetadata = ffmpeg_service.extract_metadata(video_path)

        findings: List[str] = []
        warnings: List[str] = []

        metadata_score = 100.0

        ##########################################################
        # FPS
        ##########################################################

        if metadata.fps < 10:
            warnings.append(
                f"Very low frame rate ({metadata.fps:.2f} FPS)"
            )
            metadata_score -= 15

        elif metadata.fps > 120:
            warnings.append(
                f"Unusually high frame rate ({metadata.fps:.2f} FPS)"
            )
            metadata_score -= 10

        ##########################################################
        # Duration
        ##########################################################

        if metadata.duration < 1:
            warnings.append("Video is extremely short.")
            metadata_score -= 10

        elif metadata.duration > 600:
            findings.append("Long-duration video.")

        ##########################################################
        # Resolution
        ##########################################################

        if metadata.width < 320 or metadata.height < 240:
            warnings.append(
                "Very low video resolution."
            )
            metadata_score -= 10

        ##########################################################
        # Codec
        ##########################################################

        if metadata.codec.lower() not in self.KNOWN_CODECS:
            warnings.append(
                f"Unknown codec ({metadata.codec})"
            )
            metadata_score -= 5

        ##########################################################
        # Audio
        ##########################################################

        if not metadata.has_audio:
            findings.append("No audio track detected.")

        ##########################################################
        # Bitrate
        ##########################################################

        if metadata.bitrate is not None:

            if metadata.bitrate < 100_000:
                warnings.append("Very low bitrate.")
                metadata_score -= 10

        ##########################################################
        # Final score
        ##########################################################

        metadata_score = max(0.0, metadata_score)

        logger.info(
            "Metadata analysis completed "
            "(score=%.1f)",
            metadata_score,
        )

        return {
            "metadata": metadata.model_dump(),
            "metadata_score": metadata_score,
            "warnings": warnings,
            "findings": findings,
        }


metadata_analyzer = VideoMetadataAnalyzer()