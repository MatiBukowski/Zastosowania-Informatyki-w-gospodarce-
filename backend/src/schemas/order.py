from pydantic import BaseModel, ConfigDict, Field
from datetime import datetime
from typing import Optional, List
from decimal import Decimal
from ..models.enums import OrderSourceEnum, OrderStatusEnum


class OrderItemBase(BaseModel):
    menu_item_id: int
    quantity: int = Field(..., ge=1)
    customization_notes: Optional[str] = None


class OrderItemCreate(OrderItemBase):
    pass


class OrderItemResponse(OrderItemBase):
    order_item_id: int
    order_id: int
    restaurant_id: int
    unit_price: Decimal = Field(..., max_digits=10, decimal_places=2, ge=0)

    model_config = ConfigDict(from_attributes=True)


class OrderBase(BaseModel):
    restaurant_id: int
    table_id: Optional[int] = None
    reservation_id: Optional[int] = None
    order_source: OrderSourceEnum


class OrderCreate(OrderBase):
    items: List[OrderItemCreate]


class OrderUpdate(BaseModel):
    status: Optional[OrderStatusEnum] = None


class OrderResponse(OrderBase):
    order_id: int
    user_id: Optional[int] = None
    status: OrderStatusEnum
    total_amount: Decimal = Field(..., max_digits=10, decimal_places=2, ge=0)
    created_at: datetime
    items: List[OrderItemResponse]

    model_config = ConfigDict(from_attributes=True)
