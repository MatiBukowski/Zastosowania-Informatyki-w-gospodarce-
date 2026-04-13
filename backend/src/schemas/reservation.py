from pydantic import BaseModel, ConfigDict
from datetime import datetime
from ..models.enums import ReservationStatusEnum

class ReservationPublicResponse(BaseModel):
    reservation_id: int
    user_id: int
    restaurant_id: int
    table_id: int
    reservation_time: datetime
    status: ReservationStatusEnum

    model_config = ConfigDict(from_attributes=True)
