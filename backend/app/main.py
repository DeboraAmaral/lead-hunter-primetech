from fastapi import FastAPI

from app.api.routers.health import router as health_router
from app.api.routers.leads import router as leads_router
from app.core.config import settings
from app.core.logging import logger

app = FastAPI(
    title=settings.APP_NAME,
    version="1.0.0",
)

app.include_router(health_router, prefix=settings.API_PREFIX)
app.include_router(leads_router, prefix=settings.API_PREFIX)


@app.on_event("startup")
def startup_event() -> None:
    """Log application startup."""

    logger.info("Application started")