"""
Pipeline Orchestrator - Coordinates multi-agent analysis pipelines.
Supports both image analysis and news verification workflows using real AI agents.
"""

from __future__ import annotations

import asyncio
import time
from typing import Any, Dict, List, Optional

from backend.core.logging import get_logger
from backend.services.agents.metadata_agent import MetadataAgent
from backend.services.agents.ocr_agent import OCRAgent
from backend.services.agents.image_forensics_agent import ImageForensicsAgent
from backend.services.agents.vision_agent import VisionAgent
from backend.services.agents.evidence_agent import EvidenceExtractionAgent
from backend.services.agents.decision_manager import DecisionManager
from backend.services.agents.trust_score_engine import TrustScoreEngine
from backend.services.agents.report_generator import ReportGenerator

logger = get_logger(__name__)


class AgentStep:
    """Represents a single agent step in the pipeline."""

    def __init__(self, name: str, agent_instance, order: int = 0, is_critical: bool = True):
        self.name = name
        self.agent = agent_instance
        self.order = order
        self.is_critical = is_critical


class PipelineOrchestrator:
    """Orchestrates execution of analysis pipeline agents."""

    def __init__(self):
        # Initialize real agents
        self.metadata_agent = MetadataAgent()
        self.ocr_agent = OCRAgent()
        self.forensics_agent = ImageForensicsAgent()
        self.vision_agent = VisionAgent()
        self.evidence_agent = EvidenceExtractionAgent()
        self.decision_manager = DecisionManager()
        self.trust_score_engine = TrustScoreEngine()
        self.report_generator = ReportGenerator()

    async def run(
        self,
        analysis_id: str,
        module: str,
        user_id: str,
        input_content: str,
        input_type: str,
        source_url: Optional[str] = None,
        title: Optional[str] = None,
    ) -> Dict[str, Any]:
        start_time = time.time()
        logger.info(f"[Pipeline] Starting {module} pipeline for {analysis_id}")

        # Extract image path from input content
        image_path = self._extract_image_path(input_content, input_type)

        steps = self._get_image_steps(image_path) if module == "image" else self._get_news_steps()

        results: Dict[str, Any] = {
            "analysis_id": analysis_id,
            "module": module,
            "user_id": user_id,
            "input_type": input_type,
            "source_url": source_url,
            "title": title,
            "agents": {},
            "evidence": [],
            "verdict": "unknown",
            "confidence": 0.0,
            "risk_level": "medium",
            "processing_time_ms": 0.0,
            "report": None,
        }

        try:
            for step in sorted(steps, key=lambda s: s.order):
                step_start = time.time()
                logger.info(f"[Pipeline] Executing agent: {step.name}")

                try:
                    step_result = await step.agent.execute(
                        analysis_id=analysis_id,
                        image_path=image_path,
                        input_content=input_content,
                        input_type=input_type,
                        source_url=source_url,
                        previous_results=results,
                    )

                    results["agents"][step.name] = {
                        "status": step_result.get("status", "completed"),
                        "duration_ms": (time.time() - step_start) * 1000,
                        "output": step_result,
                    }

                    # Merge evidence
                    evidence = step_result.get("evidence", [])
                    if isinstance(evidence, list):
                        results["evidence"].extend(evidence)

                    logger.info(f"[Pipeline] Agent {step.name} completed")

                except Exception as e:
                    logger.error(f"[Pipeline] Agent {step.name} failed: {e}")
                    results["agents"][step.name] = {
                        "status": "failed",
                        "error": str(e),
                        "duration_ms": (time.time() - step_start) * 1000,
                    }
                    if step.is_critical:
                        raise

            # Extract final results from decision manager and trust score
            dm = results["agents"].get("decision_manager", {}).get("output", {})
            ts = results["agents"].get("trust_score_engine", {}).get("output", {})
            rg = results["agents"].get("report_generator", {}).get("output", {})

            results["verdict"] = dm.get("verdict", "unknown")
            results["confidence"] = ts.get("confidence", 0.0)
            results["risk_level"] = ts.get("risk_level", "medium")
            results["trust_score"] = ts.get("trust_score", 0)
            results["explanation"] = dm.get("explanation", "")
            results["report_data"] = rg.get("report_data")
            results["pdf_path"] = rg.get("pdf_path")
            results["processing_time_ms"] = (time.time() - start_time) * 1000

            logger.info(f"[Pipeline] Completed: verdict={results['verdict']}, confidence={results['confidence']:.0%}")

            return results

        except Exception as e:
            logger.error(f"[Pipeline] Pipeline failed: {e}")
            results["verdict"] = "error"
            results["confidence"] = 0.0
            results["processing_time_ms"] = (time.time() - start_time) * 1000
            raise

    def _get_image_steps(self, image_path: str) -> List[AgentStep]:
        """Get steps for real image analysis pipeline."""
        return [
            AgentStep("metadata_agent", self.metadata_agent, order=1, is_critical=False),
            AgentStep("ocr_agent", self.ocr_agent, order=2, is_critical=False),
            AgentStep("image_forensics_agent", self.forensics_agent, order=3, is_critical=False),
            AgentStep("vision_agent", self.vision_agent, order=4, is_critical=False),
            AgentStep("evidence_extraction_agent", self.evidence_agent, order=5, is_critical=False),
            AgentStep("decision_manager", self.decision_manager, order=6, is_critical=True),
            AgentStep("trust_score_engine", self.trust_score_engine, order=7, is_critical=True),
            AgentStep("report_generator", self.report_generator, order=8, is_critical=False),
        ]

    def _get_news_steps(self) -> List[AgentStep]:
        """Get steps for news verification pipeline."""
        return self._get_image_steps(image_path="")  # Same pipeline for now

    def _extract_image_path(self, input_content: str, input_type: str) -> str:
        """Extract image file path from analysis input."""
        if input_type and input_type.startswith("file:"):
            # Parse the stored file content string
            import re
            match = re.search(r"File: ([^,]+)", input_content)
            if match:
                filename = match.group(1).strip()
                # Look in uploads directory
                import os
                for root, dirs, files in os.walk(os.path.join(os.getcwd(), "uploads")):
                    if filename in files:
                        return os.path.join(root, filename)
                # Also check temp
                for root, dirs, files in os.walk(os.path.join(os.getcwd(), "tmp")):
                    if filename in files:
                        return os.path.join(root, filename)

            # Try the file directly if it's a path
            import os
            if os.path.exists(input_content):
                return input_content

        return ""


# Global orchestrator instance
pipeline_orchestrator = PipelineOrchestrator()
