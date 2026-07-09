"""
VisionX V3
Frame Extractor

Uses FFmpegService to extract frames and converts
them into FrameData models.
"""

from __future__ import annotations

import logging
from pathlib import Path
from typing import List

from .ffmpeg_service import ffmpeg_service
from .models import FrameData

logger = logging.getLogger(__name__)


class FrameExtractor:
    """
    High-level frame extraction service.

    Responsible for:
    - calling FFmpeg
    - creating FrameData objects
    - timestamp calculation
    """

    def extract(
        self,
        video_path: str,
        output_dir: str,
        fps: float = 1.0,
    ) -> List[FrameData]:
        """
        Extract frames from a video.

        fps=1 means one frame every second.
        fps=2 means two frames every second.
        """

        logger.info(
            "Extracting frames from %s at %.2f FPS",
            video_path,
            fps,
        )

        frame_paths = ffmpeg_service.extract_frames(
            video_path=video_path,
            output_dir=output_dir,
            fps=fps,
        )

        frames: List[FrameData] = []

        for index, frame_path in enumerate(frame_paths):

            timestamp = index / fps

            frames.append(
                FrameData(
                    frame_number=index + 1,
                    timestamp=timestamp,
                    image_path=str(Path(frame_path)),
                )
            )

        logger.info(
            "Extracted %d frames",
            len(frames),
        )

        return frames

    def extract_single_frame(
        self,
        video_path: str,
        timestamp: float,
        output_path: str,
    ) -> FrameData:
        """
        Extract one frame at a specific timestamp.
        """

        ffmpeg_service.extract_frame(
            video_path=video_path,
            timestamp=timestamp,
            output_path=output_path,
        )

        return FrameData(
            frame_number=1,
            timestamp=timestamp,
            image_path=output_path,
        )


frame_extractor = FrameExtractor()