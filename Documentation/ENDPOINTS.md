1. **GET /api/restaurants**
    * Returns a list: List[{"restaurant_id", "name", "address", "has_kiosk", "cuisine", "photo"}]
        * Proposed schema name:  **"RestaurantPublicResponse"**

2. **GET /api/restaurant/{restaurant_id}**
    * Returns: {"restaurant_id", "name", "address", "has_kiosk", "cuisine", "photo", "description"}
        * Proposed schema name:  **"SingleRestaurantPublicResponse"**
     
3. **GET /api/restaurant/{restaurant_id}/menu**
    * Returns: {"menu_item_id", "name", "description", "price", "is_available"}
        * Proposed schema name:  **"MenuItemResponse"**
