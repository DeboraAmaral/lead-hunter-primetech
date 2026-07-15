"""Logging setup for the application using Loguru."""

from __future__ import annotations

from loguru import logger

logger.add(
    "logs/app.log",
    rotation="10 MB",
    retention="7 days",
    enqueue=True,
    backtrace=True,
    diagnose=False,
)

__all__ = ["logger"]
