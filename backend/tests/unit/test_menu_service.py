import pytest
from unittest.mock import MagicMock
from fastapi import HTTPException, status
from src.services import MenuService


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
        mock_repo.get_menu_list_for_restaurant.return_value = (test_data, len(test_data))
        service = MenuService(repo=mock_repo)
        result = service.get_menu_for_restaurant(restaurant_id=1)

        assert result.items == test_data
        assert result.items[0]["name"] == "Pizza Margherita"
        assert result.items[1]["description"] == "28-day aged 300g USDA Certified Prime Ribeye, rosemary-thyme garlic butter, with choice of two sides"
        assert result.items[1]["price"] == 188.39
        mock_repo.get_menu_list_for_restaurant.assert_called_once_with(1, 0, 10)

    def test_get_menu_for_restaurant_empty(self):
        mock_repo = MagicMock()

        mock_repo.get_menu_list_for_restaurant.return_value = ([], 0)
        service = MenuService(repo=mock_repo)

        result = service.get_menu_for_restaurant(restaurant_id=1)

        assert result.items == []
        assert result.total == 0
        mock_repo.get_menu_list_for_restaurant.assert_called_once_with(1, 0, 10)

    def test_post_new_menu_item_success(self):
        mock_repo = MagicMock()
        service = MenuService(repo=mock_repo)

        test_restaurant_id = 1
        
        mock_menu_item = MagicMock()
        mock_menu_item.model_dump.return_value = {
            "name": "Spaghetti",
            "price": 35.0,
            "description": "test description"
        }

        expected_response = {
            "restaurant_id": test_restaurant_id,
            "name": "Spaghetti",
            "price": 35.0,
            "description": "test description"
        }
        mock_repo.post_menu_item.return_value = expected_response

        result = service.post_new_menu_item(
            restaurant_id=test_restaurant_id, 
            menu_item=mock_menu_item
        )

        assert result == expected_response

        mock_repo.post_menu_item.assert_called_once_with({
            "name": "Spaghetti",
            "price": 35.0,
            "description": "test description",
            "restaurant_id": test_restaurant_id
        })

    def test_post_new_menu_item_error(self):
        mock_repo = MagicMock()
        service = MenuService(repo=mock_repo)

        test_restaurant_id = 99999999

        mock_menu_item = MagicMock()
        mock_menu_item.model_dump.return_value = {
            "name": "Spaghetti",
            "price": 35.0,
            "description": "test description"
        }

        mock_repo.post_menu_item.side_effect = HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="Restaurant not found"
        )

        with pytest.raises(HTTPException) as exc_info:
            service.post_new_menu_item(
                restaurant_id=test_restaurant_id, 
                menu_item=mock_menu_item
            )

        assert exc_info.value.status_code == status.HTTP_404_NOT_FOUND
        assert exc_info.value.detail == "Restaurant not found"

        mock_repo.post_menu_item.assert_called_once_with({
            "name": "Spaghetti",
            "price": 35.0,
            "description": "test description",
            "restaurant_id": 99999999
        })
