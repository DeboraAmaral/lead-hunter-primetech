"""Lead domain model for the PrimeTech lead hunter application."""

from __future__ import annotations

import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, DateTime, Enum, Float, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base
from app.enums.lead_status import LeadStatus


class Lead(Base):
    """Represents a lead captured by the prospecting workflow."""

    __tablename__ = "leads"

    def __init__(self, **kw: object) -> None:
        """Initialize the model with practical defaults for domain usage."""

        kw.setdefault("id", str(uuid.uuid4()))
        kw.setdefault("status", LeadStatus.NEW)
        kw.setdefault("favorite", False)
        kw.setdefault("deleted", False)
        kw.setdefault("created_at", datetime.now(timezone.utc))
        kw.setdefault("updated_at", datetime.now(timezone.utc))
        super().__init__(**kw)

    id: Mapped[str] = mapped_column(
        String(36),
        primary_key=True,
        default=lambda: str(uuid.uuid4()),
        nullable=False,
    )
    company_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    segment: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    city: Mapped[str | None] = mapped_column(String(255), nullable=True, index=True)
    state: Mapped[str | None] = mapped_column(String(255), nullable=True)
    country: Mapped[str | None] = mapped_column(String(255), nullable=True)
    address: Mapped[str | None] = mapped_column(String(500), nullable=True)
    zip_code: Mapped[str | None] = mapped_column(String(50), nullable=True)
    phone: Mapped[str | None] = mapped_column(String(50), nullable=True)
    whatsapp: Mapped[str | None] = mapped_column(String(50), nullable=True)
    email: Mapped[str | None] = mapped_column(String(255), nullable=True)
    website: Mapped[str | None] = mapped_column(String(500), nullable=True)
    latitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    longitude: Mapped[float | None] = mapped_column(Float, nullable=True)
    google_maps_url: Mapped[str | None] = mapped_column(String(1000), nullable=True)
    status: Mapped[LeadStatus] = mapped_column(
        Enum(LeadStatus, native_enum=False, length=20),
        default=LeadStatus.NEW,
        nullable=False,
        index=True,
    )
    favorite: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    notes: Mapped[str | None] = mapped_column(String(2000), nullable=True)
    deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
        nullable=False,
    )
