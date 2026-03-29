from ..db import Base
from typing import Optional
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Boolean, Text, Enum as SAEnum
from .enums import CuisineTypeEnum


class Restaurant(Base):
    __tablename__ = "restaurant"

    restaurant_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[str] = mapped_column(String(500), nullable=False)
    has_kiosk: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    cuisine: Mapped[CuisineTypeEnum] = mapped_column(SAEnum(CuisineTypeEnum, name="cuisine_type_enum"), nullable=False, default=CuisineTypeEnum.OTHER)
    photo: Mapped[Optional[str]] = mapped_column(String(512), nullable=True, default=None)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
