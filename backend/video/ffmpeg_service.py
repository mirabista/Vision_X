"""
VisionX V3
FFmpeg Service

Handles all FFmpeg operations for videos.
"""

from __future__ import annotations

import json
import logging
import shutil
import subprocess
from pathlib import Path
from typing import List

try:
    import ffmpeg
except ImportError:  # pragma: no cover - fallback for missing wrapper
    ffmpeg = None

from .models import VideoMetadata

logger = logging.getLogger(__name__)


class FFmpegService:

    def __init__(self):
        self.available = self._verify_ffmpeg(raise_error=False)

    def _verify_ffmpeg(self, raise_error: bool = True) -> bool:
        """Ensure FFmpeg is installed."""
        if shutil.which("ffmpeg") is None:
            message = "FFmpeg executable not found. Install FFmpeg and add it to PATH."
            if raise_error:
                raise RuntimeError(message)
            logger.warning(message)
            return False

        if shutil.which("ffprobe") is None:
            message = "FFprobe executable not found. Install FFmpeg and add it to PATH."
            if raise_error:
                raise RuntimeError(message)
            logger.warning(message)
            return False

        return True

    ####################################################################
    # Metadata
    ####################################################################

    def extract_metadata(self, video_path: str) -> VideoMetadata:
        """
        Extract metadata using ffprobe.
        """
        self._verify_ffmpeg()

        command = [
            "ffprobe",
            "-v",
            "quiet",
            "-print_format",
            "json",
            "-show_format",
            "-show_streams",
            video_path,
        ]

        result = subprocess.run(
            command,
            capture_output=True,
            text=True,
            check=True,
        )

        info = json.loads(result.stdout)

        video_stream = next(
            s for s in info["streams"]
            if s["codec_type"] == "video"
        )

        audio_stream = next(
            (
                s for s in info["streams"]
                if s["codec_type"] == "audio"
            ),
            None,
        )

        fps_text = video_stream["r_frame_rate"]

        numerator, denominator = fps_text.split("/")

        fps = float(numerator) / max(float(denominator), 1.0)

        duration = float(info["format"]["duration"])

        frame_count = int(duration * fps)

        return VideoMetadata(
            filename=Path(video_path).name,
            format=info["format"]["format_name"],
            duration=duration,
            fps=fps,
            width=int(video_stream["width"]),
            height=int(video_stream["height"]),
            codec=video_stream["codec_name"],
            bitrate=int(info["format"].get("bit_rate", 0)),
            frame_count=frame_count,
            has_audio=audio_stream is not None,
            file_size=int(info["format"].get("size", 0)),
        )

    ####################################################################
    # Frame Extraction
    ####################################################################

    def extract_frames(
        self,
        video_path: str,
        output_dir: str,
        fps: float = 1.0,
    ) -> List[str]:
        """
        Extract frames from video.

        fps=1 means one frame every second.
        """

        output = Path(output_dir)

        output.mkdir(parents=True, exist_ok=True)

        if ffmpeg is None:
            raise RuntimeError("ffmpeg-python is not installed")

        pattern = str(output / "frame_%05d.jpg")

        (
            ffmpeg
            .input(video_path)
            .output(pattern, vf=f"fps={fps}")
            .overwrite_output()
            .run(quiet=True)
        )

        frames = sorted(output.glob("*.jpg"))

        return [str(f) for f in frames]

    ####################################################################
    # Single Frame
    ####################################################################

    def extract_frame(
        self,
        video_path: str,
        timestamp: float,
        output_path: str,
    ) -> str:
        """
        Extract one frame.
        """

        if ffmpeg is None:
            raise RuntimeError("ffmpeg-python is not installed")

        (
            ffmpeg
            .input(video_path, ss=timestamp)
            .output(output_path, vframes=1)
            .overwrite_output()
            .run(quiet=True)
        )

        return output_path

    ####################################################################
    # Audio
    ####################################################################

    def extract_audio(
        self,
        video_path: str,
        output_audio: str,
    ) -> str:
        """
        Extract audio as WAV.
        """

        if ffmpeg is None:
            raise RuntimeError("ffmpeg-python is not installed")

        (
            ffmpeg
            .input(video_path)
            .output(
                output_audio,
                acodec="pcm_s16le",
                ac=1,
                ar="16000",
            )
            .overwrite_output()
            .run(quiet=True)
        )

        return output_audio

    ####################################################################
    # Directory Helper
    ####################################################################

    def create_working_directory(
        self,
        base_dir: str,
        analysis_id: str,
    ) -> Path:
        """
        Creates a working directory for this analysis.

        Example:
        uploads/video/12345/
            frames/
            audio/
        """

        root = Path(base_dir) / analysis_id

        (root / "frames").mkdir(parents=True, exist_ok=True)
        (root / "audio").mkdir(parents=True, exist_ok=True)

        return root


ffmpeg_service = FFmpegService()
