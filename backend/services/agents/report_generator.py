"""
Report Generator - Creates structured JSON reports and PDF documents from analysis results.
"""

from __future__ import annotations

import json
import io
import os
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional
from backend.core.logging import get_logger
from backend.services.agents.base_agent import BaseAgent

logger = get_logger(__name__)

try:
    from reportlab.lib.pagesizes import letter
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.lib.colors import HexColor
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image as RLImage
    from reportlab.lib import colors
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False
    logger.warning("reportlab not installed - PDF generation disabled")


class ReportGenerator(BaseAgent):
    """Generates structured reports from analysis results."""

    def __init__(self):
        super().__init__(name="report_generator")

    async def _run(self, **kwargs) -> Dict[str, Any]:
        previous_results = kwargs.get("previous_results", {})
        analysis_id = previous_results.get("analysis_id", "unknown")
        agents = previous_results.get("agents", {})

        # Extract final decision from trust score engine or decision manager
        trust_engine = agents.get("trust_score_engine", {}).get("output", {})
        decision_mgr = agents.get("decision_manager", {}).get("output", {})

        trust_score = trust_engine.get("trust_score", 50)
        risk_level = trust_engine.get("risk_level", "medium")
        verdict = decision_mgr.get("verdict", "unknown")
        explanation = decision_mgr.get("explanation", "")
        confidence = trust_engine.get("confidence", 0.5)

        # Collect all evidence
        all_evidence: List[Dict] = []
        all_findings: List[str] = []
        agent_summaries: Dict[str, str] = {}

        for agent_name, agent_result in agents.items():
            if agent_result.get("status") != "completed":
                continue
            output = agent_result.get("output", {})
            summary = output.get("summary", "")
            if summary:
                agent_summaries[agent_name] = summary
            evidence = output.get("evidence", [])
            if isinstance(evidence, list):
                all_evidence.extend(evidence)
            findings = output.get("findings", [])
            if isinstance(findings, list):
                all_findings.extend(findings)

        # Build report data
        report_data = {
            "report_id": f"VX-{analysis_id[:8].upper()}",
            "analysis_id": analysis_id,
            "generated_at": datetime.now(timezone.utc).isoformat(),
            "executive_summary": {
                "trust_score": trust_score,
                "risk_level": risk_level,
                "verdict": verdict,
                "confidence": round(confidence * 100, 1),
                "explanation": explanation,
            },
            "agent_summaries": agent_summaries,
            "findings": all_findings,
            "evidence_count": len(all_evidence),
            "recommendations": self._generate_recommendations(trust_score, risk_level, verdict),
        }

        # Generate PDF if reportlab available
        pdf_path = None
        if REPORTLAB_AVAILABLE:
            try:
                pdf_path = self._generate_pdf(report_data, analysis_id)
            except Exception as e:
                logger.error(f"PDF generation failed: {e}")

        summary = f"Report generated: trust={trust_score}%, verdict={verdict}, risk={risk_level}"
        return {
            "findings": ["Report generated successfully"],
            "confidence": confidence,
            "report_data": report_data,
            "pdf_path": pdf_path,
            "summary": summary,
        }

    def _generate_recommendations(self, trust_score: int, risk_level: str, verdict: str) -> List[str]:
        """Generate recommendations based on analysis results."""
        recs = []
        if trust_score >= 80:
            recs.append("Image appears authentic - no further action required")
        elif trust_score >= 60:
            recs.append("Image appears mostly authentic - manual review recommended")
        elif trust_score >= 40:
            recs.append("Image requires verification - additional forensic analysis recommended")
        else:
            recs.append("Image shows strong signs of manipulation - immediate investigation required")

        if risk_level in ("high", "critical"):
            recs.append("Flag this image for security review")
            recs.append("Do not use this image as evidence without further verification")
        return recs

    def _generate_pdf(self, report_data: Dict, analysis_id: str) -> str:
        """Generate a PDF report using ReportLab."""
        buf = io.BytesIO()
        doc = SimpleDocTemplate(buf, pagesize=letter)
        styles = getSampleStyleSheet()
        elements = []

        # Title
        title_style = ParagraphStyle("Title2", parent=styles["Title"], fontSize=20, spaceAfter=12)
        elements.append(Paragraph(f"VisionX Forensic Report", title_style))
        elements.append(Paragraph(f"Report ID: {report_data['report_id']}", styles["Normal"]))
        elements.append(Paragraph(f"Analysis ID: {analysis_id}", styles["Normal"]))
        elements.append(Paragraph(f"Generated: {report_data['generated_at']}", styles["Normal"]))
        elements.append(Spacer(1, 0.25 * inch))

        # Executive Summary
        elements.append(Paragraph("Executive Summary", styles["Heading2"]))
        es = report_data["executive_summary"]
        summary_data = [
            ["Metric", "Value"],
            ["Trust Score", f"{es['trust_score']}%"],
            ["Risk Level", es["risk_level"].upper()],
            ["Verdict", es["verdict"].replace("_", " ").title()],
            ["Confidence", f"{es['confidence']}%"],
        ]
        t = Table(summary_data, colWidths=[2 * inch, 3 * inch])
        t.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), HexColor("#2563EB")),
            ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, -1), 10),
            ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, HexColor("#F8FAFC")]),
        ]))
        elements.append(t)
        elements.append(Spacer(1, 0.15 * inch))

        if es["explanation"]:
            elements.append(Paragraph(f"<b>Explanation:</b> {es['explanation']}", styles["Normal"]))
            elements.append(Spacer(1, 0.15 * inch))

        # Agent Summaries
        elements.append(Paragraph("Agent Analysis Results", styles["Heading2"]))
        for agent, summary in report_data.get("agent_summaries", {}).items():
            elements.append(Paragraph(f"<b>{agent.replace('_', ' ').title()}:</b> {summary}", styles["Normal"]))
            elements.append(Spacer(1, 0.05 * inch))

        # Findings
        if report_data.get("findings"):
            elements.append(Paragraph("Key Findings", styles["Heading2"]))
            for finding in report_data["findings"][:20]:
                elements.append(Paragraph(f"• {finding}", styles["Normal"]))
                elements.append(Spacer(1, 0.03 * inch))

        # Recommendations
        elements.append(Paragraph("Recommendations", styles["Heading2"]))
        for rec in report_data.get("recommendations", []):
            elements.append(Paragraph(f"• {rec}", styles["Normal"]))
            elements.append(Spacer(1, 0.03 * inch))

        doc.build(elements)
        pdf_bytes = buf.getvalue()

        # Save to reports directory
        reports_dir = os.path.join(os.getcwd(), "reports")
        os.makedirs(reports_dir, exist_ok=True)
        pdf_path = os.path.join(reports_dir, f"report_{analysis_id}.pdf")
        with open(pdf_path, "wb") as f:
            f.write(pdf_bytes)

        logger.info(f"PDF report saved to {pdf_path}")
        return pdf_path