from ..db import Base
from decimal import Decimal
from typing import Optional
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import Numeric, Text, ForeignKeyConstraint, CheckConstraint


class OrderItem(Base):
    __tablename__ = "order_item"
    __table_args__ = (
        ForeignKeyConstraint(
            ["order_id", "restaurant_id"],
            ["order.order_id", "order.restaurant_id"],
            name="fk_order_item_order_same_restaurant",
            ondelete="CASCADE",
        ),
        ForeignKeyConstraint(
            ["menu_item_id", "restaurant_id"],
            ["menu_item.menu_item_id", "menu_item.restaurant_id"],
            name="fk_order_item_menu_item_same_restaurant",
            ondelete="RESTRICT",
        ),
        CheckConstraint("quantity > 0", name="chk_order_item_quantity_positive"),
        CheckConstraint(
            "unit_price >= 0", name="chk_order_item_unit_price_non_negative"
        ),
    )

    order_item_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    order_id: Mapped[int] = mapped_column(nullable=False)
    restaurant_id: Mapped[int] = mapped_column(nullable=False)
    menu_item_id: Mapped[int] = mapped_column(nullable=False)
    quantity: Mapped[int] = mapped_column(nullable=False)
    unit_price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    customization_notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True, default=None)
