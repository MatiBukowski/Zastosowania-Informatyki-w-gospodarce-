from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

from ..models import OrderSourceEnum, OrderStatusEnum


class OrderItemBase(BaseModel):
    menu_item_id: int
    quantity: int = Field(..., ge=1)
    customization_notes: Optional[str] = None


class OrderItemCreate(OrderItemBase):
    pass


class OrderItemResponse(OrderItemBase):
    order_item_id: int
    unit_price: Decimal = Field(..., max_digits=10, decimal_places=2, ge=0)

    model_config = ConfigDict(from_attributes=True)


class OrderBase(BaseModel):
    restaurant_id: int
    user_id: Optional[int] = None
    table_id: Optional[int] = None
    reservation_id: Optional[int] = None
    order_source: OrderSourceEnum


class OrderCreate(OrderBase):
    items: list[OrderItemCreate] = Field(..., min_length=1)


class OrderUpdate(BaseModel):
    status: Optional[OrderStatusEnum] = None


class OrderResponse(OrderBase):
    order_id: int
    status: OrderStatusEnum
    total_amount: Decimal = Field(..., max_digits=10, decimal_places=2, ge=0)
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class OrderDetailsResponse(OrderResponse):
    items: list[OrderItemResponse]
