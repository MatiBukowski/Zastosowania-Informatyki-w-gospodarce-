from fastapi import APIRouter, Depends, Request, Query

from ..schemas import (
    RestaurantPublicResponse,
    SingleRestaurantPublicResponse,
    MenuItemResponse,
    TableResponse,
    TableCreate,
    PaginatedResponse,
    RestaurantFilterQuery,
    UpdateSingleRestaurante
)
from ..services import RestaurantService, MenuService, TableService
from ..models import AppUser
from ..auth import get_current_user
from ..schemas.pagination import get_pagination_params
from ..middleware.rate_limit import limiter

router = APIRouter(prefix="/restaurants", tags=["Restaurants"])


def get_restaurant_filter_query(
    cuisine: list[str] | None = Query(None),
) -> RestaurantFilterQuery:
    return RestaurantFilterQuery(cuisine=cuisine)


@router.get(
    "",
    response_model=PaginatedResponse[RestaurantPublicResponse],
    summary="Get all restaurants",
    description="Retrieve a list of all available restaurants"
)
def get_restaurants_endpoint(
    pagination: dict = Depends(get_pagination_params),
    search: str = Query(None),
    filters: RestaurantFilterQuery = Depends(get_restaurant_filter_query),
    service: RestaurantService = Depends()
):
    return service.get_restaurants(**pagination, search=search, filters=filters)


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

@router.patch(
    "/{restaurant_id}",
    summary="Update specific restaurant details",
    description="Update information about specific restaurant",
    response_model=UpdateSingleRestaurante
)
def patch_restaurant_endpoint(restaurant_id: int, restaurant_data: UpdateSingleRestaurante, service: RestaurantService = Depends()):
    return service.patch_restaurant(restaurant_id, restaurant_data)

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
@limiter.limit("2/minute")
def post_table_endpoint(request: Request, restaurant_id: int, table_data: TableCreate, service: TableService = Depends()):
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
