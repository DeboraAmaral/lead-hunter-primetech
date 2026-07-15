"""Router for automatic company search endpoints."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.repositories.lead_repository import LeadRepository
from app.repositories.search_history_repository import SearchHistoryRepository
from app.schemas.search import SearchRequest, SearchResponse
from app.services.osm_service import OSMService

router = APIRouter(prefix="/search", tags=["Search"])


def get_osm_service(db: Annotated[Session, Depends(get_db)]) -> OSMService:
    """Create the OSM search service from the request-scoped database session."""

    return OSMService(
        lead_repository=LeadRepository(db),
        search_history_repository=SearchHistoryRepository(db),
    )


@router.post(
    "",
    summary="Search companies automatically",
    description="Search for companies using free OpenStreetMap APIs and persist them as leads.",
    response_model=SearchResponse,
    status_code=status.HTTP_200_OK,
)
def search_companies(
    payload: SearchRequest,
    service: Annotated[OSMService, Depends(get_osm_service)],
) -> SearchResponse:
    """Search companies and save discovered leads to the database."""

    try:
        return service.search_companies(payload)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
