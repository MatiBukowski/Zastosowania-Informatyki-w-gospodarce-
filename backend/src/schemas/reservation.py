from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional
from ..models.enums import ReservationStatusEnum

class ReservationBase(BaseModel):
    restaurant_id: int
    table_id: int
    reservation_time: datetime

class ReservationCreate(ReservationBase):
    user_id: int

class ReservationUpdate(BaseModel):
    reservation_time: Optional[datetime] = None
    status: Optional[ReservationStatusEnum] = None

class ReservationResponse(ReservationCreate):
    reservation_id: int
    status: ReservationStatusEnum

    model_config = ConfigDict(from_attributes=True)
