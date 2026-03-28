from tests.utils import create_restaurants


class TestRestaurantDataflow:

    def test_get_all_restaurants_flow(self, client, db):
        create_restaurants(db)

        response = client.get("/api/restaurants")

        assert response.status_code == 200
        
        data = response.json()        
        assert isinstance(data, list)
        print(len(data))
        if len(data) > 0:
            first_restaurant = data[0]
            
            assert "restaurant_id" in first_restaurant
            assert "name" in first_restaurant
            assert "address" in first_restaurant
            assert "has_kiosk" in first_restaurant
            assert "cuisine" in first_restaurant
            assert "photo" in first_restaurant
