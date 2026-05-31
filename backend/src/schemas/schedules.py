from pydantic import BaseModel
from datetime import time
from ..models.enums import DayOfWeekEnum

class RestaurantScheduleBase(BaseModel):
    day_of_week: DayOfWeekEnum
    open_time: time
    close_time: time
