from ..db import Base
from datetime import datetime
from decimal import Decimal
from typing import Optional
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import (
    DateTime,
    ForeignKey,
    ForeignKeyConstraint,
    Numeric,
    UniqueConstraint,
    CheckConstraint,
    Enum as SAEnum,
)


from .enums import OrderSourceEnum, OrderStatusEnum


class Order(Base):
    __tablename__ = "order"
    __table_args__ = (
        ForeignKeyConstraint(
            ["table_id", "restaurant_id"],
            ["restaurant_table.table_id", "restaurant_table.restaurant_id"],
            name="fk_order_table_same_restaurant",
            ondelete="SET NULL",
        ),
        ForeignKeyConstraint(
            ["reservation_id", "restaurant_id"],
            ["reservation.reservation_id", "reservation.restaurant_id"],
            name="fk_order_reservation_same_restaurant",
            ondelete="SET NULL",
        ),
        UniqueConstraint("order_id", "restaurant_id", name="uq_order_id_restaurant"),
        CheckConstraint(
            "user_id IS NOT NULL OR table_id IS NOT NULL OR reservation_id IS NOT NULL OR order_source = 'KIOSK'",
            name="chk_order_origin_present",
        ),
        CheckConstraint("total_amount >= 0", name="chk_order_total_non_negative"),
    )

    order_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    restaurant_id: Mapped[int] = mapped_column(ForeignKey("restaurant.restaurant_id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[Optional[int]] = mapped_column(ForeignKey("app_user.user_id", ondelete="SET NULL"), nullable=True, default=None)
    table_id: Mapped[Optional[int]] = mapped_column(nullable=True, default=None)
    reservation_id: Mapped[Optional[int]] = mapped_column(nullable=True, default=None)
    order_source: Mapped[OrderSourceEnum] = mapped_column(SAEnum(OrderSourceEnum, name="order_source_enum"), nullable=False)
    status: Mapped[OrderStatusEnum] = mapped_column(SAEnum(OrderStatusEnum, name="order_status_enum"), nullable=False, default=OrderStatusEnum.NEW)
    total_amount: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, nullable=False, default=datetime.utcnow)
