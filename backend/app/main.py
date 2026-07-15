from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.routers.contact_discovery import router as contact_discovery_router
from app.api.routers.health import router as health_router
from app.api.routers.leads import router as leads_router
from app.api.routers.search import router as search_router
from app.api.routers.website_analysis import router as website_analysis_router
from app.core.config import settings
from app.core.logging import logger
from app.database.base import Base
from app.database.session import engine
from app.models import lead, search_history, website_analysis  # noqa: F401

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, prefix=settings.API_PREFIX)
app.include_router(leads_router, prefix=settings.API_PREFIX)
app.include_router(search_router, prefix=settings.API_PREFIX)
app.include_router(website_analysis_router, prefix=settings.API_PREFIX)
app.include_router(contact_discovery_router, prefix=settings.API_PREFIX)


@app.on_event("startup")
def startup_event() -> None:
    """Initialize the database schema and log application startup."""

    Base.metadata.create_all(bind=engine)
    logger.info("Application started")