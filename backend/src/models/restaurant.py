from typing import Optional
from sqlalchemy import Column, String
from sqlmodel import SQLModel, Field

class Restaurant(SQLModel, table=True):
    __tablename__ = "restaurant"

    restaurant_id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(sa_column=Column(String(255), nullable=False))
    address: str = Field(sa_column=Column(String(500), nullable=False))
    has_kiosk: bool = Field(default=False, nullable=False)
    is_active: bool = Field(default=True, nullable=False)
