from fastapi import APIRouter, Depends, Request
from uuid import UUID
from ..schemas import TableResponse, TableUpdate, ReservationResponse, ReservationCreate, PaginatedResponse
from ..services import TableService, ReservationService
from ..schemas.pagination import get_pagination_params
from ..middleware.rate_limit import limiter

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
@limiter.limit("3/minute")
def regenerate_qr_code_token(request: Request, table_id: int, service: TableService = Depends()):
    return service.regenerate_table_qr_code(table_id)

@router.get(
    "/{table_id}/reservation",
    summary="Get specific table reservations",
    response_model=PaginatedResponse[ReservationResponse]
)
def get_table_reservations_endpoint(
    table_id: int, 
    pagination: dict = Depends(get_pagination_params),
    service: ReservationService = Depends()
):
    return service.get_reservations_for_table(table_id, **pagination)

@router.post(
    "/{table_id}/reservation",
    summary="Create new reservation for table",
    response_model=ReservationResponse
)
@limiter.limit("5/minute")
def post_reservation_endpoint(request: Request, table_id: int, reservation_data: ReservationCreate, service: ReservationService = Depends()):
    reservation_data.table_id = table_id
    return service.create_new_reservation(reservation_data)