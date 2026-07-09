"""
Vision Agent - Uses Google Gemini Vision API for AI-powered image analysis.
Analyzes images for manipulation, AI generation, and authenticity.
"""

from __future__ import annotations

import os
import base64
from typing import Any, Dict, List
from backend.core.logging import get_logger
from backend.services.agents.base_agent import BaseAgent

logger = get_logger(__name__)

import warnings
warnings.filterwarnings("ignore", category=FutureWarning, module="google.generativeai")
try:
    import google.generativeai as genai
    GEMINI_AVAILABLE = True
except ImportError:
    GEMINI_AVAILABLE = False
    logger.warning("google-generativeai not installed - VisionAgent restricted")


class VisionAgent(BaseAgent):
    """Uses Gemini Vision to analyze images for authenticity and manipulation."""

    def __init__(self):
        super().__init__(name="vision_agent", timeout=60)

    async def _run(self, image_path: str) -> Dict[str, Any]:
        findings: List[str] = []
        evidence: List[Dict[str, Any]] = []
        reasoning = ""
        manipulation_detected = False
        ai_generated_probability = 0.0
        confidence = 0.0

        if not GEMINI_AVAILABLE:
            findings.append("Gemini AI vision unavailable - google-generativeai not installed")
            return {
                "findings": findings,
                "confidence": 0.0,
                "reasoning": "Gemini API not available",
                "manipulation_detected": False,
                "ai_generated_probability": 0.0,
                "evidence": [],
                "summary": "AI vision analysis unavailable",
            }

        api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")
        if not api_key:
            return self._fallback("GEMINI_API_KEY not configured")

        try:
            genai.configure(api_key=api_key)
            model = genai.GenerativeModel("gemini-1.5-flash")

            with open(image_path, "rb") as f:
                img_data = f.read()

            prompt = """You are a digital forensics expert. Analyze this image and respond with a JSON object containing:
{
  "is_likely_manipulated": boolean,
  "ai_generated_probability": float 0-1,
  "findings": [list of specific observations],
  "confidence": float 0-1,
  "reasoning": "detailed analysis text",
  "artifacts_detected": ["list of manipulation artifacts found"]
}

Analyze for: pixel-level anomalies, compression artifacts, inconsistent lighting/shadows, 
edge misalignment, cloning/splicing signs, AI generation patterns, metadata inconsistencies.
If no manipulation is found, state that clearly."""

            response = model.generate_content([prompt, img_data])
            response_text = response.text.strip()

            # Try to parse JSON from response
            import json as json_module
            json_start = response_text.find("{")
            json_end = response_text.rfind("}") + 1
            if json_start >= 0 and json_end > json_start:
                parsed = json_module.loads(response_text[json_start:json_end])
                manipulation_detected = parsed.get("is_likely_manipulated", False)
                ai_generated_probability = parsed.get("ai_generated_probability", 0.0)
                confidence = parsed.get("confidence", 0.5)
                reasoning = parsed.get("reasoning", "")
                gemini_findings = parsed.get("findings", [])
                artifacts = parsed.get("artifacts_detected", [])
                findings.extend(gemini_findings)
                if artifacts:
                    findings.append(f"Artifacts detected: {', '.join(artifacts)}")
                if not gemini_findings:
                    findings.append("No manipulation artifacts detected")
            else:
                # Use raw text if not JSON
                reasoning = response_text[:2000]
                findings.append("AI analysis completed (raw text output)")
                confidence = 0.6

            evidence.append({
                "type": "vision_ai",
                "key": "gemini_analysis",
                "value": reasoning[:500],
                "confidence": confidence,
            })

            summary = f"Gemini AI: manipulation={'yes' if manipulation_detected else 'no'}, AI-gen={ai_generated_probability:.0%}"

        except Exception as e:
            logger.error(f"Gemini API error: {e}")
            return self._fallback(f"Gemini API error: {str(e)}")

        return {
            "findings": findings,
            "confidence": confidence,
            "reasoning": reasoning,
            "manipulation_detected": manipulation_detected,
            "ai_generated_probability": ai_generated_probability,
            "evidence": evidence,
            "summary": summary,
        }

    def _fallback(self, reason: str) -> Dict[str, Any]:
        return {
            "findings": [f"AI vision skipped: {reason}"],
            "confidence": 0.0,
            "reasoning": f"Analysis not performed: {reason}",
            "manipulation_detected": False,
            "ai_generated_probability": 0.0,
            "evidence": [],
            "summary": f"Vision analysis unavailable - {reason}",
        }