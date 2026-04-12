from fastapi import APIRouter, Depends
from uuid import UUID
from ..schemas import TableResponse
from ..services import TableService


router = APIRouter(tags=["Tables - Public QR Scan"])


@router.get(
    "/tables/resolve/{token}",
    response_model=TableResponse,
    summary="Resolve QR code",
    description="Check if the QR code for the table exists"
)
def resolve_qr_token(token: UUID, service: TableService = Depends()):
    return service.resolve_table_by_token(token)
