"""
Metadata Agent - Extracts EXIF metadata from images using Pillow.
"""

from __future__ import annotations

from typing import Any, Dict, List
from PIL import Image, ExifTags
from .base_agent import BaseAgent


class MetadataAgent(BaseAgent):
    """Agent that extracts EXIF metadata from image files."""

    def __init__(self):
        super().__init__(name="metadata_agent")

    async def _run(self, image_path: str) -> Dict[str, Any]:
        findings: List[str] = []
        evidence: List[Dict[str, Any]] = []
        metadata: Dict[str, Any] = {}
        confidence = 0.0

        try:
            with Image.open(image_path) as img:
                metadata["format"] = img.format
                metadata["mode"] = img.mode
                metadata["width"] = img.width
                metadata["height"] = img.height
                import os
                if hasattr(img, 'fp') and img.fp:
                    try:
                        img.fp.seek(0, 2)
                        metadata["size_bytes"] = img.fp.tell()
                    except:
                        metadata["size_bytes"] = 0
                else:
                    # Try to get size from file path if available
                    try:
                        metadata["size_bytes"] = os.path.getsize(image_path) if os.path.exists(image_path) else 0
                    except:
                        metadata["size_bytes"] = 0

                findings.append(f"Image format: {img.format}, {img.width}x{img.height}, mode: {img.mode}")

                exif_data = img._getexif()
                if exif_data:
                    exif_dict = {}
                    for tag_id, value in exif_data.items():
                        tag_name = ExifTags.TAGS.get(tag_id, tag_id)
                        if isinstance(value, bytes):
                            try:
                                value = value.decode("utf-8", errors="replace")
                            except Exception:
                                value = str(value)
                        exif_dict[tag_name] = value

                    metadata["exif"] = exif_dict
                    findings.append(f"EXIF data found with {len(exif_dict)} tags")

                    if "Make" in exif_dict:
                        findings.append(f"Camera make: {exif_dict['Make']}")
                    if "Model" in exif_dict:
                        findings.append(f"Camera model: {exif_dict['Model']}")
                    if "DateTimeOriginal" in exif_dict:
                        findings.append(f"Original date: {exif_dict['DateTimeOriginal']}")
                    if "Software" in exif_dict:
                        findings.append(f"Software: {exif_dict['Software']}")

                    if "GPSInfo" in exif_dict:
                        findings.append("GPS coordinates present in metadata")
                        metadata["has_gps"] = True

                    confidence = 0.9
                else:
                    findings.append("No EXIF metadata found in image")
                    metadata["exif"] = None
                    confidence = 0.5

                evidence.append({
                    "type": "metadata",
                    "key": "image_properties",
                    "value": f"{img.format} {img.width}x{img.height} {img.mode}",
                    "confidence": confidence,
                })

        except Exception as e:
            findings.append(f"Metadata extraction failed: {str(e)}")
            confidence = 0.0
            metadata["error"] = str(e)

        summary = f"Extracted metadata: {len(metadata)} fields, {len(findings)} findings"
        return {
            "findings": findings,
            "confidence": confidence,
            "metadata": metadata,
            "evidence": evidence,
            "summary": summary,
        }