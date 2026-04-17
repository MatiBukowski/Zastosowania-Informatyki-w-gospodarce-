from fastapi import Depends, HTTPException, status
from ..repositories import ReservationRepository
from ..schemas import ReservationCreate, ReservationUpdate
from ..models import Reservation
from .table import TableService

class ReservationService:
    def __init__(
        self, 
        repo: ReservationRepository = Depends(),
        table_service: TableService = Depends()
    ):
        self.repo = repo
        self.table_service = table_service

    def get_reservations_for_table(self, table_id: int):
        self.table_service.validate_table_exists(table_id)
        return self.repo.get_reservations_by_table_id(table_id)

    def get_reservation(self, reservation_id: int):
        reservation = self.repo.get_reservation_by_id(reservation_id)
        if not reservation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Reservation with id={reservation_id} not found"
            )
        return reservation

    def create_new_reservation(self, data: ReservationCreate):
        self.table_service.validate_table_exists(data.table_id)
        
        conflicts = self.repo.get_overlapping_reservations(data.table_id, data.reservation_time)
        if conflicts:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="Table is already reserved for this time slot (2h window collision)."
            )
            
        new_reservation = Reservation(**data.model_dump())
        return self.repo.create_reservation(new_reservation)

    def update_reservation(self, reservation_id: int, data: ReservationUpdate):
        reservation = self.repo.get_reservation_by_id(reservation_id)
        if not reservation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Reservation with id={reservation_id} not found"
            )
            
        if data.reservation_time and data.reservation_time != reservation.reservation_time:
            conflicts = self.repo.get_overlapping_reservations(
                reservation.table_id, 
                data.reservation_time,
                exclude_id=reservation_id
            )
            if conflicts:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="New time slot conflicts with an existing reservation."
                )
                
        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(reservation, key, value)
            
        return self.repo.update_reservation(reservation)
