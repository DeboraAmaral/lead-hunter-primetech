from pydantic_settings import BaseSettings


class Settings(BaseSettings):

    APP_NAME: str = "PrimeTech Lead Hunter"

    API_PREFIX: str = "/api/v1"

    DATABASE_URL: str = "sqlite:///./lead_hunter.db"

    DEBUG: bool = True

    class Config:
        env_file = ".env"


settings = Settings()