"""
VisionX Production-Grade Logging
Structured logging with JSON output, correlation IDs, and context propagation.
"""

from __future__ import annotations

import json
import logging
import sys
import traceback
import uuid
from datetime import datetime, timezone
from typing import Optional, Dict, Any
from contextvars import ContextVar

# Correlation ID context variable for request tracing
correlation_id_var: ContextVar[Optional[str]] = ContextVar("correlation_id", default=None)


def get_correlation_id() -> Optional[str]:
    """Get the current correlation ID from context."""
    return correlation_id_var.get()


def set_correlation_id(cid: Optional[str] = None) -> str:
    """Set a correlation ID for the current context. Generates one if not provided."""
    if cid is None:
        cid = str(uuid.uuid4())
    correlation_id_var.set(cid)
    return cid


class JSONFormatter(logging.Formatter):
    """
    Structured JSON log formatter.
    Produces machine-parseable JSON log entries with consistent fields.
    """

    def format(self, record: logging.LogRecord) -> str:
        log_entry: Dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "logger": record.name,
            "message": record.getMessage(),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno,
            "correlation_id": get_correlation_id(),
        }

        # Add exception info if present
        if record.exc_info and record.exc_info[0] is not None:
            log_entry["exception"] = {
                "type": record.exc_info[0].__name__,
                "message": str(record.exc_info[1]),
                "traceback": "".join(
                    traceback.format_exception(*record.exc_info)
                ),
            }

        # Add extra fields from record
        for key, value in getattr(record, "extra_fields", {}).items():
            log_entry[key] = value

        return json.dumps(log_entry, default=str)


class TextFormatter(logging.Formatter):
    """
    Human-readable text log formatter for development.
    """

    def format(self, record: logging.LogRecord) -> str:
        cid = get_correlation_id()
        cid_str = f" [{cid[:8]}]" if cid else ""
        timestamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M:%S.%f")[:-3]
        return (
            f"{timestamp} | {record.levelname:<7} | {record.name:<30}{cid_str} | "
            f"{record.getMessage()}"
        )


class ContextLogger(logging.LoggerAdapter):
    """
    Logger adapter that automatically adds context to log records.
    Usage: logger.info("message", extra_fields={"key": "value"})
    """

    def process(self, msg: str, kwargs: Dict[str, Any]) -> tuple:
        extra = kwargs.get("extra", {})
        extra_fields = extra.pop("extra_fields", {})
        extra["extra_fields"] = extra_fields
        kwargs["extra"] = extra
        return msg, kwargs


def setup_logging(
    level: str = "INFO",
    log_format: str = "text",
    json_indent: Optional[int] = None,
) -> None:
    """
    Configure root logger with structured formatting.

    Args:
        level: Log level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_format: "json" for structured JSON, "text" for human-readable
        json_indent: Indentation for JSON output (None for compact)
    """
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, level.upper(), logging.INFO))

    # Remove existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(getattr(logging, level.upper(), logging.INFO))

    if log_format == "json":
        formatter = JSONFormatter()
    else:
        formatter = TextFormatter()

    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)

    # Set third-party loggers to WARNING to reduce noise
    for logger_name in [
        "httpx",
        "urllib3",
        "httpcore",
        "asyncio",
        "aiosqlite",
        "sqlalchemy.engine",
    ]:
        logging.getLogger(logger_name).setLevel(logging.WARNING)

    # Keep our application loggers at the configured level
    logging.getLogger("backend").setLevel(getattr(logging, level.upper(), logging.INFO))


def get_logger(name: str) -> ContextLogger:
    """
    Get a context-aware logger for the given module name.

    Args:
        name: Usually __name__ of the calling module

    Returns:
        ContextLogger instance
    """
    logger = logging.getLogger(name)
    return ContextLogger(logger, {})