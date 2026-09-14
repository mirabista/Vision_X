"""
PDF Metadata Analysis Agent.
Analyzes PDF document metadata (Creator, Producer, Author, dates) for signs
of tampering or metadata scrubbing.
"""

from __future__ import annotations

import logging
from typing import Dict

logger = logging.getLogger(__name__)

SUSPICIOUS_PRODUCERS = [
    "photoshop",
    "gimp",
    "paint.net",
    "canva",
]


class PDFMetadataAgent:
    """Analyzes PDF metadata fields for tampering indicators."""

    def analyze(self, pdf_path: str) -> Dict:
        try:
            from pypdf import PdfReader

            reader = PdfReader(pdf_path)
            metadata = reader.metadata or {}
        except Exception as e:
            logger.warning(f"Failed to read PDF metadata from {pdf_path}: {e}")
            return {
                "creator": "",
                "producer": "",
                "author": "",
                "creation_date": "",
                "modification_date": "",
                "title": "",
                "page_count": 0,
                "flags": [f"Failed to read PDF metadata: {e}"],
                "risk_score": 10,
            }

        result: Dict = {
            "creator": str(metadata.get("/Creator", "")),
            "producer": str(metadata.get("/Producer", "")),
            "author": str(metadata.get("/Author", "")),
            "creation_date": str(metadata.get("/CreationDate", "")),
            "modification_date": str(metadata.get("/ModDate", "")),
            "title": str(metadata.get("/Title", "")),
            "page_count": len(reader.pages) if hasattr(reader, "pages") else 0,
            "flags": [],
            "risk_score": 0,
        }

        if result["modification_date"] and result["creation_date"]:
            if result["modification_date"] != result["creation_date"]:
                result["flags"].append(
                    "Document was modified after creation "
                    f"(created: {result['creation_date']}, "
                    f"modified: {result['modification_date']})"
                )
                result["risk_score"] += 20

        producer_lower = result["producer"].lower()
        for sus in SUSPICIOUS_PRODUCERS:
            if sus in producer_lower:
                result["flags"].append(
                    f"Producer software '{result['producer']}' is unusual "
                    "for an official document."
                )
                result["risk_score"] += 15
                break

        if not any([result["creator"], result["producer"], result["author"]]):
            result["flags"].append(
                "All metadata fields are empty — possible scrubbing."
            )
            result["risk_score"] += 10

        result["risk_score"] = min(result["risk_score"], 100)
        return result
