import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.models import Restaurant, MenuItem, AppUser, RestaurantTable, Reservation
from src.services import (
    seed_restaurants,
    seed_menu_items,
    seed_users,
    seed_tables,
    seed_reservations
)
from src.db import Base
from tests.utils import create_restaurants

engine = create_engine("sqlite:///:memory:")
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class TestSeedService:

    def test_seed_restaurants(self):
        Base.metadata.create_all(bind=engine)
        session = TestingSessionLocal()

        assert session.query(Restaurant).count() == 0

        seed_restaurants(session, count=25)
        assert session.query(Restaurant).count() == 25

        seed_restaurants(session, count=30)
        assert session.query(Restaurant).count() == 30

        session.close()
        Base.metadata.drop_all(bind=engine)

    def test_seed_menu_items(self):
        Base.metadata.create_all(bind=engine)
        session = TestingSessionLocal()
        create_restaurants(session)

        assert session.query(MenuItem).count() == 0

        seed_menu_items(session, count=10, number_of_restaurants=5)
        assert session.query(MenuItem).count() == 50

        seed_menu_items(session, count=20, number_of_restaurants=5)
        assert session.query(MenuItem).count() == 100

        session.close()
        Base.metadata.drop_all(bind=engine)

    def test_seed_users(self):
        Base.metadata.create_all(bind=engine)
        session = TestingSessionLocal()

        assert session.query(AppUser).count() == 0

        seed_users(session, count=5)
        assert session.query(AppUser).count() == 5

        seed_users(session, count=20)
        assert session.query(AppUser).count() == 20

        session.close()
        Base.metadata.drop_all(bind=engine)

    def test_seed_tables(self):
        Base.metadata.create_all(bind=engine)
        session = TestingSessionLocal()
        seed_restaurants(session, count=5)

        assert session.query(RestaurantTable).count() == 0

        seed_tables(session, tables_per_restaurant=5, number_of_restaurants=5)
        assert session.query(RestaurantTable).count() == 25

        session.close()
        Base.metadata.drop_all(bind=engine)

    def test_seed_reservations(self):
        Base.metadata.create_all(bind=engine)
        session = TestingSessionLocal()
        
        seed_restaurants(session, count=5)
        seed_tables(session, tables_per_restaurant=5, number_of_restaurants=5)
        seed_users(session, count=5)

        assert session.query(Reservation).count() == 0

        seed_reservations(session, max_sample_tables=5)
        assert session.query(Reservation).count() == 5

        seed_reservations(session, max_sample_tables=20)
        assert session.query(Reservation).count() == 20

        session.close()
        Base.metadata.drop_all(bind=engine)
