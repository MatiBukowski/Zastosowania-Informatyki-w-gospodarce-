from fastapi import APIRouter, Depends
from uuid import UUID
from ..schemas import TableResponse, TableUpdate
from ..services import TableService


router = APIRouter(prefix="/tables", tags=["Tables - Public QR Scan"])


@router.get(
    "/resolve/{token}",
    response_model=TableResponse,
    summary="Resolve QR code",
    description="Check if the QR code for the table exists"
)
def resolve_qr_token(token: UUID, service: TableService = Depends()):
    return service.resolve_table_by_token(token)

@router.patch(
    "/{table_id}",
    summary="Update existing table",
    response_model=TableResponse
)
def update_table_endpoint(table_id: int, table_data: TableUpdate, service: TableService = Depends()):
    return service.update_existing_table(table_id, table_data)

@router.patch(
    "/{table_id}/regenerate-qr-code",
    summary="Regenerate QR code for existing table",
    response_model=TableResponse
)
def regenerate_qr_code_token(table_id: int, service: TableService = Depends()):
    return service.regenerate_table_qr_code(table_id)
