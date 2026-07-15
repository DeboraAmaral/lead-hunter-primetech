from fastapi import APIRouter

router = APIRouter()


@router.get(
    "/health",
    tags=["Health"],
)
def health():

    return {
        "status": "ok",
        "application": "PrimeTech Lead Hunter",
    }