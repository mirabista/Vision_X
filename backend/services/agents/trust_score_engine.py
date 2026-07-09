"""
Trust Score Engine - Calculates a transparent, explainable trust score (0-100).
Uses weighted aggregation from all agent outputs with documented methodology.
"""

from __future__ import annotations

from typing import Any, Dict, List
from backend.services.agents.base_agent import BaseAgent

# Weights for each analysis dimension
WEIGHTS = {
    "metadata_agent": 0.10,
    "ocr_agent": 0.05,
    "image_forensics_agent": 0.30,
    "vision_agent": 0.35,
    "evidence_extraction_agent": 0.10,
    "decision_manager": 0.10,
}


class TrustScoreEngine(BaseAgent):
    """Calculates trust score from weighted agent outputs."""

    def __init__(self):
        super().__init__(name="trust_score_engine")

    async def _run(self, **kwargs) -> Dict[str, Any]:
        previous_results = kwargs.get("previous_results", {})
        agents = previous_results.get("agents", {})

        weighted_score = 0.0
        total_weight = 0.0
        score_components: Dict[str, float] = {}
        all_evidence: List[Dict] = []
        all_findings: List[str] = []

        for agent_name, agent_result in agents.items():
            if agent_result.get("status") != "completed":
                continue

            output = agent_result.get("output", {})
            weight = WEIGHTS.get(agent_name, 0.05)

            # Extract confidence from agent output
            confidence = output.get("confidence", 0.5)
            if isinstance(confidence, (int, float)):
                weighted_score += confidence * weight
                total_weight += weight
                score_components[agent_name] = round(confidence * 100, 1)

            # Collect evidence and findings
            evidence = output.get("evidence", [])
            if isinstance(evidence, list):
                all_evidence.extend(evidence)
            findings = output.get("findings", [])
            if isinstance(findings, list):
                all_findings.extend(findings)

        # Also check for decision manager output
        dm = agents.get("decision_manager", {})
        if dm.get("status") == "completed":
            dm_output = dm.get("output", {})
            dm_confidence = dm_output.get("confidence", 0.5)
            score_components["decision_manager"] = round(dm_confidence * 100, 1)
            if "risk_level" in dm_output:
                score_components["risk_level"] = dm_output["risk_level"]

        # Normalize score
        if total_weight > 0:
            trust_score = int(round((weighted_score / total_weight) * 100))
        else:
            trust_score = 50

        trust_score = max(0, min(100, trust_score))

        # Determine risk level from score
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

        # Build explanation
        breakdown = ", ".join(f"{k}: {v}%" for k, v in score_components.items())
        explanation = (
            f"Trust score {trust_score}% calculated from weighted analysis of "
            f"{len(score_components)} dimensions: {breakdown}"
        )

        summary = f"Trust Score: {trust_score}% ({risk_level} risk)"
        return {
            "findings": all_findings,
            "confidence": trust_score / 100.0,
            "trust_score": trust_score,
            "risk_level": risk_level,
            "score_components": score_components,
            "explanation": explanation,
            "evidence": all_evidence,
            "summary": summary,
        }