"""Basic tests for the lead domain layer."""

from datetime import datetime, timezone

from app.enums.lead_status import LeadStatus
from app.models.lead import Lead
from app.schemas.lead import LeadCreate, LeadResponse


def test_lead_create_schema_validates_common_fields() -> None:
    """Lead creation schema should accept valid values and preserve the enum."""

    payload = LeadCreate(
        company_name="PrimeTech Labs",
        email="contact@primetech.com",
        website="https://primetech.com",
        status=LeadStatus.INTERESTED,
    )

    assert payload.company_name == "PrimeTech Labs"
    assert payload.status is LeadStatus.INTERESTED


def test_lead_response_can_be_built_from_model_attributes() -> None:
    """Lead response schema should support ORM-style attribute access."""

    lead = Lead(
        company_name="Acme Corp",
        status=LeadStatus.NEW,
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
    )
    lead.id = "123e4567-e89b-12d3-a456-426614174000"

    response = LeadResponse.model_validate(lead)

    assert str(response.id) == "123e4567-e89b-12d3-a456-426614174000"
    assert response.company_name == "Acme Corp"
    assert response.status is LeadStatus.NEW
