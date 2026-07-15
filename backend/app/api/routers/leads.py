"""API router for lead management endpoints."""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Path, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.exceptions import LeadConflictError, LeadNotFoundError, LeadValidationError
from app.repositories.lead_repository import LeadRepository
from app.schemas.lead import LeadCreate, LeadListResponse, LeadResponse, LeadUpdate
from app.services.lead_service import LeadService

router = APIRouter(prefix="/leads", tags=["Leads"])


def get_lead_service(db: Annotated[Session, Depends(get_db)]) -> LeadService:
    """Create a lead service instance bound to the current database session."""

    return LeadService(LeadRepository(db))


@router.post(
    "",
    summary="Create lead",
    description="Create a new lead in the domain layer.",
    response_model=LeadResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_lead(
    payload: LeadCreate,
    service: Annotated[LeadService, Depends(get_lead_service)],
) -> LeadResponse:
    """Create a new lead."""

    try:
        return service.create_lead(payload)
    except LeadConflictError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.get(
    "",
    summary="List leads",
    description="List leads with pagination and optional filters.",
    response_model=LeadListResponse,
    status_code=status.HTTP_200_OK,
)
def list_leads(
    service: Annotated[LeadService, Depends(get_lead_service)],
    search: str | None = Query(default=None),
    city: str | None = Query(default=None),
    segment: str | None = Query(default=None),
    status: str | None = Query(default=None),
    favorite: bool | None = Query(default=None),
    page: int = Query(default=1, ge=1),
    size: int = Query(default=20, ge=1, le=100),
) -> LeadListResponse:
    """List leads with optional filtering and pagination."""

    if search:
        return service.search_leads(search, page=page, size=size)

    filters: dict[str, object] = {
        "city": city,
        "segment": segment,
        "status": status,
        "favorite": favorite,
    }
    return service.list_leads(page=page, size=size, **filters)


@router.get(
    "/{lead_id}",
    summary="Get lead",
    description="Retrieve a lead by its identifier.",
    response_model=LeadResponse,
    status_code=status.HTTP_200_OK,
)
def get_lead(
    lead_id: Annotated[UUID, Path(description="Lead identifier")],
    service: Annotated[LeadService, Depends(get_lead_service)],
) -> LeadResponse:
    """Get a lead by id."""

    try:
        return service.get_lead(lead_id)
    except LeadNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.put(
    "/{lead_id}",
    summary="Update lead",
    description="Update an existing lead.",
    response_model=LeadResponse,
    status_code=status.HTTP_200_OK,
)
def update_lead(
    lead_id: Annotated[UUID, Path(description="Lead identifier")],
    payload: LeadUpdate,
    service: Annotated[LeadService, Depends(get_lead_service)],
) -> LeadResponse:
    """Update an existing lead."""

    try:
        return service.update_lead(lead_id, payload)
    except LeadNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except LeadValidationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.delete(
    "/{lead_id}",
    summary="Delete lead",
    description="Soft-delete an existing lead.",
    response_model=None,
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_lead(
    lead_id: Annotated[UUID, Path(description="Lead identifier")],
    service: Annotated[LeadService, Depends(get_lead_service)],
) -> None:
    """Delete a lead."""

    try:
        service.delete_lead(lead_id)
    except LeadNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.patch(
    "/{lead_id}/favorite",
    summary="Favorite lead",
    description="Toggle the favorite flag of a lead.",
    response_model=LeadResponse,
    status_code=status.HTTP_200_OK,
)
def favorite_lead(
    lead_id: Annotated[UUID, Path(description="Lead identifier")],
    service: Annotated[LeadService, Depends(get_lead_service)],
) -> LeadResponse:
    """Toggle the favorite state of a lead."""

    try:
        return service.favorite_lead(lead_id)
    except LeadNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
