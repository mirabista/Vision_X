"""
Video Analysis Models
SQLAlchemy models for the video analysis module.
"""
from __future__ import annotations

from datetime import datetime
from typing import Optional, List, Dict, Any
from uuid import UUID

from sqlalchemy import (
    Column, String, Integer, Float, Boolean, Text, JSON, DateTime,
    ForeignKey, BigInteger, Numeric
)
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from sqlalchemy.orm import relationship, declarative_base

Base = declarative_base()


class VideoAnalysis(Base):
    """Main video analysis record."""
    __tablename__ = "video_analyses"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(PG_UUID(as_uuid=True), nullable=False, index=True)
    input_type = Column(String(32), nullable=False)  # upload, url, youtube
    input_content = Column(Text, nullable=False)  # video URL or file path
    source_url = Column(Text)
    title = Column(Text)
    status = Column(String(32), nullable=False, default="queued")
    progress = Column(Integer, nullable=False, default=0)
    trust_score = Column(Numeric)
    authenticity_score = Column(Numeric)
    authenticity_level = Column(String(32))
    risk_level = Column(String(32))
    verdict = Column(Text)
    confidence = Column(Numeric)
    metadata = Column(JSON)
    executive_summary = Column(Text)
    error_message = Column(Text)
    processing_time_ms = Column(BigInteger)
    claim_count = Column(Integer)
    evidence_count = Column(Integer)
    frame_count = Column(Integer)
    audio_duration_seconds = Column(Numeric)
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    frames = relationship("VideoFrame", back_populates="analysis", cascade="all, delete-orphan")
    evidence = relationship("VideoEvidence", back_populates="analysis", cascade="all, delete-orphan")
    audio = relationship("VideoAudio", back_populates="analysis", uselist=False, cascade="all, delete-orphan")
    reports = relationship("VideoReport", back_populates="analysis", cascade="all, delete-orphan")
    agent_results = relationship("VideoAgentResult", back_populates="analysis", cascade="all, delete-orphan")


class VideoFrame(Base):
    """Extracted video frame."""
    __tablename__ = "video_frames"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    analysis_id = Column(PG_UUID(as_uuid=True), ForeignKey("video_analyses.id", ondelete="CASCADE"), nullable=False)
    frame_number = Column(Integer, nullable=False)
    timestamp_seconds = Column(Numeric, nullable=False)
    frame_path = Column(Text)
    thumbnail_path = Column(Text)
    scene_change = Column(Boolean, default=False)
    motion_score = Column(Numeric)
    ocr_text = Column(Text)
    objects_detected = Column(JSON)
    faces_detected = Column(JSON)
    deepfake_score = Column(Numeric)
    manipulation_indicators = Column(JSON)
    metadata = Column(JSON)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    analysis = relationship("VideoAnalysis", back_populates="frames")


class VideoEvidence(Base):
    """Evidence collected during video analysis."""
    __tablename__ = "video_evidence"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    analysis_id = Column(PG_UUID(as_uuid=True), ForeignKey("video_analyses.id", ondelete="CASCADE"), nullable=False)
    agent_name = Column(String(64), nullable=False)
    evidence_type = Column(String(32), nullable=False)  # frame, audio, ocr, deepfake, external
    key = Column(String(128), nullable=False)
    value = Column(Text)
    reference_url = Column(Text)
    confidence = Column(Numeric)
    claim = Column(Text)
    source = Column(Text)
    url = Column(Text)
    excerpt = Column(Text)
    credibility = Column(Numeric)
    supports_claim = Column(Boolean, default=True)
    metadata = Column(JSON)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    analysis = relationship("VideoAnalysis", back_populates="evidence")


class VideoAudio(Base):
    """Extracted audio and transcript."""
    __tablename__ = "video_audio"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    analysis_id = Column(PG_UUID(as_uuid=True), ForeignKey("video_analyses.id", ondelete="CASCADE"), nullable=False)
    audio_path = Column(Text)
    transcript = Column(Text)
    language_detected = Column(String(16))
    confidence = Column(Numeric)
    speaker_segments = Column(JSON)
    silence_periods = Column(JSON)
    audio_manipulation_indicators = Column(JSON)
    metadata = Column(JSON)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)

    # Relationships
    analysis = relationship("VideoAnalysis", back_populates="audio")


class VideoReport(Base):
    """Generated video analysis report."""
    __tablename__ = "video_reports"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    analysis_id = Column(PG_UUID(as_uuid=True), ForeignKey("video_analyses.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(PG_UUID(as_uuid=True), nullable=False)
    report_data = Column(JSON)
    report_type = Column(String(32), default="json")
    executive_summary = Column(Text)
    executive_summary_short = Column(Text)
    recommendations = Column(JSON)
    claims = Column(JSON)
    evidence = Column(JSON)
    sources = Column(JSON)
    frame_analysis = Column(JSON)
    ocr_findings = Column(JSON)
    audio_findings = Column(JSON)
    deepfake_findings = Column(JSON)
    bias_analysis = Column(JSON)
    context_analysis = Column(JSON)
    ai_explanation = Column(Text)
    processing_time_ms = Column(BigInteger)
    pdf_path = Column(Text)
    pdf_url = Column(Text)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    analysis = relationship("VideoAnalysis", back_populates="reports")


class VideoAgentResult(Base):
    """Agent execution results."""
    __tablename__ = "video_agent_results"

    id = Column(PG_UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    analysis_id = Column(PG_UUID(as_uuid=True), ForeignKey("video_analyses.id", ondelete="CASCADE"), nullable=False)
    agent_name = Column(String(64), nullable=False)
    agent_order = Column(Integer)
    status = Column(String(32))
    started_at = Column(DateTime(timezone=True))
    completed_at = Column(DateTime(timezone=True))
    duration_ms = Column(Numeric)
    confidence = Column(Numeric)
    reasoning = Column(Text)
    summary = Column(Text)
    raw_output = Column(JSON)
    evidence = Column(JSON)
    error_message = Column(Text)
    retry_count = Column(Integer, default=0)
    findings = Column(JSON)
    processing_time_ms = Column(BigInteger)
    processed_output = Column(JSON)
    created_at = Column(DateTime(timezone=True), default=datetime.utcnow)
    updated_at = Column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    analysis = relationship("VideoAnalysis", back_populates="agent_results")

import uuid