from pydantic import BaseModel, ConfigDict
from typing import Optional
from ..models.enums import CuisineTypeEnum


class RestaurantBase(BaseModel):
    name: str
    address: str
    has_kiosk: bool
    cuisine: CuisineTypeEnum
    photo: Optional[str] = None


class RestaurantPublicResponse(RestaurantBase):
    restaurant_id: int
    model_config = ConfigDict(from_attributes=True)


class SingleRestaurantPublicResponse(RestaurantPublicResponse):
    description: str


class RestaurantAdminResponse(SingleRestaurantPublicResponse):
    is_active: bool
