"""Tests for the lead service and repository layers."""

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.database.base import Base
from app.enums.lead_status import LeadStatus
from app.exceptions import LeadConflictError, LeadNotFoundError
from app.repositories.lead_repository import LeadRepository
from app.schemas.lead import LeadCreate, LeadUpdate
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


def test_create_and_get_lead(session: Session) -> None:
    """A new lead should be created and fetched by id."""

    service = LeadService(LeadRepository(session))
    lead = service.create_lead(
        LeadCreate(
            company_name="PrimeTech Labs",
            email="contact@primetech.com",
            website="https://primetech.com",
        )
    )

    fetched = service.get_lead(lead.id)

    assert fetched.id == lead.id
    assert fetched.company_name == "PrimeTech Labs"


def test_update_and_delete_lead(session: Session) -> None:
    """A lead should be updatable and then soft-deleted."""

    service = LeadService(LeadRepository(session))
    lead = service.create_lead(LeadCreate(company_name="Acme Corp"))

    updated = service.update_lead(lead.id, LeadUpdate(city="São Paulo", status=LeadStatus.CONTACTED))
    assert updated.city == "São Paulo"
    assert updated.status is LeadStatus.CONTACTED

    service.delete_lead(lead.id)

    with pytest.raises(LeadNotFoundError):
        service.get_lead(lead.id)


def test_favorite_and_list_leads(session: Session) -> None:
    """A lead should be favorited and appear in a filtered list."""

    service = LeadService(LeadRepository(session))
    service.create_lead(LeadCreate(company_name="Beta Company"))
    lead = service.create_lead(LeadCreate(company_name="Alpha Company", favorite=True))

    favorite_response = service.favorite_lead(lead.id)
    assert favorite_response.favorite is True

    result = service.list_leads(page=1, size=10, favorite=True)
    assert result.total == 1
    assert len(result.items) == 1
    assert result.items[0].company_name == "Alpha Company"


def test_search_leads(session: Session) -> None:
    """Search should filter leads by company name or text."""

    service = LeadService(LeadRepository(session))
    service.create_lead(LeadCreate(company_name="Northwind Analytics"))
    service.create_lead(LeadCreate(company_name="Adventure Works"))

    result = service.search_leads("northwind", page=1, size=10)

    assert result.total == 1
    assert result.items[0].company_name == "Northwind Analytics"
