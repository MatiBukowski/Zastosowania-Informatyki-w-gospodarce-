1. **GET /api/restaurants**
   - Returns a list: List[{"restaurant_id", "name", "address", "has_kiosk", "cuisine", "photo"}]
     - Proposed schema name: **"RestaurantPublicResponse"**

2. **GET /api/restaurants/{restaurant_id}**
   - Returns: {"restaurant_id", "name", "address", "has_kiosk", "cuisine", "photo", "description"}
     - Proposed schema name: **"SingleRestaurantPublicResponse"**

3. **GET /api/restaurants/{restaurant_id}/menu**
   - Returns: {"menu_item_id", "name", "description", "price", "is_available"}
     - Proposed schema name: **"MenuItemResponse"**

4. **POST /api/restaurants/{restaurant_id}/tables**
   - Returns: {"table_id", "restaurant_id", "table_number", "capacity", "qr_code_token", "status"}
     - Proposed schema name: **"TableResponse"**

5. **PATCH /api/tables/{table_id}**
   - Returns: {"table_id", "restaurant_id", "table_number", "capacity", "qr_code_token", "status"}
     - Proposed schema name: **"TableResponse"**

6. **PATCH /api/tables/{table_id}/regenerate-qr-code**
   - Returns: {"table_id", "restaurant_id", "table_number", "capacity", "qr_code_token", "status"}
     - Proposed schema name: **"TableResponse"**

7. **GET /api/tables/resolve/{token}**
   - Returns: {"table_id", "restaurant_id", "table_number", "capacity", "qr_code_token", "status"}
     - Proposed schema name: **"TableResponse"**

8. **GET /api/restaurants/{restaurant_id}/tables**
   - Returns a list: List[{"table_id", "restaurant_id", "table_number", "capacity", "qr_code_token", "status"}]
     - Proposed schema name: **"TableResponse"**

9. **GET /api/tables/{table_id}/reservation**
   - Returns a list: List[{"reservation_id", "restaurant_id", "table_id", "user_id", "reservation_time", "status"}]
     - Proposed schema name: **"ReservationResponse"**

10. **POST /api/tables/{table_id}/reservation**
    - Returns: {"reservation_id", "restaurant_id", "table_id", "user_id", "reservation_time", "status"}
      - Proposed schema name: **"ReservationResponse"**

11. **GET /api/reservations/{reservation_id}**
    - Returns: {"reservation_id", "restaurant_id", "table_id", "user_id", "reservation_time", "status"}
      - Proposed schema name: **"ReservationResponse"**

12. **PATCH /api/reservations/{reservation_id}**
    - Returns: {"reservation_id", "restaurant_id", "table_id", "user_id", "reservation_time", "status"}
      - Proposed schema name: **"ReservationResponse"**

13. **POST /api/auth/register/{user}**
    - Returns: {"access_token"} with HTTP only cookie with refresh token in it set.

14. **POST /api/auth/login/{user}**
    - Returns: {"access_token"} with HTTP only cookie with refresh token in it set.

15. **POST /api/auth/refresh**
    - Returns: {"access_token"}

16. **POST /api/auth/logout**
    - Returns empty HTTP only cookie
