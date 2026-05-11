from typing import List, TYPE_CHECKING
from ..db import Base
from typing import Optional
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import String, Boolean, Enum as SAEnum
from .enums import UserRoleEnum
if TYPE_CHECKING:
    from .restaurant import Restaurant


class AppUser(Base):
    __tablename__ = "app_user"

    user_id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    surname: Mapped[str] = mapped_column(String(100), nullable=False)
    phone_number: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    role: Mapped[UserRoleEnum] = mapped_column(SAEnum(UserRoleEnum, name="user_role_enum"), nullable=False, default=UserRoleEnum.CUSTOMER)
    is_active: Mapped[bool] = mapped_column(Boolean, default=False)

    managed_restaurants: Mapped[List["Restaurant"]] = relationship(
        secondary="restaurant_user", 
        back_populates="admins"
    )
