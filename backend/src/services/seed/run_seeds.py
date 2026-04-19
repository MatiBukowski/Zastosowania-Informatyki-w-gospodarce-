from sqlalchemy.orm import Session
from ...db import engine
from .seed_restaurants import seed_restaurants
from .seed_menu_items import seed_menu_items
from .seed_users import seed_users
from .seed_tables import seed_tables
from .seed_reservations import seed_reservations


def run_seed():
    with Session(engine) as session:
        seed_restaurants(session)
        seed_menu_items(session)
        seed_users(session)
        seed_tables(session)
        seed_reservations(session)
