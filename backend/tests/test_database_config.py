from app.core.config import Settings


def test_default_database_url_is_absolute() -> None:
    """The default SQLite database path should resolve to an absolute file location."""

    settings = Settings()

    assert settings.DATABASE_URL.startswith("sqlite:///")
    assert settings.DATABASE_URL.endswith("lead_hunter.db")
    assert "./lead_hunter.db" not in settings.DATABASE_URL
