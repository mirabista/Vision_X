"""
VisionX V3
Whisper Service

Speech-to-text using Faster-Whisper.
"""

from __future__ import annotations

import logging
import math
from pathlib import Path
from typing import Dict, Any

try:
    from faster_whisper import WhisperModel
except ImportError:  # pragma: no cover - optional runtime dependency
    WhisperModel = None

from .models import WhisperResult

logger = logging.getLogger(__name__)


class WhisperService:
    """
    Faster Whisper transcription service.
    """

    def __init__(self):

        logger.info("Loading Faster-Whisper model...")
        self.model = None
        if WhisperModel is None:
            logger.warning("faster-whisper is not installed; transcription will return empty results")
            return

        #
        # Available models:
        #
        # tiny
        # base
        # small
        # medium
        # large-v3
        #
        # Recommended for your laptop:
        # base
        #

        try:
            self.model = WhisperModel(
                model_size_or_path="base",
                device="cpu",
                compute_type="int8",
            )
        except TypeError:
            try:
                self.model = WhisperModel(
                    model_size="base",
                    device="cpu",
                    compute_type="int8",
                )
            except Exception as exc:
                logger.warning("Faster-Whisper model unavailable: %s", exc)
                self.model = None
        except Exception as exc:
            logger.warning("Faster-Whisper model unavailable: %s", exc)
            self.model = None

    def transcribe(
        self,
        audio_path: str,
    ) -> Dict[str, Any]:
        """
        Transcribe audio.
        """

        if not Path(audio_path).exists():

            logger.warning(
                "Audio file does not exist: %s",
                audio_path,
            )

            return {
                "transcript": "",
                "segments": [],
                "whisper_result": WhisperResult(
                    language="unknown",
                    transcript="",
                    confidence=0.0,
                ),
            }

        if not hasattr(self, "model") or self.model is None:
            logger.warning("Whisper model is unavailable; returning an empty transcript")
            return {
                "whisper_result": WhisperResult(
                    language="unknown",
                    transcript="",
                    confidence=0.0,
                ),
                "segments": [],
                "language": None,
                "duration": 0,
            }

        try:
            segments, info = self.model.transcribe(
                audio_path,
                beam_size=5,
                vad_filter=True,
            )
        except Exception as exc:
            logger.warning("Whisper transcription failed: %s", exc)
            return {
                "whisper_result": WhisperResult(
                    language="unknown",
                    transcript="",
                    confidence=0.0,
                ),
                "segments": [],
                "language": None,
                "duration": 0,
            }

        transcript_parts = []

        segment_data = []

        confidence_sum = 0.0

        segment_count = 0

        for segment in segments:

            transcript_parts.append(segment.text)

            # probability = (
            #     1.0 - segment.avg_logprob
            #     if segment.avg_logprob < 0
            #     else 1.0
            # )

            # confidence_sum += probability

            # segment_count += 1

            # segment_data.append(
            #     {
            #         "start": segment.start,
            #         "end": segment.end,
            #         "text": segment.text,
            #         "confidence": probability,
            #     }
            # )

            normalized_confidence = 1 / (
                1 + math.exp(-(segment.avg_logprob + 1.0) * 2)
            )

            normalized_confidence = max(
                0.0,
                min(1.0, normalized_confidence)
            )

            confidence_sum += normalized_confidence

            segment_count += 1

            segment_data.append(
                {
                    "start": segment.start,
                    "end": segment.end,
                    "text": segment.text,
                    "confidence": round(
                        normalized_confidence,
                        3,
                    ),
                }
            )

        transcript = " ".join(transcript_parts).strip()

        average_confidence = (
            confidence_sum / segment_count
            if segment_count
            else 0.0
        )

        whisper_result = WhisperResult(
            language=info.language,
            transcript=transcript,
            confidence=average_confidence,
        )

        logger.info(
            "Whisper transcription completed "
            "(language=%s)",
            info.language,
        )

        return {
            "whisper_result": whisper_result,
            "segments": segment_data,
            "language": info.language,
            "duration": info.duration,
        }


whisper_service = WhisperService()
