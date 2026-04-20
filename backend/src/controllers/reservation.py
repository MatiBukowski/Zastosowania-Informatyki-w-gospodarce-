from fastapi import APIRouter, Depends
from ..schemas import ReservationResponse, ReservationUpdate
from ..services import ReservationService

router = APIRouter(prefix="/reservations", tags=["Reservations"])

@router.get(
    "/{reservation_id}",
    summary="Get reservation details",
    response_model=ReservationResponse
)
def get_reservation_endpoint(reservation_id: int, service: ReservationService = Depends()):
    return service.get_reservation(reservation_id)

@router.patch(
    "/{reservation_id}",
    summary="Update or cancel reservation",
    response_model=ReservationResponse
)
def patch_reservation_endpoint(reservation_id: int, reservation_data: ReservationUpdate, service: ReservationService = Depends()):
    return service.update_reservation(reservation_id, reservation_data)
