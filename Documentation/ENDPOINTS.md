1. **GET /api/restaurants**
   - Returns a list: List[{"restaurant_id", "name", "city", "street", "building_number", "postal_code", "phone_number", "has_kiosk", "cuisine", "photo", "schedules"}]
     - Proposed schema name: **"RestaurantPublicResponse"**
     - schedules -> List["day_of_week", "open_time", "close_time"]

2. **GET /api/restaurants/my**
   - Returns a list: List[{"restaurant_id", "name", "city", "street", "building_number", "postal_code", "phone_number", "has_kiosk", "cuisine", "photo", "schedules"}]
     - Proposed schema name: **"RestaurantPublicResponse"**
     - schedules -> List["day_of_week", "open_time", "close_time"]

3. **GET /api/restaurants/{restaurant_id}**
   - Returns: {"restaurant_id", "name", "city", "street", "building_number", "postal_code", "phone_number", "has_kiosk", "cuisine", "photo", "description", "schedules"}
     - Proposed schema name: **"SingleRestaurantPublicResponse"**
     - schedules -> List["day_of_week", "open_time", "close_time"]

4. **PATCH /api/restaurants/{restaurant_id}**
   - Returns: {"name", "city", "street", "building_number", "postal_code", "phone_number", "has_kiosk", "cuisine", "photo", "description", "schedules"}
     - Proposed schema name: **"UpdateSingleRestaurant"**

5. **GET /api/restaurants/{restaurant_id}/menu**
   - Returns: {"menu_item_id", "name", "description", "price", "is_available"}
     - Proposed schema name: **"MenuItemResponse"**

6. **POST /api/restaurants/{restaurant_id}/tables**
   - Returns: {"table_id", "restaurant_id", "table_number", "capacity", "qr_code_token", "status"}
     - Proposed schema name: **"TableResponse"**

7. **PATCH /api/tables/{table_id}**
   - Returns: {"table_id", "restaurant_id", "table_number", "capacity", "qr_code_token", "status"}
     - Proposed schema name: **"TableResponse"**

8. **PATCH /api/tables/{table_id}/regenerate-qr-code**
   - Returns: {"table_id", "restaurant_id", "table_number", "capacity", "qr_code_token", "status"}
     - Proposed schema name: **"TableResponse"**

9. **GET /api/tables/resolve/{token}**
   - Returns: {"table_id", "restaurant_id", "table_number", "capacity", "qr_code_token", "status"}
     - Proposed schema name: **"TableResponse"**

10. **GET /api/restaurants/{restaurant_id}/tables**
   - Returns a list: List[{"table_id", "restaurant_id", "table_number", "capacity", "qr_code_token", "status"}]
     - Proposed schema name: **"TableResponse"**

11. **GET /api/tables/{table_id}/reservation**
   - Returns a list: List[{"reservation_id", "restaurant_id", "table_id", "user_id", "reservation_time", "status"}]
     - Proposed schema name: **"ReservationResponse"**

12. **POST /api/tables/{table_id}/reservation**
    - Returns: {"reservation_id", "restaurant_id", "table_id", "user_id", "reservation_time", "status"}
      - Proposed schema name: **"ReservationResponse"**

13. **GET /api/reservations/{reservation_id}**
    - Returns: {"reservation_id", "restaurant_id", "table_id", "user_id", "reservation_time", "status"}
      - Proposed schema name: **"ReservationResponse"**

14. **PATCH /api/reservations/{reservation_id}**
    - Returns: {"reservation_id", "restaurant_id", "table_id", "user_id", "reservation_time", "status"}
      - Proposed schema name: **"ReservationResponse"**

15. **POST /api/auth/register/{user}**
    - Returns: {"access_token"} with HTTP only cookie with refresh token in it set.

16. **POST /api/auth/login/{user}**
    - Returns: {"access_token"} with HTTP only cookie with refresh token in it set.

17. **POST /api/auth/refresh**
    - Returns: {"access_token"}

18. **POST /api/auth/logout**
    - Returns empty HTTP only cookie

19. **GET /api/support/info**
    - Returns: {"contact_email", "onboarding_steps": string[]}

12. **POST /api/support/contact**
    - Body: {"name", "email", "request_type", "message", "restaurant_name"?, "source"?}
    - Returns: {"message"}

20. **POST /api/orders**
    - Returns: {"order_id", "restaurant_id", "user_id", "table_id", "reservation_id", "order_source", "status", "total_amount", "created_at", "items"}

21. **GET /api/orders/my**
    - Returns a list: List[{"order_id", "restaurant_id", "user_id", "table_id", "reservation_id", "order_source", "status", "total_amount", "created_at", "items"}]

22. **GET /api/orders/restaurant/{restaurant_id}**
    - Returns a list: List[{"order_id", "restaurant_id", "user_id", "table_id", "reservation_id", "order_source", "status", "total_amount", "created_at", "items"}]

23. **GET /api/orders/{order_id}**
    - Returns: {"order_id", "restaurant_id", "user_id", "table_id", "reservation_id", "order_source", "status", "total_amount", "created_at", "items"}

24. **PATCH /api/orders/{order_id}**
    - Returns: {"order_id", "restaurant_id", "user_id", "table_id", "reservation_id", "order_source", "status", "total_amount", "created_at", "items"}

25. **PATCH /api/orders/{order_id}/cancel**
    - Returns: {"order_id", "restaurant_id", "user_id", "table_id", "reservation_id", "order_source", "status", "total_amount", "created_at", "items"}