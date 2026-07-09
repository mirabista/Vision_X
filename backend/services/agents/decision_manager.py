"""
Decision Manager - Merges all agent outputs to determine final verdict, confidence, and risk.
"""

from __future__ import annotations

from typing import Any, Dict, List
from backend.services.agents.base_agent import BaseAgent


class DecisionManager(BaseAgent):
    """Aggregates all agent results into a final decision."""

    def __init__(self):
        super().__init__(name="decision_manager")

    async def _run(self, **kwargs) -> Dict[str, Any]:
        previous_results = kwargs.get("previous_results", {})
        agents = previous_results.get("agents", {})

        all_findings: List[str] = []
        all_evidence: List[Dict] = []
        confidences: List[float] = []
        manipulation_signals = 0
        total_agents = 0

        for agent_name, agent_result in agents.items():
            if agent_result.get("status") != "completed":
                continue
            total_agents += 1
            output = agent_result.get("output", {})

            conf = output.get("confidence", 0)
            if isinstance(conf, (int, float)) and conf > 0:
                confidences.append(conf)

            findings = output.get("findings", [])
            if isinstance(findings, list):
                all_findings.extend(findings)

            evidence = output.get("evidence", [])
            if isinstance(evidence, list):
                all_evidence.extend(evidence)

            # Check for manipulation signals
            if output.get("manipulation_detected"):
                manipulation_signals += 1
            if output.get("ela_score", 0.5) < 0.3:
                manipulation_signals += 1
            if output.get("ai_generated_probability", 0) > 0.5:
                manipulation_signals += 1

        # Calculate overall confidence (weighted average)
        overall_confidence = sum(confidences) / len(confidences) if confidences else 0.5

        # Determine verdict
        manipulation_ratio = manipulation_signals / max(total_agents, 1)
        if manipulation_ratio >= 0.6:
            verdict = "likely_manipulated"
            risk_level = "high"
        elif manipulation_ratio >= 0.3:
            verdict = "needs_verification"
            risk_level = "medium"
        elif overall_confidence >= 0.7:
            verdict = "likely_authentic"
            risk_level = "minimal"
        elif overall_confidence >= 0.5:
            verdict = "mostly_authentic"
            risk_level = "low"
        else:
            verdict = "needs_verification"
            risk_level = "medium"

        # Build explanation
        explanation_parts = []
        if manipulation_signals > 0:
            explanation_parts.append(f"Detected {manipulation_signals} manipulation signal(s)")
        if overall_confidence >= 0.7:
            explanation_parts.append("High confidence from multiple analysis methods")
        elif overall_confidence >= 0.5:
            explanation_parts.append("Moderate confidence - some indicators need review")
        else:
            explanation_parts.append("Low confidence - insufficient reliable signals")

        explanation = ". ".join(explanation_parts)

        summary = f"Verdict: {verdict}, Confidence: {overall_confidence:.0%}, Risk: {risk_level}"
        return {
            "findings": all_findings,
            "confidence": overall_confidence,
            "verdict": verdict,
            "risk_level": risk_level,
            "explanation": explanation,
            "manipulation_signals": manipulation_signals,
            "total_agents_analyzed": total_agents,
            "evidence": all_evidence,
            "summary": summary,
        }