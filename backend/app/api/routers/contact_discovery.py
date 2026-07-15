"""API router for contact discovery operations."""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.repositories.lead_repository import LeadRepository
from app.services.contact_discovery_service import ContactDiscoveryService

router = APIRouter(prefix="/leads", tags=["Contact Discovery"])


def get_contact_discovery_service(db: Annotated[Session, Depends(get_db)]) -> ContactDiscoveryService:
    """Create a contact discovery service bound to the current database session."""

    return ContactDiscoveryService(LeadRepository(db))


@router.post(
    "/{lead_id}/discover",
    summary="Discover lead contacts",
    description="Visit a lead website and extract emails, phones, WhatsApp links, and social profiles.",
    response_model=dict[str, list[str]],
    status_code=status.HTTP_200_OK,
)
def discover_lead_contacts(
    lead_id: Annotated[UUID, Path(description="Lead identifier")],
    service: Annotated[ContactDiscoveryService, Depends(get_contact_discovery_service)],
) -> dict[str, list[str]]:
    """Discover contact information for a lead website."""

    try:
        return service.discover_contacts(lead_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
