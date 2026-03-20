from decimal import Decimal
from typing import Optional
from sqlalchemy import Column, Numeric, Text, ForeignKeyConstraint, CheckConstraint
from sqlmodel import SQLModel, Field

class OrderItem(SQLModel, table=True):
    __tablename__ = "order_item"
    __table_args__ = (
        ForeignKeyConstraint(
            ["order_id", "restaurant_id"],
            ["orders.order_id", "orders.restaurant_id"],
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
        CheckConstraint("unit_price >= 0", name="chk_order_item_unit_price_non_negative"),
    )

    order_item_id: Optional[int] = Field(default=None, primary_key=True)
    order_id: int = Field(nullable=False)
    restaurant_id: int = Field(nullable=False)
    menu_item_id: int = Field(nullable=False)
    quantity: int = Field(nullable=False)
    unit_price: Decimal = Field(sa_column=Column(Numeric(10, 2), nullable=False))
    customization_notes: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True))
