from fastapi import Depends
from sqlalchemy.orm import Session
from sqlalchemy import select
from ..db import get_session
from ..models import Reservation

class ReservationRepository:
    def __init__(self, db: Session = Depends(get_session)):
        self.db = db

    def get_reservations_by_table_id(self, table_id: int):
        return self.db.execute(
            select(Reservation).where(Reservation.table_id == table_id)
        ).scalars().all()
