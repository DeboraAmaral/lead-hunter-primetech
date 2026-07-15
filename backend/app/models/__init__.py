"""Domain models for the application."""

from app.models.lead import Lead
from app.models.search_history import SearchHistory
from app.models.website_analysis import WebsiteAnalysis

__all__ = ["Lead", "SearchHistory", "WebsiteAnalysis"]
