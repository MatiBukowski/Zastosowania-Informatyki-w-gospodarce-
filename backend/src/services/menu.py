from fastapi import Depends, HTTPException, status
from ..repositories import MenuRepository


class MenuService:
    def __init__(self, repo: MenuRepository = Depends()):
        self.repo = repo

    def get_menu_for_restaurant(self, restaurant_id: int):
        menu_items = self.repo.get_menu_list_for_restaurant(restaurant_id)
        if not menu_items:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"No menu found for restaurant id={restaurant_id}"
            )
        return menu_items
