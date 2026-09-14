"""
Document Manager Agent — fuses structural, metadata, visual, and reasoning signals
into a final trust score for PDF/document verification.
"""

from __future__ import annotations

import time
import logging
from typing import Dict, Any

from backend.document.types import AgentResult, Analysis

logger = logging.getLogger(__name__)


class DocumentManagerAgent:
    """Combine document verification signals into trust score and verdict."""

    async def run(
        self,
        analysis: Analysis,
        structural: Dict[str, Any],
        metadata: Dict[str, Any],
        image_result: AgentResult,
        ocr_result: AgentResult,
        reasoning_result: AgentResult,
    ) -> AgentResult:
        start = time.perf_counter()
        try:
            structural_risk = structural.get("risk_score", 0)
            metadata_risk = metadata.get("risk_score", 0)

            auth_conf = reasoning_result.evidence.get("authenticity_confidence", "MEDIUM")
            auth_score_map = {"HIGH": 85, "MEDIUM": 55, "LOW": 25}
            reasoning_score = auth_score_map.get(auth_conf, 50)

            visual_anomalies = image_result.evidence.get("total_anomalies", 0)
            visual_penalty = min(visual_anomalies * 5, 30)

            base_trust = reasoning_score
            risk_penalty = (structural_risk * 0.4 + metadata_risk * 0.3) / 2
            trust_score = int(max(0, min(100, base_trust - risk_penalty - visual_penalty)))

            if trust_score >= 80:
                risk_level = "minimal"
            elif trust_score >= 60:
                risk_level = "low"
            elif trust_score >= 40:
                risk_level = "medium"
            elif trust_score >= 20:
                risk_level = "high"
            else:
                risk_level = "critical"

            if trust_score >= 70:
                verdict = "The document appears to be AUTHENTIC with high confidence."
            elif trust_score >= 40:
                verdict = (
                    "The document requires FURTHER INVESTIGATION. "
                    "Some indicators suggest possible tampering."
                )
            else:
                verdict = (
                    "The document appears to be TAMPERED or FORGED "
                    "with high confidence."
                )

            all_findings: list[str] = []
            all_findings.extend(structural.get("structural_flags", []))
            all_findings.extend(metadata.get("flags", []))
            all_findings.extend(image_result.findings or [])
            all_findings.extend(ocr_result.findings or [])
            all_findings.extend(reasoning_result.findings or [])

            recommendations = []
            if structural.get("incremental_updates"):
                recommendations.append(
                    "Document has incremental updates — inspect recovered previous versions"
                )
            if risk_level in ("high", "critical"):
                recommendations.append("Flag this document for immediate manual review")
            if trust_score < 60:
                recommendations.append("Request original source document from issuer")
            recommendations.append("Store forensic evidence for audit trail")

            confidence = trust_score / 100.0

            evidence = {
                "trust_score": trust_score,
                "confidence": round(confidence, 3),
                "risk_level": risk_level,
                "verdict": verdict,
                "recommendations": recommendations,
                "document_type": reasoning_result.evidence.get("document_type", "unknown"),
                "structural_risk": structural_risk,
                "metadata_risk": metadata_risk,
                "visual_anomalies": visual_anomalies,
                "agent_confidences": {
                    "structural": 1.0 - structural_risk / 100,
                    "metadata": 1.0 - metadata_risk / 100,
                    "image_forensics": image_result.confidence,
                    "ocr": ocr_result.confidence,
                    "document_reasoning": reasoning_result.confidence,
                },
            }

            return AgentResult(
                agent="manager_decision",
                status="completed",
                confidence=confidence,
                findings=all_findings[:30],
                evidence=evidence,
                processing_time_ms=(time.perf_counter() - start) * 1000,
            )

        except Exception as e:
            logger.exception(f"Document manager agent failed: {e}")
            return AgentResult(
                agent="manager_decision",
                status="error",
                error=str(e),
                processing_time_ms=(time.perf_counter() - start) * 1000,
            )
