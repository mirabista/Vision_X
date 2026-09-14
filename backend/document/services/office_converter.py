"""
Office Document Converter — converts non-PDF documents (Word, PowerPoint,
Excel, RTF, plain text, OpenDocument) to PDF via headless LibreOffice, so the
existing PDF-based verification pipeline (structural analysis, metadata,
rasterization, OCR) can run on any document format unchanged.
"""

from __future__ import annotations

import logging
import os
import shutil
import subprocess
import tempfile
from pathlib import Path
from typing import Optional

logger = logging.getLogger(__name__)

# Extensions LibreOffice can convert to PDF.
CONVERTIBLE_EXTENSIONS = {
    ".doc", ".docx", ".odt", ".rtf", ".txt",
    ".ppt", ".pptx", ".odp",
    ".xls", ".xlsx", ".ods", ".csv",
}

PDF_EXTENSIONS = {".pdf"}

_soffice_path_cache: Optional[str] = None


def _find_soffice() -> Optional[str]:
    """Locate the LibreOffice headless binary."""
    global _soffice_path_cache
    if _soffice_path_cache:
        return _soffice_path_cache

    candidates = [
        os.getenv("SOFFICE_PATH", ""),
        shutil.which("soffice"),
        shutil.which("soffice.exe"),
        r"C:\Program Files\LibreOffice\program\soffice.exe",
        r"C:\Program Files (x86)\LibreOffice\program\soffice.exe",
        "/usr/bin/soffice",
        "/opt/libreoffice/program/soffice",
    ]
    for path in candidates:
        if path and Path(path).exists():
            _soffice_path_cache = path
            return path
    return None


def is_pdf(filename: str, content_type: str) -> bool:
    ext = Path(filename).suffix.lower()
    return ext in PDF_EXTENSIONS or content_type == "application/pdf"


def is_convertible(filename: str) -> bool:
    return Path(filename).suffix.lower() in CONVERTIBLE_EXTENSIONS


def convert_to_pdf(file_data: bytes, filename: str, timeout: int = 90) -> bytes:
    """
    Convert a document to PDF bytes using headless LibreOffice.
    Raises RuntimeError if LibreOffice is unavailable or conversion fails.
    """
    soffice = _find_soffice()
    if not soffice:
        raise RuntimeError(
            "LibreOffice is not installed or not found. Cannot convert "
            f"'{filename}' to PDF for verification."
        )

    with tempfile.TemporaryDirectory() as tmp_dir:
        input_path = Path(tmp_dir) / filename
        input_path.write_bytes(file_data)

        # Each conversion gets its own user profile dir to avoid lock
        # conflicts when multiple conversions run concurrently.
        profile_dir = Path(tmp_dir) / "lo_profile"
        profile_dir.mkdir(exist_ok=True)

        cmd = [
            soffice,
            "--headless",
            "--norestore",
            "--convert-to", "pdf",
            "--outdir", tmp_dir,
            f"-env:UserInstallation=file:///{profile_dir.as_posix()}",
            str(input_path),
        ]

        try:
            result = subprocess.run(
                cmd, capture_output=True, timeout=timeout, check=False,
            )
        except subprocess.TimeoutExpired as e:
            raise RuntimeError(f"Document conversion timed out for '{filename}'") from e

        output_path = input_path.with_suffix(".pdf")
        if not output_path.exists():
            stderr = result.stderr.decode("utf-8", errors="replace") if result.stderr else ""
            raise RuntimeError(
                f"LibreOffice failed to convert '{filename}' to PDF: {stderr[:500]}"
            )

        return output_path.read_bytes()
