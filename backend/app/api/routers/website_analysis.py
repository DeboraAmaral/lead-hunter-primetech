"""API router for website analysis operations."""

from __future__ import annotations

from typing import Annotated
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Path, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.repositories.lead_repository import LeadRepository
from app.repositories.website_analyzer_repository import WebsiteAnalyzerRepository
from app.schemas.website_analysis import WebsiteAnalysisResponse
from app.services.website_analyzer_service import WebsiteAnalyzerService

router = APIRouter(prefix="/leads", tags=["Website Analysis"])


def get_website_analyzer_service(db: Annotated[Session, Depends(get_db)]) -> WebsiteAnalyzerService:
    """Create a website analyzer service bound to the current database session."""

    return WebsiteAnalyzerService(LeadRepository(db), WebsiteAnalyzerRepository(db))


@router.post(
    "/{lead_id}/analyze",
    summary="Analyze lead website",
    description="Visit a lead website, inspect its technical signals, and store the analysis.",
    response_model=WebsiteAnalysisResponse,
    status_code=status.HTTP_200_OK,
)
def analyze_lead_website(
    lead_id: Annotated[UUID, Path(description="Lead identifier")],
    service: Annotated[WebsiteAnalyzerService, Depends(get_website_analyzer_service)],
) -> WebsiteAnalysisResponse:
    """Analyze a specific lead website."""

    try:
        return service.analyze_lead(lead_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
