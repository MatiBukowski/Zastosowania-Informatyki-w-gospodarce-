from ..db import Base

from datetime import time
from typing import List, TYPE_CHECKING
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import (
    Time,
    ForeignKey,
    Enum as SAEnum,
)

from .enums import DayOfWeekEnum
if TYPE_CHECKING:
    from .restaurant import Restaurant


class RestaurantSchedule(Base):
    __tablename__ = "restaurant_schedules"
    
    restaurant_schedule_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    restaurant_id: Mapped[int] = mapped_column(ForeignKey("restaurant.restaurant_id", ondelete="CASCADE"), nullable=False)
    
    day_of_week: Mapped[DayOfWeekEnum] = mapped_column(SAEnum(DayOfWeekEnum, name="day_of_week_enum"), nullable=False)
    open_time: Mapped[time] = mapped_column(Time, nullable=False)
    close_time: Mapped[time] = mapped_column(Time, nullable=False)
    
    restaurant: Mapped["Restaurant"] = relationship(back_populates="schedules")
