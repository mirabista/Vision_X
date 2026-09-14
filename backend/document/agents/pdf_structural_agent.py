"""
PDF Structural Analysis Agent — VisionX differentiator.
Analyzes PDF file structure for tampering signals (EOF markers, xref tables, fonts, versions).
"""

from __future__ import annotations

import re
import tempfile
import logging
from pathlib import Path
from typing import Dict, List

logger = logging.getLogger(__name__)


class PDFStructuralAgent:
    """
    Analyzes PDF file structure for tampering signals.
    Most consumer tools skip this layer entirely.
    """

    def analyze(self, pdf_path: str) -> Dict:
        signals: Dict = {
            "eof_count": self._count_eof_markers(pdf_path),
            "xref_tables": self._count_xref_tables(pdf_path),
            "incremental_updates": False,
            "linearized": False,
            "encryption": False,
            "signature_present": False,
            "font_analysis": {},
            "structural_flags": [],
            "risk_score": 0,
        }

        if signals["eof_count"] > 1:
            signals["incremental_updates"] = True
            signals["structural_flags"].append(
                f"Multiple %%EOF markers found ({signals['eof_count']}). "
                "Document has been edited and re-saved after initial creation."
            )
            signals["risk_score"] += 40

        if signals["xref_tables"] > 1:
            signals["structural_flags"].append(
                f"Multiple xref tables ({signals['xref_tables']}). "
                "Confirms incremental updates present."
            )
            signals["risk_score"] += 20

        try:
            import pikepdf

            with pikepdf.open(pdf_path) as pdf:
                font_data = self._analyze_fonts(pdf)
                signals["font_analysis"] = font_data
                if font_data.get("mixed_embedding"):
                    signals["structural_flags"].append(
                        "Inconsistent font embedding detected. "
                        "Some fonts are embedded, others are not — common in edited documents."
                    )
                    signals["risk_score"] += 15

                if "/AcroForm" in pdf.Root:
                    acro = pdf.Root["/AcroForm"]
                    if "/SigFlags" in acro:
                        signals["signature_present"] = True

                if pdf.is_encrypted:
                    signals["encryption"] = True
        except ImportError:
            signals["structural_flags"].append("pikepdf not installed — limited structural analysis")
        except Exception as e:
            signals["structural_flags"].append(f"PDF structure error: {str(e)}")
            signals["risk_score"] += 10

        prev_versions = self._extract_previous_versions(pdf_path)
        if prev_versions:
            signals["previous_versions_recovered"] = prev_versions
            signals["structural_flags"].append(
                f"Recovered {len(prev_versions)} previous version(s) of edited content."
            )
            signals["risk_score"] += 25

        signals["risk_score"] = min(signals["risk_score"], 100)
        return signals

    def _count_eof_markers(self, pdf_path: str) -> int:
        with open(pdf_path, "rb") as f:
            content = f.read()
        return content.count(b"%%EOF")

    def _count_xref_tables(self, pdf_path: str) -> int:
        with open(pdf_path, "rb") as f:
            content = f.read()
        return len(re.findall(rb"\nxref\n", content))

    def _analyze_fonts(self, pdf) -> Dict:
        fonts_seen: List[Dict] = []
        embedded_count = 0
        non_embedded_count = 0

        for page in pdf.pages:
            if "/Resources" in page and "/Font" in page["/Resources"]:
                fonts = page["/Resources"]["/Font"]
                for font_name in fonts.keys():
                    font_obj = fonts[font_name]
                    is_embedded = self._is_font_embedded(font_obj)
                    fonts_seen.append({"name": str(font_name), "embedded": is_embedded})
                    if is_embedded:
                        embedded_count += 1
                    else:
                        non_embedded_count += 1

        return {
            "total_fonts": len(fonts_seen),
            "embedded": embedded_count,
            "non_embedded": non_embedded_count,
            "mixed_embedding": embedded_count > 0 and non_embedded_count > 0,
            "fonts": fonts_seen,
        }

    def _is_font_embedded(self, font_obj) -> bool:
        try:
            if "/FontDescriptor" in font_obj:
                fd = font_obj["/FontDescriptor"]
                return any(k in fd for k in ["/FontFile", "/FontFile2", "/FontFile3"])
        except Exception:
            pass
        return False

    def _extract_previous_versions(self, pdf_path: str) -> List[Dict]:
        """Recover pre-edit content from incremental updates."""
        recovered: List[Dict] = []
        try:
            import pypdf

            with open(pdf_path, "rb") as f:
                content = f.read()

            segments = content.split(b"%%EOF")
            if len(segments) <= 2:
                return recovered

            for i, segment in enumerate(segments[:-2]):
                tmp_path = None
                try:
                    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
                        tmp.write(segment + b"%%EOF")
                        tmp_path = tmp.name

                    reader = pypdf.PdfReader(tmp_path)
                    text = ""
                    for page in reader.pages:
                        text += page.extract_text() or ""
                    if text.strip():
                        recovered.append({
                            "version": i + 1,
                            "content_snippet": text[:500],
                        })
                except Exception:
                    pass
                finally:
                    if tmp_path:
                        Path(tmp_path).unlink(missing_ok=True)
        except ImportError:
            logger.warning("pypdf not installed — cannot recover previous versions")
        except Exception as e:
            logger.debug(f"Version recovery failed: {e}")
        return recovered
