from unittest.mock import MagicMock
from src.services.restaurant import RestaurantService


class TestRestaurantService:
    
    def test_get_restaurants(self):
        mock_repo = MagicMock()

        test_data = [
            {"restaurant_id": 1, "name": "Pizza Mario", "address": "ul. Rynek 30, Wrocław", "has_kiosk": True, "cuisine": "ITALIAN", "photo": "photo1_url"},
            {"restaurant_id": 2, "name": "Kebab King", "address": "ul. Rynek 10, Wrocław", "has_kiosk": False, "cuisine": "OTHER", "photo": None}
        ]
        mock_repo.get_restaurants_list.return_value = test_data
        service = RestaurantService(repo=mock_repo)
        result = service.get_restaurants()

        assert result == test_data
        assert len(result) == 2
        assert result[0]["name"] == "Pizza Mario"
        mock_repo.get_restaurants_list.assert_called_once()
