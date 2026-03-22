from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from ..models import MenuItem
from ..schemas import MenuItemCreate, MenuItemUpdate
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
    
    def create_menu_item(self, restaurant_id: int, data: MenuItemCreate):
        data_dict = data.model_dump()
        new_item = MenuItem(**data_dict, restaurant_id=restaurant_id)
        return self.repo.create_item(new_item)
    
    def update_menu_item(self, restaurant_id: int, menu_item_id: int, data: MenuItemUpdate):     
        db_item = self.repo.get_menu_item_by_id(menu_item_id, restaurant_id)
        if not db_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, 
                detail="Menu item doesn't exist"
            )

        update_data = data.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_item, key, value) 
        
        return self.repo.update_item(db_item)