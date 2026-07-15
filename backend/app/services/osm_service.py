"""Service for searching companies using free OpenStreetMap APIs."""

from __future__ import annotations

import time
from typing import Any
from urllib.error import URLError
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen

from app.core.logging import logger
from app.models.search_history import SearchHistory
from app.repositories.lead_repository import LeadRepository
from app.repositories.search_history_repository import SearchHistoryRepository
from app.schemas.lead import LeadCreate
from app.schemas.search import SearchRequest, SearchResponse
from app.scrapers.osm_scraper import OSMScraper


class OSMService:
    """Search companies from OSM and persist leads into the domain layer."""

    def __init__(
        self,
        lead_repository: LeadRepository,
        search_history_repository: SearchHistoryRepository,
    ) -> None:
        self._lead_repository = lead_repository
        self._search_history_repository = search_history_repository

    def search_companies(self, payload: SearchRequest) -> SearchResponse:
        """Search, normalize, deduplicate, and persist companies from OSM."""

        start = time.perf_counter()
        city_coordinates = self._find_city_coordinates(payload.city, payload.state, payload.country)
        if not city_coordinates:
            raise ValueError("Could not find coordinates for the specified city.")

        companies = self._find_companies(payload.segment, city_coordinates, limit=payload.limit)
        saved_count = 0
        duplicates_skipped = 0

        seen_signatures: set[tuple[str, str]] = set()
        for company in companies:
            normalized = self._normalize_company(payload, company)
            signature = self._build_signature(normalized)
            if signature in seen_signatures:
                duplicates_skipped += 1
                continue
            seen_signatures.add(signature)
            existing = self._lead_repository.find_existing(normalized)
            if existing is not None:
                duplicates_skipped += 1
                continue
            self._lead_repository.create(LeadCreate(**normalized))
            saved_count += 1

        elapsed = round((time.perf_counter() - start) * 1000, 2)
        history = self._search_history_repository.create(
            SearchHistory(
                city=payload.city,
                segment=payload.segment,
                quantity=saved_count,
                execution_time_ms=elapsed,
            )
        )
        logger.info(
            "OSM search completed for %s/%s/%s with %s saved and %s duplicates",
            payload.city,
            payload.state,
            payload.country,
            saved_count,
            duplicates_skipped,
        )
        total_processed = len(companies) - duplicates_skipped
        return SearchResponse(
            total=total_processed,
            saved_count=saved_count,
            duplicates_skipped=duplicates_skipped,
            history_id=str(history.id),
            message="Search completed successfully.",
        )

    def _find_city_coordinates(self, city: str, state: str, country: str) -> dict[str, float] | None:
        """Resolve a city to latitude/longitude through Nominatim."""

        query = f"{city}, {state}, {country}".strip()
        url = f"https://nominatim.openstreetmap.org/search?q={quote(query)}&format=json&limit=1"
        data = self._request_json(url, timeout=10, retries=3)
        if not data:
            return None
        first = data[0]
        return {"lat": float(first["lat"]), "lon": float(first["lon"])}

    def _request_json(
        self,
        url: str,
        *,
        timeout: int,
        retries: int,
        payload: dict[str, Any] | None = None,
    ) -> Any:
        """Perform a JSON HTTP request with retry and timeout configuration."""

        for attempt in range(retries):
            try:
                request = Request(url, method="POST" if payload is not None else "GET")
                if payload is not None:
                    data = self._encode_payload(payload)
                    request.data = data
                with urlopen(request, timeout=timeout) as response:
                    response_text = response.read().decode("utf-8")
                    return self._parse_json(response_text)
            except (URLError, TimeoutError, ValueError) as exc:
                logger.warning("OSM request failed (attempt %s/%s): %s", attempt + 1, retries, exc)
                if attempt == retries - 1:
                    raise
                time.sleep(1)
        return None

    @staticmethod
    def _encode_payload(payload: dict[str, Any]) -> bytes:
        """Encode a payload dictionary for Overpass requests."""

        return urlencode(payload).encode("utf-8")

    @staticmethod
    def _parse_json(response_text: str) -> Any:
        """Parse JSON response content."""

        import json

        return json.loads(response_text)

    def _find_companies(self, segment: str, coordinates: dict[str, float], *, limit: int) -> list[dict[str, Any]]:
        """Query companies using Overpass around the city center."""

        radius = 20000
        tag = self._overpass_tag(segment)
        query = (
            f"[out:json][timeout:25];"
            f"(node[{tag}](around:{radius},{coordinates['lat']},{coordinates['lon']});"
            f"way[{tag}](around:{radius},{coordinates['lat']},{coordinates['lon']});"
            f"relation[{tag}](around:{radius},{coordinates['lat']},{coordinates['lon']});"
            f");out center {limit};"
        )
        url = "https://overpass-api.de/api/interpreter"
        payload = {"data": query}
        data = self._request_json(url, timeout=15, retries=3, payload=payload)
        if not data:
            return []
        return [
            element
            for element in data.get("elements", [])
            if element.get("type") in {"node", "way", "relation"}
        ]

    def _normalize_company(self, payload: SearchRequest, company: dict[str, Any]) -> dict[str, Any]:
        """Normalize a raw OSM company into a lead creation payload."""

        extracted = OSMScraper.extract_company(company)
        return {
            **extracted,
            "company_name": extracted["company_name"],
            "segment": payload.segment,
            "city": extracted["city"] or payload.city,
            "state": extracted["state"] or payload.state,
            "country": extracted["country"] or payload.country,
            "email": None,
            "website": extracted["website"],
            "latitude": extracted["latitude"],
            "longitude": extracted["longitude"],
            "notes": f"Imported from OSM for segment {payload.segment}",
            "favorite": False,
        }

    @staticmethod
    def _build_signature(payload: dict[str, Any]) -> tuple[str, str]:
        """Create a stable signature used to avoid duplicate imports within a single search batch."""

        website = str(payload.get("website") or "")
        phone = str(payload.get("phone") or "")
        company_name = str(payload.get("company_name") or "")
        return (website.lower(), phone.lower() or company_name.lower())

    @staticmethod
    def _overpass_tag(segment: str) -> str:
        """Map a search segment to a basic Overpass tag."""

        normalized = segment.lower()
        if "dent" in normalized:
            return "amenity=clinic"
        if "med" in normalized or "health" in normalized:
            return "amenity=clinic"
        if "restaurant" in normalized:
            return "amenity=restaurant"
        if "shop" in normalized:
            return "shop=*"
        return "amenity=*"
