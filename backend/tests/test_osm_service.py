"""Tests for the OSM-based company search service."""

from __future__ import annotations

from unittest.mock import patch

import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.database.base import Base
from app.models.search_history import SearchHistory
from app.repositories.lead_repository import LeadRepository
from app.repositories.search_history_repository import SearchHistoryRepository
from app.schemas.search import SearchRequest
from app.services.osm_service import OSMService


@pytest.fixture()
def session() -> Session:
    engine = create_engine("sqlite:///:memory:", connect_args={"check_same_thread": False})
    Base.metadata.create_all(engine)
    SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)

    with SessionLocal() as db_session:
        yield db_session

    Base.metadata.drop_all(engine)


def test_search_companies_saves_leads_and_history(session: Session) -> None:
    """Searching companies should persist leads and record the search history."""

    service = OSMService(
        lead_repository=LeadRepository(session),
        search_history_repository=SearchHistoryRepository(session),
    )

    mocked_responses = [
        [
            {
                "lat": "-22.905",
                "lon": "-47.060",
                "display_name": "Campinas, SP, Brasil",
            }
        ],
        {
            "elements": [
                {
                    "type": "node",
                    "id": 1,
                    "lat": -22.905,
                    "lon": -47.060,
                    "tags": {
                        "name": "Clínica Prime",
                        "phone": "+55 19 3333-4444",
                        "website": "https://clinicaprime.com",
                        "addr:street": "Rua A",
                        "addr:city": "Campinas",
                        "addr:state": "SP",
                        "addr:postcode": "13000-000",
                        "amenity": "clinic",
                    },
                },
                {
                    "type": "node",
                    "id": 2,
                    "lat": -22.91,
                    "lon": -47.07,
                    "tags": {
                        "name": "Clínica Prime",
                        "phone": "+55 19 3333-4444",
                        "website": "https://clinicaprime.com",
                        "addr:city": "Campinas",
                        "addr:state": "SP",
                    },
                },
            ]
        },
    ]

    with patch.object(service, "_request_json", side_effect=mocked_responses):
        result = service.search_companies(
            SearchRequest(
                segment="Dentista",
                city="Campinas",
                state="SP",
                country="Brasil",
                limit=10,
            )
        )

    assert result.saved_count == 1
    assert result.duplicates_skipped == 1
    assert result.total == 1
    assert result.history_id is not None

    history = session.query(SearchHistory).one()
    assert history.city == "Campinas"
    assert history.segment == "Dentista"
    assert history.quantity == 1
