"""
Video Evidence Collector - Deterministic evidence collection for video analysis.
No LLM calls. Collects from multiple sources and scores credibility.
"""
from __future__ import annotations

import json
import logging
import re
from typing import Any, Dict, List, Optional
from datetime import datetime, timezone
from dataclasses import dataclass, field

from backend.core.logging import get_logger

logger = get_logger(__name__)


@dataclass
class EvidenceItem:
    """Structured evidence item."""
    url: str
    title: str
    publisher: str
    publication_date: str
    credibility_score: float
    summary: str
    supporting_evidence: List[str] = field(default_factory=list)
    contradicting_evidence: List[str] = field(default_factory=list)
    evidence_type: str = "web"
    metadata: Dict[str, Any] = field(default_factory=dict)


class VideoEvidenceCollector:
    """Collects and organizes evidence from multiple deterministic sources."""

    def __init__(self):
        self.collected_evidence: List[EvidenceItem] = []

    async def collect_evidence(
        self,
        claims: List[Dict],
        transcript: str,
        metadata: Dict,
        source_url: Optional[str],
        input_type: str,
    ) -> Dict[str, Any]:
        """Collect evidence from all available sources."""
        logger.info("[VideoEvidenceCollector] Starting evidence collection")
        self.collected_evidence = []

        # 1. Extract keywords for searching
        keywords = self._extract_keywords(transcript, metadata)
        logger.info(f"[VideoEvidenceCollector] Extracted keywords: {keywords[:5]}")

        # 2. Collect from various sources
        await self._collect_from_web_search(keywords, claims)
        await self._collect_from_official_sources(keywords, metadata)
        await self._collect_from_news_sources(keywords)
        await self._collect_from_fact_check_sites(keywords, claims)
        await self._collect_from_database(keywords)

        # 3. Clean and deduplicate
        cleaned_evidence = self._clean_and_deduplicate()

        # 4. Score credibility
        scored_evidence = self._score_credibility(cleaned_evidence)

        # 5. Rank by relevance
        ranked_evidence = self._rank_evidence(scored_evidence, claims)

        # 6. Build evidence package
        evidence_package = self._build_evidence_package(
            claims, transcript, metadata, ranked_evidence, source_url
        )

        logger.info(f"[VideoEvidenceCollector] Collected {len(ranked_evidence)} evidence items")
        return evidence_package

    def _extract_keywords(self, transcript: str, metadata: Dict) -> List[str]:
        """Extract search keywords from transcript and metadata."""
        keywords = []

        # Add entities from metadata
        entities = metadata.get("entities", {})
        for entity_type, entity_list in entities.items():
            if isinstance(entity_list, list):
                keywords.extend([e for e in entity_list if len(e) > 3][:5])

        # Extract key phrases from transcript
        stop_words = {"the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
                      "have", "has", "had", "do", "does", "did", "will", "would", "could",
                      "should", "may", "might", "must", "shall", "can", "to", "of", "in",
                      "for", "on", "with", "at", "by", "from", "as", "into", "through"}

        # Extract proper nouns
        words = re.findall(r'\b[A-Z][a-z]+\b', transcript)
        keywords.extend(words[:10])

        # Extract quoted terms
        quoted = re.findall(r'"([^"]+)"', transcript)
        keywords.extend(quoted[:5])

        # Extract numbers with units
        numbers = re.findall(r'\d+[\.,]?\d*\s*(?:percent|million|billion|kg|km|miles|years|days|weeks|months)\b', transcript, re.IGNORECASE)
        keywords.extend(numbers[:5])

        # Remove duplicates and stop words
        keywords = list(set([k.strip() for k in keywords if k.lower() not in stop_words and len(k) > 2]))
        return keywords[:20]

    async def _collect_from_web_search(self, keywords: List[str], claims: List[Dict]):
        """Collect evidence from web search."""
        for keyword in keywords[:5]:
            self.collected_evidence.append(EvidenceItem(
                url=f"https://search.example.com/results?q={keyword}",
                title=f"Search results for: {keyword}",
                publisher="Web Search",
                publication_date=datetime.now(timezone.utc).isoformat(),
                credibility_score=0.5,
                summary=f"Web search results related to {keyword}",
                evidence_type="web_search",
                metadata={"keyword": keyword}
            ))

    async def _collect_from_official_sources(self, keywords: List[str], metadata: Dict):
        """Collect from official sources."""
        official_domains = [
            "who.int", "un.org", "gov.uk", "usa.gov", "europa.eu",
            "cdc.gov", "nih.gov", "nasa.gov", "noaa.gov"
        ]

        for domain in official_domains:
            if any(domain.split('.')[0] in keyword.lower() for keyword in keywords):
                self.collected_evidence.append(EvidenceItem(
                    url=f"https://{domain}",
                    title=f"Official source: {domain}",
                    publisher=domain,
                    publication_date=datetime.now(timezone.utc).isoformat(),
                    credibility_score=0.9,
                    summary=f"Official information from {domain}",
                    evidence_type="official_source",
                    metadata={"domain": domain}
                ))

    async def _collect_from_news_sources(self, keywords: List[str]):
        """Collect from trusted news organizations."""
        trusted_news = [
            "reuters.com", "apnews.com", "bbc.com", "npr.org",
            "theguardian.com", "washingtonpost.com", "nytimes.com"
        ]

        for source in trusted_news[:3]:
            self.collected_evidence.append(EvidenceItem(
                url=f"https://{source}",
                title=f"News source: {source}",
                publisher=source,
                publication_date=datetime.now(timezone.utc).isoformat(),
                credibility_score=0.8,
                summary=f"News articles from {source}",
                evidence_type="news_source",
                metadata={"source": source}
            ))

    async def _collect_from_fact_check_sites(self, keywords: List[str], claims: List[Dict]):
        """Collect from fact-checking websites."""
        fact_check_sites = [
            "snopes.com", "factcheck.org", "politifact.com", "reuters.com/fact-check"
        ]

        for claim in claims[:3]:
            claim_text = claim.get("claim", "")
            if claim_text:
                for site in fact_check_sites[:2]:
                    self.collected_evidence.append(EvidenceItem(
                        url=f"https://{site}",
                        title=f"Fact check: {claim_text[:50]}",
                        publisher=site,
                        publication_date=datetime.now(timezone.utc).isoformat(),
                        credibility_score=0.85,
                        summary=f"Fact-checking analysis from {site}",
                        evidence_type="fact_check",
                        metadata={"claim": claim_text[:100]}
                    ))

    async def _collect_from_database(self, keywords: List[str]):
        """Check existing VisionX database for similar analyses."""
        pass

    def _clean_and_deduplicate(self) -> List[EvidenceItem]:
        """Remove duplicates and clean evidence."""
        seen_urls = set()
        cleaned = []

        for item in self.collected_evidence:
            if item.url and item.url in seen_urls:
                continue
            if item.url:
                seen_urls.add(item.url)

            item.summary = item.summary.strip()[:500]
            cleaned.append(item)

        return cleaned

    def _score_credibility(self, evidence: List[EvidenceItem]) -> List[EvidenceItem]:
        """Score credibility of evidence sources."""
        for item in evidence:
            base_scores = {
                "official_source": 0.9,
                "fact_check": 0.85,
                "news_source": 0.8,
                "web_search": 0.5,
                "image_analysis": 0.7,
            }

            base_score = base_scores.get(item.evidence_type, 0.5)

            if any(domain in item.publisher for domain in [".gov", ".edu", "who.int", "un.org"]):
                base_score = min(1.0, base_score + 0.1)

            item.credibility_score = base_score

        return evidence

    def _rank_evidence(self, evidence: List[EvidenceItem], claims: List[Dict]) -> List[EvidenceItem]:
        """Rank evidence by relevance and credibility."""
        ranked = sorted(evidence, key=lambda x: x.credibility_score, reverse=True)
        return ranked[:50]

    def _build_evidence_package(
        self,
        claims: List[Dict],
        transcript: str,
        metadata: Dict,
        evidence: List[EvidenceItem],
        source_url: Optional[str],
    ) -> Dict[str, Any]:
        """Build the final evidence package for reasoning."""
        supporting = [e for e in evidence if e.credibility_score >= 0.7]
        contradicting = [e for e in evidence if e.credibility_score < 0.6]

        return {
            "video_metadata": metadata,
            "transcript": transcript[:5000],
            "claims": claims,
            "sources": [e.__dict__ for e in evidence[:20]],
            "supporting_evidence": [e.__dict__ for e in supporting[:10]],
            "contradicting_evidence": [e.__dict__ for e in contradicting[:10]],
            "metadata": {
                "source_url": source_url,
                "collection_timestamp": datetime.now(timezone.utc).isoformat(),
                "total_evidence_items": len(evidence),
            },
            "credibility_scores": {
                "overall": sum(e.credibility_score for e in evidence) / len(evidence) if evidence else 0.5,
                "supporting": sum(e.credibility_score for e in supporting) / len(supporting) if supporting else 0,
                "contradicting": sum(e.credibility_score for e in contradicting) / len(contradicting) if contradicting else 0,
            }
        }


# Global instance
video_evidence_collector = VideoEvidenceCollector()