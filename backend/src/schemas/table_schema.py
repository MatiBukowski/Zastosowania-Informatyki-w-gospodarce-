from pydantic import BaseModel, ConfigDict, Field
from decimal import Decimal
from typing import Optional
from ..models.enums import TableStatusEnum

class TableBase(BaseModel):
    table_number: int = Field(..., ge=1)
    capacity: int = Field(..., ge=1)


class TableCreate(TableBase):
    qr_code_token: str
    status: TableStatusEnum = TableStatusEnum.FREE


class TableUpdate(BaseModel):
    table_number: Optional[int] = Field(None, ge=1)
    capacity: Optional[int] = Field(None, ge=1)
    status: Optional[TableStatusEnum] = None


class TableResponse(TableBase):
    table_id: int
    restaurant_id: int
    qr_code_token: str
    status: TableStatusEnum

    model_config = ConfigDict(from_attributes=True)