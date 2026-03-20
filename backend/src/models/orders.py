from datetime import datetime
from decimal import Decimal
from typing import Optional
from sqlalchemy import Column, DateTime, ForeignKey, ForeignKeyConstraint, Numeric, UniqueConstraint, CheckConstraint
from sqlalchemy import Enum as SAEnum
from sqlmodel import SQLModel, Field

from .enums import OrderSourceEnum, OrderStatusEnum

class Orders(SQLModel, table=True):
    __tablename__ = "orders"
    __table_args__ = (
        ForeignKeyConstraint(
            ["table_id", "restaurant_id"],
            ["restaurant_table.table_id", "restaurant_table.restaurant_id"],
            name="fk_orders_table_same_restaurant",
            ondelete="SET NULL",
        ),
        ForeignKeyConstraint(
            ["reservation_id", "restaurant_id"],
            ["reservation.reservation_id", "reservation.restaurant_id"],
            name="fk_orders_reservation_same_restaurant",
            ondelete="SET NULL",
        ),
        UniqueConstraint("order_id", "restaurant_id", name="uq_order_id_restaurant"),
        CheckConstraint(
            "user_id IS NOT NULL OR table_id IS NOT NULL OR reservation_id IS NOT NULL OR order_source = 'KIOSK'",
            name="chk_order_origin_present",
        ),
        CheckConstraint("total_amount >= 0", name="chk_orders_total_non_negative"),
    )

    order_id: Optional[int] = Field(default=None, primary_key=True)
    restaurant_id: int = Field(
        sa_column=Column(
            ForeignKey("restaurant.restaurant_id", ondelete="CASCADE"),
            nullable=False,
        )
    )
    user_id: Optional[int] = Field(
        default=None,
        sa_column=Column(
            ForeignKey("app_user.user_id", ondelete="SET NULL"),
            nullable=True,
        ),
    )
    table_id: Optional[int] = Field(default=None, nullable=True)
    reservation_id: Optional[int] = Field(default=None, nullable=True)
    order_source: OrderSourceEnum = Field(
        sa_column=Column(
            SAEnum(OrderSourceEnum, name="order_source_enum"),
            nullable=False,
        )
    )
    status: OrderStatusEnum = Field(
        default=OrderStatusEnum.NEW,
        sa_column=Column(
            SAEnum(OrderStatusEnum, name="order_status_enum"),
            nullable=False,
        ),
    )
    total_amount: Decimal = Field(sa_column=Column(Numeric(10, 2), nullable=False))
    created_at: datetime = Field(default_factory=datetime.utcnow, sa_column=Column(DateTime, nullable=False))
