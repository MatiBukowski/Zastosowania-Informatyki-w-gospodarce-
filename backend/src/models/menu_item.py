from ..db import Base
from decimal import Decimal
from typing import Optional
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Text, Numeric, ForeignKey, UniqueConstraint, CheckConstraint, Boolean


class MenuItem(Base):
    __tablename__ = "menu_item"
    __table_args__ = (
        UniqueConstraint(
            "menu_item_id", "restaurant_id", name="uq_menu_item_id_restaurant"
        ),
        CheckConstraint("price >= 0", name="chk_menu_item_price_non_negative"),
    )

    menu_item_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    restaurant_id: Mapped[int] = mapped_column(ForeignKey("restaurant.restaurant_id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True, default=None)
    price: Mapped[Decimal] = mapped_column(Numeric(10, 2), nullable=False)
    is_available: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
