"""
Evidence Extraction Agent - Normalizes and aggregates evidence from all analysis agents.
"""

from __future__ import annotations

from typing import Any, Dict, List
from backend.services.agents.base_agent import BaseAgent


class EvidenceExtractionAgent(BaseAgent):
    """Combines and normalizes evidence from all upstream agents."""

    def __init__(self):
        super().__init__(name="evidence_extraction_agent")

    async def _run(self, **kwargs) -> Dict[str, Any]:
        previous_results = kwargs.get("previous_results", {})
        agents = previous_results.get("agents", {})

        all_evidence: List[Dict[str, Any]] = []
        all_findings: List[str] = []
        total_confidence = 0.0
        agent_count = 0

        for agent_name, agent_result in agents.items():
            if agent_result.get("status") != "completed":
                continue
            output = agent_result.get("output", {})

            # Collect evidence
            evidence_list = output.get("evidence", [])
            if isinstance(evidence_list, list):
                for ev in evidence_list:
                    ev["agent_name"] = agent_name
                    all_evidence.append(ev)

            # Collect findings
            findings = output.get("findings", [])
            if isinstance(findings, list):
                all_findings.extend(findings)

            # Track confidence
            conf = output.get("confidence", 0)
            if conf:
                total_confidence += conf
                agent_count += 1

        avg_confidence = total_confidence / agent_count if agent_count > 0 else 0.0

        # Deduplicate evidence by key
        seen_keys = set()
        unique_evidence = []
        for ev in all_evidence:
            key = ev.get("key", "")
            if key not in seen_keys:
                seen_keys.add(key)
                unique_evidence.append(ev)

        summary = f"Collected {len(unique_evidence)} evidence items from {agent_count} agents"
        return {
            "findings": all_findings,
            "confidence": avg_confidence,
            "evidence": unique_evidence,
            "evidence_count": len(unique_evidence),
            "summary": summary,
        }