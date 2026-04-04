from sqlalchemy.orm import Session
from ..models import Restaurant, CuisineTypeEnum
from ..db import engine
from faker import Faker
import random

fake = Faker('pl_PL')

RESTAURANTS_DATA = [
    {"name": "Abecadło z pieca spadło,O ziemię się hukło,Rozsypało się po kątach,Strasznie się potłukło:", "address": "ul. Włoska 1, Kraków", "cuisine": CuisineTypeEnum.ITALIAN, "has_kiosk": True, "description": "Authentic Italian cuisine with fresh ingredients.", "photo": "https://minio.xederro.tech/prod/restaurant/0.jpg"},
]

def generate_fake_restaurant() -> dict:
    cuisine = random.choice(list(CuisineTypeEnum))
    photo_id = random.randint(0, 64)

    prefixes = {
        CuisineTypeEnum.ITALIAN: ["Trattoria", "Osteria", "Ristorante", "Pizzeria"],
        CuisineTypeEnum.AMERICAN: ["Burger", "Steakhouse", "Diner", "Grill"],
        CuisineTypeEnum.POLISH: ["Gospoda", "Karczma", "Pierogarnia", "Kuchnia"],
        CuisineTypeEnum.ASIAN: ["Wok", "Dragon", "Lotus", "Bambu"],
        CuisineTypeEnum.JAPANESE: ["Sushi", "Ramen", "Sakura", "Tokyo"],
        CuisineTypeEnum.MEXICAN: ["Cantina", "Taco", "Sombrero", "Amigo"],
        CuisineTypeEnum.INDIAN: ["Taj Mahal", "Curry", "Namaste", "Bollywood"],
        CuisineTypeEnum.VEGAN: ["Green", "Leafy", "Bio", "Eco"],
        CuisineTypeEnum.FRENCH: ["Bistro", "Cafe", "Petit", "Gourmet"],
        CuisineTypeEnum.GREEK: ["Zorba", "Olympus", "Athena", "Aegean"],
    }
    
    prefix = random.choice(prefixes.get(cuisine, ["Restauracja"]))
    name = f"{prefix} {fake.company()}"
    
    return {
        "name": name,
        "address": f"{fake.street_name()} {fake.building_number()}, {fake.city()}",
        "cuisine": cuisine,
        "has_kiosk": random.choice([True, False]),
        "description": fake.sentence(nb_words=10),
        "photo": f"https://minio.xederro.tech/prod/restaurant/{photo_id}.jpg",
        "is_active": True
    }

def seed_restaurants(session: Session, count: int = 30):
    existing_count = session.query(Restaurant).count()
    count = count - existing_count

    if count <= 0:
        print(f"Database already contains {existing_count} restaurants. Skipping seeding.")
        return

    restaurants_to_add = []

    for data in RESTAURANTS_DATA[:count]:
        restaurants_to_add.append(Restaurant(**data))

    remaining = count - len(restaurants_to_add)
    for _ in range(remaining):
        data = generate_fake_restaurant()
        restaurants_to_add.append(Restaurant(**data))
    
    session.add_all(restaurants_to_add)
    session.commit()
    print(f"Successfully seeded {len(restaurants_to_add)} restaurants!")

def run_seed():
    with Session(engine) as session:
        seed_restaurants(session)
