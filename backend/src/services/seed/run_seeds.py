from sqlalchemy.orm import Session
from ...db import engine
from .seed_restaurants import seed_restaurants
from .seed_menu_items import seed_menu_items


def run_seed():
    with Session(engine) as session:
        seed_restaurants(session)
        seed_menu_items(session)
