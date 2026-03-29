import pytest
from unittest.mock import MagicMock
from fastapi import HTTPException, status
from src.services.restaurant import RestaurantService


class TestRestaurantService:
    
    def test_get_restaurants(self):
        mock_repo = MagicMock()

        test_data = [
            {"restaurant_id": 1, "name": "Pizza Mario", "address": "ul. Rynek 30, Wrocław", "has_kiosk": True, "cuisine": "ITALIAN", "photo": "photo1_url", "description": "description1"},
            {"restaurant_id": 2, "name": "Kebab King", "address": "ul. Rynek 10, Wrocław", "has_kiosk": False, "cuisine": "OTHER", "photo": None, "description": "description2"}
        ]
        mock_repo.get_restaurants_list.return_value = test_data
        service = RestaurantService(repo=mock_repo)
        result = service.get_restaurants()

        assert result == test_data
        assert len(result) == 2
        assert result[0]["name"] == "Pizza Mario"
        assert result[0]["description"] == "description1"
        mock_repo.get_restaurants_list.assert_called_once()

    def test_get_restaurant_success(self):
        mock_repo = MagicMock()

        test_data = {"restaurant_id": 1, "name": "Pizza Mario", "address": "ul. Rynek 30, Wrocław", "has_kiosk": True, "cuisine": "ITALIAN", "photo": "photo1_url", "description": "description1"}
        mock_repo.get_restaurant_by_id.return_value = test_data
        service = RestaurantService(repo=mock_repo)
        result = service.get_restaurant(restaurant_id=1)

        assert result == test_data
        assert result["name"] == "Pizza Mario"
        assert result["description"] == "description1"
        mock_repo.get_restaurant_by_id.assert_called_once_with(1)

    def test_get_restaurant_error(self):
        mock_repo = MagicMock()

        mock_repo.get_restaurant_by_id.return_value = None
        service = RestaurantService(repo=mock_repo)

        with pytest.raises(HTTPException) as exception:
            service.get_restaurant(restaurant_id=1)

        assert exception.value.status_code == status.HTTP_404_NOT_FOUND
        assert "Restaurant with id=1 not found" in exception.value.detail
        mock_repo.get_restaurant_by_id.assert_called_once_with(1)
