"""Custom exception types for the lead domain API."""

from __future__ import annotations


class LeadNotFoundError(Exception):
    """Raised when a lead cannot be found."""

    def __init__(self, lead_id: str) -> None:
        super().__init__(f"Lead with id '{lead_id}' was not found.")
        self.lead_id = lead_id


class LeadConflictError(Exception):
    """Raised when an operation conflicts with the current lead state."""

    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message


class LeadValidationError(ValueError):
    """Raised when request data is invalid."""

    def __init__(self, message: str) -> None:
        super().__init__(message)
        self.message = message
