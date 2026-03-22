from ..db import Base
from datetime import datetime
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import (
    DateTime,
    ForeignKey,
    ForeignKeyConstraint,
    UniqueConstraint,
    Enum as SAEnum,
)


from .enums import ReservationStatusEnum


class Reservation(Base):
    __tablename__ = "reservation"
    __table_args__ = (
        ForeignKeyConstraint(
            ["table_id", "restaurant_id"],
            ["restaurant_table.table_id", "restaurant_table.restaurant_id"],
            name="fk_reservation_table_same_restaurant",
            ondelete="RESTRICT",
        ),
        UniqueConstraint(
            "reservation_id", "restaurant_id", name="uq_reservation_id_restaurant"
        ),
    )

    reservation_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("app_user.user_id", ondelete="CASCADE"), nullable=False)
    restaurant_id: Mapped[int] = mapped_column(ForeignKey("restaurant.restaurant_id", ondelete="CASCADE"), nullable=False)
    table_id: Mapped[int] = mapped_column(nullable=False)
    reservation_time: Mapped[datetime] = mapped_column(DateTime, nullable=False)
    status: Mapped[ReservationStatusEnum] = mapped_column(SAEnum(ReservationStatusEnum, name="reservation_status_enum"), nullable=False, default=ReservationStatusEnum.PENDING)
