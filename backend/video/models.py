"""
VisionX V3
Video Analysis Data Models

Shared models used throughout the video analysis pipeline.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field


class VideoMetadata(BaseModel):
    """Metadata extracted from FFmpeg."""

    filename: str
    format: str

    duration: float
    fps: float

    width: int
    height: int

    codec: str
    bitrate: Optional[int] = None

    frame_count: Optional[int] = None

    has_audio: bool = False

    file_size: Optional[int] = None


class FrameData(BaseModel):
    """Represents one extracted frame."""

    frame_number: int

    timestamp: float

    image_path: str


class FaceDetection(BaseModel):
    """Face detection result."""

    frame_number: int

    timestamp: float

    faces_detected: int

    confidence: float

    bounding_boxes: List[Dict[str, float]] = Field(default_factory=list)


class OCRResult(BaseModel):
    """OCR result for a frame."""

    frame_number: int

    timestamp: float

    text: str

    confidence: float


class DeepfakeResult(BaseModel):
    """DeepFake prediction."""

    probability_fake: float

    confidence: float

    predicted_label: str

    model_name: str

    inference_time_ms: float


class WhisperResult(BaseModel):
    """Speech transcription."""

    language: str

    transcript: str

    confidence: float


class VideoEvidence(BaseModel):
    """
    Combined evidence generated from
    all video analysis stages.
    """

    metadata: Optional[VideoMetadata] = None

    frames: List[FrameData] = Field(default_factory=list)

    faces: List[FaceDetection] = Field(default_factory=list)

    ocr_results: List[OCRResult] = Field(default_factory=list)

    deepfake: Optional[DeepfakeResult] = None

    whisper: Optional[WhisperResult] = None

    extra: Dict[str, Any] = Field(default_factory=dict)


class VideoScore(BaseModel):
    """
    Final weighted score before passing
    to ManagerAgent.
    """

    overall_score: float

    deepfake_score: float

    metadata_score: float

    ocr_score: float

    audio_score: float

    confidence: float

    reasoning: List[str] = Field(default_factory=list)