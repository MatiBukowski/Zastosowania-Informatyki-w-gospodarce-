from typing import Optional
from sqlalchemy import Column, String, ForeignKey, UniqueConstraint, CheckConstraint
from sqlmodel import SQLModel, Field

class RestaurantTable(SQLModel, table=True):
    __tablename__ = "restaurant_table"
    __table_args__ = (
        UniqueConstraint("restaurant_id", "table_number", name="uq_restaurant_table_number"),
        UniqueConstraint("table_id", "restaurant_id", name="uq_restaurant_table_id_restaurant"),
        CheckConstraint("capacity > 0", name="chk_restaurant_table_capacity_positive"),
    )

    table_id: Optional[int] = Field(default=None, primary_key=True)
    restaurant_id: int = Field(
        sa_column=Column(
            ForeignKey("restaurant.restaurant_id", ondelete="CASCADE"),
            nullable=False,
        )
    )
    table_number: int = Field(nullable=False)
    qr_code_token: str = Field(sa_column=Column(String(255), nullable=False, unique=True))
    capacity: int = Field(nullable=False)
