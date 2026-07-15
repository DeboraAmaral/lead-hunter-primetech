"""Enumeration values for the lead lifecycle in the domain layer."""

from enum import Enum


class LeadStatus(str, Enum):
    """Represents the current lifecycle status of a lead."""

    NEW = "NEW"
    CONTACTED = "CONTACTED"
    NO_RESPONSE = "NO_RESPONSE"
    INTERESTED = "INTERESTED"
    CLIENT = "CLIENT"
    DISCARDED = "DISCARDED"
