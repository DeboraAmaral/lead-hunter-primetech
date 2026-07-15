"""Service for analyzing lead websites using HTTP and HTML parsing."""

from __future__ import annotations

import re
from datetime import timedelta
from typing import Any
from urllib.parse import urlparse
from uuid import UUID

import httpx
from bs4 import BeautifulSoup

from app.core.logging import logger
from app.repositories.lead_repository import LeadRepository
from app.repositories.website_analyzer_repository import WebsiteAnalyzerRepository
from app.schemas.website_analysis import WebsiteAnalysisResponse


class WebsiteAnalyzerService:
    """Analyze lead websites and store a technical score."""

    def __init__(self, lead_repository: LeadRepository, analysis_repository: WebsiteAnalyzerRepository) -> None:
        self._lead_repository = lead_repository
        self._analysis_repository = analysis_repository

    def analyze_lead(self, lead_id: str | UUID) -> WebsiteAnalysisResponse:
        """Analyze a lead website if one exists and no recent analysis is stored."""

        lead = self._lead_repository.find_by_id(lead_id)
        if lead is None:
            raise ValueError("Lead not found")

        if not lead.website:
            raise ValueError("Lead has no website to analyze")

        recent = self._analysis_repository.find_recent_by_lead(lead.id, hours=24)
        if recent is not None:
            logger.info("Skipping website analysis for lead %s because a recent analysis already exists", lead.id)
            return WebsiteAnalysisResponse.model_validate(recent)

        page = self._fetch_page(str(lead.website))
        content = page.text or ""
        soup = BeautifulSoup(content, "html.parser")

        title = self._text_of(soup.title) if soup.title else None
        meta_description = self._meta_content(soup, "description")
        h1 = self._first_text(soup, "h1")
        images = soup.find_all("img")
        links = [
            link
            for link in soup.find_all("a")
            if link.get("href")
            and not link.get("href", "").startswith("#")
            and not link.get("href", "").startswith("mailto:")
            and not link.get("href", "").startswith("tel:")
            and not link.get("href", "").startswith("javascript:")
            and not bool(re.search(r"maps\.google|google\.com/maps", link.get("href", "")))
        ]
        viewport = self._meta_content(soup, "viewport")
        responsive = bool(viewport and "width=device-width" in viewport.lower())

        html_text = " ".join(soup.stripped_strings).lower()
        raw_html = content.lower()
        has_google_analytics = bool(re.search(r"ga\(|google-analytics|ua-\d+", raw_html))
        has_google_tag_manager = bool(re.search(r"gtag\(|googletagmanager|gtm-", raw_html))
        has_meta_pixel = bool(re.search(r"fbq\(|facebook pixel|meta pixel", raw_html))
        has_whatsapp = bool(re.search(r"wa\.me|whatsapp", raw_html))
        has_form = bool(soup.find("form"))
        has_instagram = bool(re.search(r"instagram", html_text))
        has_facebook = bool(re.search(r"facebook|fb\.com", html_text))
        has_linkedin = bool(re.search(r"linkedin", html_text))
        has_google_maps = bool(re.search(r"maps\.google|google\.com/maps|maps", raw_html))

        url = urlparse(str(lead.website))
        https_enabled = url.scheme.lower() == "https"
        response_time_ms = int(getattr(page, "elapsed", timedelta()).total_seconds() * 1000) if hasattr(page, "elapsed") else 0

        technical_score = self._calculate_score(
            https_enabled=https_enabled,
            responsive=responsive,
            has_google_analytics=has_google_analytics,
            has_google_tag_manager=has_google_tag_manager,
            has_meta_pixel=has_meta_pixel,
            has_whatsapp=has_whatsapp,
            has_form=has_form,
            has_instagram=has_instagram,
            has_facebook=has_facebook,
            has_linkedin=has_linkedin,
            has_google_maps=has_google_maps,
            image_count=len(images),
            link_count=len(links),
        )
        score_label = self._score_label(technical_score)

        analysis = self._analysis_repository.create(
            lead_id=lead.id,
            url=str(lead.website),
            https_enabled=https_enabled,
            response_time_ms=response_time_ms,
            title=title,
            meta_description=meta_description,
            h1=h1,
            image_count=len(images),
            link_count=len(links),
            responsive=responsive,
            has_google_analytics=has_google_analytics,
            has_google_tag_manager=has_google_tag_manager,
            has_meta_pixel=has_meta_pixel,
            has_whatsapp=has_whatsapp,
            has_form=has_form,
            has_instagram=has_instagram,
            has_facebook=has_facebook,
            has_linkedin=has_linkedin,
            has_google_maps=has_google_maps,
            technical_score=technical_score,
            score_label=score_label,
        )
        logger.info("Website analysis completed for lead %s with score %s", lead.id, technical_score)
        return WebsiteAnalysisResponse.model_validate(analysis)

    def _fetch_page(self, url: str) -> Any:
        """Fetch a webpage with a reasonable timeout."""

        with httpx.Client(timeout=10.0) as client:
            return client.get(url)

    @staticmethod
    def _text_of(tag: Any) -> str | None:
        text = tag.get_text(" ", strip=True) if tag else None
        return text or None

    @staticmethod
    def _first_text(soup: BeautifulSoup, tag_name: str) -> str | None:
        tag = soup.find(tag_name)
        return WebsiteAnalyzerService._text_of(tag)

    @staticmethod
    def _meta_content(soup: BeautifulSoup, name: str) -> str | None:
        tag = soup.find("meta", attrs={"name": name})
        if tag is None:
            tag = soup.find("meta", attrs={"property": name})
        return tag.get("content") if tag else None

    @staticmethod
    def _calculate_score(*, https_enabled: bool, responsive: bool, has_google_analytics: bool,
                         has_google_tag_manager: bool, has_meta_pixel: bool, has_whatsapp: bool,
                         has_form: bool, has_instagram: bool, has_facebook: bool, has_linkedin: bool,
                         has_google_maps: bool, image_count: int, link_count: int) -> int:
        """Convert website signals into a technical score."""

        score = 0
        if https_enabled:
            score += 20
        if responsive:
            score += 15
        if has_google_analytics:
            score += 8
        if has_google_tag_manager:
            score += 7
        if has_meta_pixel:
            score += 7
        if has_whatsapp:
            score += 5
        if has_form:
            score += 5
        if has_instagram:
            score += 5
        if has_facebook:
            score += 5
        if has_linkedin:
            score += 5
        if has_google_maps:
            score += 5
        if image_count >= 3:
            score += 8
        elif image_count >= 1:
            score += 4
        if link_count >= 10:
            score += 10
        elif link_count >= 5:
            score += 6
        return min(score, 100)

    @staticmethod
    def _score_label(score: int) -> str:
        """Map a numeric score to a semantic label."""

        if score >= 90:
            return "Excelente"
        if score >= 80:
            return "Bom"
        if score >= 60:
            return "Regular"
        if score >= 40:
            return "Ruim"
        return "Péssimo"
