"""Scraper utilities for extracting lead-like data from OSM elements."""

from __future__ import annotations

from typing import Any


class OSMScraper:
    """Transform raw Overpass data into a normalized lead payload."""

    @staticmethod
    def extract_company(data: dict[str, Any]) -> dict[str, Any]:
        """Extract a lead-shaped payload from an Overpass element."""

        tags = data.get("tags", {})
        return {
            "company_name": tags.get("name") or tags.get("brand") or "Unknown Company",
            "segment": tags.get("amenity") or tags.get("shop") or None,
            "city": tags.get("addr:city") or None,
            "state": tags.get("addr:state") or None,
            "country": tags.get("addr:country") or None,
            "address": tags.get("addr:street") or None,
            "zip_code": tags.get("addr:postcode") or None,
            "phone": tags.get("phone") or None,
            "website": tags.get("website") or None,
            "latitude": data.get("lat"),
            "longitude": data.get("lon"),
            "google_maps_url": None,
            "notes": None,
            "favorite": False,
        }
