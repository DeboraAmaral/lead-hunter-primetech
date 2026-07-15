"""Pydantic schemas for company search requests and responses."""

from __future__ import annotations

from pydantic import BaseModel, Field


class SearchRequest(BaseModel):
    """Request payload for searching companies through the OSM layer."""

    segment: str = Field(..., min_length=1, max_length=255)
    city: str = Field(..., min_length=1, max_length=255)
    state: str = Field(..., min_length=1, max_length=255)
    country: str = Field(..., min_length=1, max_length=255)
    limit: int = Field(default=50, ge=1, le=500)


class SearchResponse(BaseModel):
    """Response payload for a company search operation."""

    total: int
    saved_count: int
    duplicates_skipped: int
    history_id: str | None = None
    message: str
