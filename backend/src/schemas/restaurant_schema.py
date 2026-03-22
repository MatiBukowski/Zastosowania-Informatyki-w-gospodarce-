from pydantic import BaseModel, ConfigDict

class RestaurantBase(BaseModel):
    name: str
    address: str
    has_kiosk: bool


class RestaurantPublicResponse(RestaurantBase):
    restaurant_id: int
    model_config = ConfigDict(from_attributes=True)


class RestaurantAdminResponse(RestaurantPublicResponse):
    is_active: bool