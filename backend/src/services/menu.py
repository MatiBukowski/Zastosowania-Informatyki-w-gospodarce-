import math
from fastapi import Depends, HTTPException, status
from ..repositories import MenuRepository
from ..schemas import PaginatedResponse, MenuItemCreate, MenuItemResponse, MenuItemUpdate


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

    def update_menu_item(self, menu_item_id: int, menu_item_data: MenuItemUpdate) -> MenuItemResponse:
        existing_menu_item = self.repo.get_menu_item_by_id(menu_item_id)
        if not existing_menu_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Menu item with id={menu_item_id} not found"
            )

        if isinstance(menu_item_data, dict):
            updated_menu_item_data = menu_item_data
        else:
            updated_menu_item_data = menu_item_data.model_dump(exclude_unset=True)

        for key, value in updated_menu_item_data.items():
            setattr(existing_menu_item, key, value)

        return self.repo.patch_menu_item(existing_menu_item)
