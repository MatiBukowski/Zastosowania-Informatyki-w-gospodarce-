from sqlalchemy.orm import Session
from ...models import Restaurant, RestaurantTable
from ...models.enums import TableStatusEnum
import random
import uuid

def generate_fake_table(restaurant_id: int, table_number: int) -> dict:
    return {
        "restaurant_id": restaurant_id,
        "table_number": table_number,
        "qr_code_token": str(uuid.uuid4())[:16],
        "capacity": random.choice([2, 4, 6, 8]),
        "status": random.choice(list(TableStatusEnum)),
    }

def seed_tables(session: Session, tables_per_restaurant: int = 5, number_of_restaurants: int = 5):
    restaurant_ids = [res_id[0] for res_id in session.query(Restaurant.restaurant_id).all()]
    if not restaurant_ids:
        raise ValueError("No restaurants in database. Seed restaurants first.")

    existing_count = session.query(RestaurantTable).count()
    if existing_count > 0:
        print(f"Database already contains {existing_count} tables. Skipping seeding.")
        return

    tables_to_add = []

    for restaurant_id in restaurant_ids[:number_of_restaurants]:
        for table_number in range(1, tables_per_restaurant + 1):
            data = generate_fake_table(restaurant_id, table_number)
            tables_to_add.append(RestaurantTable(**data))

    session.add_all(tables_to_add)
    session.commit()
    print(f"Successfully seeded {len(tables_to_add)} tables for {number_of_restaurants} restaurants!")
