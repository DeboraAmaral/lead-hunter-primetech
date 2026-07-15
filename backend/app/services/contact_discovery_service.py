"""Service for discovering contact information from a lead website."""

from __future__ import annotations

import re
from typing import Any
from urllib.parse import urljoin, urlparse
from uuid import UUID

import httpx
from bs4 import BeautifulSoup

from app.core.logging import logger
from app.repositories.lead_repository import LeadRepository


class ContactDiscoveryService:
    """Visit selected website pages and extract contact-related signals."""

    def __init__(self, lead_repository: LeadRepository) -> None:
        self._lead_repository = lead_repository

    def discover_contacts(self, lead_id: str | UUID) -> dict[str, list[str]]:
        """Discover and return unique contact signals for a lead website."""

        lead = self._lead_repository.find_by_id(lead_id)
        if lead is None:
            raise ValueError("Lead not found")
        if not lead.website:
            raise ValueError("Lead has no website to analyze")

        base_url = str(lead.website)
        candidates = self._build_candidate_urls(base_url)
        combined_html: list[str] = []

        for url in candidates:
            try:
                page = self._fetch_page(url)
                combined_html.append(page.text or "")
            except Exception as exc:  # pragma: no cover - defensive branch
                logger.warning("Failed to fetch contact page %s: %s", url, exc)

        html_text = "\n".join(combined_html)
        soup = BeautifulSoup(html_text, "html.parser")

        emails = self._extract_emails(html_text)
        phones = self._extract_phones(html_text)
        whatsapp = self._extract_whatsapp(html_text)
        social_links = self._extract_social_links(soup)

        contacts = {
            "emails": self._normalize_values(emails),
            "phones": self._normalize_values(phones),
            "whatsapp": self._normalize_values(whatsapp),
            "instagram": self._normalize_values(social_links.get("instagram", [])),
            "facebook": self._normalize_values(social_links.get("facebook", [])),
            "linkedin": self._normalize_values(social_links.get("linkedin", [])),
            "youtube": self._normalize_values(social_links.get("youtube", [])),
            "tiktok": self._normalize_values(social_links.get("tiktok", [])),
        }

        logger.info("Discovered contacts for lead %s: %s", lead.id, contacts)
        return contacts

    def _build_candidate_urls(self, base_url: str) -> list[str]:
        """Create candidate pages to inspect for contact information."""

        parsed = urlparse(base_url)
        root = f"{parsed.scheme}://{parsed.netloc}"
        paths = ["", "/contato", "/contact", "/about", "/sobre", "/footer", "/header"]
        urls = [urljoin(base_url, path) for path in paths]
        return [url for url in urls if url.startswith(root)]

    def _fetch_page(self, url: str) -> Any:
        """Fetch a page using httpx."""

        with httpx.Client(timeout=10.0) as client:
            return client.get(url)

    @staticmethod
    def _extract_emails(text: str) -> list[str]:
        """Extract email addresses from text using regex."""

        pattern = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
        return list(dict.fromkeys(pattern.findall(text)))

    @staticmethod
    def _extract_phones(text: str) -> list[str]:
        """Extract phone numbers from text using regex."""

        pattern = re.compile(r"\+?\d[\d().\s-]{7,}\d")
        matches = [match.strip() for match in pattern.findall(text)]
        filtered = []
        for value in dict.fromkeys(matches):
            digits = re.sub(r"\D", "", value)
            if len(digits) < 8 or len(digits) > 12:
                continue
            if re.search(r"https?://", value):
                continue
            filtered.append(value)
        return filtered

    @staticmethod
    def _extract_whatsapp(text: str) -> list[str]:
        """Extract WhatsApp links or numbers from text."""

        matches = []
        for match in re.finditer(r"https?://(?:wa\.me|api\.whatsapp\.com)/[^\s\"']+", text, flags=re.IGNORECASE):
            cleaned = match.group(0).rstrip(".,;:)")
            matches.append(cleaned)
        if "whatsapp" in text.lower():
            for match in re.finditer(r"\+?\d[\d().\s-]{7,}\d", text):
                value = match.group(0).strip().rstrip(".,;:)")
                if len(re.sub(r"\D", "", value)) >= 8 and len(re.sub(r"\D", "", value)) <= 12:
                    matches.append(value)
        return [
            value for value in dict.fromkeys(matches)
            if "http" in value.lower() and "wa.me" in value.lower()
        ]

    @staticmethod
    def _extract_social_links(soup: BeautifulSoup) -> dict[str, list[str]]:
        """Extract social network links from HTML anchors."""

        links: dict[str, list[str]] = {key: [] for key in ["instagram", "facebook", "linkedin", "youtube", "tiktok"]}
        for anchor in soup.find_all("a", href=True):
            href = anchor.get("href", "")
            lowered = href.lower()
            if "instagram" in lowered:
                links["instagram"].append(href)
            if "facebook" in lowered or "fb.com" in lowered:
                links["facebook"].append(href)
            if "linkedin" in lowered:
                links["linkedin"].append(href)
            if "youtube" in lowered:
                links["youtube"].append(href)
            if "tiktok" in lowered:
                links["tiktok"].append(href)
        return {key: list(dict.fromkeys(value)) for key, value in links.items()}

    @staticmethod
    def _normalize_values(values: list[str]) -> list[str]:
        """Remove empty values and duplicates while keeping order."""

        return [value for value in dict.fromkeys(value.strip() for value in values if value and value.strip())]
