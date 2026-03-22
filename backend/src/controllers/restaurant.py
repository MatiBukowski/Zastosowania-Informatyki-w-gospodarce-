from fastapi import APIRouter, Depends
from ..services import RestaurantService, MenuService, TableService
from ..schemas import (
    RestaurantPublicResponse,
    MenuItemResponse,
    MenuItemCreate,
    MenuItemUpdate,
    TableResponse,
    TableCreate,
    TableUpdate
)

router = APIRouter(prefix="/restaurants")

@router.get("", response_model=list[RestaurantPublicResponse])
def get_restaurants_endpoint(service: RestaurantService = Depends()):
    return service.get_restaurants()

@router.get("/{restaurant_id}", response_model=RestaurantPublicResponse)
def get_restaurant_endpoint(restaurant_id: int, service: RestaurantService = Depends()):
    return service.get_restaurant(restaurant_id)

@router.get("/{restaurant_id}/menu", response_model=list[MenuItemResponse])
def get_menu_endpoint(restaurant_id: int, service: MenuService = Depends()):
    return service.get_menu_for_restaurant(restaurant_id)

@router.post("/{restaurant_id}/menu", response_model=MenuItemResponse)
def create_menu_endpoint(restaurant_id: int, menu_item_data: MenuItemCreate, service: MenuService = Depends()):
    return service.create_menu_item(restaurant_id, menu_item_data)

@router.patch("/{restaurant_id}/menu/{menu_item_id}", response_model=MenuItemResponse)
def update_menu_endpoint(restaurant_id: int, menu_item_id: int, menu_item_data: MenuItemUpdate, service: MenuService = Depends()):
    return service.update_menu_item(restaurant_id, menu_item_id, menu_item_data)

@router.get("/{restaurant_id}/tables", response_model=list[TableResponse])
def get_table_endpoint(restaurant_id: int, service: TableService = Depends()):
    return service.get_tables_for_restaurant(restaurant_id)

@router.post("/{restaurant_id}/tables", response_model=TableResponse)
def post_table_endpoint(restaurant_id: int, table_data: TableCreate, service: TableService = Depends()):
    return service.create_new_table(restaurant_id, table_data)

@router.patch("/{restaurant_id}/tables/{table_id}", response_model=TableResponse)
def update_table_endpoint(restaurant_id: int, table_id: int, table_data: TableUpdate, service: TableService = Depends()):
    return service.update_existing_table(restaurant_id, table_id, table_data)


