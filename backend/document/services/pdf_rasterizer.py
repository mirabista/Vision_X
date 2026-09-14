"""
PDF Rasterization — converts PDF pages to images for visual forensics.
Uses PyMuPDF (fitz) as primary renderer (works on Windows without Poppler).
Falls back to pdf2image when available.
"""

from __future__ import annotations

import logging
import uuid
from pathlib import Path
from typing import List

logger = logging.getLogger(__name__)


class PDFRasterizer:
    """
    Converts PDF pages to PNG images so the Image Analysis pipeline
    can run blur, noise, and compression checks on visual content.
    """

    def __init__(self, output_dir: str | None = None):
        if output_dir is None:
            import tempfile
            output_dir = str(Path(tempfile.gettempdir()) / "visionx_pdf_pages")
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)

    def rasterize(self, pdf_path: str, dpi: int = 200, max_pages: int = 20) -> List[str]:
        """Returns list of PNG paths, one per page."""
        try:
            return self._rasterize_pymupdf(pdf_path, dpi, max_pages)
        except ImportError:
            logger.warning("PyMuPDF not available, trying pdf2image")
        except Exception as e:
            logger.warning(f"PyMuPDF rasterization failed: {e}, trying pdf2image")

        try:
            return self._rasterize_pdf2image(pdf_path, dpi, max_pages)
        except ImportError:
            logger.error("Neither PyMuPDF nor pdf2image available for PDF rasterization")
            return []
        except Exception as e:
            logger.error(f"PDF rasterization failed: {e}")
            return []

    def _rasterize_pymupdf(self, pdf_path: str, dpi: int, max_pages: int) -> List[str]:
        import fitz

        job_id = str(uuid.uuid4())[:8]
        job_dir = self.output_dir / job_id
        job_dir.mkdir(exist_ok=True)

        zoom = dpi / 72.0
        matrix = fitz.Matrix(zoom, zoom)
        output_paths: List[str] = []

        with fitz.open(pdf_path) as doc:
            for i, page in enumerate(doc):
                if i >= max_pages:
                    logger.info(f"Rasterization capped at {max_pages} pages")
                    break
                pix = page.get_pixmap(matrix=matrix)
                path = job_dir / f"page_{i + 1}.png"
                pix.save(str(path))
                output_paths.append(str(path))

        return output_paths

    def _rasterize_pdf2image(self, pdf_path: str, dpi: int, max_pages: int) -> List[str]:
        from pdf2image import convert_from_path

        job_id = str(uuid.uuid4())[:8]
        job_dir = self.output_dir / job_id
        job_dir.mkdir(exist_ok=True)

        images = convert_from_path(
            pdf_path, dpi=dpi,
            first_page=1, last_page=max_pages,
        )
        output_paths: List[str] = []
        for i, img in enumerate(images):
            path = job_dir / f"page_{i + 1}.png"
            img.save(path, "PNG")
            output_paths.append(str(path))
        return output_paths

    def cleanup(self, page_paths: List[str]) -> None:
        """Remove rasterized page files and their job directory."""
        if not page_paths:
            return
        try:
            job_dir = Path(page_paths[0]).parent
            for p in page_paths:
                Path(p).unlink(missing_ok=True)
            if job_dir.exists() and job_dir != self.output_dir:
                job_dir.rmdir()
        except Exception as e:
            logger.debug(f"Cleanup failed: {e}")
