from fastapi import Depends
from sqlalchemy.orm import Session
from sqlalchemy import select, and_, func
from datetime import datetime, timedelta
from ..db import get_session
from ..models import Reservation, ReservationStatusEnum

class ReservationRepository:
    def __init__(self, db: Session = Depends(get_session)):
        self.db = db

    def get_reservations_by_table_id(self, table_id: int, skip: int = 0, limit: int = 10):
        query = select(Reservation).where(Reservation.table_id == table_id)
        total = self.db.execute(select(func.count()).select_from(query.subquery())).scalar_one()
        items = self.db.execute(query.offset(skip).limit(limit)).scalars().all()
        return items, total

    def get_reservation_by_id(self, reservation_id: int) -> Reservation | None:
        return self.db.execute(
            select(Reservation).where(Reservation.reservation_id == reservation_id)
        ).scalar_one_or_none()
        
    def count_active_reservations_for_user(self, user_id: int) -> int:
        now = datetime.now()
        query = select(func.count()).select_from(Reservation).where(
            and_(
                Reservation.user_id == user_id,
                Reservation.status != ReservationStatusEnum.CANCELED,
                Reservation.reservation_time >= now
            )
        )
        return self.db.execute(query).scalar_one()

    def create_reservation(self, reservation: Reservation) -> Reservation:
        self.db.add(reservation)
        self.db.commit()
        self.db.refresh(reservation)
        return reservation

    def update_reservation(self, reservation: Reservation) -> Reservation:
        self.db.commit()
        self.db.refresh(reservation)
        return reservation

    def get_overlapping_reservations(self, table_id: int, start_time: datetime, duration_hours: int = 2, exclude_id: int | None = None) -> list[Reservation]:
        window_start = start_time - timedelta(hours=duration_hours)
        window_end = start_time + timedelta(hours=duration_hours)
        
        query = select(Reservation).where(
            and_(
                Reservation.table_id == table_id,
                Reservation.reservation_time > window_start,
                Reservation.reservation_time < window_end,
                Reservation.status != ReservationStatusEnum.CANCELED
            )
        )
        
        if exclude_id:
            query = query.where(Reservation.reservation_id != exclude_id)
            
        return self.db.execute(query).scalars().all()

    def get_reservations_by_user_id(self, user_id: int) -> list[Reservation]:
        return self.db.execute(
            select(Reservation).where(Reservation.user_id == user_id)
        ).scalars().all()

