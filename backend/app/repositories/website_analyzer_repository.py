"""Repository for website analysis persistence."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.models.website_analysis import WebsiteAnalysis


class WebsiteAnalyzerRepository:
    """Persist and query website analysis artifacts."""

    def __init__(self, session: Session) -> None:
        self._session = session

    def create(self, *, lead_id: str | UUID, url: str | None, https_enabled: bool, response_time_ms: int, title: str | None,
               meta_description: str | None, h1: str | None, image_count: int, link_count: int, responsive: bool,
               has_google_analytics: bool, has_google_tag_manager: bool, has_meta_pixel: bool, has_whatsapp: bool,
               has_form: bool, has_instagram: bool, has_facebook: bool, has_linkedin: bool, has_google_maps: bool,
               technical_score: int, score_label: str, created_at: datetime | None = None) -> WebsiteAnalysis:
        """Create a new website analysis row."""

        analysis = WebsiteAnalysis(
            lead_id=str(lead_id),
            url=url,
            https_enabled=https_enabled,
            response_time_ms=response_time_ms,
            title=title,
            meta_description=meta_description,
            h1=h1,
            image_count=image_count,
            link_count=link_count,
            responsive=responsive,
            has_google_analytics=has_google_analytics,
            has_google_tag_manager=has_google_tag_manager,
            has_meta_pixel=has_meta_pixel,
            has_whatsapp=has_whatsapp,
            has_form=has_form,
            has_instagram=has_instagram,
            has_facebook=has_facebook,
            has_linkedin=has_linkedin,
            has_google_maps=has_google_maps,
            technical_score=technical_score,
            score_label=score_label,
            created_at=created_at or datetime.now(timezone.utc),
        )
        self._session.add(analysis)
        self._session.commit()
        self._session.refresh(analysis)
        return analysis

    def find_recent_by_lead(self, lead_id: str | UUID, *, hours: int = 24) -> WebsiteAnalysis | None:
        """Return a recent analysis for the same lead if it exists."""

        cutoff = datetime.now(timezone.utc) - timedelta(hours=hours)
        statement = (
            select(WebsiteAnalysis)
            .where(WebsiteAnalysis.lead_id == str(lead_id))
            .where(WebsiteAnalysis.created_at >= cutoff)
            .order_by(WebsiteAnalysis.created_at.desc())
        )
        return self._session.scalar(statement)

    def count_for_lead(self, lead_id: str | UUID) -> int:
        """Count analyses for a lead."""

        statement = select(func.count(WebsiteAnalysis.id)).where(WebsiteAnalysis.lead_id == str(lead_id))
        return int(self._session.scalar(statement) or 0)

    def get_latest(self, lead_id: str | UUID) -> WebsiteAnalysis | None:
        """Load the most recent analysis for a lead."""

        statement = (
            select(WebsiteAnalysis)
            .where(WebsiteAnalysis.lead_id == str(lead_id))
            .order_by(WebsiteAnalysis.created_at.desc())
        )
        return self._session.scalar(statement)
