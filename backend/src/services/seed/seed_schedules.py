from datetime import time
from sqlalchemy.orm import Session
from ...models import RestaurantSchedule, Restaurant
from ...models.enums import DayOfWeekEnum
from faker import Faker
import random

fake = Faker('pl_PL')

realistic_minutes = [0, 15, 30, 45]

def generate_schedule(restaurant_id: int = 1, day_of_week: DayOfWeekEnum = None) -> dict:
    return {
        "restaurant_id": restaurant_id,
        "day_of_week": day_of_week,
        "open_time": time(hour=random.randint(8, 11), minute=random.choice(realistic_minutes)),
        "close_time": time(hour=random.randint(15, 23), minute=random.choice(realistic_minutes))
    }

def seed_schedules(session: Session, number_of_restaurants: int = 5):
    restaurant_ids = [res_id[0] for res_id in session.query(Restaurant.restaurant_id).all()]
    if not restaurant_ids:
        raise ValueError("No restaurants in database. Seed restaurants first.")
    
    seeded_restaurant_ids = [
        res_id[0] for res_id in session.query(RestaurantSchedule.restaurant_id).distinct().all()
    ]

    unseeded_restaurant_ids = list(set(restaurant_ids) - set(seeded_restaurant_ids))

    existing_count = session.query(RestaurantSchedule).count()
    count = number_of_restaurants * 7 - existing_count

    if count <= 0:
        print(f"Database already contains {existing_count} schedules. Skipping seeding.")
        return

    schedules_to_add = []
    restaurants_to_seed = random.sample(unseeded_restaurant_ids, min(number_of_restaurants, len(unseeded_restaurant_ids)))

    for restaurant_id in restaurants_to_seed:
        for day in DayOfWeekEnum: 
            data = generate_schedule(restaurant_id, day)
            schedules_to_add.append(RestaurantSchedule(**data))

    session.add_all(schedules_to_add)
    session.commit()
    print(f"Successfully seeded {len(schedules_to_add)} schedules for {min(number_of_restaurants, len(unseeded_restaurant_ids))} restaurants!")
