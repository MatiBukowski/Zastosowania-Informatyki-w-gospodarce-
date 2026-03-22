from pydantic import BaseModel, ConfigDict, Field
from decimal import Decimal
from typing import Optional

class MenuItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: Decimal = Field(..., max_digits=10, decimal_places=2, ge=0)


class MenuItemCreate(MenuItemBase):
    is_available: bool = True 


class MenuItemUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    price: Optional[Decimal] = Field(None, max_digits=10, decimal_places=2, ge=0)
    is_available: Optional[bool] = None


class MenuItemResponse(MenuItemBase):
    menu_item_id: int
    restaurant_id: int
    is_available: bool

    model_config = ConfigDict(from_attributes=True)