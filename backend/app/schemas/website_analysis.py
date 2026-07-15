"""Schemas for website analysis responses."""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field


class WebsiteAnalysisResponse(BaseModel):
    """Schema returned for a website analysis result."""

    id: UUID
    lead_id: UUID
    url: str | None = None
    https_enabled: bool
    response_time_ms: int
    title: str | None = None
    meta_description: str | None = None
    h1: str | None = None
    image_count: int
    link_count: int
    responsive: bool
    has_google_analytics: bool
    has_google_tag_manager: bool
    has_meta_pixel: bool
    has_whatsapp: bool
    has_form: bool
    has_instagram: bool
    has_facebook: bool
    has_linkedin: bool
    has_google_maps: bool
    technical_score: int = Field(..., ge=0, le=100)
    score_label: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
