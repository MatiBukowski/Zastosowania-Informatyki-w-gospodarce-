import math
from fastapi import Depends, HTTPException, status
from ..repositories import MenuRepository
from ..schemas import PaginatedResponse, MenuItemCreate, MenuItemResponse


class MenuService:
    def __init__(self, repo: MenuRepository = Depends()):
        self.repo = repo

    def get_menu_for_restaurant(self, restaurant_id: int, skip: int = 0, limit: int = 10, page: int = 1, size: int = 10):
        items, total = self.repo.get_menu_list_for_restaurant(restaurant_id, skip, limit)
        return PaginatedResponse(
            items=items,
            total=total,
            page=page,
            size=size,
            pages=math.ceil(total / size) if size > 0 else 1
        )

    def post_new_menu_item(self, restaurant_id: int, menu_item: MenuItemCreate) -> MenuItemResponse:
        menu_item_data = menu_item.model_dump()
        menu_item_data["restaurant_id"] = restaurant_id
        
        return self.repo.post_menu_item(menu_item_data)
