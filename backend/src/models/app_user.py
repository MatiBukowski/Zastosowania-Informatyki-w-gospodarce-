from typing import Optional
from sqlalchemy import Column, String
from sqlmodel import SQLModel, Field

class AppUser(SQLModel, table=True):
    __tablename__ = "app_user"

    user_id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(sa_column=Column(String(255), nullable=False, unique=True))
    password_hash: str = Field(sa_column=Column(String(255), nullable=False))
    first_name: str = Field(sa_column=Column(String(100), nullable=False))
    surname: str = Field(sa_column=Column(String(100), nullable=False))
    phone_number: Optional[str] = Field(default=None, sa_column=Column(String(30), nullable=True))
    is_active: bool = Field(default=True, nullable=False)
