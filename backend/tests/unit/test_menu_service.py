import pytest
from unittest.mock import MagicMock
from fastapi import HTTPException, status
from src.services.menu import MenuService


class TestMenuService:

    def test_get_menu_for_restaurant_success(self):
        mock_repo = MagicMock()

        test_data = [
            {
                "menu_item_id": 1,
                "name": "Pizza Margherita",
                "description": "Breaded fried chicken with waffles. Served with maple syrup",
                "price": 24.99,
                "is_available": True
            },
            {
                "menu_item_id": 2,
                "name": "Chicken wings",
                "description": "28-day aged 300g USDA Certified Prime Ribeye, rosemary-thyme garlic butter, with choice of two sides",
                "price": 188.39,
                "is_available": True
            }
        ]
        mock_repo.get_menu_list_for_restaurant.return_value = test_data
        service = MenuService(repo=mock_repo)
        result = service.get_menu_for_restaurant(restaurant_id=1)

        assert result == test_data
        assert result[0]["name"] == "Pizza Margherita"
        assert result[1]["description"] == "28-day aged 300g USDA Certified Prime Ribeye, rosemary-thyme garlic butter, with choice of two sides"
        assert result[1]["price"] == 188.39
        mock_repo.get_menu_list_for_restaurant.assert_called_once_with(1)

    def test_get_menu_for_restaurant_error(self):
        mock_repo = MagicMock()

        mock_repo.get_menu_list_for_restaurant.return_value = None
        service = MenuService(repo=mock_repo)

        with pytest.raises(HTTPException) as exception:
            service.get_menu_for_restaurant(restaurant_id=1)

        assert exception.value.status_code == status.HTTP_404_NOT_FOUND
        assert "No menu found for restaurant id=1" in exception.value.detail
        mock_repo.get_menu_list_for_restaurant.assert_called_once_with(1)
