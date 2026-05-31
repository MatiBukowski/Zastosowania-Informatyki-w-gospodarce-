import pytest
from unittest.mock import MagicMock
from fastapi import HTTPException, status
from src.services import RestaurantService
from src.models import Restaurant, RestaurantSchedule


class TestRestaurantService:
    
    test_data = [
        {"name":"Pizza Mario","city":"Kraków","street":"Włoska",
         "building_number":"1","postal_code":"30-001","phone_number":"123456789","has_kiosk":True,
         "cuisine":"ITALIAN","photo":"https://minio.xederro.tech/prod/restaurant/0.jpg","schedules":[{"day_of_week":"MONDAY","open_time":"08:00:00",
         "close_time":"15:00:00"},{"day_of_week":"TUESDAY","open_time":"08:00:00","close_time":"15:00:00"},{"day_of_week":"WEDNESDAY","open_time":"08:00:00",
         "close_time":"15:00:00"},{"day_of_week":"THURSDAY","open_time":"08:00:00","close_time":"15:00:00"},{"day_of_week":"FRIDAY","open_time":"08:00:00",
         "close_time":"19:00:00"},{"day_of_week":"SATURDAY","open_time":"10:00:00","close_time":"17:00:00"},{"day_of_week":"SUNDAY","open_time":"12:00:00",
         "close_time":"15:00:00"}],"restaurant_id":1,"description":"description1"}, 

         {"name":"Kebab King","city":"Kraków","street":"Włoska",
         "building_number":"1","postal_code":"30-001","phone_number":"123456789","has_kiosk":True,
         "cuisine":"ITALIAN","photo":"https://minio.xederro.tech/prod/restaurant/0.jpg","schedules":[{"day_of_week":"MONDAY","open_time":"08:00:00",
         "close_time":"15:00:00"},{"day_of_week":"TUESDAY","open_time":"08:00:00","close_time":"15:00:00"},{"day_of_week":"WEDNESDAY","open_time":"08:00:00",
         "close_time":"15:00:00"},{"day_of_week":"THURSDAY","open_time":"08:00:00","close_time":"15:00:00"},{"day_of_week":"FRIDAY","open_time":"08:00:00",
         "close_time":"19:00:00"},{"day_of_week":"SATURDAY","open_time":"10:00:00","close_time":"17:00:00"},{"day_of_week":"SUNDAY","open_time":"12:00:00",
         "close_time":"15:00:00"}],"restaurant_id":2,"description":"description2"}
    ]

    def test_get_restaurants(self):
        mock_repo = MagicMock()

        mock_repo.get_restaurants.return_value = (self.test_data, len(self.test_data))
        service = RestaurantService(repo=mock_repo)
        result = service.get_restaurants()

        assert result.items == self.test_data
        assert len(result.items) == 2
        assert result.items[0]["name"] == "Pizza Mario"
        assert result.items[0]["description"] == "description1"
        assert result.items[0]["schedules"][0]["day_of_week"] == "MONDAY"
        mock_repo.get_restaurants.assert_called_once()

    def test_get_restaurant_success(self):
        mock_repo = MagicMock()

        mock_repo.get_restaurant_by_id.return_value = self.test_data[0]
        service = RestaurantService(repo=mock_repo)
        result = service.get_restaurant(restaurant_id=1)

        assert result == self.test_data[0]
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

    def test_get_restaurants_for_user(self):
        mock_repo = MagicMock()

        mock_repo.get_restaurants_by_user_id.return_value = (self.test_data, len(self.test_data))
        service = RestaurantService(repo=mock_repo)
        user_id = 5

        result = service.get_restaurants_for_user(user_id)

        assert result.items == self.test_data
        assert len(result.items) == 2
        assert result.items[0]["name"] == "Pizza Mario"
        assert result.items[0]["description"] == "description1"
        mock_repo.get_restaurants_by_user_id.assert_called_once()

    def test_patch_restaurant_success(self):
        mock_repo = MagicMock()

        mock_repo.update_restaurant.return_value = self.test_data[1]

        service = RestaurantService(repo=mock_repo)
        restaurant_id = 1
        restaurant_data = self.test_data[1]
        schedules_data = restaurant_data.pop("schedules", [])
        
        test_restaurant = Restaurant(**restaurant_data)
        test_restaurant.schedules = [RestaurantSchedule(restaurant_id = restaurant_id, **sched_dict) for sched_dict in schedules_data]
        mock_repo.get_restaurant_by_id.return_value = test_restaurant

        result = service.patch_restaurant(restaurant_id, restaurant_data)

        assert result == self.test_data[1]
        assert result["name"] == "Kebab King"
        assert result["description"] == "description2"
        mock_repo.get_restaurant_by_id.assert_called_once_with(restaurant_id)
        mock_repo.update_restaurant.assert_called_once()
