from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional, List
from ..models.enums import CuisineTypeEnum
from .schedules import RestaurantScheduleBase

class RestaurantBase(BaseModel):
    name: str
    city: str
    street: str
    building_number: str
    postal_code: str
    phone_number: str
    has_kiosk: bool
    cuisine: CuisineTypeEnum
    photo: Optional[str] = None
    schedules: List[RestaurantScheduleBase] = []


class RestaurantPublicResponse(RestaurantBase):
    restaurant_id: int
    model_config = ConfigDict(from_attributes=True)


class SingleRestaurantPublicResponse(RestaurantPublicResponse):
    description: str


class UpdateSingleRestaurant(BaseModel):
    name: Optional[str] = None
    city: Optional[str] = None
    street: Optional[str] = None
    building_number: Optional[str] = None
    postal_code: Optional[str] = None
    phone_number: Optional[str] = None
    has_kiosk: Optional[bool] = None
    cuisine: Optional[CuisineTypeEnum] = None
    photo: Optional[str] = None
    schedules: Optional[List[RestaurantScheduleBase]] = None
    description: Optional[str] = None


class RestaurantAdminResponse(SingleRestaurantPublicResponse):
    is_active: bool


class RestaurantFilters(BaseModel):
    cuisine: Optional[List[CuisineTypeEnum]] = None


class RestaurantFilterQuery(BaseModel):
    cuisine: Optional[List[str]] = None

    @field_validator("cuisine", mode="before")
    def split_csv_list(cls, v):
        if v is None:
            return None
        if isinstance(v, str):
            v = [v]
        out = []
        for item in v:
            out.extend([x.strip() for x in item.split(",") if x.strip()])
        return out or None