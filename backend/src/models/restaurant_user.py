from ..db import Base
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy import ForeignKey

class RestaurantUser(Base):
    __tablename__ = "restaurant_user"

    user_id: Mapped[int] = mapped_column(
        ForeignKey("app_user.user_id", ondelete="CASCADE"),
        primary_key=True
    )
    restaurant_id: Mapped[int] = mapped_column(
        ForeignKey("restaurant.restaurant_id", ondelete="CASCADE"), 
        primary_key=True
    )
