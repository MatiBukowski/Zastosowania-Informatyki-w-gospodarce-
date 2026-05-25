from tests.utils import (
    create_restaurants,
    create_user,
    assign_user_to_restaurant
)


class TestRestaurantDataflow:

    def test_get_all_restaurants_flow(self, client, db):
        create_restaurants(db)

        response = client.get("/api/restaurants")

        assert response.status_code == 200

        data = response.json()        
        assert isinstance(data["items"], list)

        if len(data["items"]) > 0:
            first_restaurant = data["items"][0]
            assert "restaurant_id" in first_restaurant
            assert "name" in first_restaurant
            assert "city" in first_restaurant
            assert "street" in first_restaurant
            assert "building_number" in first_restaurant
            assert "postal_code" in first_restaurant
            assert "phone_number" in first_restaurant
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
        assert "city" in data
        assert "street" in data
        assert "building_number" in data
        assert "postal_code" in data
        assert "phone_number" in data
        assert "has_kiosk" in data
        assert "cuisine" in data
        assert "photo" in data
        assert "description" in data

    def test_get_restaurant_not_found_flow(self, client, db):
        create_restaurants(db)

        response = client.get("/api/restaurants/100")

        data = response.json()
        assert data["detail"] == "Restaurant with id=100 not found"
    
    def test_get_my_restaurants_flow(self, client, db):
        user = create_user(db)
        restaurant = create_restaurants(db)

        assign_user_to_restaurant(db, user_id=user.user_id, restaurant_id=restaurant.restaurant_id)

        login_data = {"email": user.email, "password": "password123"}
        login_response = client.post("/api/auth/login", json=login_data)
        token = login_response.json()["access_token"]

        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/restaurants/my", headers=headers)

        assert response.status_code == 200

        data = response.json()
        assert isinstance(data["items"], list)
        assert len(data["items"]) == 1
        assert data["items"][0]["restaurant_id"] == restaurant.restaurant_id
        assert data["items"][0]["name"] == restaurant.name
