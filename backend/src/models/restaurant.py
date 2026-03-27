from ..db import Base
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import String, Boolean


class Restaurant(Base):
    __tablename__ = "restaurant"

    restaurant_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[str] = mapped_column(String(500), nullable=False)
    has_kiosk: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
