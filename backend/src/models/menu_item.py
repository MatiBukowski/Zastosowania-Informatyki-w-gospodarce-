from decimal import Decimal
from typing import Optional
from sqlalchemy import Column, String, Text, Numeric, ForeignKey, UniqueConstraint, CheckConstraint
from sqlmodel import SQLModel, Field

class MenuItem(SQLModel, table=True):
    __tablename__ = "menu_item"
    __table_args__ = (
        UniqueConstraint("menu_item_id", "restaurant_id", name="uq_menu_item_id_restaurant"),
        CheckConstraint("price >= 0", name="chk_menu_item_price_non_negative"),
    )

    menu_item_id: Optional[int] = Field(default=None, primary_key=True)
    restaurant_id: int = Field(
        sa_column=Column(
            ForeignKey("restaurant.restaurant_id", ondelete="CASCADE"),
            nullable=False,
        )
    )
    name: str = Field(sa_column=Column(String(255), nullable=False))
    description: Optional[str] = Field(default=None, sa_column=Column(Text, nullable=True))
    price: Decimal = Field(sa_column=Column(Numeric(10, 2), nullable=False))
    is_available: bool = Field(default=True, nullable=False)
