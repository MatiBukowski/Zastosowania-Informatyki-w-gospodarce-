from pydantic import BaseModel, ConfigDict, field_validator
from typing import Optional, List
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