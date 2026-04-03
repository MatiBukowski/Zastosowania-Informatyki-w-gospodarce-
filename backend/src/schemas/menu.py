from pydantic import BaseModel, ConfigDict, Field
from decimal import Decimal
from typing import Optional


class MenuItemBase(BaseModel):
    name: str
    description: Optional[str] = None
    price: Decimal = Field(..., max_digits=10, decimal_places=2, ge=0)


class MenuItemResponse(MenuItemBase):
    menu_item_id: int
    is_available: bool

    model_config = ConfigDict(from_attributes=True)
