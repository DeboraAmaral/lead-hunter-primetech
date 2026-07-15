"""Tests for website analysis workflow."""

from __future__ import annotations

from datetime import datetime, timedelta, timezone
from unittest.mock import Mock

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.database.base import Base
from app.repositories.lead_repository import LeadRepository
from app.repositories.website_analyzer_repository import WebsiteAnalyzerRepository
from app.schemas.lead import LeadCreate
from app.services.lead_service import LeadService
from app.services.website_analyzer_service import WebsiteAnalyzerService


@pytest.fixture()
def session() -> Session:
    """Create an isolated in-memory database session for each test."""

    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)

    with SessionLocal() as db_session:
        yield db_session

    Base.metadata.drop_all(engine)


def test_analyze_lead_creates_website_analysis(session: Session) -> None:
    """A lead with a website should receive a technical website analysis."""

    lead_service = LeadService(LeadRepository(session))
    lead = lead_service.create_lead(LeadCreate(company_name="PrimeTech", website="https://primetech.com"))

    response = Mock()
    response.status_code = 200
    response.url = "https://primetech.com"
    response.elapsed = timedelta(milliseconds=120)
    response.text = """
    <html>
      <head>
        <title>PrimeTech | Soluções digitais</title>
        <meta name=\"description\" content=\"Agência digital\" />
        <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\" />
      </head>
      <body>
        <h1>PrimeTech</h1>
        <img src=\"/img.png\" />
        <img src=\"/img2.png\" />
        <a href=\"https://primetech.com/contact\">Contato</a>
        <a href=\"https://facebook.com/primetech\">Facebook</a>
        <form action=\"/contact\"></form>
        <script>ga('create', 'UA-123');</script>
        <script>gtag('config','G-123');</script>
        <script>fbq('init','123');</script>
        <a href=\"https://wa.me/5511999999999\">WhatsApp</a>
        <a href=\"https://www.instagram.com/primetech\">Instagram</a>
        <a href=\"https://www.linkedin.com/company/primetech\">LinkedIn</a>
        <a href=\"https://maps.google.com/?q=PrimeTech\">Maps</a>
      </body>
    </html>
    """

    service = WebsiteAnalyzerService(LeadRepository(session), WebsiteAnalyzerRepository(session))
    service._fetch_page = lambda url: response  # type: ignore[assignment]

    result = service.analyze_lead(lead.id)

    assert result.lead_id == lead.id
    assert result.https_enabled is True
    assert result.response_time_ms == 120
    assert result.title == "PrimeTech | Soluções digitais"
    assert result.meta_description == "Agência digital"
    assert result.h1 == "PrimeTech"
    assert result.image_count == 2
    assert result.link_count == 5
    assert result.responsive is True
    assert result.has_google_analytics is True
    assert result.has_google_tag_manager is True
    assert result.has_meta_pixel is True
    assert result.has_whatsapp is True
    assert result.has_form is True
    assert result.has_instagram is True
    assert result.has_facebook is True
    assert result.has_linkedin is True
    assert result.has_google_maps is True
    assert result.technical_score >= 80
    assert result.score_label in {"Excelente", "Bom", "Regular", "Ruim", "Péssimo"}


def test_analyze_lead_skips_recent_duplicate(session: Session) -> None:
    """A recent analysis should not be duplicated for the same lead website."""

    lead_service = LeadService(LeadRepository(session))
    lead = lead_service.create_lead(LeadCreate(company_name="PrimeTech", website="https://primetech.com"))

    repository = WebsiteAnalyzerRepository(session)
    repository.create(
        lead_id=lead.id,
        url=str(lead.website),
        https_enabled=True,
        response_time_ms=100,
        title="Existing",
        meta_description="Existing",
        h1="Existing",
        image_count=1,
        link_count=1,
        responsive=True,
        has_google_analytics=False,
        has_google_tag_manager=False,
        has_meta_pixel=False,
        has_whatsapp=False,
        has_form=False,
        has_instagram=False,
        has_facebook=False,
        has_linkedin=False,
        has_google_maps=False,
        technical_score=80,
        score_label="Bom",
        created_at=datetime.now(timezone.utc) - timedelta(hours=1),
    )

    service = WebsiteAnalyzerService(LeadRepository(session), repository)
    service._fetch_page = lambda url: (_ for _ in ()).throw(RuntimeError("should not fetch"))  # type: ignore[assignment]

    result = service.analyze_lead(lead.id)

    assert result.title == "Existing"
    assert repository.count_for_lead(lead.id) == 1
