from ..db import Base
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import (
    String,
    ForeignKey,
    UniqueConstraint,
    CheckConstraint,
    Enum as SAEnum
)

from .enums import TableStatusEnum


class RestaurantTable(Base):
    __tablename__ = "restaurant_table"
    __table_args__ = (
        UniqueConstraint(
            "restaurant_id", "table_number", name="uq_restaurant_table_number"
        ),
        UniqueConstraint(
            "table_id", "restaurant_id", name="uq_restaurant_table_id_restaurant"
        ),
        CheckConstraint("capacity > 0", name="chk_restaurant_table_capacity_positive"),
    )

    table_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    restaurant_id: Mapped[int] = mapped_column(ForeignKey("restaurant.restaurant_id", ondelete="CASCADE"), nullable=False)
    table_number: Mapped[int] = mapped_column(nullable=False)
    qr_code_token: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    capacity: Mapped[int] = mapped_column(nullable=False)
    status: Mapped[TableStatusEnum] = mapped_column(SAEnum(TableStatusEnum, name="table_status_enum"), nullable=False, default=TableStatusEnum.FREE)
