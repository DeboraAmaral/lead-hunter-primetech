"""Pydantic schemas for lead domain objects."""

from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import AnyHttpUrl, BaseModel, ConfigDict, EmailStr, Field

from app.enums.lead_status import LeadStatus


class LeadBase(BaseModel):
    """Shared attributes for lead input payloads."""

    company_name: str = Field(..., min_length=1, max_length=255)
    segment: str | None = Field(default=None, max_length=255)
    city: str | None = Field(default=None, max_length=255)
    state: str | None = Field(default=None, max_length=255)
    country: str | None = Field(default=None, max_length=255)
    address: str | None = Field(default=None, max_length=500)
    zip_code: str | None = Field(default=None, max_length=50)
    phone: str | None = Field(default=None, max_length=50)
    whatsapp: str | None = Field(default=None, max_length=50)
    email: EmailStr | None = None
    website: AnyHttpUrl | None = None
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    google_maps_url: AnyHttpUrl | None = None
    status: LeadStatus = LeadStatus.NEW
    favorite: bool = False
    notes: str | None = Field(default=None, max_length=2000)


class LeadCreate(LeadBase):
    """Schema used to create a new lead."""


class LeadUpdate(BaseModel):
    """Schema used to partially update an existing lead."""

    company_name: str | None = Field(default=None, min_length=1, max_length=255)
    segment: str | None = Field(default=None, max_length=255)
    city: str | None = Field(default=None, max_length=255)
    state: str | None = Field(default=None, max_length=255)
    country: str | None = Field(default=None, max_length=255)
    address: str | None = Field(default=None, max_length=500)
    zip_code: str | None = Field(default=None, max_length=50)
    phone: str | None = Field(default=None, max_length=50)
    whatsapp: str | None = Field(default=None, max_length=50)
    email: EmailStr | None = None
    website: AnyHttpUrl | None = None
    latitude: float | None = Field(default=None, ge=-90, le=90)
    longitude: float | None = Field(default=None, ge=-180, le=180)
    google_maps_url: AnyHttpUrl | None = None
    status: LeadStatus | None = None
    favorite: bool | None = None
    notes: str | None = Field(default=None, max_length=2000)


class LeadResponse(LeadBase):
    """Schema returned when reading a lead."""

    id: UUID
    created_at: datetime
    updated_at: datetime
    deleted: bool = False

    model_config = ConfigDict(from_attributes=True)


class LeadListResponse(BaseModel):
    """Schema returned when listing leads."""

    items: list[LeadResponse]
    page: int = Field(..., ge=1)
    size: int = Field(..., ge=1)
    total: int = Field(..., ge=0)
    pages: int = Field(..., ge=0)

    model_config = ConfigDict(from_attributes=True)
