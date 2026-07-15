"""Declarative base for all SQLAlchemy domain models."""

from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    """Shared base class for ORM models in the application."""

    pass