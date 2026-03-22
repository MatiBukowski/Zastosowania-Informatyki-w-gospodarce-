**GET /restaurants**
* Zwraca liste: List[{"restaurant_id", "name", "address", "has_kiosk"}]

**GET /restaurants/{restaurant_id}**
* Zwraca: {"restaurant_id", "name", "address", "has_kiosk"}

**GET /restaurants/{restaurant_id}/menu**
* Zwraca liste: List[{"menu_item_id", "restaurant_id", "name", "description", "price", "is_available"}]

**POST /restaurants/{restaurant_id}/menu**
* Przyjmuje: {"name", "description", "price", "is_available"}
* Zwraca: {"menu_item_id", "restaurant_id", "name", "description", "price", "is_available"}

**PATCH /restaurants/{restaurant_id}/menu/{menu_item_id}**
* Przyjmuje: {"name?", "description?", "price?", "is_available?"}
* Zwraca: {"menu_item_id", "restaurant_id", "name", "description", "price", "is_available"}	

**GET /restaurants/{restaurant_id}/tables**
* Zwraca liste: List[{"table_id", "restaurant_id", "table_number", "capacity", "qr_code_token", "status"}]

**POST /restaurants/{restaurant_id}/tables**
* Przyjmuje: {"table_number", "capacity", "qr_code_token", status"}
* Zwraca: {"table_id", "restaurant_id", "table_number", "capacity", "qr_code_token", "status"}

**PATCH /restaurants/{restaurant_id}/tables/{table_id}**
* Przyjmuje: {"table_number?", "capacity?", "status?"}
* Zwraca: {"table_id", "restaurant_id", "table_number", "capacity", "qr_code_token", "status"}
