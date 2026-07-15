"""Repository layer for Lead persistence operations."""

from __future__ import annotations

from typing import Any, TypeAlias
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.lead import Lead
from app.schemas.lead import LeadCreate, LeadUpdate

FilterDict: TypeAlias = dict[str, object]


class LeadRepository:
    """Persistence interface for lead entities."""

    def __init__(self, session: Session) -> None:
        self._session = session

    def create(self, payload: LeadCreate) -> Lead:
        """Create a new lead."""

        data = payload.model_dump(exclude_unset=True)
        normalized_data = self._normalize_payload(data)
        lead = Lead(**normalized_data)
        self._session.add(lead)
        self._session.commit()
        self._session.refresh(lead)
        return lead

    def update(self, lead: Lead, payload: LeadUpdate) -> Lead:
        """Update an existing lead."""

        data = payload.model_dump(exclude_unset=True)
        normalized_data = self._normalize_payload(data)
        for field, value in normalized_data.items():
            setattr(lead, field, value)
        self._session.commit()
        self._session.refresh(lead)
        return lead

    def soft_delete(self, lead: Lead) -> Lead:
        """Soft-delete a lead by marking it as deleted."""

        lead.deleted = True
        self._session.commit()
        self._session.refresh(lead)
        return lead

    def find_by_id(self, lead_id: str | UUID) -> Lead | None:
        """Find a lead by its identifier, excluding deleted records."""

        identifier = str(lead_id)
        statement = select(Lead).where(Lead.id == identifier, Lead.deleted.is_(False))
        return self._session.scalar(statement)

    def find_all(self, *, page: int, size: int, filters: FilterDict | None = None) -> tuple[list[Lead], int]:
        """Return leads matching the provided filters with pagination."""

        statement = select(Lead).where(Lead.deleted.is_(False))
        count_statement = select(func.count(Lead.id)).where(Lead.deleted.is_(False))
        if filters:
            for field, value in filters.items():
                if value is None:
                    continue
                if field == "favorite":
                    statement = statement.where(getattr(Lead, field).is_(value))
                    count_statement = count_statement.where(getattr(Lead, field).is_(value))
                elif field in {"city", "segment", "status"}:
                    search_value = f"%{value}%"
                    statement = statement.where(getattr(Lead, field).ilike(search_value))
                    count_statement = count_statement.where(getattr(Lead, field).ilike(search_value))
                else:
                    statement = statement.where(getattr(Lead, field) == value)
                    count_statement = count_statement.where(getattr(Lead, field) == value)

        total = self._session.scalar(count_statement)
        statement = statement.order_by(Lead.created_at.desc())
        offset = (page - 1) * size
        statement = statement.offset(offset).limit(size)
        items = list(self._session.scalars(statement).all())
        return items, int(total or 0)

    def search(self, search_term: str, *, page: int, size: int) -> tuple[list[Lead], int]:
        """Search leads by company name or note content."""

        search_filter = (
            (Lead.company_name.ilike(f"%{search_term}%"))
            | (Lead.notes.ilike(f"%{search_term}%"))
            | (Lead.city.ilike(f"%{search_term}%"))
        )
        statement = select(Lead).where(Lead.deleted.is_(False)).where(search_filter)
        total_statement = select(func.count(Lead.id)).where(Lead.deleted.is_(False)).where(search_filter)
        total = self._session.scalar(total_statement)
        statement = statement.order_by(Lead.created_at.desc()).offset((page - 1) * size).limit(size)
        items = list(self._session.scalars(statement).all())
        return items, total

    def toggle_favorite(self, lead: Lead) -> Lead:
        """Mark a lead as favorite."""

        setattr(lead, "favorite", True)
        self._session.commit()
        self._session.refresh(lead)
        return lead

    def count(self) -> int:
        """Count active leads."""

        return int(self._session.scalar(select(func.count(Lead.id)).where(Lead.deleted.is_(False))))

    @staticmethod
    def _normalize_payload(data: dict[str, Any]) -> dict[str, Any]:
        """Convert Pydantic-aware values into plain Python objects for persistence."""

        normalized: dict[str, Any] = {}
        for field, value in data.items():
            if value is None:
                normalized[field] = None
            elif hasattr(value, "unicode_string"):
                normalized[field] = str(value)
            elif hasattr(value, "__str__") and not isinstance(value, (str, bool, int, float)):
                normalized[field] = str(value)
            else:
                normalized[field] = value
        return normalized
