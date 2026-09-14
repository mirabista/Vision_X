"""
Document Report Agent — generates forensic report for PDF verification,
saves it to Supabase (document_reports table + visionx-reports storage bucket),
and raises an incident for high-risk documents.
"""

from __future__ import annotations

import time
import logging
import tempfile
from pathlib import Path
from datetime import datetime, timezone
from typing import Dict, Any, Optional

from backend.document.types import AgentResult, Analysis
from backend.repositories.document_repository import document_repository
from backend.repositories.storage_repository import StorageRepository
from backend.database.supabase_client import get_supabase_client

logger = logging.getLogger(__name__)

_storage = StorageRepository()


class DocumentReportAgent:
    """Generate JSON + PDF report for document verification."""

    async def run(
        self,
        analysis: Analysis,
        manager_result: AgentResult,
        structural: Dict[str, Any],
        metadata: Dict[str, Any],
        image_result: AgentResult,
        ocr_result: AgentResult,
        reasoning_result: AgentResult,
    ) -> AgentResult:
        start = time.perf_counter()
        try:
            evidence_data = manager_result.evidence
            trust_score = evidence_data.get("trust_score", 50)
            risk_level = evidence_data.get("risk_level", "medium")
            verdict = evidence_data.get("verdict", "")
            recommendations = evidence_data.get("recommendations", [])
            confidence = evidence_data.get("confidence", 0)
            executive_summary = reasoning_result.evidence.get("human_readable_summary", "")

            report_data = {
                "analysis_id": analysis.id,
                "filename": analysis.original_filename,
                "content_type": "application/pdf",
                "verification_type": "document",
                "trust_score": trust_score,
                "confidence": confidence,
                "risk_level": risk_level,
                "verdict": verdict,
                "recommendations": recommendations,
                "document_type": evidence_data.get("document_type", "unknown"),
                "structural_analysis": structural,
                "metadata": metadata,
                "image_forensics": image_result.evidence,
                "ocr": ocr_result.evidence,
                "ocr_text": ocr_result.evidence.get("combined_text", ""),
                "document_reasoning": reasoning_result.evidence,
                "executive_summary": executive_summary,
                "manager_decision": evidence_data,
                "generated_at": datetime.now(timezone.utc).isoformat(),
                "version": "1.0-document",
            }

            pdf_url = await self._generate_pdf(analysis, report_data)

            report_saved = await document_repository.save_report(
                user_id=analysis.user_id,
                analysis_id=analysis.id,
                report_data=report_data,
                pdf_url=pdf_url or "",
            )

            await document_repository.update_analysis(
                analysis.id,
                status="completed",
                trust_score=trust_score,
                confidence=confidence,
                risk_level=risk_level,
                verdict=verdict,
                document_type=evidence_data.get("document_type", "unknown"),
                executive_summary=str(executive_summary)[:500],
                page_count=ocr_result.evidence.get("page_count") or image_result.evidence.get("page_count"),
                completed_at=datetime.now(timezone.utc).isoformat(),
            )

            if risk_level in ("high", "critical") or trust_score < 30:
                self._create_incident(analysis, trust_score, risk_level)

            return AgentResult(
                agent="report",
                status="completed",
                confidence=1.0,
                findings=[
                    f"Document report generated: {report_saved.get('id', analysis.id)}",
                    f"Trust score: {trust_score}%",
                ],
                evidence={
                    "report_id": report_saved.get("id"),
                    "pdf_url": pdf_url,
                    "report_saved": bool(report_saved),
                },
                processing_time_ms=(time.perf_counter() - start) * 1000,
            )

        except Exception as e:
            logger.exception(f"Document report agent failed: {e}")
            return AgentResult(
                agent="report",
                status="error",
                error=str(e),
                processing_time_ms=(time.perf_counter() - start) * 1000,
            )

    def _create_incident(self, analysis: Analysis, trust_score: int, risk_level: str) -> None:
        """Raise an incident for a high-risk / low-trust document (best effort)."""
        try:
            now = datetime.now(timezone.utc).isoformat()
            get_supabase_client().schema("public").table("incidents").insert({
                "user_id": analysis.user_id,
                "title": f"Document trust score {trust_score}% - {risk_level.upper()} risk",
                "description": f"Document '{analysis.original_filename}' flagged during verification.",
                "severity": risk_level,
                "status": "open",
                "metadata": {"analysis_id": analysis.id, "trust_score": trust_score, "module": "document"},
                "created_at": now,
                "updated_at": now,
            }).execute()
        except Exception as e:
            logger.warning(f"Failed to create incident for document {analysis.id}: {e}")

    async def _generate_pdf(self, analysis: Analysis, report_data: Dict[str, Any]) -> Optional[str]:
        try:
            from reportlab.lib.pagesizes import letter
            from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
            from reportlab.lib.colors import HexColor
            from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer

            temp_path = None
            try:
                with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as f:
                    temp_path = f.name

                doc = SimpleDocTemplate(
                    temp_path, pagesize=letter,
                    rightMargin=72, leftMargin=72, topMargin=72, bottomMargin=72,
                )
                styles = getSampleStyleSheet()
                story = []

                title_style = ParagraphStyle(
                    "DocTitle", parent=styles["Heading1"],
                    fontSize=24, spaceAfter=16, textColor=HexColor("#1a56db"),
                )
                story.append(Paragraph("VisionX Document Verification Report", title_style))
                story.append(Spacer(1, 12))

                info_style = ParagraphStyle("Info", parent=styles["Normal"], fontSize=10)
                story.append(Paragraph(f"Analysis ID: {analysis.id}", info_style))
                story.append(Paragraph(f"Document: {analysis.original_filename}", info_style))
                story.append(Paragraph(
                    f"Type: {report_data.get('document_type', 'unknown')}", info_style,
                ))
                story.append(Spacer(1, 20))

                trust_score = report_data.get("trust_score", 0)
                score_color = (
                    "#1a56db" if trust_score >= 70
                    else "#eab308" if trust_score >= 40
                    else "#dc2626"
                )
                score_style = ParagraphStyle(
                    "Score", parent=styles["Heading2"],
                    fontSize=36, textColor=HexColor(score_color),
                )
                story.append(Paragraph(f"Trust Score: {trust_score}%", score_style))
                story.append(Spacer(1, 12))

                for key in ["verdict", "risk_level"]:
                    val = report_data.get(key, "")
                    if val:
                        story.append(Paragraph(
                            f"<b>{key.replace('_', ' ').title()}:</b> {str(val).upper()}",
                            styles["Normal"],
                        ))
                        story.append(Spacer(1, 8))

                structural = report_data.get("structural_analysis", {})
                flags = structural.get("structural_flags", [])
                if flags:
                    story.append(Spacer(1, 12))
                    story.append(Paragraph("<b>Structural Flags:</b>", styles["Normal"]))
                    for flag in flags[:5]:
                        story.append(Paragraph(f"• {flag}", info_style))
                        story.append(Spacer(1, 4))

                summary = report_data.get("executive_summary", "")
                if summary:
                    story.append(Spacer(1, 16))
                    story.append(Paragraph("<b>Summary:</b>", styles["Normal"]))
                    story.append(Paragraph(summary[:1000], info_style))

                doc.build(story)

                with open(temp_path, "rb") as f:
                    pdf_data = f.read()

                report_path = f"{analysis.user_id}/{analysis.id}/report.pdf"
                pdf_url = await _storage.upload(
                    pdf_data, "visionx-reports", report_path, "application/pdf",
                )
                return pdf_url

            finally:
                if temp_path:
                    Path(temp_path).unlink(missing_ok=True)

        except ImportError:
            logger.warning("ReportLab not available for document PDF")
            return None
        except Exception as e:
            logger.exception(f"Document PDF generation failed: {e}")
            return None
