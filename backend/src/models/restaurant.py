from typing import List, TYPE_CHECKING
from ..db import Base
from typing import Optional
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean, Text, Enum as SAEnum
from .enums import CuisineTypeEnum
if TYPE_CHECKING:
    from .app_user import AppUser
    from .restaurant_schedule import RestaurantSchedule


class Restaurant(Base):
    __tablename__ = "restaurant"

    restaurant_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    city: Mapped[str] = mapped_column(String(100), nullable=False)
    street: Mapped[str] = mapped_column(String(150), nullable=False)
    building_number: Mapped[str] = mapped_column(String(20), nullable=False)
    postal_code: Mapped[str] = mapped_column(String(20), nullable=False)
    phone_number: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    has_kiosk: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    cuisine: Mapped[CuisineTypeEnum] = mapped_column(SAEnum(CuisineTypeEnum, name="cuisine_type_enum"), nullable=False, default=CuisineTypeEnum.OTHER)
    photo: Mapped[Optional[str]] = mapped_column(String(512), nullable=True, default=None)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)

    admins: Mapped[List["AppUser"]] = relationship(
        secondary="restaurant_user", 
        back_populates="managed_restaurants"
    )

    schedules: Mapped[List["RestaurantSchedule"]] = relationship(
        back_populates="restaurant", 
        cascade="all, delete-orphan"
    )
