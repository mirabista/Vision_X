"""
VisionX Database Models - Analysis domain
SQLAlchemy async ORM models for analysis jobs, agent results, evidence, and reports.
"""

from __future__ import annotations

import uuid
from datetime import datetime, timezone
from typing import Optional, List

from sqlalchemy import (
    Column, String, Text, Integer, Float, Boolean, DateTime,
    ForeignKey, JSON, Enum as SAEnum, Index,
)
from sqlalchemy.orm import Mapped, mapped_column, relationship

from backend.database.session import Base


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


def _uuid() -> str:
    return str(uuid.uuid4())


class AnalysisJobModel(Base):
    """Core analysis job record."""
    __tablename__ = "analysis_jobs"
    __table_args__ = (
        Index("idx_jobs_user_id", "user_id"),
        Index("idx_jobs_status", "status"),
        Index("idx_jobs_module_type", "module_type"),
        Index("idx_jobs_created_at", "created_at"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    module_type: Mapped[str] = mapped_column(String(32), nullable=False)  # image, news, video, document, audio
    input_type: Mapped[Optional[str]] = mapped_column(String(32), nullable=True)
    input_content: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    source_url: Mapped[Optional[str]] = mapped_column(String(2048), nullable=True)
    title: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(
        String(32), default="pending", index=True
    )  # pending, queued, processing, completed, failed, cancelled
    progress: Mapped[int] = mapped_column(Integer, default=0)
    current_agent: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    current_stage: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    estimated_duration: Mapped[int] = mapped_column(Integer, default=120)
    overall_confidence: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    overall_verdict: Mapped[Optional[str]] = mapped_column(String(64), nullable=True)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    retry_count: Mapped[int] = mapped_column(Integer, default=0)
    extra_metadata: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True, default=dict)

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow
    )
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow
    )

    # Relationships
    agent_results: Mapped[List["AgentResultModel"]] = relationship(
        back_populates="analysis_job", cascade="all, delete-orphan"
    )
    logs: Mapped[List["AgentLogModel"]] = relationship(
        back_populates="analysis_job", cascade="all, delete-orphan"
    )
    report: Mapped[Optional["AnalysisReportModel"]] = relationship(
        back_populates="analysis_job", uselist=False, cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"<AnalysisJob(id={self.id}, module={self.module_type}, status={self.status})>"


class AgentResultModel(Base):
    """Individual AI agent execution result."""
    __tablename__ = "agent_results"
    __table_args__ = (
        Index("idx_agent_result_analysis", "analysis_id"),
        Index("idx_agent_result_name", "agent_name"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    analysis_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("analysis_jobs.id", ondelete="CASCADE"), nullable=False
    )
    agent_name: Mapped[str] = mapped_column(String(128), nullable=False)
    agent_order: Mapped[int] = mapped_column(Integer, default=0)
    agent_group: Mapped[int] = mapped_column(Integer, default=1)
    handler: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    status: Mapped[str] = mapped_column(
        String(32), default="pending"
    )  # pending, initializing, running, collecting_evidence, returning_result, completed, failed
    started_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    completed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    duration_ms: Mapped[float] = mapped_column(Float, default=0.0)
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    reasoning: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    summary: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    raw_output: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True, default=dict)
    evidence: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True, default=dict)
    error_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    retry_count: Mapped[int] = mapped_column(Integer, default=0)
    is_critical: Mapped[bool] = mapped_column(Boolean, default=False)  # If True, agent failure fails the pipeline

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow
    )

    # Relationship
    analysis_job: Mapped["AnalysisJobModel"] = relationship(back_populates="agent_results")

    def __repr__(self) -> str:
        return f"<AgentResult(id={self.id}, name={self.agent_name}, status={self.status})>"


class AgentLogModel(Base):
    """Execution log entries for analysis jobs."""
    __tablename__ = "agent_logs"
    __table_args__ = (
        Index("idx_log_analysis", "analysis_id"),
        Index("idx_log_timestamp", "timestamp"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    analysis_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("analysis_jobs.id", ondelete="CASCADE"), nullable=False
    )
    agent_name: Mapped[Optional[str]] = mapped_column(String(128), nullable=True)
    level: Mapped[str] = mapped_column(String(16), default="info")  # debug, info, warning, error
    message: Mapped[str] = mapped_column(Text, nullable=False)
    correlation_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    # Relationship
    analysis_job: Mapped["AnalysisJobModel"] = relationship(back_populates="logs")

    def __repr__(self) -> str:
        return f"<AgentLog(id={self.id}, level={self.level}, agent={self.agent_name})>"


class AnalysisReportModel(Base):
    """Generated forensic analysis report."""
    __tablename__ = "reports"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    analysis_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("analysis_jobs.id", ondelete="CASCADE"), unique=True, nullable=False
    )
    user_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    report_version: Mapped[str] = mapped_column(String(16), default="1.0")
    report_type: Mapped[str] = mapped_column(String(32), default="json")  # json, pdf
    json_report: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True, default=dict)
    pdf_url: Mapped[Optional[str]] = mapped_column(String(2048), nullable=True)
    pdf_path: Mapped[Optional[str]] = mapped_column(String(1024), nullable=True)
    download_count: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=_utcnow, onupdate=_utcnow
    )

    # Relationship
    analysis_job: Mapped["AnalysisJobModel"] = relationship(back_populates="report")

    def __repr__(self) -> str:
        return f"<AnalysisReport(id={self.id}, analysis={self.analysis_id})>"


class EvidenceModel(Base):
    """Collected evidence items from agent execution."""
    __tablename__ = "evidence_items"
    __table_args__ = (
        Index("idx_evidence_analysis", "analysis_id"),
        Index("idx_evidence_agent", "agent_name"),
    )

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=_uuid)
    analysis_id: Mapped[str] = mapped_column(
        String(36), ForeignKey("analysis_jobs.id", ondelete="CASCADE"), nullable=False
    )
    agent_name: Mapped[str] = mapped_column(String(128), nullable=False)
    evidence_type: Mapped[str] = mapped_column(String(64), nullable=False)  # text, image, url, file, json
    key: Mapped[str] = mapped_column(String(255), nullable=False)
    value: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    reference_url: Mapped[Optional[str]] = mapped_column(String(2048), nullable=True)
    confidence: Mapped[float] = mapped_column(Float, default=0.0)
    is_exculpatory: Mapped[bool] = mapped_column(Boolean, default=False)  # Evidence that supports authenticity
    is_inculpatory: Mapped[bool] = mapped_column(Boolean, default=False)  # Evidence that suggests manipulation
    extra_metadata: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=_utcnow)

    def __repr__(self) -> str:
        return f"<Evidence(id={self.id}, type={self.evidence_type}, agent={self.agent_name})>"