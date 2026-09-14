"""
Document Reasoning Agent — Gemini-powered forensic document analysis.
"""

from __future__ import annotations

import os
import json
import time
import logging
from typing import Dict, Any

from backend.document.types import AgentResult, Analysis

logger = logging.getLogger(__name__)

DOCUMENT_ANALYSIS_PROMPT = """You are a forensic document analyst. Analyze the following document evidence and produce a structured verdict.

STRUCTURAL SIGNALS:
{structural}

METADATA:
{metadata}

EXTRACTED TEXT (from OCR):
{ocr_text}

IMAGE FORENSICS PER PAGE:
{image_forensics}

Your tasks:
1. Identify the document type (invoice, certificate, ID, official notice, etc.)
2. Check for internal consistency:
   - Do dates cohere?
   - Do numbers add up (subtotals, totals)?
   - Does the reference/serial number format match the claimed issuer?
   - Are there grammatical or phrasing anomalies?
3. Cross-reference the structural + metadata + visual signals — do they tell a consistent story or contradict each other?
4. Assign a confidence level (HIGH / MEDIUM / LOW) that this document is authentic.
5. List specific tampering indicators, if any.

Respond in JSON:
{{
  "document_type": "...",
  "authenticity_confidence": "HIGH|MEDIUM|LOW",
  "consistency_issues": [],
  "tampering_indicators": [],
  "recommended_action": "...",
  "human_readable_summary": "..."
}}
"""


class DocumentReasoningAgent:
    """Use Gemini for document-specific forensic reasoning."""

    def run(
        self,
        analysis: Analysis,
        structural: Dict[str, Any],
        metadata: Dict[str, Any],
        image_result: AgentResult,
        ocr_result: AgentResult,
    ) -> AgentResult:
        start = time.perf_counter()
        try:
            from google import genai

            api_key = os.getenv("GEMINI_API_KEY")
            if not api_key:
                return self._fallback(analysis, structural, metadata, start)

            ocr_text = ocr_result.evidence.get("combined_text", "")
            if not ocr_text:
                pages = ocr_result.evidence.get("pages", [])
                ocr_text = "\n".join(p.get("text", "") for p in pages)

            prompt = DOCUMENT_ANALYSIS_PROMPT.format(
                structural=json.dumps(structural, indent=2, default=str),
                metadata=json.dumps(metadata, indent=2, default=str),
                ocr_text=ocr_text[:8000],
                image_forensics=json.dumps(image_result.evidence, indent=2, default=str),
            )

            client = genai.Client(api_key=api_key)
            response = client.models.generate_content(
                model="gemini-2.0-flash",
                contents=prompt,
            )
            reasoning_text = (
                response.text
                if hasattr(response, "text") and response.text
                else "No response from Gemini"
            )

            parsed = self._parse_json_response(reasoning_text)
            confidence_map = {"HIGH": 0.85, "MEDIUM": 0.55, "LOW": 0.25}
            auth_conf = parsed.get("authenticity_confidence", "MEDIUM")
            confidence = confidence_map.get(auth_conf, 0.5)

            evidence = {
                "reasoning": reasoning_text,
                "parsed": parsed,
                "model": "gemini-2.0-flash",
                "document_type": parsed.get("document_type", "unknown"),
                "authenticity_confidence": auth_conf,
                "consistency_issues": parsed.get("consistency_issues", []),
                "tampering_indicators": parsed.get("tampering_indicators", []),
                "recommended_action": parsed.get("recommended_action", ""),
                "human_readable_summary": parsed.get("human_readable_summary", ""),
            }

            findings = [
                f"Document type: {parsed.get('document_type', 'unknown')}",
                f"Authenticity confidence: {auth_conf}",
            ]
            if parsed.get("tampering_indicators"):
                findings.append(
                    f"{len(parsed['tampering_indicators'])} tampering indicator(s) found"
                )

            return AgentResult(
                agent="document_reasoning",
                status="completed",
                confidence=confidence,
                findings=findings,
                evidence=evidence,
                processing_time_ms=(time.perf_counter() - start) * 1000,
            )

        except ImportError as e:
            return self._fallback(analysis, structural, metadata, start, str(e))
        except Exception as e:
            logger.exception(f"Document reasoning failed: {e}")
            return AgentResult(
                agent="document_reasoning",
                status="error",
                error=str(e),
                confidence=0.3,
                findings=["Document reasoning fell back due to error"],
                evidence={"error": str(e)},
                processing_time_ms=(time.perf_counter() - start) * 1000,
            )

    def _parse_json_response(self, text: str) -> Dict[str, Any]:
        try:
            start = text.find("{")
            end = text.rfind("}") + 1
            if start >= 0 and end > start:
                return json.loads(text[start:end])
        except (json.JSONDecodeError, ValueError):
            pass
        return {"human_readable_summary": text}

    def _fallback(
        self,
        analysis: Analysis,
        structural: Dict,
        metadata: Dict,
        start: float,
        error: str = "Gemini API key not configured",
    ) -> AgentResult:
        structural_risk = structural.get("risk_score", 0)
        metadata_risk = metadata.get("risk_score", 0)
        combined_risk = (structural_risk + metadata_risk) / 2

        if combined_risk >= 50:
            auth_conf = "LOW"
        elif combined_risk >= 25:
            auth_conf = "MEDIUM"
        else:
            auth_conf = "HIGH"

        flags = structural.get("structural_flags", []) + metadata.get("flags", [])
        return AgentResult(
            agent="document_reasoning",
            status="completed",
            confidence=0.4,
            findings=[f"Rule-based analysis (Gemini unavailable): {auth_conf} confidence"],
            evidence={
                "note": error,
                "document_type": "unknown",
                "authenticity_confidence": auth_conf,
                "tampering_indicators": flags,
                "human_readable_summary": (
                    f"Structural risk: {structural_risk}%, metadata risk: {metadata_risk}%. "
                    + ("; ".join(flags[:3]) if flags else "No major flags detected.")
                ),
            },
            processing_time_ms=(time.perf_counter() - start) * 1000,
        )
