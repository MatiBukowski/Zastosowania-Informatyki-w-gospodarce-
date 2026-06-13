from tests.utils import create_menu, create_restaurants


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

    def test_patch_menu_item_flow(self, client, db):
        restaurant = create_restaurants(db)
        restaurant_id = restaurant.restaurant_id

        menu = create_menu(db)
        menu_item_id = menu[0].menu_item_id

        update_payload = {
            "name": "new_name",
            "description": "new_description",
            "price": 25.0
        }

        response = client.patch(
            f"/api/restaurants/{restaurant_id}/menu/{menu_item_id}", 
            json=update_payload
        )

        assert response.status_code == 200
        
        data = response.json()
        assert data["name"] == update_payload["name"]
        assert data["description"] == update_payload["description"]
        assert float(data["price"]) == update_payload["price"]

    def test_patch_menu_item_not_found_flow(self, client, db):
        update_payload = {"name": "new_name"}

        response = client.patch("/api/restaurants/1/menu/9999999999", json=update_payload)

        assert response.status_code == 404
        
        data = response.json()
        assert data["detail"] == "Menu item with id=9999999999 not found"
