from tests.utils import create_menu


class TestMenuDataflow:

    def test_get_menu_for_restaurant_flow(self, client, db):
        create_menu(db)

        response = client.get("/api/restaurants/1/menu")

        assert response.status_code == 200

        data = response.json()        
        assert isinstance(data, list)

        if len(data) > 0:
            first_restaurant = data[0]
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
        assert data["detail"] == "No menu found for restaurant id=100"
