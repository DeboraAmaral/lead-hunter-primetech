from pathlib import Path

from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    APP_NAME: str = "PrimeTech Lead Hunter"

    API_PREFIX: str = "/api/v1"

    DATABASE_URL: str = f"sqlite:///{Path(__file__).resolve().parents[1] / 'lead_hunter.db'}"

    DEBUG: bool = True

    class Config:
        env_file = ".env"


settings = Settings()