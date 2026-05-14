from fastapi import APIRouter, Depends
from ..schemas import (
    RestaurantPublicResponse,
    SingleRestaurantPublicResponse,
    MenuItemResponse,
    TableResponse,
    TableCreate,
    TableUpdate,
    PaginatedResponse
)
from ..services import RestaurantService, MenuService, TableService
from ..models import AppUser
from ..auth import get_current_user
from ..schemas.pagination import get_pagination_params

router = APIRouter(prefix="/restaurants", tags=["Restaurants"])


@router.get(
    "",
    response_model=PaginatedResponse[RestaurantPublicResponse],
    summary="Get all restaurants",
    description="Retrieve a list of all available restaurants"
)
def get_restaurants_endpoint(
    pagination: dict = Depends(get_pagination_params),
    service: RestaurantService = Depends()
):
    return service.get_restaurants(**pagination)

@router.get(
    "/my",
    response_model=PaginatedResponse[RestaurantPublicResponse],
    summary="Get restaurants managed by specific user",
    description="Retrieve a list of available restaurants managed by specific user"
)
def get_restaurants_endpoint(
    pagination: dict = Depends(get_pagination_params),
    service: RestaurantService = Depends(), 
    current_user: AppUser = Depends(get_current_user)
):
    return service.get_restaurants_for_user(current_user.user_id, **pagination)

@router.get(
    "/{restaurant_id}",
    summary="Get specific restaurant details",
    description="Get information about specific restaurant",
    response_model=SingleRestaurantPublicResponse
)
def get_restaurant_endpoint(restaurant_id: int, service: RestaurantService = Depends()):
    return service.get_restaurant(restaurant_id)

@router.get(
    "/{restaurant_id}/menu",
    summary="Get specific restaurant menu",
    description="Retrieve a list of all available menu ites for specific restaurant",
    response_model=PaginatedResponse[MenuItemResponse]
)
def get_menu_endpoint(
    restaurant_id: int, 
    pagination: dict = Depends(get_pagination_params),
    service: MenuService = Depends()
):
    return service.get_menu_for_restaurant(restaurant_id, **pagination)

@router.post(
    "/{restaurant_id}/tables",
    summary="Create new table",
    response_model=TableResponse
)
def post_table_endpoint(restaurant_id: int, table_data: TableCreate, service: TableService = Depends()):
    return service.create_new_table(restaurant_id, table_data)

@router.get(
    "/{restaurant_id}/tables",
    summary="Get tables",
    response_model=PaginatedResponse[TableResponse]
)
def get_tables_endpoint(
    restaurant_id: int, 
    pagination: dict = Depends(get_pagination_params),
    service: TableService = Depends()
):
    return service.get_tables_for_restaurant(restaurant_id, **pagination)
