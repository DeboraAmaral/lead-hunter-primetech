"""Website analysis persistence model."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class WebsiteAnalysis(Base):
    """Stores the technical analysis of a lead website."""

    __tablename__ = "website_analyses"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()), nullable=False)
    lead_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    https_enabled: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    response_time_ms: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    title: Mapped[str | None] = mapped_column(String(500), nullable=True)
    meta_description: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    h1: Mapped[str | None] = mapped_column(String(500), nullable=True)
    image_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    link_count: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    responsive: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    has_google_analytics: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    has_google_tag_manager: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    has_meta_pixel: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    has_whatsapp: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    has_form: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    has_instagram: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    has_facebook: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    has_linkedin: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    has_google_maps: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    technical_score: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    score_label: Mapped[str] = mapped_column(String(50), default="Péssimo", nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc), nullable=False)
