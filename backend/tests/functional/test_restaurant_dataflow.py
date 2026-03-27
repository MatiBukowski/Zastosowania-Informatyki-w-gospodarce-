from tests.utils import create_restaurants


class TestRestaurantDataflow:

    def test_get_all_restaurants_flow(self, client, db):
        create_restaurants(db)

        response = client.get("/api/restaurants")

        assert response.status_code == 200

        data = response.json()        
        assert isinstance(data, list)

        if len(data) > 0:
            first_restaurant = data[0]
            print(first_restaurant)
            assert "restaurant_id" in first_restaurant
            assert "name" in first_restaurant
            assert "address" in first_restaurant
            assert "has_kiosk" in first_restaurant
            assert "cuisine" in first_restaurant
            assert "photo" in first_restaurant

    def test_get_restaurant_flow(self, client, db):
        create_restaurants(db)

        response = client.get("/api/restaurants/1")

        assert response.status_code == 200

        data = response.json()
        assert isinstance(data, dict)

        assert data["restaurant_id"] == 1
        assert data["name"] == "Test Restaurant"
        assert "address" in data
        assert "has_kiosk" in data
        assert "cuisine" in data
        assert "photo" in data
        assert "description" in data

    def test_get_restaurant_not_found_flow(self, client, db):
        create_restaurants(db)

        response = client.get("/api/restaurants/100")

        data = response.json()
        assert data["detail"] == "Restaurant with id=100 not found"
