import uuid
from pydantic import BaseModel, ConfigDict, Field
from typing import Optional
from src.models import TableStatusEnum


class TableBase(BaseModel):
    table_number: int
    capacity: int = Field(..., ge=1)


class TableCreate(TableBase):
    restaurant_id: int
    status: TableStatusEnum = TableStatusEnum.FREE


class TableUpdate(BaseModel):
    table_number: Optional[int] = None
    capacity: Optional[int] = Field(None, ge=1)
    status: Optional[TableStatusEnum] = None


class TableResponse(TableBase):
    table_id: int
    restaurant_id: int
    qr_code_token: uuid.UUID
    status: TableStatusEnum

    model_config = ConfigDict(from_attributes=True)
