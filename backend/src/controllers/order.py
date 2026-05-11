from __future__ import annotations

from fastapi import APIRouter, Depends

from ..schemas import OrderDetailsResponse, OrderItemCreate, OrderUpdate
from ..services import OrderService


router = APIRouter(prefix="/orders", tags=["Orders"])


@router.get(
    "/{order_id}",
    summary="Get order details",
    response_model=OrderDetailsResponse,
)
def get_order_endpoint(order_id: int, service: OrderService = Depends()):
    return service.get_order(order_id)


@router.patch(
    "/{order_id}",
    summary="Update order status",
    response_model=OrderDetailsResponse,
)
def patch_order_endpoint(order_id: int, order_data: OrderUpdate, service: OrderService = Depends()):
    return service.update_order(order_id, order_data)


@router.post(
    "/{order_id}/items",
    summary="Add items to order",
    response_model=OrderDetailsResponse,
)
def add_order_items_endpoint(
    order_id: int,
    items: list[OrderItemCreate],
    service: OrderService = Depends(),
):
    return service.add_items(order_id, items)
