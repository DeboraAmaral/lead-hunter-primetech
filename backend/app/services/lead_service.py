"""Service layer for lead business operations."""

from __future__ import annotations

from uuid import UUID

from app.core.logging import logger
from app.exceptions import LeadConflictError, LeadNotFoundError, LeadValidationError
from app.repositories.lead_repository import LeadRepository
from app.schemas.lead import LeadCreate, LeadListResponse, LeadResponse, LeadUpdate


class LeadService:
    """Coordinate lead operations while keeping business rules inside the service layer."""

    def __init__(self, repository: LeadRepository) -> None:
        self._repository = repository

    def create_lead(self, payload: LeadCreate) -> LeadResponse:
        """Create a new lead and return a response model."""

        try:
            lead = self._repository.create(payload)
        except Exception as exc:  # pragma: no cover - defensive branch
            logger.exception("Failed to create lead")
            raise LeadConflictError("Unable to create lead.") from exc
        logger.info("Created lead with id: %s", lead.id)
        return LeadResponse.model_validate(lead)

    def update_lead(self, lead_id: str | UUID, payload: LeadUpdate) -> LeadResponse:
        """Update a lead if it exists and is not deleted."""

        lead = self._repository.find_by_id(lead_id)
        if lead is None:
            logger.warning("Update failed for missing lead: %s", lead_id)
            raise LeadNotFoundError(str(lead_id))
        if payload.model_dump(exclude_unset=True) == {}:
            raise LeadValidationError("No fields were provided for update.")
        updated_lead = self._repository.update(lead, payload)
        logger.info("Updated lead with id: %s", lead_id)
        return LeadResponse.model_validate(updated_lead)

    def delete_lead(self, lead_id: str | UUID) -> None:
        """Soft-delete a lead."""

        lead = self._repository.find_by_id(lead_id)
        if lead is None:
            logger.warning("Delete failed for missing lead: %s", lead_id)
            raise LeadNotFoundError(str(lead_id))
        self._repository.soft_delete(lead)
        logger.info("Deleted lead with id: %s", lead_id)

    def get_lead(self, lead_id: str | UUID) -> LeadResponse:
        """Load a single active lead by id."""

        lead = self._repository.find_by_id(lead_id)
        if lead is None:
            logger.warning("Lead lookup failed for id: %s", lead_id)
            raise LeadNotFoundError(str(lead_id))
        return LeadResponse.model_validate(lead)

    def list_leads(self, *, page: int = 1, size: int = 20, **filters: object) -> LeadListResponse:
        """List leads with pagination and optional filters."""

        page = max(page, 1)
        size = max(size, 1)
        items, total = self._repository.find_all(page=page, size=size, filters=filters)
        logger.info("Listed %s leads with page=%s size=%s", total, page, size)
        return LeadListResponse(
            items=[LeadResponse.model_validate(item) for item in items],
            page=page,
            size=size,
            total=total,
            pages=(total + size - 1) // size if total else 0,
        )

    def search_leads(self, search_term: str, *, page: int = 1, size: int = 20) -> LeadListResponse:
        """Search leads by textual terms."""

        if not search_term.strip():
            raise LeadValidationError("Search term cannot be empty.")

        items, total = self._repository.search(search_term.strip(), page=page, size=size)
        logger.info("Searched leads with term '%s'", search_term.strip())
        return LeadListResponse(
            items=[LeadResponse.model_validate(item) for item in items],
            page=page,
            size=size,
            total=total,
            pages=(total + size - 1) // size if total else 0,
        )

    def favorite_lead(self, lead_id: str | UUID) -> LeadResponse:
        """Toggle the favorite flag of a lead."""

        lead = self._repository.find_by_id(lead_id)
        if lead is None:
            logger.warning("Favorite action failed for missing lead: %s", lead_id)
            raise LeadNotFoundError(str(lead_id))
        updated_lead = self._repository.toggle_favorite(lead)
        logger.info("Favorited lead with id: %s", lead_id)
        return LeadResponse.model_validate(updated_lead)
