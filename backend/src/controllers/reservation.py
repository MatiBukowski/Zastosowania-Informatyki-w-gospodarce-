from fastapi import APIRouter, Depends, Request
from ..schemas import ReservationResponse, ReservationUpdate
from ..services import ReservationService
from ..middleware.rate_limit import limiter

router = APIRouter(prefix="/reservations", tags=["Reservations"])

@router.get(
    "/{reservation_id}",
    summary="Get reservation details",
    response_model=ReservationResponse
)
@limiter.limit("50/minute")
def get_reservation_endpoint(request: Request, reservation_id: int, service: ReservationService = Depends()):
    return service.get_reservation(reservation_id)

@router.patch(
    "/{reservation_id}",
    summary="Update or cancel reservation",
    response_model=ReservationResponse
)
@limiter.limit("20/minute")
def patch_reservation_endpoint(request: Request, reservation_id: int, reservation_data: ReservationUpdate, service: ReservationService = Depends()):
    return service.update_reservation(reservation_id, reservation_data)
