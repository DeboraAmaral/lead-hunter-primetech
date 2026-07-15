from fastapi import FastAPI

from app.api.routers.contact_discovery import router as contact_discovery_router
from app.api.routers.health import router as health_router
from app.api.routers.leads import router as leads_router
from app.api.routers.search import router as search_router
from app.api.routers.website_analysis import router as website_analysis_router
from app.core.config import settings
from app.core.logging import logger

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
)

app.include_router(health_router, prefix=settings.API_PREFIX)
app.include_router(leads_router, prefix=settings.API_PREFIX)
app.include_router(search_router, prefix=settings.API_PREFIX)
app.include_router(website_analysis_router, prefix=settings.API_PREFIX)
app.include_router(contact_discovery_router, prefix=settings.API_PREFIX)


@app.on_event("startup")
def startup_event() -> None:
    """Log application startup."""

    logger.info("Application started")