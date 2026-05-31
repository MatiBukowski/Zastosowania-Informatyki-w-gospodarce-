import uuid
from pydantic import BaseModel, ConfigDict, Field, field_validator
from typing import Optional
from src.models import TableStatusEnum


class TableBase(BaseModel):
    table_number: str = Field(..., min_length=1, max_length=80)
    capacity: int = Field(..., ge=1)

    @field_validator("table_number")
    @classmethod
    def normalize_table_number(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Table name cannot be empty")
        return normalized


class TableCreate(TableBase):
    status: TableStatusEnum = TableStatusEnum.FREE


class TableUpdate(BaseModel):
    table_number: Optional[str] = Field(None, min_length=1, max_length=80)
    capacity: Optional[int] = Field(None, ge=1)
    status: Optional[TableStatusEnum] = None

    @field_validator("table_number")
    @classmethod
    def normalize_table_number(cls, value: Optional[str]) -> Optional[str]:
        if value is None:
            return value
        normalized = value.strip()
        if not normalized:
            raise ValueError("Table name cannot be empty")
        return normalized


class TableResponse(TableBase):
    table_id: int
    restaurant_id: int
    qr_code_token: uuid.UUID
    status: TableStatusEnum

    model_config = ConfigDict(from_attributes=True)
