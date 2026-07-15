"""Tests for the contact discovery service."""

from __future__ import annotations

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.database.base import Base
from app.repositories.lead_repository import LeadRepository
from app.schemas.lead import LeadCreate
from app.services.contact_discovery_service import ContactDiscoveryService
from app.services.lead_service import LeadService


@pytest.fixture()
def session() -> Session:
    """Create an isolated in-memory database session for each test."""

    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)

    with SessionLocal() as db_session:
        yield db_session

    Base.metadata.drop_all(engine)


def test_discover_contacts_extracts_valid_signals(session: Session) -> None:
    """The service should extract and deduplicate contacts from multiple pages."""

    lead_service = LeadService(LeadRepository(session))
    lead = lead_service.create_lead(
        LeadCreate(company_name="PrimeTech", website="https://primetech.com")
    )

    service = ContactDiscoveryService(LeadRepository(session))

    class FakeResponse:
        def __init__(self, payload: str) -> None:
            self.text = payload

    service._fetch_page = lambda url: FakeResponse(
        "<html><body>Contato: +55 19 3333-4444, whatsapp: https://wa.me/5511999999999, email: contato@primetech.com, "
        "<a href='https://instagram.com/primetech'>Instagram</a> "
        "<a href='https://facebook.com/primetech'>Facebook</a> "
        "<a href='https://linkedin.com/company/primetech'>LinkedIn</a> "
        "<a href='https://youtube.com/primetech'>YouTube</a> "
        "<a href='https://www.tiktok.com/@primetech'>TikTok</a></body></html>"
    )  # type: ignore[assignment]

    result = service.discover_contacts(lead.id)

    assert result["emails"] == ["contato@primetech.com"]
    assert result["phones"] == ["+55 19 3333-4444"]
    assert result["whatsapp"] == ["https://wa.me/5511999999999"]
    assert result["instagram"] == ["https://instagram.com/primetech"]
    assert result["facebook"] == ["https://facebook.com/primetech"]
    assert result["linkedin"] == ["https://linkedin.com/company/primetech"]
    assert result["youtube"] == ["https://youtube.com/primetech"]
    assert result["tiktok"] == ["https://www.tiktok.com/@primetech"]
