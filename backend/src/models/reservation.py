from datetime import datetime
from typing import Optional
from sqlalchemy import Column, DateTime, ForeignKey, ForeignKeyConstraint, UniqueConstraint
from sqlalchemy import Enum as SAEnum
from sqlmodel import SQLModel, Field

from .enums import ReservationStatusEnum

class Reservation(SQLModel, table=True):
    __tablename__ = "reservation"
    __table_args__ = (
        ForeignKeyConstraint(
            ["table_id", "restaurant_id"],
            ["restaurant_table.table_id", "restaurant_table.restaurant_id"],
            name="fk_reservation_table_same_restaurant",
            ondelete="RESTRICT",
        ),
        UniqueConstraint("reservation_id", "restaurant_id", name="uq_reservation_id_restaurant"),
    )

    reservation_id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(
        sa_column=Column(
            ForeignKey("app_user.user_id", ondelete="CASCADE"),
            nullable=False,
        )
    )
    restaurant_id: int = Field(
        sa_column=Column(
            ForeignKey("restaurant.restaurant_id", ondelete="CASCADE"),
            nullable=False,
        )
    )
    table_id: int = Field(nullable=False)
    reservation_time: datetime = Field(sa_column=Column(DateTime, nullable=False))
    status: ReservationStatusEnum = Field(
        default=ReservationStatusEnum.PENDING,
        sa_column=Column(
            SAEnum(ReservationStatusEnum, name="reservation_status_enum"),
            nullable=False,
        ),
    )
