from sqlalchemy.orm import Session
from ...models import MenuItem, Restaurant
from faker import Faker
from faker_food import FoodProvider
import random

fake = Faker('pl_PL')
fake.add_provider(FoodProvider)

MENU_ITEMS_DATA = [
    {"restaurant_id": 1, "name": "Pizza Margherita", "description": "Klasyczna pizza z sosem pomidorowym, mozzarellą i świeżą bazylią", "price": 29.99, "is_available": True}
]

def generate_fake_menu_item(restaurant_id: int = 1) -> dict:
    return {
        "restaurant_id": restaurant_id,
        "name": fake.dish(),
        "description": fake.dish_description(),
        "price": round(random.uniform(5, 200), 2),
        "is_available": random.choices([True, False], weights=[0.8, 0.2])[0]
    }

def seed_menu_items(session: Session, count: int = 10, number_of_restaurants: int = 5):
    restaurant_ids = [res_id[0] for res_id in session.query(Restaurant.restaurant_id).all()]
    if not restaurant_ids:
        raise ValueError("No restaurants in database. Seed restaurants first.")

    existing_count = session.query(MenuItem).count()
    count = number_of_restaurants * count - existing_count

    if count <= 0:
        print(f"Database already contains {existing_count} menu items. Skipping seeding.")
        return

    menu_items_to_add = []

    for data in MENU_ITEMS_DATA[:count]:
        menu_items_to_add.append(MenuItem(**data))

    remaining = count - len(menu_items_to_add)
    for _ in range(remaining):
        restaurant_id = random.choice(restaurant_ids[:number_of_restaurants])
        data = generate_fake_menu_item(restaurant_id)
        menu_items_to_add.append(MenuItem(**data))
    
    session.add_all(menu_items_to_add)
    session.commit()
    print(f"Successfully seeded {len(menu_items_to_add)} menu items for {number_of_restaurants} restaurants!")
