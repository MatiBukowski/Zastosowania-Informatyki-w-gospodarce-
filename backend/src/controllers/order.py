from fastapi import APIRouter, Depends, Request
from typing import Optional

from ..schemas import OrderCreate, OrderUpdate, OrderResponse, PaginatedResponse
from ..services import OrderService
from ..models import AppUser, UserRoleEnum
from ..auth import get_current_user_optional, get_current_user
from ..schemas.pagination import get_pagination_params
from ..middleware.rate_limit import limiter
from ..security import RoleChecker

router = APIRouter(prefix="/orders", tags=["Orders"])

@router.post(
    "",
    summary="Create new order",
    description="Create a new order for a restaurant, optionally linked to a table, reservation, or authenticated user",
    response_model=OrderResponse,
    status_code=201
)
@limiter.limit("5/minute")
def create_order_endpoint(
    request: Request,
    order_data: OrderCreate,
    service: OrderService = Depends(),
    current_user: Optional[AppUser] = Depends(get_current_user_optional)
):
    return service.create_new_order(order_data, current_user)

@router.get(
    "/my",
    summary="Get authenticated user's orders",
    description="Retrieve paginated list of orders placed by the currently authenticated user",
    response_model=PaginatedResponse[OrderResponse]
)
def get_my_orders_endpoint(
    pagination: dict = Depends(get_pagination_params),
    service: OrderService = Depends(),
    current_user: AppUser = Depends(get_current_user)
):
    return service.get_orders_for_user(current_user.user_id, **pagination)

@router.get(
    "/restaurant/{restaurant_id}",
    summary="Get restaurant's orders",
    description="Retrieve paginated list of orders for a specific restaurant, restricted to staff members",
    response_model=PaginatedResponse[OrderResponse],
    dependencies=[Depends(RoleChecker([UserRoleEnum.ADMIN, UserRoleEnum.MANAGER, UserRoleEnum.WAITER]))]
)
def get_restaurant_orders_endpoint(
    restaurant_id: int,
    pagination: dict = Depends(get_pagination_params),
    service: OrderService = Depends(),
    current_user: AppUser = Depends(get_current_user)
):
    return service.get_orders_for_restaurant(restaurant_id, current_user, **pagination)

@router.get(
    "/{order_id}",
    summary="Get specific order details",
    description="Retrieve details of a specific order, accessible only by the order owner or staff members",
    response_model=OrderResponse
)
def get_order_endpoint(
    order_id: int, 
    service: OrderService = Depends(),
    current_user: AppUser = Depends(get_current_user)
):
    return service.get_order(order_id, current_user)

@router.patch(
    "/{order_id}",
    summary="Update existing order",
    description="Update order status with state machine validation and role-based access control",
    response_model=OrderResponse
)
@limiter.limit("5/minute")
def patch_order_endpoint(
    request: Request,
    order_id: int,
    order_data: OrderUpdate,
    service: OrderService = Depends(),
    current_user: AppUser = Depends(get_current_user)
):
    return service.update_order(order_id, order_data, current_user)

@router.patch(
    "/{order_id}/cancel",
    summary="Cancel order",
    description="Cancel an order directly, matching mobile frontend expectations",
    response_model=OrderResponse
)
@limiter.limit("5/minute")
def cancel_order_endpoint(
    request: Request,
    order_id: int,
    service: OrderService = Depends(),
    current_user: AppUser = Depends(get_current_user)
):
    from ..models.enums import OrderStatusEnum
    return service.update_order(order_id, OrderUpdate(status=OrderStatusEnum.CANCELED), current_user)
