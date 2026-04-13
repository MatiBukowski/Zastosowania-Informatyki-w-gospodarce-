1. **GET /api/restaurants**
    * Returns a list: List[{"restaurant_id", "name", "address", "has_kiosk", "cuisine", "photo"}]
        * Proposed schema name:  **"RestaurantPublicResponse"**

2. **GET /api/restaurants/{restaurant_id}**
    * Returns: {"restaurant_id", "name", "address", "has_kiosk", "cuisine", "photo", "description"}
        * Proposed schema name:  **"SingleRestaurantPublicResponse"**
     
3. **GET /api/restaurants/{restaurant_id}/menu**
    * Returns: {"menu_item_id", "name", "description", "price", "is_available"}
        * Proposed schema name:  **"MenuItemResponse"**

4. **GET /api/restaurants/{restaurant_id}/tables**
    * Returns a list: List[{"table_id", "restaurant_id", "table_number", "capacity", "status", "qr_code_token"}]
        * Proposed schema name: **"RestaurantTableResponse"**

5. **GET /api/restaurants/{restaurant_id}/tables/{table_id}/reservations**
    * Returns a list: List[{"reservation_id", "user_id", "restaurant_id", "table_id", "reservation_time", "status"}]
        * Proposed schema name: **"ReservationPublicResponse"**
