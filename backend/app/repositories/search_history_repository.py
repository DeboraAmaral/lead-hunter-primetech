"""Repository for SearchHistory persistence."""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.search_history import SearchHistory


class SearchHistoryRepository:
    """Persistence layer for search history records."""

    def __init__(self, session: Session) -> None:
        self._session = session

    def create(self, history: SearchHistory) -> SearchHistory:
        """Persist a search history row."""

        self._session.add(history)
        self._session.commit()
        self._session.refresh(history)
        return history
