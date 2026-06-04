from tests.utils import create_menu


class TestMenuDataflow:

    def test_get_menu_for_restaurant_flow(self, client, db):
        create_menu(db)

        response = client.get("/api/restaurants/1/menu")

        assert response.status_code == 200

        data = response.json()        
        assert isinstance(data["items"], list)

        if len(data["items"]) > 0:
            first_restaurant = data["items"][0]
            assert "menu_item_id" in first_restaurant
            assert "restaurant_id" not in first_restaurant
            assert "name" in first_restaurant
            assert "description" in first_restaurant
            assert "price" in first_restaurant
            assert "is_available" in first_restaurant

    def test_get_menu_for_restaurant_not_found_flow(self, client, db):
        create_menu(db)

        response = client.get("/api/restaurants/100/menu")

        data = response.json()
        assert data["items"] == []

    def test_post_new_menu_item_flow_success(self, client, db):
        create_menu(db)

        payload = {
            "name": "Burger",
            "price": 35.55,
            "description": "test description"
        }

        response = client.post("/api/restaurants/1/menu", json=payload)

        assert response.status_code == 200 

        data = response.json()
        
        assert "menu_item_id" in data
        assert data["name"] == payload["name"]
        assert float(data["price"]) == payload["price"]
        assert data["description"] == payload["description"]

    def test_post_new_menu_item_validation_error_flow(self, client, db):
        create_menu(db)

        bad_payload = {
            "name": "name"
        }

        response = client.post("/api/restaurants/1/menu", json=bad_payload)

        assert response.status_code == 422
