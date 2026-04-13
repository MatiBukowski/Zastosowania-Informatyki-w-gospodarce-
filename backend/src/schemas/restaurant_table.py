from pydantic import BaseModel, ConfigDict
from ..models.enums import TableStatusEnum

class RestaurantTableBase(BaseModel):
    table_number: int
    capacity: int
    status: TableStatusEnum
    qr_code_token: str

class RestaurantTableResponse(RestaurantTableBase):
    table_id: int
    restaurant_id: int

    model_config = ConfigDict(from_attributes=True)
